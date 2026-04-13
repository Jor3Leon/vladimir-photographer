import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * Sección Hero (Presentación).
 * Es la primera sección que ve el usuario, diseñada para impresionar y enganchar.
 * Incluye efectos de paralaje suaves.
 */
const Hero = ({ content }) => {
  const { scrollY } = useScroll();
  
  // Desplazamientos suaves de paralaje
  const yText = useTransform(scrollY, [0, 800], [0, -100]);
  const yImage = useTransform(scrollY, [0, 800], [0, -80]);
  const opacityText = useTransform(scrollY, [0, 500], [1, 0.4]);
  const rotateDecorative = useTransform(scrollY, [0, 1000], [0, 120]);

  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="container mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Lado del Texto Informativo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ y: yText, opacity: opacityText }}
            className="order-2 lg:order-1"
          >
            <span className="text-[#d4a373] font-medium tracking-[0.4em] uppercase block mb-6 text-sm">Bienvenido</span>
            <h1 className="text-4xl md:text-7xl xl:text-8xl font-bold mb-8 leading-[1.1]">
              {content.name} <br />
              <span className="text-stroke text-transparent">{content.title}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-xl leading-relaxed">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-6">
              <a
                href="#galería"
                className="group px-10 py-5 border border-[#8b5e34] text-[#d4a373] hover:bg-[#8b5e34] hover:text-white transition-all duration-300 font-bold uppercase tracking-widest flex items-center gap-3 rounded-xl shadow-lg hover:-translate-y-1"
              >
                {content.cta} <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Lado de la Imagen Principal */}
          <motion.div
            className="order-1 lg:order-2 relative"
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: yImage }}
          >
            <div className="relative z-10 aspect-square max-w-[500px] mx-auto xl:max-w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <img
                src={content.image}
                alt={content.name}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                loading="eager" // La primera imagen cargada debe ser prioritaria
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120d09]/80 via-transparent to-transparent"></div>
            </div>
            {/* Elemento Decorativo Flotante */}
            <motion.div 
              style={{ rotate: rotateDecorative }}
              className="absolute -top-10 -right-10 w-40 h-40 border border-[#8b5e34]/30 rounded-full z-0 pointer-events-none"
            ></motion.div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#8b5e34]/5 rounded-full blur-3xl z-0"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
