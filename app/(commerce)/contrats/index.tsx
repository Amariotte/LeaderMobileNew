import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { contratsFakeData } from "@/data/datas.fake";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount, formatDate } from "@/tools/tools";
import { client } from "@/types/client.type";
import { contrat } from "@/types/contrat.type";
import { vehicule } from "@/types/vehicule.type";


const INITIAL_CONTRATS: contrat[] = contratsFakeData.data;

type ContractFilters = {
  numeroContrat: string;
  immatriculation: string;
  assureNom: string;
  souscripteurNom: string;
  compagnie: string;
  agence: string;
  couverture: string;
  duree: string;
  categorie: string;
  assureType: string;
  contractMode: "" | "Auto" | "Flotte";
  status: "" | "Actif" | "Annulé";
  dateEffetFrom: string;
  dateEffetTo: string;
  dateEcheanceFrom: string;
  dateEcheanceTo: string;
  netMin: string;
  netMax: string;
};

const EMPTY_FILTERS: ContractFilters = {
  numeroContrat: "",
  immatriculation: "",
  assureNom: "",
  souscripteurNom: "",
  compagnie: "",
  agence: "",
  couverture: "",
  duree: "",
  categorie: "",
  assureType: "",
  contractMode: "",
  status: "",
  dateEffetFrom: "",
  dateEffetTo: "",
  dateEcheanceFrom: "",
  dateEcheanceTo: "",
  netMin: "",
  netMax: "",
};

