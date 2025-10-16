export interface Location {
  latitude: number;
  longitude: number;
}

export interface Bus {
  id: string;
  routeNumber: string;
  location: Location;
  heading: number;
  speed: number;
  crowdLevel: number;
  capacity: number;
  occupancy: number;
  nextStop: string;
  eta: number;
  lastUpdated: number;
}

export interface Route {
  id: string;
  routeNumber: string;
  origin: string;
  destination: string;
  stops: Stop[];
  distance: number;
  duration: number;
  crowdScore: number;
  color: string;
}

export interface Stop {
  id: string;
  name: string;
  location: Location;
  buses: string[];
  crowdLevel: number;
  facilities: string[];
}

export interface OptimizedRoute {
  route: Route;
  alternatives: Route[];
  totalDistance: number;
  totalDuration: number;
  crowdAvoidance: number;
  coordinates: [number, number][];
}

export interface CrowdReport {
  busId: string;
  userId: string;
  crowdLevel: number;
  timestamp: number;
  location: Location;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: "police" | "hospital" | "fire";
  location: Location;
  distance: number;
  phone?: string;
}
