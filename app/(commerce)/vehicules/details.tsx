import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { vehicule } from "@/types/vehicule.type";

export default function VehiculeDetailsScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { vehiculeData, clientData } = useLocalSearchParams<{
    vehiculeData: string;
    clientData?: string;
  }>();

  const initialVehicule = useMemo<vehicule | undefined>(() => {
    if (!vehiculeData) return undefined;
    try {
      return JSON.parse(vehiculeData);
    } catch {
      return undefined;
    }
  }, [vehiculeData]);

  const vehiculeItem = initialVehicule;

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const accentBg = isDark ? "#242735" : "#F9F9FC";

  if (!vehiculeItem) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
        <View style={styles.headerWrap}>
          <AppHeaderDrawer title="Détails véhicule" />
        </View>
        <View style={styles.emptyWrap}>
          <ThemedText style={{ color: labelColor }}>Aucun véhicule sélectionné</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const Info = ({ label, value }: { label: string; value?: string | number }) => (
    <View style={styles.infoRow}>
      <ThemedText style={[styles.infoLabel, { color: labelColor }]}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, { color: textColor }]}>{value || "—"}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Détails véhicule" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}> 
          <View style={styles.cardHeader}>
            <View>
              <ThemedText type="defaultSemiBold" style={{ color: textColor, fontSize: 20 }}>
                {vehiculeItem.numImmatriculation}
              </ThemedText>
              <ThemedText style={{ color: labelColor }}>
                {vehiculeItem.libMarque ?? "Marque"} {vehiculeItem.modele ? `• ${vehiculeItem.modele}` : ""}
              </ThemedText>
            </View>
            <Pressable
              style={[styles.iconButton, { backgroundColor: COLORS.primaryColor }]}
              onPress={() =>
                router.push({
                  pathname: "/(commerce)/vehicules/form",
                  params: {
                    mode: "edit",
                    vehiculeData: JSON.stringify(vehiculeItem),
                    clientData,
                    returnTo: "vehicule-details",
                  },
                })
              }
            >
              <MaterialIcons name="edit" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={[styles.section, { backgroundColor: accentBg }]}> 
            <Info label="Genre" value={vehiculeItem.libGenre} />
            <Info label="Type" value={vehiculeItem.libType} />
            <Info label="Carrosserie" value={vehiculeItem.libCarrosserie} />
            <Info label="Energie" value={vehiculeItem.libEnergie} />
            <Info label="Date immatriculation" value={new Date(vehiculeItem.dateImmatriculation).toLocaleDateString("fr-FR")} />
            <Info label="Date 1re mise en circulation" value={new Date(vehiculeItem.dateMiseEnCirculation).toLocaleDateString("fr-FR")} />
            <Info label="Numéro de série" value={vehiculeItem.numSerie} />
            <Info label="Numéro de carte grise" value={vehiculeItem.numCarteGrise} />
          </View>

          <View style={[styles.section, { backgroundColor: accentBg }]}> 
            <Info label="Nombre de places" value={vehiculeItem.nbPlaces} />
            <Info label="Charge utile" value={`${vehiculeItem.chargeUtile} Kg`} />
            <Info label="Cylindrée" value={vehiculeItem.cylindree} />
            <Info label="Puissance" value={`${vehiculeItem.puissance} Cv`} />
            <Info label="Valeur neuve" value={vehiculeItem.valeurNeuve} />
            <Info label="Valeur vénale" value={vehiculeItem.valeurVenale} />
            <Info label="Type commercial" value={vehiculeItem.typeCommercial} />
            <Info label="Commentaires" value={vehiculeItem.commentaires} />
          </View>
        </View>
      </ScrollView>

    </ThemedView>
  );
}

const COLORS = {
  primaryColor: "#1F8B82",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  headerWrap: {
    marginTop: -16,
    marginHorizontal: -12,
    marginBottom: 14,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "500",
  },
});
