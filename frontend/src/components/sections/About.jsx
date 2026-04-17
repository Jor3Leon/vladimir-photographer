import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, MapPin, MousePointer2, X } from 'lucide-react';

/**
 * Sección Quién Soy.
 * Presenta una tarjeta interactiva con efecto de rotación y barras de habilidades.
 */
const About = ({ content, skills }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { scrollY } = useScroll();
  const yDecor = useTransform(scrollY, [500, 1500], [0, -100]);

  return (
    <section id="quién-soy" className="py-24 relative overflow-hidden">
      {/* Fondo Decorativo con paralaje */}
      <motion.div 
        style={{ y: yDecor }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8b5e34]/5 rounded-full blur-[120px] -z-10"
      ></motion.div>

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Contenedor de la Tarjeta Interactiva */}
          <div
            className="about-card-container group perspective-2000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="relative w-full h-full preserve-3d shadow-2xl"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {/* Lado Frontal de la Tarjeta */}
              <div className="about-card-front border border-white/10 group-hover:border-[#8b5e34]/30">
                <motion.div
                  className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 border border-white/10 text-white/80 text-[10px] uppercase tracking-widest px-3 py-2 rounded-full backdrop-blur"
                  initial={{ opacity: 0.6, y: -4 }}
                  animate={{ opacity: [0.6, 1, 0.6], y: [-4, 0, -4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MousePointer2 size={12} className="text-[#d4a373]" />
                  Click para girar
                </motion.div>
                <img
                  src={content.image}
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  alt="Vladimir"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d09] via-[#120d09]/20 to-transparent flex flex-col justify-end p-6 md:p-16">
                  <motion.div animate={{ y: isFlipped ? 50 : 0, opacity: isFlipped ? 0 : 1 }}>
                    <span className="text-[#d4a373] font-medium tracking-[0.2em] md:tracking-[0.4em] uppercase block mb-3 text-[10px] md:text-sm">El Artista Detrás del Lente</span>
                    <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-tighter leading-none mb-4 md:mb-6">
                      Quién <span className="text-stroke text-transparent">Soy</span>
                    </h2>
                    <div className="flex items-center gap-3 md:gap-4 text-white/50 group-hover:text-[#d4a373] transition-colors">
                      <div className="w-8 md:w-12 h-[1px] bg-current"></div>
                      <span className="text-[10px] uppercase tracking-widest font-bold">Toca para descubrir</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Lado Posterior de la Tarjeta (Habilidades y Biografía) */}
              <div
                className="about-card-back border border-white/10 bg-[#120d09]/70 backdrop-blur-xl p-6 md:p-12 lg:p-16 flex flex-col justify-center"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="overflow-y-auto h-full pr-2">
                  <div className="flex flex-col gap-8 py-2">
                    <div className="space-y-4 md:space-y-6">
                      <div>
                        <span className="text-[#d4a373] font-medium tracking-[0.3em] uppercase block mb-2 text-[10px]">Biografía</span>
                        <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-widest mb-4">{content.title}</h2>
                        <div className="w-16 md:w-20 h-1 bg-[#8b5e34] mb-4"></div>
                      </div>
                      <p className="text-sm md:text-base lg:text-lg text-white/70 leading-relaxed font-light">{content.content}</p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                          <Camera size={14} className="text-[#8b5e34]" />
                          <span className="text-[10px] font-medium">{content.badge1 || '10+ Años Exp.'}</span>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                          <MapPin size={14} className="text-[#8b5e34]" />
                          <span className="text-[10px] font-medium">{content.badge2 || 'Global Work'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Barras de Habilidades */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h3 className="text-base md:text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                        Habilidades <span className="text-[#d4a373]">&</span> Técnica
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {skills.map(skill => (
                          <div key={skill.name}>
                            <div className="flex justify-between mb-2 items-end">
                              <span className="font-bold text-[9px] uppercase tracking-widest">{skill.name}</span>
                              <span className="text-[#d4a373] font-bold text-xs">{skill.level}%</span>
                            </div>
                            <div className="h-1 bg-white/5 overflow-hidden rounded-full">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: isFlipped ? `${skill.level}%` : 0 }}
                                transition={{ duration: 1.5, delay: 0.3, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-[#8b5e34] to-[#d4a373]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-3 text-white/20 hover:text-[#d4a373] transition-colors">
                  <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-right leading-tight hidden sm:block">Click para<br />volver</span>
                  <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                    <X size={12} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
