/**
 * Landing.jsx - Página de inicio del portafolio del fotógrafo Vladimir.
 * 
 * Esta página centraliza todas las secciones del sitio web, coordinando
 * la carga de contenido desde la API y la gestión de la navegación interna.
 */

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { api } from './api';

// --- Importación de Componentes Organizados por Directorios ---
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Gallery from './components/sections/Gallery';
import Videos from './components/sections/Videos';
import Plans from './components/sections/Plans';
import Contact from './components/sections/Contact';
import Social3DIcons from './components/ui/SocialIcons';

/**
 * Componente Principal de la Landing Page.
 */
export default function Landing() {
  // --- Estados del Componente ---
  const [content, setContent] = useState(null);
  const [selectedPlanMessage, setSelectedPlanMessage] = useState('');
  
  // --- Efectos de Paralaje Globales para el Fondo ---
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 2000], [0, 400]);

  /**
   * Maneja la selección de un plan de servicio.
   * Scrollea suavemente hasta el formulario de contacto con un mensaje pre-cargado.
   * @param {string} planName - Nombre del plan seleccionado.
   */
  const handleSelectPlan = (planName) => {
    setSelectedPlanMessage(`Hola Vladimir, estoy interesado en reservar el Plan ${planName}. ¿Podrías darme más información?`);
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /**
   * Efecto de Carga Inicial.
   * Obtiene todo el contenido dinámico del portafolio desde la API del backend.
   */
  useEffect(() => {
    api.fetchContent()
      .then(json => setContent(json))
      .catch(err => {
        console.error('Error al obtener el contenido:', err);
        // Podríamos setear un estado de error aquí si fuera necesario
      });
  }, []);

  // --- Pantalla de Carga (Loader Premium) ---
  if (!content) {
    return (
      <div className="min-h-screen bg-[#120d09] flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8b5e34]"></div>
          <div className="absolute text-[8px] font-bold text-[#8b5e34] uppercase tracking-widest animate-pulse">
            Vladimir
          </div>
        </div>
      </div>
    );
  }

  // --- Renderizado de la Estructura de la Página ---
  return (
    <div className="relative">
      {/* Fondo dinámico con movimiento de paralaje para profundidad visual */}
      <motion.div style={{ y: bgY }} className="dynamic-bg"></motion.div>

      {/* Componentes Principales */}
      <Navbar />
      
      <main>
        {/* Sección de Bienvenida */}
        <Hero content={content.hero} />

        {/* Sección de Biografía y Habilidades */}
        <About content={content.about} skills={content.skills} />

        {/* Sección de Portafolio / Galería */}
        <Gallery photos={content.gallery} />

        {/* Sección de Videos Destacados */}
        <Videos videos={Array.isArray(content.videos) ? content.videos : []} />

        {/* Sección de Experiencia Profesional */}
        <div className="container mx-auto px-6 py-24">
          <h2 className="text-4xl font-bold mb-16 text-center uppercase tracking-widest">Experiencia</h2>
          <div className="grid gap-8">
            {content.experiences.map((exp, idx) => (
              <motion.div
                key={idx} 
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }} 
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-8 pb-8 border-b border-white/5 last:border-0"
              >
                <span className="text-4xl font-bold text-[#8b5e34] opacity-50">{exp.year}</span>
                <div>
                  <h3 className="text-xl font-bold">{exp.title}</h3>
                  <p className="text-white/40">{exp.place}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sección de Planes y Servicios */}
        <Plans plans={content.plans} onSelectPlan={handleSelectPlan} />

        {/* Sección de Contacto */}
        <Contact contact={content.contact} initialMessage={selectedPlanMessage} />
      </main>

      {/* Pie de Página */}
      <footer className="py-20 text-center">
        <Social3DIcons social={content.contact.social} />
        <p className="text-white/20 text-sm uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Vladimir Photography. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
