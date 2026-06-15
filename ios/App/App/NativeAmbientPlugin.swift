import AVFAudio
import Capacitor
import UIKit

@objc(NativeAmbientPlugin)
public class NativeAmbientPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeAmbientPlugin"
    public let jsName = "NativeBinaural"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setMasterVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startBinaural", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startJourney", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateBinaural", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopBinaural", returnType: CAPPluginReturnPromise)
    ]

    private let renderer = NativeAmbientRenderer()

    @objc public func setVolume(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("Missing ambient layer id")
            return
        }
        renderer.setVolume(id: id, volume: Float(call.getDouble("volume", 0)))
        call.resolve()
    }

    @objc public func setMasterVolume(_ call: CAPPluginCall) {
        renderer.setMasterVolume(Float(call.getDouble("volume", 1)))
        call.resolve()
    }

    @objc public func stop(_ call: CAPPluginCall) {
        renderer.stop()
        call.resolve()
    }

    @objc public func startBinaural(_ call: CAPPluginCall) {
        renderer.startBinaural(
            carrier: Float(call.getDouble("carrier", 200)),
            beat: Float(call.getDouble("beat", 10)),
            volume: Float(call.getDouble("volume", 1))
        )
        call.resolve()
    }

    @objc public func startJourney(_ call: CAPPluginCall) {
        guard let json = call.getString("waypoints"),
              let data = json.data(using: .utf8),
              let waypoints = try? JSONDecoder().decode([NativeJourneyWaypoint].self, from: data) else {
            call.reject("Invalid journey waypoints")
            return
        }
        renderer.startJourney(
            waypoints: waypoints,
            duration: call.getDouble("duration", 0),
            offset: call.getDouble("offset", 0),
            volume: Float(call.getDouble("volume", 1))
        )
        call.resolve()
    }

    @objc public func updateBinaural(_ call: CAPPluginCall) {
        renderer.updateBinaural(
            carrier: Float(call.getDouble("carrier", 200)),
            beat: Float(call.getDouble("beat", 10)),
            volume: Float(call.getDouble("volume", 1))
        )
        call.resolve()
    }

    @objc public func stopBinaural(_ call: CAPPluginCall) {
        renderer.stopBinaural()
        call.resolve()
    }

}

private struct NativeJourneyWaypoint: Decodable {
    let t: Double
    let carrier: Float
    let beat: Float
}

private final class NativeAmbientRenderer {
    private let fadeSeconds: Float = 0.06
    private let engine = AVAudioEngine()
    private let lock = NSLock()
    private var source: AVAudioSourceNode?
    private var levels: [String: Float] = [:]
    private var master: Float = 1
    private var binauralVolume: Float = 0
    private var renderedBinauralVolume: Float = 0
    private var renderedLevels: [String: Float] = [:]
    private var carrier: Float = 200
    private var beat: Float = 10
    private var leftPhase: Float = 0
    private var rightPhase: Float = 0
    private var journeyWaypoints: [NativeJourneyWaypoint] = []
    private var journeyDuration: Double = 0
    private var journeyStartedAt: TimeInterval = 0
    private var journeyOffset: Double = 0

    private var randomState: UInt32 = 0xA57A1C3D
    private var pink: Float = 0
    private var brown: Float = 0
    private var windPhase: Float = 0
    private var wavePhase: Float = 0
    private var stopGeneration = 0

    func setVolume(id: String, volume: Float) {
        lock.lock()
        levels[id] = max(0, min(1, volume))
        let shouldRun = levels.values.contains { $0 > 0.0001 }
        lock.unlock()
        if shouldRun {
            startIfNeeded()
        } else {
            stop()
        }
    }

    func setMasterVolume(_ volume: Float) {
        lock.lock()
        master = max(0, min(1, volume))
        lock.unlock()
    }

    func stop() {
        lock.lock()
        levels.removeAll()
        lock.unlock()
        stopIfSilent()
    }

