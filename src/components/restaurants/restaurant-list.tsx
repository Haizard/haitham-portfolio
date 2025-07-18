
"use client";

import { useRef } from 'react';
import type { Restaurant } from '@/lib/restaurants-data';
import { RestaurantListItem } from './restaurant-list-item';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
    const container = useRef(null);

    useGSAP(() => {
        if(container.current) {
            const cards = gsap.utils.toArray('.restaurant-card-item');
            cards.forEach((card: any) => { // Simplified animation for single column
                gsap.from(card, {
                    opacity: 0,
                    y: 50, // Animate from bottom
                    duration: 0.6,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 90%',
                        toggleActions: 'play none none none',
                    }
                });
            });
        }
    }, { scope: container, dependencies: [restaurants] });

    return (
        <div ref={container} className="space-y-6">
            {restaurants.map(restaurant => (
                <div key={restaurant.id} className="restaurant-card-item">
                    <RestaurantListItem restaurant={restaurant} />
                </div>
            ))}
        </div>
    );
}
