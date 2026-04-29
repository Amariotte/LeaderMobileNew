import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { contratsFakeData } from "@/data/datas.fake";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate } from "@/tools/tools";
import { client } from "@/types/client.type";
import { contrat, listContrats } from "@/types/contrat.type";
import { vehicule } from "@/types/vehicule.type";


const INITIAL_CONTRATS = contratsFakeData;

export default function ContratsScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { clientData, vehiculeData, action, savedContractData } = useLocalSearchParams<{
    mode?: string;
    clientData?: string;
    vehiculeData?: string;
    action?: "created" | "updated";
    savedContractData?: string;
  }>();

  const selectedClient = useMemo<client | undefined>(() => {
    if (!clientData) return undefined;
    try {
      return JSON.parse(clientData);
    } catch {
      return undefined;
    }
  }, [clientData]);

  const selectedVehicle = useMemo<vehicule | undefined>(() => {
    if (!vehiculeData) return undefined;
    try {
      return JSON.parse(vehiculeData);
    } catch {
      return undefined;
    }
  }, [vehiculeData]);

  const [searchText, setSearchText] = useState("");
  const [contratsList, setContratsList] = useState<listContrats>(INITIAL_CONTRATS);
  const lastPayloadRef = useRef<string>("");

  useEffect(() => {
    if (!savedContractData || !action) {
      return;
    }

    if (lastPayloadRef.current === savedContractData) {
      return;
    }

    try {
      const payload = JSON.parse(savedContractData) as Partial<contrat>;

      if (!payload.numeroContrat || !payload.immatriculation) {
        return;
      }

      if (action === "updated" && payload.id) {
        setContratsList((prev) =>
          prev.map((item) => (item.id === payload.id ? ({ ...item, ...payload } as contrat) : item)),
        );
      } else {
        const nextId = Math.max(0, ...contratsList.map((item) => item.id)) + 1;
        const newContrat: contrat = {
          id: payload.id ?? nextId,
          numeroContrat: payload.numeroContrat,
          categorie: payload.categorie ?? "NOUVELLE AFFAIRE",
          dateContrat: payload.dateContrat ?? new Date(),
          numeroPolice: payload.numeroPolice ?? "",
          numeroAttestation: payload.numeroAttestation ?? "",
          immatriculation: payload.immatriculation,
          vehiculeId: payload.vehiculeId,
          assureType: payload.assureType ?? "PERSONNE PHYSIQUE",
          assureNom: payload.assureNom ?? "",
          assureTel: payload.assureTel ?? "",
          assureEmail: payload.assureEmail ?? "",
          assureBp: payload.assureBp ?? "",
          assureProfession: payload.assureProfession ?? "",
          souscripteurType: payload.souscripteurType ?? "PERSONNE PHYSIQUE",
          souscripteurNom: payload.souscripteurNom ?? "",
          souscripteurTel: payload.souscripteurTel ?? "",
          souscripteurEmail: payload.souscripteurEmail ?? "",
          souscripteurBp: payload.souscripteurBp ?? "",
          agence: payload.agence ?? "",
          compagnie: payload.compagnie ?? "",
          duree: payload.duree ?? "",
          nombreJours: payload.nombreJours ?? 0,
          couverture: payload.couverture ?? "",
          dateEffet: payload.dateEffet,
          dateEcheance: payload.dateEcheance,
          primeNette: payload.primeNette ?? 0,
          accessoires: payload.accessoires ?? 0,
          taxe: payload.taxe ?? 0,
          taxeFga: payload.taxeFga ?? 0,
          cedeao: payload.cedeao ?? 0,
          netAPayer: payload.netAPayer ?? 0,
          client: payload.client ?? selectedClient,
          vehicule: payload.vehicule ?? selectedVehicle,
        };

        setContratsList((prev) => [newContrat, ...prev]);
      }

      lastPayloadRef.current = savedContractData;
    } catch {
      // Ignore malformed payload.
    }
  }, [action, savedContractData, contratsList, selectedClient, selectedVehicle]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const mutedText = isDark ? "#A8AEC7" : "#8B90A5";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";

  const filteredContrats = contratsList.filter((item) => {
    const q = searchText.toLowerCase();
    return (
      item.numeroContrat.toLowerCase().includes(q) ||
      item.immatriculation.toLowerCase().includes(q) ||
      item.assureNom.toLowerCase().includes(q)
    );
  });

  const handleCreate = () => {
    router.push({
      pathname: "/(commerce)/contrats/form",
      params: {
        mode: "create",
        clientData: clientData ?? undefined,
        vehiculeData: vehiculeData ?? undefined,
      },
    });
  };

  const handleEdit = (item: contrat) => {
    router.push({
      pathname: "/(commerce)/contrats/form",
      params: {
        mode: "edit",
        contractData: JSON.stringify(item),
        clientData: clientData ?? undefined,
        vehiculeData: vehiculeData ?? undefined,
      },
    });
  };

  const handleDelete = (item: contrat) => {
    Alert.alert("Supprimer", `Supprimer ${item.numeroContrat} ?`, [
      { text: "Annuler" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => setContratsList((prev) => prev.filter((c) => c.id !== item.id)),
      },
    ]);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Contrats" />
      </View>

      <View style={[styles.searchBar, { backgroundColor: cardBackground }]}> 
        <MaterialIcons name="search" size={18} color={mutedText} />
        <TextInput
          style={[styles.searchInput, { color: mutedText }]}
          placeholder="Chercher par contrat, immatriculation, assuré"
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
          <ThemedText style={styles.totalLabel}>Liste des contrats</ThemedText>
          <View style={styles.countBadge}>
            <ThemedText style={styles.countText}>{filteredContrats.length}</ThemedText>
          </View>
        </View>
        <Pressable style={styles.primaryAction} onPress={handleCreate}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredContrats.map((item) => {
          const contractMode = item.categorie?.toLowerCase().includes("flotte")
            ? "Flotte"
            : "Auto";
          const status = item.categorie?.toLowerCase().includes("annul")
            ? "Annulé"
            : "Actif";

          return (
          <View key={item.id} style={[styles.card, { backgroundColor: cardBackground, borderColor }]}> 
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
                  {item.numeroContrat}
                </ThemedText>
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  {item.immatriculation} • {item.categorie}
                </ThemedText>
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  Souscripteur : {item.souscripteurNom || item.souscripteurTel || "-"}
                </ThemedText>
              </View>
              <View style={styles.actionRow}>
                <Pressable style={[styles.iconBtn, { backgroundColor: softBlock }]} onPress={() => handleEdit(item)}>
                  <MaterialIcons name="edit" size={16} color={isDark ? "#DCE0F8" : "#2E334A"} />
                </Pressable>
                <Pressable style={[styles.iconBtn, { backgroundColor: softBlock }]} onPress={() => handleDelete(item)}>
                  <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                </Pressable>
              </View>
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.badgesRow}>
                <View style={[styles.pill, { backgroundColor: softBlock }]}> 
                  <ThemedText style={{ color: mutedText, fontSize: 12 }}>{contractMode}</ThemedText>
                </View>
                <View style={[styles.pill, { backgroundColor: status === "Annulé" ? "#FCE8E8" : "#E9F4EA" }]}> 
                  <ThemedText
                    style={{
                      color: status === "Annulé" ? "#A11D1D" : "#146B40",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {status}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.netBlock}>
                <ThemedText style={[styles.netLabel, { color: mutedText }]}>Net à payer</ThemedText>
                <ThemedText style={styles.netValue}>{item.netAPayer ?? 0}</ThemedText>
              </View>
            </View>

            <View style={[styles.detailsBlock, { backgroundColor: softBlock }]}> 
               <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Compagnie</ThemedText>
                <ThemedText style={styles.detailValue}>{item.compagnie}</ThemedText>
              </View>
               <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Couverture</ThemedText>
                <ThemedText style={styles.detailValue}>{item.couverture}</ThemedText>
              </View>
             
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Date début</ThemedText>
                <ThemedText style={styles.detailValue}>{formatDate(item.dateEffet)}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Date fin</ThemedText>
                <ThemedText style={styles.detailValue}>{formatDate(item.dateEcheance)}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Police / Attestation</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {(item.numeroPolice || "-")} / {(item.numeroAttestation || "-")}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Agence / Durée</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {(item.agence || "-")} / {(item.duree || "-")}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Assuré</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {(item.assureNom || "-")} ({item.assureTel || "-"})
                </ThemedText>
              </View>
            </View>
          </View>
        );})}
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  countBadge: {
  netBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 120,
  },
  netLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  netValue: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: "#146B40",
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
  actionRow: {
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
  bottomRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailsBlock: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  detailLabel: {
    fontSize: 12,
    minWidth: 110,
  },
  detailValue: {
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
});
