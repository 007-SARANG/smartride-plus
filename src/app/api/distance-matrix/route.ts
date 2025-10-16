import { NextRequest, NextResponse } from "next/server";

/**
 * Google Distance Matrix API Integration
 * Calculates real-time ETA with traffic data
 * 
 * Endpoint: /api/distance-matrix?origins=lat,lng&destinations=lat,lng
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origins = searchParams.get("origins"); // "lat,lng" or multiple "lat,lng|lat,lng"
    const destinations = searchParams.get("destinations"); // "lat,lng" or multiple
    const mode = searchParams.get("mode") || "driving"; // driving, walking, transit

    if (!origins || !destinations) {
      return NextResponse.json(
        { error: "Origins and destinations are required" },
        { status: 400 }
      );
    }

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!googleApiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Call Google Distance Matrix API
    const apiUrl = new URL(
      "https://maps.googleapis.com/maps/api/distancematrix/json"
    );
    
    apiUrl.searchParams.set("origins", origins);
    apiUrl.searchParams.set("destinations", destinations);
    apiUrl.searchParams.set("mode", mode);
    apiUrl.searchParams.set("departure_time", "now"); // Get real-time traffic
    apiUrl.searchParams.set("traffic_model", "best_guess");
    apiUrl.searchParams.set("key", googleApiKey);

    console.log('🚗 Fetching real-time ETA from Google Distance Matrix API...');
    
    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Google API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    // Transform response to simpler format
    const results = data.rows[0]?.elements?.map((element: any, index: number) => ({
      distance: {
        value: element.distance?.value || 0, // meters
        text: element.distance?.text || "N/A", // "5.2 km"
      },
      duration: {
        value: element.duration?.value || 0, // seconds
        text: element.duration?.text || "N/A", // "15 mins"
      },
      durationInTraffic: {
        value: element.duration_in_traffic?.value || element.duration?.value || 0,
        text: element.duration_in_traffic?.text || element.duration?.text || "N/A",
      },
      status: element.status,
    })) || [];

    console.log(`✅ Got ETA: ${results[0]?.durationInTraffic?.text || 'N/A'}`);

    return NextResponse.json({
      status: "OK",
      results,
      origins: data.origin_addresses,
      destinations: data.destination_addresses,
    }, {
      headers: {
        'X-Data-Source': 'google-distance-matrix',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error("Distance Matrix API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to calculate distance/ETA",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
