"use client";

import { useState } from "react";
import { AlertCircle, Phone, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export function SOSButton() {
  const [isActive, setIsActive] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [nearbyServices, setNearbyServices] = useState<any[]>([]);
  const { toast } = useToast();

  const activateSOS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          setIsActive(true);
          toast({
            title: "SOS Activated",
            description: "Finding nearby emergency services...",
            variant: "destructive",
          });

          try {
            // Fetch nearby emergency services
            const response = await fetch(
              `/api/emergency/nearby?lat=${latitude}&lon=${longitude}`
            );
            const services = await response.json();
            setNearbyServices(services);
            setShowServices(true);

            // Share location with emergency contacts
            const shareUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
            if (navigator.share) {
              await navigator.share({
                title: "Emergency Location",
                text: "I need help! My current location:",
                url: shareUrl,
              });
            } else {
              // Fallback: copy to clipboard
              await navigator.clipboard.writeText(shareUrl);
              toast({
                title: "Location copied",
                description: "Share this link with emergency contacts",
              });
            }
          } catch (error) {
            console.error("SOS error:", error);
          }
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location for SOS",
            variant: "destructive",
          });
        }
      );
    }
  };

  const deactivateSOS = () => {
    setIsActive(false);
    setShowServices(false);
    toast({
      title: "SOS Deactivated",
      description: "Stay safe!",
    });
  };

  return (
    <>
      {/* SOS Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          variant={isActive ? "destructive" : "default"}
          className={`relative h-16 w-16 rounded-full shadow-2xl ${
            isActive ? "animate-pulse" : ""
          }`}
          onClick={isActive ? deactivateSOS : activateSOS}
        >
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
          <AlertCircle className="h-8 w-8" />
        </Button>
      </motion.div>

      {/* Emergency Services Panel */}
      <AnimatePresence>
        {showServices && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute bottom-20 right-0 w-80 bg-card rounded-lg shadow-2xl border p-4 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Emergency Services
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowServices(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {nearbyServices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Searching for nearby services...
                </p>
              ) : (
                nearbyServices.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{service.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {service.distance.toFixed(2)} km away
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          service.type === "police"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                            : service.type === "hospital"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                        }`}
                      >
                        {service.type}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {service.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => window.open(`tel:${service.phone}`)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${service.location.latitude},${service.location.longitude}`
                          )
                        }
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Navigate
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
