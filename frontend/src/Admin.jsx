/**
 * Admin.jsx - Panel de Administración.
 * 
 * Permite gestionar el contenido dinámico del sitio (Hero, Sobre mí, Galería, Planes)
 * y revisar los mensajes recibidos a través del formulario de contacto.
 * Incluye autenticación por contraseña y carga de imágenes a Cloudinary a través del backend.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, LogOut, ArrowLeft, Plus, Trash2, Image as ImageIcon, Inbox, Check, MessageSquare, Clock, Mail, AlertCircle, Camera, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from './api';

// Estructura de datos inicial vacía para evitar errores de renderizado
const skeletonData = {
    hero: { name: '', title: '', description: '', image: '', cta: '' },
    about: { title: '', content: '', image: '' },
    skills: [],
    gallery: [],
    categorized_gallery: [],
    videos: [],
    experiences: [],
    plans: [],
    contact: { email: '', phone: '', address: '', social: {} }
};

export default function Admin() {
    // --- Configuración y Constantes ---
    const API_URL = import.meta.env.VITE_API_URL || '';
    const TOKEN_KEY = 'admin_token';

    // --- Estados del Panel ---
    const [data, setData] = useState(skeletonData); // Contenido del sitio
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de logueo
    const [password, setPassword] = useState(''); // Contraseña para login
    const [authError, setAuthError] = useState(''); // Errores de login
    const [currentView, setCurrentView] = useState('content'); // Vista: 'content' (editor) o 'mailbox' (mensajes)
    const [messages, setMessages] = useState([]); // Lista de mensajes recibidos
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || ''); // Token de sesión
    const [storageStatus, setStorageStatus] = useState({ mode: 'checking', db: 'unknown' }); // Estado de persistencia

    // --- Ayudantes de Autenticación ---
    
    // Genera las cabeceras con el token de portador
    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    }), [token]);
    
    // Cierra la sesión y limpia el almacenamiento local
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
        setIsAuthenticated(false);
        setPassword('');
    }, [TOKEN_KEY]);

    // Maneja casos donde el token ha expirado
    const handleUnauthorized = useCallback(() => {
        logout();
        alert('Tu sesión expiró. Inicia sesión nuevamente.');
    }, [logout]);

    // --- Funciones de Obtención de Datos ---

    // Obtener estado del servidor (Base de datos y Storage)
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/status`);
            if (!res.ok) throw new Error();
            const json = await res.json();
            setStorageStatus({ 
                mode: json.storageMode, 
                db: json.database,
                cloudinary: json.cloudinary 
            });
        } catch {
            setStorageStatus({ mode: 'unknown', db: 'error', cloudinary: 'unknown' });
        }
    }, [API_URL]);

    // Obtiene los mensajes del buzón
    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 401) {
                handleUnauthorized();
                return;
            }
            const json = await res.json();
            setMessages(json);
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
        }
    }, [API_URL, token, handleUnauthorized]);

    // Obtiene el contenido editable al cargar el componente
    useEffect(() => {
        api.fetchContent()
            .then(json => setData(json))
            .catch(err => console.error('Error al obtener contenido:', err));
        
        void fetchStatus();
    }, [fetchStatus]);

    // --- Validación de Sesión ---
    useEffect(() => {
        if (!token) return;

        const validateSession = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/session`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    logout();
                    return;
                }

                setIsAuthenticated(true);
                // Si la vista es el buzón, cargar los mensajes inmediatamente
                if (currentView === 'mailbox') {
                    await fetchMessages();
                }
            } catch {
                logout();
            }
        };

        void validateSession();
    }, [API_URL, token, currentView, fetchMessages, logout]);

    // --- Acciones del Buzón de Mensajes ---

    // Actualiza el estado de un mensaje (visto/no visto, estado)
    const handleUpdateMessage = async (id, updates) => {
        try {
            const response = await fetch(`${API_URL}/api/messages/${id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify(updates)
            });
            if (response.status === 401) return handleUnauthorized();
            if (response.ok) {
                fetchMessages();
            }
        } catch (error) {
            console.error('Error al actualizar mensaje:', error);
        }
    };

    // Elimina un mensaje del buzón
    const handleDeleteMessage = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este mensaje?')) return;
        try {
            const response = await fetch(`${API_URL}/api/messages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 401) return handleUnauthorized();
            if (response.ok) {
                fetchMessages();
            }
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
        }
    };

    // --- Gestión de Contenido y Archivos ---

    // Inicia sesión enviando la contraseña al backend
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (!response.ok) {
                setAuthError('Credenciales inválidas');
                return;
            }

            const result = await response.json();
            if (result.token) {
                localStorage.setItem(TOKEN_KEY, result.token);
                setToken(result.token);
                setIsAuthenticated(true);
                setPassword('');
                return;
            }

            setAuthError('No se recibió token de sesión');
        } catch {
            setAuthError('No se pudo conectar con el servidor');
        }
    };

    // Guarda todos los cambios realizados en el contenido
    const handleSave = async () => {
        try {
            const saved = await api.updateContent(data);
            if (saved) {
                setData(saved);
                alert('✅ Cambios guardados con éxito en el servidor.');
                void fetchStatus();
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('❌ ERROR: No se pudieron guardar los cambios. Revisa tu conexión.');
        }
    };

    // Sube una imagen al servidor (Cloudinary)
    const handleUpload = async (file, callback) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (response.status === 401) return handleUnauthorized();

            const result = await response.json();
            if (result.url) {
                callback(result.url); // Devuelve la URL de la imagen subida
            } else {
                alert(result.error || 'Error al subir la imagen');
            }
        } catch {
            alert('Error al subir la imagen');
        }
    };

    // --- Utilidades para edición de estado ---

    // Actualiza campos simples anidados (ej: hero.name)
    const updateNested = (section, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Actualiza un elemento específico dentro de un array (ej: una habilidad)
    const updateItem = (section, index, field, value) => {
        const newItems = [...data[section]];
        newItems[index] = { ...newItems[index], [field]: value };
        setData(prev => ({ ...prev, [section]: newItems }));
    };

    // Añade un nuevo elemento a una sección (ej: añadir experiencia)
    const addItem = (section, template) => {
        setData(prev => ({ ...prev, [section]: [...prev[section], { ...template, id: Date.now() }] }));
    };

    // Elimina un elemento de una sección por su índice
    const removeItem = (section, index) => {
        const newItems = data[section].filter((_, i) => i !== index);
        setData(prev => ({ ...prev, [section]: newItems }));
    };

    // Reordena un elemento dentro de una sección
    const moveItem = (section, index, direction) => {
        const newItems = [...data[section]];
        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (nextIndex >= 0 && nextIndex < newItems.length) {
            [newItems[index], newItems[nextIndex]] = [newItems[nextIndex], newItems[index]];
            setData(prev => ({ ...prev, [section]: newItems }));
        }
    };

    // Funciones específicas para la Galería Categorizada
    const updateCategoryName = (index, name) => {
        const newCats = [...data.categorized_gallery];
        newCats[index].category = name;
        setData(prev => ({ ...prev, categorized_gallery: newCats }));
    };

    const addPhotoToCategory = (catIndex) => {
        const newCats = [...data.categorized_gallery];
        newCats[catIndex].photos.push({ id: Date.now(), url: '', title: '' });
        setData(prev => ({ ...prev, categorized_gallery: newCats }));
    };

    const updatePhotoInCategory = (catIndex, photoIndex, field, value) => {
        const newCats = [...data.categorized_gallery];
        newCats[catIndex].photos[photoIndex][field] = value;
        setData(prev => ({ ...prev, categorized_gallery: newCats }));
    };

    const removePhotoFromCategory = (catIndex, photoIndex) => {
        const newCats = [...data.categorized_gallery];
        newCats[catIndex].photos = newCats[catIndex].photos.filter((_, i) => i !== photoIndex);
        setData(prev => ({ ...prev, categorized_gallery: newCats }));
    };

    const addCategory = () => {
        setData(prev => ({
            ...prev,
            categorized_gallery: [...prev.categorized_gallery, { category: 'Nueva Categoría', photos: [] }]
        }));
    };

    const removeCategory = (index) => {
        if (!window.confirm('¿Estás seguro de eliminar esta categoría completa y todas sus fotos?')) return;
        const newCats = data.categorized_gallery.filter((_, i) => i !== index);
        setData(prev => ({ ...prev, categorized_gallery: newCats }));
    };

    const addVideo = () => {
        setData(prev => ({
            ...prev,
            videos: [...prev.videos, { id: Date.now(), title: '', url: '' }]
        }));
    };

    const addExperience = () => {
        setData(prev => ({
            ...prev,
            experiences: [...prev.experiences, { id: Date.now(), year: '', title: '', place: '' }]
        }));
    };

    // --- Renderizado: Control de Acceso (Login) ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#120d09] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#1e1610] p-10 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                         <div className="p-4 bg-[#8b5e34]/10 rounded-full border border-[#8b5e34]/20">
                             <Camera className="w-12 h-12 text-[#8b5e34]" />
                         </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-8 text-center uppercase tracking-widest">Acceso Administrativo</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            autoComplete="current-password"
                            placeholder="Contraseña del sistema"
                            className="w-full bg-[#120d09] border border-white/10 p-4 outline-none focus:border-[#8b5e34] transition-colors rounded-xl font-bold tracking-widest text-center"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {authError && <p className="text-red-400 text-sm font-bold text-center">{authError}</p>}
                        <button className="w-full py-4 bg-[#8b5e34] font-bold uppercase tracking-widest hover:bg-[#a6713f] transition-all rounded-xl shadow-lg active:scale-95">Ingresar al Panel</button>
                        <Link to="/" className="block text-center text-white/40 text-sm hover:text-white transition-colors">Volver a la Página Principal</Link>
                    </form>
                </motion.div>
            </div>
        );
    }

    // --- Renderizado: Consola del Administrador ---
    return (
        <div className="min-h-screen bg-[#120d09] text-white/90">
            {/* Barra de Navegación del Panel */}
            <nav className="border-b border-white/5 bg-[#1e1610]/80 backdrop-blur-md p-6 sticky top-0 z-50 shadow-2xl">
                <div className="container mx-auto flex flex-col lg:flex-row gap-6 justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"><ArrowLeft size={18} /></Link>
                        <div className="relative flex items-center group">
                            <Camera size={40} className="text-[#8b5e34] absolute -left-4 opacity-10 transition-all duration-700 group-hover:opacity-30 group-hover:scale-110" />
                            <h1 className="text-xl font-bold uppercase tracking-[0.2em] relative z-10 pl-2">Centro de Control</h1>
                        </div>
                    </div>

                    {/* Selector de Vistas (Contenido / Buzón) */}
                    <div className="flex bg-[#120d09] p-1 rounded-xl sm:p-1.5 sm:rounded-2xl border border-white/5 shadow-inner w-full max-w-sm lg:w-auto">
                        <button
                            onClick={() => setCurrentView('content')}
                            className={`flex-1 sm:flex-none px-3 sm:px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all ${currentView === 'content' ? 'bg-[#8b5e34] text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            Contenido
                        </button>
                        <button
                            onClick={() => setCurrentView('mailbox')}
                            className={`flex-1 sm:flex-none px-3 sm:px-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold uppercase tracking-widest transition-all relative ${currentView === 'mailbox' ? 'bg-[#8b5e34] text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            Buzón
                            {messages.filter(m => !m.isSeen).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 rounded-full text-[8px] sm:text-[10px] flex items-center justify-center border-2 border-[#120d09] font-black">
                                    {messages.filter(m => !m.isSeen).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Acciones Globales */}
                    <div className="flex gap-4">
                        {currentView === 'content' && (
                            <button onClick={handleSave} className="flex items-center gap-2 bg-[#8b5e34] hover:bg-[#a6713f] px-6 py-2.5 rounded-xl font-bold text-xs uppercase transition-all shadow-lg active:scale-95">
                                <Save size={16} /> Guardar Cambios
                            </button>
                        )}
                        <button onClick={logout} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-xl font-bold text-xs uppercase border border-white/10 transition-all">
                            <LogOut size={16} /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            {/* Aviso de Persistencia Crítica */}
            {storageStatus.mode === 'ephemeral' && (
                <div className="bg-red-600/90 text-white p-4 text-center font-black uppercase text-xs tracking-widest animate-pulse sticky top-[89px] z-40 shadow-2xl backdrop-blur-md">
                    ⚠️ ALERTA: MODO EFÍMERO ACTIVO. Los cambios se perderán al reiniciar el servidor. 
                    <span className="underline ml-2 hidden sm:inline">Configura MONGODB_URI en Render inmediatamente.</span>
                </div>
            )}
            
            {storageStatus.mode === 'persistent' && (
                <div className="bg-green-600/20 text-green-400 p-2 text-center font-bold uppercase text-[9px] tracking-widest sticky top-[89px] z-40 backdrop-blur-sm border-b border-green-500/10">
                    🟢 Sistema Conectado a Base de Datos (Persistencia Real)
                </div>
            )}

            {storageStatus.cloudinary === 'not_configured' && (
                <div className="bg-amber-600/20 text-amber-500 p-2 text-center font-bold uppercase text-[9px] tracking-widest border-b border-amber-500/10 sticky top-[125px] z-30 backdrop-blur-sm">
                    ⚠️ Aviso: Cloudinary no detectado. Las fotos nuevas se borrarán si el servidor se reinicia.
                </div>
            )}

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                {currentView === 'mailbox' ? (
                    // --- SECCIÓN: BUZÓN DE MENSAJES ---
                    <section className="space-y-8 animate-in fade-in duration-700">
                        <div className="flex justify-between items-end border-b border-white/5 pb-8">
                            <div>
                                <h2 className="text-3xl font-bold uppercase tracking-tighter">Gestión de <span className="text-stroke text-transparent" style={{ WebkitTextStroke: '1px var(--color-text)' }}>Mensajes</span></h2>
                                <p className="text-white/40 text-sm mt-2 font-medium">Revisa y organiza las solicitudes de tus posibles clientes.</p>
                            </div>
                            <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Pendientes: {messages.filter(m => !m.isSeen).length}
                                </div>
                                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/20">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> Listos: {messages.filter(m => m.status === 'contacted').length}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {messages.length === 0 ? (
                                <div className="bg-[#1e1610] p-24 rounded-[2rem] border border-white/5 border-dashed flex flex-col items-center text-white/10">
                                    <Inbox size={80} className="mb-6 opacity-20" />
                                    <p className="text-2xl font-bold uppercase tracking-[0.3em]">Bandeja vacía</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <motion.div
                                        layout
                                        key={msg._id || msg.id}
                                        className={`bg-[#1e1610] p-8 rounded-[2rem] border transition-all duration-500 hover:scale-[1.01] ${!msg.isSeen ? 'border-[#8b5e34]/50 shadow-[0_20px_50px_rgba(139,94,52,0.1)]' : 'border-white/5 opacity-70'}`}
                                    >
                                        <div className="flex flex-col md:flex-row justify-between gap-8">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center gap-5">
                                                    <div className={`p-2 rounded-full ${!msg.isSeen ? 'bg-[#8b5e34]/20 text-[#d4a373]' : 'bg-white/5 text-white/20'}`}>
                                                        {msg.isSeen ? <Check size={18} /> : <AlertCircle size={18} className="animate-pulse" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-bold flex items-center gap-3 tracking-tight">
                                                            {msg.name}
                                                            {msg.status === 'contacted' && <span className="bg-green-500 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg shadow-green-500/20">Contactado</span>}
                                                        </span>
                                                        <span className="text-sm text-white/40 flex items-center gap-2 mt-1 font-medium italic"><Mail size={14} className="text-[#8b5e34]" /> {msg.email}</span>
                                                    </div>
                                                </div>

                                                <div className="bg-[#120d09] p-6 rounded-2xl border border-white/5 text-white/80 text-sm leading-relaxed relative group/msg">
                                                    <MessageSquare size={16} className="absolute -top-2 -left-2 text-[#8b5e34] transform group-hover/msg:scale-125 transition-transform" />
                                                    {msg.message}
                                                </div>

                                                <div className="flex items-center gap-4 text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">
                                                    <span className="flex items-center gap-2"><Clock size={14} className="text-[#8b5e34]/40" /> {new Date(msg.createdAt).toLocaleString('es-ES')}</span>
                                                </div>
                                            </div>

                                            {/* Acciones del mensaje */}
                                            <div className="flex md:flex-col gap-3 justify-center min-w-[160px]">
                                                <label className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl border transition-all cursor-pointer select-none font-bold uppercase text-[10px] tracking-widest ${msg.isSeen ? 'bg-[#8b5e34] border-[#8b5e34] text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={msg.isSeen}
                                                        onChange={(e) => handleUpdateMessage(msg._id || msg.id, { isSeen: e.target.checked })}
                                                        className="hidden"
                                                    />
                                                    {msg.isSeen ? <><Check size={14} /> Leído</> : 'Marcar Leído'}
                                                </label>

                                                <div className="flex bg-[#120d09] rounded-xl border border-white/10 overflow-hidden shadow-inner font-black uppercase text-[9px]">
                                                    <button
                                                        onClick={() => handleUpdateMessage(msg._id || msg.id, { status: 'contacted' })}
                                                        className={`flex-1 px-4 py-3 transition-all ${msg.status === 'contacted' ? 'bg-green-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                                                    >
                                                        Listo
                                                    </button>
                                                    <div className="w-[1px] bg-white/5"></div>
                                                    <button
                                                        onClick={() => handleUpdateMessage(msg._id || msg.id, { status: 'not_contacted' })}
                                                        className={`flex-1 px-4 py-3 transition-all ${msg.status === 'not_contacted' ? 'bg-[#8b5e34] text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                                                    >
                                                        Pendiente
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteMessage(msg._id || msg.id)}
                                                    className="w-full py-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-widest border border-transparent hover:border-red-500/20"
                                                >
                                                    <Trash2 size={16} /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </section>
                ) : (
                    // --- SECCIÓN: EDITOR DE CONTENIDO ---
                    <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
                        
                        {/* EDITOR HERO */}
                        <section className="bg-[#1e1610] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5e34]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#8b5e34]/10 transition-colors"></div>
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 uppercase tracking-[0.2em] text-[#d4a373]">
                                <div className="w-10 h-[2px] bg-[#8b5e34]"></div>
                                Portada / Hero
                            </h2>
                            <div className="grid gap-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Nombre de Marca</label>
                                        <input
                                            className="w-full bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none focus:border-[#8b5e34] transition-all font-bold text-lg"
                                            value={data.hero.name}
                                            onChange={(e) => updateNested('hero', 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Título Principal</label>
                                        <input
                                            className="w-full bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none focus:border-[#8b5e34] transition-all font-bold text-lg"
                                            value={data.hero.title}
                                            onChange={(e) => updateNested('hero', 'title', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Eslogan de Bienvenida</label>
                                    <textarea
                                        className="w-full bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none focus:border-[#8b5e34] transition-all min-h-[100px] leading-relaxed"
                                        value={data.hero.description}
                                        onChange={(e) => updateNested('hero', 'description', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Imagen Destacada (PNG/JPG)</label>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                className="flex-1 bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none text-xs font-mono"
                                                value={data.hero.image}
                                                onChange={(e) => updateNested('hero', 'image', e.target.value)}
                                            />
                                            <label className="bg-[#8b5e34] px-6 flex items-center justify-center rounded-xl cursor-pointer hover:bg-[#a6713f] transition-all shadow-lg active:scale-95">
                                                <ImageIcon size={20} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], (url) => updateNested('hero', 'image', url))}
                                                />
                                            </label>
                                        </div>
                                        <div className="w-full md:w-32 h-20 bg-black/40 rounded-xl overflow-hidden border border-white/10">
                                            {data.hero.image && <img src={data.hero.image} className="w-full h-full object-cover" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* EDITOR SOBRE MÍ */}
                        <section className="bg-[#1e1610] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-4 uppercase tracking-[0.2em] text-[#d4a373]">
                                <div className="w-10 h-[2px] bg-[#8b5e34]"></div>
                                Sobre el Fotógrafo
                            </h2>
                            <div className="grid gap-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Encabezado de Biografía</label>
                                    <input
                                        className="w-full bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none focus:border-[#8b5e34] transition-all font-bold text-lg"
                                        value={data.about.title}
                                        onChange={(e) => updateNested('about', 'title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Historia / Perfil Profesional</label>
                                    <textarea
                                        className="w-full bg-[#120d09] border border-white/10 p-6 rounded-xl outline-none focus:border-[#8b5e34] transition-all min-h-[180px] leading-relaxed text-white/60 font-light"
                                        value={data.about.content}
                                        onChange={(e) => updateNested('about', 'content', e.target.value)}
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-8 items-start">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 block">Foto de Perfil</label>
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                className="flex-1 bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none text-xs"
                                                value={data.about.image}
                                                onChange={(e) => updateNested('about', 'image', e.target.value)}
                                            />
                                            <label className="bg-[#8b5e34] px-6 flex items-center justify-center rounded-xl cursor-pointer hover:bg-[#a6713f] transition-all">
                                                <ImageIcon size={20} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], (url) => updateNested('about', 'image', url))}
                                                />
                                            </label>
                                        </div>
                                        <div className="aspect-square w-full max-w-[200px] border-4 border-white/5 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mx-auto md:mx-0">
                                            {data.about.image && <img src={data.about.image} className="w-full h-full object-cover" />}
                                        </div>
                                    </div>

                                    {/* Subsección: Habilidades Técnicas */}
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center bg-[#120d09] p-4 rounded-2xl border border-white/5">
                                            <span className="text-xs font-black uppercase tracking-widest text-[#d4a373]">Técnica y Dominio</span>
                                            <button
                                                onClick={() => addItem('skills', { name: '', level: 80 })}
                                                className="p-2 bg-[#8b5e34] rounded-full text-white hover:scale-110 transition-transform shadow-lg shadow-[#8b5e34]/30"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div className="grid gap-4">
                                            {data.skills.map((skill, index) => (
                                                <motion.div layout key={index} className="flex gap-4 items-center bg-[#120d09]/50 p-4 rounded-xl border border-white/5 group/skill">
                                                    <input
                                                        placeholder="Nombre de Habilidad"
                                                        className="flex-1 bg-transparent border-b border-white/5 p-2 text-sm outline-none focus:border-[#8b5e34] transition-colors font-bold uppercase"
                                                        value={skill.name}
                                                        onChange={(e) => updateItem('skills', index, 'name', e.target.value)}
                                                    />
                                                    <div className="flex items-center gap-3">
                                                         <input
                                                            type="number"
                                                            className="w-14 bg-black/40 border border-white/10 p-2 rounded text-center text-xs font-black text-[#d4a373]"
                                                            value={skill.level}
                                                            onChange={(e) => updateItem('skills', index, 'level', parseInt(e.target.value))}
                                                        />
                                                        <button
                                                            onClick={() => removeItem('skills', index)}
                                                            className="text-white/10 hover:text-red-500 transition-colors bg-white/5 p-2 rounded-lg"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* EDITOR GALERÍA INICIAL */}
                        <section className="bg-[#1e1610] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                <h2 className="text-2xl font-bold flex items-center gap-4 uppercase tracking-[0.2em] text-[#d4a373]">
                                    <div className="w-10 h-[2px] bg-[#8b5e34]"></div>
                                    Muestra del Portafolio
                                </h2>
                                <button
                                    onClick={() => addItem('gallery', { url: '', title: '', category: '' })}
                                    className="flex items-center gap-3 bg-[#8b5e34] px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#8b5e34]/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus size={16} /> Añadir Nueva Foto
                                </button>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data.gallery.map((item, index) => (
                                    <div key={index} className="bg-[#120d09] p-4 rounded-3xl border border-white/10 relative group/photo overflow-hidden transition-all hover:border-[#8b5e34]/40 shadow-xl">
                                        <button
                                            onClick={() => removeItem('gallery', index)}
                                            className="absolute top-4 right-4 p-2.5 bg-black/60 rounded-full text-white/50 hover:text-red-500 transition-all z-20 backdrop-blur-md opacity-0 group-hover/photo:opacity-100"
                                        ><Trash2 size={16} /></button>
                                        
                                        <div className="aspect-[4/5] bg-black/40 rounded-2xl overflow-hidden mb-6 border border-white/5 relative">
                                            {item.url ? <img src={item.url} className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-1000" /> : <div className="flex items-center justify-center h-full text-white/5"><ImageIcon size={64} /></div>}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                        </div>

                                        <div className="space-y-4 px-2">
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="URL de Imagen"
                                                    className="flex-1 bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-mono outline-none focus:border-[#8b5e34]"
                                                    value={item.url}
                                                    onChange={(e) => updateItem('gallery', index, 'url', e.target.value)}
                                                />
                                                <label className="bg-[#8b5e34]/20 p-3 rounded-xl cursor-pointer hover:bg-[#8b5e34]/40 transition-all text-[#d4a373]">
                                                    <ImageIcon size={18} />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], (url) => updateItem('gallery', index, 'url', url))}
                                                    />
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    placeholder="Título de la Obra"
                                                    className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-bold font-sans outline-none focus:border-[#8b5e34]"
                                                    value={item.title}
                                                    onChange={(e) => updateItem('gallery', index, 'title', e.target.value)}
                                                />
                                                <input
                                                    placeholder="Categoría"
                                                    className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-black uppercase text-[#d4a373] outline-none focus:border-[#d4a373]"
                                                    value={item.category}
                                                    onChange={(e) => updateItem('gallery', index, 'category', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECCIÓN MÁS COMPLEJA SI EXISTE MÁS CONTENIDO... */}
                        {/* El resto del código de la galería completa y planes se mantiene bajo el mismo esquema de documentación y organización visual */}

                        {/* SECCIÓN: VIDEOS DESTACADOS */}
                        <section className="mb-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <h2 className="text-2xl font-bold flex items-center gap-4 uppercase tracking-[0.2em] text-[#d4a373]">
                                    <div className="w-10 h-[2px] bg-[#8b5e34]"></div>
                                    Videos Destacados
                                </h2>
                                <button
                                    onClick={addVideo}
                                    className="flex items-center gap-3 bg-[#8b5e34] px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#8b5e34]/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus size={16} /> Añadir Video
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {data.videos.map((video, index) => (
                                    <div key={index} className="bg-[#1e1610] p-5 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
                                        <div className="flex items-center justify-between gap-4 mb-4">
                                            <input
                                                className="flex-1 bg-[#120d09] border border-white/5 p-3 rounded-xl text-sm font-bold outline-none focus:border-[#8b5e34] transition-colors"
                                                placeholder="Título del video"
                                                value={video.title}
                                                onChange={(e) => updateItem('videos', index, 'title', e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeItem('videos', index)}
                                                className="text-white/10 hover:text-red-500 transition-colors bg-white/5 p-3 rounded-xl"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black">
                                                {video.url ? (
                                                    <iframe
                                                        src={video.url}
                                                        title={video.title || `Video ${index + 1}`}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-white/10 text-xs uppercase tracking-widest">
                                                        Pega la URL del video
                                                    </div>
                                                )}
                                            </div>

                                            <input
                                                className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-mono outline-none focus:border-[#8b5e34]"
                                                placeholder="URL de YouTube, Vimeo, Drive o video directo"
                                                value={video.url}
                                                onChange={(e) => updateItem('videos', index, 'url', e.target.value)}
                                            />
                                            <p className="text-[10px] text-white/25 uppercase tracking-[0.18em] leading-relaxed">
                                                Usa YouTube, Vimeo, Google Drive, Dropbox o un archivo directo `.mp4`, `.webm`, `.ogg` o `.mov`.
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        
                        {/* GESTIÓN DE CATEGORÍAS (Galería Completa) */}
                        <section className="mb-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <h2 className="text-2xl font-bold flex items-center gap-4 uppercase tracking-[0.2em] text-[#d4a373]">
                                    <div className="w-10 h-[2px] bg-[#8b5e34]"></div>
                                    Experiencia
                                </h2>
                                <button
                                    onClick={addExperience}
                                    className="flex items-center gap-3 bg-[#8b5e34] px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#8b5e34]/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus size={16} /> Añadir Experiencia
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {data.experiences.map((experience, index) => (
                                    <motion.div
                                        layout
                                        key={experience.id || index}
                                        className="bg-[#1e1610] p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between gap-4 mb-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3 text-[#d4a373] uppercase tracking-[0.2em] text-[10px] font-black">
                                                    <Clock size={16} />
                                                    Entrada {index + 1}
                                                </div>
                                                <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                                                    <button
                                                        onClick={() => moveItem('experiences', index, 'up')}
                                                        disabled={index === 0}
                                                        className={`p-2 rounded-lg transition-all ${index === 0 ? 'opacity-20 cursor-not-allowed' : 'bg-white/5 hover:bg-[#8b5e34] text-white/50 hover:text-white'}`}
                                                        title="Mover arriba"
                                                    >
                                                        <ChevronUp size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveItem('experiences', index, 'down')}
                                                        disabled={index === data.experiences.length - 1}
                                                        className={`p-2 rounded-lg transition-all ${index === data.experiences.length - 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white/5 hover:bg-[#8b5e34] text-white/50 hover:text-white'}`}
                                                        title="Mover abajo"
                                                    >
                                                        <ChevronDown size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem('experiences', index)}
                                                className="text-white/10 hover:text-red-500 transition-colors bg-white/5 p-3 rounded-xl"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-12 gap-4">
                                            <input
                                                className="md:col-span-2 w-full bg-[#120d09] border border-white/5 p-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] outline-none focus:border-[#8b5e34] transition-all text-center"
                                                placeholder="Año"
                                                value={experience.year}
                                                onChange={(e) => updateItem('experiences', index, 'year', e.target.value)}
                                            />
                                            <input
                                                className="md:col-span-5 w-full bg-[#120d09] border border-white/5 p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#8b5e34] transition-all"
                                                placeholder="Título de la experiencia"
                                                value={experience.title}
                                                onChange={(e) => updateItem('experiences', index, 'title', e.target.value)}
                                            />
                                            <input
                                                className="md:col-span-5 w-full bg-[#120d09] border border-white/5 p-4 rounded-2xl text-sm font-medium outline-none focus:border-[#8b5e34] transition-all"
                                                placeholder="Lugar o proyecto"
                                                value={experience.place}
                                                onChange={(e) => updateItem('experiences', index, 'place', e.target.value)}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <h2 className="text-2xl font-bold flex items-center gap-4 uppercase tracking-[0.2em] text-[#d4a373]">
                                    <div className="w-16 h-[4px] bg-[#8b5e34] rounded-full"></div>
                                    Galería Completa por Categorías
                                </h2>
                                <button
                                    onClick={addCategory}
                                    className="flex items-center gap-3 bg-[#8b5e34] px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#8b5e34]/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus size={16} /> Nueva Categoría
                                </button>
                            </div>
                            {data.categorized_gallery.map((cat, catIdx) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    key={catIdx} 
                                    className="mb-16 bg-[#120d09] p-10 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-white/5 space-y-4 md:space-y-0">
                                        <div className="flex items-center gap-6 group">
                                            <div className="w-12 h-12 rounded-2xl bg-[#8b5e34] flex items-center justify-center font-black text-xl shadow-lg shadow-[#8b5e34]/20">{catIdx + 1}</div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="text-2xl font-black bg-transparent border-b-2 border-transparent focus:border-[#8b5e34] outline-none text-[#d4a373] uppercase tracking-[0.4em] w-80 transition-all uppercase"
                                                    value={cat.category}
                                                    onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                                                />
                                                <button
                                                    onClick={() => removeCategory(catIdx)}
                                                    className="p-2 text-white/10 hover:text-red-500 transition-colors"
                                                    title="Eliminar Categoría"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addPhotoToCategory(catIdx)}
                                            className="group flex items-center gap-3 bg-white/5 hover:bg-[#8b5e34] transition-all px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10"
                                        >
                                            <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Añadir a {cat.category}
                                        </button>
                                    </div>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {cat.photos.map((photo, pIdx) => (
                                            <div key={pIdx} className="bg-[#1e1610] p-4 rounded-3xl border border-white/10 relative group/pcat overflow-hidden shadow-2xl">
                                                <button
                                                    onClick={() => removePhotoFromCategory(catIdx, pIdx)}
                                                    className="absolute top-2 right-2 p-2 text-white/10 hover:text-red-500 z-10 transition-colors opacity-0 group-hover/pcat:opacity-100"
                                                ><Trash2 size={16} /></button>
                                                
                                                <div className="aspect-square bg-black mb-5 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                                                    {photo.url ? <img src={photo.url} className="w-full h-full object-cover transition-all duration-1000 group-hover/pcat:scale-125" /> : <div className="flex items-center justify-center h-full opacity-5"><ImageIcon size={48} /></div>}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex gap-1">
                                                        <input
                                                            className="flex-1 bg-[#120d09] border border-white/5 p-3 rounded-xl text-[9px] font-mono outline-none focus:border-[#8b5e34]"
                                                            placeholder="URL Imagen"
                                                            value={photo.url}
                                                            onChange={(e) => updatePhotoInCategory(catIdx, pIdx, 'url', e.target.value)}
                                                        />
                                                        <label className="bg-[#8b5e34]/20 p-3 rounded-xl cursor-pointer hover:bg-[#8b5e34] flex items-center transition-all">
                                                            <ImageIcon size={14} className="text-[#d4a373]" />
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0], (url) => updatePhotoInCategory(catIdx, pIdx, 'url', url))}
                                                            />
                                                        </label>
                                                    </div>
                                                    <input
                                                        className="w-full bg-[#120d09] border border-white/5 p-3 rounded-xl text-[10px] font-bold outline-none focus:border-[#8b5e34]"
                                                        placeholder="Título Descriptivo"
                                                        value={photo.title}
                                                        onChange={(e) => updatePhotoInCategory(catIdx, pIdx, 'title', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </section>

                        {/* EDITOR PLANES */}
                        <section className="bg-[#1e1610] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                             <h2 className="text-2xl font-bold mb-12 flex items-center gap-4 uppercase tracking-[0.2em] text-[#d4a373]">
                                <div className="w-10 h-[2px] bg-[#8b5e34]"></div>
                                Planes y Servicios
                            </h2>
                            <div className="space-y-10">
                                {data.plans.map((plan, index) => (
                                    <div key={index} className="bg-[#120d09] p-10 border border-white/10 rounded-[2.5rem] relative group/plan overflow-hidden">
                                        <div className="absolute top-0 right-0 w-1 bg-[#8b5e34] h-full opacity-0 group-hover/plan:opacity-100 transition-opacity"></div>
                                        <div className="grid lg:grid-cols-12 gap-10">
                                            
                                            {/* Edición de Datos del Plan */}
                                            <div className="lg:col-span-12 space-y-8">
                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <div className="md:col-span-2">
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 block">Título del Paquete</label>
                                                        <input
                                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-lg font-bold outline-none focus:border-[#8b5e34] transition-all"
                                                            value={plan.name}
                                                            onChange={(e) => updateItem('plans', index, 'name', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 block">Precio base ($)</label>
                                                        <input
                                                            className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-lg font-black text-[#d4a373] outline-none text-center"
                                                            value={plan.price}
                                                            onChange={(e) => updateItem('plans', index, 'price', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 block">Etiqueta de Oferta Especial</label>
                                                            <select
                                                                className="w-full bg-black/60 border-2 border-[#8b5e34]/20 p-4 rounded-2xl outline-none text-[#d4a373] font-black tracking-widest appearance-none text-center shadow-inner"
                                                                value={plan.badge || ""}
                                                                onChange={(e) => updateItem('plans', index, 'badge', e.target.value === "" ? null : e.target.value)}
                                                            >
                                                                <option value="">Desactivado</option>
                                                                <option value="5%">Oferta Exclusiva 5%</option>
                                                                <option value="10%">Súper Descuento 10%</option>
                                                                <option value="15%">Promoción Elite 15%</option>
                                                            </select>
                                                        </div>
                                                        </div>

                                                    <div>
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-3 block">Beneficios Incluidos (Separar por comas)</label>
                                                        <textarea
                                                            className="w-full bg-black/40 border border-white/5 p-6 rounded-2xl text-xs min-h-[140px] outline-none focus:border-[#8b5e34] leading-relaxed transition-all shadow-inner font-bold"
                                                            value={plan.features.join(', ')}
                                                            placeholder="Ej: 2 Horas, 20 Fotos editadas, Entrega digital..."
                                                            onChange={(e) => updateItem('plans', index, 'features', e.target.value.split(',').map(s => s.trim()))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECCIÓN FINAL: DATOS DE CONTACTO Y REDES */}
                        <section className="grid lg:grid-cols-2 gap-12 mb-20">
                            
                            {/* Información Directa */}
                            <div className="bg-[#1e1610] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                                <h3 className="text-xl font-bold mb-8 uppercase tracking-widest text-[#d4a373] flex items-center gap-3">
                                    <Mail size={20} /> Datos de Contacto
                                </h3>
                                <div className="space-y-6">
                                    {['email', 'phone', 'address'].map((field) => (
                                        <div key={field}>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 block capitalize">{field === 'phone' ? 'Teléfono' : field === 'address' ? 'Dirección/Ciudad' : 'Correo Electrónico'}</label>
                                            <input
                                                className="w-full bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none focus:border-[#8b5e34] transition-all font-bold"
                                                value={data.contact[field]}
                                                onChange={(e) => updateNested('contact', field, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Enlaces Sociales */}
                            <div className="bg-[#1e1610] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                                     <Camera size={200} />
                                </div>
                                <h3 className="text-xl font-bold mb-8 uppercase tracking-widest text-[#d4a373] flex items-center gap-3">
                                    <MessageSquare size={20} /> Redes Sociales
                                </h3>
                                <div className="grid gap-6 relative z-10">
                                    {['facebook', 'instagram', 'tiktok', 'whatsapp'].map((platform) => (
                                        <div key={platform}>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 block capitalize">{platform}</label>
                                            <input
                                                className="w-full bg-[#120d09] border border-white/10 p-4 rounded-xl outline-none focus:border-[#8b5e34] transition-all text-xs font-mono"
                                                value={data.contact.social[platform]}
                                                onChange={(e) => {
                                                    const newSocial = { ...data.contact.social, [platform]: e.target.value };
                                                    setData(prev => ({ ...prev, contact: { ...prev.contact, social: newSocial } }));
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* Footer del Panel */}
            <footer className="py-12 text-center bg-[#120d09] border-t border-white/5">
                <div className="container mx-auto">
                    <p className="text-white/10 uppercase tracking-[1em] text-[8px] font-black">
                        Panel de Administración Exclusivo &copy; 2024 Vladimir Ph.
                    </p>
                </div>
            </footer>
        </div>
    );
}
