
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* верхнє півколо */}
        <View style={styles.headerBlob} />

        <View style={styles.content}>
          <Text style={styles.titleSmall}>ЩО В</Text>

          <Text style={styles.titleBig} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            ХОЛОДИЛЬНИКУ
          </Text>

          {/* холодильники */}
          <View style={styles.fridgeRow}>
            {/* Лівий (половина) */}
            <View style={[styles.sideCrop, styles.sideLeft]}>
              <Image
                source={require("../assets/images/fridgewelcomscreen.png")}
                style={styles.sideFridgeLeft}
                resizeMode="contain"
              />
            </View>

            {/* Центр */}
            <Image
              source={require("../assets/images/fridgewelcomscreen.png")}
              style={styles.mainFridge}
              resizeMode="contain"
            />

            {/* Правий (дзеркальний + половина) */}
            <View style={[styles.sideCrop, styles.sideRight]}>
              <Image
                source={require("../assets/images/fridgewelcomscreen.png")}
                style={styles.sideFridgeRight}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* опис */}
          <Text style={styles.description}>
            Контролюй свої продукти легко.{"\n"}
            Додавай продукти, слідкуй за терміном{"\n"}
            придатності та зменшуй харчові втрати.
          </Text>

          {/* кнопка */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.replace("/start" as any )}
          >
            <Text style={styles.buttonText}>Почати</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF7FF";
const HEADER_BG = "#BFE9FF";
const TEXT_GRAY = "#7B8794";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT_BG },
  container: { flex: 1, backgroundColor: LIGHT_BG },

  // “півколо” як на референсі
  headerBlob: {
    position: "absolute",
    top: -width * 0.22,
    left: -width * 0.2,
    width: width * 1.4,
    height: width * 1.1,
    backgroundColor: HEADER_BG,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 28,
  },

  titleSmall: {
    fontSize: 20,
    fontWeight: "800",
    color: ORANGE,
    letterSpacing: 1,
    marginTop: 6,
  },

  // як на рефі: великий, але в 1 рядок
  titleBig: {
    fontSize: 35,
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 1,
    marginTop: 2,
    width: "100%",
    textAlign: "center",
  },

  fridgeRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  // центральний — основний
  mainFridge: {
    width: 330,
    height: 370,
    zIndex: 3,
  },

  // “вікно”, яке обрізає половину
  sideCrop: {
    position: "absolute",
    top: 20,
    width: 100,      // половина видимої частини (як на рефі)
    height: 400,
    overflow: "hidden",
    opacity: 0.7,   // менша прозорість (видніше)
    zIndex: 2,
  },

  // притискаємо до країв
  sideLeft: { left: -25 },
  sideRight: { right: -20, alignItems: "flex-end" },

  // бокові — БІЛЬШІ
  sideFridgeLeft: {
    width: 320,
    height: 340,
    marginLeft: -159,   // обрізаємо рівно “пів холодильника”
  },

  sideFridgeRight: {
    width: 320,
    height: 340,
    transform: [{ scaleX: -1 }], // дзеркало
    marginRight: -159,
  },

  description: {
    marginTop: 18,
    textAlign: "center",
    color: TEXT_GRAY,
    fontSize: 15,
    lineHeight: 23,
    paddingHorizontal: 3,
  },

  button: {
    marginTop: 70,
    backgroundColor: ORANGE,
    width: 210,          // як на рефі (не надто широка)
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.96 },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});