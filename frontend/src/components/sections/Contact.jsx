import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../../api';

/**
 * Sección de Contacto.
 * Permite a los usuarios enviar mensajes directamente al fotógrafo.
 */
const Contact = ({ contact, initialMessage }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // Actualizar mensaje si se selecciona un plan
  useEffect(() => {
    if (initialMessage) {
      setFormData(prev => ({ ...prev, message: initialMessage }));
    }
  }, [initialMessage]);

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      await api.sendMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 px-4 sm:px-0">
      <div className="container mx-auto px-0 sm:px-6">
        <div className="max-w-4xl mx-auto bg-[#1e1610]/40 backdrop-blur-md p-6 sm:p-10 md:p-12 rounded-3xl border-2 border-[#8b5e34]/30 shadow-[0_0_50px_rgba(139,94,52,0.1)] grid md:grid-cols-2 gap-12 relative overflow-hidden group hover:border-[#8b5e34]/50 transition-all duration-500">
          
          {/* Elementos decorativos animados en hover */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#8b5e34]/10 rounded-full blur-3xl group-hover:bg-[#8b5e34]/20 transition-colors duration-500"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#d4a373]/5 rounded-full blur-3xl group-hover:bg-[#d4a373]/10 transition-colors duration-500"></div>
          
          {/* Información de Contacto Directo */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-8">Trabajemos Juntos</h2>
            <p className="text-white/60 mb-8">Reserva tu sesión ahora y crea recuerdos que durarán para siempre.</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#8b5e34]/20 rounded-full text-[#d4a373]"><Mail size={20} /></div>
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#8b5e34]/20 rounded-full text-[#d4a373]"><Phone size={20} /></div>
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#8b5e34]/20 rounded-full text-[#d4a373]"><MapPin size={20} /></div>
                <span>{contact.address}</span>
              </div>
            </div>
          </div>

          {/* Formulario de Contacto */}
          <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
            <input
              type="text" placeholder="Nombre" required
              className="w-full bg-[#120d09] border border-white/10 p-4 outline-none focus:border-[#8b5e34] transition-colors rounded-xl"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="email" placeholder="Email" required
              className="w-full bg-[#120d09] border border-white/10 p-4 outline-none focus:border-[#8b5e34] transition-colors rounded-xl"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <textarea
              placeholder="Mensaje" required rows="4"
              className="w-full bg-[#120d09] border border-white/10 p-4 outline-none focus:border-[#8b5e34] transition-colors rounded-xl"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
            <button
              disabled={isSubmitting}
              className={`w-full py-4 font-bold uppercase tracking-widest transition-all rounded-xl ${isSubmitting ? 'bg-white/10 text-white/20' : 'bg-[#8b5e34] hover:bg-[#a6713f] text-white shadow-lg shadow-[#8b5e34]/20'}`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>

            {/* Mensajes de Estado */}
            {status === 'success' && <p className="text-green-500 text-sm font-bold">¡Mensaje enviado con éxito!</p>}
            {status === 'error' && <p className="text-red-500 text-sm font-bold">Error al enviar. Intenta de nuevo.</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
