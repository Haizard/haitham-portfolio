
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function HeroAnimation() {
  const component = useRef(null);
  const headingRef = useRef(null);
  const sublineRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from([headingRef.current, sublineRef.current], {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2,
      });
    }, component);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={component}>
      <h1 ref={headingRef} className="text-4xl md:text-6xl font-bold tracking-tight font-headline mb-6">
        Hire Talent, Buy Products, Grow your Vision.
      </h1>
      <p ref={sublineRef} className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
        The all-in-one marketplace for creators. Millions of people use CreatorOS to turn their ideas into reality.
      </p>
    </div>
  );
}
