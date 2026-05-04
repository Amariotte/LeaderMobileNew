import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import OperationDiverseFormModal, {
  OperationDiverseFormData,
} from "@/components/operation-diverse-form-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import {
  createOperationDiverse,
  deleteOperationDiverse,
  getfetchOperationsDiverses,
  updateOperationDiverse,
} from "@/services/api-service";
import { formatDate, formatNumber } from "@/tools/tools";
import { operation, typeMouvementColorMap } from "@/types/operations.type";

export default function OperationsDiversesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();
  const { showMessage, showConfirm } = usePopup();

  const [operations, setOperations] = useState<operation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOperateur, setFilterOperateur] = useState<string[]>([]);
  const [filterAgence, setFilterAgence] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [openPicker, setOpenPicker] = useState<"operateur" | "agence" | "mode" | "type" | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [filterDateTo, setFilterDateTo] = useState<string>(
    () => new Date().toISOString().slice(0, 10),
  );
  const [appliedDateFrom, setAppliedDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [appliedDateTo, setAppliedDateTo] = useState<string>(
    () => new Date().toISOString().slice(0, 10),
  );
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<operation | undefined>(undefined);
  const [consultItem, setConsultItem] = useState<operation | null>(null);

  useEffect(() => {
    if (!userToken) {
      setOperations([]);
      return;
    }
    setLoading(true);
    getfetchOperationsDiverses(userToken, {
      dateFrom: appliedDateFrom || undefined,
      dateTo: appliedDateTo || undefined,
    })
      .then((res) => setOperations(res?.data ?? []))
      .catch(() => {
        showMessage("error", "Erreur", "Impossible de charger les opérations.");
        setOperations([]);
      })
      .finally(() => setLoading(false));
  }, [showMessage, userToken, appliedDateFrom, appliedDateTo]);

  // Métriques
  const metrics = useMemo(() => {
    const enc = operations.filter((o) => o.bEnc).reduce((s, o) => s + (Number(o.montant) || 0), 0);
    const dec = operations.filter((o) => !o.bEnc).reduce((s, o) => s + (Number(o.montant) || 0), 0);
    return [
      { label: "Encaissements", value: formatNumber(enc), icon: "arrow-downward" as const, color: "#16A34A" },
      { label: "Décaissements", value: formatNumber(dec), icon: "arrow-upward" as const, color: "#E05252" },
      { label: "Opérations", value: String(operations.length), icon: "swap-horiz" as const, color: "#1F8B82" },
    ];
  }, [operations]);

  // Options de filtres
  const operateurs = useMemo(() => {
    const s = new Set(operations.map((o) => o.operateurNom).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [operations]);

  const agences = useMemo(() => {
    const s = new Set(operations.map((o) => o.agenceNom).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [operations]);

  const modes = useMemo(() => {
    const s = new Set(operations.map((o) => o.modeNom).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [operations]);

  const typeOptions = ["Encaissement", "Décaissement"];

  const agenceOptions = useMemo(() => {
    const map = new Map<number, string>();
    operations.forEach((o) => { if (o.agenceId && o.agenceNom) map.set(o.agenceId, o.agenceNom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [operations]);

  const banqueOptions = useMemo(() => {
    const map = new Map<number, string>();
    operations.forEach((o) => { if (o.banqueId && o.banqueNom) map.set(o.banqueId, o.banqueNom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [operations]);

  const modeFormOptions = useMemo(() => {
    const map = new Map<number, string>();
    operations.forEach((o) => { if (o.modeId && o.modeNom) map.set(o.modeId, o.modeNom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [operations]);

  // Filtrage
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = appliedDateFrom ? new Date(appliedDateFrom) : null;
    const to = appliedDateTo ? new Date(appliedDateTo + "T23:59:59") : null;
    return operations.filter((o) => {
      if (q && !o.numero?.toLowerCase().includes(q) && !o.beneOrDep?.toLowerCase().includes(q) && !o.objetOp?.toLowerCase().includes(q)) return false;
      if (filterOperateur.length > 0 && !filterOperateur.includes(o.operateurNom ?? "")) return false;
      if (filterAgence.length > 0 && !filterAgence.includes(o.agenceNom ?? "")) return false;
      if (filterMode.length > 0 && !filterMode.includes(o.modeNom ?? "")) return false;
      if (filterType.length > 0 && !filterType.includes(o.bEnc ? "Encaissement" : "Décaissement")) return false;
      if (from || to) {
        const d = o.date ? new Date(o.date) : null;
        if (!d) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });
  }, [operations, search, filterOperateur, filterAgence, filterMode, filterType, appliedDateFrom, appliedDateTo]);

  const activeDateFilter = appliedDateFrom || appliedDateTo ? 1 : 0;
  const activeFilters =
    filterOperateur.length + filterAgence.length + filterMode.length + filterType.length + activeDateFilter;

  // Couleurs
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const muted = isDark ? "#A8AEC7" : "#61637A";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";

  // Handlers
  const openCreate = () => { setFormMode("create"); setSelectedItem(undefined); setFormVisible(true); };

  const handleEdit = (item: operation) => { setFormMode("edit"); setSelectedItem(item); setFormVisible(true); };

  const handleDelete = (item: operation) => {
    showConfirm(
      "error",
      "Supprimer l'opération",
      `Supprimer l'opération ${item.numero} ?`,
      async () => {
        try {
          await deleteOperationDiverse(userToken ?? "", Number(item.id));
          setOperations((prev) => prev.filter((o) => o.id !== item.id));
        } catch {
          showMessage("error", "Erreur", "Impossible de supprimer cette opération.");
        }
      },
      { confirmLabel: "Supprimer", cancelLabel: "Annuler" },
    );
  };

  const handleConsult = (item: operation) => setConsultItem(item);

  const handlePrint = (_item: operation) =>
    showMessage("info", "Impression", "Fonctionnalité d'impression bientôt disponible.");

  const handleFormSubmit = async (data: OperationDiverseFormData) => {
    if (!userToken) return;
    const payload: Partial<operation> = {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    };
    if (formMode === "edit" && selectedItem) {
      const updated = await updateOperationDiverse(userToken, Number(selectedItem.id), payload);
      setOperations((prev) => prev.map((o) => (o.id === selectedItem.id ? { ...o, ...updated } : o)));
    } else {
      const created = await createOperationDiverse(userToken, payload);
      setOperations((prev) => [created, ...prev]);
    }
  };

  // Picker helper
  const pickerConfig = useMemo(() => {
    if (openPicker === "operateur") return { list: operateurs, current: filterOperateur, setter: setFilterOperateur, title: "Choisir un opérateur" };
    if (openPicker === "agence") return { list: agences, current: filterAgence, setter: setFilterAgence, title: "Choisir une agence" };
    if (openPicker === "mode") return { list: modes, current: filterMode, setter: setFilterMode, title: "Choisir un mode" };
    if (openPicker === "type") return { list: typeOptions, current: filterType, setter: setFilterType, title: "Choisir le type" };
    return { list: [] as string[], current: [] as string[], setter: (_v: string[]) => {}, title: "" };
  }, [openPicker, operateurs, agences, modes, typeOptions, filterOperateur, filterAgence, filterMode, filterType]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Opérations diverses" />
      </View>

      {/* Bouton créer */}
      <View style={styles.topActions}>
        <ThemedText style={styles.countLabel}>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </ThemedText>
        <Pressable style={styles.createBtn} onPress={openCreate}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <ThemedText style={styles.createBtnText}>Nouveau</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Métriques */}
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <View key={m.label} style={[styles.metricCard, { backgroundColor: cardBackground }]}>
              <MaterialIcons name={m.icon} size={20} color={m.color} />
              <ThemedText style={[styles.metricValue, { color: m.color }]}>{m.value}</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: muted }]}>{m.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Barre de recherche */}
        <View style={[styles.searchBar, { backgroundColor: cardBackground }]}>
          <MaterialIcons name="search" size={16} color={muted} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#FFFFFF" : "#11131A" }]}
            placeholder="Rechercher par numéro, bénéficiaire ou objet"
            placeholderTextColor={muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <MaterialIcons name="close" size={16} color={muted} />
            </Pressable>
          )}
        </View>

        {/* Filtres */}
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterBtn, { backgroundColor: filterType.length > 0 ? "#1F8B82" : cardBackground }]}
            onPress={() => setOpenPicker("type")}
          >
            <MaterialIcons name="swap-horiz" size={14} color={filterType.length > 0 ? "#FFFFFF" : muted} />
            <ThemedText style={[styles.filterBtnText, { color: filterType.length > 0 ? "#FFFFFF" : muted }]} numberOfLines={1}>
              {filterType.length > 0 ? `Type (${filterType.length})` : "Type"}
            </ThemedText>
            {filterType.length > 0 ? (
              <Pressable hitSlop={6} onPress={() => setFilterType([])}>
                <MaterialIcons name="close" size={12} color="#FFFFFF" />
              </Pressable>
            ) : (
              <MaterialIcons name="arrow-drop-down" size={16} color={muted} />
            )}
          </Pressable>

          <Pressable
            style={[styles.filterBtn, { backgroundColor: filterAgence.length > 0 ? "#6B3CFF" : cardBackground }]}
            onPress={() => setOpenPicker("agence")}
          >
            <MaterialIcons name="business" size={14} color={filterAgence.length > 0 ? "#FFFFFF" : muted} />
            <ThemedText style={[styles.filterBtnText, { color: filterAgence.length > 0 ? "#FFFFFF" : muted }]} numberOfLines={1}>
              {filterAgence.length > 0 ? `Agence (${filterAgence.length})` : "Agence"}
            </ThemedText>
            {filterAgence.length > 0 ? (
              <Pressable hitSlop={6} onPress={() => setFilterAgence([])}>
                <MaterialIcons name="close" size={12} color="#FFFFFF" />
              </Pressable>
            ) : (
              <MaterialIcons name="arrow-drop-down" size={16} color={muted} />
            )}
          </Pressable>

          <Pressable
            style={[styles.filterBtn, { backgroundColor: filterMode.length > 0 ? "#E8872A" : cardBackground }]}
            onPress={() => setOpenPicker("mode")}
          >
            <MaterialIcons name="payment" size={14} color={filterMode.length > 0 ? "#FFFFFF" : muted} />
            <ThemedText style={[styles.filterBtnText, { color: filterMode.length > 0 ? "#FFFFFF" : muted }]} numberOfLines={1}>
              {filterMode.length > 0 ? `Mode (${filterMode.length})` : "Mode"}
            </ThemedText>
            {filterMode.length > 0 ? (
              <Pressable hitSlop={6} onPress={() => setFilterMode([])}>
                <MaterialIcons name="close" size={12} color="#FFFFFF" />
              </Pressable>
            ) : (
              <MaterialIcons name="arrow-drop-down" size={16} color={muted} />
            )}
          </Pressable>
        </View>

        {/* Filtre période */}
        <Pressable
          style={[
            styles.datePeriodBtn,
            { backgroundColor: activeDateFilter ? "#2D6ACF" : cardBackground, borderColor: activeDateFilter ? "#2D6ACF" : borderColor },
          ]}
          onPress={() => { setFilterDateFrom(appliedDateFrom); setFilterDateTo(appliedDateTo); setDatePickerOpen(true); }}
        >
          <MaterialIcons name="date-range" size={15} color={activeDateFilter ? "#FFFFFF" : muted} />
          <ThemedText style={[styles.datePeriodText, { color: activeDateFilter ? "#FFFFFF" : muted }]} numberOfLines={1}>
            {activeDateFilter ? `${appliedDateFrom || "…"} → ${appliedDateTo || "…"}` : "Filtrer par période"}
          </ThemedText>
          {activeDateFilter ? (
            <Pressable hitSlop={8} onPress={() => {
              const d30 = new Date(); d30.setDate(d30.getDate() - 30);
              const from = d30.toISOString().slice(0, 10);
              const to = new Date().toISOString().slice(0, 10);
              setFilterDateFrom(from); setFilterDateTo(to);
              setAppliedDateFrom(from); setAppliedDateTo(to);
            }}>
              <MaterialIcons name="close" size={14} color="#FFFFFF" />
            </Pressable>
          ) : (
            <MaterialIcons name="chevron-right" size={16} color={muted} />
          )}
        </Pressable>

        {activeFilters > 0 && (
          <Pressable style={styles.clearFilters} onPress={() => {
            setFilterOperateur([]); setFilterAgence([]); setFilterMode([]); setFilterType([]);
            setFilterDateFrom(""); setFilterDateTo("");
            setAppliedDateFrom(""); setAppliedDateTo("");
          }}>
            <MaterialIcons name="filter-alt-off" size={14} color="#E05252" />
            <ThemedText style={styles.clearFiltersText}>Réinitialiser ({activeFilters})</ThemedText>
          </Pressable>
        )}

        {/* Modale filtre période */}
        <Modal visible={datePickerOpen} transparent animationType="fade" onRequestClose={() => setDatePickerOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setDatePickerOpen(false)}>
            <Pressable style={[styles.modalSheet, { backgroundColor: cardBackground }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Filtrer par période</ThemedText>
                <Pressable onPress={() => setDatePickerOpen(false)}>
                  <MaterialIcons name="close" size={20} color={muted} />
                </Pressable>
              </View>
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <ThemedText style={[styles.dateFieldLabel, { color: muted }]}>Du</ThemedText>
                  <View style={[styles.dateInput, { backgroundColor: isDark ? "#242735" : "#F2F3F8", borderColor }]}>
                    <MaterialIcons name="calendar-today" size={14} color={muted} />
                    <TextInput style={[styles.dateInputText, { color: isDark ? "#FFFFFF" : "#11131A" }]} placeholder="AAAA-MM-JJ" placeholderTextColor={muted} value={filterDateFrom} onChangeText={setFilterDateFrom} keyboardType="numbers-and-punctuation" maxLength={10} />
                  </View>
                </View>
                <MaterialIcons name="arrow-forward" size={16} color={muted} style={{ marginTop: 28 }} />
                <View style={styles.dateField}>
                  <ThemedText style={[styles.dateFieldLabel, { color: muted }]}>Au</ThemedText>
                  <View style={[styles.dateInput, { backgroundColor: isDark ? "#242735" : "#F2F3F8", borderColor }]}>
                    <MaterialIcons name="calendar-today" size={14} color={muted} />
                    <TextInput style={[styles.dateInputText, { color: isDark ? "#FFFFFF" : "#11131A" }]} placeholder="AAAA-MM-JJ" placeholderTextColor={muted} value={filterDateTo} onChangeText={setFilterDateTo} keyboardType="numbers-and-punctuation" maxLength={10} />
                  </View>
                </View>
              </View>
              <View style={styles.dateShortcuts}>
                {([
                  { label: "Aujourd'hui", fn: () => { const d = new Date().toISOString().slice(0, 10); setFilterDateFrom(d); setFilterDateTo(d); } },
                  { label: "Ce mois", fn: () => { const n = new Date(); const y = n.getFullYear(); const m = String(n.getMonth() + 1).padStart(2, "0"); setFilterDateFrom(`${y}-${m}-01`); setFilterDateTo(`${y}-${m}-${String(new Date(y, n.getMonth() + 1, 0).getDate()).padStart(2, "0")}`); } },
                  { label: "Cette année", fn: () => { const y = new Date().getFullYear(); setFilterDateFrom(`${y}-01-01`); setFilterDateTo(`${y}-12-31`); } },
                ] as { label: string; fn: () => void }[]).map((s) => (
                  <Pressable key={s.label} style={[styles.shortcutBtn, { backgroundColor: isDark ? "#242735" : "#F2F3F8" }]} onPress={s.fn}>
                    <ThemedText style={[styles.shortcutText, { color: muted }]}>{s.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
              <View style={styles.dateActions}>
                <Pressable style={styles.dateClearBtn} onPress={() => {
                  const d30 = new Date(); d30.setDate(d30.getDate() - 30);
                  const from = d30.toISOString().slice(0, 10);
                  const to = new Date().toISOString().slice(0, 10);
                  setFilterDateFrom(from); setFilterDateTo(to);
                  setAppliedDateFrom(from); setAppliedDateTo(to);
                  setDatePickerOpen(false);
                }}>
                  <MaterialIcons name="restart-alt" size={16} color="#E05252" />
                  <ThemedText style={styles.dateClearText}>Effacer</ThemedText>
                </Pressable>
                <Pressable style={styles.dateApplyBtn} onPress={() => {
                  setAppliedDateFrom(filterDateFrom);
                  setAppliedDateTo(filterDateTo);
                  setDatePickerOpen(false);
                }}>
                  <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.dateApplyText}>Appliquer</ThemedText>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modale sélection multi-choix */}
        <Modal visible={openPicker !== null} transparent animationType="fade" onRequestClose={() => setOpenPicker(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setOpenPicker(null)}>
            <Pressable style={[styles.modalSheet, { backgroundColor: cardBackground }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>{pickerConfig.title}</ThemedText>
                <Pressable onPress={() => setOpenPicker(null)}>
                  <MaterialIcons name="close" size={20} color={muted} />
                </Pressable>
              </View>
              <ScrollView>
                {pickerConfig.list.map((val) => {
                  const isSelected = pickerConfig.current.includes(val);
                  return (
                    <Pressable
                      key={val}
                      style={[styles.modalOption, isSelected && { backgroundColor: softBlock }]}
                      onPress={() => pickerConfig.setter(isSelected ? pickerConfig.current.filter((v) => v !== val) : [...pickerConfig.current, val])}
                    >
                      <ThemedText style={[styles.modalOptionText, isSelected && { color: "#1F8B82", fontWeight: "700" }]}>{val}</ThemedText>
                      <MaterialIcons name={isSelected ? "check-box" : "check-box-outline-blank"} size={18} color={isSelected ? "#1F8B82" : muted} />
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable style={styles.modalConfirm} onPress={() => setOpenPicker(null)}>
                <ThemedText style={styles.modalConfirmText}>Valider</ThemedText>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Liste */}
        {loading ? (
          <ActivityIndicator size="small" color="#1F8B82" style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBackground }]}>
            <MaterialIcons name="swap-horiz" size={24} color={muted} />
            <ThemedText style={[styles.emptyText, { color: muted }]}>Aucune opération trouvée</ThemedText>
          </View>
        ) : (
          filtered.map((item) => {
            const typeColor = item.bEnc
              ? typeMouvementColorMap["Encaissement"]
              : typeMouvementColorMap["Décaissement"];
            return (
              <View key={String(item.id)} style={[styles.card, { backgroundColor: cardBackground }]}>
                <View style={styles.cardRow}>
                  <View style={[styles.typeIndicator, { backgroundColor: typeColor + "20" }]}>
                    <MaterialIcons name={item.bEnc ? "arrow-downward" : "arrow-upward"} size={14} color={typeColor} />
                  </View>
                  <ThemedText style={[styles.cardLabel, { flex: 1 }]}>{item.numero}</ThemedText>
                  <View style={styles.cardActions}>
                    <Pressable style={[styles.actionBtn, { backgroundColor: softBlock }]} onPress={() => handleEdit(item)} hitSlop={6}>
                      <MaterialIcons name="edit" size={14} color={isDark ? "#DCE0F8" : "#707792"} />
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: softBlock }]} onPress={() => handleDelete(item)} hitSlop={6}>
                      <MaterialIcons name="delete-outline" size={14} color="#E05252" />
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: softBlock }]} onPress={() => handleConsult(item)} hitSlop={6}>
                      <MaterialIcons name="visibility" size={14} color={isDark ? "#DCE0F8" : "#707792"} />
                    </Pressable>
                    <Pressable style={[styles.actionBtn, { backgroundColor: softBlock }]} onPress={() => handlePrint(item)} hitSlop={6}>
                      <MaterialIcons name="print" size={14} color={isDark ? "#DCE0F8" : "#707792"} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.cardRow}>
                  <View style={styles.textBlock}>
                    {!!item.objetOp && (
                      <ThemedText style={[styles.cardMeta, { color: muted }]} numberOfLines={1}>{item.objetOp}</ThemedText>
                    )}
                    <ThemedText style={[styles.cardMeta, { color: muted }]}>
                      {formatDate(item.date)}{item.modeNom ? ` • ${item.modeNom}` : ""}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.cardValue, { color: typeColor }]}>
                    {item.bEnc ? "+" : "-"}{formatNumber(item.montant)} XOF
                  </ThemedText>
                </View>
                {(!!item.agenceNom || !!item.operateurNom) && (
                  <View style={styles.cardFooter}>
                    {!!item.agenceNom && (
                      <ThemedText style={[styles.cardFooterText, { color: muted }]}>
                        <MaterialIcons name="business" size={10} color={muted} /> {item.agenceNom}
                      </ThemedText>
                    )}
                    {!!item.operateurNom && (
                      <ThemedText style={[styles.cardFooterText, { color: muted }]}>
                        <MaterialIcons name="person-outline" size={10} color={muted} /> {item.operateurNom}
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modale consultation */}
      <Modal visible={consultItem !== null} transparent animationType="slide" onRequestClose={() => setConsultItem(null)}>
        <Pressable style={styles.consultOverlay} onPress={() => setConsultItem(null)}>
          <Pressable style={[styles.consultSheet, { backgroundColor: cardBackground }]}>
            <View style={styles.consultHeader}>
              <ThemedText style={styles.consultTitle}>Détail opération</ThemedText>
              <Pressable onPress={() => setConsultItem(null)}>
                <MaterialIcons name="close" size={20} color={muted} />
              </Pressable>
            </View>
            {consultItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {([
                  { label: "Numéro", value: consultItem.numero, icon: "tag" },
                  { label: "Type", value: consultItem.bEnc ? "Encaissement" : "Décaissement", icon: "swap-horiz" },
                  { label: "Date", value: formatDate(consultItem.date), icon: "calendar-today" },
                  { label: "Montant", value: `${formatNumber(consultItem.montant)} XOF`, icon: "payments" },
                  { label: "Bénéficiaire / Déposant", value: consultItem.beneOrDep || "—", icon: "person" },
                  { label: "Objet", value: consultItem.objetOp || "—", icon: "subject" },
                  { label: "Mode", value: consultItem.modeNom || "—", icon: "payment" },
                  { label: "Agence", value: consultItem.agenceNom || "—", icon: "business" },
                  { label: "Banque", value: consultItem.banqueNom || "—", icon: "account-balance" },
                  { label: "Opérateur", value: consultItem.operateurNom || "—", icon: "person-outline" },
                  { label: "Référence", value: consultItem.ref || "—", icon: "bookmark" },
                  { label: "Description", value: consultItem.desc || "—", icon: "notes" },
                ] as { label: string; value: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }[]).map((row) => (
                  <View key={row.label} style={[styles.consultRow, { borderBottomColor: borderColor }]}>
                    <View style={styles.consultRowLeft}>
                      <MaterialIcons name={row.icon} size={14} color={muted} />
                      <ThemedText style={[styles.consultLabel, { color: muted }]}>{row.label}</ThemedText>
                    </View>
                    <ThemedText style={styles.consultValue}>{row.value}</ThemedText>
                  </View>
                ))}
                <View style={{ height: 24 }} />
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Formulaire création / modification */}
      <OperationDiverseFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={formMode === "edit" ? selectedItem : undefined}
        title={formMode === "create" ? "Nouvelle opération" : `Modifier ${selectedItem?.numero ?? ""}`}
        agenceOptions={agenceOptions}
        banqueOptions={banqueOptions}
        modeOptions={modeFormOptions}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 12 },
  headerWrap: { marginTop: -16, marginHorizontal: -12, marginBottom: 14 },
  content: { gap: 10, paddingBottom: 24 },
  topActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  countLabel: { fontSize: 12, opacity: 0.6 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#1F8B82", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  createBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  metricCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  metricValue: { fontSize: 15, fontWeight: "800" },
  metricLabel: { fontSize: 10, textAlign: "center" },
  loader: { marginTop: 16 },
  emptyCard: { borderRadius: 14, padding: 16, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { fontSize: 13, fontWeight: "600" },
  searchBar: { height: 42, borderRadius: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 6 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  filterBtn: { flex: 1, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: "#D8DDEB", minWidth: 0 },
  filterBtnText: { fontSize: 12, fontWeight: "600", flex: 1 },
  datePeriodBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 10 },
  datePeriodText: { flex: 1, fontSize: 12, fontWeight: "600" },
  clearFilters: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10, alignSelf: "flex-start" },
  clearFiltersText: { fontSize: 12, color: "#E05252", fontWeight: "600" },
  card: { borderRadius: 14, padding: 14 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeIndicator: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  textBlock: { flex: 1 },
  cardLabel: { fontSize: 14, fontWeight: "700" },
  cardMeta: { fontSize: 12, marginTop: 1 },
  cardValue: { fontSize: 14, fontWeight: "800" },
  cardActions: { flexDirection: "row", gap: 6 },
  actionBtn: { width: 32, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  cardFooter: { flexDirection: "row", gap: 12, marginTop: 8 },
  cardFooterText: { fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32, maxHeight: "60%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { fontSize: 15, fontWeight: "700" },
  modalOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  modalOptionText: { fontSize: 14 },
  modalConfirm: { marginTop: 12, backgroundColor: "#1F8B82", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  modalConfirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  dateRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 14 },
  dateField: { flex: 1 },
  dateFieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  dateInput: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 },
  dateInputText: { flex: 1, fontSize: 13 },
  dateShortcuts: { flexDirection: "row", gap: 8, marginBottom: 16 },
  shortcutBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  shortcutText: { fontSize: 11, fontWeight: "600" },
  dateActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  dateClearBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 12, borderWidth: 1.5, borderColor: "#E05252", backgroundColor: "transparent" },
  dateClearText: { color: "#E05252", fontSize: 13, fontWeight: "700" },
  dateApplyBtn: { flex: 3, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 15, backgroundColor: "#1F8B82", shadowColor: "#1F8B82", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 },
  dateApplyText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  consultOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  consultSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingHorizontal: 16, paddingBottom: 0, maxHeight: "85%" },
  consultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  consultTitle: { fontSize: 16, fontWeight: "700" },
  consultRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  consultRowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  consultLabel: { fontSize: 12 },
  consultValue: { fontSize: 13, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
});
