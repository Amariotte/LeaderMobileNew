import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAppColors } from "@/hooks/use-app-theme";
import { partenaire } from "@/types/partenaires";

type PartenaireFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<partenaire>) => Promise<void>;
  initialPartenaire?: partenaire;
  title: string;
};

function buildInitialForm(p?: partenaire): Partial<partenaire> {
  return {
    nom: p?.nom ?? "",
    email: p?.email ?? "",
    contacts: p?.contacts ?? "",
    mobile: p?.mobile ?? "",
    whatsapp: p?.whatsapp ?? "",
    nomRepresentant: p?.nomRepresentant ?? "",
    adresse: p?.adresse ?? "",
    rccm: p?.rccm ?? "",
    codeAsaci: p?.codeAsaci ?? "",
    codeAsaciProducteur: p?.codeAsaciProducteur ?? "",
    allUseCodeAsaci: p?.allUseCodeAsaci ?? false,
  };
}

export default function PartenaireFormModal({
  visible,
  onClose,
  onSubmit,
  initialPartenaire,
  title,
}: PartenaireFormModalProps) {
  const {
    isDark,
    cardBackground,
    borderColor,
    textColor,
    mutedText: labelColor,
    inputBg,
    primaryColor,
    sectionBg,
    dangerColor,
  } = useAppColors();

  const [formData, setFormData] = useState<Partial<partenaire>>(buildInitialForm(initialPartenaire));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormData(buildInitialForm(initialPartenaire));
      setValidationError(null);
    }
  }, [visible, initialPartenaire]);

  const update = (patch: Partial<partenaire>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    if (!formData.nom?.trim()) {
      setValidationError("Le nom du partenaire est obligatoire.");
      return;
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
    onChange: (v: string) => void,
    icon: React.ComponentProps<typeof MaterialIcons>["name"],
    options?: {
      placeholder?: string;
      keyboardType?: "default" | "email-address" | "phone-pad";
      autoCapitalize?: "none" | "sentences" | "words";
      multiline?: boolean;
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
          style={[styles.input, { color: textColor }, options?.multiline && styles.textarea]}
          value={value ?? ""}
          onChangeText={onChange}
          placeholder={options?.placeholder ?? "Saisir..."}
          placeholderTextColor={labelColor}
          keyboardType={options?.keyboardType ?? "default"}
          autoCapitalize={options?.autoCapitalize ?? "none"}
          multiline={options?.multiline}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: cardBackground }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={[styles.headerTitle, { color: textColor }]}>{title}</ThemedText>
            <Pressable onPress={onClose} disabled={isSubmitting} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={labelColor} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Informations générales */}
            <View style={[styles.section, { backgroundColor: sectionBg }]}>
              <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
                Informations générales
              </ThemedText>
              {renderInput("Nom *", formData.nom, (v) => update({ nom: v }), "business", {
                placeholder: "Nom du partenaire",
                autoCapitalize: "words",
              })}
              {renderInput("Représentant", formData.nomRepresentant, (v) => update({ nomRepresentant: v }), "person", {
                placeholder: "Nom du représentant",
                autoCapitalize: "words",
              })}
              {renderInput("Adresse", formData.adresse, (v) => update({ adresse: v }), "place", {
                placeholder: "Adresse complète",
                multiline: true,
              })}
              {renderInput("RCCM", formData.rccm, (v) => update({ rccm: v }), "article", {
                placeholder: "Numéro RCCM",
              })}
            </View>

            {/* Contacts */}
            <View style={[styles.section, { backgroundColor: sectionBg }]}>
              <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
                Contacts
              </ThemedText>
              {renderInput("Email", formData.email, (v) => update({ email: v }), "email", {
                placeholder: "adresse@email.com",
                keyboardType: "email-address",
              })}
              {renderInput("Téléphone", formData.contacts, (v) => update({ contacts: v }), "phone", {
                placeholder: "Numéro de téléphone",
                keyboardType: "phone-pad",
              })}
              {renderInput("Mobile", formData.mobile, (v) => update({ mobile: v }), "smartphone", {
                placeholder: "Numéro mobile",
                keyboardType: "phone-pad",
              })}
              {renderInput("WhatsApp", formData.whatsapp, (v) => update({ whatsapp: v }), "chat", {
                placeholder: "Numéro WhatsApp",
                keyboardType: "phone-pad",
              })}
            </View>

            {/* Codes ASACI */}
            <View style={[styles.section, { backgroundColor: sectionBg }]}>
              <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
                Codes ASACI
              </ThemedText>
              {renderInput("Code ASACI", formData.codeAsaci, (v) => update({ codeAsaci: v }), "qr-code", {
                placeholder: "Code ASACI",
              })}
              {renderInput("Code ASACI Producteur", formData.codeAsaciProducteur, (v) => update({ codeAsaciProducteur: v }), "qr-code-2", {
                placeholder: "Code ASACI Producteur",
              })}
              <View style={[styles.toggleRow, { borderColor }]}>
                <View style={styles.toggleInfo}>
                  <MaterialIcons name="share" size={16} color={labelColor} style={{ marginRight: 8 }} />
                  <View>
                    <ThemedText style={[styles.toggleLabel, { color: textColor }]}>
                      Utiliser le code ASACI global
                    </ThemedText>
                    <ThemedText style={[styles.toggleDesc, { color: labelColor }]}>
                      Tous les utilisateurs partagent le même code
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={formData.allUseCodeAsaci ?? false}
                  onValueChange={(v) => update({ allUseCodeAsaci: v })}
                  trackColor={{ false: borderColor, true: primaryColor }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Validation error */}
            {validationError && (
              <View style={[styles.errorBox, { backgroundColor: isDark ? "#2E1A1A" : "#FFF0F0", borderColor: dangerColor }]}>
                <MaterialIcons name="error-outline" size={16} color={dangerColor} />
                <ThemedText style={styles.errorText}>{validationError}</ThemedText>
              </View>
            )}

            {/* Submit button */}
            <Pressable
              style={[styles.submitBtn, { backgroundColor: primaryColor }, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="save" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.submitText}>Enregistrer</ThemedText>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  section: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  textareaRow: {
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  textarea: {
    height: 64,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#E05252",
    flex: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
