import { create } from "zustand";
import { Bus, Route, Stop, OptimizedRoute } from "@/types";

interface AppState {
  // Map state
  mapCenter: [number, number];
  mapZoom: number;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;

  // Bus tracking
  buses: Bus[];
  selectedBus: Bus | null;
  setBuses: (buses: Bus[]) => void;
  setSelectedBus: (bus: Bus | null) => void;
  updateBusLocation: (busId: string, location: [number, number]) => void;

  // Route planning
  searchOrigin: string;
  searchDestination: string;
  setSearchOrigin: (origin: string) => void;
  setSearchDestination: (destination: string) => void;
  currentRoute: OptimizedRoute | null;
  setCurrentRoute: (route: OptimizedRoute | null) => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // SOS state
  sosActive: boolean;
  setSosActive: (active: boolean) => void;

  // Offline state
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Default to a global center (will be updated by user's location)
  mapCenter: [0, 20], // Center of world map
  mapZoom: 2, // Zoom out to show world
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  buses: [],
  selectedBus: null,
  setBuses: (buses) => set({ buses }),
  setSelectedBus: (bus) => set({ selectedBus: bus }),
  updateBusLocation: (busId, location) =>
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.id === busId
          ? { ...bus, location: { latitude: location[1], longitude: location[0] } }
          : bus
      ),
    })),

  searchOrigin: "",
  searchDestination: "",
  setSearchOrigin: (origin) => set({ searchOrigin: origin }),
  setSearchDestination: (destination) => set({ searchDestination: destination }),
  currentRoute: null,
  setCurrentRoute: (route) => set({ currentRoute: route }),

  theme: "system",
  setTheme: (theme) => set({ theme }),

  sosActive: false,
  setSosActive: (active) => set({ sosActive: active }),

  isOffline: false,
  setIsOffline: (offline) => set({ isOffline: offline }),
}));
