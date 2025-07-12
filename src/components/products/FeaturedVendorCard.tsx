
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { FreelancerProfile } from "@/lib/user-profile-data";
import { StarRating } from '../reviews/StarRating';

interface FeaturedVendorCardProps {
  vendor: FreelancerProfile;
}

export const FeaturedVendorCard: React.FC<FeaturedVendorCardProps> = ({ vendor }) => {
  return (
    <Link href={`/store/${vendor.userId}`} className="block group">
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center p-3 gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary">
            <AvatarImage src={vendor.avatarUrl} alt={vendor.name} data-ai-hint="vendor avatar" />
            <AvatarFallback>{vendor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {vendor.storeName || vendor.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{vendor.occupation}</p>
             <div className="flex items-center gap-1 mt-1">
                <StarRating rating={vendor.averageRating || 0} size={12} disabled/>
                <span className="text-xs text-muted-foreground">({vendor.reviewCount})</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
