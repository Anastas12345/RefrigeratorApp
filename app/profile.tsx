import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
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
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

import { deleteProfile, patchProfile } from "@/src/api/userApi";
import {
  clearProfileEmail,
  clearProfileName,
  getProfileEmail,
  getProfileName,
  saveProfileEmail,
  saveProfileName,
} from "@/src/storage/profile";
import { getToken, removeToken } from "@/src/storage/token";

export default function ProfileScreen() {
  const router = useRouter();

  const [loadingLocal, setLoadingLocal] = useState(true);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [savedName, setSavedName] = useState(""); // останнє збережене
  const [nameDraft, setNameDraft] = useState(""); // те, що вводять

  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState<boolean | null>(null);

  const changed = useMemo(
    () => nameDraft.trim() !== savedName.trim(),
    [nameDraft, savedName],
  );

  useEffect(() => {
    (async () => {
      try {
        setLoadingLocal(true);
        setError(null);

        const token = await getToken();

const response = await fetch("https://myfridgebackend.onrender.com/api/users/me", {
  headers: { Authorization: `Bearer ${token}` },
});

const profile = await response.json();

setEmail(profile.email);
await saveProfileEmail(profile.email); // оновлюємо storage
        const n = await getProfileName();

        setEmail(profile.email ?? "");
        setSavedName(n ?? "");
        setNameDraft(n ?? "");
      } catch (e: any) {
        setError(e?.message ?? "Не вдалося завантажити профіль");
      } finally {
        setLoadingLocal(false);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setBusy(true);
      setError(null);
      setSavedOk(null);

      const name = nameDraft.trim();

      // ✅ 1) локально (100% працює)
      await saveProfileName(name);

      // ✅ 2) на бек (щоб було “разом з API”)
      // якщо бек не приймає name — тут побачиш текст помилки
      if (name.length > 0) {
        await patchProfile({ name });
      }

      setSavedName(name);
      setSavedOk(true);
    } catch (e: any) {
      setSavedOk(false);
      setError(e?.message ?? "Не вдалося зберегти");
    } finally {
      setBusy(false);
      Keyboard.dismiss();
    }
  };

  const onCancel = () => {
    setNameDraft(savedName);
    setError(null);
    setSavedOk(null);
  };

  const onLogout = async () => {
    await removeToken();
    await clearProfileEmail();
    await clearProfileName();
    router.replace("/login");
  };

  const onDelete = () => {
    Alert.alert(
      "Видалити профіль?",
      "Профіль буде видалено на сервері. Ви вийдете з акаунта.",
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Видалити",
          style: "destructive",
          onPress: async () => {
            try {
              setBusy(true);
              setError(null);

              await deleteProfile();

              await removeToken();
              await clearProfileEmail();
              await clearProfileName();

              router.replace("/login");
            } catch (e: any) {
              setError(e?.message ?? "Не вдалося видалити профіль");
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <><Stack.Screen options={{ headerShown: false }} /><SafeAreaView style={styles.safe}>
      <View style={styles.headerBlob} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.container}>
            {/* Заголовок */}
           {/* Header */}
<View style={styles.headerRow}>
  <Pressable
    onPress={() => router.replace("/(tabs)")}
    style={styles.backBtn}
    hitSlop={10}
  >
    <Ionicons name="chevron-back" size={22} color={TEXT_GRAY} />
  </Pressable>

  <View style={{ flex: 1, alignItems: "center" }}>
    <Text style={styles.title}>Профіль</Text>
    <Text style={styles.subtitle}>Налаштування акаунта</Text>
  </View>

  {/* щоб заголовок був по центру */}
  <View style={{ width: 40 }} />
</View>

            {/* Карта */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.iconBubble}>
                    <Ionicons name="person-outline" size={18} color={ORANGE} />
                  </View>
                  <Text style={styles.cardTitle}>Дані користувача</Text>
                </View>
              </View>



              {loadingLocal ? (
                <View style={{ marginTop: 16, alignItems: "center" }}>
                  <ActivityIndicator />
                </View>
              ) : (
                <>
                  {/* Email */}
                  <Text style={styles.label}>Пошта</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={18} color={TEXT_GRAY} />
                    <TextInput
                      value={email}
                      editable={false}
                      style={[styles.input, { opacity: 0.7 }]}
                      placeholder="Немає пошти (увійди знову)"
                      placeholderTextColor="#9AA7B2" />
                  </View>

                  {/* Name */}
                  <Text style={styles.label}>Імʼя</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="text-outline" size={18} color={TEXT_GRAY} />
                    <TextInput
                      value={nameDraft}
                      onChangeText={(v) => {
                        setNameDraft(v);
                        setSavedOk(null);
                      } }
                      placeholder="Введіть імʼя"
                      placeholderTextColor="#9AA7B2"
                      style={styles.input} />
                    {!!nameDraft.trim() && (
                      <View style={styles.okDot}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Error */}
                  {!!error && (
                    <View style={styles.errorBox}>
                      <Ionicons name="warning-outline" size={18} color="#fff" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  {/* Save */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      pressed && styles.pressed,
                      (!changed || busy) && { opacity: 0.6 },
                    ]}
                    onPress={onSave}
                    disabled={!changed || busy}
                  >
                    <Ionicons name="save-outline" size={18} color="#fff" />
                    <Text style={styles.primaryBtnText}>
                      {busy ? "Збереження..." : "Зберегти зміни"}
                    </Text>
                  </Pressable>

                  {/* Row buttons */}
                  <Pressable
                    style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed, busy && { opacity: 0.7 }]}
                    onPress={onLogout}
                    disabled={busy}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#fff" />
                    <Text style={styles.logoutBtnText}>Вийти</Text>
                  </Pressable>
                  {/* Delete */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteLink,
                      pressed && styles.pressed,
                    ]}
                    onPress={onDelete}
                    disabled={busy}
                  >
                    <Ionicons name="trash-outline" size={16} color="#D43B33" />
                    <Text style={styles.deleteLinkText}>
                      Видалити профіль повністю
                    </Text>
                  </Pressable>

                  {/* Saved status */}
                  {savedOk !== null && (
                    <Text style={styles.savedLine}>
                      Збережено: {savedOk ? "так ✅" : "ні ❌"}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView></>
  );
}

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
    top: -130,
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
  },
  subtitle: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_GRAY,
  },

  card: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },

  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,106,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: { fontSize: 18, fontWeight: "900", color: TEXT_GRAY },

  badgeOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(46,204,113,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(46,204,113,0.25)",
  },
  badgeWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,106,0,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,106,0,0.25)",
  },
  badgeText: { color: TEXT_GRAY, fontWeight: "900" },

  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_GRAY,
  },

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

  errorBox: {
    marginTop: 12,
    backgroundColor: "#D43B33",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorText: { color: "#fff", fontWeight: "900", flex: 1 },

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

  logoutBtn: {
  marginTop: 12,
  backgroundColor: "#FF6A00",
  borderRadius: 18,
  paddingVertical: 14,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
},
logoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },

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

  pressed: { opacity: 0.7 },
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

  deleteLink: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteLinkText: { color: "#D43B33", fontWeight: "900" },

  savedLine: {
    marginTop: 10,
    color: TEXT_GRAY,
    fontWeight: "900",
    textAlign: "center",
  },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 4,
},

backBtn: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(255,255,255,0.9)",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: CARD_BORDER,
},
});