    func startBinaural(carrier: Float, beat: Float, volume: Float) {
        lock.lock()
        self.carrier = carrier
        self.beat = beat
        binauralVolume = max(0, min(1, volume))
        journeyWaypoints = []
        lock.unlock()
        startIfNeeded()
    }

    func startJourney(waypoints: [NativeJourneyWaypoint], duration: Double, offset: Double, volume: Float) {
        lock.lock()
        journeyWaypoints = waypoints
        journeyDuration = duration
        journeyOffset = offset
        journeyStartedAt = ProcessInfo.processInfo.systemUptime
        binauralVolume = max(0, min(1, volume))
        lock.unlock()
        startIfNeeded()
    }

    func updateBinaural(carrier: Float, beat: Float, volume: Float) {
        lock.lock()
        self.carrier = carrier
        self.beat = beat
        binauralVolume = max(0, min(1, volume))
        lock.unlock()
    }

    func stopBinaural() {
        lock.lock()
        binauralVolume = 0
        journeyWaypoints = []
        lock.unlock()
        stopIfSilent()
    }

    private func stopIfSilent() {
        lock.lock()
        let shouldStop = binauralVolume <= 0.0001 && !levels.values.contains { $0 > 0.0001 }
        stopGeneration += 1
        let generation = stopGeneration
        lock.unlock()
        guard shouldStop else { return }

        DispatchQueue.main.asyncAfter(deadline: .now() + Double(fadeSeconds) + 0.04) { [weak self] in
            guard let self else { return }
            self.lock.lock()
            let stillSilent = self.binauralVolume <= 0.0001 &&
                !(self.levels.values.contains { $0 > 0.0001 }) &&
                self.stopGeneration == generation
            self.lock.unlock()
            guard stillSilent else { return }

            self.engine.stop()
            if let source = self.source {
                self.engine.detach(source)
            }
            self.source = nil
            self.renderedBinauralVolume = 0
            self.renderedLevels.removeAll()
        }
    }

    private func startIfNeeded() {
        lock.lock()
        stopGeneration += 1
        lock.unlock()
        guard !engine.isRunning else { return }
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default)
            try session.setActive(true)

            if source == nil {
                let sampleRate = session.sampleRate > 0 ? session.sampleRate : 48_000
                guard let format = AVAudioFormat(
                    standardFormatWithSampleRate: sampleRate,
                    channels: 2
                ) else {
                    return
                }
                let node = AVAudioSourceNode(format: format) { [weak self] _, _, frameCount, bufferList in
                    guard let self else { return noErr }
                    return self.render(
                        frameCount: frameCount,
                        bufferList: bufferList,
                        sampleRate: Float(sampleRate)
                    )
                }
                source = node
                engine.attach(node)
                engine.connect(node, to: engine.mainMixerNode, format: format)
            }

