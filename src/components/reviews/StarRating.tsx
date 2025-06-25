
"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export function StarRating({ rating, onRatingChange, size = 24, className, disabled = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (rate: number) => {
    if (disabled || !onRatingChange) return;
    onRatingChange(rate);
  };

  const handleMouseEnter = (rate: number) => {
    if (disabled) return;
    setHoverRating(rate);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  return (
    <div className={cn("flex items-center", className)}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const buttonProps = !disabled ? {
          onClick: () => handleRating(starValue),
          onMouseEnter: () => handleMouseEnter(starValue),
          onMouseLeave: handleMouseLeave,
        } : {};

        return (
          <button
            type="button"
            key={starValue}
            className={cn("p-1", disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
            disabled={disabled}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            {...buttonProps}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                "transition-colors",
                starValue <= (hoverRating || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
