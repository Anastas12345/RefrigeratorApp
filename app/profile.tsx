import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getMe, patchProfile, deleteProfile } from "@/src/api/userApi";
import { removeToken } from "@/src/storage/token";

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingMe, setLoadingMe] = useState(true);

  // ✅ поля профілю (приклад: name)
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // email зазвичай readonly

  // статус/помилка
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);

  const loadMe = async () => {
    try {
      setError(null);
      setLoadingMe(true);
      const me = await getMe();
      setEmail(me.email ?? "");
      setName(me.name ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося завантажити профіль");
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const onSave = async () => {
    try {
      setError(null);
      setLoading(true);

      // ✅ оновлюємо тільки те, що реально змінюється
      const updated = await patchProfile({ name: name.trim() });

      setName(updated.name ?? "");
      setEmail(updated.email ?? email);
      setSaved(true);
    } catch (e: any) {
      setSaved(false);
      setError(e?.message ?? "Помилка збереження");
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    // ❗️Це тільки очистка полів у UI
    setName("");
    setSaved(null);
    setError(null);
  };

  const onLogout = async () => {
    await removeToken();
    router.replace("/login");
  };

  const onDeleteProfile = () => {
    Alert.alert(
      "Видалити профіль?",
      "Ця дія видалить профіль на сервері. Продовжити?",
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Видалити",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProfile();
              await removeToken();
              router.replace("/login");
            } catch (e: any) {
              setError(e?.message ?? "Не вдалося видалити профіль");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBlob} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Профіль</Text>
          <Text style={styles.subtitle}>Налаштування акаунта</Text>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="person-outline" size={20} color={TEXT_GRAY} />
              <Text style={styles.cardTitle}>Дані</Text>
            </View>

            {loadingMe ? (
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <ActivityIndicator />
              </View>
            ) : (
              <>
                {/* Email (readonly) */}
                <Text style={styles.label}>Пошта</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={TEXT_GRAY} />
                  <TextInput
                    value={email}
                    editable={false}
                    style={[styles.input, { opacity: 0.75 }]}
                  />
                </View>

                {/* Name (editable) */}
                <Text style={styles.label}>Ім’я</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="text-outline" size={18} color={TEXT_GRAY} /><TextInput
                    value={name}
                    onChangeText={(v) => {
                      setName(v);
                      setSaved(null);
                    }}
                    placeholder="Введіть ім’я"
                    placeholderTextColor="#9AA7B2"
                    style={styles.input}
                  />
                  {!!name.trim() && (
                    <View style={styles.okDot}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </View>

                {!!error && (
                  <Text style={[styles.note, { color: ERROR, fontWeight: "900" }]}>
                    {error}
                  </Text>
                )}

                {/* Зберегти */}
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && styles.btnPressed,
                    loading && { opacity: 0.7 },
                  ]}
                  onPress={onSave}
                  disabled={loading}
                >
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    {loading ? "Збереження..." : "Зберегти профіль"}
                  </Text>
                </Pressable>

                {/* Нижні кнопки */}
                <View style={styles.row}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={onClear}
                    disabled={loading}
                  >
                    <Ionicons name="trash-outline" size={18} color={TEXT_GRAY} />
                    <Text style={styles.secondaryBtnText}>Очистити</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.dangerBtn,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={onLogout}
                    disabled={loading}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#fff" />
                    <Text style={styles.dangerBtnText}>Вийти</Text>
                  </Pressable>
                </View>

                {/* опціонально: видалити профіль */}
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteLink,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={onDeleteProfile}
                  disabled={loading}
                >
                  <Text style={styles.deleteLinkText}>Видалити профіль</Text>
                </Pressable>

                {/* статус */}
                <Text style={styles.savedLine}>
                  {saved === null ? "" : `Збережено: ${saved ? "так ✅" : "ні ❌"}`}
                </Text>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 👇 твої константи + стилі (залишив як у тебе)
const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF7FF";
const HEADER_BG = "#BFE9FF";
const TEXT_GRAY = "#7B8794";
const ERROR = "#E53935";
const CARD_BORDER = "rgba(180,215,235,0.8)";

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

  container: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },

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
    color: TEXT_GRAY,
  },

  card: {
    marginTop: 14,backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "900", color: TEXT_GRAY },

  label: { marginTop: 14, marginBottom: 6, fontSize: 14, fontWeight: "800", color: TEXT_GRAY },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(234,247,255,0.85)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  input: { flex: 1, color: TEXT_GRAY, fontSize: 16, fontWeight: "800" },

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

  row: { flexDirection: "row", gap: 12, marginTop: 12 },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: CARD_BORDER,
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

  note: { marginTop: 12, color: TEXT_GRAY, fontWeight: "700" },

  savedLine: { marginTop: 10, color: TEXT_GRAY, fontWeight: "900" },

  deleteLink: { marginTop: 12, alignItems: "center" },
  deleteLinkText: { color: "#D43B33", fontWeight: "900" },
});