import { Capacitor, registerPlugin } from "@capacitor/core";
import type { Waypoint } from "@/lib/journeys";

type NativeAmbientPlugin = {
  startBinaural(options: { carrier: number; beat: number; volume: number }): Promise<void>;
  startJourney(options: {
    waypoints: string;
    duration: number;
    offset: number;
    volume: number;
  }): Promise<void>;
  updateBinaural(options: { carrier: number; beat: number; volume: number }): Promise<void>;
  stopBinaural(): Promise<void>;
};

const NativeBinaural = registerPlugin<NativeAmbientPlugin>("NativeBinaural");

export const usesNativeBinaural = () =>
  Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("NativeBinaural");

export const startNativeBinaural = (carrier: number, beat: number, volume: number) =>
  NativeBinaural.startBinaural({ carrier, beat, volume });

export const startNativeJourney = (
  waypoints: Waypoint[],
  duration: number,
  offset: number,
  volume: number,
) =>
  NativeBinaural.startJourney({ waypoints: JSON.stringify(waypoints), duration, offset, volume });

export const updateNativeBinaural = (carrier: number, beat: number, volume: number) =>
  NativeBinaural.updateBinaural({ carrier, beat, volume });

export const stopNativeBinaural = () => NativeBinaural.stopBinaural();
