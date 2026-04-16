'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, PersonaTheme } from '@/store/useThemeStore';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import Image from 'next/image';
import api from '@/lib/api';
import { ActivityLevel, Gender, Goal } from '@/types/auth';
import { 
  Flame, Zap, Sparkles, 
  Mail, Lock, User, Ruler, Weight, Target, Calendar,
  ChevronRight, ChevronLeft, Droplets, Leaf, Check, AlertCircle,
  Eye, EyeOff
} from 'lucide-react';

// Soft Underlined Input Component
const UnderlinedInput = ({ label, icon: Icon, type, ...props }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="group relative w-full mb-6">
      <label className="block text-[9px] font-bold text-vora-tertiary mb-1 uppercase tracking-[0.2em] opacity-60 group-focus-within:text-vora-accent transition-colors">
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-0 w-3.5 h-3.5 text-vora-tertiary opacity-30 group-focus-within:text-vora-accent transition-colors" />}
        <input
          {...props}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          autoComplete="off"
          className={`w-full bg-transparent border-b border-vora-border/40 py-2.5 ${Icon ? 'pl-7' : 'pl-0'} ${isPassword ? 'pr-8' : 'pr-0'} focus:border-vora-accent outline-none transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-vora-primary`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 p-1.5 hover:bg-vora-accent/5 rounded-full transition-colors group/eye"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={showPassword ? 'eye-off' : 'eye-on'}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.15 }}
                className="text-vora-tertiary opacity-30 group-hover/eye:opacity-100 group-hover/eye:text-vora-accent transition-all"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </button>
        )}
      </div>
    </div>
  );
};

const PasswordRequirement = ({ met, label }: { met: boolean, label: string }) => (
  <div className={`flex items-center gap-2 transition-all duration-500 ${met ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${met ? 'bg-vora-accent text-vora-on-accent' : 'bg-white/10 text-transparent'}`}>
      <Check className="w-2.5 h-2.5" />
    </div>
    <span className={`text-[8px] font-bold uppercase tracking-widest ${met ? 'text-vora-accent' : 'text-vora-tertiary'}`}>
      {label}
    </span>
  </div>
);

