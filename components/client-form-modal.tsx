import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CIVILITES, TYPES_PERSONNES } from "@/constants/constants";
import { professionsFakeData } from "@/data/datas.fake";
import { useColorScheme } from "@/hooks/use-color-scheme";
import COLORS from "@/styles/colors";
import { client } from "@/types/client.type";

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

  const [showProfessionMenu, setShowProfessionMenu] = useState(false);
  const [formData, setFormData] = useState<Partial<client>>(
    buildInitialFormData(initialClient),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  // Re-fill form each time the modal opens (critical for edit mode)
  useEffect(() => {
    if (visible) {
      setFormData(buildInitialFormData(initialClient));
      setValidationError(null);
    }
  }, [visible, initialClient]);

  const update = (patch: Partial<client>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F9F9FC";

  const handleSubmit = async () => {
    if (!formData.nom?.trim()) {
      setValidationError("Le nom est obligatoire.");
      return;
    }
    if (!formData.prenoms?.trim()) {
      setValidationError("Le prénom est obligatoire.");
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

  const openProfessionDropdown = () => {
    setShowProfessionMenu(true);
    Animated.timing(dropdownAnimation, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeProfessionDropdown = () => {
    Animated.timing(dropdownAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowProfessionMenu(false));
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={[styles.container, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: pageBackground },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <Pressable onPress={onClose} style={styles.headerCloseBtn} disabled={isSubmitting}>
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Type de personne ── */}
            <ThemedText style={[styles.label, { color: labelColor }]}>Type de personne</ThemedText>
            <View style={styles.pillRow}>
              {TYPES_PERSONNES.map((lbl, idx) => {
                const val = idx + 1;
                const active = formData.typeId === val;
                return (
                  <Pressable
                    key={val}
                    style={[
                      styles.pill,
                      { borderColor: active ? COLORS.primaryColor : borderColor },
                      active && { backgroundColor: COLORS.primaryColor },
                    ]}
                    onPress={() => update({ typeId: val })}
                  >
                    <ThemedText style={[styles.pillText, { color: active ? "#FFFFFF" : labelColor }]}>
                      {lbl}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* ── Civilité ── */}
            <ThemedText style={[styles.label, { color: labelColor, marginTop: 10 }]}>Civilité</ThemedText>
            <View style={[styles.pillRow, { marginBottom: 14 }]}>
              {CIVILITES.map((lbl, idx) => {
                const val = idx + 1;
                const active = formData.civilite === val;
                return (
                  <Pressable
                    key={val}
                    style={[
                      styles.pill,
                      { borderColor: active ? COLORS.primaryColor : borderColor },
                      active && { backgroundColor: COLORS.primaryColor },
                    ]}
                    onPress={() => update({ civilite: val })}
                  >
                    <ThemedText style={[styles.pillText, { color: active ? "#FFFFFF" : labelColor }]}>
                      {lbl}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* ── Nom / Prénom ── */}
              <View style={styles.formField}>
                <ThemedText style={[styles.label, { color: labelColor }]}>
                  Nom <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="Nom"
                  placeholderTextColor={labelColor}
                  value={formData.nom}
                  onChangeText={(t) => update({ nom: t })}
                  autoCapitalize="characters"
                />
            
            </View>

              <View style={styles.formField}>
              
                <ThemedText style={[styles.label, { color: labelColor }]}>
                  Prénom(s) <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="Prénom(s)"
                  placeholderTextColor={labelColor}
                  value={formData.prenoms}
                  onChangeText={(t) => update({ prenoms: t })}
                />
            </View>


            {/* ── Profession ── */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Profession</ThemedText>
              <Pressable
                onPress={openProfessionDropdown}
                style={[styles.selectContainer, { backgroundColor: inputBg, borderColor }]}
              >
                <ThemedText
                  style={{ color: formData.libProfession ? textColor : labelColor, flex: 1, fontSize: 14 }}
                >
                  {formData.libProfession || "Sélectionner…"}
                </ThemedText>
                <MaterialIcons name="expand-more" size={20} color={labelColor} />
              </Pressable>
            </View>

            {/* ── Téléphone / Mobile ── */}
            <View style={styles.formField}>
                <ThemedText style={[styles.label, { color: labelColor }]}>Téléphone</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="+225 xx xx xx xx"
                  placeholderTextColor={labelColor}
                  value={formData.tel}
                  onChangeText={(t) => update({ tel: t })}
                  keyboardType="phone-pad"
                />
              </View>
              

<View style={styles.formField}>
            
                <ThemedText style={[styles.label, { color: labelColor }]}>Mobile</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="+225 xx xx xx xx"
                  placeholderTextColor={labelColor}
                  value={formData.mobile}
                  onChangeText={(t) => update({ mobile: t })}
                  keyboardType="phone-pad"
                />
              </View>

            {/* ── WhatsApp ── */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>WhatsApp</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                placeholder="+225 xx xx xx xx"
                placeholderTextColor={labelColor}
                value={formData.whatsapp}
                onChangeText={(t) => update({ whatsapp: t })}
                keyboardType="phone-pad"
              />
            </View>

            {/* ── Email ── */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Email</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                placeholder="email@example.com"
                placeholderTextColor={labelColor}
                value={formData.email}
                onChangeText={(t) => update({ email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* ── BP / RCCM ── */}
              <View style={styles.formField}>
                <ThemedText style={[styles.label, { color: labelColor }]}>Boîte postale</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="BP xxxxx"
                  placeholderTextColor={labelColor}
                  value={formData.bP}
                  onChangeText={(t) => update({ bP: t })}
                />
              </View>
             
              <View style={styles.formField}>
                <ThemedText style={[styles.label, { color: labelColor }]}>RCCM</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="RCCM n°"
                  placeholderTextColor={labelColor}
                  value={formData.rccm}
                  onChangeText={(t) => update({ rccm: t })}
                />
              </View>

          

            {/* ── Erreur ── */}
            {validationError ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                <ThemedText style={styles.errorText}>{validationError}</ThemedText>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: borderColor }]}>
            <Pressable
              style={[styles.button, { backgroundColor: cardBackground, borderColor }]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <ThemedText style={[styles.buttonText, { color: labelColor }]}>Annuler</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: COLORS.primaryColor }, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>Enregistrer</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
      </Modal>


      {/* Profession Dropdown Modal */}
      <Modal visible={showProfessionMenu} transparent animationType="none">
        <Pressable
          style={styles.dropdownOverlay}
          onPress={closeProfessionDropdown}
        >
          <Animated.View
            style={[
              styles.dropdownPopup,
              {
                backgroundColor: cardBackground,
                borderColor,
                transform: [
                  {
                    translateY: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
                opacity: dropdownAnimation,
              },
            ]}
          >
            <View style={[styles.dropdownHeader, { borderColor }]}>
              <ThemedText type="defaultSemiBold" style={{ color: textColor }}>
                Choisir une profession
              </ThemedText>
              <Pressable onPress={closeProfessionDropdown}>
                <MaterialIcons name="close" size={20} color={labelColor} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.dropdownContent}
              showsVerticalScrollIndicator={false}
            >
              {professionsFakeData.map((profession) => (
                <Pressable
                  key={profession.id}
                  onPress={() => {
                    update({ professionId: profession.id, libProfession: profession.libelle });
                    closeProfessionDropdown();
                  }}
                  style={[
                    styles.dropdownItemPopup,
                    {
                      backgroundColor:
                        formData.libProfession === profession.libelle
                          ? borderColor
                          : "transparent",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dropdownItemCheckbox,
                      {
                        borderColor:
                          formData.libProfession === profession.libelle
                            ? COLORS.primaryColor
                            : labelColor,
                        backgroundColor:
                          formData.libProfession === profession.libelle
                            ? COLORS.primaryColor
                            : "transparent",
                      },
                    ]}
                  >
                    {formData.libProfession === profession.libelle && (
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <ThemedText
                    style={{
                      color:
                        formData.libProfession === profession.libelle
                          ? COLORS.primaryColor
                          : textColor,
                      fontWeight:
                        formData.libProfession === profession.libelle
                          ? "600"
                          : "400",
                      fontSize: 15,
                    }}
                  >
                    {profession.libelle}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1F8B82",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 0,
  },
  headerCloseBtn: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 8,
    padding: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 14,
    color: "#D64545",
  },
  formField: {
    marginBottom: 12,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  required: {
    color: "#EF4444",
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  selectContainer: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    marginTop: -8,
    marginHorizontal: 0,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  vehiclesList: {
    gap: 10,
    marginBottom: 14,
  },
  vehicleItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  vehicleItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  vehicleItemDetails: {
    flexDirection: "row",
    gap: 12,
  },
  vehicleDetail: {
    alignItems: "center",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  dropdownPopup: {
    borderRadius: 12,
    maxHeight: "70%",
    minHeight: 250,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  dropdownItemPopup: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    gap: 12,
  },
  dropdownItemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
});
