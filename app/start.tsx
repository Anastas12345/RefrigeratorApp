import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { getLoggedIn } from "@/src/storage/session";

export default function Start() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const isLogged = await getLoggedIn();
      router.replace(isLogged ? "/profile" : "/login");
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#EAF7FF" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}