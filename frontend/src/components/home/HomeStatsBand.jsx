import React from 'react';
import { Award, BookOpen, Landmark, UsersRound } from 'lucide-react';

const statistics = [
  { value: '50+', label: 'Affiliated institutions', icon: Landmark },
  { value: '10K+', label: 'Students & scholars', icon: UsersRound },
  { value: '20+', label: 'Academic programmes', icon: BookOpen },
  { value: '4+', label: 'Decades of service', icon: Award },
];

export const HomeStatsBand = () => (
  <section className="bg-misc-soft-blue py-8 sm:py-10">
    <div className="misc-container">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-2xl bg-white/70 p-5 sm:p-6 md:grid-cols-4 md:divide-x md:divide-misc-border md:gap-0">
        {statistics.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex min-w-0 items-center gap-3 md:justify-center md:px-4 lg:px-6">
            <Icon className="h-6 w-6 shrink-0 text-misc-primary sm:h-7 sm:w-7" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-xl font-semibold leading-tight tracking-tight text-misc-text sm:text-2xl">{value}</span>
              <span className="mt-1 block text-[9px] leading-snug text-misc-muted sm:text-[10px]">{label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeStatsBand;