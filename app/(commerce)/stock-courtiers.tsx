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
import { getfetchCompagnies } from "@/services/api-service";
import { getfetchStockCourtiers, updateStockCourtier } from "@/services/api-stock";
import { formatNumber } from "@/tools/tools";
import { itemDefaut } from "@/types/other.type";
import { listStockCourtier } from "@/types/stock.type";


export default function StockCourtiersScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { showMessage } = usePopup();
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const inputBg = isDark ? "#1E2230" : "#F9FAFD";
  const borderColor = isDark ? "#2F3547" : "#E4E9F5";
  const mutedText = isDark ? "#A8AEC7" : "#75809A";
  const heroTint = isDark ? "#163E3A" : "#E5F7F5";
  const receivedBg = isDark ? "#1C334A" : "#E8F2FF";
  const receivedColor = isDark ? "#98C6FF" : "#1D4ED8";
  const retiredBg = isDark ? "#3A2A1A" : "#FFF1E7";
  const retiredColor = isDark ? "#F8CFA4" : "#C2410C";
  const producedBg = isDark ? "#173127" : "#E8F6ED";
  const producedColor = isDark ? "#A2E3BE" : "#166534";
  const availableBg = isDark ? "#143B39" : "#DBF4F1";
  const [items, setItems] = useState<listStockCourtier>({ data: [] });
  const [loading, setLoading] = useState(false);
  const { userToken } = useAuthContext();
  const [compagnieFilter, setCompagnieFilter] = useState("");
  const [selectedCompagnieId, setSelectedCompagnieId] = useState<number | null>(null);
  const [movementQtyInput, setMovementQtyInput] = useState("");
  const [movementType, setMovementType] = useState<"add" | "remove">("add");
  const [movementPopupOpen, setMovementPopupOpen] = useState(false);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [compagnies, setCompagnies] = useState<itemDefaut[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadStockCourtiers = useCallback(async () => {
    if (!userToken) return;
    setLoading(true);
    try {
      const data = await getfetchStockCourtiers(userToken);
      setItems(data);
    } catch {
      setItems({ data: [] });
    } finally {
      setLoading(false);
    }
  }, [userToken]);
 
  useEffect(() => {
    loadStockCourtiers();
  }, [loadStockCourtiers]);

  useEffect(() => {
    if (!userToken) return;

    getfetchCompagnies(userToken)
      .then((data) => setCompagnies(data))
      .catch(() => setCompagnies([]));
  }, [userToken]);

  const stockCourtiers = items.data ?? [];

  const compagnieOptions = useMemo<PickerOption[]>(
    () =>
      compagnies
        .map((item) => ({ id: item.id, label: item.libelle || "Compagnie inconnue" }))
        .sort((a, b) => a.label.localeCompare(b.label, "fr")),
    [compagnies],
  );

  const selectedCompagnie = useMemo(
    () => stockCourtiers.find((item) => item.compagnieId === selectedCompagnieId),
    [selectedCompagnieId, stockCourtiers],
  );

  const currentStock = selectedCompagnie?.qteDisponibles ?? 0;
  const filteredItems = useMemo(
    () => stockCourtiers.filter((item) => {
      const compagnie = (item?.compagnieNom ?? "").toLowerCase();
      const byCompagnie = !compagnieFilter.trim()
        || compagnie.includes(compagnieFilter.trim().toLowerCase());
      return byCompagnie;
    }),
    [compagnieFilter, stockCourtiers],
  );

  const totals = useMemo(
    () =>
      filteredItems.reduce(
        (acc, item) => ({
          disponibles: acc.disponibles + (item.qteDisponibles ?? 0),
          recues: acc.recues + (item.qteRecues ?? 0),
          retirees: acc.retirees + (item.qteRetirees ?? 0),
          distribuees: acc.distribuees + (item.qteDistribuees ?? 0),
        }),
        { disponibles: 0, recues: 0, retirees: 0, distribuees: 0 },
      ),
    [filteredItems],
  );

  const openMovementPopup = (type: "add" | "remove", compagnieId?: number) => {
    setMovementType(type);
    if (typeof compagnieId === "number") {
      setSelectedCompagnieId(compagnieId);
    } else {
      setSelectedCompagnieId((prev) => prev ?? stockCourtiers[0]?.compagnieId ?? null);
    }
    setMovementQtyInput("");
    setMovementPopupOpen(true);
  };

  const handleApplyStock = async () => {
    if (!userToken) {
      showMessage("error", "Session invalide", "Veuillez vous reconnecter.");
      return;
    }

    if (!selectedCompagnieId) {
      showMessage("error", "Compagnie requise", "Veuillez choisir une compagnie.");
      return;
    }

    const qty = Number(movementQtyInput || "0");

    if (!Number.isFinite(qty) || qty <= 0) {
      showMessage("error", "Quantité invalide", "Saisissez uniquement des nombres positifs.");
      return;
    }

    const addQty = movementType === "add" ? qty : 0;
    const removeQty = movementType === "remove" ? qty : 0;

    if (removeQty > currentStock && movementType === "remove") {
      showMessage("error", "Stock insuffisant", "La quantité à retirer dépasse le stock disponible.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        compagnieId: selectedCompagnieId,
        qteMvt: addQty > 0 ? addQty : -removeQty,
      };

      const response = await updateStockCourtier(userToken, payload);
      await loadStockCourtiers();

      setMovementQtyInput("");
      setMovementPopupOpen(false);
      showMessage("success", "Stock mis à jour", response?.message || "Le mouvement de stock courtier a été enregistré.");
    } catch {
      showMessage("error", "Échec de mise à jour", "Impossible d'enregistrer le mouvement de stock.");
    } finally {
      setSubmitting(false);
    }
  };

  
  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Stock Courtiers" />
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
            {compagnieFilter && (
              <Pressable onPress={() => setCompagnieFilter("")}>
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

        </View>

        <View style={[styles.heroCard, { backgroundColor: cardBackground, borderColor: heroTint }]}> 
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <ThemedText style={[styles.heroLabel, { color: mutedText }]}>Total disponible courtiers</ThemedText>
              <ThemedText style={styles.heroValue}>{formatNumber(totals.disponibles)}</ThemedText>
              <ThemedText style={[styles.heroCaption, { color: mutedText }]}>
                {filteredItems.length} compagnie(s) affichée(s)
              </ThemedText>
            </View>
            <View style={[styles.heroIconWrap, { backgroundColor: heroTint }]}> 
              <MaterialIcons name="account-balance" size={24} color="#1F8B82" />
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#1F8B82" style={{ marginTop: 20 }} />
        ) : filteredItems.length === 0 ? (
          <ThemedText style={{ textAlign: "center", color: mutedText, marginTop: 20 }}>Aucun stock disponible</ThemedText>
        ) : filteredItems.map((item, index) => (
          <View key={`${item.compagnieId ?? "c"}-${index}`} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.rowTop}>
              <View style={styles.leftRow}>
                <View style={[styles.iconWrap, { backgroundColor: heroTint }]}> 
                  <MaterialIcons name="verified" size={18} color="#1F8B82" />
                </View>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.lib}>{item.compagnieNom || "Compagnie inconnue"}</ThemedText>
                  <ThemedText style={[styles.subText, { color: mutedText }]}>Stock courtier</ThemedText>
                </View>
              </View>

              <View style={styles.cardActionsTopRight}>
                <Pressable
                  style={[styles.cardIconBtn, styles.cardActionAdd]}
                  onPress={() => openMovementPopup("add", item.compagnieId)}
                >
                  <MaterialIcons name="add-circle-outline" size={18} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={[styles.cardIconBtn, styles.cardActionRemove]}
                  onPress={() => openMovementPopup("remove", item.compagnieId)}
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
                <ThemedText style={[styles.metricValue, { color: producedColor }]}>{formatNumber(item.qteDistribuees)}</ThemedText>
              </View>
            </View>

            <View style={[styles.bottomInfo, { backgroundColor: softBlock }]}> 
              <ThemedText style={[styles.bottomInfoText, { color: mutedText }]}>Retirées après distribution</ThemedText>
              <ThemedText style={styles.bottomInfoValue}>{formatNumber(item.qteRetireesAfterDistribuees)}</ThemedText>
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
              <ThemedText style={styles.popupTitle}>Saisie stock courtier</ThemedText>
              <Pressable onPress={() => setMovementPopupOpen(false)}>
                <MaterialIcons name="close" size={20} color={mutedText} />
              </Pressable>
            </View>

            <View style={styles.popupTypeRow}>
              <Pressable
                style={[
                  styles.popupTypeBtn,
                  { backgroundColor: movementType === "add" ? "#16A34A" : softBlock },
                ]}
                onPress={() => setMovementType("add")}
              >
                <MaterialIcons name="add" size={15} color={movementType === "add" ? "#FFFFFF" : mutedText} />
                <ThemedText style={[styles.popupTypeText, { color: movementType === "add" ? "#FFFFFF" : mutedText }]}>Ajouter</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.popupTypeBtn,
                  { backgroundColor: movementType === "remove" ? "#E05252" : softBlock },
                ]}
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
                onPress={() => setCompanyPickerOpen(true)}
              >
                <MaterialIcons name="apartment" size={16} color={mutedText} />
                <ThemedText style={[styles.selectBtnText, { color: selectedCompagnie ? "#1F8B82" : mutedText }]} numberOfLines={1}>
                  {selectedCompagnie?.compagnieNom || "Choisir une compagnie"}
                </ThemedText>
                <MaterialIcons name="expand-more" size={20} color={mutedText} />
              </Pressable>
            </View>

            <View style={[styles.currentStockCard, { backgroundColor: softBlock }]}> 
              <ThemedText style={[styles.currentStockLabel, { color: mutedText }]}>Stock actuel</ThemedText>
              <ThemedText style={styles.currentStockValue}>{formatNumber(currentStock)}</ThemedText>
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
        visible={companyPickerOpen}
        title="Choisir une compagnie"
        options={compagnieOptions}
        selectedId={selectedCompagnieId ?? undefined}
        searchable
        onSelect={(option) => {
          setSelectedCompagnieId(Number(option.id));
          setCompanyPickerOpen(false);
        }}
        onClose={() => setCompanyPickerOpen(false)}
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
  popupCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  popupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  popupTitle: { fontSize: 15, fontWeight: "800" },
  popupTypeRow: { flexDirection: "row", gap: 8 },
  popupTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    height: 36,
  },
  popupTypeText: { fontSize: 12, fontWeight: "700" },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "600" },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBtnText: { flex: 1, fontSize: 13, fontWeight: "600" },
  currentStockCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentStockLabel: { fontSize: 12 },
  currentStockValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F8B82",
  },
  rowDuo: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1, gap: 6 },
  numberInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  numberInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  entrySubmitBtn: {
    marginTop: 2,
    backgroundColor: "#1F8B82",
    borderRadius: 10,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  entrySubmitText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cardActionsTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
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
  qtyBadgeBottom: { alignSelf: "flex-end", minWidth: 120 },
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
  bottomInfo: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomInfoText: { fontSize: 12 },
  bottomInfoValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F8B82",
  },
});
