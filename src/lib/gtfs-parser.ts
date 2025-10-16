/**
 * GTFS Data Parser for Delhi Transport Corporation
 * Parses static GTFS feeds and provides real stop locations, route data
 */

import * as fs from 'fs';
import * as path from 'path';

export interface GTFSStop {
  stop_id: string;
  stop_code: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  zone_id?: string;
}

export interface GTFSRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
  agency_id: string;
}

export interface GTFSTrip {
  route_id: string;
  trip_id: string;
  service_id: string;
  direction_id?: string;
}

let cachedStops: GTFSStop[] | null = null;
let cachedRoutes: GTFSRoute[] | null = null;

/**
 * Parse CSV file to JSON
 */
function parseCSV(content: string): any[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    
    return obj;
  });
}

/**
 * Load and parse stops.txt
 */
export function loadGTFSStops(): GTFSStop[] {
  if (cachedStops) return cachedStops;
  
  try {
    const gtfsPath = path.join(process.cwd(), 'gtfs', 'stops.txt');
    const content = fs.readFileSync(gtfsPath, 'utf-8');
    
    const parsed = parseCSV(content);
    cachedStops = parsed.map(row => ({
      stop_id: row.stop_id,
      stop_code: row.stop_code,
      stop_name: row.stop_name,
      stop_lat: parseFloat(row.stop_lat),
      stop_lon: parseFloat(row.stop_lon),
      zone_id: row.zone_id,
    }));
    
    console.log(`✅ Loaded ${cachedStops.length} real Delhi bus stops from GTFS`);
    return cachedStops;
  } catch (error) {
    console.error('Error loading GTFS stops:', error);
    return [];
  }
}

/**
 * Load and parse routes.txt
 */
export function loadGTFSRoutes(): GTFSRoute[] {
  if (cachedRoutes) return cachedRoutes;
  
  try {
    const gtfsPath = path.join(process.cwd(), 'gtfs', 'routes.txt');
    const content = fs.readFileSync(gtfsPath, 'utf-8');
    
    const parsed = parseCSV(content);
    cachedRoutes = parsed.map(row => ({
      route_id: row.route_id,
      route_short_name: row.route_short_name || row.route_long_name,
      route_long_name: row.route_long_name,
      route_type: row.route_type,
      agency_id: row.agency_id,
    }));
    
    console.log(`✅ Loaded ${cachedRoutes.length} real Delhi bus routes from GTFS`);
    return cachedRoutes;
  } catch (error) {
    console.error('Error loading GTFS routes:', error);
    return [];
  }
}

/**
 * Get random stops for bus simulation
 */
export function getRandomStops(count: number = 50): GTFSStop[] {
  const stops = loadGTFSStops();
  
  if (stops.length === 0) return [];
  
  // Get diverse stops from different areas
  const shuffled = [...stops].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get random routes for bus simulation
 */
export function getRandomRoutes(count: number = 50): GTFSRoute[] {
  const routes = loadGTFSRoutes();
  
  if (routes.length === 0) return [];
  
  // Filter out routes without short names
  const validRoutes = routes.filter(r => r.route_short_name && r.route_short_name.length > 0);
  
  const shuffled = [...validRoutes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Find nearest stop to a location
 */
export function findNearestStop(lat: number, lon: number): GTFSStop | null {
  const stops = loadGTFSStops();
  
  if (stops.length === 0) return null;
  
  let nearest = stops[0];
  let minDistance = Infinity;
  
  stops.forEach(stop => {
    const distance = Math.sqrt(
      Math.pow(stop.stop_lat - lat, 2) + Math.pow(stop.stop_lon - lon, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = stop;
    }
  });
  
  return nearest;
}

/**
 * Get statistics about loaded GTFS data
 */
export function getGTFSStats() {
  const stops = loadGTFSStops();
  const routes = loadGTFSRoutes();
  
  return {
    totalStops: stops.length,
    totalRoutes: routes.length,
    dataSource: 'Delhi Transport Corporation (DTC) - GTFS Static Feed',
    lastUpdated: new Date().toISOString(),
  };
}
