import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { annulerPolice, getfetchContrats } from "@/services/api-souscriptions";
import { sharedStyles } from "@/styles/shared.js";
import { formatAmount, formatDate } from "@/tools/tools";
import { client } from "@/types/client.type";
import { contrat } from "@/types/contrat.type";
import { vehicule } from "@/types/vehicule.type";


type ContractFormPayload = Partial<contrat> & Record<string, unknown>;


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
  const [contratsList, setContratsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ContractFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<ContractFilters>(EMPTY_FILTERS);
  const lastPayloadRef = useRef<string>("");
  const { userToken } = useAuthContext();

  useEffect(() => {
    if (!userToken) return;

    setIsLoading(true);
    getfetchContrats(userToken)
      .then((res) => setContratsList(res?.data ?? []))
      .catch(() => setContratsList([]))
      .finally(() => setIsLoading(false));
  }, [userToken]);

  useEffect(() => {
    if (!savedContractData || !action) {
      return;
    }

    if (lastPayloadRef.current === savedContractData) {
      return;
    }

    try {
      const payload = JSON.parse(savedContractData) as ContractFormPayload;

      if (!payload.numeroContrat) {
        return;
      }

      if (action === "updated" && payload.id) {
        setContratsList((prev) =>
          prev.map((item) => (
            item.id === payload.id
              ? ({ ...item, ...payload, regle: Number(payload.regle ?? item.regle ?? 0) } as contrat)
              : item
          )),
        );
      } else {
        const nextId = Math.max(0, ...contratsList.map((item) => item.id)) + 1;
        const newContrat: contrat = {
          id: Number(payload.id ?? nextId),
          numeroContrat: String(payload.numeroContrat ?? ""),
          categorie: Number(payload.categorie ?? 0),
          type: Number(payload.type ?? 0),
          dateContrat: (payload.dateContrat as Date) ?? new Date(),
          numeroPolice: String(payload.numeroPolice ?? ""),
          souscripteur: (payload.souscripteur as contrat["souscripteur"]) ?? {
            typeId: Number(payload.souscripteurTypeId ?? 0),
            professionId: Number(payload.souscripteurProfessionId ?? 0),
            type: String(payload.souscripteurType ?? "PERSONNE PHYSIQUE"),
            nom: String(payload.souscripteurNom ?? ""),
            tel: String(payload.souscripteurTel ?? ""),
            email: String(payload.souscripteurEmail ?? ""),
            bp: String(payload.souscripteurBp ?? ""),
            profession: String(payload.souscripteurProfession ?? ""),
          },
          agenceNom: String(payload.agenceNom ?? payload.agence ?? ""),
          compagnieNom: String(payload.compagnieNom ?? payload.compagnie ?? ""),
          partenaireNom: String(payload.partenaireNom ?? ""),
          typeNom: String(payload.typeNom ?? ""),
          categorieNom: String(payload.categorieNom ?? ""),
          baremeNom: String(payload.baremeNom ?? ""),
          nbJours: Number(payload.nbJours ?? payload.nombreJours ?? 0),
          couvertureNom: String(payload.couvertureNom ?? payload.couverture ?? ""),
          dateEffet: payload.dateEffet as Date | undefined,
          dateEcheance: payload.dateEcheance as Date | undefined,
          primeNette: Number(payload.primeNette ?? 0),
          accessoires: Number(payload.accessoires ?? 0),
          taxe: Number(payload.taxe ?? 0),
          taxeFga: Number(payload.taxeFga ?? 0),
          cedeao: Number(payload.cedeao ?? 0),
          netAPayer: Number(payload.netAPayer ?? 0),
          regle: Number(payload.regle ?? 0),
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
    const categoryLabel = String(item.categorie ?? "").toLowerCase();
    const immatriculation = (item.immatriculation ?? item.vehicule?.numImmatriculation ?? "").toLowerCase();
    const assureNom = (item.assureNom ?? item.contratVehicule?.[0]?.assure?.nom ?? "").toLowerCase();
    const souscripteurNom = (item.souscripteurNom ?? item.souscripteur?.nom ?? "").toLowerCase();
    const compagnie = (item.compagnie ?? item.compagnieNom ?? "").toLowerCase();
    const agence = (item.agence ?? item.agenceNom ?? "").toLowerCase();
    const couverture = (item.couverture ?? item.couvertureNom ?? "").toLowerCase();
    const duree = (item.duree ?? (item.nbJours ? `${item.nbJours} jours` : "")).toLowerCase();
    const assureType = (item.assureType ?? item.contratVehicule?.[0]?.assure?.type ?? "").toLowerCase();
    const itemMode = categoryLabel.includes("flotte") ? "Flotte" : "Auto";
    const itemStatus = categoryLabel.includes("annul") ? "Annulé" : "Actif";
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
      item.numeroPolice.toLowerCase().includes(q) ||
      souscripteurNom.includes(q) ||
      immatriculation.includes(q) ||
      assureNom.includes(q)
    );

    const matchesFilters =
      (!activeFilters.numeroContrat || item.numeroContrat.toLowerCase().includes(activeFilters.numeroContrat.toLowerCase())) &&
      (!activeFilters.immatriculation || immatriculation.includes(activeFilters.immatriculation.toLowerCase())) &&
      (!activeFilters.assureNom || assureNom.includes(activeFilters.assureNom.toLowerCase())) &&
      (!activeFilters.souscripteurNom || souscripteurNom.includes(activeFilters.souscripteurNom.toLowerCase())) &&
      (!activeFilters.compagnie || compagnie.includes(activeFilters.compagnie.toLowerCase())) &&
      (!activeFilters.agence || agence.includes(activeFilters.agence.toLowerCase())) &&
      (!activeFilters.couverture || couverture.includes(activeFilters.couverture.toLowerCase())) &&
      (!activeFilters.duree || duree.includes(activeFilters.duree.toLowerCase())) &&
      (!activeFilters.categorie || categoryLabel.includes(activeFilters.categorie.toLowerCase())) &&
      (!activeFilters.assureType || assureType.includes(activeFilters.assureType.toLowerCase())) &&
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

  const { showConfirm, showMessage } = usePopup();

  const handleCancelContract = async (item: contrat) => {
    if (!userToken) {
      showMessage("error", "Session invalide", "Veuillez vous reconnecter.");
      return;
    }

    try {
      const updated = await annulerPolice(userToken, item.id);
      setContratsList((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? ({ ...c, ...updated } as contrat)
            : c,
        ),
      );
      showMessage("success", "Contrat annulé", "Le contrat a été annulé avec succès.");
    } catch {
      showMessage("error", "Échec de suppression", "Impossible d'annuler ce contrat pour le moment.");
    }
  };

  const handleDelete = (item: contrat) => {
    showConfirm(
      "error",
      "Supprimer le contrat",
      `Supprimer ${item.numeroContrat} ?`,
      () => {
        void handleCancelContract(item);
      },
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
        {isLoading ? (
          <ThemedText style={{ color: mutedText, textAlign: "center", marginTop: 8 }}>Chargement des contrats...</ThemedText>
        ) : (
        <>
        {filteredContrats.map((item) => {
          const categoryLabel = String((item as any).categorieNom ?? item.categorie ?? "");
          const contractMode = categoryLabel.toLowerCase().includes("flotte")
            ? "Flotte"
            : "Auto";
          const status = categoryLabel.toLowerCase().includes("annul")
            ? "Annulé"
            : "Actif";
          const immatriculation = String((item as any).immatriculation ?? "-");
          const souscripteurDisplay = String((item as any).souscripteurNom ?? item.souscripteur?.nom ?? item.souscripteur?.tel ?? "-");
          const compagnieDisplay = String((item as any).compagnie ?? item.compagnieNom ?? "-");
          const couvertureDisplay = String((item as any).couverture ?? item.couvertureNom ?? "-");
          const numeroAttestationDisplay = String((item as any).numeroAttestation ?? item.contratVehicule?.[0]?.numeroAttestation ?? "-");
          const agenceDisplay = String((item as any).agence ?? item.agenceNom ?? "-");
          const dureeDisplay = String((item as any).duree ?? (item.nbJours ? `${item.nbJours} jours` : "-"));
          const assureNomDisplay = String((item as any).assureNom ?? item.contratVehicule?.[0]?.assure?.nom ?? "-");
          const assureTelDisplay = String((item as any).assureTel ?? item.contratVehicule?.[0]?.assure?.tel ?? "-");

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
                  {immatriculation} • {categoryLabel || "-"}
                </ThemedText>
                <ThemedText style={{ color: mutedText, fontSize: 12 }}>
                  Souscripteur : {souscripteurDisplay}
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
                <ThemedText style={styles.netValue}>{formatAmount(item.netAPayer ?? 0)}</ThemedText>
              </View>
            </View>

            <View style={[styles.detailsBlock, { backgroundColor: softBlock }]}> 
               <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Compagnie</ThemedText>
                  <ThemedText style={styles.detailValue}>{compagnieDisplay}</ThemedText>
              </View>
               <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Couverture</ThemedText>
                  <ThemedText style={styles.detailValue}>{couvertureDisplay}</ThemedText>
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
                  {(item.numeroPolice || "-")} / {numeroAttestationDisplay}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Agence / Durée</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {agenceDisplay} / {dureeDisplay}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={[styles.detailLabel, { color: mutedText }]}>Assuré</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {assureNomDisplay} ({assureTelDisplay})
                </ThemedText>
              </View>
            </View>
          </View>
        );})}
        </>
        )}
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
  secondaryAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
