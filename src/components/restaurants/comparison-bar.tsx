
"use client";

import { useComparison } from "@/hooks/use-comparison";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { X, GitCompareArrows } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export function ComparisonBar() {
  const { selectedRestaurants, removeFromCompare, clearComparison, comparisonCount } = useComparison();

  return (
    <AnimatePresence>
      {comparisonCount > 0 && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50"
        >
          <Card className="shadow-2xl bg-background/80 backdrop-blur-md">
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-sm sm:text-base hidden sm:block">Compare Restaurants:</h3>
                {selectedRestaurants.map(r => (
                  <div key={r.id} className="relative group">
                    <Image src={r.logoUrl} alt={r.name} width={48} height={48} className="rounded-md border-2 border-primary/50" />
                    <button 
                      onClick={() => removeFromCompare(r.id!)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <Button variant="outline" onClick={clearComparison} className="flex-1 sm:flex-initial">Clear All</Button>
                 <Button className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90">
                    <GitCompareArrows className="mr-2 h-4 w-4"/>
                    Compare ({comparisonCount})
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
