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
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [errors, setErrors] = useState<{
    login?: string;
    password?: string;
    repeatPassword?: string;
  }>({});

  const clearError = (key: keyof typeof errors) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
  const e: typeof errors = {};

  if (!login.trim()) {
    e.login = "Потрібно ввести логін";
  }

  if (!password.trim()) {
    e.password = "Потрібно ввести пароль";
  } else if (password.length < 6) {
    e.password = "Пароль має містити не менше 6 символів";
  }

  if (!repeatPassword.trim()) {
    e.repeatPassword = "Потрібно повторити пароль";
  } else if (password !== repeatPassword) {
    e.repeatPassword = "Паролі не співпадають";
  }

  setErrors(e);
  return Object.keys(e).length === 0;
};


  const onRegister = () => {
    if (!validate()) return;
    router.replace("/(tabs)");
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
              СТВОРИТИ 
               АКАУНТ
            </Text>

            <View style={styles.card}>
              {/* Логін */}
              <Text style={styles.label}>Логін</Text>
              <TextInput
                value={login}
                onChangeText={(v) => {
                  setLogin(v);
                  clearError("login");
                }}
                placeholder="Введіть логін"
                placeholderTextColor="#9AA7B2"
                style={[styles.input, errors.login && styles.inputError]}
                autoCapitalize="none"
              />
              {!!errors.login && <Text style={styles.errorText}>{errors.login}</Text>}

              {/* Пароль + око */}
              <Text style={[styles.label, { marginTop: 12 }]}>Пароль</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    clearError("password");
                    // якщо вже було "паролі не співпадають" — перевіримо повтор пізніше
                  }}
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
              {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Повтор пароля + око */}
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
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.repeatPassword && styles.inputError,
                  ]}
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
              {!!errors.repeatPassword && (
                <Text style={styles.errorText}>{errors.repeatPassword}</Text>
              )}

              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={onRegister}
              >
                <Text style={styles.buttonText}>Зареєструватися</Text>
              </Pressable>

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

  titleBig: { fontSize: 28, fontWeight: "900", color: ORANGE, letterSpacing: 1, marginTop: 2, width: "100%", textAlign: "center" },

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
