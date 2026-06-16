import { Capacitor, registerPlugin } from "@capacitor/core";
import type { Waypoint } from "@/lib/journeys";

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
