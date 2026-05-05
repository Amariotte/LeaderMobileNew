import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type PickerOption = {
  id: number | string;
  label: string;
  sublabel?: string;
};

type SingleProps = {
  multiSelect?: false;
  selectedId?: number | string;
  onSelect: (option: PickerOption) => void;
  selectedIds?: never;
  onMultiConfirm?: never;
};

type MultiProps = {
  multiSelect: true;
  selectedIds?: (number | string)[];
  onMultiConfirm: (options: PickerOption[]) => void;
  selectedId?: never;
  onSelect?: never;
};

type BottomPickerModalProps = (SingleProps | MultiProps) & {
  visible: boolean;
  title: string;
  options: PickerOption[];
  onClose: () => void;
  searchable?: boolean;
  loading?: boolean;
  creatableFromSearch?: boolean;
  createPrefixLabel?: string;
};

export default function BottomPickerModal({
  visible,
  title,
  options,
  onClose,
  searchable = false,
  loading = false,
  creatableFromSearch = false,
  createPrefixLabel = "Utiliser",
  multiSelect,
  selectedId,
  selectedIds,
  onSelect,
  onMultiConfirm,
}: BottomPickerModalProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const cardBg = isDark ? "#1B1E28" : "#FFFFFF";
  const inputBg = isDark ? "#242735" : "#F2F3F8";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const primaryColor = "#1F8B82";

  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<(number | string)[]>(selectedIds ?? []);

  // Sync local selection when modal opens
  React.useEffect(() => {
    if (visible) {
      setSearch("");
      if (multiSelect) setLocalSelected(selectedIds ?? []);
    }
  }, [visible, multiSelect, selectedIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q),
    );
  }, [options, search]);

  const customCreateOption = useMemo<PickerOption | null>(() => {
    if (!creatableFromSearch || !searchable || multiSelect) return null;
    const value = search.trim();
    if (!value) return null;

    const exists = options.some(
      (o) => o.label.trim().toLowerCase() === value.toLowerCase(),
    );
    if (exists) return null;

    return {
      id: `__create__${value}`,
      label: value,
      sublabel: `${createPrefixLabel} "${value}"`,
    };
  }, [creatableFromSearch, searchable, multiSelect, options, search, createPrefixLabel]);

  const handleSingleSelect = (option: PickerOption) => {
    if (!multiSelect && onSelect) {
      onSelect(option);
      onClose();
    }
  };

  const handleMultiToggle = (id: number | string) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const handleMultiConfirm = () => {
    if (multiSelect && onMultiConfirm) {
      onMultiConfirm(options.filter((o) => localSelected.includes(o.id)));
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: cardBg }]} onPress={() => {}}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={[styles.headerTitle, { color: textColor }]}>{title}</ThemedText>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={22} color={labelColor} />
            </Pressable>
          </View>

          {/* Search */}
          {searchable && (
            <View style={[styles.searchRow, { backgroundColor: inputBg, borderColor }]}>
              <MaterialIcons name="search" size={16} color={labelColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Rechercher..."
                placeholderTextColor={labelColor}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <MaterialIcons name="close" size={14} color={labelColor} />
                </Pressable>
              )}
            </View>
          )}

          {/* List */}
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!loading && customCreateOption && (
              <Pressable
                style={[styles.option, { borderBottomColor: borderColor, backgroundColor: primaryColor + "0D" }]}
                onPress={() => handleSingleSelect(customCreateOption)}
              >
                <View style={styles.optionContent}>
                  <ThemedText style={[styles.optionLabel, { color: primaryColor, fontWeight: "700" }]}>
                    {customCreateOption.sublabel}
                  </ThemedText>
                </View>
                <MaterialIcons name="add-circle-outline" size={18} color={primaryColor} />
              </Pressable>
            )}

            {loading ? (
              <ActivityIndicator size="small" color={primaryColor} style={{ margin: 20 }} />
            ) : filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={24} color={labelColor} />
                <ThemedText style={[styles.emptyText, { color: labelColor }]}>
                  Aucune option disponible
                </ThemedText>
              </View>
            ) : (
              filtered.map((option) => {
                const isSelected = multiSelect
                  ? localSelected.includes(option.id)
                  : selectedId === option.id;

                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.option,
                      { borderBottomColor: borderColor },
                      isSelected && { backgroundColor: primaryColor + "12" },
                    ]}
                    onPress={() =>
                      multiSelect ? handleMultiToggle(option.id) : handleSingleSelect(option)
                    }
                  >
                    <View style={styles.optionContent}>
                      <ThemedText
                        style={[
                          styles.optionLabel,
                          { color: isSelected ? primaryColor : textColor },
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                      {option.sublabel && (
                        <ThemedText style={[styles.optionSublabel, { color: labelColor }]}>
                          {option.sublabel}
                        </ThemedText>
                      )}
                    </View>

                    {multiSelect ? (
                      <MaterialIcons
                        name={isSelected ? "check-box" : "check-box-outline-blank"}
                        size={20}
                        color={isSelected ? primaryColor : labelColor}
                      />
                    ) : (
                      isSelected && (
                        <MaterialIcons name="check" size={18} color={primaryColor} />
                      )
                    )}
                  </Pressable>
                );
              })
            )}
            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Multi-select confirm button */}
          {multiSelect && (
            <View style={[styles.footer, { borderTopColor: borderColor }]}>
              <Pressable style={styles.confirmBtn} onPress={handleMultiConfirm}>
                <ThemedText style={styles.confirmBtnText}>
                  {localSelected.length > 0
                    ? `Valider (${localSelected.length})`
                    : "Valider"}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C5C9DA",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionLabelSelected: {
    fontWeight: "700",
  },
  optionSublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmBtn: {
    backgroundColor: "#1F8B82",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
