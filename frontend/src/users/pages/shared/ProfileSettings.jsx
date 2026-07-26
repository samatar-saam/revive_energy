// src/users/pages/shared/ProfileSettings.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Building2, MapPin, Lock, Save,
  RefreshCw, AlertCircle, CheckCircle, Briefcase,
  Package, Truck, Zap, Calendar, Edit3,
  Camera, X, Upload, Shield, Trash2,
  Eye, EyeOff, Check, Video,
  FlipHorizontal, ArrowLeft,
  Crown,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─── HELPERS ──────────────────────────────────────────────── */
const getInitials = name => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const fmt = d => d ? new Date(d).toLocaleDateString('en-KE', {
  year:'numeric', month:'long', day:'numeric'
}) : '—';

const ROLE_META = {
  supplier:    { label:'Waste Supplier',    Icon:Package, pill:'bg-emerald-50 text-emerald-700 border-emerald-200' },
  producer:    { label:'Energy Producer',   Icon:Zap,     pill:'bg-amber-50 text-amber-700 border-amber-200'   },
  transporter: { label:'Transport Partner', Icon:Truck,   pill:'bg-blue-50 text-blue-700 border-blue-200'      },
  admin:       { label:'Administrator',     Icon:Crown,   pill:'bg-purple-50 text-purple-700 border-purple-200' },
};

const raw = r => ROLE_META[r] || { label: r || 'User', Icon: User, pill:'bg-gray-50 text-gray-600 border-gray-200' };

/* ─── TOAST ────────────────────────────────────────────────── */
const TOAST = {
  success: { bar:'bg-[#11402D]', icon:<CheckCircle  className="w-4 h-4 text-[#11402D]"/> },
  error:   { bar:'bg-red-500',   icon:<AlertCircle  className="w-4 h-4 text-red-500"  /> },
  info:    { bar:'bg-blue-500',  icon:<AlertCircle  className="w-4 h-4 text-blue-500" /> },
};

function Toast({ id, type, message, onClose }) {
  useEffect(() => { const t = setTimeout(() => onClose(id), 4200); return () => clearTimeout(t); }, []);
  const s = TOAST[type] || TOAST.info;
  return (
    <motion.div initial={{ opacity:0, y:-16, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-16, scale:.95 }}
      className="flex items-center gap-3 bg-white border border-[#E5EDE8] shadow-2xl rounded-2xl px-4 py-3.5 w-80 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full ${s.bar}`} />
      {s.icon}
      <p className="text-sm font-medium text-[#0A1A0F] flex-1">{message}</p>
      <button onClick={() => onClose(id)} className="text-[#5A7060] hover:text-[#0A1A0F] transition-colors">
        <X className="w-3.5 h-3.5"/>
      </button>
    </motion.div>
  );
}

/* ─── FIELD ────────────────────────────────────────────────── */
const fc = `w-full rounded-xl border border-[#E5EDE8] bg-[#F6F8F4] px-4 py-3 text-sm
  text-[#0A1A0F] placeholder-[#A8BBB3] outline-none
  focus:border-[#11402D] focus:ring-2 focus:ring-[#11402D]/8 transition-all`;

function Field({ label, note, className = '', children }) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold uppercase tracking-[0.13em] text-[#3D5248] mb-1.5">{label}</label>
      {children}
      {note && <p className="text-[10px] text-[#A8BBB3] mt-1.5">{note}</p>}
    </div>
  );
}

