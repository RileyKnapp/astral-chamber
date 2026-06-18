import AVFAudio
import Capacitor
import MediaPlayer
import UIKit

@objc(NativeAmbientPlugin)
public class NativeAmbientPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeAmbientPlugin"
    public let jsName = "NativeBinaural"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "warmUp", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setMasterVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startBinaural", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startJourney", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateBinaural", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopBinaural", returnType: CAPPluginReturnPromise)
    ]

    private let renderer = NativeAmbientRenderer()

    public override func load() {
        renderer.configureRemoteCommands()
    }

    @objc public func warmUp(_ call: CAPPluginCall) {
        renderer.warmUp()
        call.resolve()
    }

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
            volume: Float(call.getDouble("volume", 1)),
            title: call.getString("title") ?? "Astral Chamber",
            subtitle: call.getString("subtitle") ?? "Live Frequency Chamber"
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
            volume: Float(call.getDouble("volume", 1)),
            title: call.getString("title") ?? "Astral Chamber",
            subtitle: call.getString("subtitle") ?? "Guided Binaural Journey"
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
    private var isPaused = false
    private var pausedAt: TimeInterval = 0
    private var nowPlayingTitle = "Astral Chamber"
    private var nowPlayingSubtitle = "Binaural Journey"
    private var remoteTargets: [Any] = []

    private var randomState: UInt32 = 0xA57A1C3D
    private var pink: Float = 0
    private var pinkB0: Float = 0
    private var pinkB1: Float = 0
    private var pinkB2: Float = 0
    private var pinkB3: Float = 0
    private var pinkB4: Float = 0
    private var pinkB5: Float = 0
    private var pinkB6: Float = 0
    private var brown: Float = 0
    private var brownState: Float = 0
    private var windPhase: Float = 0
    private var windAmpPhase: Float = 0
    private var windLow: Float = 0
    private var windBand: Float = 0
    private var wavePhase: Float = 0
    private var waveFilterPhase: Float = 0
    private var waveHighpass: Float = 0
    private var waveHighpassLastInput: Float = 0
    private var waveLowpass: Float = 0
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

    func warmUp() {
        startIfNeeded(activateNowPlaying: false)
    }

    func stop() {
        lock.lock()
        levels.removeAll()
        lock.unlock()
        stopIfSilent()
    }

    func configureRemoteCommands() {
        guard remoteTargets.isEmpty else { return }
        let center = MPRemoteCommandCenter.shared()
        center.playCommand.isEnabled = true
        center.pauseCommand.isEnabled = true
        center.togglePlayPauseCommand.isEnabled = true
        center.stopCommand.isEnabled = true
        center.nextTrackCommand.isEnabled = false
        center.previousTrackCommand.isEnabled = false
        center.changePlaybackPositionCommand.isEnabled = false

        remoteTargets.append(center.playCommand.addTarget { [weak self] _ in
            self?.resumeFromRemote()
            return .success
        })
        remoteTargets.append(center.pauseCommand.addTarget { [weak self] _ in
            self?.pauseFromRemote()
            return .success
        })
        remoteTargets.append(center.togglePlayPauseCommand.addTarget { [weak self] _ in
            guard let self else { return .commandFailed }
            self.isPaused ? self.resumeFromRemote() : self.pauseFromRemote()
            return .success
        })
        remoteTargets.append(center.stopCommand.addTarget { [weak self] _ in
            self?.stopAllFromRemote()
            return .success
        })
    }

    func startBinaural(carrier: Float, beat: Float, volume: Float, title: String, subtitle: String) {
        lock.lock()
        self.carrier = carrier
        self.beat = beat
        binauralVolume = max(0, min(1, volume))
        journeyWaypoints = []
        journeyDuration = 0
        journeyOffset = 0
        nowPlayingTitle = title
        nowPlayingSubtitle = subtitle
        isPaused = false
        lock.unlock()
        startIfNeeded()
        updateNowPlaying(isPlaying: true)
    }

    func startJourney(
        waypoints: [NativeJourneyWaypoint],
        duration: Double,
        offset: Double,
        volume: Float,
        title: String,
        subtitle: String
    ) {
        lock.lock()
        journeyWaypoints = waypoints
        journeyDuration = duration
        journeyOffset = offset
        journeyStartedAt = ProcessInfo.processInfo.systemUptime
        binauralVolume = max(0, min(1, volume))
        nowPlayingTitle = title
        nowPlayingSubtitle = subtitle
        isPaused = false
        lock.unlock()
        startIfNeeded()
        updateNowPlaying(isPlaying: true)
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
        journeyDuration = 0
        journeyOffset = 0
        isPaused = false
        lock.unlock()
        clearNowPlaying()
        stopIfSilent()
    }

    private func pauseFromRemote() {
        lock.lock()
        guard !isPaused else {
            lock.unlock()
            return
        }
        isPaused = true
        pausedAt = ProcessInfo.processInfo.systemUptime
        lock.unlock()
        engine.pause()
        updateNowPlaying(isPlaying: false)
    }

    private func resumeFromRemote() {
        lock.lock()
        let wasPaused = isPaused
        let pauseDuration = ProcessInfo.processInfo.systemUptime - pausedAt
        if wasPaused && !journeyWaypoints.isEmpty {
            journeyStartedAt += pauseDuration
        }
        isPaused = false
        lock.unlock()
        startIfNeeded()
        updateNowPlaying(isPlaying: true)
    }

    private func stopAllFromRemote() {
        lock.lock()
        levels.removeAll()
        binauralVolume = 0
        journeyWaypoints = []
        journeyDuration = 0
        journeyOffset = 0
        isPaused = false
        lock.unlock()
        clearNowPlaying()
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

    private func startIfNeeded(activateNowPlaying: Bool = true) {
        lock.lock()
        stopGeneration += 1
        let paused = isPaused
        lock.unlock()
        guard !paused else { return }
        guard !engine.isRunning else { return }
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [])
            try session.setActive(true)
            UIApplication.shared.beginReceivingRemoteControlEvents()

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
            if activateNowPlaying {
                updateNowPlaying(isPlaying: true)
            }
        } catch {
            print("Unable to start native ambient audio: \(error)")
        }
    }

    private func updateNowPlaying(isPlaying: Bool) {
        lock.lock()
        let title = nowPlayingTitle
        let subtitle = nowPlayingSubtitle
        let duration = journeyDuration
        let elapsed = currentJourneyElapsedLocked()
        lock.unlock()

        var info: [String: Any] = [
            MPMediaItemPropertyTitle: title,
            MPMediaItemPropertyArtist: subtitle,
            MPNowPlayingInfoPropertyPlaybackRate: isPlaying ? 1.0 : 0.0,
            MPNowPlayingInfoPropertyElapsedPlaybackTime: max(0, elapsed)
        ]
        if duration > 0 {
            info[MPMediaItemPropertyPlaybackDuration] = duration
        }
        let artwork = Self.makeArtwork()
        info[MPMediaItemPropertyArtwork] = MPMediaItemArtwork(boundsSize: artwork.size) { _ in
            artwork
        }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }

    private func clearNowPlaying() {
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }

    private func currentJourneyElapsedLocked() -> Double {
        guard journeyDuration > 0 else { return 0 }
        let now = isPaused ? pausedAt : ProcessInfo.processInfo.systemUptime
        return min(journeyDuration, max(0, journeyOffset + now - journeyStartedAt))
    }

    private static func makeArtwork() -> UIImage {
        if let icon = loadAppIcon() {
            return icon
        }

        let size = CGSize(width: 512, height: 512)
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            let rect = CGRect(origin: .zero, size: size)
            UIColor(red: 5 / 255, green: 3 / 255, blue: 12 / 255, alpha: 1).setFill()
            context.fill(rect)

            let glow = UIColor(red: 192 / 255, green: 176 / 255, blue: 240 / 255, alpha: 0.35)
            glow.setFill()
            context.cgContext.fillEllipse(in: CGRect(x: 92, y: 92, width: 328, height: 328))

            let attrs: [NSAttributedString.Key: Any] = [
                .font: UIFont(name: "Georgia", size: 118) ?? UIFont.systemFont(ofSize: 118, weight: .light),
                .foregroundColor: UIColor.white
            ]
            let text = "AC" as NSString
            let textSize = text.size(withAttributes: attrs)
            text.draw(
                at: CGPoint(x: (size.width - textSize.width) / 2, y: (size.height - textSize.height) / 2),
                withAttributes: attrs
            )
        }
    }

    private static func loadAppIcon() -> UIImage? {
        let bundle = Bundle.main
        if let icon = UIImage(named: "AppIcon", in: bundle, compatibleWith: nil) {
            return icon
        }

        guard
            let icons = bundle.infoDictionary?["CFBundleIcons"] as? [String: Any],
            let primaryIcon = icons["CFBundlePrimaryIcon"] as? [String: Any],
            let iconFiles = primaryIcon["CFBundleIconFiles"] as? [String],
            let iconName = iconFiles.last
        else {
            return nil
        }

        return UIImage(named: iconName, in: bundle, compatibleWith: nil)
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
                journeyDuration = 0
                journeyOffset = 0
                lock.unlock()
                DispatchQueue.main.async { [weak self] in
                    self?.clearNowPlaying()
                }
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
            pink = nextPinkNoise(white)
            let brownSample = nextBrownNoise(white)
            brown = brownSample
            windPhase = wrap(windPhase + 0.05 / sampleRate)
            windAmpPhase = wrap(windAmpPhase + 0.08 / sampleRate)
            wavePhase = wrap(wavePhase + 0.11 / sampleRate)
            waveFilterPhase = wrap(waveFilterPhase + 0.11 / sampleRate)
            let windEnvelope = max(0, 0.7 + sin(windAmpPhase * 2 * .pi) * 0.4)
            let windCenter = 600 + sin(windPhase * 2 * .pi) * 400
            let windSample = bandpass(input: pink, center: windCenter, resonance: 0.8, sampleRate: sampleRate)
            let waveEnvelope = max(0, 0.65 + sin(wavePhase * 2 * .pi) * 0.22)
            let waveCutoff = 900 + sin(waveFilterPhase * 2 * .pi) * 600
            let filteredWave = lowpass(
                input: highpass(input: brownSample, cutoff: 45, sampleRate: sampleRate),
                cutoff: waveCutoff,
                sampleRate: sampleRate
            )
            let waveSample = max(-1, min(1, filteredWave * 0.65 + brownSample * 0.55))

            let ambientSample = (
                white * whiteLevel * 0.18 +
                pink * pinkLevel * 0.8 +
                brownSample * brownLevel * 1.05 +
                windSample * windLevel * windEnvelope * 0.95 +
                waveSample * wavesLevel * waveEnvelope * 1.35
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

    private func nextPinkNoise(_ white: Float) -> Float {
        pinkB0 = 0.99886 * pinkB0 + white * 0.0555179
        pinkB1 = 0.99332 * pinkB1 + white * 0.0750759
        pinkB2 = 0.969 * pinkB2 + white * 0.153852
        pinkB3 = 0.8665 * pinkB3 + white * 0.3104856
        pinkB4 = 0.55 * pinkB4 + white * 0.5329522
        pinkB5 = -0.7616 * pinkB5 - white * 0.016898
        let output = (pinkB0 + pinkB1 + pinkB2 + pinkB3 + pinkB4 + pinkB5 + pinkB6 + white * 0.5362) * 0.11
        pinkB6 = white * 0.115926
        return max(-1, min(1, output))
    }

    private func nextBrownNoise(_ white: Float) -> Float {
        brownState = (brownState + 0.02 * white) / 1.02
        return max(-1, min(1, brownState * 3.5))
    }

    private func bandpass(input: Float, center: Float, resonance: Float, sampleRate: Float) -> Float {
        let frequency = max(40, min(sampleRate * 0.45, center))
        let f = 2 * sin(.pi * frequency / sampleRate)
        let q = max(0.05, min(1.8, resonance))
        windLow += f * windBand
        let high = input - windLow - q * windBand
        windBand += f * high
        return max(-1, min(1, windBand))
    }

    private func highpass(input: Float, cutoff: Float, sampleRate: Float) -> Float {
        let rc = 1 / (2 * .pi * max(1, cutoff))
        let dt = 1 / sampleRate
        let alpha = rc / (rc + dt)
        let output = alpha * (waveHighpass + input - waveHighpassLastInput)
        waveHighpass = output
        waveHighpassLastInput = input
        return output
    }

    private func lowpass(input: Float, cutoff: Float, sampleRate: Float) -> Float {
        let rc = 1 / (2 * .pi * max(1, cutoff))
        let dt = 1 / sampleRate
        let alpha = dt / (rc + dt)
        waveLowpass += alpha * (input - waveLowpass)
        return waveLowpass
    }

    private func curve(_ volume: Float) -> Float {
        return pow(volume, 1.55) * 0.72
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
