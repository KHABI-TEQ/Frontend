'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';

export type AudienceSlide = {
  key: string;
  step: string;
  title: string;
  caption: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
};

export type AudienceCta = {
  href: string;
  label: string;
};

export function AudienceJourneyCarousel({
  slides,
  lastCta,
}: {
  slides: readonly AudienceSlide[];
  lastCta: AudienceCta;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isPaused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, [emblaApi, isPaused, slides.length]);

  const isLast = selectedIndex === slides.length - 1;

  return (
    <div
      className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-2xl bg-[#081812] shadow-xl shadow-[#09391C]/10 sm:rounded-3xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="min-h-0 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide.key} className="h-full min-w-0 flex-[0_0_100%]">
              <div className="grid h-full min-h-0 w-full grid-rows-[minmax(11rem,1.35fr)_auto] lg:grid-cols-2 lg:grid-rows-none">
                <div className="relative min-h-0 overflow-hidden bg-[#081812]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    className={`absolute inset-0 h-full w-full object-cover ${slide.imagePosition ?? 'object-center'}`}
                  />
                </div>

                <div className="flex min-h-0 flex-col justify-center bg-[#081812] px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
                  <span className="mb-1 inline-flex w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#8DDB90]">
                    Step {slide.step} of {String(slides.length).padStart(2, '0')}
                  </span>
                  <h2 className="mb-1 line-clamp-2 text-sm font-extrabold leading-snug text-white sm:text-xl lg:text-2xl">
                    {slide.title}
                  </h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[#F4F7F5] sm:text-sm">
                    {slide.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-[#081812] px-3 py-2 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                selectedIndex === index ? 'w-5 bg-[#8DDB90] sm:w-6' : 'w-2 bg-white/35 hover:bg-white/60'
              }`}
              aria-label={`Go to ${slide.title}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={selectedIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white disabled:opacity-30 sm:h-10 sm:w-10"
            aria-label="Previous step"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {isLast ? (
            <Link
              href={lastCta.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#8DDB90] px-3.5 py-2 text-xs font-extrabold text-[#09391C] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              {lastCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={scrollNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#8DDB90] px-3.5 py-2 text-xs font-extrabold text-[#09391C] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AudienceReadMoreSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-gray-100 bg-white shadow-[0_4px_24px_-8px_rgba(9,57,28,0.08)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 font-semibold text-[#09391C]">
          <Icon className="h-5 w-5 text-[#8DDB90]" />
          {title}
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="border-t border-gray-100 px-5 py-5 sm:px-6">{children}</div>
    </details>
  );
}

export function AudienceDetailList({
  items,
}: {
  items: readonly { title: string; body: string }[];
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3 rounded-xl bg-[#F8FAF8] p-4">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8DDB90]/20">
            <Check className="h-4 w-4 text-[#09391C]" />
          </span>
          <div>
            <p className="mb-1 text-sm font-semibold text-[#09391C] sm:text-base">{item.title}</p>
            <p className="text-sm leading-relaxed text-gray-600">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AudienceCheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-xl bg-[#F8FAF8] p-4">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8DDB90]/20">
            <Check className="h-4 w-4 text-[#09391C]" />
          </span>
          <span className="text-sm text-gray-700 sm:text-base">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AudienceJourneyPage({
  title,
  titleIcon: TitleIcon,
  headerCta,
  slides,
  lastCta,
  toolbar,
  carouselKey,
  children,
}: {
  title: string;
  titleIcon: React.ElementType;
  headerCta: AudienceCta;
  slides: readonly AudienceSlide[];
  lastCta: AudienceCta;
  toolbar?: React.ReactNode;
  carouselKey?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-gradient-to-br from-[#F8FAF8] via-white to-[#EEF1F1]">
      <div className="px-3 pb-3 pt-0 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-[calc(100dvh-5.25rem)] max-h-[calc(100dvh-5.25rem)] w-full max-w-6xl flex-col lg:h-[calc(100dvh-6.5rem)] lg:max-h-[calc(100dvh-6.5rem)]">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <nav className="hidden shrink-0 items-center gap-2 text-xs text-gray-500 sm:flex">
                <Link href="/" className="transition-colors hover:text-[#09391C]">
                  Home
                </Link>
                <span>/</span>
              </nav>
              <h1 className="min-w-0 truncate text-sm font-bold text-[#09391C] sm:text-lg">
                <TitleIcon className="mr-2 hidden h-4 w-4 shrink-0 sm:inline" />
                {title}
              </h1>
            </div>
            <Link
              href={headerCta.href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#09391C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0B423D] sm:px-5 sm:py-2 sm:text-sm"
            >
              {headerCta.label}
              <ArrowRight className="hidden h-4 w-4 sm:block" />
            </Link>
          </div>

          {toolbar ? <div className="mb-2 min-w-0 shrink-0">{toolbar}</div> : null}

          <div className="min-h-0 flex-1">
            <AudienceJourneyCarousel key={carouselKey ?? slides[0]?.key} slides={slides} lastCta={lastCta} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-3 px-3 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8">
        {children}
      </div>
    </section>
  );
}
