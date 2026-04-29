import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { clientsFakeData, vehiculesFakeData } from "@/data/datas.fake";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { client } from "@/types/client.type";
import { vehicule } from "@/types/vehicule.type";

export default function VehiculesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { action, savedVehiculeData, clientData } = useLocalSearchParams<{
    action?: "created" | "updated";
    savedVehiculeData?: string;
    clientData?: string;
  }>();

  const selectedClient = useMemo<client | undefined>(() => {
    if (!clientData) return undefined;
    try {
      return JSON.parse(clientData);
    } catch {
      return undefined;
    }
  }, [clientData]);

  const [searchText, setSearchText] = useState("");
  const [vehiculesList, setVehiculesList] = useState<vehicule[]>(vehiculesFakeData.data);
  const lastPayloadRef = useRef<string>("");

  useEffect(() => {
    if (!savedVehiculeData || !action) {
      return;
    }

    if (lastPayloadRef.current === savedVehiculeData) {
      return;
    }

    try {
      const payload = JSON.parse(savedVehiculeData) as Partial<vehicule>;
      if (!payload.numImmatriculation) {
        return;
      }

      if (action === "updated" && payload.id) {
        setVehiculesList((prev) =>
          prev.map((item) => (item.id === payload.id ? ({ ...item, ...payload } as vehicule) : item)),
        );
      } else {
        const nextId = Math.max(0, ...vehiculesList.map((item) => item.id)) + 1;
        const created: vehicule = {
          id: payload.id ?? nextId,
          numImmatriculation: payload.numImmatriculation,
          dateImmatriculation: payload.dateImmatriculation ?? new Date(),
          dateMiseEnCirculation: payload.dateMiseEnCirculation ?? new Date(),
          numSerie: payload.numSerie ?? "",
          numCarteGrise: payload.numCarteGrise ?? "",
          nbPlaces: payload.nbPlaces ?? 0,
          chargeUtile: payload.chargeUtile ?? 0,
          cylindree: payload.cylindree ?? 0,
          puissance: payload.puissance ?? 0,
          nbCartes: payload.nbCartes ?? 0,
          valeurNeuve: payload.valeurNeuve ?? 0,
          valeurVenale: payload.valeurVenale ?? 0,
          modele: payload.modele ?? "",
          typeCommercial: payload.typeCommercial ?? "",
          commentaires: payload.commentaires ?? "",
          usageId: payload.usageId ?? 1,
          genreId: payload.genreId ?? 1,
          typeId: payload.typeId ?? 1,
          carrosserieId: payload.carrosserieId ?? 1,
          energieId: payload.energieId ?? 1,
          marqueId: payload.marqueId ?? 1,
          couleurId: payload.couleurId ?? 1,
          categorieId: payload.categorieId ?? 1,
          sousCategorieId: payload.sousCategorieId ?? 1,
          villeId: payload.villeId ?? 1,
          zoneCirculationId: payload.zoneCirculationId ?? 1,
          conducteurLuiMeme: payload.conducteurLuiMeme ?? true,
          libGenre: payload.libGenre,
          libType: payload.libType,
          libCarrosserie: payload.libCarrosserie,
          libEnergie: payload.libEnergie,
          libMarque: payload.libMarque,
          libCouleur: payload.libCouleur,
          libUsage: payload.libUsage,
          libCategorie: payload.libCategorie,
          libSousCategorie: payload.libSousCategorie,
          libVille: payload.libVille,
          libZoneCirculation: payload.libZoneCirculation,
          typeConducteur: payload.typeConducteur,
          idProfessionConducteur: payload.idProfessionConducteur,
          libTypeConducteur: payload.libTypeConducteur,
          nomConducteur: payload.nomConducteur,
          emailConducteur: payload.emailConducteur,
          telConducteur: payload.telConducteur,
          boitePostaleConducteur: payload.boitePostaleConducteur,
          libProfessionConducteur: payload.libProfessionConducteur,
          client: selectedClient,
        };

        setVehiculesList((prev) => [created, ...prev]);
      }

      lastPayloadRef.current = savedVehiculeData;
    } catch {
      // Ignore malformed payload.
    }
  }, [action, savedVehiculeData, selectedClient, vehiculesList]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const mutedText = isDark ? "#A8AEC7" : "#8B90A5";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";

  const handleOpenNew = () => {
    router.push({
      pathname: "/(commerce)/vehicules/form",
      params: { mode: "create", clientData, returnTo: "vehicules" },
    });
  };

  const handleOpenEdit = (item: vehicule) => {
    router.push({
      pathname: "/(commerce)/vehicules/form",
      params: {
        mode: "edit",
        vehiculeData: JSON.stringify(item),
        clientData,
        returnTo: "vehicules",
      },
    });
  };

  const handleDelete = (item: vehicule) => {
    Alert.alert(
      "Supprimer",
      `Supprimer le véhicule ${item.numImmatriculation} ?`,
      [
        { text: "Annuler" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => setVehiculesList((prev) => prev.filter((v) => v.id !== item.id)),
        },
      ],
    );
  };

  const handleOpenDetails = (item: vehicule) => {
    router.push({
      pathname: "/(commerce)/vehicules/details",
      params: { vehiculeData: JSON.stringify(item), clientData },
    });
  };

  const filteredVehicules = vehiculesList.filter((item) => {
    const query = searchText.toLowerCase();
    return (
      item.numImmatriculation.toLowerCase().includes(query) ||
      (item.modele ?? "").toLowerCase().includes(query) ||
      (item.libMarque ?? "").toLowerCase().includes(query)
    );
  });

  const findClientName = (item: vehicule) => {
    if (item.client) return `${item.client.nom} ${item.client.prenom}`.trim();

    const owner = clientsFakeData.data.find((c) =>
      c.vehicules?.some((vehiculeItem) => vehiculeItem.id === item.id),
    );

    if (!owner) return "Non assigné";
    return `${owner.nom} ${owner.prenom}`.trim();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Véhicules" />
      </View>

      <View style={[styles.searchBar, { backgroundColor: cardBackground }]}> 
        <MaterialIcons name="search" size={18} color={mutedText} />
        <TextInput
          style={[styles.searchInput, { color: mutedText }]}
          placeholder="Chercher par immatriculation, marque, modèle"
          placeholderTextColor={mutedText}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText("")}>
            <MaterialIcons name="close" size={18} color={mutedText} />
          </Pressable>
        )}
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.totalRow}>
          <ThemedText style={styles.totalLabel}>Liste des véhicules</ThemedText>
          <View style={styles.countBadge}>
            <ThemedText style={styles.countText}>{filteredVehicules.length}</ThemedText>
          </View>
        </View>
        <Pressable style={styles.primaryAction} onPress={handleOpenNew}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredVehicules.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: cardBackground, borderColor }]}> 
            <View style={styles.cardTop}>
              <View style={styles.idBlock}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                  {item.numImmatriculation}
                </ThemedText>
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  {item.libMarque ?? "Marque"} {item.modele ? `• ${item.modele}` : ""}
                </ThemedText>
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  Client: {findClientName(item)}
                </ThemedText>
              </View>
              <View style={styles.actionsRow}>
                <Pressable style={[styles.iconBtn, { backgroundColor: softBlock }]} onPress={() => handleOpenDetails(item)}>
                  <MaterialIcons name="visibility" size={16} color={isDark ? "#DCE0F8" : "#2E334A"} />
                </Pressable>
                <Pressable style={[styles.iconBtn, { backgroundColor: softBlock }]} onPress={() => handleOpenEdit(item)}>
                  <MaterialIcons name="edit" size={16} color={isDark ? "#DCE0F8" : "#2E334A"} />
                </Pressable>
                <Pressable style={[styles.iconBtn, { backgroundColor: softBlock }]} onPress={() => handleDelete(item)}>
                  <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                </Pressable>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.metaPill, { backgroundColor: softBlock }]}> 
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  {item.libEnergie ?? "Energie"}
                </ThemedText>
              </View>
              <View style={[styles.metaPill, { backgroundColor: softBlock }]}> 
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  {item.puissance ?? 0} Cv
                </ThemedText>
              </View>
              <View style={[styles.metaPill, { backgroundColor: softBlock }]}> 
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  {item.nbPlaces ?? 0} places
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

    </ThemedView>
  );
}

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
  searchBar: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#50C52A",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  primaryAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F8B82",
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  idBlock: {
    flex: 1,
    gap: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
