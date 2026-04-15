import React from 'react';
import { motion } from 'framer-motion';
import { Film, PlayCircle } from 'lucide-react';

function getEmbedUrl(url) {
  if (!url) return '';

  const trimmed = url.trim();
  if (/\.mp4(\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return trimmed;
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function VideoFrame({ video, index }) {
  const resolvedUrl = getEmbedUrl(video.url);
  const isVideoFile = /\.mp4(\?.*)?$/i.test(resolvedUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 }}
      viewport={{ once: true }}
      className="bg-[#1e1610] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
    >
      <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[#d4a373] text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <Film size={12} />
            Video {index + 1}
          </p>
          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight">
            {video.title || `Presentación ${index + 1}`}
          </h3>
        </div>
        <PlayCircle className="text-[#8b5e34] opacity-70" size={28} />
      </div>

      <div className="aspect-video bg-black">
        {isVideoFile ? (
          <video
            src={resolvedUrl}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <iframe
            src={resolvedUrl}
            title={video.title || `Video ${index + 1}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
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
            <span className="text-[#d4a373] tracking-[0.2em] uppercase mb-2 block">Multimedia</span>
            <h2 className="text-5xl font-bold uppercase">
              Videos <span className="text-stroke text-transparent">Destacados</span>
            </h2>
          </div>
          <p className="max-w-2xl text-white/50 leading-relaxed">
            Una selección breve de piezas audiovisuales para complementar la experiencia visual del portafolio.
          </p>
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
