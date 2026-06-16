import { Capacitor, registerPlugin } from "@capacitor/core";
import type { Waypoint } from "@/lib/journeys";
import type { NoiseLayerId } from "@/lib/noise-mixer";

type NativeAmbientPlugin = {
  startBinaural(options: {
    carrier: number;
    beat: number;
    volume: number;
    title?: string;
    subtitle?: string;
  }): Promise<void>;
  startJourney(options: {
    waypoints: string;
    duration: number;
    offset: number;
    volume: number;
    title?: string;
    subtitle?: string;
  }): Promise<void>;
  updateBinaural(options: { carrier: number; beat: number; volume: number }): Promise<void>;
  stopBinaural(): Promise<void>;
  setVolume(options: { id: string; volume: number }): Promise<void>;
  setMasterVolume(options: { volume: number }): Promise<void>;
  stop(): Promise<void>;
};

const NativeBinaural = registerPlugin<NativeAmbientPlugin>("NativeBinaural");

export const usesNativeBinaural = () =>
  Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("NativeBinaural");

export const startNativeBinaural = (carrier: number, beat: number, volume: number) =>
  NativeBinaural.startBinaural({
    carrier,
    beat,
    volume,
    title: "Astral Chamber",
    subtitle: "Live Frequency Chamber",
  });

export const startNativeJourney = (
  waypoints: Waypoint[],
  duration: number,
  offset: number,
  volume: number,
  title = "Astral Chamber",
) =>
  NativeBinaural.startJourney({
    waypoints: JSON.stringify(waypoints),
    duration,
    offset,
    volume,
    title,
    subtitle: "Guided Binaural Journey",
  });

export const updateNativeBinaural = (carrier: number, beat: number, volume: number) =>
  NativeBinaural.updateBinaural({ carrier, beat, volume });

export const stopNativeBinaural = () => NativeBinaural.stopBinaural();

export const setNativeAmbientVolume = (id: NoiseLayerId, volume: number) =>
  NativeBinaural.setVolume({ id, volume });

export const setNativeAmbientMasterVolume = (volume: number) =>
  NativeBinaural.setMasterVolume({ volume });

export const stopNativeAmbient = () => NativeBinaural.stop();
