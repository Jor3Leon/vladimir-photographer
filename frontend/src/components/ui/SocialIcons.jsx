import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Music, MessageCircle } from 'lucide-react';

/**
 * Componente que muestra los iconos de redes sociales con efecto 3D.
 * Memoizado para evitar renderizados innecesarios.
 */
const Social3DIcons = React.memo(({ social }) => {
  // Lista de plataformas sociales activas
  const platforms = [
    { name: 'facebook', icon: <Facebook size={24} />, url: social?.facebook },
    { name: 'instagram', icon: <Instagram size={24} />, url: social?.instagram },
    { name: 'tiktok', icon: <Music size={24} />, url: social?.tiktok },
    { name: 'whatsapp', icon: <MessageCircle size={24} />, url: social?.whatsapp },
  ];

  return (
    <div className="social-container mb-8">
      {platforms.map((p) => (
        <motion.a
          key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
          className="social-3d-icon" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        >
          {p.icon}
        </motion.a>
      ))}
    </div>
  );
});

export default Social3DIcons;
