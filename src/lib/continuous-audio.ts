type MediaSessionNavigator = Navigator & {
  mediaSession?: MediaSession;
};

type CapacitorWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean };
};

export type ContinuousAudioOutput = {
  dispose: () => void;
  resume: () => Promise<void>;
};

export function connectContinuousAudio(
  ctx: AudioContext,
  source: AudioNode,
  title: string,
): ContinuousAudioOutput {
  const mediaSession = (navigator as MediaSessionNavigator).mediaSession;
  const isNative = Boolean((window as CapacitorWindow).Capacitor?.isNativePlatform?.());
  let audio: HTMLAudioElement | null = null;
  let streamDestination: MediaStreamAudioDestinationNode | null = null;
  let usingDirectOutput = isNative;

  const connectDirect = () => {
    if (usingDirectOutput) return;
    if (streamDestination) source.disconnect(streamDestination);
    source.connect(ctx.destination);
    usingDirectOutput = true;
  };

  if (isNative || typeof ctx.createMediaStreamDestination !== "function") {
    source.connect(ctx.destination);
  } else {
    streamDestination = ctx.createMediaStreamDestination();
    source.connect(streamDestination);
    audio = document.createElement("audio");
    audio.autoplay = true;
    audio.setAttribute("playsinline", "");
    audio.srcObject = streamDestination.stream;
    audio.style.display = "none";
    document.body.appendChild(audio);
    audio.play().catch(connectDirect);
  }

  if (mediaSession && typeof MediaMetadata !== "undefined") {
    mediaSession.metadata = new MediaMetadata({
      title,
      artist: "The Astral Chamber",
      album: "Journeys",
    });
  }
  if (mediaSession) {
    mediaSession.playbackState = "playing";
  }

  const resume = async () => {
    if (ctx.state === "suspended") await ctx.resume();
    if (audio?.paused) await audio.play();
    if (mediaSession) mediaSession.playbackState = "playing";
  };

  return {
    resume,
    dispose: () => {
      if (mediaSession) mediaSession.playbackState = "none";
      audio?.pause();
      if (audio) {
        audio.srcObject = null;
        audio.remove();
      }
      source.disconnect();
      streamDestination = null;
      audio = null;
    },
  };
}