            engine.prepare()
            renderedBinauralVolume = 0
            try engine.start()
        } catch {
            print("Unable to start native ambient audio: \(error)")
        }
    }

    private func render(
        frameCount: AVAudioFrameCount,
        bufferList: UnsafeMutablePointer<AudioBufferList>,
        sampleRate: Float
    ) -> OSStatus {
        lock.lock()
        let currentLevels = levels
        let currentMaster = master
        let currentBinauralVolume = binauralVolume
        let currentJourney = journeyWaypoints
        let currentJourneyDuration = journeyDuration
        let currentJourneyStartedAt = journeyStartedAt
        let currentJourneyOffset = journeyOffset
        var currentCarrier = carrier
        var currentBeat = beat
        lock.unlock()

        if !currentJourney.isEmpty && currentJourneyDuration > 0 {
            let elapsed = currentJourneyOffset + ProcessInfo.processInfo.systemUptime - currentJourneyStartedAt
            (currentCarrier, currentBeat) = interpolate(
                currentJourney,
                progress: min(1, elapsed / currentJourneyDuration)
            )
            if elapsed >= currentJourneyDuration {
                lock.lock()
                binauralVolume = 0
                journeyWaypoints = []
                lock.unlock()
            }
        }

        let buffers = UnsafeMutableAudioBufferListPointer(bufferList)
        let smoothing = min(1, 1 / max(1, sampleRate * fadeSeconds))

        for frame in 0..<Int(frameCount) {
            let whiteLevel = smoothedLevel(id: "white", target: curve(currentLevels["white"] ?? 0), smoothing: smoothing)
            let pinkLevel = smoothedLevel(id: "pink", target: curve(currentLevels["pink"] ?? 0), smoothing: smoothing)
            let brownLevel = smoothedLevel(id: "brown", target: curve(currentLevels["brown"] ?? 0), smoothing: smoothing)
            let windLevel = smoothedLevel(id: "wind", target: curve(currentLevels["wind"] ?? 0), smoothing: smoothing)
            let wavesLevel = smoothedLevel(id: "waves", target: curve(currentLevels["waves"] ?? 0), smoothing: smoothing)
            let white = nextNoise()
            pink = pink * 0.94 + white * 0.06
            brown = max(-1, min(1, brown * 0.995 + white * 0.015))
            windPhase = wrap(windPhase + 0.05 / sampleRate)
            wavePhase = wrap(wavePhase + 0.11 / sampleRate)
            let windEnvelope = 0.72 + sin(windPhase * 2 * .pi) * 0.18
            let waveEnvelope = 0.72 + sin(wavePhase * 2 * .pi) * 0.2

            let ambientSample = (
                white * whiteLevel * 0.18 +
                pink * pinkLevel * 0.8 +
                brown * brownLevel * 0.7 +
                pink * windLevel * windEnvelope * 0.65 +
                brown * wavesLevel * waveEnvelope * 0.75
            ) * currentMaster

            leftPhase = wrap(leftPhase + currentCarrier / sampleRate)
            rightPhase = wrap(rightPhase + (currentCarrier + currentBeat) / sampleRate)
            renderedBinauralVolume += (currentBinauralVolume - renderedBinauralVolume) * smoothing
            let toneLevel = renderedBinauralVolume * 0.3
            let leftSample = ambientSample + sin(leftPhase * 2 * .pi) * toneLevel
            let rightSample = ambientSample + sin(rightPhase * 2 * .pi) * toneLevel

            for (channel, buffer) in buffers.enumerated() {
                guard let data = buffer.mData?.assumingMemoryBound(to: Float.self) else { continue }
                data[frame] = channel == 0 ? leftSample : rightSample
            }
        }
        return noErr
    }

    private func smoothedLevel(id: String, target: Float, smoothing: Float) -> Float {
        let current = renderedLevels[id] ?? 0
        let next = current + (target - current) * smoothing
        renderedLevels[id] = next
        return next
    }

    private func nextNoise() -> Float {
        randomState ^= randomState << 13
        randomState ^= randomState >> 17
        randomState ^= randomState << 5
        return Float(randomState) / Float(UInt32.max) * 2 - 1
    }

    private func curve(_ volume: Float) -> Float {
        return pow(volume, 3) * 0.55
    }

    private func wrap(_ phase: Float) -> Float {
        return phase >= 1 ? phase - 1 : phase
    }

    private func interpolate(_ waypoints: [NativeJourneyWaypoint], progress: Double) -> (Float, Float) {
        for index in 0..<(waypoints.count - 1) {
            let start = waypoints[index]
            let end = waypoints[index + 1]
            if progress >= start.t && progress <= end.t {
                let fraction = Float((progress - start.t) / max(end.t - start.t, 0.0001))
                let smooth = fraction * fraction * (3 - 2 * fraction)
                return (
                    start.carrier + (end.carrier - start.carrier) * smooth,
                    start.beat + (end.beat - start.beat) * smooth
                )
            }
        }
        let last = waypoints.last!
        return (last.carrier, last.beat)
    }
}
