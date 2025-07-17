
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
    const jobCards = gsap.utils.toArray('.job-card');
    gsap.from(jobCards, {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: container.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
        }
    });
  }, { scope: container, dependencies: [jobs] });


  return (
    <div ref={container} className="space-y-6">
      {jobs.map(job => (
        <div key={job.id} className="job-card">
          <JobListItem job={job} />
        </div>
      ))}
    </div>
  );
}
