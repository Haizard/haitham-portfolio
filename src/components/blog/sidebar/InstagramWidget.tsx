
"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram } from "lucide-react";

// Placeholder images, replace with actual Instagram API data if integrated
const placeholderImages = [
  "https://placehold.co/150x150.png?text=Insta1",
  "https://placehold.co/150x150.png?text=Insta2",
  "https://placehold.co/150x150.png?text=Insta3",
  "https://placehold.co/150x150.png?text=Insta4",
  "https://placehold.co/150x150.png?text=Insta5",
  "https://placehold.co/150x150.png?text=Insta6",
];

export function InstagramWidget() {
  return (
    <Card className="shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Instagram className="mr-2 h-5 w-5 text-primary" /> Instagram Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {placeholderImages.map((src, index) => (
            <div key={index} className="aspect-square rounded-md overflow-hidden group">
              <Image
                src={src}
                alt={`Instagram placeholder ${index + 1}`}
                width={150}
                height={150}
                className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                data-ai-hint="social media photo"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          (Placeholder Instagram Feed)
        </p>
      </CardContent>
    </Card>
  );
}
