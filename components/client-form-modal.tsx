import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef, useState } from "react";
import {
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
  onSubmit: (client: Partial<client>) => void;
  initialClient?: client;
  title: string;
};



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
  const [formData, setFormData] = useState<Partial<client>>({
    type: initialClient?.type ?? 1,
    civilite: initialClient?.civilite ?? 1,
    nom: initialClient?.nom ?? "",
    prenom: initialClient?.prenom ?? "",
    libProfession: initialClient?.libProfession ?? "",
    tel: initialClient?.tel ?? "",
    mobile: initialClient?.mobile ?? "",
    whatsapp: initialClient?.whatsapp ?? "",
    email: initialClient?.email ?? "",
    boitePostale: initialClient?.boitePostale ?? "",
  });
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F9F9FC";

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
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
            <ThemedText
              type="subtitle"
              style={styles.title}
            >
              {title}
            </ThemedText>
            <Pressable onPress={onClose} style={styles.headerCloseBtn}>
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Form Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section Title */}
            <ThemedText
              type="defaultSemiBold"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Informations du client
            </ThemedText>

            {/* Type and Civilité Row */}
            <View style={styles.rowContainer}>
              <View style={styles.formField}>
                <ThemedText
                  style={[styles.label, { color: labelColor }]}
                >
                  Type
                </ThemedText>
                <View
                  style={[
                    styles.selectContainer,
                    { backgroundColor: inputBg, borderColor },
                  ]}
                >
                  <ThemedText style={{ color: textColor, flex: 1 }}>
                    {TYPES_PERSONNES[formData.type ? formData.type - 1 : 0]}
                  </ThemedText>
                  <MaterialIcons name="expand-more" size={20} color={labelColor} />
                </View>
              </View>

              <View style={styles.formField}>
                <ThemedText
                  style={[styles.label, { color: labelColor }]}
                >
                  Civilité
                </ThemedText>
                <View
                  style={[
                    styles.selectContainer,
                    { backgroundColor: inputBg, borderColor },
                  ]}
                >
                  <ThemedText style={{ color: textColor, flex: 1 }}>
                    {CIVILITES[formData.civilite ? formData.civilite - 1 : 0]}
                  </ThemedText>
                  <MaterialIcons name="expand-more" size={20} color={labelColor} />
                </View>
              </View>
            </View>

            {/* Nom Field */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>
                Nom <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: inputBg, borderColor, color: textColor },
                ]}
                placeholder="Entrez le nom"
                placeholderTextColor={labelColor}
                value={formData.nom}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, nom: text }))
                }
              />
            </View>



            {/* Prénom Field */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>
                Prénom(s) <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: inputBg, borderColor, color: textColor },
                ]}
                placeholder="Entrez le prénom"
                placeholderTextColor={labelColor}
                value={formData.prenom}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, prenom: text }))
                }
              />
            </View>

            {/* Profession Field */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>
                Profession
              </ThemedText>
              <Pressable
                onPress={openProfessionDropdown}
                style={[
                  styles.selectContainer,
                  { backgroundColor: inputBg, borderColor },
                ]}
              >
                <ThemedText
                  style={{ color: formData.libProfession ? textColor : labelColor, flex: 1 }}
                >
                  {formData.libProfession || "<Sélectionner ...>"}
                </ThemedText>
                <MaterialIcons name="expand-more" size={20} color={labelColor} />
              </Pressable>
            </View>

            {/* Téléphone and Mobile Row */}
            <View style={styles.rowContainer}>
              <View style={styles.formField}>
                <ThemedText style={[styles.label, { color: labelColor }]}>
                  Téléphone
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: inputBg, borderColor, color: textColor },
                  ]}
                  placeholder="+225 xx xx xx xx"
                  placeholderTextColor={labelColor}
                  value={formData.tel}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, tel: text }))
                  }
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formField}>
                <ThemedText style={[styles.label, { color: labelColor }]}>
                  Mobile
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: inputBg, borderColor, color: textColor },
                  ]}
                  placeholder="+225 xx xx xx xx"
                  placeholderTextColor={labelColor}
                  value={formData.mobile}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, mobile: text }))
                  }
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Mobile WhatsApp Field */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>
                Mobile WhatsApp
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: inputBg, borderColor, color: textColor },
                ]}
                placeholder="+225 xx xx xx xx"
                placeholderTextColor={labelColor}
                value={formData.whatsapp}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, whatsapp: text }))
                }
                keyboardType="phone-pad"
              />
            </View>

            {/* Email Field */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>
                Email
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: inputBg, borderColor, color: textColor },
                ]}
                placeholder="email@example.com"
                placeholderTextColor={labelColor}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
              />
            </View>

            {/* Boîte Postale Field */}
            <View style={styles.formField}>
              <ThemedText style={[styles.label, { color: labelColor }]}>
                Boîte postale
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: inputBg, borderColor, color: textColor },
                ]}
                placeholder="BP xxxxx"
                placeholderTextColor={labelColor}
                value={formData.boitePostale}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, boitePostale: text }))
                }
              />
            </View>

            {/* Vehicles Section */}
            {initialClient?.vehicules && initialClient.vehicules.length > 0 && (
              <>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}
                >
                  Véhicules ({initialClient.vehicules.length})
                </ThemedText>

                <View style={styles.vehiclesList}>
                  {initialClient.vehicules.map((vehicle) => (
                    <View
                      key={vehicle.id}
                      style={[
                        styles.vehicleItem,
                        { backgroundColor: inputBg, borderColor },
                      ]}
                    >
                      <View style={styles.vehicleItemHeader}>
                        <View>
                          <ThemedText
                            type="defaultSemiBold"
                            style={{ color: textColor, fontSize: 13 }}
                          >
                            {vehicle.modele || "Sans modèle"}
                          </ThemedText>
                          <ThemedText style={{ color: labelColor, fontSize: 11, marginTop: 2 }}>
                            {vehicle.numImmatriculation}
                          </ThemedText>
                        </View>
                        <View style={styles.vehicleItemDetails}>
                          <View style={styles.vehicleDetail}>
                            <ThemedText style={{ color: labelColor, fontSize: 10 }}>
                              Puissance
                            </ThemedText>
                            <ThemedText style={{ color: textColor, fontSize: 12, fontWeight: "600" }}>
                              {vehicle.puissance ? `${vehicle.puissance} ch` : "—"}
                            </ThemedText>
                          </View>
                          <View style={styles.vehicleDetail}>
                            <ThemedText style={{ color: labelColor, fontSize: 10 }}>
                              Places
                            </ThemedText>
                            <ThemedText style={{ color: textColor, fontSize: 12, fontWeight: "600" }}>
                              {vehicle.nbPlaces ?? "—"}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Divider */}
          {/* Action Buttons */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.button,
                { backgroundColor: cardBackground, borderColor },
              ]}
              onPress={onClose}
            >
              <ThemedText style={[styles.buttonText, { color: labelColor }]}>
                Annuler
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: COLORS.primaryColor }]}
              onPress={handleSubmit}
            >
              <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
                Enregistrer
              </ThemedText>
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
                    setFormData((prev) => ({
                      ...prev,
                      libProfession: profession.libelle,
                    }));
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
    paddingBottom: 4,
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
