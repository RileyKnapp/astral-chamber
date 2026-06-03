import { useEffect, useState } from "react";
import { audioEngine, type EngineState } from "@/lib/audio/engine";

export function useAudioEngine() {
  const [state, setState] = useState<EngineState>(audioEngine.state);
  useEffect(() => audioEngine.subscribe(setState), []);
  return { state, engine: audioEngine };
}
