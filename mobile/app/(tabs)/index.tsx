import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  Dimensions, RefreshControl, ActivityIndicator, StyleSheet, Platform, Modal, Pressable, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "../../store/useThemeStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Zap, Droplets, TrendingUp, Plus, ScanLine, Search, Activity, X, MapPin, Camera, Check, ChevronRight } from "lucide-react-native";
import api from "../../lib/api";
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get("window");

// Premium Touchable
const TouchablePremium = ({ children, onPress, style, activeOpacity = 0.7 }: any) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };
  return (
    <TouchableOpacity activeOpacity={activeOpacity} onPress={handlePress} style={style}>
      {children}
    </TouchableOpacity>
  );
};

// Premium Bottom Sheet
const BottomSheet = ({ isVisible, onClose, title, children, height: sheetHeight = 350 }: any) => {
  const { colors, themeName } = useThemeStore();
  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose}>
          <BlurView intensity={25} tint={themeName === 'NEURAL_DARK' || themeName === 'FORGE_MODE' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        </Pressable>
        
        <View style={[styles.bottomSheet, { backgroundColor: colors.surface, minHeight: sheetHeight }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.textSecondary + '20' }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{title}</Text>
            <TouchablePremium onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.textPrimary + '05' }]}>
              <X size={20} color={colors.textSecondary} />
            </TouchablePremium>
          </View>
          <View style={styles.sheetContent}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function Dashboard() {
  const { colors, themeName, setTheme } = useThemeStore();
  const { user: authUser, isAuthenticated, logout, setAuth, token } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  
  // Besin Ekleme State'leri
  const [scannedFood, setScannedFood] = useState<any>(null);
  const [foodAmount, setFoodAmount] = useState("100");
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingFood, setIsFetchingFood] = useState(false);
  const [mealType, setMealType] = useState("SNACK");

  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get("/dashboard/summary");
      const summary = response.data;
      setData(summary);

      if (summary.user && (authUser?.firstName !== summary.user.firstName)) {
        setAuth({ ...authUser, email: authUser?.email || '', id: authUser?.id || 'user', firstName: summary.user.firstName, persona: summary.user.persona }, token || '');
      }

      if (summary.user?.persona && summary.user.persona !== themeName) {
        setTheme(summary.user.persona);
      }
    } catch (error: any) {
      if (error.response?.status === 401) logout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current_weather=true");
      const d = await res.json();
      setWeather(d.current_weather);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDashboardData();
    fetchWeather();
  }, []);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    fetchDashboardData();
    fetchWeather();
  }, []);

  const handleAddWater = async (amount: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveModal(null);
    try {
      await api.post('/meal/water', { amount });
      fetchDashboardData();
    } catch (error) {}
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (isFetchingFood) return;
    setIsFetchingFood(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const response = await api.get(`/food/barcode/${barcode}`);
      setScannedFood(response.data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Barkod sorgulama hatasi:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsFetchingFood(false);
    }
  };

  const handleLogMeal = async () => {
    if (!scannedFood || !foodAmount) return;
    setLoading(true);
    try {
      await api.post('/meal/log', {
        foodId: scannedFood.id,
        amount: Number(foodAmount),
        type: mealType,
        date: new Date().toISOString()
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setActiveModal(null);
      setScannedFood(null);
      fetchDashboardData();
    } catch (error) {
      console.error("Ögün kaydetme hatasi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  const summary = data || {};
  const userName = summary.user?.firstName || authUser?.firstName || '...';
  const targets = summary.targets || { calories: 2500, protein: 150, carbs: 300, fat: 80, water: 2500 };
  const consumed = summary.consumed || { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
  const auraStreak = summary.auraStreak || 0;
  const remainingKcal = targets.calories - consumed.calories;
  const progressPercent = Math.min((consumed.calories / targets.calories) * 100, 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>Selam, {userName}</Text>
            <View style={styles.headerMeta}>
              <View style={[styles.auraBadge, { backgroundColor: `${colors.success}10` }]}>
                <TrendingUp size={10} color={colors.success} strokeWidth={2.5} />
                <Text style={[styles.auraText, { color: colors.success }]}>{auraStreak} GÜN SERİ</Text>
              </View>
              {weather && (
                <View style={styles.weatherBadge}>
                  <MapPin size={10} color={colors.textSecondary} opacity={0.5} />
                  <Text style={[styles.weatherText, { color: colors.textSecondary }]}>İSTANBUL, {Math.round(weather.temperature)}°</Text>
                </View>
              )}
            </View>
          </View>
          <TouchablePremium style={[styles.profileCircle, { borderColor: `${colors.accent}20` }]}>
            <Image source={require("../../assets/vorakurt.png")} style={styles.avatar} />
          </TouchablePremium>
        </View>

        {/* HERO: REMAINING CALORIES */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          <View style={styles.heroHeader}>
             <View style={[styles.heroIconBox, { backgroundColor: `${colors.accent}15` }]}>
               <Zap size={20} color={colors.accent} fill={colors.accent} />
             </View>
             <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>KALAN ENERJİ POTANSİYELİ</Text>
          </View>
          
          <View style={styles.heroMain}>
            <Text style={[styles.heroValue, { color: colors.textPrimary }]}>
              {remainingKcal.toLocaleString()}
            </Text>
            <Text style={[styles.heroUnit, { color: colors.textSecondary }]}>KCAL</Text>
          </View>

          <View style={[styles.heroProgressBase, { backgroundColor: `${colors.textPrimary}05` }]}>
             <View style={[styles.heroProgressFill, { backgroundColor: colors.accent, width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.heroFooter}>
             <View style={styles.heroStat}>
                <Text style={[styles.heroStatValue, { color: colors.textPrimary }]}>{consumed.calories}</Text>
                <Text style={[styles.heroStatLabel, { color: colors.textSecondary }]}>ALINAN</Text>
             </View>
             <View style={[styles.heroStatDivider, { backgroundColor: colors.textSecondary + '20' }]} />
             <View style={styles.heroStat}>
                <Text style={[styles.heroStatValue, { color: colors.textPrimary }]}>{targets.calories}</Text>
                <Text style={[styles.heroStatLabel, { color: colors.textSecondary }]}>HEDEF</Text>
             </View>
          </View>
        </View>

        {/* Action Bar */}
        <View style={styles.actionRow}>
          {[
            { label: 'Ara', icon: Search, id: 'search', bg: `${colors.textPrimary}05`, iconCol: colors.textSecondary },
            { label: 'Barkod', icon: ScanLine, id: 'barcode', bg: `${colors.textPrimary}05`, iconCol: colors.textPrimary },
            { label: 'Besin', icon: Plus, id: 'food', bg: colors.accent, iconCol: colors.textOnAccent },
            { label: 'Su', icon: Droplets, id: 'water', bg: '#3b82f610', iconCol: '#3b82f6' },
          ].map((action) => (
            <TouchablePremium key={action.id} onPress={() => setActiveModal(action.id)} style={styles.actionItem}>
              <View style={[styles.actionCircle, { backgroundColor: action.bg }]}>
                <action.icon size={22} color={action.iconCol} strokeWidth={2} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
            </TouchablePremium>
          ))}
        </View>

        {/* Bento Stats */}
        <View style={styles.dualBento}>
          <View style={[styles.bentoHalf, { backgroundColor: colors.surface, flex: 1.3 }]}>
            <View style={styles.bentoHeaderRow}>
              <Text style={[styles.labelSmall, { color: colors.textSecondary }]}>MAKROLAR</Text>
              <Activity size={12} color={colors.textSecondary} opacity={0.3} />
            </View>
            <MacroLine label="PROTEİN" current={consumed.protein} target={targets.protein} color="#ef4444" />
            <MacroLine label="KARB" current={consumed.carbs} target={targets.carbs} color="#3b82f6" />
            <MacroLine label="YAĞ" current={consumed.fat} target={targets.fat} color="#f59e0b" />
          </View>
          
          <TouchablePremium onPress={() => setActiveModal('water')} style={[styles.bentoHalf, { backgroundColor: colors.surface, flex: 0.7, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={[styles.labelSmall, { color: colors.textSecondary, marginBottom: 15 }]}>SU</Text>
            <Text style={[styles.waterMain, { color: colors.textPrimary }]}>{(consumed.water / 1000).toFixed(1)}<Text style={styles.waterUnit}>L</Text></Text>
            <Droplets size={22} color="#3b82f6" style={{ marginTop: 15 }} />
          </TouchablePremium>
        </View>
      </ScrollView>

      {/* --- MODALS --- */}

      {/* Su Modali */}
      <BottomSheet isVisible={activeModal === 'water'} onClose={() => setActiveModal(null)} title="Su Girişi">
        <View style={styles.waterGrid}>
          {[
            { ml: 200, l: 'Küçük', i: '🥛' }, { ml: 330, l: 'Orta', i: '🥤' }, { ml: 500, l: 'Büyük', i: '🍼' },
          ].map((item) => (
            <TouchablePremium key={item.ml} onPress={() => handleAddWater(item.ml)} style={[styles.waterBox, { backgroundColor: `${colors.textPrimary}05` }]}>
              <Text style={styles.waterEmoji}>{item.i}</Text>
              <Text style={[styles.waterAmount, { color: colors.textPrimary }]}>{item.ml}ml</Text>
              <Text style={[styles.waterLabel, { color: colors.textSecondary }]}>{item.l}</Text>
            </TouchablePremium>
          ))}
        </View>
      </BottomSheet>

      {/* Barkod Modali (Kamera ve Sonuç) */}
      <BottomSheet 
        isVisible={activeModal === 'barcode'} 
        onClose={() => { setActiveModal(null); setScannedFood(null); }} 
        title={scannedFood ? "Besin Detayları" : "Barkod Tara"} 
        height={height * 0.7}
      >
        {!scannedFood ? (
          permission?.granted ? (
            <View style={styles.cameraWrapper}>
              <CameraView 
                style={styles.camera} 
                onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
              />
              <View style={styles.cameraOverlay}>
                <View style={[styles.scannerFrame, { borderColor: colors.accent }]} />
                {isFetchingFood && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.accent} />
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.permissionBox}>
              <Camera size={48} color={colors.textSecondary} opacity={0.3} />
              <Text style={[styles.permissionText, { color: colors.textSecondary }]}>KAMERA ERİŞİMİ GEREKLİ</Text>
              <TouchableOpacity onPress={requestPermission} style={[styles.permissionButton, { backgroundColor: colors.accent }]}>
                 <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>İZİN VER</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.foodResultHeader}>
              <Text style={[styles.foodName, { color: colors.textPrimary }]}>{scannedFood.name}</Text>
              <Text style={[styles.foodBrand, { color: colors.textSecondary }]}>{scannedFood.brand || 'Genel Marka'}</Text>
            </View>
            
            <View style={styles.macroGrid}>
              <MacroMini label="KALORİ" value={scannedFood.calories} unit="kcal" />
              <MacroMini label="PROTEİN" value={scannedFood.protein} unit="g" />
              <MacroMini label="KARB" value={scannedFood.carbs} unit="g" />
              <MacroMini label="YAĞ" value={scannedFood.fat} unit="g" />
            </View>

            <View style={styles.inputRow}>
               <UnderlinedInputSmall 
                label="MİKTAR (gram/ml)" 
                placeholder="100" 
                value={foodAmount} 
                onChangeText={setFoodAmount} 
                keyboardType="number-pad" 
               />
            </View>

            <View style={styles.mealTypeRow}>
               {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map(type => (
                 <TouchableOpacity 
                  key={type} 
                  onPress={() => setMealType(type)} 
                  style={[styles.mealTypeBtn, { backgroundColor: mealType === type ? colors.accent : `${colors.textPrimary}05` }]}
                 >
                   <Text style={[styles.mealTypeLabel, { color: mealType === type ? colors.textOnAccent : colors.textSecondary }]}>
                     {type === 'BREAKFAST' ? 'SABAH' : type === 'LUNCH' ? 'ÖĞLE' : type === 'DINNER' ? 'AKŞAM' : 'ARA'}
                   </Text>
                 </TouchableOpacity>
               ))}
            </View>

            <TouchableOpacity onPress={handleLogMeal} style={[styles.saveButton, { backgroundColor: colors.accent }]}>
               <Text style={[styles.buttonText, { color: colors.textOnAccent }]}>GÜNLÜĞE EKLE</Text>
               <Check size={18} color={colors.textOnAccent} />
            </TouchableOpacity>
          </ScrollView>
        )}
      </BottomSheet>

      {/* Arama & Manuel Ekleme Modalları (İskelet) */}
      <BottomSheet isVisible={activeModal === 'search' || activeModal === 'food'} onClose={() => setActiveModal(null)} title={activeModal === 'search' ? "Besin Ara" : "Besin Ekle"}>
        <View style={styles.placeholderBox}>
           <Search size={48} color={colors.accent} opacity={0.2} />
           <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>BU MODÜL GELİŞTİRİLİYOR...</Text>
        </View>
      </BottomSheet>

    </SafeAreaView>
  );
}

const MacroMini = ({ label, value, unit }: any) => {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.macroMiniBox, { backgroundColor: `${colors.textPrimary}05` }]}>
      <Text style={[styles.macroMiniLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.macroMiniValue, { color: colors.textPrimary }]}>{Math.round(value)}<Text style={{ fontSize: 8 }}>{unit}</Text></Text>
    </View>
  );
};

const UnderlinedInputSmall = ({ label, ...props }: any) => {
  const { colors } = useThemeStore();
  return (
    <View style={{ marginBottom: 15, flex: 1 }}>
      <Text style={{ fontSize: 9, fontWeight: '800', color: colors.textSecondary, marginBottom: 8, letterSpacing: 1 }}>{label}</Text>
      <TextInput style={{ borderBottomWidth: 1, borderBottomColor: colors.surfaceRaised, color: colors.textPrimary, paddingVertical: 10, fontSize: 18, fontWeight: '300' }} {...props} />
    </View>
  );
};

const MacroLine = ({ label, current, target, color }: any) => {
  const { colors } = useThemeStore();
  const percent = Math.min((current / target) * 100, 100) || 0;
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontSize: 8.5, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 }}>{label}</Text>
        <Text style={{ fontSize: 10, fontWeight: '400', color: colors.textPrimary }}>{Math.round(current)}g</Text>
      </View>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: `${colors.textPrimary}03`, overflow: 'hidden' }}>
        <View style={{ width: `${percent}%`, height: '100%', backgroundColor: color }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 15, paddingBottom: 100 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  welcomeTitle: { fontSize: 32, fontWeight: '300', letterSpacing: -1 },
  auraBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
  auraText: { fontSize: 8.5, fontWeight: '600', marginLeft: 4, letterSpacing: 0.5 },
  weatherBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  weatherText: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.5 },
  profileCircle: { width: 52, height: 52, borderRadius: 21, borderWidth: 1, padding: 3 },
  avatar: { width: '100%', height: '100%', borderRadius: 18 },
  heroCard: { borderRadius: 45, padding: 35, marginBottom: 35, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 30, elevation: 1 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  heroIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  heroLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  heroMain: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 30, justifyContent: 'center' },
  heroValue: { fontSize: 72, fontWeight: '200', letterSpacing: -3 },
  heroUnit: { fontSize: 16, fontWeight: '400', marginLeft: 8, opacity: 0.5 },
  heroProgressBase: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 30 },
  heroProgressFill: { height: '100%', borderRadius: 4 },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  heroStat: { alignItems: 'center' },
  heroStatValue: { fontSize: 16, fontWeight: '500' },
  heroStatLabel: { fontSize: 8, fontWeight: '800', marginTop: 4, opacity: 0.5 },
  heroStatDivider: { width: 1, height: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 5 },
  actionItem: { alignItems: 'center' },
  actionCircle: { width: 64, height: 64, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 10.5, fontWeight: '400' },
  dualBento: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  bentoHalf: { borderRadius: 35, padding: 25, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 15, elevation: 1 },
  bentoHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  labelSmall: { fontSize: 8.5, fontWeight: '700', letterSpacing: 1.2 },
  waterMain: { fontSize: 32, fontWeight: '300' },
  waterUnit: { fontSize: 16, fontWeight: '200', opacity: 0.4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  bottomSheet: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingBottom: Platform.OS === 'ios' ? 45 : 30 },
  sheetHandle: { width: 35, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  sheetTitle: { fontSize: 22, fontWeight: '300', letterSpacing: 1 },
  closeButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetContent: { flex: 1 },
  waterGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  waterBox: { width: (width - 80) / 3, paddingVertical: 25, borderRadius: 25, alignItems: 'center' },
  waterEmoji: { fontSize: 32, marginBottom: 10 },
  waterAmount: { fontSize: 17, fontWeight: '300' },
  waterLabel: { fontSize: 9, fontWeight: '600', opacity: 0.4, marginTop: 2 },
  cameraWrapper: { height: 350, borderRadius: 30, overflow: 'hidden' },
  camera: { flex: 1 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scannerFrame: { width: 220, height: 220, borderWidth: 1, borderRadius: 40, opacity: 0.5 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  permissionBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  permissionText: { marginVertical: 20, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  permissionButton: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  buttonText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 3 },
  foodResultHeader: { marginBottom: 25 },
  foodName: { fontSize: 24, fontWeight: '300', letterSpacing: 1 },
  foodBrand: { fontSize: 12, fontWeight: '600', opacity: 0.5, marginTop: 5 },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  macroMiniBox: { width: (width - 90) / 4, paddingVertical: 15, borderRadius: 20, alignItems: 'center' },
  macroMiniLabel: { fontSize: 7, fontWeight: '900', opacity: 0.5, marginBottom: 5 },
  macroMiniValue: { fontSize: 14, fontWeight: '200' },
  inputRow: { marginBottom: 25 },
  mealTypeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  mealTypeBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  mealTypeLabel: { fontSize: 9, fontWeight: '800' },
  saveButton: { height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15 },
  placeholderBox: { height: 200, alignItems: 'center', justifyContent: 'center', opacity: 0.3 },
  placeholderText: { marginTop: 15, fontSize: 10, fontWeight: '800', letterSpacing: 2 }
});