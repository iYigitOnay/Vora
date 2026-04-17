import React, { useState, useRef } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  KeyboardAvoidingView, Platform, Keyboard, ScrollView,
  TouchableWithoutFeedback, StyleSheet, ActivityIndicator, Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  User, Mail, Lock, ArrowRight, Eye, EyeOff, Calendar, 
  Ruler, Weight, Target, Zap, Flame, Sparkles, Check, ChevronLeft 
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore, PersonaTheme } from "../../store/useThemeStore";
import api from "../../lib/api";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");

const UnderlinedInput = ({ label, icon: Icon, value, onChangeText, isPassword, placeholder, keyboardType, returnKeyType, onSubmitEditing, inputRef }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useThemeStore();

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderBottomColor: colors.surface }]}>
        {Icon && <Icon size={16} color={colors.textSecondary} style={{ marginRight: 12, opacity: 0.6 }} />}
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { color: colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor="#334155"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !showPassword : false}
          keyboardType={keyboardType}
          autoCapitalize="none"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={false}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
            {showPassword ? (
              <EyeOff size={18} color={colors.accent} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function Register() {
  const router = useRouter();
  const { colors, setTheme } = useThemeStore();
  const { setAuth } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', age: '',
    gender: 'MALE', height: '', weight: '', targetWeight: '',
    activityLevel: 'MODERATELY_ACTIVE', goal: 'MAINTAIN_WEIGHT',
    selectedPersona: 'EMBER_MOSS',
  });

  const nextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s + 1);
  };
  const prevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s - 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        targetWeight: Number(formData.targetWeight)
      };
      
      const response = await api.post("/auth/register", payload);
      const { access_token } = response.data;
      
      // Store'u guncelle ve direkt iceri gir
      setAuth({ 
        email: formData.email, 
        id: 'new-user', 
        firstName: formData.firstName,
        persona: formData.selectedPersona 
      }, access_token);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.response?.data?.message || "KAYIT HATASI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContainer}>
              
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image source={require("../../assets/vorakurt.png")} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>VORA</Text>
                <View style={[styles.divider, { backgroundColor: colors.accent }]} />
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  İÇİNDEKİ POTANSİYELİ ŞEKİLLENDİR
                </Text>
              </View>

              <View style={styles.progressContainer}>
                {[1, 2, 3, 4].map(s => (
                  <View key={s} style={[styles.progressBar, { backgroundColor: s <= step ? colors.accent : colors.surface, opacity: s <= step ? 1 : 0.3 }]} />
                ))}
              </View>

              <View style={styles.formContainer}>
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error.toString().toUpperCase()}</Text>
                  </View>
                )}

                {step === 1 && (
                  <View>
                    <View style={styles.formHeader}><Text style={[styles.formTitle, { color: colors.textPrimary }]}>KİMLİK</Text></View>
                    <UnderlinedInput label="ADINIZ SOYADINIZ" icon={User} placeholder="Ad Soyad" value={formData.firstName} onChangeText={(v:string) => setFormData({...formData, firstName: v})} />
                    <UnderlinedInput label="E-POSTA ADRESİ" icon={Mail} placeholder="adiniz@email.com" value={formData.email} onChangeText={(v:string) => setFormData({...formData, email: v})} keyboardType="email-address" />
                    <UnderlinedInput label="GÜÇLÜ BİR ŞİFRE" icon={Lock} placeholder="********" value={formData.password} onChangeText={(v:string) => setFormData({...formData, password: v})} isPassword />
                    <TouchableOpacity onPress={nextStep} style={[styles.actionButton, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>İLERİ</Text>
                      <ArrowRight size={18} color={colors.textOnAccent} />
                    </TouchableOpacity>
                  </View>
                )}

                {step === 2 && (
                  <View>
                    <View style={styles.formHeader}><Text style={[styles.formTitle, { color: colors.textPrimary }]}>BİYOMETRİ</Text></View>
                    <View style={styles.genderRow}>
                      {['MALE', 'FEMALE'].map(g => (
                        <TouchableOpacity key={g} onPress={() => setFormData({...formData, gender: g})} style={[styles.genderButton, { borderBottomColor: formData.gender === g ? colors.accent : 'transparent', borderBottomWidth: 2 }]}>
                          <Text style={[styles.genderText, { color: formData.gender === g ? colors.accent : colors.textSecondary }]}>{g === 'MALE' ? 'ERKEK' : 'KADIN'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.gridInputs}>
                      <View style={{ width: '48%' }}><UnderlinedInput label="YAŞ" icon={Calendar} placeholder="25" value={formData.age} onChangeText={(v:string) => setFormData({...formData, age: v})} keyboardType="number-pad" /></View>
                      <View style={{ width: '48%' }}><UnderlinedInput label="BOY (CM)" icon={Ruler} placeholder="180" value={formData.height} onChangeText={(v:string) => setFormData({...formData, height: v})} keyboardType="number-pad" /></View>
                      <View style={{ width: '48%' }}><UnderlinedInput label="KİLO (KG)" icon={Weight} placeholder="75" value={formData.weight} onChangeText={(v:string) => setFormData({...formData, weight: v})} keyboardType="number-pad" /></View>
                      <View style={{ width: '48%' }}><UnderlinedInput label="HEDEF (KG)" icon={Target} placeholder="70" value={formData.targetWeight} onChangeText={(v:string) => setFormData({...formData, targetWeight: v})} keyboardType="number-pad" /></View>
                    </View>
                    <View style={styles.stepActions}>
                      <TouchableOpacity onPress={prevStep}><Text style={[styles.backLink, { color: colors.textSecondary }]}>GERİ</Text></TouchableOpacity>
                      <TouchableOpacity onPress={nextStep} style={[styles.actionButton, { backgroundColor: colors.accent, flex: 1, marginLeft: 20 }]}>
                        <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>DEVAM ET</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {step === 3 && (
                  <View>
                    <View style={styles.formHeader}><Text style={[styles.formTitle, { color: colors.textPrimary }]}>TEMPO</Text></View>
                    {['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE'].map(lvl => (
                      <TouchableOpacity key={lvl} onPress={() => setFormData({...formData, activityLevel: lvl})} style={[styles.optionCard, { borderBottomColor: formData.activityLevel === lvl ? colors.accent : colors.surface + '40' }]}>
                        <Text style={[styles.optionTitle, { color: formData.activityLevel === lvl ? colors.accent : colors.textPrimary }]}>{lvl.replace('_', ' ')}</Text>
                        {formData.activityLevel === lvl && <Check size={16} color={colors.accent} />}
                      </TouchableOpacity>
                    ))}
                    <View style={styles.stepActions}>
                      <TouchableOpacity onPress={prevStep}><Text style={[styles.backLink, { color: colors.textSecondary }]}>GERİ</Text></TouchableOpacity>
                      <TouchableOpacity onPress={nextStep} style={[styles.actionButton, { backgroundColor: colors.accent, flex: 1, marginLeft: 20 }]}>
                        <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>SON ADIM</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {step === 4 && (
                  <View>
                    <View style={styles.formHeader}><Text style={[styles.formTitle, { color: colors.textPrimary }]}>VİZYON</Text></View>
                    <View style={styles.personaGrid}>
                      {['EMBER_MOSS', 'AURA_LIGHT', 'NEURAL_DARK', 'FORGE_MODE'].map(p => (
                        <TouchableOpacity key={p} onPress={() => { setFormData({...formData, selectedPersona: p}); setTheme(p as PersonaTheme); }} style={[styles.personaButton, { borderColor: formData.selectedPersona === p ? colors.accent : colors.surface, borderWidth: 1 }]}>
                          <View style={[styles.personaDot, { backgroundColor: p === 'EMBER_MOSS' ? '#D4A853' : p === 'AURA_LIGHT' ? '#5B21B6' : p === 'NEURAL_DARK' ? '#00C9A7' : '#F59E0B' }]} />
                          <Text style={[styles.personaText, { color: formData.selectedPersona === p ? colors.accent : colors.textSecondary }]}>{p.split('_')[0]}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.stepActions}>
                      <TouchableOpacity onPress={prevStep}><Text style={[styles.backLink, { color: colors.textSecondary }]}>GERİ</Text></TouchableOpacity>
                      <TouchableOpacity onPress={handleRegister} disabled={loading} style={[styles.actionButton, { backgroundColor: colors.accent, flex: 1, marginLeft: 20 }]}>
                        {loading ? <ActivityIndicator color={colors.textOnAccent} /> : (
                          <>
                            <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>BAŞLAT</Text>
                            <Sparkles size={18} color={colors.textOnAccent} />
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    ZATEN BURADAYIM <Text style={{ color: colors.accent, fontWeight: 'bold' }}>GİRİŞ YAP</Text>
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1, paddingHorizontal: 40, paddingVertical: 40, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 10 },
  logoContainer: { marginBottom: 20 },
  logo: { width: 140, height: 140, borderRadius: 40 },
  title: { fontSize: 32, fontWeight: '200', letterSpacing: 10, marginBottom: 10, paddingLeft: 10 },
  divider: { height: 1, width: 40, marginBottom: 15, opacity: 0.3 },
  subtitle: { fontSize: 9, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', opacity: 0.5 },
  progressContainer: { flexDirection: 'row', gap: 5, marginVertical: 30, paddingHorizontal: 20 },
  progressBar: { height: 1, flex: 1, borderRadius: 1 },
  formContainer: { width: '100%', marginVertical: 10 },
  formHeader: { alignItems: 'center', marginBottom: 25 },
  formTitle: { fontSize: 14, fontWeight: '300', letterSpacing: 4, textTransform: 'uppercase' },
  inputContainer: { marginBottom: 20, width: '100%' },
  inputLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 },
  textInput: { flex: 1, fontSize: 15, fontWeight: '500', letterSpacing: 0.5 },
  actionButton: { height: 64, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  buttonText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 4, textTransform: 'uppercase' },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 16, marginBottom: 20 },
  errorText: { color: '#ef4444', fontSize: 9, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 25 },
  genderButton: { paddingVertical: 10, paddingHorizontal: 20 },
  genderText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  gridInputs: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stepActions: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  backLink: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  optionCard: { paddingVertical: 15, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  optionTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  personaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  personaButton: { width: (width - 100) / 2, height: 50, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
  personaDot: { width: 8, height: 8, borderRadius: 4 },
  personaText: { fontSize: 10, fontWeight: 'bold' },
  footer: { alignItems: 'center', marginTop: 50 },
  footerText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.5 }
});