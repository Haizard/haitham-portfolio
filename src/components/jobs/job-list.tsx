
"use client";

import { useRef } from 'react';
import type { Job } from '@/lib/jobs-data';
import { JobListItem } from './job-list-item';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function JobList({ jobs }: { jobs: Job[] }) {
  const container = useRef(null);

  useGSAP(() => {
    if (container.current) {
        const jobCards = gsap.utils.toArray('.job-card');
        jobCards.forEach((card: any, index) => {
            gsap.from(card, {
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
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
  }, { scope: container, dependencies: [jobs] });


  return (
    <div ref={container} className="grid grid-cols-1 md:grid-cols-1 gap-6">
      {jobs.map(job => (
        <div key={job.id} className="job-card">
          <JobListItem job={job} />
        </div>
      ))}
    </div>
  );
}
