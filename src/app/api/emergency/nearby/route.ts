import { NextRequest, NextResponse } from "next/server";

// Mock emergency services (in production, use Google Places API)
const mockEmergencyServices = [
  {
    id: "1",
    name: "City Police Station",
    type: "police",
    location: { latitude: 37.7849, longitude: -122.4094 },
    phone: "911",
  },
  {
    id: "2",
    name: "San Francisco General Hospital",
    type: "hospital",
    location: { latitude: 37.7756, longitude: -122.4143 },
    phone: "911",
  },
  {
    id: "3",
    name: "Fire Station 1",
    type: "fire",
    location: { latitude: 37.7799, longitude: -122.4134 },
    phone: "911",
  },
  {
    id: "4",
    name: "St. Mary's Medical Center",
    type: "hospital",
    location: { latitude: 37.7886, longitude: -122.4324 },
    phone: "(415) 555-0123",
  },
  {
    id: "5",
    name: "Police Substation North",
    type: "police",
    location: { latitude: 37.7989, longitude: -122.4012 },
    phone: "911",
  },
];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lon = parseFloat(searchParams.get("lon") || "0");
    const radius = parseFloat(searchParams.get("radius") || "5"); // Default 5km

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // ✅ REAL Google Places API Integration
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (googleApiKey && googleApiKey !== 'AIzaSyCRkQm-66A4X9g9WugQgy7-WD0Z9XydOWI') {
      console.log('🛰️ Using REAL Google Places API for emergency services');
      
      const types = ['police', 'hospital', 'fire_station'];
      const allResults: any[] = [];

      for (const type of types) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
            `location=${lat},${lon}&radius=${radius * 1000}&type=${type}&key=${googleApiKey}`
          );
          const data = await response.json();
          
          if (data.results) {
            // Transform Google Places format to our format
            const transformedResults = data.results.map((place: any) => ({
              id: place.place_id,
              name: place.name,
              type: type === 'fire_station' ? 'fire' : type,
              location: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              },
              phone: place.formatted_phone_number || 'Call 112',
              address: place.vicinity,
              rating: place.rating,
              isOpen: place.opening_hours?.open_now,
              distance: calculateDistance(
                lat,
                lon,
                place.geometry.location.lat,
                place.geometry.location.lng
              ),
            }));
            
            allResults.push(...transformedResults);
          }
        } catch (error) {
          console.error(`Error fetching ${type}:`, error);
        }
      }

      // Sort by distance and return top 10
      const sortedResults = allResults
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      return NextResponse.json(sortedResults, {
        headers: {
          'X-Data-Source': 'google-places-api',
        },
      });
    }

    // Fallback to mock data if API key not configured
    console.log('🎭 Using mock emergency services (no Google API key)');
    const nearbyServices = mockEmergencyServices
      .map((service) => ({
        ...service,
        distance: calculateDistance(
          lat,
          lon,
          service.location.latitude,
          service.location.longitude
        ),
      }))
      .filter((service) => service.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    return NextResponse.json(nearbyServices, {
      headers: {
        'X-Data-Source': 'simulation',
      },
    });
  } catch (error) {
    console.error("Emergency services error:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency services" },
      { status: 500 }
    );
  }
}
