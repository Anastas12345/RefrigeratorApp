import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type MenuItem = {
  key: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  disabled?: boolean;
  badgeText?: string; // наприклад "Soon"
};

type Props = {
  visible: boolean;
  onClose: () => void;

  onGoProducts?: () => void;
  onGoAddProduct?: () => void;
  onGoProfile: () => void;

  onGoFavorites?: () => void;
  onGoNotes?: () => void;
  onLogout: () => void;
};

const SCREEN_W = Dimensions.get("window").width;
const PANEL_W = Math.round(SCREEN_W * 0.78);

// кольори під твій стиль
const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF7FF";
const HEADER_BG = "#BFE9FF";
const TEXT_DARK = "#1E2A32";
const TEXT_GRAY = "#7B8794";

export function SideMenu({
  visible,
  onClose,
  onGoProfile,
  onGoFavorites,
  onGoNotes,
  onGoProducts,
  onGoAddProduct,
  onLogout,
}: Props) {
  const x = useRef(new Animated.Value(-PANEL_W)).current;

  useEffect(() => {
    Animated.timing(x, {
      toValue: visible ? 0 : -PANEL_W,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, x]);

  if (!visible) return null;

  const items: MenuItem[] = [
  {
    key: "products",
    title: "Продукти",
    icon: "restaurant-outline",
    onPress: onGoProducts,
  },
  {
    key: "addProduct",
    title: "Додати продукт",
    icon: "add-circle-outline",
    onPress: onGoAddProduct,
  },
  {
    key: "favorites",
    title: "Улюблені",
    icon: "heart-outline",
    onPress: onGoFavorites,
    disabled: !onGoFavorites,
    badgeText: "Soon",
  },
  {
    key: "notes",
    title: "Нотатки",
    icon: "document-text-outline",
    onPress: onGoNotes,
    disabled: !onGoNotes,
    badgeText: "Soon",
  },
  {
    key: "profile",
    title: "Профіль",
    icon: "person-outline",
    onPress: onGoProfile,
  },
];

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* затемнення */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* панель */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: x }] }]}>
        {/* шапка меню */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="snow-outline" size={22} color={ORANGE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Меню</Text>

          </View>

          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={TEXT_GRAY} />
          </Pressable>
        </View>

        {/* список пунктів */}
        <View style={styles.list}>
          {items.map((it) => (
            <MenuRow
              key={it.key}
              title={it.title}
              icon={it.icon}
              disabled={!!it.disabled}
              badgeText={it.badgeText}
              onPress={() => {
                if (it.disabled || !it.onPress) return;
                onClose();
                it.onPress();
              }}
            />
          ))}
        </View>

        {/* низ */}
        <View style={styles.footer}>
  <Pressable
    style={({ pressed }) => [
      styles.logoutButton,
      pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
    ]}
    onPress={() => {
      onClose();
      onLogout();
    }}
  >
    <Ionicons name="log-out-outline" size={30} color="#fff" />
    <Text style={styles.logoutText}>Вийти  </Text>
  </Pressable>
</View>
      </Animated.View>
    </View>
  );
}

function MenuRow({
  title,
  icon,
  onPress,
  disabled,
  badgeText,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  disabled?: boolean;
  badgeText?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        disabled && styles.rowDisabled,
        pressed && !disabled && styles.rowPressed,
      ]}
    >
      <View style={[styles.rowIconWrap, disabled && { opacity: 0.6 }]}>
        <Ionicons name={icon} size={20} color={ORANGE} />
      </View>

      <Text style={[styles.rowText, disabled && { color: TEXT_GRAY }]}>{title}</Text>{!!badgeText && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={18} color={disabled ? "#C4CDD6" : "#B0BBC6"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },

  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_W,
    backgroundColor: LIGHT_BG,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    overflow: "hidden",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 6, height: 0 },
    elevation: 8,
  },

  header: {
    height: 112,
    backgroundColor: HEADER_BG,
    paddingTop: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: TEXT_DARK },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  list: { padding: 12, gap: 10 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  rowPressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },
  rowDisabled: { opacity: 0.8 },

  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#FFF3EA",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, fontSize: 15, fontWeight: "800", color: TEXT_DARK },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFF3EA",
    borderWidth: 1,
    borderColor: "rgba(255,106,0,0.25)",
    marginRight: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "900", color: ORANGE },

  footer: { position: "absolute", left: 0, right: 0, bottom: 10, alignItems: "center" },
  footerText: { fontSize: 12, fontWeight: "700", color: "#9AA7B2" },

  logoutButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  backgroundColor: "#FF6A00",
  marginHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 18,
},

logoutText: {
  color: "#fff",
  fontWeight: "900",
  fontSize: 14,
},
});