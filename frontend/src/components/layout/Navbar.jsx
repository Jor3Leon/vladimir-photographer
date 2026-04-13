import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mail, Phone, MapPin, Image, Briefcase, Home, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Componente de navegación principal.
 * Maneja el menú responsivo, efectos de scroll y enlaces internos.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para cambiar el color del fondo al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Elementos de navegación
  const navItems = [
    { name: 'Inicio', icon: <Home size={20} />, href: '#inicio' },
    { name: 'Quién Soy', icon: <User size={20} />, href: '#quién-soy' },
    { name: 'Galería', icon: <Image size={20} />, href: '#galería' },
    { name: 'Servicios', icon: <Briefcase size={20} />, href: '#servicios' },
    { name: 'Contacto', icon: <Mail size={20} />, href: '#contacto' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#120d09]/80 backdrop-blur-lg py-4 shadow-2xl' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="relative flex items-center group">
            {/* Acceso para administradores (oculto visualmente pero funcional) */}
            <Link
              to="/admin"
              className="absolute -left-5 md:-left-8 w-14 h-14 md:w-20 md:h-20 z-30 rounded-full cursor-default"
              aria-label="Admin Access"
            />
            <Camera
              className="w-9 h-9 md:w-11 md:h-11 text-[#8b5e34] absolute -left-4 md:-left-5 opacity-10 transition-all duration-700 group-hover:opacity-40 group-hover:scale-125 group-hover:rotate-12 z-10"
            />
            <Link to="/" className="text-xl md:text-2xl font-bold tracking-widest relative z-20 pl-2 hover:text-[#d4a373] transition-colors">
              VLADIMIR
            </Link>
          </div>

          {/* Menú para pantallas grandes */}
          <div className="hidden lg:flex gap-10 text-[10px] font-bold uppercase tracking-[0.4em]">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="hover:text-[#d4a373] transition-all duration-300 relative group">
                {item.name}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#8b5e34] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Botón de menú móvil */}
          <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-all active:scale-95 group" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6 md:w-7 md:h-7 text-[#8b5e34]" /> : <Camera className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:text-[#d4a373] transition-colors" />}
          </button>
        </div>

        {/* Panel de navegación móvil expandible */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-[#1e1610]/95 backdrop-blur-2xl p-8 rounded-2xl flex flex-col gap-5 items-center lg:hidden border border-white/10 shadow-2xl"
            >
              {navItems.map((item, idx) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-4 group text-center w-full"
                >
                  <span className="text-[#8b5e34] text-sm opacity-50">0{idx + 1}</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">{item.name}</span>
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Dock de navegación inferior para móviles */}
      <div className="fixed inset-x-0 bottom-8 z-[100] lg:hidden">
        <div className="mx-auto w-[min(90vw,420px)] px-0">
          <div className="bg-[#1e1610]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="p-4 text-white/40 hover:text-[#d4a373] hover:bg-white/5 rounded-xl transition-all duration-300 transform active:scale-90"
                title={item.name}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
