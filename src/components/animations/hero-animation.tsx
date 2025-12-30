
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function HeroAnimation() {
  const component = useRef(null);
  const headingText = "Hire Talent, Buy Products, Grow your Vision.";
  const sublineText = "The all-in-one marketplace for creators. Millions of people use Ajira Online to turn their ideas into reality.";

  useGSAP(() => {
    gsap.from("#hero-heading .word", {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: 'power3.out'
    });
    gsap.from("#hero-subline", {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.5
    });
  }, { scope: component });

  return (
    <div ref={component}>
      <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold tracking-tight font-headline mb-6" aria-label={headingText}>
        {headingText.split(" ").map((word, index) => (
          <span key={index} className="word inline-block mr-3">
            {word}
          </span>
        ))}
      </h1>
      <p id="hero-subline" className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
        {sublineText}
      </p>
    </div>
  );
}
