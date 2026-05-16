import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import PartenaireFormModal from "@/components/partenaire-form-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { getfetchAgences, updatePartenaire } from "@/services/api-partenaires";
import { agence } from "@/types/agences";
import { partenaire } from "@/types/partenaires";

export default function PartenaireDetailsScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const { partenaireData } = useLocalSearchParams<{ partenaireData: string }>();
  const [current, setCurrent] = useState<partenaire | undefined>(
    partenaireData ? JSON.parse(partenaireData) : undefined,
  );
  const [agences, setAgences] = useState<agence[]>([]);
  const [agencesLoading, setAgencesLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const { userToken } = useAuthContext();
  const { showMessage } = usePopup();

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const accentBg = isDark ? "#242735" : "#F9F9FC";
  const primaryColor = "#1F8B82";
  const sectionHeaderBg = isDark ? "#161924" : "#F4F6FC";

  useEffect(() => {
    if (!userToken || !current?.id) return;
    setAgencesLoading(true);
    getfetchAgences(userToken, current.id)
      .then((res) => setAgences(res.data ?? []))
      .catch(() => setAgences([]))
      .finally(() => setAgencesLoading(false));
  }, [userToken, current?.id]);

  const handleSubmitEdit = async (data: Partial<partenaire>) => {
    if (!userToken || !current?.id) throw new Error("Session invalide");
    const updated = await updatePartenaire(userToken, current.id, data);
    setCurrent((prev) => (prev ? { ...prev, ...updated } : prev));
    showMessage("success", "Partenaire modifié", "Les informations ont été mises à jour.");
  };

  if (!current) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
        <View style={styles.headerWrap}>
          <AppHeaderDrawer title="Détails partenaire" />
        </View>
        <View style={styles.emptyContainer}>
          <ThemedText style={{ color: labelColor }}>Aucun partenaire sélectionné</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value?: string | boolean;
  }) => {
    const display =
      value === undefined || value === null || value === ""
        ? "—"
        : typeof value === "boolean"
        ? value ? "Oui" : "Non"
        : value;
    return (
      <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: accentBg }]}>
          <MaterialIcons name={icon as any} size={17} color={primaryColor} />
        </View>
        <View style={styles.infoContent}>
          <ThemedText style={[styles.infoLabel, { color: labelColor }]}>{label}</ThemedText>
          <ThemedText style={[styles.infoValue, { color: textColor }]}>{String(display)}</ThemedText>
        </View>
      </View>
    );
  };

  const statusConfig = {
    "Activé":     { bg: isDark ? "#143B39" : "#DBF4F1", text: isDark ? "#A2E3BE" : "#166534" },
    "Désativé":   { bg: isDark ? "#2E1A1A" : "#FFF0F0", text: isDark ? "#F8A0A0" : "#B91C1C" },
    "En attente": { bg: isDark ? "#2A2010" : "#FFF8E1", text: isDark ? "#F8CFA4" : "#92400E" },
  };
  const statusStyle = statusConfig[current.etatLib ?? "En attente"];

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Détails partenaire" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={[styles.heroAvatar, { backgroundColor: primaryColor + "22" }]}>
            <MaterialIcons name="business" size={36} color={primaryColor} />
          </View>
          <View style={styles.heroInfo}>
            <ThemedText style={[styles.heroName, { color: textColor }]}>{current.nom}</ThemedText>
            {current.code && (
              <ThemedText style={[styles.heroCode, { color: labelColor }]}>Code: {current.code}</ThemedText>
            )}
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                {current.etatLib ?? "En attente"}
              </ThemedText>
            </View>
          </View>
          <Pressable
            style={[styles.editBtn, { backgroundColor: isDark ? "#1E2A3A" : "#E8F2FF" }]}
            onPress={() => setEditVisible(true)}
          >
            <MaterialIcons name="edit" size={18} color="#2A7BE8" />
          </Pressable>
        </View>

        {/* Informations générales */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <View style={[styles.sectionHeader, { backgroundColor: sectionHeaderBg }]}>
            <MaterialIcons name="info" size={16} color={primaryColor} />
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              Informations générales
            </ThemedText>
          </View>
          <InfoRow icon="person" label="Représentant" value={current.nomRepresentant} />
          <InfoRow icon="place" label="Adresse" value={current.adresse} />
          <InfoRow icon="article" label="RCCM" value={current.rccm} />
          <InfoRow icon="calendar-today" label="Demande de création" value={current.dateDemandeCreationCompte ? new Date(current.dateDemandeCreationCompte).toLocaleDateString("fr-FR") : undefined} />
          <InfoRow icon="event-available" label="Activation du compte" value={current.dateActivationCompte ? new Date(current.dateActivationCompte).toLocaleDateString("fr-FR") : undefined} />
        </View>

        {/* Contacts */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <View style={[styles.sectionHeader, { backgroundColor: sectionHeaderBg }]}>
            <MaterialIcons name="contacts" size={16} color={primaryColor} />
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>Contacts</ThemedText>
          </View>
          <InfoRow icon="email" label="Email" value={current.email} />
          <InfoRow icon="phone" label="Téléphone" value={current.contacts} />
          <InfoRow icon="smartphone" label="Mobile" value={current.mobile} />
          <InfoRow icon="chat" label="WhatsApp" value={current.whatsapp} />
        </View>

        {/* Codes ASACI */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <View style={[styles.sectionHeader, { backgroundColor: sectionHeaderBg }]}>
            <MaterialIcons name="qr-code" size={16} color={primaryColor} />
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>Codes ASACI</ThemedText>
          </View>
          <InfoRow icon="qr-code" label="Code ASACI" value={current.codeAsaci} />
          <InfoRow icon="qr-code-2" label="Code ASACI Producteur" value={current.codeAsaciProducteur} />
          <InfoRow icon="share" label="Code global partagé" value={current.allUseCodeAsaci} />
        </View>

        {/* Agences */}
        <View style={[styles.section, { backgroundColor: cardBackground, borderColor }]}>
          <View style={[styles.sectionHeader, { backgroundColor: sectionHeaderBg }]}>
            <MaterialIcons name="store" size={16} color={primaryColor} />
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              Agences ({agences.length})
            </ThemedText>
          </View>
          {agencesLoading ? (
            <View style={styles.agencesLoading}>
              <ActivityIndicator size="small" color={primaryColor} />
              <ThemedText style={[styles.agencesLoadingText, { color: labelColor }]}>
                Chargement des agences...
              </ThemedText>
            </View>
          ) : agences.length === 0 ? (
            <View style={styles.agencesEmpty}>
              <MaterialIcons name="store" size={32} color={labelColor} />
              <ThemedText style={[styles.agencesEmptyText, { color: labelColor }]}>
                Aucune agence enregistrée
              </ThemedText>
            </View>
          ) : (
            agences.map((ag, index) => (
              <View
                key={ag.id ?? index}
                style={[
                  styles.agenceCard,
                  { backgroundColor: accentBg, borderColor },
                  index < agences.length - 1 && { marginBottom: 8 },
                ]}
              >
                <View style={[styles.agenceIcon, { backgroundColor: primaryColor + "22" }]}>
                  <MaterialIcons name="store" size={20} color={primaryColor} />
                </View>
                <View style={styles.agenceInfo}>
                  <ThemedText style={[styles.agenceName, { color: textColor }]}>{ag.nom}</ThemedText>
                  {ag.adresse && (
                    <View style={styles.agenceMeta}>
                      <MaterialIcons name="place" size={12} color={labelColor} />
                      <ThemedText style={[styles.agenceMetaText, { color: labelColor }]}>{ag.adresse}</ThemedText>
                    </View>
                  )}
                  {ag.tel && (
                    <View style={styles.agenceMeta}>
                      <MaterialIcons name="phone" size={12} color={labelColor} />
                      <ThemedText style={[styles.agenceMetaText, { color: labelColor }]}>{ag.tel}</ThemedText>
                    </View>
                  )}
                  {ag.email && (
                    <View style={styles.agenceMeta}>
                      <MaterialIcons name="email" size={12} color={labelColor} />
                      <ThemedText style={[styles.agenceMetaText, { color: labelColor }]}>{ag.email}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <PartenaireFormModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSubmit={handleSubmitEdit}
        initialPartenaire={current}
        title={`Modifier ${current.nom}`}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {},
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 18, fontWeight: "700" },
  heroCode: { fontSize: 13 },
  statusBadge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: "600" },
  editBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: "600", marginBottom: 1 },
  infoValue: { fontSize: 14 },
  agencesLoading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  agencesLoadingText: { fontSize: 13 },
  agencesEmpty: { alignItems: "center", gap: 8, paddingVertical: 20 },
  agencesEmptyText: { fontSize: 13 },
  agenceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 14,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  agenceIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  agenceInfo: { flex: 1, gap: 3 },
  agenceName: { fontSize: 14, fontWeight: "600" },
  agenceMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  agenceMetaText: { fontSize: 12 },
});
