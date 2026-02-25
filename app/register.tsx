import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { register as apiRegister, login as apiLogin } from "@/src/api/authApi";
import { saveProfileEmail, clearProfileName } from "@/src/storage/profile";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    repeatPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const clearError = (key: "email" | "password" | "repeatPassword") => {
    setErrors((p) => ({ ...p, [key]: undefined }));
    if (serverError) setServerError(null);
  };

  const validate = () => {
    const e: { email?: string; password?: string; repeatPassword?: string } = {};

    const em = email.trim().toLowerCase();

    if (!em) e.email = "Потрібно ввести пошту";

    if (!password.trim()) e.password = "Потрібно ввести пароль";
    else if (password.length < 6) e.password = "Пароль має містити не менше 6 символів";

    if (!repeatPassword.trim()) e.repeatPassword = "Потрібно повторити пароль";
    else if (repeatPassword !== password) e.repeatPassword = "Паролі не співпадають";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onRegister = async () => {
    if (!validate()) return;

    try {
      setServerError(null);
      setLoading(true);

      const em = email.trim().toLowerCase();

      // 1) register
      const registerToken = await apiRegister(em, password);

      // 2) гарантуємо токен (або з реєстрації, або робимо автологін)
      const token = registerToken ? registerToken : await apiLogin(em, password);

      // 3) зберігаємо ТОЧНО в ті ключі, які ти використовуєш в проекті
      await AsyncStorage.setItem("token", token);

      // 4) зберігаємо email для ProfileScreen (локально)
      await saveProfileEmail(em);

      // (опціонально) щоб ім’я не “прилипало” від попереднього користувача
      await clearProfileName();

      router.replace("/(tabs)");
    } catch (e: any) {
      setServerError(e?.message ?? "Помилка реєстрації");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.headerBlob} />

        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.content}>
            <Text style={styles.titleBig} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              РЕЄСТРАЦІЯ
            </Text>

            <View style={styles.card}>
              {/* EMAIL */}
              <Text style={styles.label}>Пошта</Text>
              <TextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearError("email");
                }}
                placeholder="Введіть пошту"
                placeholderTextColor="#9AA7B2"
                style={[styles.input, errors.email && styles.inputError]}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}{/* PASSWORD + EYE */}
              <Text style={[styles.label, { marginTop: 12 }]}>Пароль</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    clearError("password");
                  }}
                  placeholder="Введіть пароль"
                  placeholderTextColor="#9AA7B2"
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#7B8794" />
                </TouchableOpacity>
              </View>
              {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* REPEAT PASSWORD + EYE */}
              <Text style={[styles.label, { marginTop: 12 }]}>Повтор пароля</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={repeatPassword}
                  onChangeText={(v) => {
                    setRepeatPassword(v);
                    clearError("repeatPassword");
                  }}
                  placeholder="Повторіть пароль"
                  placeholderTextColor="#9AA7B2"
                  style={[styles.input, styles.passwordInput, errors.repeatPassword && styles.inputError]}
                  secureTextEntry={!showRepeatPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showRepeatPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#7B8794"
                  />
                </TouchableOpacity>
              </View>
              {!!errors.repeatPassword && <Text style={styles.errorText}>{errors.repeatPassword}</Text>}

              {/* SERVER ERROR */}
              {!!serverError && <Text style={styles.errorText}>{serverError}</Text>}

              {/* BUTTON */}
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && { opacity: 0.7 },
                ]}
                onPress={onRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "Зачекайте..." : "Зареєструватися"}</Text>
              </Pressable>

              {/* LINK TO LOGIN */}
              <Pressable style={styles.linkWrap} onPress={() => router.replace("/login")}>
                <Text style={styles.linkText}>
                  Вже є акаунт? <Text style={styles.linkTextBold}>Увійти</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
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
  container: { flex: 1, backgroundColor: LIGHT_BG },

  headerBlob: {
    position: "absolute",
    top: -width * 0.22,
    left: -width * 0.2,
    width: width * 1.4,
    height: width * 1.05,
    backgroundColor: HEADER_BG,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
  },

  content: { flex: 1, alignItems: "center", paddingHorizontal: 22, paddingTop: 28 },

  titleBig: {
    fontSize: 28,
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 1,
    marginTop: 2,
    width: "100%",
    textAlign: "center",
  },

  card: {
    width: "100%",
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  label: { color: TEXT_GRAY, fontSize: 13, fontWeight: "700", marginBottom: 6 },

  input: {
    backgroundColor: "#F5FBFF",
    borderWidth: 1,
    borderColor: "#D7EEF9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2B3A42",
  },
  inputError: { borderColor: ERROR },

  errorText: { marginTop: 6, color: ERROR, fontSize: 12, fontWeight: "700" },

  passwordWrap: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 46 },
  eyeButton: { position: "absolute", right: 14, height: "100%", justifyContent: "center" },

  button: {
    marginTop: 18,
    backgroundColor: ORANGE,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  linkWrap: { marginTop: 14, alignItems: "center" },
  linkText: { color: TEXT_GRAY, fontSize: 13 },
  linkTextBold: { color: ORANGE, fontWeight: "900" },
});