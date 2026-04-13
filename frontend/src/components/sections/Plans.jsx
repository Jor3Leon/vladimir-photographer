import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * Etiqueta de descuento/oferta flotante con animación.
 */
const DiscountTag = ({ amount }) => (
  <motion.div
    initial={{ scale: 0, rotate: -20 }}
    animate={{ scale: 1, rotate: -5 }}
    className="absolute -top-4 -right-2 z-20 pointer-events-none drop-shadow-xl"
  >
    <div className="relative group">
      <div className="bg-red-600 w-12 h-16 rounded-lg relative flex flex-col items-center justify-center border-2 border-red-500 shadow-[2px_4px_10px_rgba(0,0,0,0.3)]">
        <div className="absolute top-2 w-3 h-3 bg-[#120d09] rounded-full border border-red-400"></div>
        <div className="mt-4 flex flex-col items-center leading-none">
          <span className="text-[8px] uppercase font-black text-white/70">OFERTA</span>
          <span className="text-sm font-black text-white">{amount}</span>
        </div>
        <div className="absolute -right-2 bottom-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-200 shadow-md flex items-center justify-center">
          <span className="text-yellow-800 text-[10px] font-black">$</span>
        </div>
      </div>
      <div className="absolute top-0 right-1/2 w-4 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-full -translate-y-4"></div>
    </div>
  </motion.div>
);

/**
 * Sección de Planes de Servicio.
 * Muestra las diferentes opciones de paquetes fotográficos.
 */
const Plans = ({ plans, onSelectPlan }) => (
  <section id="servicios" className="py-24">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold mb-16 uppercase tracking-widest">Planes de Servicio</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
            className={`p-10 bg-[#120d09]/40 backdrop-blur-md rounded-3xl transition-all duration-700 relative overflow-visible group glow-border flex flex-col h-full ${plan.badge ? 'scale-105 glow-border-active shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(139,94,52,0.2)]' : 'border border-white/5'}`}
          >
            {/* Si el plan tiene oferta, mostrar etiqueta */}
            {plan.badge && <DiscountTag amount={plan.badge} />}
            
            {/* Contenido del Plan */}
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-3xl font-bold mb-2 tracking-tight group-hover:text-[#d4a373]">{plan.name}</h3>
              <div className="text-5xl font-bold text-[#d4a373] mb-8 price flex items-baseline justify-center gap-1">
                <span className="text-2xl font-light opacity-50">$</span>
                {plan.price.replace('$', '')}
              </div>
              <ul className="space-y-4 mb-12 text-white/70 flex-grow text-left">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#8b5e34]/20 flex items-center justify-center">
                      <ChevronRight size={12} className="text-[#8b5e34]" />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelectPlan(plan.name)}
                className="w-full py-4 border border-white/10 group-hover:bg-[#8b5e34] group-hover:border-[#8b5e34] transition-all duration-300 uppercase text-xs font-bold tracking-[0.3em] backdrop-blur-sm rounded-xl mt-auto"
              >
                Seleccionar Plan
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Plans;
export { DiscountTag };
