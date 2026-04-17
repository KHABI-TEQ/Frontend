/** @format */

'use client';
import React, { useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FeatureCardProps {
  feature: {
    id: number;
    title: string;
    headline?: string;
    description: string;
    bullets?: string[];
    videoThumbnail?: string;
    videoUrl?: string;
    link: string;
    icon: React.ReactNode;
    color: string;
    btnCTA: string;
  };
  index: number;
  loading: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index, loading }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayPending, setIsPlayPending] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  // reset thumbnail when feature changes
  React.useEffect(() => {
    setThumbnailLoaded(false);
    // Fallback: hide skeleton after 3 seconds if image doesn't load
    const timeout = setTimeout(() => {
      setThumbnailLoaded(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [feature.videoThumbnail, feature.videoUrl]);

  const pauseAllOtherVideos = () => {
    
    const allVideos = document.querySelectorAll<HTMLVideoElement>('.feature-card video');
    allVideos.forEach(video => {
      if (video !== videoRef.current && !video.paused) {
        video.pause();
      }
    });

  };

  const handlePlayPause = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!videoRef.current || isPlayPending) return;

    try {
      if (videoRef.current.paused) {
        setIsPlayPending(true);
        // Start playing current video first
        await videoRef.current.play();
        // Then pause others to avoid flicker
        pauseAllOtherVideos();
        setIsPlayPending(false);
        // State will be updated by onPlay event
      } else {
        videoRef.current.pause();
        // State will be updated by onPause event
      }
    } catch (error) {
      console.log('Video control failed:', error);
      setIsPlayPending(false);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: "-50px" }}
      className="group h-full"
    >
      <Link href={feature.link} className="block h-full">
        <div className="feature-card bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] transition-all duration-300 border border-gray-100/80 hover:border-gray-200 cursor-pointer h-full flex flex-col hover:-translate-y-1">
          {/* Video Thumbnail/Preview */}
          <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-5 relative overflow-hidden flex-shrink-0 ring-1 ring-black/5">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : feature.videoUrl ? (
              <>
                {/* Show thumbnail skeleton until the thumbnail image loads */}
                {!thumbnailLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 z-20 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                )}

                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={feature.videoThumbnail}
                  preload="metadata"
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  controls={false} // custom controls only
                >
                  <source src={feature.videoUrl} type="video/mp4" />
                </video>
                {/* Fallback thumbnail image in case video poster fails; used to detect load completion */}
                <img
                  src={feature.videoThumbnail}
                  alt={feature.title}
                  onLoad={() => setThumbnailLoaded(true)}
                  onError={() => setThumbnailLoaded(true)}
                  className="w-full h-full object-cover absolute inset-0 -z-10 transition-opacity duration-300"
                  style={{ opacity: isPlaying ? 0 : 1 }}
                />
              </>
            ) : (
              <img
                src={feature.videoThumbnail || "/placeholder-property.svg"}
                alt={feature.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-property.svg";
                }}
              />
            )}

            {/* Overlay Controls */}
            {feature.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-all duration-300">
                {!isPlaying && !loading && (
                  <button
                    onClick={handlePlayPause}
                    disabled={isPlayPending}
                    className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl ${isPlayPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}

                {isPlaying && (
                  <button
                    onClick={handlePlayPause}
                    disabled={isPlayPending}
                    className="absolute bottom-3 left-3 w-9 h-9 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-200 hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFullscreen();
                  }}
                  className="absolute bottom-3 right-3 w-9 h-9 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-200 hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 3h6v2H5v4H3V3zm14 0h-6v2h4v4h2V3zm-6 14h6v-6h-2v4h-4v2zM3 17h6v-2H5v-4H3v6z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Content Container */}
          <div className="flex-grow flex flex-col">
            {/* Icon */}
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-sm`}
            >
              <span className="w-5 h-5 sm:w-6 sm:h-6">{feature.icon}</span>
            </div>

            {/* Headline */}
            {feature.headline && (
              <h3 className="text-base sm:text-lg font-bold text-[#09391C] mb-1 group-hover:text-[#0B423D] transition-colors duration-300 tracking-tight leading-tight">
                {feature.headline}
              </h3>
            )}

            {/* Title */}
            <p className="text-xs sm:text-sm font-semibold text-[#8DDB90] uppercase tracking-wider mb-3">
              {feature.title}
            </p>

            {/* Description */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
              {feature.description}
            </p>

            {/* Bullets */}
            {feature.bullets && feature.bullets.length > 0 && (
              <ul className="space-y-2 mb-5 flex-grow">
                {feature.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-[#8DDB90] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Link/Button */}
            <div className="flex items-center gap-2 text-[#09391C] group-hover:text-[#8DDB90] transition-colors duration-300 mt-auto">
              <span className="font-semibold text-sm sm:text-base">{feature.btnCTA}</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default memo(FeatureCard);
