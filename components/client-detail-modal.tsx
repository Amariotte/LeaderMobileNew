import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { client } from "@/types/client.type";

type ClientDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  client?: client;
};

export default function ClientDetailModal({
  visible,
  onClose,
  client: selectedClient,
}: ClientDetailModalProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const accentBg = isDark ? "#242735" : "#F9F9FC";

  if (!selectedClient) return null;

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value?: string;
  }) => (
    <View style={styles.infoRow}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: accentBg },
        ]}
      >
        <MaterialIcons name={icon as any} size={18} color="#6B3CFF" />
      </View>
      <View style={styles.infoContent}>
        <ThemedText style={[styles.infoLabel, { color: labelColor }]}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.infoValue, { color: textColor }]}>
          {value || "—"}
        </ThemedText>
      </View>
    </View>
  );

  return (
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
            <View style={styles.headerTop}>
              <View
                style={[
                  styles.avatarLarge,
                  { backgroundColor: accentBg, borderColor },
                ]}
              >
                <ThemedText style={styles.avatarText}>
                  {selectedClient.nom
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </ThemedText>
              </View>
              <Pressable onPress={onClose}>
                <MaterialIcons name="close" size={24} color={textColor} />
              </Pressable>
            </View>

            <View style={styles.headerInfo}>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.nameText, { color: textColor }]}
              >
                {selectedClient.nom}
              </ThemedText>
              <ThemedText style={[styles.codeText, { color: labelColor }]}>
                Code : {selectedClient.code}
              </ThemedText>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { borderColor }]} />

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Identity Section */}
            <ThemedText
              type="defaultSemiBold"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Identité
            </ThemedText>

            <View
              style={[
                styles.card,
                { backgroundColor: cardBackground, borderColor },
              ]}
            >
              <InfoRow
                icon="person"
                label="Prénom"
                value={selectedClient.prenom}
              />
              <View style={[styles.cardDivider, { borderColor }]} />
              <InfoRow
                icon="badge"
                label="Profession"
                value={selectedClient.libProfession}
              />
              <View style={[styles.cardDivider, { borderColor }]} />
              <InfoRow
                icon="wc"
                label="Civilité"
                value={selectedClient.libCivilite}
              />
            </View>

            {/* Contact Section */}
            <ThemedText
              type="defaultSemiBold"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Contact
            </ThemedText>

            <View
              style={[
                styles.card,
                { backgroundColor: cardBackground, borderColor },
              ]}
            >
              <InfoRow
                icon="phone"
                label="Téléphone"
                value={selectedClient.tel}
              />
              <View style={[styles.cardDivider, { borderColor }]} />
              <InfoRow
                icon="smartphone"
                label="Mobile"
                value={selectedClient.mobile}
              />
              <View style={[styles.cardDivider, { borderColor }]} />
              <InfoRow
                icon="chat"
                label="WhatsApp"
                value={selectedClient.whatsapp}
              />
              <View style={[styles.cardDivider, { borderColor }]} />
              <InfoRow
                icon="email"
                label="Email"
                value={selectedClient.email}
              />
            </View>

            {/* Address Section */}
            <ThemedText
              type="defaultSemiBold"
              style={[styles.sectionTitle, { color: textColor }]}
            >
              Adresse
            </ThemedText>

            <View
              style={[
                styles.card,
                { backgroundColor: cardBackground, borderColor },
              ]}
            >
              <InfoRow
                icon="mail"
                label="Boîte postale"
                value={selectedClient.boitePostale}
              />
            </View>

            {/* Status Section */}
            {selectedClient.statut && (
              <>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.sectionTitle, { color: textColor }]}
                >
                  Statut
                </ThemedText>

                <View
                  style={[
                    styles.card,
                    { backgroundColor: cardBackground, borderColor },
                  ]}
                >
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            selectedClient.statut === "Active"
                              ? "#E8F5E9"
                              : "#FFEBEE",
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          selectedClient.statut === "Active"
                            ? "check-circle"
                            : "cancel"
                        }
                        size={16}
                        color={
                          selectedClient.statut === "Active"
                            ? "#4CAF50"
                            : "#F44336"
                        }
                      />
                      <ThemedText
                        style={[
                          styles.statusText,
                          {
                            color:
                              selectedClient.statut === "Active"
                                ? "#4CAF50"
                                : "#F44336",
                          },
                        ]}
                      >
                        {selectedClient.statut}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Divider */}
          <View style={[styles.divider, { borderColor }]} />

          {/* Footer Button */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.button,
                { backgroundColor: cardBackground, borderColor },
              ]}
              onPress={onClose}
            >
              <ThemedText style={[styles.buttonText, { color: labelColor }]}>
                Fermer
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: "90%",
  },
  header: {
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B3CFF",
  },
  headerInfo: {
    marginLeft: 12,
  },
  nameText: {
    fontSize: 18,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    borderWidth: 1,
    marginVertical: 12,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 8,
    color: "#D64545",
  },
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardDivider: {
    height: 1,
    borderWidth: 1,
  },
  statusContainer: {
    alignItems: "flex-start",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
