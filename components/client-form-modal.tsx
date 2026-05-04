import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
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
import BottomPickerModal from "@/components/ui/bottom-picker-modal";
import { CIVILITES, TYPES_PERSONNES } from "@/constants/constants";
import { professionsFakeData } from "@/data/datas.fake";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getfetchProfessions } from "@/services/api-service";
import { client } from "@/types/client.type";
import { itemDefaut } from "@/types/other.type";

type ClientFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (client: Partial<client>) => Promise<void>;
  initialClient?: client;
  title: string;
};

function buildInitialFormData(c?: client): Partial<client> {
  return {
    typeId: c?.typeId ?? 1,
    civilite: c?.civilite ?? 1,
    nom: c?.nom ?? "",
    prenoms: c?.prenoms ?? "",
    professionId: c?.professionId,
    libProfession: c?.libProfession ?? "",
    tel: c?.tel ?? "",
    mobile: c?.mobile ?? "",
    whatsapp: c?.whatsapp ?? "",
    email: c?.email ?? "",
    bP: c?.bP ?? "",
    rccm: c?.rccm ?? "",
  };
}

export default function ClientFormModal({
  visible,
  onClose,
  onSubmit,
  initialClient,
  title,
}: ClientFormModalProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();

  const [openPicker, setOpenPicker] = useState<"profession" | null>(null);
  const [formData, setFormData] = useState<Partial<client>>(
    buildInitialFormData(initialClient),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [professionOptions, setProfessionOptions] = useState<itemDefaut[]>(
    professionsFakeData,
  );
  const [loadingProfessions, setLoadingProfessions] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormData(buildInitialFormData(initialClient));
      setValidationError(null);
      setOpenPicker(null);
    }
  }, [visible, initialClient]);

  useEffect(() => {
    // Réinitialiser civilité si elle n'est pas valide pour le typeId sélectionné
    if (formData.typeId === 2 && formData.civilite !== 4) {
      setFormData((prev) => ({ ...prev, civilite: 4 }));
    } else if (formData.typeId === 1 && formData.civilite === 4) {
      setFormData((prev) => ({ ...prev, civilite: 1 }));
    }
  }, [formData.typeId]);

  useEffect(() => {
    if (!visible || !userToken) {
      return;
    }

    setLoadingProfessions(true);
    getfetchProfessions(userToken)
      .then((data) => {
        setProfessionOptions(data.length > 0 ? data : professionsFakeData);
      })
      .catch(() => {
        setProfessionOptions(professionsFakeData);
      })
      .finally(() => setLoadingProfessions(false));
  }, [visible, userToken]);

  const update = (patch: Partial<client>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F9F9FC";
  const primaryColor = "#1F8B82";

  const handleSubmit = async () => {
    if (!formData.nom?.trim()) {
      setValidationError("Le nom est obligatoire.");
      return;
    }
    if (formData.typeId === 1) {
      if (!formData.prenoms?.trim()) {
        setValidationError("Le prénom est obligatoire.");
        return;
      }
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    value: string | undefined,
    onChangeText: (value: string) => void,
    icon: React.ComponentProps<typeof MaterialIcons>["name"],
    options?: {
      placeholder?: string;
      keyboardType?:
        | "default"
        | "email-address"
        | "phone-pad"
        | "numeric"
        | "numbers-and-punctuation";
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      multiline?: boolean;
      numberOfLines?: number;
    },
  ) => (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <View
        style={[
          styles.inputRow,
          options?.multiline && styles.textareaRow,
          { backgroundColor: inputBg, borderColor },
        ]}
      >
        <MaterialIcons name={icon} size={16} color={labelColor} />
        <TextInput
          style={[
            styles.input,
            { color: textColor },
            options?.multiline && styles.textarea,
          ]}
          value={value ?? ""}
          onChangeText={onChangeText}
          placeholder={options?.placeholder ?? "Saisir..."}
          placeholderTextColor={labelColor}
          keyboardType={options?.keyboardType ?? "default"}
          autoCapitalize={options?.autoCapitalize ?? "none"}
          multiline={options?.multiline}
          numberOfLines={options?.numberOfLines}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: cardBackground }]}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>{title}</ThemedText>
            <Pressable onPress={onClose} disabled={isSubmitting}>
              <MaterialIcons name="close" size={22} color={labelColor} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Type de personne</ThemedText>
              <View style={styles.chipRow}>
                {TYPES_PERSONNES.map((label, idx) => {
                  const value = idx + 1;
                  const active = formData.typeId === value;
                  return (
                    <Pressable
                      key={value}
                      style={[
                        styles.chip,
                        {
                          borderColor: active ? primaryColor : borderColor,
                          backgroundColor: active ? primaryColor + "1A" : inputBg,
                        },
                      ]}
                      onPress={() => update({ typeId: value })}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: active ? primaryColor : labelColor, fontWeight: active ? "700" : "500" },
                        ]}
                      >
                        {label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Civilité</ThemedText>
              <View style={styles.chipRow}>
                {(formData.typeId === 1
                  ? CIVILITES.slice(0, 3)
                  : ["Société"]
                ).map((label, idx) => {
                  const value = formData.typeId === 1 ? idx + 1 : 4;
                  const active = formData.civilite === value;
                  return (
                    <Pressable
                      key={value}
                      style={[
                        styles.chip,
                        {
                          borderColor: active ? primaryColor : borderColor,
                          backgroundColor: active ? primaryColor + "1A" : inputBg,
                        },
                      ]}
                      onPress={() => update({ civilite: value })}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: active ? primaryColor : labelColor, fontWeight: active ? "700" : "500" },
                        ]}
                      >
                        {label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {renderInput("Nom *", formData.nom, (v) => update({ nom: v }), "badge", {
              placeholder: "Nom",
              autoCapitalize: "characters",
            })}

            {formData.typeId !== 2 &&
              renderInput("Prénom(s) *", formData.prenoms, (v) => update({ prenoms: v }), "person", {
                placeholder: "Prénom(s)",
                autoCapitalize: "words",
              })}

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Profession</ThemedText>
              <Pressable
                style={[styles.selectBtn, { backgroundColor: inputBg, borderColor }]}
                onPress={() => setOpenPicker("profession")}
              >
                <MaterialIcons name="work-outline" size={16} color={labelColor} />
                <ThemedText
                  style={[styles.selectBtnText, { color: formData.libProfession ? textColor : labelColor }]}
                  numberOfLines={1}
                >
                  {formData.libProfession || "Choisir une profession"}
                </ThemedText>
                <MaterialIcons name="arrow-drop-down" size={20} color={labelColor} />
              </Pressable>
            </View>

            {formData.typeId === 2 &&
              renderInput("RCCM *", formData.rccm, (v) => update({ rccm: v }), "description", {
                placeholder: "RCCM n°",
                autoCapitalize: "characters",
              })}

            {renderInput("Téléphone", formData.tel, (v) => update({ tel: v }), "phone", {
              placeholder: "+225 xx xx xx xx",
              keyboardType: "phone-pad",
            })}
            {renderInput("Mobile", formData.mobile, (v) => update({ mobile: v }), "smartphone", {
              placeholder: "+225 xx xx xx xx",
              keyboardType: "phone-pad",
            })}
            {renderInput("WhatsApp", formData.whatsapp, (v) => update({ whatsapp: v }), "chat", {
              placeholder: "+225 xx xx xx xx",
              keyboardType: "phone-pad",
            })}
            {renderInput("Email", formData.email, (v) => update({ email: v }), "email", {
              placeholder: "email@example.com",
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}
            {renderInput("Boîte postale", formData.bP, (v) => update({ bP: v }), "markunread-mailbox", {
              placeholder: "BP xxxxx",
              autoCapitalize: "characters",
            })}

            {validationError && (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={14} color="#E05252" />
                <ThemedText style={styles.errorText}>{validationError}</ThemedText>
              </View>
            )}

            <Pressable
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitBtnText}>Enregistrer</ThemedText>
              )}
            </Pressable>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>

      <BottomPickerModal
        visible={openPicker === "profession"}
        title="Profession"
        options={professionOptions.map((p) => ({ id: p.id, label: p.libelle }))}
        loading={loadingProfessions}
        selectedId={formData.professionId}
        onSelect={(opt) => {
          update({ professionId: opt.id as number, libProfession: opt.label });
          setOpenPicker(null);
        }}
        onClose={() => setOpenPicker(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingHorizontal: 16, maxHeight: "92%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textareaRow: { alignItems: "flex-start" },
  input: { flex: 1, fontSize: 14 },
  textarea: { minHeight: 70, textAlignVertical: "top" },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBtnText: { flex: 1, fontSize: 14 },
  pickerDropdown: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
    maxHeight: 220,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerOptionText: {
    fontSize: 14,
    flex: 1,
  },
  pickerEmptyState: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  pickerEmptyStateText: {
    fontSize: 13,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#E05252",
    fontSize: 12,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: "#1F8B82",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
