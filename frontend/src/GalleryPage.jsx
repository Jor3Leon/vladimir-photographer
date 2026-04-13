/**
 * GalleryPage.jsx - Visualizador de la galería completa.
 * 
 * Este componente permite al usuario navegar por todas las fotografías filtradas por categorías
 * y visualizarlas en detalle mediante un Lightbox interactivo.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from './api';

/**
 * Componente Lightbox (Superposición de imagen a pantalla completa).
 * Maneja la navegación entre fotos mediante flechas y teclado.
 */
const Lightbox = ({ photo, onClose, onNext, onPrev }) => {
  // Manejo de eventos de teclado para accesibilidad y usabilidad
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 touch-none"
    >
      {/* Fondo cerrable al hacer clic */}
      <div className="absolute inset-0 z-0" onClick={onClose}></div>
      
      {/* Botón de cerrar */}
      <button 
        className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 hover:text-white transition-all hover:rotate-90 z-20 p-2"
        onClick={onClose}
      >
        <X size={40} />
      </button>

      {/* Navegación lateral (Siguiente / Anterior) */}
      <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none z-10">
        <button 
          className="p-4 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all pointer-events-auto active:scale-90"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Anterior"
        >
          <ChevronLeft size={48} />
        </button>
        <button 
          className="p-4 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all pointer-events-auto active:scale-90"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Siguiente"
        >
          <ChevronRight size={48} />
        </button>
      </div>

      {/* Contenedor de la imagen ampliada */}
      <div className="relative z-10 max-w-full max-h-full flex flex-col items-center select-none">
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.url}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            src={photo.url}
            alt={photo.title}
            className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/5"
          />
        </AnimatePresence>
        
        {/* Información de la foto en el Lightbox */}
        <motion.div 
          key={`info-${photo.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-[#8b5e34] text-xs uppercase tracking-[0.4em] mb-2">{photo.category}</p>
          <h3 className="text-xl md:text-2xl font-bold tracking-widest uppercase">{photo.title}</h3>
        </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Página Principal de la Galería.
 */
export default function GalleryPage() {
  // --- Estados ---
  const [content, setContent] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // --- Carga de Datos ---
  useEffect(() => {
    api.fetchContent()
      .then(json => setContent(json))
      .catch(err => {
        console.error('Error al cargar contenido:', err);
        setLoadError('No se pudo cargar la galería. Revisa la conexión del servidor.');
      });
  }, []);

  // --- Lógica de Procesamiento de Fotos ---
  
  // Aplanar todas las fotos en una sola lista para el visualizador
  const allPhotos = useMemo(() => {
    if (!content) return [];
    const categorized = Array.isArray(content.categorized_gallery) ? content.categorized_gallery : [];
    const fallbackGallery = Array.isArray(content.gallery) ? content.gallery : [];
    
    return categorized.length > 0
      ? categorized.flatMap(cat => (Array.isArray(cat.photos) ? cat.photos : [])
        .map(p => ({ ...p, category: cat.category })))
      : fallbackGallery.map(p => ({ ...p, category: p.category || 'Galería' }));
  }, [content]);

  // Extraer categorías únicas
  const categories = useMemo(() => {
    if (!content) return ['Todos'];
    const categorized = Array.isArray(content.categorized_gallery) ? content.categorized_gallery : [];
    return categorized.length > 0
      ? ['Todos', ...categorized.map(cat => cat.category)]
      : ['Todos'];
  }, [content]);

  // Filtrar fotos según la categoría activa
  const filteredPhotos = useMemo(() => {
    return activeCategory === 'Todos'
      ? allPhotos
      : allPhotos.filter(p => p.category === activeCategory);
  }, [activeCategory, allPhotos]);

  // --- Manejadores de Navegación del Lightbox ---
  const handleNext = useCallback(() => {
    if (!selectedPhoto || filteredPhotos.length === 0) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[nextIndex]);
  }, [selectedPhoto, filteredPhotos]);

  const handlePrev = useCallback(() => {
    if (!selectedPhoto || filteredPhotos.length === 0) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[prevIndex]);
  }, [selectedPhoto, filteredPhotos]);

  // Pantalla de carga inicial
  if (!content) return (
    <div className="min-h-screen bg-[#120d09] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#8b5e34]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#120d09] text-white overflow-x-hidden">
      <div className="dynamic-bg fixed inset-0 z-0"></div>

      {/* Cabecera de la Galería */}
      <nav className="relative z-10 p-6 md:p-8 flex justify-between items-center border-b border-white/5 bg-[#120d09]/40 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase font-bold tracking-widest text-xs md:text-sm">Volver al Inicio</span>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold tracking-tighter hidden sm:block">GALERÍA COMPLETA</h1>
      </nav>

      {/* Contenido Principal */}
      <main className="relative z-10 container mx-auto px-6 py-12 md:py-20 text-center">
        {/* Título de la sección */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12 md:mb-20"
        >
          <span className="text-[#8b5e34] tracking-[0.5em] uppercase text-xs block mb-4">Portafolio</span>
          <h2 className="text-4xl md:text-7xl font-bold uppercase leading-none">
            Momentos <span className="text-stroke text-transparent" style={{ WebkitTextStroke: '1px white' }}>Eternos</span>
          </h2>
        </motion.div>

        {/* Filtros por Categoría */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-6 mb-12 md:mb-16">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold transition-all duration-300 rounded-full border ${activeCategory === cat ? 'bg-[#8b5e34] border-[#8b5e34] text-white shadow-lg' : 'border-white/10 text-white/30 hover:text-white hover:border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Manejo de Errores */}
        {loadError && (
          <div className="mb-8 text-center text-red-500 font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">{loadError}</div>
        )}

        {/* Listado de Fotos */}
        {filteredPhotos.length === 0 ? (
          <div className="py-20 text-center text-white/20 uppercase tracking-widest">
            No hay fotografías en esta sección
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-square overflow-hidden cursor-pointer bg-white/5 backdrop-blur-sm rounded-3xl border border-white/5 hover:border-[#8b5e34]/50 transition-all duration-500"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120d09] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <div className="text-left w-full">
                       <p className="text-[9px] text-[#d4a373] uppercase tracking-[0.3em] mb-1">{photo.category}</p>
                       <p className="font-bold text-sm tracking-widest">{photo.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Overlay del Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <Lightbox 
            photo={selectedPhoto} 
            onClose={() => setSelectedPhoto(null)} 
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </AnimatePresence>

      {/* Pie de Página Minimalista */}
      <footer className="relative z-10 py-20 text-center">
        <div className="w-12 h-[1px] bg-[#8b5e34] mx-auto mb-8 opacity-30"></div>
        <p className="text-white/10 uppercase tracking-[0.5em] text-[10px]">
          Vladimir Photography &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
