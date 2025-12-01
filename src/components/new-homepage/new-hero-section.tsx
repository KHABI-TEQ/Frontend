/** @format */

'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Button from '../general-components/button';
import Link from 'next/link';
import { useHomePageSettings } from '@/hooks/useSystemSettings';
import useEmblaCarousel from 'embla-carousel-react';
 
const NewHeroSection = () => {
  const { settings: homePageSettings, loading: settingsLoading } = useHomePageSettings();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  });

  // Video refs for each video in slider
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [previousVideoIndex, setPreviousVideoIndex] = useState(-1);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayPending, setIsPlayPending] = useState(false);
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const initialAutoplayDone = useRef(false);

  // Get hero video URLs from settings with fallbacks
  const heroVideos = [
    homePageSettings?.hero_video_1_url,
    homePageSettings?.hero_video_2_url,
  ].filter(Boolean); // Remove empty/null values

  // Carousel navigation
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Video control functions
  const getCurrentVideo = () => videoRefs.current[currentVideoIndex];

  const pauseOtherVideosExcept = (exceptVideo: HTMLVideoElement | null) => {
    if (!containerRef.current) {
      // fallback: use refs array
      videoRefs.current.forEach((video) => {
        if (video && video !== exceptVideo && !video.paused) video.pause();
      });
      return;
    }

    const allVideos = Array.from(containerRef.current.querySelectorAll<HTMLVideoElement>('video'));
    allVideos.forEach((video) => {
      if (video !== exceptVideo && !video.paused) {
        try { video.pause(); } catch (e) { /* ignore */ }
      }
    });
  };

  const pauseAllVideos = () => {
    if (containerRef.current) {
      const allVideos = Array.from(containerRef.current.querySelectorAll<HTMLVideoElement>('video'));
      allVideos.forEach(v => { try { if (!v.paused) v.pause(); } catch (e) {} });
    } else {
      videoRefs.current.forEach(video => { if (video && !video.paused) video.pause(); });
    }
    /* playingIndex removed; UI reads actual element state */
  };

  const pauseVideoAtIndex = (index: number) => {
    const video = videoRefs.current[index];
    if (video && !video.paused) {
      try { video.pause(); } catch (e) {}
    }
  };

  const playCurrentVideo = async () => {
    const currentVideo = getCurrentVideo();
    if (!currentVideo || isPlayPending) return;

    try {
      setIsPlayPending(true);
      try { currentVideo.muted = isMuted; } catch (e) {}
      await currentVideo.play();
      /* playingIndex removed; UI reads actual element state */
      // independent playback: do not auto-pause other videos
      initialAutoplayDone.current = true;
      setIsPlayPending(false);
    } catch (error) {
      console.log('Video play failed:', error);
      setIsPlayPending(false);
    }
  };

  const pauseCurrentVideo = () => {
    const currentVideo = getCurrentVideo();
    if (!currentVideo) return;

    currentVideo.pause();
    // State will be updated by event listener
  };

  const handlePlayPause = async (e: React.MouseEvent, targetIndex?: number, videoElement?: HTMLVideoElement | null) => {
    e.preventDefault();
    e.stopPropagation();

    const indexToControl = typeof targetIndex === 'number' ? targetIndex : currentVideoIndex;
    // prefer the provided video element (useful when interacting with cloned slides)
    let targetVideo: HTMLVideoElement | null = videoElement ?? null;

    // If no explicit video passed, pick the most visible video for this logical index (handles clones)
    if (!targetVideo) {
      targetVideo = getVisibleVideoForIndex(indexToControl) ?? videoRefs.current[indexToControl] ?? null;
    }

    // fallback: first matching video in container
    if (!targetVideo && containerRef.current) {
      targetVideo = containerRef.current.querySelector(`video[data-embla-index="${indexToControl}"]`);
    }

    if (!targetVideo || isPlayPending) return;

    const ensurePlayableAndPlay = async (video: HTMLVideoElement) => {
      try {
        // Prefer explicit muted property assignment to satisfy autoplay rules
        video.muted = isMuted;
      } catch (e) {}

      // If not enough data, try to load
      try {
        if (video.readyState < 2) {
          // eslint-disable-next-line no-console
          console.debug('[HeroVideo] video not ready, calling load()', { index: indexToControl, readyState: video.readyState });
          try { video.load(); } catch (e) {}
        }
      } catch (e) {}

      // Attempt play, if not allowed - try muting and retry
      try {
        return await video.play();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[HeroVideo] initial play() failed, retrying with muted=true', err);
        try {
          video.muted = true;
          return await video.play();
        } catch (err2) {
          // eslint-disable-next-line no-console
          console.error('[HeroVideo] retry play failed', err2);
          throw err2;
        }
      }
    };

    try {
      if (targetVideo.paused) {
        // diagnostic
        // eslint-disable-next-line no-console
        console.debug('[HeroVideo] play requested', { index: indexToControl, muted: targetVideo.muted, readyState: targetVideo.readyState, src: targetVideo.currentSrc || targetVideo.src });
        setIsPlayPending(true);
        await ensurePlayableAndPlay(targetVideo);
        /* playingIndex removed; UI reads actual element state */
        // independent playback: do not auto-pause other videos
        setIsPlayPending(false);
      } else {
        targetVideo.pause();
        /* playingIndex removed; UI reads actual element state */
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[HeroVideo] Video control failed for index', indexToControl, error);
      // Try fallback: attempt to play any matching video elements with same data-embla-index (handles cloned slides)
      if (containerRef.current) {
        const candidates = Array.from(containerRef.current.querySelectorAll(`video[data-embla-index="${indexToControl}"]`)) as HTMLVideoElement[];
        for (const candidate of candidates) {
          if (candidate === targetVideo) continue;
          try {
            await ensurePlayableAndPlay(candidate);
            /* playingIndex removed; UI reads actual element state */
            // independent playback: do not auto-pause other videos
            setIsPlayPending(false);
            return;
          } catch (err2) {
            // eslint-disable-next-line no-console
            console.error('[HeroVideo] fallback play failed for candidate', err2);
          }
        }
      }

      setIsPlayPending(false);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent, index?: number, videoElement?: HTMLVideoElement | null) => {
    e.preventDefault();
    e.stopPropagation();

    let video = videoElement ?? (typeof index === 'number' ? videoRefs.current[index] : getCurrentVideo());
    if (!video && containerRef.current && typeof index === 'number') {
      video = containerRef.current.querySelector(`video[data-embla-index="${index}"]`);
    }
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleEmblaContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const actionEl = target.closest('[data-embla-action]') as HTMLElement | null;
    if (!actionEl) return;

    const action = actionEl.getAttribute('data-embla-action');
    const idxEl = actionEl.closest('[data-embla-index]') as HTMLElement | null;
    const idxAttr = idxEl?.getAttribute('data-embla-index') ?? actionEl.getAttribute('data-embla-index');
    const index = idxAttr ? Number(idxAttr) : currentVideoIndex;

    if (action === 'toggle') {
      const slideEl = actionEl.closest('.embla__slide') as HTMLElement | null;
      const clickedVideo = slideEl ? slideEl.querySelector('video') as HTMLVideoElement | null : null;
      handlePlayPause(e, index, clickedVideo);
    } else if (action === 'mute') {
      const slideEl = actionEl.closest('.embla__slide') as HTMLElement | null;
      const clickedVideo = slideEl ? slideEl.querySelector('video') as HTMLVideoElement | null : null;
      handleMuteToggle(e, index, clickedVideo);
    } else if (action === 'fullscreen') {
      // reserved for future fullscreen handling
    }
  };

  const handleVideoEnded = () => {
    // State will be updated by pause event listener when video ends
  };

  // Handle slide selection
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const selectedIndex = emblaApi.selectedScrollSnap();

    // If we're navigating to a different slide, pause the currently playing video
    if (currentVideoIndex !== selectedIndex) {
      pauseVideoAtIndex(currentVideoIndex);
    }

    // Store previous index before updating
    setPreviousVideoIndex(currentVideoIndex);
    setCurrentVideoIndex(selectedIndex);

    // IMPORTANT: Do NOT auto-play the newly selected slide.
    // Videos should only play when user explicitly clicks the play button.
  }, [emblaApi, currentVideoIndex]);

  // Setup embla carousel event listeners with slider state management
  useEffect(() => {
    if (!emblaApi) return;

    // Handle slide selection
    emblaApi.on('select', onSelect);

    const handleSettle = () => {
      if (!isPlayPending) {
        const idx = emblaApi.selectedScrollSnap?.();
        if (typeof idx === 'number' && idx === 0 && !initialAutoplayDone.current) {
          // Only auto-play the first slide on initial load
          playCurrentVideo();
        }
      }
    };

    emblaApi.on('settle', handleSettle);

    onSelect(); // Initialize with current selection (will pause any playing videos)

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('settle', handleSettle);
    };
  }, [emblaApi, onSelect, isPlayPending]);

  // Attach play/pause listeners to ALL video elements inside the embla container (including clones)
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const allVideos: HTMLVideoElement[] = Array.from(container.querySelectorAll('video'));

    allVideos.forEach((video) => {
      const playHandler = () => {
        // Update playing state when video plays
        const idxAttr = video.getAttribute('data-embla-index');
        const idx = idxAttr ? Number(idxAttr) : null;
        if (typeof idx === 'number') {
          setPlayingVideos((prev) => {
            const newSet = new Set(prev);
            newSet.add(idx);
            return newSet;
          });
        }
        setIsMuted(video.muted);
      };

      const pauseHandler = () => {
        // Update playing state when video pauses
        const idxAttr = video.getAttribute('data-embla-index');
        const idx = idxAttr ? Number(idxAttr) : null;
        if (typeof idx === 'number') {
          setPlayingVideos((prev) => {
            const newSet = new Set(prev);
            newSet.delete(idx);
            return newSet;
          });
        }
        if (typeof idx === 'number' && idx === currentVideoIndex) {
          setIsMuted(video.muted);
        }
      };

      // store handlers for cleanup
      (video as any).__hero_play = playHandler;
      (video as any).__hero_pause = pauseHandler;
      video.addEventListener('play', playHandler);
      video.addEventListener('pause', pauseHandler);
    });

    return () => {
      allVideos.forEach((video) => {
        const ph = (video as any).__hero_play;
        const pah = (video as any).__hero_pause;
        if (ph) video.removeEventListener('play', ph);
        if (pah) video.removeEventListener('pause', pah);
        delete (video as any).__hero_play;
        delete (video as any).__hero_pause;
      });
    };
  }, [heroVideos.length, containerRef.current, currentVideoIndex]);

  // Helper: choose the most visible video element for a logical index (useful with embla clones)
  const getVisibleVideoForIndex = (index: number) : HTMLVideoElement | null => {
    if (!containerRef.current) return null;
    const slides = Array.from(containerRef.current.querySelectorAll('.embla__slide')) as HTMLElement[];
    const containerRect = containerRef.current.getBoundingClientRect();

    let best: { el: HTMLVideoElement | null; score: number } = { el: null, score: -Infinity };

    slides.forEach((slide) => {
      const video = slide.querySelector('video[data-embla-index]') as HTMLVideoElement | null;
      if (!video) return;
      const idxAttr = video.getAttribute('data-embla-index');
      const idx = idxAttr ? Number(idxAttr) : null;
      if (idx !== index) return;
      const r = slide.getBoundingClientRect();
      // compute horizontal overlap area as score
      const overlap = Math.max(0, Math.min(r.right, containerRect.right) - Math.max(r.left, containerRect.left));
      const score = overlap * (r.height || 1);
      if (score > best.score) best = { el: video, score };
    });

    return best.el;
  };

  // Helper to determine if logical index is currently playing
  const isIndexPlaying = (index: number) => {
    return playingVideos.has(index);
  };

  // Track readiness of each video (can play) to show skeletons until video thumbnails/content are ready
  const [videoReady, setVideoReady] = useState<boolean[]>([]);
  const firstVideoReady = videoReady[0];

  useEffect(() => {
    setVideoReady(Array(heroVideos.length).fill(false));
    /* playingIndex removed; UI reads actual element state */
  }, [heroVideos.length]);

  // Auto-play functionality - only auto-play the first video on initial load
  useEffect(() => {
    if (!heroVideos.length || isPlayPending) return;

    // Only auto-play on initial load, not on re-renders
    if (initialAutoplayDone.current) return;

    const firstVideo = videoRefs.current[0];
    if (!firstVideo) return;

    const attemptPlay = () => {
      const videoElement = videoRefs.current[0];
      if (!videoElement) return;

      if (!videoElement.paused) {
        initialAutoplayDone.current = true;
        return;
      }

      try { videoElement.muted = isMuted; } catch (e) {}
      videoElement.play()
        .then(() => {
          initialAutoplayDone.current = true;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Initial auto-play failed:', error);
          initialAutoplayDone.current = true; // Mark as done even on failure to prevent infinite loops
        });
    };

    // If video is already ready, attempt play immediately
    if (firstVideoReady) {
      attemptPlay();
      return;
    }

    // Wait for video to be ready before attempting play
    const handleReady = () => {
      if (!initialAutoplayDone.current) {
        attemptPlay();
      }
    };

    firstVideo.addEventListener('canplay', handleReady);
    firstVideo.addEventListener('loadeddata', handleReady);

    return () => {
      firstVideo.removeEventListener('canplay', handleReady);
      firstVideo.removeEventListener('loadeddata', handleReady);
    };
  }, [heroVideos.length, isPlayPending, firstVideoReady]);

  // Attach canplaythrough / loadeddata handlers to mark videos ready
  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    const handlers: Array<() => void> = [];

    videos.forEach((video, idx) => {
      if (!video) return;
      const onCanPlay = () => {
        setVideoReady(prev => {
          const copy = [...prev];
          copy[idx] = true;
          return copy;
        });
      };
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('loadeddata', onCanPlay);
      handlers.push(() => {
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('loadeddata', onCanPlay);
      });
    });

    return () => {
      handlers.forEach(h => h());
    };
  }, [heroVideos]);

  try {
    return (
    <section className='w-full min-h-[100vh] bg-gradient-to-br from-[#0B423D] via-[#093B6D] to-[#0A3E72] flex items-center justify-center overflow-hidden relative'>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      
      <div className='container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 relative z-10'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight font-display'>
            Find the Perfect Property.{' '}
            <span className='text-[#8DDB90]'>Verified</span>,{' '}
            <span className='text-[#8DDB90]'>Hassle-Free</span>.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0'>
            Khabiteq connects buyers, tenants, developers, and verified agents with speed, transparency, and trust.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg mx-auto px-4 sm:px-0'>
            
            {/* Primary CTA */}
            <Link href="/preference" className='w-full sm:w-auto'>
              <Button
                green={true}
                className='w-full sm:w-auto min-h-[48px] sm:min-h-[56px] px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold text-white bg-[#8DDB90] hover:bg-[#7BC87F] transition-all duration-300 transform hover:scale-105 shadow-lg text-center flex items-center justify-center whitespace-nowrap'>
                <span className="block leading-tight">Submit Your Property Preference</span>
              </Button>
            </Link>

            {/* Secondary CTA */}
            <Link href="/market-place" className='w-full sm:w-auto'>
              <Button
                className='w-full sm:w-auto min-h-[48px] sm:min-h-[56px] px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold text-white border-2 border-white hover:bg-white hover:text-[#0B423D] transition-all duration-300 text-center flex items-center justify-center whitespace-nowrap'>
                <span className="block leading-tight">Browse Properties</span>
              </Button>
            </Link>
          </motion.div>

          {/* Hero video slider with autoplay - show skeleton while settings or videos are loading */}
          {settingsLoading || heroVideos.length === 0 ? (
            <div className='mt-8 sm:mt-12 md:mt-16 relative px-4 sm:px-0'>
              <div className='bg-white/5 rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto border border-white/20'>
                <div className='aspect-video rounded-lg bg-gray-200 animate-pulse'></div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className='mt-8 sm:mt-12 md:mt-16 relative px-4 sm:px-0'>
              <div className='bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto border border-white/20'>

                {/* Video Slider Container */}
                <div className="embla relative" ref={(el) => { emblaRef(el); containerRef.current = el; }} onClick={handleEmblaContainerClick}>
                  <div className="embla__container flex">
                    {heroVideos.map((videoUrl, index) => (
                      <div key={index} className="embla__slide flex-[0_0_100%] min-w-0" data-embla-index={index}>
                        <div className='aspect-video bg-gradient-to-br from-white/20 to-white/5 rounded-lg sm:rounded-xl relative overflow-hidden group'>
                          {/* Show skeleton until this video's media is ready */}
                          {!videoReady[index] && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-30">
                              <div className="w-3/4 h-3/4 bg-white/5 rounded-lg flex items-center justify-center">
                                <div className="text-gray-400">Loading video...</div>
                              </div>
                            </div>
                          )}

                          {/* Dynamic video from system settings */}
                          <video
                            ref={(el) => {
                              videoRefs.current[index] = el;
                            }}
                            className="w-full h-full object-cover cursor-pointer"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster="/placeholder-property.svg"
                            data-embla-action="toggle" data-embla-index={index}
                            onClick={(e) => handlePlayPause(e, index, e.currentTarget as HTMLVideoElement)}
                            onEnded={handleVideoEnded}
                            // mark ready when canplay/loadeddata fire on the element
                            onCanPlay={() => setVideoReady(prev => { const copy = [...prev]; copy[index] = true; return copy; })}
                            onLoadedData={() => setVideoReady(prev => { const copy = [...prev]; copy[index] = true; return copy; })}
                          >
                            <source src={videoUrl} type="video/mp4" />
                            {/* Fallback content if video fails to load */}
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <div className='text-center'>
                                <div className='w-12 sm:w-16 h-12 sm:h-16 bg-[#8DDB90] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                                  <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className='text-white/80 text-xs sm:text-sm'>Watch how Khabiteq works</p>
                                <p className='text-white/60 text-xs mt-1'>Video {index + 1} of {heroVideos.length}</p>
                              </div>
                            </div>
                          </video>

                          {/* Video Controls Overlay */}
                          <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
                            {/* Main play/pause button */}
                            <div
                              className='absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto'
                              data-embla-action="toggle" data-embla-index={index}>
                              <div className='w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-200'>
                                {!isIndexPlaying(index) ? (
                                  // Play icon (shown when video is paused)
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  // Pause icon (shown when video is playing)
                                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Control buttons container */}
                            <div className='absolute bottom-4 right-4 flex gap-2 pointer-events-auto'>
                              {/* Play/Pause button */}
                              <button
                                data-embla-action="toggle" data-embla-index={index}
                                className='w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-200 bg-black/50 hover:bg-black/70'
                                title={isIndexPlaying(index) ? 'Pause video' : 'Play video'}>
                                {!isIndexPlaying(index) ? (
                                  // Play icon (shown when video is paused)
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  // Pause icon (shown when video is playing)
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1zm4-1a1 1 0 00-1 1v4a1 1 0 002 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>

                              {/* Mute/Unmute button */}
                              <button
                                data-embla-action="mute" data-embla-index={index}
                                className='w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-200'>
                                {isMuted ? (
                                  // Muted icon
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.792L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.792a1 1 0 011.617-.792zM12.22 6.22a1 1 0 011.414 0L15 7.586l1.364-1.364a1 1 0 111.414 1.414L16.414 9l1.364 1.364a1 1 0 11-1.414 1.414L15 10.414l-1.364 1.364a1 1 0 11-1.414-1.414L13.586 9l-1.364-1.364a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  // Unmuted icon
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.792L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.792a1 1 0 011.617-.792zM12 6a1 1 0 011 1v6a1 1 0 01-2 0V7a1 1 0 011-1zm3-1a1 1 0 000 2 3 3 0 010 6 1 1 0 000 2 5 5 0 000-10z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Status indicator */}
                          <div className='absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                            {isIndexPlaying(index) ? 'Playing' : 'Paused'} • Video {index + 1} of {heroVideos.length}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows - only show if more than 1 video */}
                  {heroVideos.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        className="embla__prev absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors duration-200 z-10"
                        onClick={scrollPrev}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Next Button */}
                      <button
                        className="embla__next absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors duration-200 z-10"
                        onClick={scrollNext}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Dots Indicator - only show if more than 1 video */}
                  {heroVideos.length > 1 && (
                    <div className="embla__dots flex justify-center gap-2 mt-4">
                      {heroVideos.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            index === currentVideoIndex
                              ? 'bg-[#8DDB90]'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                          onClick={() => emblaApi?.scrollTo(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className='mt-8 sm:mt-10 md:mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-white/60 text-xs sm:text-sm px-4'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-[#8DDB90] rounded-full'></div>
              <span>Verified Properties</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-[#8DDB90] rounded-full'></div>
              <span>Trusted Agents</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-[#8DDB90] rounded-full'></div>
              <span>Secure Transactions</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('NewHeroSection render error', err);
    return (
      <div className="w-full min-h-[600px] bg-[#0B423D] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Find the Perfect Property</h1>
          <p className="text-xl">Unable to load hero section: see console for details.</p>
        </div>
      </div>
    );
  }
};

export default NewHeroSection;
