import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { loadNotes, saveNotes, Note } from "@/src/storage/notesLocal";

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function NotesScreen() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // modal editor
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const sorted = [...notes].sort((a, b) => {
      const pa = a.pinned ? 1 : 0;
      const pb = b.pinned ? 1 : 0;
      if (pb !== pa) return pb - pa; // pinned first
      return (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt);
    });

    if (!q) return sorted;

    return sorted.filter((n) => {
      const hay = `${n.title}\n${n.text}`.toLowerCase();
      return hay.includes(q);
    });
  }, [notes, search]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await loadNotes();
      setNotes(data);
    } catch (e: any) {
      Alert.alert("Помилка", e?.message ?? "Не вдалося завантажити нотатки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setTitle("");
    setText("");
    setModalOpen(true);
  };

  const openEdit = (n: Note) => {
    setEditId(n.id);
    setTitle(n.title);
    setText(n.text);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    Keyboard.dismiss();
  };

  const onSave = async () => {
    const t = title.trim();
    const body = text.trim();

    if (!t && !body) {
      Alert.alert("Порожня нотатка", "Введи заголовок або текст.");
      return;
    }

    const now = Date.now();

    let next: Note[];
    if (editId) {
      next = notes.map((n) =>
        n.id === editId ? { ...n, title: t || "Без назви", text: body, updatedAt: now } : n
      );
    } else {
      const newNote: Note = {
        id: makeId(),
        title: t || "Без назви",
        text: body,
        createdAt: now,
        updatedAt: now,
        pinned: false,
      };
      next = [newNote, ...notes];
    }

    try {
      setNotes(next);
      await saveNotes(next);
      closeModal();
    } catch (e: any) {
      Alert.alert("Помилка", e?.message ?? "Не вдалося зберегти");
    }
  };

  const togglePin = async (id: string) => {
    try {
      const next = notes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n
      );
      setNotes(next);
      await saveNotes(next);
    } catch {
      // щоб не крашилось
    }
  };

  const removeNote = (id: string) => {
    Alert.alert("Видалити нотатку?", "Дію не можна скасувати.", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Видалити",
        style: "destructive",
        onPress: async () => {
          const next = notes.filter((n) => n.id !== id);
          setNotes(next);
          await saveNotes(next);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <Pressable
      onPress={() => openEdit(item)}
      style={({ pressed }) => [styles.noteCard, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.noteTopRow}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || "Без назви"}
        </Text>

        <View style={styles.noteActions}>
          <Pressable onPress={() => togglePin(item.id)} hitSlop={10}>
            <Ionicons name={item.pinned ? "pin" : "pin-outline"} size={18} color={item.pinned ? ORANGE : TEXT_GRAY} />
          </Pressable>

          <Pressable onPress={() => removeNote(item.id)} hitSlop={10}>
            <Ionicons name="trash-outline" size={18} color="#D43B33" />
          </Pressable>
        </View>
      </View>

      {!!item.text && (
        <Text style={styles.noteText} numberOfLines={3}>
          {item.text}
        </Text>
      )}

      <View style={styles.noteMetaRow}>
        <Ionicons name="time-outline" size={14} color={TEXT_GRAY} />
        <Text style={styles.noteMeta}>
          {new Date(item.updatedAt || item.createdAt).toLocaleString("uk-UA")}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Синє півколо */}
      <View style={styles.headerBlob} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.replace("/(tabs)")}
              style={styles.backBtn}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={24} color={TEXT_GRAY} />
            </Pressable>

            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={styles.title}>Нотатки</Text>
              <Text style={styles.subtitle}>Запиши свої думки</Text>
            </View>

            <Pressable onPress={openCreate} style={styles.addBtn} hitSlop={10}>
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={TEXT_GRAY} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Пошук нотаток..."
              placeholderTextColor="#9AA7B2"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {!!search && (
              <Pressable onPress={() => setSearch("")} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={TEXT_GRAY} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(n) => n.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <Text style={styles.empty}>Завантаження...</Text>
              ) : (
                <Text style={styles.empty}>Нотаток ще немає. Натисни “+” щоб додати.</Text>
              )
            }
          />

          {/* Modal editor */}
          <Modal visible={modalOpen} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  style={styles.modalCard}
                >
                  <View style={styles.modalTop}>
                    <Text style={styles.modalTitle}>
                      {editId ? "Редагувати" : "Нова нотатка"}
                    </Text>
                    <Pressable onPress={closeModal} hitSlop={10}>
                      <Ionicons name="close" size={22} color={TEXT_GRAY} />
                    </Pressable>
                  </View>

                  <Text style={styles.label}>Заголовок</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="create-outline" size={18} color={TEXT_GRAY} />
                    <TextInput
                      value={title}onChangeText={setTitle}
                      placeholder="Наприклад: Купити продукти"
                      placeholderTextColor="#9AA7B2"
                      style={styles.input}
                      returnKeyType="next"
                    />
                  </View>

                  <Text style={styles.label}>Текст</Text>
                  <View style={[styles.inputWrap, { alignItems: "flex-start" }]}>
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={TEXT_GRAY}
                      style={{ marginTop: 2 }}
                    />
                    <TextInput
                      value={text}
                      onChangeText={setText}
                      placeholder="Напиши нотатку..."
                      placeholderTextColor="#9AA7B2"
                      style={[styles.input, { minHeight: 120 }]}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      pressed && { opacity: 0.9 },
                    ]}
                    onPress={onSave}
                  >
                    <Ionicons name="save-outline" size={18} color="#fff" />
                    <Text style={styles.primaryBtnText}>Зберегти</Text>
                  </Pressable>
                </KeyboardAvoidingView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const ORANGE = "#FF6A00";
const LIGHT_BG = "#EAF7FF";
const HEADER_BG = "#BFE9FF";
const TEXT_GRAY = "#7B8794";
const CARD_BORDER = "rgba(180,215,235,0.8)";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT_BG },

  // ✅ опущене нижче, щоб ПЕРЕКРИВАЛО заголовок + підзаголовок
  headerBlob: {
    position: "absolute",
    top: -70, // 👈 опусти ще нижче: -50 / -40 якщо треба
    left: -120,
    right: -120,
    height: 260,
    backgroundColor: HEADER_BG,
    borderBottomLeftRadius: 260,
    borderBottomRightRadius: 260,
    opacity: 0.95,
  },

  container: { flex: 1, paddingHorizontal: 18, paddingTop: 10 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 0.5,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_GRAY,
  },

  searchWrap: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  searchInput: { flex: 1, color: TEXT_GRAY, fontSize: 15, fontWeight: "800" },

  noteCard: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  noteTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  noteTitle: { flex: 1, fontSize: 16, fontWeight: "900", color: TEXT_GRAY },
  noteActions: { flexDirection: "row", alignItems: "center", gap: 12 },

  noteText: { marginTop: 8, color: TEXT_GRAY, fontWeight: "700", lineHeight: 18 },

  noteMetaRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  noteMeta: { color: TEXT_GRAY, fontWeight: "800", fontSize: 12 },empty: { marginTop: 24, textAlign: "center", color: TEXT_GRAY, fontWeight: "800" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  modalTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: TEXT_GRAY },

  label: { marginTop: 14, marginBottom: 6, fontSize: 13, fontWeight: "900", color: TEXT_GRAY },

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
  input: { flex: 1, color: TEXT_GRAY, fontSize: 15, fontWeight: "800" },

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
});