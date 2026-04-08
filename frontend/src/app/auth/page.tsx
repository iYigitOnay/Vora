'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import Image from 'next/image';
import api from '@/lib/api';
import { ActivityLevel, Gender, Goal, Persona } from '@/types/auth';
import { 
  Flame, Zap, Sparkles, 
  Mail, Lock, User, Ruler, Weight, Target, Calendar,
  ChevronRight, ChevronLeft
} from 'lucide-react';

// Soft Underlined Input Component
const UnderlinedInput = ({ label, icon: Icon, ...props }: any) => (
  <div className="group relative w-full mb-6">
    <label className="block text-[9px] font-bold text-vora-tertiary mb-1 uppercase tracking-[0.2em] opacity-60 group-focus-within:text-vora-accent transition-colors">
      {label}
    </label>
    <div className="relative flex items-center">
      {Icon && <Icon className="absolute left-0 w-3.5 h-3.5 text-vora-tertiary opacity-30 group-focus-within:text-vora-accent transition-colors" />}
      <input
        {...props}
        autoComplete="off"
        className={`w-full bg-transparent border-b border-vora-border/40 py-2.5 ${Icon ? 'pl-7' : 'pl-0'} focus:border-vora-accent outline-none transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
    </div>
  </div>
);

export default function AuthPage() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lottieData, setLottieData] = useState(null);

  useEffect(() => {
    fetch('/moody-wolf.json').then(res => res.json()).then(data => setLottieData(data));
  }, []);

  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', age: '' as any,
    gender: 'MALE' as Gender, height: '' as any, weight: '' as any, targetWeight: '' as any,
    activityLevel: 'MODERATELY_ACTIVE' as ActivityLevel, goal: 'MAINTAIN_WEIGHT' as Goal,
    selectedPersona: 'CHARCOAL' as Persona,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleGoalChange = (goal: Goal) => {
    setFormData({ ...formData, goal });
    if (goal === 'LOSE_WEIGHT') { setTheme('aura-light'); setFormData(prev => ({ ...prev, selectedPersona: 'ARCTIC' })); }
    else if (goal === 'GAIN_WEIGHT') { setTheme('forge-mode'); setFormData(prev => ({ ...prev, selectedPersona: 'OBSIDIAN' })); }
    else { setTheme('neural-dark'); setFormData(prev => ({ ...prev, selectedPersona: 'CHARCOAL' })); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : { 
        ...formData, 
        age: Number(formData.age),
        height: Number(formData.height), 
        weight: Number(formData.weight), 
        targetWeight: Number(formData.targetWeight) 
      };
      const res = await api.post(endpoint, payload);
      localStorage.setItem('vora_access_token', res.data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bağlantı hatası.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vora-background text-vora-primary flex items-center justify-center p-4 transition-colors duration-1000 font-sans select-none overflow-hidden">
      
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-vora-background/95 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-44 h-44">
              {lottieData && <Lottie animationData={lottieData} loop={true} />}
            </div>
            <p className="text-vora-accent font-bold tracking-[0.4em] text-[9px] mt-6 animate-pulse uppercase">VORA ANALİZ EDİYOR</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-vora-surface rounded-[2.5rem] border border-vora-border/20 shadow-2xl relative overflow-hidden h-[640px]">
        
        {/* INFO PANEL (Logo & Slogan) */}
        <motion.div 
          animate={{ x: isLogin ? '100%' : 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 80, restDelta: 0.001 }}
          className="absolute inset-y-0 left-0 w-full md:w-1/2 p-12 bg-gradient-to-br from-vora-accent/[0.05] to-transparent flex flex-col justify-center items-center text-center z-20 border-x border-vora-border/10 h-full"
        >
          <div className="flex flex-col items-center">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Image src="/vorakurt.png" alt="Vora" width={145} height={145} className="mb-10 drop-shadow-2xl opacity-95" />
            </motion.div>
            <h1 className="text-4xl font-light tracking-[0.6em] mb-4 pl-[0.6em]">VORA</h1>
            <div className="h-[1px] w-12 bg-vora-accent/30 mb-8" />
            <p className="text-vora-secondary text-[11px] font-medium tracking-[0.2em] leading-relaxed max-w-[220px] uppercase opacity-70">
              İçindeki Potansiyeli Şekillendir
            </p>
          </div>

          <div className="absolute bottom-12 flex flex-col items-center">
            <h3 className="text-[12px] font-bold tracking-[0.2em] text-vora-primary mb-1 uppercase text-center w-full">
              {isLogin ? 'Değişimi Başlat' : 'Yuvana Dön'}
            </h3>
            <button 
              onClick={() => { setIsLogin(!isLogin); setStep(1); }}
              className="group text-vora-accent text-[9px] font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-1 w-full"
            >
              <span className="text-center">{isLogin ? 'Kayıt Ol' : 'Giriş Yap'}</span>
              <div className="h-[1px] w-6 bg-vora-accent/40 group-hover:w-10 transition-all mx-auto" />
            </button>
          </div>
        </motion.div>

        {/* FORM PANEL */}
        <motion.div 
          animate={{ x: isLogin ? 0 : '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 120 }}
          className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center z-30"
        >
          <div className="w-full max-w-[340px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form 
                  key="login" 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                  className="space-y-12"
                >
                  <div className="text-center space-y-2 mb-10">
                    <h2 className="text-2xl font-light tracking-[0.4em] uppercase">YUVANA DÖN</h2>
                    <p className="text-vora-tertiary text-[9px] tracking-[0.2em] uppercase opacity-50 font-bold">Giriş Yap</p>
                  </div>
                  <div className="space-y-4">
                    <UnderlinedInput label="E-POSTA" icon={Mail} type="email" required placeholder="adiniz@email.com" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                    <UnderlinedInput label="ŞİFRE" icon={Lock} type="password" required placeholder="••••••••" value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-vora-accent text-vora-on-accent text-[11px] font-bold py-5 rounded-full tracking-[0.4em] uppercase shadow-xl shadow-vora-accent/10 hover:brightness-105 active:scale-[0.98] transition-all">SİSTEME ERİŞ</button>
                </motion.form>
              ) : (
                <div className="w-full">
                  <div className="flex gap-1.5 mb-12 px-2">
                    {[1, 2, 3, 4].map(s => <div key={s} className={`h-[1px] flex-1 transition-all duration-700 ${s <= step ? 'bg-vora-accent shadow-[0_0_8px_rgba(var(--color-accent),0.4)]' : 'bg-white/10'}`} />)}
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.form 
                        key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        onSubmit={(e) => { e.preventDefault(); if (formData.firstName && formData.email && formData.password.length >= 6) nextStep(); }}
                        className="space-y-8"
                      >
                        <div className="text-center space-y-2 mb-10">
                          <h2 className="text-xl font-light tracking-[0.3em] uppercase">KİMLİK</h2>
                          <p className="text-vora-tertiary text-[8px] tracking-[0.2em] uppercase opacity-50 font-bold italic">Sana nasıl seslenelim?</p>
                        </div>
                        <UnderlinedInput label="İSİM" icon={User} type="text" required placeholder="Adınız Soyadınız" value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
                        <UnderlinedInput label="E-POSTA" icon={Mail} type="email" required placeholder="adiniz@email.com" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                        <UnderlinedInput label="ŞİFRE" icon={Lock} type="password" required placeholder="Minimum 6 Karakter" value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                        <button type="submit" disabled={!formData.firstName || !formData.email || formData.password.length < 6} className="w-full border border-vora-border/40 text-vora-accent text-[10px] font-bold py-4 rounded-full tracking-[0.3em] uppercase hover:bg-vora-accent/5 disabled:opacity-20 transition-all">İLERİ</button>
                      </motion.form>
                    )}

                    {step === 2 && (
                      <motion.form 
                        key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                        className="space-y-8"
                      >
                        <div className="text-center space-y-2 mb-10">
                          <h2 className="text-xl font-light tracking-[0.3em] uppercase">BİYOMETRİ</h2>
                          <p className="text-vora-tertiary text-[8px] tracking-[0.2em] uppercase opacity-50 font-bold italic">Fiziksel haritanı çıkaralım</p>
                        </div>
                        
                        <div className="flex justify-around mb-10 border-b border-vora-border/20 pb-6">
                          {[
                            { id: 'MALE', l: 'ERKEK', i: '♂' },
                            { id: 'FEMALE', l: 'KADIN', i: '♀' }
                          ].map(g => (
                            <button type="button" key={g.id} onClick={() => setFormData({...formData, gender: g.id as Gender})} className={`text-[11px] font-bold tracking-widest flex flex-col items-center gap-2 transition-all ${formData.gender === g.id ? 'text-vora-accent' : 'text-vora-tertiary opacity-30 hover:opacity-100'}`}>
                              <span className="text-2xl">{g.i}</span>
                              <span>{g.l}</span>
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                          <UnderlinedInput label="YAŞ" icon={Calendar} type="number" required placeholder="25" value={formData.age} onChange={(e:any) => setFormData({...formData, age: e.target.value})} />
                          <UnderlinedInput label="BOY (CM)" icon={Ruler} type="number" required placeholder="180" value={formData.height} onChange={(e:any) => setFormData({...formData, height: e.target.value})} />
                          <UnderlinedInput label="KİLO (KG)" icon={Weight} type="number" required placeholder="75" value={formData.weight} onChange={(e:any) => setFormData({...formData, weight: e.target.value})} />
                          <UnderlinedInput label="HEDEF (KG)" icon={Target} type="number" required placeholder="70" value={formData.targetWeight} onChange={(e:any) => setFormData({...formData, targetWeight: e.target.value})} />
                        </div>
                        
                        <div className="flex gap-6 pt-6">
                          <button type="button" onClick={prevStep} className="flex-1 text-[9px] font-bold tracking-[0.3em] text-vora-tertiary uppercase hover:text-vora-secondary">GERİ</button>
                          <button type="submit" className="flex-[2] border border-vora-border/40 text-vora-accent text-[10px] font-bold py-4 rounded-full tracking-[0.3em] uppercase hover:bg-vora-accent/5 transition-all">DEVAM ET</button>
                        </div>
                      </motion.form>
                    )}

                    {step === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="text-center space-y-2 mb-8">
                          <h2 className="text-xl font-light tracking-[0.3em] uppercase">TEMPO</h2>
                          <p className="text-vora-tertiary text-[8px] tracking-[0.2em] uppercase opacity-50 font-bold italic">Günlük enerjin nasıl?</p>
                        </div>
                        <div className="space-y-3">
                          {[
                            { id: 'SEDENTARY', l: 'Minimalist', d: 'Masa başı iş, az hareket alanı.' },
                            { id: 'LIGHTLY_ACTIVE', l: 'Dengeli', d: 'Kısa yürüyüşler, hafif egzersiz.' },
                            { id: 'MODERATELY_ACTIVE', l: 'Dinamik', d: 'Haftada 3-5 gün düzenli spor.' },
                            { id: 'VERY_ACTIVE', l: 'Atletik', d: 'Hergün yoğun antrenman / ağır iş.' }
                          ].map(act => (
                            <button 
                              type="button"
                              key={act.id} 
                              onClick={() => setFormData({...formData, activityLevel: act.id as ActivityLevel})}
                              className={`w-full p-5 rounded-2xl border text-left transition-all ${formData.activityLevel === act.id ? 'border-vora-accent bg-vora-accent/5' : 'border-vora-border/10 opacity-40 hover:opacity-100'}`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[11px] font-bold tracking-widest uppercase">{act.l}</span>
                                {formData.activityLevel === act.id && <Zap className="w-3 h-3 text-vora-accent fill-vora-accent" />}
                              </div>
                              <p className="text-[9px] font-medium text-vora-secondary uppercase tracking-tight opacity-80 leading-relaxed">{act.d}</p>
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-6 pt-8">
                          <button type="button" onClick={prevStep} className="flex-1 text-[9px] font-bold tracking-[0.3em] text-vora-tertiary uppercase opacity-40">GERİ</button>
                          <button type="button" onClick={nextStep} className="flex-[2] border border-vora-border/40 text-vora-accent text-[10px] font-bold py-4 rounded-full tracking-[0.3em] uppercase hover:bg-vora-accent/5">SON ADIM</button>
                        </div>
                      </motion.div>
                    )}

                    {step === 4 && (
                      <motion.div key="s4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-8 text-center">
                        <div className="text-center space-y-2 mb-6">
                          <h2 className="text-xl font-light tracking-[0.3em] uppercase">VİZYON</h2>
                          <p className="text-vora-tertiary text-[8px] tracking-[0.2em] uppercase opacity-50 font-bold italic">Senin tercihin, senin sistemin</p>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-[9px] font-bold text-vora-tertiary mb-3 uppercase tracking-widest">Hedefin Nedir?</p>
                            <div className="grid grid-cols-3 gap-3">
                              {[{ id: 'LOSE_WEIGHT', icon: Sparkles, l: 'DİYET' }, { id: 'MAINTAIN_WEIGHT', icon: Zap, l: 'DENGE' }, { id: 'GAIN_WEIGHT', icon: Flame, l: 'GÜÇ' }].map(g => (
                                <button type="button" key={g.id} onClick={() => setFormData({...formData, goal: g.id as Goal})} className={`p-3.5 rounded-xl border transition-all ${formData.goal === g.id ? 'border-vora-accent bg-vora-accent/5' : 'border-vora-border/10 opacity-30'}`}>
                                  <g.icon className={`w-4.5 h-4.5 mx-auto mb-2 ${formData.goal === g.id ? 'text-vora-accent' : 'text-vora-tertiary'}`} />
                                  <span className="text-[8px] font-bold tracking-widest">{g.l}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold text-vora-tertiary mb-3 uppercase tracking-widest">Persona / Tema Seçimi</p>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { id: 'ARCTIC', icon: Sparkles, l: 'ARCTIC', t: 'aura-light' },
                                { id: 'CHARCOAL', icon: Zap, l: 'CHARCOAL', t: 'neural-dark' },
                                { id: 'OBSIDIAN', icon: Flame, l: 'OBSIDIAN', t: 'forge-mode' }
                              ].map(p => (
                                <button type="button" key={p.id} onClick={() => { setFormData({...formData, selectedPersona: p.id as Persona}); setTheme(p.t as any); }} className={`p-3.5 rounded-xl border transition-all ${formData.selectedPersona === p.id ? 'border-vora-accent bg-vora-accent/5 shadow-[0_0_15px_rgba(var(--color-accent),0.1)]' : 'border-vora-border/10 opacity-30 hover:opacity-100'}`}>
                                  <p.icon className={`w-4.5 h-4.5 mx-auto mb-2 ${formData.selectedPersona === p.id ? 'text-vora-accent' : 'text-vora-tertiary'}`} />
                                  <span className="text-[8px] font-bold tracking-widest">{p.l}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-6 pt-4">
                          <button type="button" onClick={prevStep} className="flex-1 text-[10px] font-bold tracking-[0.4em] text-vora-tertiary uppercase opacity-40">GERİ</button>
                          <button type="button" onClick={handleSubmit} className="flex-[2] bg-vora-accent text-vora-on-accent text-[11px] font-bold py-5 rounded-full tracking-[0.5em] uppercase shadow-2xl shadow-vora-accent/20">SİSTEMİ BAŞLAT</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {error && <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-vora-error/10 text-vora-error text-[10px] font-bold py-2 px-6 rounded-full border border-vora-error/20 uppercase tracking-widest z-[60]">{error}</div>}
      
      <footer className="absolute bottom-10 left-1/2 -translate-x-1/2 text-vora-tertiary font-mono text-[8px] tracking-[0.8em] uppercase opacity-20">VORA REHAB SYST // 2026</footer>
    </div>
  );
}
