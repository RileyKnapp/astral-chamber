import AVFAudio
import Capacitor

@objc(NativeAmbientPlugin)
public class NativeAmbientPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeAmbientPlugin"
    public let jsName = "NativeAmbient"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setMasterVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
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
}

private final class NativeAmbientRenderer {
    private let engine = AVAudioEngine()
    private let lock = NSLock()
    private var source: AVAudioSourceNode?
    private var levels: [String: Float] = [:]
    private var master: Float = 1

    private var randomState: UInt32 = 0xA57A1C3D
    private var pink: Float = 0
    private var brown: Float = 0
    private var windPhase: Float = 0
    private var wavePhase: Float = 0

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
        engine.stop()
        if let source {
            engine.detach(source)
        }
        source = nil
    }

    private func startIfNeeded() {
        if source == nil {
            let sampleRate = AVAudioSession.sharedInstance().sampleRate
            let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 2)!
            let node = AVAudioSourceNode(format: format) { [weak self] _, _, frameCount, bufferList in
                guard let self else { return noErr }
                return self.render(frameCount: frameCount, bufferList: bufferList, sampleRate: Float(sampleRate))
            }
            source = node
            engine.attach(node)
            engine.connect(node, to: engine.mainMixerNode, format: format)
        }

        guard !engine.isRunning else { return }
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default)
            try session.setActive(true)
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
        lock.unlock()

        let whiteLevel = curve(currentLevels["white"] ?? 0)
        let pinkLevel = curve(currentLevels["pink"] ?? 0)
        let brownLevel = curve(currentLevels["brown"] ?? 0)
        let windLevel = curve(currentLevels["wind"] ?? 0)
        let wavesLevel = curve(currentLevels["waves"] ?? 0)
        let buffers = UnsafeMutableAudioBufferListPointer(bufferList)

        for frame in 0..<Int(frameCount) {
            let white = nextNoise()
            pink = pink * 0.94 + white * 0.06
            brown = max(-1, min(1, brown * 0.995 + white * 0.015))
            windPhase = wrap(windPhase + 0.05 / sampleRate)
            wavePhase = wrap(wavePhase + 0.11 / sampleRate)
            let windEnvelope = 0.72 + sin(windPhase * 2 * .pi) * 0.18
            let waveEnvelope = 0.72 + sin(wavePhase * 2 * .pi) * 0.2

            let sample = (
                white * whiteLevel * 0.18 +
                pink * pinkLevel * 0.8 +
                brown * brownLevel * 0.7 +
                pink * windLevel * windEnvelope * 0.65 +
                brown * wavesLevel * waveEnvelope * 0.75
            ) * currentMaster

            for buffer in buffers {
                guard let data = buffer.mData?.assumingMemoryBound(to: Float.self) else { continue }
                data[frame] = sample
            }
        }
        return noErr
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
}