function toTimestamp(value?: Date | string) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.getTime();
}

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
  const [contratsList, setContratsList] = useState<contrat[]>(INITIAL_CONTRATS);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ContractFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<ContractFilters>(EMPTY_FILTERS);
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

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const updateDraftFilter = <K extends keyof ContractFilters>(
    key: K,
    value: ContractFilters[K],
  ) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openFilters = () => {
    setDraftFilters(activeFilters);
    setFiltersVisible(true);
  };

  const closeFilters = () => setFiltersVisible(false);

  const applyFilters = () => {
    setActiveFilters(draftFilters);
    setFiltersVisible(false);
  };

  const resetDraftFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
  };

  const clearAppliedFilters = () => {
    setActiveFilters(EMPTY_FILTERS);
    setDraftFilters(EMPTY_FILTERS);
  };

  const filteredContrats = contratsList.filter((item) => {
    const q = searchText.toLowerCase();
    const itemMode = item.categorie?.toLowerCase().includes("flotte") ? "Flotte" : "Auto";
    const itemStatus = item.categorie?.toLowerCase().includes("annul") ? "Annulé" : "Actif";
    const dateEffet = toTimestamp(item.dateEffet);
    const dateEcheance = toTimestamp(item.dateEcheance);
    const dateEffetFrom = toTimestamp(activeFilters.dateEffetFrom);
    const dateEffetTo = toTimestamp(activeFilters.dateEffetTo);
    const dateEcheanceFrom = toTimestamp(activeFilters.dateEcheanceFrom);
    const dateEcheanceTo = toTimestamp(activeFilters.dateEcheanceTo);
    const netValue = Number(item.netAPayer ?? 0);
    const minNet = activeFilters.netMin ? Number(activeFilters.netMin) : undefined;
    const maxNet = activeFilters.netMax ? Number(activeFilters.netMax) : undefined;

    const matchesSearch = (
      item.numeroContrat.toLowerCase().includes(q) ||
      item.immatriculation.toLowerCase().includes(q) ||
      item.assureNom.toLowerCase().includes(q)
    );

    const matchesFilters =
      (!activeFilters.numeroContrat || item.numeroContrat.toLowerCase().includes(activeFilters.numeroContrat.toLowerCase())) &&
      (!activeFilters.immatriculation || item.immatriculation.toLowerCase().includes(activeFilters.immatriculation.toLowerCase())) &&
      (!activeFilters.assureNom || item.assureNom.toLowerCase().includes(activeFilters.assureNom.toLowerCase())) &&
      (!activeFilters.souscripteurNom || item.souscripteurNom.toLowerCase().includes(activeFilters.souscripteurNom.toLowerCase())) &&
      (!activeFilters.compagnie || item.compagnie.toLowerCase().includes(activeFilters.compagnie.toLowerCase())) &&
      (!activeFilters.agence || item.agence.toLowerCase().includes(activeFilters.agence.toLowerCase())) &&
      (!activeFilters.couverture || item.couverture.toLowerCase().includes(activeFilters.couverture.toLowerCase())) &&
      (!activeFilters.duree || item.duree.toLowerCase().includes(activeFilters.duree.toLowerCase())) &&
      (!activeFilters.categorie || item.categorie.toLowerCase().includes(activeFilters.categorie.toLowerCase())) &&
      (!activeFilters.assureType || item.assureType.toLowerCase().includes(activeFilters.assureType.toLowerCase())) &&
      (!activeFilters.contractMode || itemMode === activeFilters.contractMode) &&
      (!activeFilters.status || itemStatus === activeFilters.status) &&
      (!dateEffetFrom || (dateEffet !== undefined && dateEffet >= dateEffetFrom)) &&
      (!dateEffetTo || (dateEffet !== undefined && dateEffet <= dateEffetTo)) &&
      (!dateEcheanceFrom || (dateEcheance !== undefined && dateEcheance >= dateEcheanceFrom)) &&
      (!dateEcheanceTo || (dateEcheance !== undefined && dateEcheance <= dateEcheanceTo)) &&
      (minNet === undefined || (!Number.isNaN(minNet) && netValue >= minNet)) &&
      (maxNet === undefined || (!Number.isNaN(maxNet) && netValue <= maxNet));

    return matchesSearch && matchesFilters;
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

  const { showConfirm } = usePopup();

  const handleDelete = (item: contrat) => {
    showConfirm(
      "error",
      "Supprimer le contrat",
      `Supprimer ${item.numeroContrat} ?`,
      () => setContratsList((prev) => prev.filter((c) => c.id !== item.id)),
      { confirmLabel: "Supprimer", cancelLabel: "Annuler" },
    );
  };

  return (
    <ThemedView style={[sharedStyles.container, { backgroundColor: pageBackground }]}> 
      <View style={sharedStyles.headerWrap}>
        <AppHeaderDrawer title="Contrats" />
      </View>

      <View style={[sharedStyles.contractsSearchBar, { backgroundColor: cardBackground }]}> 
        <MaterialIcons name="search" size={18} color={mutedText} />
        <TextInput
          style={[sharedStyles.contractsSearchInput, { color: mutedText }]}
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
          {activeFilterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <ThemedText style={styles.filterCountText}>{activeFilterCount} filtres</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.summaryActions}>
          <Pressable
            style={[
              styles.secondaryAction,
              { backgroundColor: activeFilterCount > 0 ? "#DDF4E8" : cardBackground, borderColor },
            ]}
            onPress={openFilters}
          >
            <MaterialIcons name="tune" size={17} color={activeFilterCount > 0 ? "#146B40" : mutedText} />
          </Pressable>
          <Pressable style={sharedStyles.contractsPrimaryAction} onPress={handleCreate}>
            <MaterialIcons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={sharedStyles.contractsListContent}>
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
                  Date contrat : {formatDate(item.dateContrat)}
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
                    sharedStyles.contractsSecondaryAction,
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
                <ThemedText style={styles.netValue}>{formatAmount(item.netAPayer ?? 0)}</ThemedText>
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
      </View>

      <Modal transparent visible={filtersVisible} animationType="slide" onRequestClose={closeFilters}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBackground }]}> 
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="subtitle">Filtres contrats</ThemedText>
                <ThemedText style={[styles.modalHint, { color: mutedText }]}>Affinez la liste avec le maximum de critères utiles.</ThemedText>
              </View>
              <Pressable style={[styles.modalCloseBtn, { backgroundColor: softBlock }]} onPress={closeFilters}>
                <MaterialIcons name="close" size={18} color={mutedText} />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.filterGrid}>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>N° contrat</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.numeroContrat} onChangeText={(value) => updateDraftFilter("numeroContrat", value)} placeholder="CTR-2026" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Immatriculation</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.immatriculation} onChangeText={(value) => updateDraftFilter("immatriculation", value)} placeholder="AB-123-CD" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Assuré</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.assureNom} onChangeText={(value) => updateDraftFilter("assureNom", value)} placeholder="Nom assuré" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Souscripteur</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.souscripteurNom} onChangeText={(value) => updateDraftFilter("souscripteurNom", value)} placeholder="Nom souscripteur" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Compagnie</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.compagnie} onChangeText={(value) => updateDraftFilter("compagnie", value)} placeholder="NSIA" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Agence</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.agence} onChangeText={(value) => updateDraftFilter("agence", value)} placeholder="Agence" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Couverture</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.couverture} onChangeText={(value) => updateDraftFilter("couverture", value)} placeholder="RC Simple" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Durée</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.duree} onChangeText={(value) => updateDraftFilter("duree", value)} placeholder="12 mois" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Catégorie</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.categorie} onChangeText={(value) => updateDraftFilter("categorie", value)} placeholder="Nouvelle affaire" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Type assuré</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.assureType} onChangeText={(value) => updateDraftFilter("assureType", value)} placeholder="Personne physique" placeholderTextColor={mutedText} />
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <ThemedText style={[styles.sectionTitle, { color: mutedText }]}>Mode du contrat</ThemedText>
                <View style={styles.chipsRow}>
                  {(["Auto", "Flotte"] as const).map((value) => (
                    <Pressable key={value} style={[styles.chip, { backgroundColor: draftFilters.contractMode === value ? "#DDF4E8" : softBlock }]} onPress={() => updateDraftFilter("contractMode", draftFilters.contractMode === value ? "" : value)}>
                      <ThemedText style={[styles.chipText, { color: draftFilters.contractMode === value ? "#146B40" : mutedText }]}>{value}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <ThemedText style={[styles.sectionTitle, { color: mutedText }]}>Statut</ThemedText>
                <View style={styles.chipsRow}>
                  {(["Actif", "Annulé"] as const).map((value) => (
                    <Pressable key={value} style={[styles.chip, { backgroundColor: draftFilters.status === value ? "#DDF4E8" : softBlock }]} onPress={() => updateDraftFilter("status", draftFilters.status === value ? "" : value)}>
                      <ThemedText style={[styles.chipText, { color: draftFilters.status === value ? "#146B40" : mutedText }]}>{value}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.filterGrid}>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Date début du</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.dateEffetFrom} onChangeText={(value) => updateDraftFilter("dateEffetFrom", value)} placeholder="2026-01-01" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Date début au</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.dateEffetTo} onChangeText={(value) => updateDraftFilter("dateEffetTo", value)} placeholder="2026-12-31" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Date fin du</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.dateEcheanceFrom} onChangeText={(value) => updateDraftFilter("dateEcheanceFrom", value)} placeholder="2026-01-01" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Date fin au</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.dateEcheanceTo} onChangeText={(value) => updateDraftFilter("dateEcheanceTo", value)} placeholder="2026-12-31" placeholderTextColor={mutedText} />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Net min</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.netMin} onChangeText={(value) => updateDraftFilter("netMin", value)} placeholder="0" placeholderTextColor={mutedText} keyboardType="numeric" />
                </View>
                <View style={styles.filterField}>
                  <ThemedText style={[styles.filterLabel, { color: mutedText }]}>Net max</ThemedText>
                  <TextInput style={[styles.filterInput, { backgroundColor: softBlock, color: mutedText }]} value={draftFilters.netMax} onChangeText={(value) => updateDraftFilter("netMax", value)} placeholder="1000000" placeholderTextColor={mutedText} keyboardType="numeric" />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalGhostBtn, { borderColor }]} onPress={resetDraftFilters}>
                <ThemedText style={styles.modalGhostText}>Réinitialiser</ThemedText>
              </Pressable>
              <Pressable style={[styles.modalGhostBtn, { borderColor }]} onPress={clearAppliedFilters}>
                <ThemedText style={styles.modalGhostText}>Effacer tout</ThemedText>
              </Pressable>
              <Pressable style={styles.modalPrimaryBtn} onPress={applyFilters}>
                <ThemedText style={styles.modalPrimaryText}>Appliquer</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  filterCountBadge: {
    height: 22,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDF4E8",
  },
  filterCountText: {
    color: "#146B40",
    fontSize: 11,
    fontWeight: "700",
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
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
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#146B40",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,19,26,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    padding: 16,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  modalHint: {
    marginTop: 4,
    fontSize: 12,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    gap: 14,
    paddingBottom: 6,
  },
  filterGrid: {
    gap: 10,
  },
  filterField: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterInput: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 8,
  },
  modalGhostBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  modalGhostText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalPrimaryBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F8B82",
    paddingHorizontal: 10,
  },
  modalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
