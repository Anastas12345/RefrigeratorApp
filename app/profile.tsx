// app/profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { clearProfile, loadProfile, saveProfile } from "@/src/storage/profile";


const CARD_BORDER = "rgba(255,255,255,0.7)";

export default function ProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("Анастасія");
  const [email, setEmail] = useState("nastia@gmail.com");

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // проста перевірка email, щоб показати зелену галочку як на макеті
  const emailOk = useMemo(() => {
    const v = email.trim();
    return v.includes("@") && v.includes(".") && v.length >= 6;
  }, [email]);

  useEffect(() => {
    (async () => {
      try {
        const p = await loadProfile();
        if (p) {
          setName(p.name || "Анастасія");
          setEmail(p.email || "nastia@gmail.com");
          setSaved(true);
        }
      } catch {
        // ігноруємо
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    const n = name.trim();
    const e = email.trim();

    if (!n) {
      Alert.alert("Помилка", "Введи ім’я.");
      return;
    }
    if (!emailOk) {
      Alert.alert("Помилка", "Введи коректний email.");
      return;
    }

    await saveProfile({ name: n, email: e });
    setSaved(true);
    Alert.alert("Готово", "Профіль збережено локально ✅");
  };

  const onClear = async () => {
    await clearProfile();
    setName("");
    setEmail("");
    setSaved(false);
    Alert.alert("Очищено", "Локальні дані видалено.");
  };

  const onLogout = () => {
    // тут поки просто повертаємось на логін
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBlob} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Заголовок по центру і оранжевий */}
          <Text style={styles.title}>Профіль</Text>
          <Text style={styles.subtitle}>Заповни дані</Text>

          {/* Бейдж “Локально” */}
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark-outline" size={18} color={ORANGE} />
            <Text style={styles.badgeText}>Локально</Text>
          </View>

          {/* Карта */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="person-circle-outline" size={22} color={ORANGE} />
              <Text style={styles.cardTitle}>Дані користувача</Text>
            </View>

            {/* Ім’я */}
            <Text style={styles.label}>Ім’я</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={TEXT_GRAY} />
              <TextInput
                value={name}
                onChangeText={(v) => setName(v)}
                placeholder="Введи ім’я"
                placeholderTextColor={TEXT_GRAY}
                style={styles.input}
              />
            </View>

            {/* Email */}
            <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={TEXT_GRAY} />
              <TextInput
                value={email}
                onChangeText={(v) => setEmail(v)}
                placeholder="Введи email"
                placeholderTextColor={TEXT_GRAY}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
              {emailOk ? (<View style={styles.okDot}>
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                </View>
              ) : null}
            </View>

            {/* Зберегти */}
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
              onPress={onSave}
              disabled={loading}
            >
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Зберегти профіль</Text>
            </Pressable>

            {/* Нижні кнопки */}
            <View style={styles.row}>
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
                onPress={onClear}
              >
                <Ionicons name="trash-outline" size={18} color={TEXT_GRAY} />
                <Text style={styles.secondaryBtnText}>Очистити</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.dangerBtn, pressed && styles.btnPressed]}
                onPress={onLogout}
              >
                <Ionicons name="log-out-outline" size={18} color="#fff" />
                <Text style={styles.dangerBtnText}>Вийти</Text>
              </Pressable>
            </View>

            <Text style={styles.note}>
              * Дані зберігаються локально на телефоні (без сервера).
            </Text>

            {/* маленький статус */}
            <Text style={styles.savedLine}>
              Збережено: {saved ? "так ✅" : "ні ❌"}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF7FF";
const HEADER_BG = "#BFE9FF";
const TEXT_GRAY = "#7B8794";
const ERROR = "#E53935";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT_BG },

  headerBlob: {
    position: "absolute",
    top: -140,
    left: -80,
    right: -80,
    height: 240,
    backgroundColor: HEADER_BG,
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
    opacity: 0.75,
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  // ✅ Заголовок по центру + оранжевий
  title: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 0.3,
  },

  subtitle: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_GRAY, // ✅ сірий
  },

  badge: {
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  badgeText: { color: TEXT_GRAY, fontWeight: "800" },

  card: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "900", color: TEXT_GRAY }, // ✅ сірий

  label: { marginTop: 14, marginBottom: 6, fontSize: 14, fontWeight: "800", color: TEXT_GRAY }, // ✅ сірий

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(234,247,255,0.85)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(180,215,235,0.8)",
  },

  input: {
    flex: 1,
    color: TEXT_GRAY, // ✅ введений текст теж світло-сірий
    fontSize: 16,
    fontWeight: "800",
  },

  okDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
  },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: ORANGE,
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  row: { flexDirection: "row", gap: 12, marginTop: 12 },secondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(180,215,235,0.8)",
  },
  secondaryBtnText: { color: TEXT_GRAY, fontWeight: "900" },

  dangerBtn: {
    flex: 1,
    backgroundColor: "#D43B33",
    borderRadius: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  dangerBtnText: { color: "#fff", fontWeight: "900" },

  btnPressed: { opacity: 0.85 },

  note: {
    marginTop: 12,
    color: TEXT_GRAY, // ✅ сірий
    fontWeight: "700",
  },

  savedLine: {
    marginTop: 10,
    color: TEXT_GRAY, // ✅ сірий
    fontWeight: "900",
  },
});