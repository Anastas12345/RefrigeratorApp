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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { login as apiLogin } from "@/src/api/authApi";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const e: { email?: string; password?: string } = {};

    if (!email.trim()) {
      e.email = "Потрібно ввести пошту";
    }

    if (!password.trim()) {
      e.password = "Потрібно ввести пароль";
    } else if (password.length < 6) {
      e.password = "Пароль має містити не менше 6 символів";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onLogin = async () => {
  if (!validate()) return;

  try {
    setServerError(null);
    setLoading(true);

    // 🔥 отримуємо токен
    const token = await apiLogin(email.trim(), password);

    console.log("NEW TOKEN:", token);

    // 🔥 примусово перезаписуємо токен
    await AsyncStorage.setItem("token", token);

    router.replace("/(tabs)");
  } catch (e: any) {
    setServerError(e?.message ?? "Помилка входу");
  } finally {
    setLoading(false);
  }
};

  const onChangeEmail = (v: string) => {
    setEmail(v);
    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
    if (serverError) setServerError(null);
  };

  const onChangePassword = (v: string) => {
    setPassword(v);
    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
    if (serverError) setServerError(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerBlob} />

        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.content}>
            <Text
              style={styles.titleBig}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              АВТОРИЗАЦІЯ
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>Пошта</Text>
              <TextInput
                value={email}
                onChangeText={onChangeEmail}
                placeholder="Введіть пошту"
                placeholderTextColor="#9AA7B2"
                style={[styles.input, errors.email && styles.inputError]}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <Text style={[styles.label, { marginTop: 12 }]}>Пароль</Text>

              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={onChangePassword}
                  placeholder="Введіть пароль"
                  placeholderTextColor="#9AA7B2"
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  secureTextEntry={!showPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#7B8794"
                  />
                </TouchableOpacity>
              </View>

              {!!errors.password && (<Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Помилка від бекенда */}
              {!!serverError && <Text style={styles.errorText}>{serverError}</Text>}

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && { opacity: 0.7 },
                ]}
                onPress={onLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Зачекайте..." : "Увійти"}
                </Text>
              </Pressable>

              <Pressable style={styles.linkWrap} onPress={() => router.push("/register")}>
                <Text style={styles.linkText}>
                  Немає акаунта? <Text style={styles.linkTextBold}>Реєстрація</Text>
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
    borderRadius: 22,
    padding: 18,
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

  errorText: {
    marginTop: 6,
    color: ERROR,
    fontSize: 12,
    fontWeight: "700",
  },

  passwordWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: { paddingRight: 46 },
  eyeButton: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
  },

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