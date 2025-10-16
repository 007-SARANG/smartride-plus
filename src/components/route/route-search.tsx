"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, Navigation2, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface PlaceSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
}

export function RouteSearch() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [originInput, setOriginInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<PlaceSuggestion | null>(null);
  const [selectedDest, setSelectedDest] = useState<PlaceSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const setCurrentRoute = useAppStore((state) => state.setCurrentRoute);
  const isOffline = useAppStore((state) => state.isOffline);

  // Debounced search for places
  const searchPlaces = useCallback(async (query: string, isOrigin: boolean) => {
    if (query.length < 1) {
      isOrigin ? setOriginSuggestions([]) : setDestSuggestions([]);
      return;
    }

    if (!MAPBOX_TOKEN) {
      console.warn("Mapbox token not configured");
      return;
    }

    try {
      // Use Mapbox Geocoding API with comprehensive parameters
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?` +
        `access_token=${MAPBOX_TOKEN}` +
        `&limit=10` +
        `&types=country,region,postcode,district,place,locality,neighborhood,address,poi` +
        `&language=en` +
        `&fuzzyMatch=true` +
        `&autocomplete=true`; // Enable autocomplete mode
      
      const response = await fetch(mapboxUrl);
      const data = await response.json();
      
      let suggestions: PlaceSuggestion[] = [];
      
      if (data.features && data.features.length > 0) {
        suggestions = data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center,
          text: feature.text,
        }));
      }
      
      // If Mapbox returns no results, try a broader search by adding common location suffixes
      if (suggestions.length === 0) {
        const broadSearchTerms = [
          query,
          `${query}, India`,
          `${query} University`,
          `${query} Institute`,
          `${query} College`,
        ];
        
        for (const searchTerm of broadSearchTerms) {
          const broadUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            searchTerm
          )}.json?access_token=${MAPBOX_TOKEN}&limit=3&fuzzyMatch=true`;
          
          try {
            const broadResponse = await fetch(broadUrl);
            const broadData = await broadResponse.json();
            
            if (broadData.features && broadData.features.length > 0) {
              const newSuggestions = broadData.features.map((feature: any) => ({
                id: feature.id,
                place_name: feature.place_name,
                center: feature.center,
                text: feature.text,
              }));
              
              // Add to suggestions if not duplicate
              newSuggestions.forEach((newSug: PlaceSuggestion) => {
                if (!suggestions.find(s => s.id === newSug.id)) {
                  suggestions.push(newSug);
                }
              });
              
              if (suggestions.length >= 5) break; // Stop if we have enough results
            }
          } catch (err) {
            console.error("Broad search error:", err);
          }
        }
      }
      
      isOrigin ? setOriginSuggestions(suggestions) : setDestSuggestions(suggestions);
    } catch (error) {
      console.error("Geocoding error:", error);
      isOrigin ? setOriginSuggestions([]) : setDestSuggestions([]);
    }
  }, []);

  // Handle input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (originInput && !selectedOrigin) {
        searchPlaces(originInput, true);
      }
    }, 200); // Reduced from 300ms to 200ms for faster response
    return () => clearTimeout(timer);
  }, [originInput, selectedOrigin, searchPlaces]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (destInput && !selectedDest) {
        searchPlaces(destInput, false);
      }
    }, 200); // Reduced from 300ms to 200ms for faster response
    return () => clearTimeout(timer);
  }, [destInput, selectedDest, searchPlaces]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOriginSelect = (suggestion: PlaceSuggestion) => {
    setSelectedOrigin(suggestion);
    setOriginInput(suggestion.place_name);
    setShowOriginDropdown(false);
    setOriginSuggestions([]);
  };

  const handleDestSelect = (suggestion: PlaceSuggestion) => {
    setSelectedDest(suggestion);
    setDestInput(suggestion.place_name);
    setShowDestDropdown(false);
    setDestSuggestions([]);
  };

  // Handle manual coordinate entry (e.g., "30.1234, 76.5678")
  const parseManualCoordinates = (input: string): PlaceSuggestion | null => {
    const coordPattern = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
    const match = input.match(coordPattern);
    
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      
      // Validate coordinates
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return {
          id: 'manual-coords',
          place_name: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          center: [lon, lat],
          text: 'Manual Location'
        };
      }
    }
    return null;
  };

  const handleSearch = async () => {
    // Check if inputs are manual coordinates
    let originToUse = selectedOrigin;
    let destToUse = selectedDest;
    
    if (!originToUse && originInput) {
      const manualOrigin = parseManualCoordinates(originInput);
      if (manualOrigin) {
        originToUse = manualOrigin;
      }
    }
    
    if (!destToUse && destInput) {
      const manualDest = parseManualCoordinates(destInput);
      if (manualDest) {
        destToUse = manualDest;
      }
    }
    
    if (!originToUse || !destToUse) {
      toast({
        title: "Missing information",
        description: "Please select locations from dropdown or enter coordinates (e.g., 30.1234, 76.5678)",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch("/api/routes/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: {
            lat: originToUse.center[1],
            lon: originToUse.center[0],
            name: originToUse.text,
          },
          destination: {
            lat: destToUse.center[1],
            lon: destToUse.center[0],
            name: destToUse.text,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to find route");

      const data = await response.json();
      setCurrentRoute(data);

      toast({
        title: "Route found!",
        description: `Best route: ${data.route.distance} km`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get place name
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            
            if (data.features && data.features[0]) {
              const place: PlaceSuggestion = {
                id: data.features[0].id,
                place_name: data.features[0].place_name,
                center: [longitude, latitude],
                text: data.features[0].text,
              };
              handleOriginSelect(place);
            } else {
              setOriginInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              setSelectedOrigin({
                id: 'current',
                place_name: 'Current Location',
                center: [longitude, latitude],
                text: 'Current Location'
              });
            }
            
            toast({
              title: "Location found",
              description: "Your current location has been set",
            });
          } catch (error) {
            console.error("Reverse geocoding error:", error);
          }
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg shadow-2xl border overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Route
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              {/* Origin Input with Autocomplete */}
              <div className="relative" ref={originRef}>
                <input
                  type="text"
                  placeholder="From (Origin)"
                  value={originInput}
                  onChange={(e) => {
                    setOriginInput(e.target.value);
                    setSelectedOrigin(null);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  className="w-full px-4 py-2 pr-10 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={handleGetCurrentLocation}
                >
                  <Navigation2 className="h-4 w-4" />
                </Button>
                
                {/* Origin Dropdown */}
                {showOriginDropdown && originInput.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {originSuggestions.length > 0 ? (
                      originSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleOriginSelect(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-accent flex items-start gap-2 border-b last:border-b-0"
                        >
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                          <span className="text-sm">{suggestion.place_name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="text-center mb-2">No results found</div>
                        <div className="text-center">Try: City name, landmark, or coordinates (30.123, 76.456)</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Destination Input with Autocomplete */}
              <div className="relative" ref={destRef}>
                <input
                  type="text"
                  placeholder="To (Destination)"
                  value={destInput}
                  onChange={(e) => {
                    setDestInput(e.target.value);
                    setSelectedDest(null);
                    setShowDestDropdown(true);
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                  className="w-full px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                {/* Destination Dropdown */}
                {showDestDropdown && destInput.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {destSuggestions.length > 0 ? (
                      destSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleDestSelect(suggestion)}
                          className="w-full px-4 py-2 text-left hover:bg-accent flex items-start gap-2 border-b last:border-b-0"
                        >
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                          <span className="text-sm">{suggestion.place_name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="text-center mb-2">No results found</div>
                        <div className="text-center">Try: City name, landmark, or coordinates (30.123, 76.456)</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSearch}
                className="w-full"
                disabled={!selectedOrigin || !selectedDest || isSearching}
              >
                {isSearching ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Best Route
                  </>
                )}
              </Button>

              {isOffline && (
                <div className="text-xs text-muted-foreground text-center">
                  Offline mode: Showing cached routes
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
