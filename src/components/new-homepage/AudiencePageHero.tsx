'use client';

import React from 'react';

type AudiencePageHeroProps = {
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
};

export default function AudiencePageHero({
  imageSrc,
  imageAlt,
  children,
}: AudiencePageHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#09391C] via-[#0B423D] to-[#0A4A3C]">
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-[#8DDB90] blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-[#8DDB90] blur-3xl" />
      </div>

      <div className="relative grid lg:grid-cols-2 lg:min-h-[440px]">
        <div className="relative order-1 min-h-[260px] bg-[#082e28] sm:min-h-[320px] lg:order-2 lg:min-h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        </div>

        <div className="relative z-10 order-2 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:order-1 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
