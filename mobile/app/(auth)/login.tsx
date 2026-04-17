import React, { useState, useRef } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  KeyboardAvoidingView, Platform, Keyboard, ScrollView,
  TouchableWithoutFeedback, StyleSheet, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import api from "../../lib/api";
import * as Haptics from 'expo-haptics';

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

export default function Login() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

  const isFormValid = email.length > 0 && password.length >= 8;

  const handleLogin = async () => {
    if (!isFormValid || loading) return;
    
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token } = response.data;
      
      // Dashboard gercek ismi backend'den cekip store'u guncelleyecek
      setAuth({ 
        email: email, 
        id: 'user-id', 
        firstName: '' 
      }, access_token);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.response?.data?.message || "GİRİŞ YAPILAMADI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.innerContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image source={require("../../assets/vorakurt.png")} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>VORA</Text>
              <View style={[styles.divider, { backgroundColor: colors.accent }]} />
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>SİSTEMLERE ERİŞİM SAĞLANIYOR</Text>
            </View>

            <View style={styles.formContainer}>
              {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}
              <UnderlinedInput label="E-POSTA ADRESİ" icon={Mail} placeholder="adiniz@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
              <UnderlinedInput inputRef={passwordRef} label="GİZLİ ŞİFRE" icon={Lock} placeholder="••••••••" value={password} onChangeText={setPassword} isPassword returnKeyType="go" onSubmitEditing={handleLogin} />
              <TouchableOpacity onPress={handleLogin} disabled={!isFormValid || loading} activeOpacity={0.8} style={[styles.loginButton, { backgroundColor: colors.accent }, (!isFormValid || loading) && { opacity: 0.3 }]}>
                <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>{loading ? "BAĞLANILIYOR..." : "SİSTEME GİRİŞ YAP"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  HENÜZ KAYDIM YOK <Text style={{ color: colors.accent, fontWeight: 'bold' }}>HESAP OLUŞTUR</Text>
                </Text>
              </TouchableOpacity>
              <Text style={styles.versionText}>VORA REHAB SYST // 2026</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flexGrow: 1, paddingHorizontal: 40, paddingVertical: 60, alignItems: 'center', justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 20 },
  logoContainer: { marginBottom: 24 },
  logo: { width: 140, height: 140, borderRadius: 40 },
  title: { fontSize: 32, fontWeight: '200', letterSpacing: 10, marginBottom: 10 },
  divider: { height: 1, width: 40, marginBottom: 15, opacity: 0.3 },
  subtitle: { fontSize: 9, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', opacity: 0.5 },
  formContainer: { width: '100%', marginVertical: 40 },
  inputContainer: { marginBottom: 25 },
  inputLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 },
  textInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  loginButton: { height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  buttonText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 4 },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 16, marginBottom: 20 },
  errorText: { color: '#ef4444', fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  footer: { alignItems: 'center', marginBottom: 20 },
  footerText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.5 },
  versionText: { fontSize: 8, letterSpacing: 6, opacity: 0.2, marginTop: 15 }
});