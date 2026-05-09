import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import BottomPickerModal, { PickerOption } from "@/components/ui/bottom-picker-modal";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { getfetchPartenaires } from "@/services/api-partenaires";
import { getfetchParametres } from "@/services/api-service";
import { getfetchStockCourtierById, getfetchStockCourtiers, getfetchStockPartenaireById, getfetchStockPartenaires, updateStockPartenaire } from "@/services/api-stock";
import { formatNumber } from "@/tools/tools";
import { itemDefaut, params } from "@/types/other.type";
import { partenaire } from "@/types/partenaires";
import { listStockCourtier, listStockPartenaire } from "@/types/stock.type";

export default function StockPartenairesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const inputBg = isDark ? "#1E2230" : "#F9FAFD";
  const borderColor = isDark ? "#2F3547" : "#E4E9F5";
  const mutedText = isDark ? "#A8AEC7" : "#75809A";
  const heroTint = isDark ? "#163E3A" : "#E5F7F5";
  const availableBg = isDark ? "#143B39" : "#DBF4F1";
  const receivedBg = isDark ? "#1C334A" : "#E8F2FF";
  const receivedColor = isDark ? "#98C6FF" : "#1D4ED8";
  const retiredBg = isDark ? "#3A2A1A" : "#FFF1E7";
  const retiredColor = isDark ? "#F8CFA4" : "#C2410C";
  const producedBg = isDark ? "#173127" : "#E8F6ED";
  const producedColor = isDark ? "#A2E3BE" : "#166534";
  const [items, setItems] = useState<listStockPartenaire>({ data: [] });
  const [courtiers, setCourtiers] = useState<listStockCourtier>({ data: [] });
  const [compagnies, setCompagnies] = useState<itemDefaut[]>([]);
  const [partenaires, setPartenaires] = useState<partenaire[]>([]);
  const [typesAttestation, setTypesAttestation] = useState<itemDefaut[]>([]);
  const [loading, setLoading] = useState(false);
  const { userToken } = useAuthContext();
  const { showMessage } = usePopup();
  const [compagnieFilter, setCompagnieFilter] = useState("");
  const [attestationFilter, setAttestationFilter] = useState("");
  const [movementPopupOpen, setMovementPopupOpen] = useState(false);
  const [movementType, setMovementType] = useState<"add" | "remove">("add");
  const [movementQtyInput, setMovementQtyInput] = useState("");
  const [selectedCompagnieId, setSelectedCompagnieId] = useState<number | null>(null);
  const [selectedPartenaireId, setSelectedPartenaireId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [compagniePickerOpen, setCompagniePickerOpen] = useState(false);
  const [partenairePickerOpen, setPartenairePickerOpen] = useState(false);
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentCourtierStock, setCurrentCourtierStock] = useState(0);
  const [currentPartenaireStock, setCurrentPartenaireStock] = useState(0);

  const loadStocks = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    try {
      const [partenairesData, courtiersData] = await Promise.all([
        getfetchStockPartenaires(userToken),
        getfetchStockCourtiers(userToken),
      ]);
      setItems(partenairesData);
      setCourtiers(courtiersData);
    } catch {
      setItems({ data: [] });
      setCourtiers({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [userToken]);
 
  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  useEffect(() => {
    if (!userToken) return;

    Promise.all([
      getfetchPartenaires(userToken),
      getfetchParametres(userToken, [params.TYPES_ATTESTATIONS,params.COMPAGNIES]),
    ])
      .then(([partenairesData, paramsData]) => {
        setCompagnies(paramsData.compagnies?.data ??  []);
        setPartenaires(partenairesData.data ?? []);
        setTypesAttestation(paramsData.types_attestations?.data ??  []);
      })
      .catch(() => {
        setCompagnies([]);
        setPartenaires([]);
        setTypesAttestation([]);
      });
  }, [userToken]);


  const compagnieOptions = useMemo<PickerOption[]>(
    () =>
      compagnies
        .map((item) => ({ id: item.id, label: item.libelle || "Compagnie inconnue" }))
        .sort((a, b) => a.label.localeCompare(b.label, "fr")),
    [compagnies],
  );

  const partenaireOptions = useMemo<PickerOption[]>(
    () =>
      partenaires
        .map((item) => ({ id: item.id ?? 0, label: item.nom || "Partenaire inconnu" }))
        .filter((item) => item.id !== 0)
        .sort((a, b) => a.label.localeCompare(b.label, "fr")),
    [partenaires],
  );

  const typeOptions = useMemo<PickerOption[]>(
    () =>
      typesAttestation
        .map((item) => ({ id: item.id, label: item.libelle || "Type inconnu" }))
        .sort((a, b) => a.label.localeCompare(b.label, "fr")),
    [typesAttestation],
  );

  const selectedItem = useMemo(
    () =>
      selectedCompagnieId != null && selectedPartenaireId != null && selectedTypeId != null
        ? items.data.find(
            (item) =>
              item.compagnieId === selectedCompagnieId &&
              item.partenaireId === selectedPartenaireId &&
              item.typeId === selectedTypeId,
          )
        : undefined,
    [selectedCompagnieId, selectedPartenaireId, selectedTypeId, items.data],
  );

  useEffect(() => {
    if (!userToken || selectedCompagnieId == null) {
      setCurrentCourtierStock(0);
      return;
    }

    getfetchStockCourtierById(userToken, selectedCompagnieId)
      .then((stock) => setCurrentCourtierStock(stock?.qteDisponibles ?? 0))
      .catch(() => setCurrentCourtierStock(0));
  }, [userToken, selectedCompagnieId]);

  useEffect(() => {
    if (!userToken || selectedCompagnieId == null || selectedPartenaireId == null || selectedTypeId == null) {
      setCurrentPartenaireStock(0);
      return;
    }

    getfetchStockPartenaireById(userToken, selectedPartenaireId, selectedCompagnieId, selectedTypeId)
      .then((stock) => setCurrentPartenaireStock(stock?.qteDisponibles ?? 0))
      .catch(() => setCurrentPartenaireStock(0));
  }, [userToken, selectedCompagnieId, selectedPartenaireId, selectedTypeId]);

  
  // Réinitialiser le type quand le partenaire change
  useEffect(() => {
    if (selectedPartenaireId != null && selectedTypeId != null) {
      const typeExistsForPartner = items.data.some(
        (item) =>
          item.compagnieId === selectedCompagnieId &&
          item.partenaireId === selectedPartenaireId &&
          item.typeId === selectedTypeId
      );
      if (!typeExistsForPartner) {
        setSelectedTypeId(null);
      }
    }
  }, [selectedPartenaireId, selectedCompagnieId, selectedTypeId, items.data]);

  const openMovementPopup = (
    type: "add" | "remove",
    compagnieId?: number,
    partenaireId?: number,
    typeId?: number,
  ) => {
    setMovementType(type);
    if (compagnieId != null) setSelectedCompagnieId(compagnieId);
    if (partenaireId != null) setSelectedPartenaireId(partenaireId);
    if (typeId != null) setSelectedTypeId(typeId);
    setMovementQtyInput("");
    setMovementPopupOpen(true);
  };

  const handleApplyStock = async () => {
    if (!userToken) {
      showMessage("error", "Session invalide", "Veuillez vous reconnecter.");
      return;
    }

    if (!selectedItem) {
      showMessage("error", "Sélection requise", "Veuillez choisir une compagnie, un partenaire et un type.");
      return;
    }
    const qty = Number(movementQtyInput || "0");
    if (!Number.isFinite(qty) || qty <= 0) {
      showMessage("error", "Quantité invalide", "Saisissez uniquement des nombres positifs.");
      return;
    }
    if (movementType === "remove" && qty > currentPartenaireStock) {
      showMessage("error", "Stock insuffisant", "La quantité à retirer dépasse le stock disponible.");
      return;
    }

    const addQty = movementType === "add" ? qty : 0;
    const removeQty = movementType === "remove" ? qty : 0;

    try {
      setSubmitting(true);
      const payload = {
        compagnieId: selectedCompagnieId ?? selectedItem.compagnieId,
        partenaireId: selectedPartenaireId ?? selectedItem.partenaireId,
        typeId: selectedTypeId ?? selectedItem.typeId,
        qteMvt: addQty > 0 ? addQty : -removeQty,
      };

      const response = await updateStockPartenaire(userToken, payload);
      await loadStocks();

      setMovementQtyInput("");
      setMovementPopupOpen(false);
      showMessage("success", "Stock mis à jour", response?.message || "Le mouvement de stock partenaire a été enregistré.");
    } catch {
      showMessage("error", "Échec de mise à jour", "Impossible d'enregistrer le mouvement de stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = useMemo(
    () => items.data.filter((item) => {
      const compagnie = (item?.compagnieNom || "").toLowerCase();
      const attestation = (item?.typeNom || "").toLowerCase();
      const byCompagnie = !compagnieFilter.trim()
        || compagnie.includes(compagnieFilter.trim().toLowerCase());
      const byAttestation = !attestationFilter.trim()
        || attestation.includes(attestationFilter.trim().toLowerCase());
      return byCompagnie && byAttestation;
    }),
    [attestationFilter, compagnieFilter, items],
  );


  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Stocks partenaires" />
      </View>
      <View style={styles.content}>
        <View style={styles.actionsRow}>
          <Pressable style={[styles.topActionBtn, { backgroundColor: "#16A34A" }]} onPress={() => openMovementPopup("add")}>
            <MaterialIcons name="add" size={16} color="#FFFFFF" />
            <ThemedText style={styles.topActionBtnText}>Ajouter du stock</ThemedText>
          </Pressable>
          <Pressable style={[styles.topActionBtn, { backgroundColor: "#E05252" }]} onPress={() => openMovementPopup("remove")}>
            <MaterialIcons name="remove" size={16} color="#FFFFFF" />
            <ThemedText style={styles.topActionBtnText}>Retirer du stock</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.filterCard, { backgroundColor: cardBackground }]}> 
          <View style={styles.filterTopRow}>
            <ThemedText style={styles.filterTitle}>Filtres</ThemedText>
            {(compagnieFilter || attestationFilter) && (
              <Pressable
                onPress={() => {
                  setCompagnieFilter("");
                  setAttestationFilter("");
                }}
              >
                <ThemedText style={styles.clearText}>Effacer</ThemedText>
              </Pressable>
            )}
          </View>

          <View style={[styles.filterInputWrap, { backgroundColor: softBlock }]}> 
            <MaterialIcons name="apartment" size={16} color={mutedText} />
            <TextInput
              value={compagnieFilter}
              onChangeText={setCompagnieFilter}
              placeholder="Filtrer par compagnie"
              placeholderTextColor={mutedText}
              style={[styles.filterInput, { color: mutedText }]}
            />
          </View>

          <View style={[styles.filterInputWrap, { backgroundColor: softBlock }]}> 
            <MaterialIcons name="description" size={16} color={mutedText} />
            <TextInput
              value={attestationFilter}
              onChangeText={setAttestationFilter}
              placeholder="Filtrer par type d'attestation"
              placeholderTextColor={mutedText}
              style={[styles.filterInput, { color: mutedText }]}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#1F8B82" style={{ marginTop: 20 }} />
        ) : filteredItems.length === 0 ? (
          <ThemedText style={{ textAlign: "center", color: mutedText, marginTop: 20 }}>Aucun stock disponible</ThemedText>
        ) : filteredItems.map((item, index) => (
          <View key={`${item.compagnieId}-${item.partenaireId}-${index}`} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.rowTop}>
              <View style={styles.leftRow}>
                <View style={[styles.iconWrap, { backgroundColor: heroTint }]}> 
                  <MaterialIcons name="verified" size={18} color="#1F8B82" />
                </View>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.lib}>{item.compagnieNom || "Compagnie inconnue"}</ThemedText>
                  <ThemedText style={[styles.subText, { color: mutedText }]}>Partenaire : {item.partenaireNom || "Non défini"}</ThemedText>
                  <ThemedText style={[styles.subText, { color: mutedText }]}>Attestation : {item.typeNom || "Non défini"}</ThemedText>
                </View>
              </View>
              <View style={styles.cardActionsTopRight}>
                <Pressable
                  style={[styles.cardIconBtn, styles.cardActionAdd]}
                  onPress={() => openMovementPopup("add", item.compagnieId, item.partenaireId, item.typeId)}
                >
                  <MaterialIcons name="add-circle-outline" size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={[styles.cardIconBtn, styles.cardActionRemove]}
                  onPress={() => openMovementPopup("remove", item.compagnieId, item.partenaireId, item.typeId)}
                >
                  <MaterialIcons name="remove-circle-outline" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: receivedBg }]}>
                <ThemedText style={[styles.metricLabel, { color: mutedText }]}>Reçues</ThemedText>
                <ThemedText style={[styles.metricValue, { color: receivedColor }]}>{formatNumber(item.qteRecues)}</ThemedText>
              </View>
              <View style={[styles.metricCard, { backgroundColor: retiredBg }]}>
                <ThemedText style={[styles.metricLabel, { color: mutedText }]}>Retirées</ThemedText>
                <ThemedText style={[styles.metricValue, { color: retiredColor }]}>{formatNumber(item.qteRetirees)}</ThemedText>
              </View>
              <View style={[styles.metricCard, { backgroundColor: producedBg }]}>
                <ThemedText style={[styles.metricLabel, { color: mutedText }]}>Distribuées</ThemedText>
                <ThemedText style={[styles.metricValue, { color: producedColor }]}>{formatNumber(item.qteDistribueesProducteur)}</ThemedText>
              </View>
            </View>

            <View style={[styles.qtyBadge, styles.qtyBadgeBottom, { backgroundColor: availableBg }]}>
              <ThemedText style={styles.qty}>{formatNumber(item.qteDisponibles)}</ThemedText>
              <ThemedText style={[styles.qtyLabel, { color: mutedText }]}>stock disponible</ThemedText>
            </View>
          </View>
        ))}
      </View>
      <Modal
        visible={movementPopupOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMovementPopupOpen(false)}
      >
        <Pressable style={styles.popupOverlay} onPress={() => setMovementPopupOpen(false)}>
          <Pressable style={[styles.popupCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.popupHeader}>
              <ThemedText style={styles.popupTitle}>Saisie stock partenaire</ThemedText>
              <Pressable onPress={() => setMovementPopupOpen(false)}>
                <MaterialIcons name="close" size={20} color={mutedText} />
              </Pressable>
            </View>

            <View style={styles.popupTypeRow}>
              <Pressable
                style={[styles.popupTypeBtn, { backgroundColor: movementType === "add" ? "#16A34A" : softBlock }]}
                onPress={() => setMovementType("add")}
              >
                <MaterialIcons name="add" size={15} color={movementType === "add" ? "#FFFFFF" : mutedText} />
                <ThemedText style={[styles.popupTypeText, { color: movementType === "add" ? "#FFFFFF" : mutedText }]}>Ajouter</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.popupTypeBtn, { backgroundColor: movementType === "remove" ? "#E05252" : softBlock }]}
                onPress={() => setMovementType("remove")}
              >
                <MaterialIcons name="remove" size={15} color={movementType === "remove" ? "#FFFFFF" : mutedText} />
                <ThemedText style={[styles.popupTypeText, { color: movementType === "remove" ? "#FFFFFF" : mutedText }]}>Retirer</ThemedText>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: mutedText }]}>Compagnie</ThemedText>
              <Pressable
                style={[styles.selectBtn, { backgroundColor: inputBg, borderColor }]}
                onPress={() => setCompagniePickerOpen(true)}
              >
                <MaterialIcons name="apartment" size={16} color={mutedText} />
                <ThemedText style={[styles.selectBtnText, { color: selectedCompagnieId != null ? "#1F8B82" : mutedText }]} numberOfLines={1}>
                  {compagnieOptions.find((o) => o.id === selectedCompagnieId)?.label ?? "Choisir une compagnie"}
                </ThemedText>
                <MaterialIcons name="expand-more" size={20} color={mutedText} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: mutedText }]}>Partenaire</ThemedText>
              <Pressable
                style={[styles.selectBtn, { backgroundColor: inputBg, borderColor }]}
                onPress={() => setPartenairePickerOpen(true)}
              >
                <MaterialIcons name="people" size={16} color={mutedText} />
                <ThemedText style={[styles.selectBtnText, { color: selectedPartenaireId != null ? "#1F8B82" : mutedText }]} numberOfLines={1}>
                  {partenaireOptions.find((o) => o.id === selectedPartenaireId)?.label ?? "Choisir un partenaire"}
                </ThemedText>
                <MaterialIcons name="expand-more" size={20} color={mutedText} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: mutedText }]}>Type d'attestation</ThemedText>
              <Pressable
                style={[styles.selectBtn, { backgroundColor: inputBg, borderColor }]}
                onPress={() => setTypePickerOpen(true)}
              >
                <MaterialIcons name="description" size={16} color={mutedText} />
                <ThemedText style={[styles.selectBtnText, { color: selectedTypeId != null ? "#1F8B82" : mutedText }]} numberOfLines={1}>
                  {typeOptions.find((o) => o.id === selectedTypeId)?.label ?? "Choisir un type"}
                </ThemedText>
                <MaterialIcons name="expand-more" size={20} color={mutedText} />
              </Pressable>
            </View>

            <View style={styles.rowDuo}>
              <View style={[styles.currentStockCard, styles.flex1, { backgroundColor: softBlock }]}>
                <ThemedText style={[styles.currentStockLabel, { color: mutedText }]}>Stock courtier actuel</ThemedText>
                <ThemedText style={styles.currentStockValue}>{formatNumber(currentCourtierStock)}</ThemedText>
              </View>
              <View style={[styles.currentStockCard, styles.flex1, { backgroundColor: softBlock }]}>
                <ThemedText style={[styles.currentStockLabel, { color: mutedText }]}>Stock partenaire actuel</ThemedText>
                <ThemedText style={styles.currentStockValue}>{formatNumber(currentPartenaireStock)}</ThemedText>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: mutedText }]}>Quantité</ThemedText>
              <View style={[styles.numberInputWrap, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons
                  name={movementType === "add" ? "add-circle-outline" : "remove-circle-outline"}
                  size={16}
                  color={movementType === "add" ? "#16A34A" : "#E05252"}
                />
                <TextInput
                  value={movementQtyInput}
                  onChangeText={setMovementQtyInput}
                  placeholder="0"
                  placeholderTextColor={mutedText}
                  keyboardType="numeric"
                  style={[styles.numberInput, { color: isDark ? "#FFFFFF" : "#2D3142" }]}
                />
              </View>
            </View>

            <Pressable
              style={[
                styles.entrySubmitBtn,
                { backgroundColor: movementType === "add" ? "#16A34A" : "#E05252" },
                submitting && { opacity: 0.7 },
              ]}
              onPress={handleApplyStock}
              disabled={submitting}
            >
              <MaterialIcons name="save" size={16} color="#FFFFFF" />
              <ThemedText style={styles.entrySubmitText}>
                {movementType === "add" ? "Ajouter au stock" : "Retirer du stock"}
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

       <BottomPickerModal
        visible={partenairePickerOpen}
        title="Choisir un partenaire"
        options={partenaireOptions}
        selectedId={selectedPartenaireId ?? undefined}
        searchable
        onSelect={(option) => {
          setSelectedPartenaireId(Number(option.id));
          setSelectedTypeId(null);
          setPartenairePickerOpen(false);
        }}
        onClose={() => setPartenairePickerOpen(false)}
      />

      <BottomPickerModal
        visible={compagniePickerOpen}
        title="Choisir une compagnie"
        options={compagnieOptions}
        selectedId={selectedCompagnieId ?? undefined}
        searchable
        onSelect={(option) => {
          setSelectedCompagnieId(Number(option.id));
          setSelectedPartenaireId(null);
          setSelectedTypeId(null);
          setCompagniePickerOpen(false);
        }}
        onClose={() => setCompagniePickerOpen(false)}
      />
     
      <BottomPickerModal
        visible={typePickerOpen}
        title="Choisir un type d'attestation"
        options={typeOptions}
        selectedId={selectedTypeId ?? undefined}
        searchable
        onSelect={(option) => {
          setSelectedTypeId(Number(option.id));
          setTypePickerOpen(false);
        }}
        onClose={() => setTypePickerOpen(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 12 },
  headerWrap: { marginTop: -16, marginHorizontal: -12, marginBottom: 14 },
  content: { gap: 10, paddingBottom: 24 },
  actionsRow: { flexDirection: "row", gap: 10 },
  topActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    height: 40,
  },
  topActionBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  popupCard: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 10 },
  popupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  popupTitle: { fontSize: 15, fontWeight: "700" },
  popupTypeRow: { flexDirection: "row", gap: 8 },
  popupTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    height: 38,
  },
  popupTypeText: { fontSize: 13, fontWeight: "600" },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: "600" },
  selectBtn: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectBtnText: { flex: 1, fontSize: 13 },
  currentStockCard: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  currentStockLabel: { fontSize: 12, fontWeight: "600" },
  currentStockValue: { fontSize: 20, fontWeight: "800", color: "#1F8B82" },
  rowDuo: { flexDirection: "row", gap: 8 },
  flex1: { flex: 1 },
  numberInputWrap: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  numberInput: { flex: 1, fontSize: 16, fontWeight: "700" },
  entrySubmitBtn: {
    height: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  entrySubmitText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  cardActionsTopRight: { flexDirection: "row", gap: 6 },
  cardIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardActionAdd: { backgroundColor: "#16A34A" },
  cardActionRemove: { backgroundColor: "#E05252" },
  filterCard: { borderRadius: 14, padding: 12, gap: 8 },
  filterTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterTitle: { fontSize: 13, fontWeight: "700" },
  clearText: { fontSize: 12, color: "#1F8B82", fontWeight: "700" },
  filterInputWrap: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  filterInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  heroCard: { borderRadius: 18, padding: 16, gap: 14, borderWidth: 1 },
  heroTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  heroTextBlock: { flex: 1 },
  heroLabel: { fontSize: 13, fontWeight: "600" },
  heroValue: { fontSize: 34, lineHeight: 40, fontWeight: "800", color: "#1F8B82" },
  heroCaption: { marginTop: 4, fontSize: 12 },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { borderRadius: 14, padding: 14, gap: 12 },
  rowTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  leftRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1 },
  lib: { fontSize: 14, fontWeight: "600" },
  subText: { fontSize: 12, marginTop: 2 },
  qtyBadge: { alignItems: "flex-end", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  qtyBadgeBottom: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  qty: { fontSize: 20, fontWeight: "800", color: "#1F8B82" },
  qtyLabel: { fontSize: 11, marginTop: 1 },
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricLabel: { fontSize: 11 },
  metricValue: { marginTop: 2, fontSize: 14, fontWeight: "700" },
});
