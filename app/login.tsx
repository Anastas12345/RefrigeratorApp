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
import { setLoggedIn } from "@/src/storage/session";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{ login?: string; password?: string }>({});

  const validate = () => {
  const e: { login?: string; password?: string } = {};

  if (!login.trim()) {
    e.login = "Потрібно ввести логін";
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
    router.replace("/profile");
  };

  const onChangeLogin = (v: string) => {
    setLogin(v);
    if (errors.login) setErrors((p) => ({ ...p, login: undefined }));
  };

  const onChangePassword = (v: string) => {
    setPassword(v);
    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerBlob} />

        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.content}>
            <Text style={styles.titleBig} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              АВТОРИЗАЦІЯ
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>Логін</Text>
              <TextInput
                value={login}
                onChangeText={onChangeLogin}
                placeholder="Введіть логін"
                placeholderTextColor="#9AA7B2"
                style={[styles.input, errors.login && styles.inputError]}
                autoCapitalize="none"
              />
              {!!errors.login && <Text style={styles.errorText}>{errors.login}</Text>}

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

{!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}


              <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onLogin}>
                <Text style={styles.buttonText}>Увійти</Text>
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
  passwordWrap: {
  position: "relative",
  justifyContent: "center",
 },

 passwordInput: {
  paddingRight: 46,
 },

 eyeButton: {
  position: "absolute",
  right: 14,
  height: "100%",
  justifyContent: "center",
 },

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
  inputError: {
    borderColor: ERROR,
  },

  errorText: {
    marginTop: 6,
    color: ERROR,
    fontSize: 12,
    fontWeight: "700",
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
