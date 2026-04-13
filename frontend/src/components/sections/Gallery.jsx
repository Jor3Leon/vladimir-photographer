import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Cuadrícula de fotos individual con efectos de hover.
 */
const GalleryGrid = ({ photos }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {photos.map((item, idx) => (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.1 }}
        viewport={{ once: true }}
        className="group relative aspect-[3/4] overflow-hidden cursor-pointer bg-white/5 backdrop-blur-sm focus:outline-none rounded-2xl"
        tabIndex={0}
      >
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
          loading="lazy" // Optimización: Carga diferida
        />
        {/* Superposición informativa al pasar el cursor */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120d09] to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
          <span className="text-[#d4a373] text-xs uppercase tracking-tighter mb-1">{item.category}</span>
          <h3 className="text-lg font-bold">{item.title}</h3>
        </div>
      </motion.div>
    ))}
  </div>
);

/**
 * Sección de Galería del Portafolio.
 * Muestra una vista previa de los mejores trabajos y permite navegar a la galería completa.
 */
const Gallery = ({ photos }) => {
  return (
    <section id="galería" className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="text-[#d4a373] tracking-[0.2em] uppercase mb-2 block">Portafolio</span>
            <h2 className="text-5xl font-bold uppercase">
              Momentos <span className="text-stroke text-transparent">Capturados</span>
            </h2>
          </div>
        </div>
        
        {/* Renderizado de la cuadrícula */}
        <GalleryGrid photos={photos} />

        {/* Botón para ver más fotos */}
        <div className="flex justify-center mt-12">
          <Link
            to="/galeria"
            className="group px-8 py-4 border border-[#8b5e34] text-[#d4a373] hover:bg-[#8b5e34] hover:text-white transition-all duration-300 font-bold uppercase tracking-widest flex items-center gap-3 rounded-xl"
          >
            Ver Galería Completa
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
export { GalleryGrid };
