import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

let youtubeApiPromise = null;

function loadYouTubeApi() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const existingScript = document.querySelector('script[data-youtube-iframe-api="true"]');
      if (existingScript) {
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
        return;
      }

      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.setAttribute('data-youtube-iframe-api', 'true');
      document.head.appendChild(script);
    });
  }

  return youtubeApiPromise;
}

function normalizeVideoUrl(url) {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : trimmed;
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        const videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0];
        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : trimmed;
      }

      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : trimmed;
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const match = parsed.pathname.match(/\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : trimmed;
    }

    if (parsed.hostname.includes('drive.google.com')) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (fileMatch) {
        return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      }

      const id = parsed.searchParams.get('id');
      return id ? `https://drive.google.com/file/d/${id}/preview` : trimmed;
    }

    if (parsed.hostname.includes('dropbox.com')) {
      const nextUrl = new URL(trimmed);
      nextUrl.searchParams.delete('dl');
      nextUrl.searchParams.set('raw', '1');
      return nextUrl.toString();
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function getVideoKind(url) {
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return 'file';
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com')) return 'youtube';
  if (url.includes('vimeo.com') || url.includes('drive.google.com') || url.includes('dropbox.com')) return 'embed';
  return 'external';
}

function getYouTubeId(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '');
    }

    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtube-nocookie.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
      }

      return parsed.searchParams.get('v') || '';
    }
  } catch {
    return '';
  }

  return '';
}

function YouTubeThumb({ video, resolvedUrl }) {
  const videoId = getYouTubeId(video.url || resolvedUrl);
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  const openUrl = video.url?.trim() || resolvedUrl;

  return (
    <a
      href={openUrl}
      target="_blank"
      rel="noreferrer"
      className="relative block w-full h-full group bg-black"
    >
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={video.title || 'Video'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-2xl">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white/85 translate-x-0.5">
            <path fill="currentColor" d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </a>
  );
}

function YouTubePlayer({ video, resolvedUrl }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const [loadState, setLoadState] = useState('loading');
  const videoId = getYouTubeId(video.url || resolvedUrl);
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };

    if (!videoId || !mountRef.current) {
      setLoadState('error');
      return cleanup;
    }

    setLoadState('loading');

    loadYouTubeApi().then((YT) => {
      if (cancelled || !YT || !mountRef.current) return;

      cleanup();

      playerRef.current = new YT.Player(mountRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: () => {
            if (!cancelled) setLoadState('ready');
          },
          onError: () => {
            if (!cancelled) setLoadState('error');
          }
        }
      });
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [videoId]);

  if (loadState === 'error') {
    return (
      <YouTubeThumb video={video} resolvedUrl={resolvedUrl} />
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" />
      {loadState === 'loading' && (
        <div className="absolute inset-0 bg-black/70">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={video.title || 'Video'}
              className="w-full h-full object-cover opacity-35"
              loading="lazy"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-2xl">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white/85 translate-x-0.5">
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoFrame({ video, index }) {
  const resolvedUrl = normalizeVideoUrl(video.url);
  const rawUrl = video.url || '';
  const kind = getVideoKind(rawUrl);
  const isVideoFile = kind === 'file';
  const hasYouTubeId = Boolean(getYouTubeId(rawUrl) || getYouTubeId(resolvedUrl));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 }}
      viewport={{ once: true }}
      className="bg-[#1e1610] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
    >
      <div className="aspect-video bg-black">
        {isVideoFile ? (
          <video
            src={resolvedUrl}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        ) : hasYouTubeId ? (
          <YouTubePlayer video={video} resolvedUrl={resolvedUrl} />
        ) : kind === 'embed' ? (
          <iframe
            src={resolvedUrl}
            title={video.title || `Video ${index + 1}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : null}
      </div>
    </motion.div>
  );
}

export default function Videos({ videos = [] }) {
  if (!videos.length) return null;

  return (
    <section id="videos" className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-white/45 tracking-[0.2em] uppercase mb-2 block">Multimedia</span>
            <h2 className="text-5xl font-bold uppercase">
              Videos <span className="text-stroke text-transparent">Destacados</span>
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {videos.slice(0, 2).map((video, index) => (
            <VideoFrame key={video.id ?? index} video={video} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
