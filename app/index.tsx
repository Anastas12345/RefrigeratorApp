import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Верхній блакитний “півколом” фон */}
        <View style={styles.headerBlob} />

        {/* Контент */}
        <View style={styles.content}>
          <Text style={styles.titleSmall}>ЩО В</Text>
          <Text style={styles.titleBig}>ХОЛОДИЛЬНИКУ</Text>

          <View style={styles.imageWrap}>
            <Image
              source={require("../assets/images/fridge.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.description}>
            Контролюй свої продукти легко. {"\n"}
            Додавай продукти, слідкуй за терміном {"\n"}
            придатності та зменшуй харчові втрати.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => router.push("/home")} // або інший шлях
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
  safe: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  headerBlob: {
    position: "absolute",
    top: -width * 0.25,
    left: -width * 0.15,
    width: width * 1.3,
    height: width * 1.1,
    backgroundColor: HEADER_BG,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: "center",
  },

  titleSmall: {
    fontSize: 18,
    fontWeight: "700",
    color: ORANGE,
    letterSpacing: 1,
    marginTop: 8,
  },
  titleBig: {
    fontSize: 34,
    fontWeight: "800",
    color: ORANGE,
    letterSpacing: 1,
    marginTop: 2,
  },

  imageWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 18,
  },
  image: {
    width: "95%",
    height: 320,
  },

  description: {
    marginTop: 18,
    textAlign: "center",
    color: TEXT_GRAY,
    fontSize: 14,
    lineHeight: 20,
  },

  button: {
    marginTop: 26,
    backgroundColor: ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
