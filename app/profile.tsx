import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { getMe, createProfile, deleteProfile } from "@/src/api/userApi";
import { getToken, saveToken, removeToken } from "@/src/storage/token";
import { clearSession } from "@/src/storage/session";

const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF7FF";
const CARD_BG = "#FFFFFF";
const TEXT_GRAY = "#7B8794";
const ERROR = "#E53935";

export default function ProfileScreen() {
  const router = useRouter();

  const [tokenInput, setTokenInput] = useState("");
  const [savedToken, setSavedToken] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [me, setMe] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const refreshSavedToken = async () => {
    const t = await getToken();
    setSavedToken(t);
  };

  useEffect(() => {
    refreshSavedToken();
  }, []);

  const onSaveToken = async () => {
    setError("");

    const t = tokenInput.trim();
    if (!t) {
      setError("Встав токен у поле вище.");
      return;
    }

    await saveToken(t);
    setTokenInput("");
    await refreshSavedToken();
    Alert.alert("Готово", "Токен збережено ✅");
  };

  const requireToken = async () => {
    const t = await getToken();
    if (!t) {
      setError("Немає access_token. Встав токен і натисни “Зберегти токен”.");
      return false;
    }
    return true;
  };

  const onGetMe = async () => {
    setError("");
    if (!(await requireToken())) return;

    setLoading(true);
    try {
      const data = await getMe();
      setMe(data);
    } catch (e: any) {
      setError(e?.message || "Не вдалося отримати профіль");
    } finally {
      setLoading(false);
    }
  };

  const onCreateProfile = async () => {
    setError("");
    if (!(await requireToken())) return;

    const e = email.trim();
    if (!e) {
      setError("Введи email для створення профілю.");
      return;
    }

    setLoading(true);
    try {
      const data = await createProfile(e);
      setMe(data);
      Alert.alert("Готово", "Профіль створено ✅");
    } catch (e: any) {
      setError(e?.message || "Не вдалося створити профіль");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteProfile = async () => {
    setError("");
    if (!(await requireToken())) return;

    Alert.alert("Підтвердження", "Видалити профіль?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteProfile();
            setMe(null);
            Alert.alert("Готово", "Профіль видалено ✅");
          } catch (e: any) {
            setError(e?.message || "Не вдалося видалити профіль");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const onClearToken = async () => {
    await removeToken();
    setSavedToken(null);
    setMe(null);
    Alert.alert("Ок", "Токен видалено.");
  };

  const onLogout = async () => {
    await clearSession();
    await removeToken();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Профіль</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Access token (вручну)</Text>

          <TextInput
            value={tokenInput}
            onChangeText={(v) => {
              setTokenInput(v);
              if (error) setError("");
            }}
            placeholder="Встав access_token сюди"
            placeholderTextColor="#9AA7B2"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.row}>
            <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={onSaveToken}>
              <Text style={styles.btnText}>Зберегти токен</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.btnLight, pressed && styles.btnLightPressed]} onPress={onClearToken}>
              <Text style={styles.btnLightText}>Очистити</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Збережений токен:{" "}
            <Text style={{ fontWeight: "800" }}>{savedToken ? "є ✅" : "немає ❌"}</Text>
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>API профілю</Text>

          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={onGetMe} disabled={loading}>
            <Text style={styles.btnText}>{loading ? "Завантаження..." : "Отримати профіль (GET /me)"}</Text>
          </Pressable>

          <Text style={[styles.label, { marginTop: 12 }]}>Email для створення профілю</Text>
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) setError("");
            }}
            placeholder="test@mail.com"
            placeholderTextColor="#9AA7B2"
            style={styles.input}
            autoCapitalize="none"
          />

          <View style={styles.row}>
            <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={onCreateProfile} disabled={loading}>
              <Text style={styles.btnText}>Створити (POST /profile)</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnDanger, pressed && styles.btnDangerPressed]}
              onPress={onDeleteProfile}
              disabled={loading}
            >
              <Text style={styles.btnText}>Видалити</Text>
            </Pressable>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.jsonTitle}>Відповідь (me):</Text>
          <Text style={styles.jsonBox}>{me ? JSON.stringify(me, null, 2) : "—"}</Text>
        </View>

        <View style={styles.row}>
          <Pressable style={({ pressed }) => [styles.btnLight, pressed && styles.btnLightPressed]} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.btnLightText}>До продуктів</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.btnDanger, pressed && styles.btnDangerPressed]} onPress={onLogout}>
            <Text style={styles.btnText}>Вийти</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT_BG },
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: "900", color: "#111" },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 8, color: "#111" },
  label: { color: "#111", fontWeight: "800", marginBottom: 6 },

  input: {
    backgroundColor: "#F6FBFF",
    borderWidth: 1,
    borderColor: "#D7E7F2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111",
  },

  row: { flexDirection: "row", gap: 10, marginTop: 10 },

  btn: {
    flex: 1,
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnPressed: { opacity: 0.85 },
  btnText: { color: "white", fontWeight: "900" },

  btnLight: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7E7F2",
  },
  btnLightPressed: { opacity: 0.85 },
  btnLightText: { color: "#111", fontWeight: "900" },

  btnDanger: {
    flex: 1,
    backgroundColor: "#D32F2F",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnDangerPressed: { opacity: 0.85 },
  hint: { marginTop: 10, color: TEXT_GRAY },

  errorText: { marginTop: 10, color: ERROR, fontWeight: "900" },

  jsonTitle: { marginTop: 12, fontWeight: "900", color: "#111" },
  jsonBox: {
    marginTop: 6,
    backgroundColor: "#0F172A",
    color: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
});