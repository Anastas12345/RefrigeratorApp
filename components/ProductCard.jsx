import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { calculateProgress, getProgressColor } from "../constants/utils/dateProgress";

export default function ProductCard({ product, onToggleFavorite, isLoadingFavorite }) {
  const formattedDate = product.expiration_date
    ? new Date(product.expiration_date).toLocaleDateString("uk-UA")
    : "—";

  const percent = calculateProgress(product.created_at, product.expiration_date);
  const progressColor = getProgressColor(percent);
  const isExpired = percent === 0;

  const isFav = !!product?.isFavorite; // ✅ беремо з того, що підкладемо з index.tsx

  return (
    <View
      style={{
        backgroundColor: isExpired ? "#FDECEC" : "#fff",
        padding: 15,
        marginVertical: 8,
        borderRadius: 15,
        borderWidth: isExpired ? 1 : 0,
        borderColor: isExpired ? "#F5C2C2" : "transparent",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      {/* ❤️ Серце */}
      <Pressable
        onPress={() => onToggleFavorite && onToggleFavorite(product?.id)}
        hitSlop={12}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 5,
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "rgba(255,255,255,0.9)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoadingFavorite ? (
          <ActivityIndicator size="small" color="#FF6A00" />
        ) : (
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? "#FF3B30" : "#7B8794"}
          />
        )}
      </Pressable>

      {/* Назва + кількість */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingRight: 36 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isExpired ? "#B3261E" : "#000",
          }}
        >
          {product.name}
        </Text>

        <Text style={{ fontSize: 14 }}>
          {product.quantity} {product.unit}
        </Text>
      </View>

      {/* Дата */}
      <Text style={{ color: isExpired ? "#B3261E" : "#999", marginTop: 4 }}>
        {formattedDate}
      </Text>

      {/* Прогрес */}
      <View
        style={{
          height: 6,
          backgroundColor: "#E0E0E0",
          borderRadius: 4,
          overflow: "hidden",
          marginVertical: 8,
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: progressColor,
            borderRadius: 4,
          }}
        />
      </View>

      {/* Місце */}
      <Text style={{ fontSize: 12, color: "#999" }}>
        {product.storage_places?.name || "—"}
      </Text>
    </View>
  );
}