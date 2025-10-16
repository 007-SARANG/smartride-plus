"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { Bus, Users, Clock, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCrowdLevel, formatTime } from "@/lib/utils";

export function BusInfo() {
  const selectedBus = useAppStore((state) => state.selectedBus);
  const setSelectedBus = useAppStore((state) => state.setSelectedBus);

  if (!selectedBus) return null;

  const crowdInfo = getCrowdLevel(selectedBus.crowdLevel);
  const occupancyPercentage = Math.round(
    (selectedBus.occupancy / selectedBus.capacity) * 100
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-card rounded-lg shadow-2xl border p-4"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-3">
              <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Bus {selectedBus.routeNumber}</h3>
              <p className="text-sm text-muted-foreground">
                To {selectedBus.nextStop}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedBus(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* ETA */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="text-lg font-semibold">
                {formatTime(selectedBus.eta)}
              </p>
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Speed</p>
              <p className="text-lg font-semibold">{selectedBus.speed} km/h</p>
            </div>
          </div>
        </div>

        {/* Crowd Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">Crowd Level</span>
            </div>
            <span className={`font-semibold ${crowdInfo.color}`}>
              {crowdInfo.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${selectedBus.crowdLevel}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full ${crowdInfo.bgColor} rounded-full`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selectedBus.occupancy}/{selectedBus.capacity} passengers
            </span>
            <span>{occupancyPercentage}% full</span>
          </div>
        </div>

        {/* Report Crowd Button */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => {
            // Open crowd reporting modal
          }}
        >
          <Users className="h-4 w-4 mr-2" />
          Report Crowd Level
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
