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

import {
  clearProfileEmail,
  getProfileEmail,
  getProfileName,
  saveProfileEmail,
  saveProfileName,
} from "@/src/storage/profile";
import { removeToken } from "@/src/storage/token";

export default function ProfileScreen() {
  const router = useRouter();

  const [loadingLocal, setLoadingLocal] = useState(true);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [savedName, setSavedName] = useState("");
  const [nameDraft, setNameDraft] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState<boolean | null>(null);

  const changed = useMemo(
    () => (nameDraft ?? "").trim() !== (savedName ?? "").trim(),
    [nameDraft, savedName]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoadingLocal(true);
        setError(null);

        const e = (await getProfileEmail()) ?? "";
        setEmail(e);

        const localName = await getProfileName();
        setSavedName(localName ?? "");
        setNameDraft(localName ?? "");
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

      const e = (email ?? "").trim().toLowerCase();
      const name = (nameDraft ?? "").trim();

      if (!e) {
        setError("Немає пошти користувача. Увійди ще раз.");
        setSavedOk(false);
        return;
      }

      await saveProfileName(name);

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
    setNameDraft(savedName ?? "");
    setError(null);
    setSavedOk(null);
  };

  const onLogout = async () => {
    await removeToken();
    await clearProfileEmail(); // ✅ щоб не тягнуло email попереднього користувача
    router.replace("/login");
  };

  const onDeleteLocal = () => {
    Alert.alert(
      "Очистити локальний профіль?",
      "Це прибере пошту/ім’я з телефону і викине з акаунта.",
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Очистити",
          style: "destructive",
          onPress: async () => {
            await removeToken();
            await clearProfileEmail();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.headerBlob} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.container}>
              {/* Back */}
              <Pressable
                onPress={() => router.back()}
                style={styles.backBtn}
                hitSlop={10}
              >
                <Ionicons name="chevron-back" size={22} color={TEXT_GRAY} />
              </Pressable>

              {/* Title */}
              <Text style={styles.title}>Профіль</Text>
              <Text style={styles.subtitle}>Налаштування акаунта</Text>

              <View style={styles.card}>
                {loadingLocal ? (
                  <View style={{ marginTop: 16, alignItems: "center" }}>
                    <ActivityIndicator />
                  </View>
                ) : (<>
                    {/* Email */}
                    <Text style={styles.label}>Пошта</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons name="mail-outline" size={18} color={TEXT_GRAY} />
                      <TextInput
                        value={email}
                        editable={false}
                        style={[styles.input, { opacity: 0.7 }]}
                        placeholder="Немає пошти (увійди знову)"
                        placeholderTextColor="#9AA7B2"
                      />
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
                        }}
                        placeholder="Введіть імʼя"
                        placeholderTextColor="#9AA7B2"
                        style={styles.input}
                      />
                      {!!(nameDraft ?? "").trim() && (
                        <View style={styles.okDot}>
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                      )}
                    </View>

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

                    
                    {/* Logout */}
                    <Pressable
                      style={({ pressed }) => [
                        styles.logoutBtn,
                        pressed && styles.pressed,
                        busy && { opacity: 0.7 },
                      ]}
                      onPress={onLogout}
                      disabled={busy}
                    >
                      <Ionicons name="log-out-outline" size={18} color="#fff" />
                      <Text style={styles.logoutBtnText}>Вийти</Text>
                    </Pressable>

                    {/* Delete local */}
                    <Pressable
                      style={({ pressed }) => [styles.deleteLink, pressed && styles.pressed]}
                      onPress={onDeleteLocal}
                      disabled={busy}
                    >
                      <Ionicons name="trash-outline" size={16} color="#D43B33" />
                      <Text style={styles.deleteLinkText}>Очистити профіль</Text></Pressable>

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
      </SafeAreaView>
    </>
  );
}

const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF7FF";
const HEADER_BG = "#BFE9FF";
const TEXT_GRAY = "#7B8794";
const CARD_BORDER = "rgba(180,215,235,0.8)";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT_BG },

  headerBlob: {
    position: "absolute",
    top: -75,
    left: -80,
    right: -80,
    height: 240,
    backgroundColor: HEADER_BG,
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
    opacity: 0.75,
  },

  container: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    position: "absolute",
    left: 18,
    top: 18,
    zIndex: 5,
  },

  title: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "900",
    color: ORANGE,
    marginTop: 7,
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

  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  

  logoutBtn: {
    marginTop: 12,
    backgroundColor: ORANGE,
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  logoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },

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

  pressed: { opacity: 0.7 },
});