/* ─── CAMERA MODAL ─────────────────────────────────────────── */
function CameraModal({ onCapture, onClose }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const [ready,    setReady]    = useState(false);
  const [facing,   setFacing]   = useState('user');
  const [captured, setCaptured] = useState(null);
  const [error,    setError]    = useState(null);

  const startCamera = useCallback(async (facingMode = 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width:{ ideal:1280 }, height:{ ideal:720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (e) {
      setError('Camera not accessible. Please allow camera permissions.');
    }
  }, []);

  useEffect(() => {
    startCamera(facing);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const flip = () => {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    setReady(false);
    setCaptured(null);
    startCamera(next);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (facing === 'user') { ctx.scale(-1, 1); ctx.drawImage(v, -c.width, 0); }
    else ctx.drawImage(v, 0, 0);
    setCaptured(c.toDataURL('image/jpeg', 0.92));
  };

  const retake = () => setCaptured(null);
  const use    = () => { onCapture(captured); onClose(); };

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background:'rgba(10,26,15,0.85)', backdropFilter:'blur(8px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.9, opacity:0 }}
        className="bg-[#0A1A0F] rounded-3xl overflow-hidden w-full max-w-lg border border-white/8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <Video className="w-4 h-4 text-[#4ADE80]"/>
            <span className="text-sm font-bold text-white">Take Photo</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center hover:bg-white/12 transition-colors">
            <X className="w-4 h-4 text-white/60"/>
          </button>
        </div>
        <div className="relative bg-black" style={{ aspectRatio:'4/3' }}>
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
              <Camera className="w-10 h-10 text-white/20"/>
              <p className="text-sm text-white/50">{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted
                className={`w-full h-full object-cover ${!captured ? 'block' : 'hidden'} ${facing === 'user' ? '-scale-x-100' : ''}`} />
              {captured && (
                <img src={captured} alt="capture" className="w-full h-full object-cover" />
              )}
              {!captured && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#4ADE80] rounded-tl-lg"/>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#4ADE80] rounded-tr-lg"/>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#4ADE80] rounded-bl-lg"/>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#4ADE80] rounded-br-lg"/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-36 h-44 rounded-full border border-white/20 border-dashed"/>
                  </div>
                </div>
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden"/>
        </div>
        <div className="px-5 py-5 flex items-center justify-between">
          {!captured ? (
            <>
              <button onClick={flip} className="w-11 h-11 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors">
                <FlipHorizontal className="w-5 h-5 text-white/60"/>
              </button>
              <button onClick={capture} disabled={!ready}
                className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center hover:border-[#4ADE80]/60 transition-all group disabled:opacity-40">
                <div className="w-12 h-12 rounded-full bg-white group-hover:bg-[#4ADE80] transition-colors"/>
              </button>
              <div className="w-11 h-11"/>
            </>
          ) : (
            <>
              <button onClick={retake} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4"/> Retake
              </button>
              <button onClick={use}
                className="flex items-center gap-2 text-sm font-bold text-[#0A1A0F] px-6 py-2.5 rounded-full"
                style={{ background:'#4ADE80' }}>
                <Check className="w-4 h-4"/> Use Photo
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── AVATAR SECTION ───────────────────────────────────────── */
function AvatarSection({ name, avatar, tempAvatar, isChanged, onFileChange, onCamera, onRemove, onCancelChange }) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [showCam,   setShowCam]   = useState(false);
  const [dragging,  setDragging]  = useState(false);
  const fileRef   = useRef(null);
  const menuRef   = useRef(null);
  const displayAv = tempAvatar || avatar;

  useEffect(() => {
    const fn = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) onFileChange({ target:{ files:[f], value:'' } });
  };

  return (
    <>
      <AnimatePresence>{showCam && <CameraModal onCapture={d => { onCamera(d); setShowCam(false); }} onClose={() => setShowCam(false)}/>}</AnimatePresence>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { onFileChange(e); setMenuOpen(false); }} />

      <div className="flex flex-col items-center gap-3">
        <div className="relative" ref={menuRef}>
          <motion.button
            onClick={() => setMenuOpen(o => !o)}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            whileHover={{ scale:1.03 }} whileTap={{ scale:.97 }}
            className={`relative w-28 h-28 rounded-full overflow-hidden border-4 flex items-center justify-center transition-all ${
              dragging ? 'border-[#4ADE80] scale-105' : isChanged ? 'border-amber-400' : 'border-[#E5EDE8]'
            }`}
            style={{ boxShadow:'0 0 0 4px rgba(17,64,45,0.06)' }}>
            {displayAv
              ? <img src={displayAv} alt="Avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-[#11402D] to-[#1a5c3e] flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{getInitials(name)}</span>
                </div>}
            <div className="absolute inset-0 bg-[#0A1A0F]/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white"/>
            </div>
          </motion.button>
          {isChanged && (
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white"/>
            </div>
          )}
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:8, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-[#E5EDE8] rounded-2xl shadow-2xl p-1.5 z-30 min-w-[200px]">
                <button onClick={() => { fileRef.current?.click(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#F6F8F4] transition-colors text-sm font-medium text-[#0A1A0F]">
                  <Upload className="w-4 h-4 text-[#5A7060]"/> Upload Photo
                </button>
                <button onClick={() => { setShowCam(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#F6F8F4] transition-colors text-sm font-medium text-[#0A1A0F]">
                  <Camera className="w-4 h-4 text-[#5A7060]"/> Take Photo
                </button>
                {displayAv && (
                  <button onClick={() => { onRemove(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium text-red-500 border-t border-[#F0F5F2] mt-1">
                    <X className="w-4 h-4"/> Remove Photo
                  </button>
                )}
                {isChanged && (
                  <button onClick={() => { onCancelChange(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#F6F8F4] transition-colors text-sm text-[#5A7060] border-t border-[#F0F5F2] mt-1">
                    <RefreshCw className="w-4 h-4"/> Cancel Changes
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-[10px] text-[#A8BBB3] text-center leading-relaxed max-w-[120px]">
          Click to upload, take photo, or drag & drop
        </p>
        {isChanged && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            Unsaved
          </span>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ProfileSettings() {
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [savingPwd,   setSavingPwd]   = useState(false);
  const [toasts,      setToasts]      = useState([]);
  const [activeTab,   setActiveTab]   = useState('profile');
  const formRef = useRef(null);

  const [profile, setProfile] = useState({
    full_name:'', business_name:'', business_type:'', email:'',
    phone:'', role:'', role_raw:'', location:'', waste_types:'', created_at:'', avatar:'',
  });
  const [origProfile, setOrigProfile] = useState({});
  const [tempAvatar,  setTempAvatar]  = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  const [passwords, setPasswords] = useState({ current:'', next:'', confirm:'' });
  const [showPwd,   setShowPwd]   = useState({ current:false, next:false, confirm:false });
  const [pwdStrength, setPwdStrength] = useState(0);

  /* ── Toasts ── */
  const addToast = (type, message) => setToasts(p => [...p, { id:Date.now(), type, message }]);
  const removeToast = id => setToasts(p => p.filter(t => t.id !== id));

  /* ── Load ── */
  useEffect(() => {
    const saved = localStorage.getItem('profile_avatar');
    if (saved) setProfile(p => ({ ...p, avatar:saved }));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const r = await fetch(`${API_URL}/user`, { headers:{ Authorization:`Bearer ${token}` } });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || 'Failed');
        const saved = localStorage.getItem('profile_avatar');
        const p = {
          full_name: d.full_name||'', business_name: d.business_name||'',
          business_type: d.business_type||'', email: d.email||'',
          phone: d.phone||'', role: raw(d.role).label || d.role,
          role_raw: d.role, location: d.location||'',
          waste_types: d.waste_types||'', created_at: d.created_at,
          avatar: saved||'',
        };
        setProfile(p); setOrigProfile(p);
      } catch (e) { addToast('error', e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  /* ── Password strength ── */
  useEffect(() => {
    const p = passwords.next;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    setPwdStrength(s);
  }, [passwords.next]);

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][pwdStrength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#11402D', '#11402D'][pwdStrength];

  /* ── Handlers ── */
  const isChanged = () => {
    const keys = ['full_name','phone','business_name','business_type','location','waste_types'];
    return keys.some(k => profile[k] !== origProfile[k]) || avatarChanged;
  };

  const handleField = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3*1024*1024) return addToast('error', 'Image must be under 3 MB');
    if (!f.type.startsWith('image/')) return addToast('error', 'Please choose an image');
    const reader = new FileReader();
    reader.onload = ev => { setTempAvatar(ev.target.result); setAvatarChanged(true); addToast('success','Photo ready — save to apply'); };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  const handleCameraCapture = data => {
    setTempAvatar(data); setAvatarChanged(true);
    addToast('success','Photo captured — save to apply');
  };

  const handleRemoveAvatar = () => {
    setTempAvatar(null); setAvatarChanged(true);
    addToast('info','Photo removed — save to apply');
  };

  const handleCancelAvatar = () => {
    setTempAvatar(null); setAvatarChanged(false);
  };

  const handleSaveProfile = async e => {
    e.preventDefault();
    if (!isChanged()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const body = {
        full_name:profile.full_name, phone:profile.phone,
        business_name:profile.business_name, business_type:profile.business_type,
        location:profile.location, waste_types:profile.waste_types,
      };
      const r = await fetch(`${API_URL}/user`, {
        method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      if (avatarChanged) {
        if (tempAvatar) localStorage.setItem('profile_avatar', tempAvatar);
        else            localStorage.removeItem('profile_avatar');
        setProfile(p => ({ ...p, avatar: tempAvatar||'' }));
      }
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')||'{}'), ...body }));
      setOrigProfile({ ...profile });
      setTempAvatar(null); setAvatarChanged(false);
      addToast('success','Profile updated');
    } catch (e) { addToast('error', e.message); }
    finally { setSaving(false); }
  };

  const handleSavePassword = async e => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return addToast('error','Passwords do not match');
    if (passwords.next.length < 6)            return addToast('error','Password must be at least 6 characters');
    setSavingPwd(true);
    try {
      const token = localStorage.getItem('token');
      const r = await fetch(`${API_URL}/user/password`, {
        method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ current_password: passwords.current, new_password: passwords.next }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setPasswords({ current:'', next:'', confirm:'' });
      addToast('success','Password updated');
    } catch(e) { addToast('error', e.message); }
    finally { setSavingPwd(false); }
  };

  const handleReset = () => { setProfile({ ...origProfile }); setTempAvatar(null); setAvatarChanged(false); };

  const meta = raw(profile.role_raw);
  const RoleIcon = meta.Icon || User;

  const TABS = [
    { id:'profile',  label:'Profile',  Icon:User  },
    { id:'security', label:'Security', Icon:Lock  },
    { id:'danger',   label:'Danger',   Icon:Shield },
  ];

  if (loading) return (
    <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#E5EDE8] border-t-[#11402D] animate-spin"/>
        <p className="text-sm text-[#5A7060] font-medium">Loading profile…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1A0F] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
        select { -webkit-appearance:none; appearance:none; }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 40px #F6F8F4 inset; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#D8E8E0; border-radius:99px; }
        .shadow-card { box-shadow: 0 4px 20px -6px rgba(0,0,0,0.06), 0 2px 8px -4px rgba(0,0,0,0.02); }
        .shadow-soft { box-shadow: 0 2px 15px -3px rgba(0,0,0,0.05), 0 1px 4px -2px rgba(0,0,0,0.02); }
      `}</style>

      {/* Toast stack */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onClose={removeToast}/>
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* ── HERO CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-card border border-[#E5EDE8] overflow-hidden mb-8"
        >
          <div className="px-6 sm:px-8 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <AvatarSection
              name={profile.full_name}
              avatar={profile.avatar}
              tempAvatar={tempAvatar}
              isChanged={avatarChanged}
              onFileChange={handleFileChange}
              onCamera={handleCameraCapture}
              onRemove={handleRemoveAvatar}
              onCancelChange={handleCancelAvatar}
            />

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A1A0F] tracking-tight">
                  {profile.full_name || 'Your Name'}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${meta.pill}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  {profile.role || 'User'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-sm text-[#5A7060] mt-3">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#A8BBB3]" /> {profile.email || '—'}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#A8BBB3]" /> {profile.phone}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A8BBB3]" /> {profile.location}
                  </span>
                )}
                {profile.business_name && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#A8BBB3]" /> {profile.business_name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#A8BBB3]" /> Member since {fmt(profile.created_at)}
                </span>
              </div>

              {profile.waste_types && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-3.5">
                  {profile.waste_types.split(',').map(w => w.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-[11px] font-medium text-[#3D5248] bg-[#F6F8F4] border border-[#E5EDE8] px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Edit button */}
            <button
              onClick={() => { setActiveTab('profile'); formRef.current?.scrollIntoView({ behavior:'smooth' }); }}
              className="flex-shrink-0 flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl self-center sm:self-start transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background:'#11402D' }}
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </motion.div>

        {/* ── TAB BAR ── */}
        <div className="flex gap-1 bg-white border border-[#E5EDE8] rounded-2xl p-1 mb-6 shadow-soft">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#11402D] text-white shadow-md'
                  : 'text-[#5A7060] hover:text-[#0A1A0F] hover:bg-[#F6F8F4]'
              } ${tab.id === 'danger' && activeTab !== 'danger' ? 'hover:text-red-500' : ''}`}>
              <tab.Icon className="w-4 h-4"/>{tab.label}
            </button>
          ))}
        </div>

        {/* ── PANELS ── */}
        <AnimatePresence mode="wait">

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" ref={formRef}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
              transition={{ duration:0.25 }}>
              <form onSubmit={handleSaveProfile}>
                <div className="bg-white rounded-2xl border border-[#E5EDE8] overflow-hidden shadow-soft">
                  <div className="px-6 py-5 border-b border-[#F0F5F2]">
                    <h2 className="font-display text-xl text-[#0A1A0F]">Personal Information</h2>
                    <p className="text-xs text-[#5A7060] mt-0.5">Update your account details and business information.</p>
                  </div>
                  <div className="px-6 py-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Full Name">
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                          <input className={fc + " pl-10"} type="text" name="full_name"
                            value={profile.full_name} onChange={handleField} placeholder="Your full name"/>
                        </div>
                      </Field>
                      <Field label="Business Name">
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                          <input className={fc + " pl-10"} type="text" name="business_name"
                            value={profile.business_name} onChange={handleField} placeholder="Your business"/>
                        </div>
                      </Field>
                      <Field label="Email Address" note="Email is tied to your account and cannot be changed.">
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                          <input className={fc + " pl-10 opacity-50 cursor-not-allowed"} type="email"
                            value={profile.email} disabled/>
                        </div>
                      </Field>
                      <Field label="Phone Number">
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                          <input className={fc + " pl-10"} type="tel" name="phone"
                            value={profile.phone} onChange={handleField} placeholder="+254 7…"/>
                        </div>
                      </Field>
                      <Field label="Location">
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                          <input className={fc + " pl-10"} type="text" name="location"
                            value={profile.location} onChange={handleField} placeholder="City, County"/>
                        </div>
                      </Field>
                      <Field label="Business Type">
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                          <input className={fc + " pl-10"} type="text" name="business_type"
                            value={profile.business_type} onChange={handleField} placeholder="e.g. Hotel, Farm"/>
                        </div>
                      </Field>
                      <Field label="Waste Types" className="sm:col-span-2">
                        <div className="relative">
                          <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                          <input className={fc + " pl-10"} type="text" name="waste_types"
                            value={profile.waste_types} onChange={handleField}
                            placeholder="e.g. Organic, Plastic, Paper"/>
                        </div>
                      </Field>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-[#F0F5F2] bg-[#F6F8F4] flex items-center gap-3 flex-wrap">
                    <button type="submit" disabled={saving || !isChanged()}
                      className="flex items-center gap-2 text-sm font-bold text-white px-7 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background:'#11402D' }}>
                      {saving
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving…</>
                        : <><Save className="w-4 h-4"/>Save Changes</>}
                    </button>
                    <button type="button" onClick={handleReset} disabled={!isChanged()}
                      className="flex items-center gap-2 text-sm font-semibold text-[#5A7060] px-5 py-2.5 rounded-xl border border-[#E5EDE8] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <RefreshCw className="w-4 h-4"/>Reset
                    </button>
                    {isChanged() && (
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                        Unsaved changes
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <motion.div key="security"
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
              transition={{ duration:0.25 }}>
              <form onSubmit={handleSavePassword}>
                <div className="bg-white rounded-2xl border border-[#E5EDE8] overflow-hidden shadow-soft">
                  <div className="px-6 py-5 border-b border-[#F0F5F2] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#11402D]/6 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[#11402D]"/>
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-[#0A1A0F]">Change Password</h2>
                      <p className="text-xs text-[#5A7060] mt-0.5">Use a strong password you don't use elsewhere.</p>
                    </div>
                  </div>
                  <div className="px-6 py-6 space-y-5 max-w-md">
                    <Field label="Current Password">
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                        <input className={fc + " pl-10 pr-10"} type={showPwd.current ? 'text' : 'password'}
                          name="current" value={passwords.current} required
                          onChange={e => setPasswords(p => ({...p, current:e.target.value}))}
                          placeholder="Your current password"/>
                        <button type="button" onClick={() => setShowPwd(p => ({...p, current:!p.current}))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8BBB3] hover:text-[#0A1A0F] transition-colors">
                          {showPwd.current ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                    </Field>
                    <Field label="New Password">
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                        <input className={fc + " pl-10 pr-10"} type={showPwd.next ? 'text' : 'password'}
                          name="next" value={passwords.next} required minLength={6}
                          onChange={e => setPasswords(p => ({...p, next:e.target.value}))}
                          placeholder="Minimum 6 characters"/>
                        <button type="button" onClick={() => setShowPwd(p => ({...p, next:!p.next}))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8BBB3] hover:text-[#0A1A0F] transition-colors">
                          {showPwd.next ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                      {passwords.next && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4,5].map(i => (
                              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                                style={{ background: i <= pwdStrength ? strengthColor : '#E5EDE8' }}/>
                            ))}
                          </div>
                          <p className="text-[10px] font-bold" style={{ color: strengthColor }}>{strengthLabel}</p>
                        </div>
                      )}
                    </Field>
                    <Field label="Confirm Password">
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BBB3]"/>
                        <input className={fc + " pl-10 pr-10"} type={showPwd.confirm ? 'text' : 'password'}
                          name="confirm" value={passwords.confirm} required
                          onChange={e => setPasswords(p => ({...p, confirm:e.target.value}))}
                          placeholder="Repeat new password"/>
                        <button type="button" onClick={() => setShowPwd(p => ({...p, confirm:!p.confirm}))}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8BBB3] hover:text-[#0A1A0F] transition-colors">
                          {showPwd.confirm ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                      {passwords.confirm && (
                        <p className={`text-[10px] font-bold mt-1 ${passwords.next === passwords.confirm ? 'text-[#11402D]' : 'text-red-500'}`}>
                          {passwords.next === passwords.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </Field>
                  </div>
                  <div className="px-6 py-4 border-t border-[#F0F5F2] bg-[#F6F8F4]">
                    <button type="submit" disabled={savingPwd}
                      className="flex items-center gap-2 text-sm font-bold text-white px-7 py-2.5 rounded-xl disabled:opacity-60 hover:opacity-90 active:scale-[0.98] transition-all"
                      style={{ background:'#11402D' }}>
                      {savingPwd
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Updating…</>
                        : <><Lock className="w-4 h-4"/>Update Password</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── DANGER TAB ── */}
          {activeTab === 'danger' && (
            <motion.div key="danger"
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
              transition={{ duration:0.25 }}>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-soft">
                  <div className="px-6 py-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5 text-amber-500"/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0A1A0F] mb-1">Deactivate Account</h3>
                      <p className="text-sm text-[#5A7060] leading-relaxed max-w-lg">
                        Temporarily disable your account. Your data is preserved and you can reactivate by signing in again.
                      </p>
                      <button onClick={() => {
                        if (window.confirm('Deactivate your account? You can reactivate by signing in again.')) {
                          addToast('info','Account deactivation initiated. You will be signed out shortly.');
                        }
                      }}
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-700 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                        Deactivate Account
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-red-200 overflow-hidden shadow-soft">
                  <div className="px-6 py-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Trash2 className="w-5 h-5 text-red-500"/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0A1A0F] mb-1">Delete Account Permanently</h3>
                      <p className="text-sm text-[#5A7060] leading-relaxed max-w-lg">
                        Permanently delete your account, all listings, transaction history, and data from the ReVive platform. This action is irreversible.
                      </p>
                      <button onClick={() => {
                        const confirmed = window.prompt('Type DELETE to confirm permanent account deletion:');
                        if (confirmed === 'DELETE') addToast('error','Account deletion requested. Our team will process it within 24 hours.');
                        else if (confirmed !== null) addToast('error','You must type DELETE exactly to confirm.');
                      }}
                        className="mt-4 flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 transition-colors">
                        <Trash2 className="w-4 h-4"/> Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}