export default function AuthPage() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lottieData, setLottieData] = useState(null);
  const [verificationMode, setVerificationMode] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    fetch('/moody-wolf.json').then(res => res.json()).then(data => setLottieData(data));
    
    // Sayfa yenilendiğinde yarım kalan doğrulamayı hatırla
    const pendingEmail = localStorage.getItem('vora_pending_verification');
    if (pendingEmail) {
      setFormData(prev => ({ ...prev, email: pendingEmail }));
      setVerificationMode(true);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', age: '' as any,
    gender: 'MALE' as Gender, height: '' as any, weight: '' as any, targetWeight: '' as any,
    activityLevel: 'MODERATELY_ACTIVE' as ActivityLevel, goal: 'MAINTAIN_WEIGHT' as Goal,
    selectedPersona: 'EMBER_MOSS' as any,
  });

  // Password Validation Logic
  const passwordCriteria = useMemo(() => ({
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    numberOrSpecial: /[0-9\W]/.test(formData.password)
  }), [formData.password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const nextStep = async () => {
    if (step === 1) {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/auth/check-email?email=${formData.email}`);
        if (res.data.exists) {
          setError("Bu e-posta zaten kullanımda.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Email check error:", err);
      } finally {
        setLoading(false);
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleGoalChange = (goal: Goal) => {
    setFormData({ ...formData, goal });
  };

  const handleNumericInput = (field: string, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(0, 3);
    setFormData({ ...formData, [field]: cleaned });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Sadece tek rakam
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Otomatik odaklanma
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6).split('');
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (i < 6 && /^[0-9]$/.test(char)) {
          newOtp[i] = char;
        }
      });
      setOtp(newOtp);
      
      // Son dolu kutucuğa veya bir sonrakine odaklan
      const nextIndex = Math.min(pastedData.length, 5);
      document.getElementById(`otp-${nextIndex}`)?.focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const code = otp.join('');
      await api.post('/auth/verify-email', { email: formData.email, code });
      localStorage.removeItem('vora_pending_verification'); // Başarılıysa temizle
      // Doğrulama başarılı, şimdi giriş yapalım
      const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
      saveTokensAndRedirect(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Doğrulama başarısız.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email: formData.email });
      setResetStep(2); // Kod girme adımına geç
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İstek gönderilemedi.');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Lütfen 6 haneli kodu girin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', { 
        email: formData.email, 
        code, 
        newPassword: formData.password 
      });
      setForgotPasswordMode(false);
      setIsLogin(true);
      setError('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.');
      setTimeout(() => setError(null), 5000);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre sıfırlama başarısız.');
      setLoading(false);
    }
  };

  const saveTokensAndRedirect = (data: any) => {
    localStorage.setItem('vora_access_token', data.access_token);
    localStorage.setItem('vora_refresh_token', data.refresh_token);
    localStorage.setItem('vora_user_id', data.userId || ''); 
    router.push('/');
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
      
      if (!isLogin) {
        // Kayıt başarılı, email'i hatırla ve doğrulama ekranına geç
        localStorage.setItem('vora_pending_verification', formData.email);
        setVerificationMode(true);
        setLoading(false);
      } else {
        saveTokensAndRedirect(res.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === 'Lütfen önce e-posta adresinizi doğrulayın.') {
        localStorage.setItem('vora_pending_verification', formData.email);
        setVerificationMode(true);
      } else {
        setError(msg || 'Giriş yapılamadı.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-vora-background text-vora-primary flex items-center justify-center p-4 transition-colors duration-1000 font-sans select-none overflow-hidden fixed inset-0">
      
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-vora-background/95 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-44 h-44">
              {lottieData && <Lottie animationData={lottieData} loop={true} />}
            </div>
            <p className="text-vora-accent font-bold tracking-[0.4em] text-[9px] mt-6 animate-pulse uppercase">VORA ANALİZ EDİYOR</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-vora-surface rounded-[2.5rem] border border-vora-border/20 shadow-2xl relative overflow-hidden h-[640px]">
        
        <motion.div 
          initial={false}
          animate={{ x: isLogin ? 0 : '100%' }}
          transition={{ type: "spring", damping: 26, stiffness: 80 }}
          className="absolute inset-y-0 left-0 w-full md:w-1/2 p-12 bg-gradient-to-br from-vora-accent/[0.05] to-transparent flex flex-col justify-center items-center text-center z-20 border-x border-vora-border/10 h-full"
        >
          <div className="flex flex-col items-center">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Image src="/vorakurt.png" alt="Vora" width={145} height={145} style={{ height: 'auto' }} className="mb-10 drop-shadow-2xl opacity-95" />
            </motion.div>
            <h1 className="text-4xl font-light tracking-[0.6em] mb-4 pl-[0.6em]">VORA</h1>
            <div className="h-[1px] w-12 bg-vora-accent/30 mb-8" />
            <p className="text-vora-secondary text-[11px] font-medium tracking-[0.2em] leading-relaxed max-w-[220px] uppercase opacity-70">
              İçindeki Potansiyeli Şekillendir
            </p>
          </div>

          <div className="absolute bottom-12 flex flex-col items-center">
            <h3 className="text-[12px] font-bold tracking-[0.2em] text-vora-primary mb-1 uppercase text-center w-full opacity-40">
              {isLogin ? 'Değişimi Başlat' : 'Yuvana Dön'}
            </h3>
            <button 
              onClick={() => { 
                setIsLogin(!isLogin); 
                setStep(1); 
                setError(null); 
                setVerificationMode(false);
                setOtp(['', '', '', '', '', '']);
                localStorage.removeItem('vora_pending_verification');
              }}
              className="group text-vora-accent text-[9px] font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-1 w-full"
            >
              <span className="text-center">{isLogin ? 'Kayıt Ol' : 'Giriş Yap'}</span>
              <div className="h-[1px] w-6 bg-vora-accent/40 group-hover:w-10 transition-all mx-auto" />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={false}
          animate={{ x: isLogin ? '100%' : 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 120 }}
          className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center z-30"
        >
          <div className="w-full max-w-[340px]">
            <AnimatePresence mode="wait">
              {forgotPasswordMode ? (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10 relative"
                >
                  {/* Back Button */}
                  <button 
                    onClick={() => {
                      if (resetStep === 1) {
                        setForgotPasswordMode(false);
                      } else {
                        setResetStep(resetStep - 1);
                      }
                    }}
                    className="absolute -top-12 -left-4 p-2 text-vora-tertiary hover:text-vora-accent transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">GERİ</span>
                    </div>
                  </button>

                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-light tracking-[0.3em] uppercase">KURTARMA</h2>
                    <p className="text-vora-tertiary text-[9px] tracking-[0.2em] uppercase opacity-50 font-bold">
                      {resetStep === 1 ? 'E-POSTA ADRESİNİZİ GİRİN' : resetStep === 2 ? 'KODU DOĞRULAYIN' : 'YENİ ŞİFRE BELİRLEYİN'}
                    </p>
                  </div>

                  {resetStep === 1 && (
                    <div className="space-y-8">
                      <UnderlinedInput label="E-POSTA" icon={Mail} type="email" placeholder="adiniz@email.com" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                      <button onClick={handleForgotPassword} className="w-full bg-vora-accent text-vora-on-accent text-[11px] font-bold py-5 rounded-full tracking-[0.4em] uppercase shadow-xl hover:brightness-105 transition-all">KOD GÖNDER</button>
                    </div>
                  )}

                  {resetStep === 2 && (
                    <div className="space-y-10">
                      <div className="flex justify-between gap-2">
                        {otp.map((digit, idx) => (
                          <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} className="w-11 h-14 bg-vora-surface border border-vora-border/20 rounded-xl text-center text-xl font-bold text-vora-accent focus:border-vora-accent outline-none transition-all" />
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          const code = otp.join('');
                          if (code.length < 6) {
                            setError('Lütfen 6 haneli kodu girin.');
                            return;
                          }
                          // Kodun doğruluğunu resetStep 3'te handleResetPassword içinde zaten kontrol ediyoruz, 
                          // ancak kullanıcı deneyimi için burada da bir "check" eklenebilir. 
                          // Mevcut yapıda handleResetPassword hem kodu hem yeni şifreyi gönderiyor.
                          // Bu yüzden sadece kodun dolu olduğunu kontrol edip geçiyoruz.
                          setResetStep(3);
                        }} 
                        className="w-full bg-vora-accent text-vora-on-accent text-[11px] font-bold py-5 rounded-full tracking-[0.4em] uppercase shadow-xl transition-all"
                      >
                        DEVAM ET
                      </button>
                    </div>
                  )}

                  {resetStep === 3 && (
                    <div className="space-y-8">
                      <UnderlinedInput label="YENİ ŞİFRE" icon={Lock} type="password" placeholder="••••••••" value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                      <button onClick={handleResetPassword} className="w-full bg-vora-accent text-vora-on-accent text-[11px] font-bold py-5 rounded-full tracking-[0.4em] uppercase shadow-xl transition-all">ŞİFREYİ GÜNCELLE</button>
                    </div>
                  )}

                  <button 
                    onClick={() => { setForgotPasswordMode(false); setResetStep(1); }}
                    className="w-full text-[9px] font-bold text-vora-tertiary tracking-[0.2em] uppercase hover:text-vora-accent transition-colors text-center"
                  >
                    Giriş Ekranına Dön
                  </button>
                </motion.div>
              ) : verificationMode ? (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-10 text-center"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-vora-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8 text-vora-accent" />
                    </div>
                    <h2 className="text-2xl font-light tracking-[0.3em] uppercase">DOĞRULAMA</h2>
                    <p className="text-vora-tertiary text-[9px] tracking-[0.2em] uppercase opacity-60 leading-relaxed">
                      {formData.email} adresine gönderilen 6 haneli kodu girin.
                    </p>
                  </div>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handlePaste}
                        className="w-11 h-14 bg-vora-surface border border-vora-border/20 rounded-xl text-center text-xl font-bold text-vora-accent focus:border-vora-accent focus:ring-4 focus:ring-vora-accent/5 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="space-y-6">
                    <button 
                      onClick={handleVerify}
                      disabled={otp.some(d => !d) || loading}
                      className="w-full bg-vora-accent text-vora-on-accent text-[11px] font-bold py-5 rounded-full tracking-[0.4em] uppercase shadow-xl shadow-vora-accent/20 disabled:opacity-20 transition-all"
                    >
                      KODU DOĞRULA
                    </button>
                    
                    <button 
                      onClick={async () => {
                        await api.post('/auth/resend-verification', { email: formData.email });
                        setSuccess('Yeni kod gönderildi.');
                        setTimeout(() => setSuccess(null), 3000);
                      }}
                      className="text-[9px] font-bold text-vora-tertiary tracking-[0.2em] uppercase hover:text-vora-accent transition-colors"
                    >
                      Kodu Tekrar Gönder
                    </button>
                  </div>
                </motion.div>
              ) : isLogin ? (
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
                    <div className="relative">
                      <UnderlinedInput label="ŞİFRE" icon={Lock} type="password" required placeholder="••••••••" value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                      <button 
                        type="button" 
                        onClick={() => setForgotPasswordMode(true)}
                        className="absolute -bottom-6 right-0 text-[8px] font-bold text-vora-tertiary uppercase tracking-widest hover:text-vora-accent transition-colors"
                      >
                        Şifremi Unuttum?
                      </button>
                    </div>
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
                        onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                        className="space-y-8"
                      >
                        <div className="text-center space-y-2 mb-6">
                          <h2 className="text-xl font-light tracking-[0.3em] uppercase">KİMLİK</h2>
                          <p className="text-vora-tertiary text-[8px] tracking-[0.2em] uppercase opacity-50 font-bold italic">Sana nasıl seslenelim?</p>
                        </div>
                        <div className="space-y-2">
                          <UnderlinedInput label="İSİM" icon={User} type="text" required placeholder="Adınız Soyadınız" value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
                          <UnderlinedInput label="E-POSTA" icon={Mail} type="email" required placeholder="adiniz@email.com" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} />
                          <UnderlinedInput label="ŞİFRE" icon={Lock} type="password" required placeholder="Minimum 8 Karakter" value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />
                        </div>

                        {/* Password Requirements Checklist */}
                        <div className="bg-white/[0.02] border border-vora-border/10 rounded-2xl p-4 space-y-2.5">
                          <PasswordRequirement met={passwordCriteria.length} label="EN AZ 8 KARAKTER" />
                          <PasswordRequirement met={passwordCriteria.uppercase} label="EN AZ 1 BÜYÜK HARF" />
                          <PasswordRequirement met={passwordCriteria.numberOrSpecial} label="RAKAM VEYA ÖZEL KARAKTER" />
                        </div>

                        <button type="submit" disabled={!formData.firstName || !formData.email || !isPasswordValid} className="w-full bg-vora-accent text-vora-on-accent text-[10px] font-bold py-4 rounded-full tracking-[0.3em] uppercase disabled:opacity-20 transition-all shadow-lg shadow-vora-accent/10">İLERİ</button>
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
                          <UnderlinedInput label="YAŞ" icon={Calendar} type="number" required placeholder="25" value={formData.age} onChange={(e:any) => handleNumericInput('age', e.target.value)} />
                          <UnderlinedInput label="BOY (CM)" icon={Ruler} type="number" required placeholder="180" value={formData.height} onChange={(e:any) => handleNumericInput('height', e.target.value)} />
                          <UnderlinedInput label="KİLO (KG)" icon={Weight} type="number" required placeholder="75" value={formData.weight} onChange={(e:any) => handleNumericInput('weight', e.target.value)} />
                          <UnderlinedInput label="HEDEF (KG)" icon={Target} type="number" required placeholder="70" value={formData.targetWeight} onChange={(e:any) => handleNumericInput('targetWeight', e.target.value)} />
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
                                <span className="text-[11px] font-bold tracking-widest uppercase text-vora-primary">{act.l}</span>
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
                                <button type="button" key={g.id} onClick={() => handleGoalChange(g.id as Goal)} className={`p-3.5 rounded-xl border transition-all ${formData.goal === g.id ? 'border-vora-accent bg-vora-accent/5' : 'border-vora-border/10 opacity-30'}`}>
                                  <g.icon className={`w-4.5 h-4.5 mx-auto mb-2 ${formData.goal === g.id ? 'text-vora-accent' : 'text-vora-tertiary'}`} />
                                  <span className="text-[8px] font-bold tracking-widest">{g.l}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold text-vora-tertiary mb-3 uppercase tracking-widest">Persona / Tema Seçimi</p>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { id: 'EMBER_MOSS', icon: Leaf, l: 'EMBER', t: 'EMBER_MOSS' },
                                { id: 'AURA_LIGHT', icon: Sparkles, l: 'AURA', t: 'AURA_LIGHT' },
                                { id: 'NEURAL_DARK', icon: Zap, l: 'NEURAL', t: 'NEURAL_DARK' },
                                { id: 'FORGE_MODE', icon: Flame, l: 'FORGE', t: 'FORGE_MODE' }
                              ].map(p => (
                                <button type="button" key={p.id} onClick={() => { setFormData({...formData, selectedPersona: p.id as any}); setTheme(p.t as PersonaTheme); }} className={`p-3 rounded-xl border transition-all ${formData.selectedPersona === p.id ? 'border-vora-accent bg-vora-accent/5 shadow-[0_0_15px_rgba(var(--color-accent),0.1)]' : 'border-vora-border/10 opacity-30 hover:opacity-100'}`}>
                                  <p.icon className={`w-4 h-4 mx-auto mb-1.5 ${formData.selectedPersona === p.id ? 'text-vora-accent' : 'text-vora-tertiary'}`} />
                                  <span className="text-[7px] font-bold tracking-widest">{p.l}</span>
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

      <AnimatePresence>
        {(error || success) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }}
            className={`absolute top-10 left-1/2 -translate-x-1/2 ${error ? 'bg-vora-error/10 text-vora-error border-vora-error/20' : 'bg-vora-accent/10 text-vora-accent border-vora-accent/20'} text-[10px] font-bold py-2.5 px-8 rounded-full border uppercase tracking-[0.2em] z-[60] flex items-center gap-3 backdrop-blur-md shadow-2xl`}
          >
            {error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {error || success}
          </motion.div>
        )}
      </AnimatePresence>
      
      <footer className="absolute bottom-10 left-1/2 -translate-x-1/2 text-vora-tertiary font-mono text-[8px] tracking-[0.8em] uppercase opacity-20">VORA REHAB SYST // 2026</footer>
    </div>
  );
}
