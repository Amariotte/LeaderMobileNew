import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import EncaissementPrimeFormModal, { EncaissementPrimeFormData } from "@/components/encaissement-prime-form-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import BottomPickerModal, { PickerOption as BPickerOption } from "@/components/ui/bottom-picker-modal";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import {
  createEncaissementPrime,
  deleteEncaissementPrime,
  getfetchEncaissementsPrimes,
  updateEncaissementPrime,
} from "@/services/api-service";
import { formatDate, formatNumber } from "@/tools/tools";
import { encaissementPrime } from "@/types/encaissementPrime.type";

export default function EncaissementsPrimesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();
  const { showMessage, showConfirm } = usePopup();
  const [encaissements, setEncaissements] = useState<encaissementPrime[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOperateur, setFilterOperateur] = useState<string[]>([]);
  const [filterAgence, setFilterAgence] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<string[]>([]);
  const [openPicker, setOpenPicker] = useState<"operateur" | "agence" | "mode" | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [filterDateTo, setFilterDateTo] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<encaissementPrime | undefined>(undefined);
  const [consultItem, setConsultItem] = useState<encaissementPrime | null>(null);

  // Dates appliquées à l'API (distinctes des dates en cours de saisie dans le modal)
  const [appliedDateFrom, setAppliedDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [appliedDateTo, setAppliedDateTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!userToken) {
      setEncaissements([]);
      return;
    }

    setLoading(true);
    getfetchEncaissementsPrimes(userToken, {
      dateFrom: appliedDateFrom || undefined,
      dateTo: appliedDateTo || undefined,
    })
      .then((response) => setEncaissements(response?.data ?? []))
      .catch(() => {
        showMessage("error", "Erreur", "Impossible de charger les encaissements.");
        setEncaissements([]);
      })
      .finally(() => setLoading(false));
  }, [showMessage, userToken, appliedDateFrom, appliedDateTo]);

  const metrics = useMemo(() => {
    const total = encaissements.reduce(
      (acc, item) => acc + (Number(item.montant) || 0),
      0,
    );
    const moyenne = encaissements.length > 0 ? total / encaissements.length : 0;

    return [
      { label: "Total encaissé", value: formatNumber(total), icon: "payments" as const },
      { label: "Prime moyenne", value: formatNumber(Math.round(moyenne)), icon: "speed" as const },
      { label: "Dossiers", value: formatNumber(encaissements.length), icon: "description" as const },
    ];
  }, [encaissements]);

  const operateurs = useMemo(() => {
    const set = new Set(encaissements.map((e) => e.operateurNom).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [encaissements]);

  const agences = useMemo(() => {
    const set = new Set(encaissements.map((e) => e.agenceNom).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [encaissements]);

  const modes = useMemo(() => {
    const set = new Set(encaissements.map((e) => e.modeNom).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [encaissements]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = filterDateFrom ? new Date(filterDateFrom) : null;
    const to = filterDateTo ? new Date(filterDateTo + "T23:59:59") : null;
    return encaissements.filter((e) => {
      if (q && !e.numero?.toLowerCase().includes(q) && !e.clientNom?.toLowerCase().includes(q)) return false;
      if (filterOperateur.length > 0 && !filterOperateur.includes(e.operateurNom ?? "")) return false;
      if (filterAgence.length > 0 && !filterAgence.includes(e.agenceNom ?? "")) return false;
      if (filterMode.length > 0 && !filterMode.includes(e.modeNom ?? "")) return false;
      if (from || to) {
        const d = e.date ? new Date(e.date) : null;
        if (!d) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });
  }, [encaissements, search, filterOperateur, filterAgence, filterMode, filterDateFrom, filterDateTo]);

  const activeDateFilter = appliedDateFrom || appliedDateTo ? 1 : 0;
  const activeFilters = filterOperateur.length + filterAgence.length + filterMode.length + activeDateFilter;

  const agenceOptions = useMemo(() => {
    const map = new Map<number, string>();
    encaissements.forEach((e) => { if (e.agenceId && e.agenceNom) map.set(e.agenceId, e.agenceNom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [encaissements]);

  const banqueOptions = useMemo(() => {
    const map = new Map<number, string>();
    encaissements.forEach((e) => { if (e.banqueId && e.banqueNom) map.set(e.banqueId, e.banqueNom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [encaissements]);

  const modeFormOptions = useMemo(() => {
    const map = new Map<number, string>();
    encaissements.forEach((e) => { if (e.modeId && e.modeNom) map.set(e.modeId, e.modeNom); });
    return Array.from(map.entries()).map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [encaissements]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const muted = isDark ? "#A8AEC7" : "#61637A";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";

  const openCreate = () => {
    setFormMode("create");
    setSelectedItem(undefined);
    setFormVisible(true);
  };

  const handleEdit = (item: encaissementPrime) => {
    setFormMode("edit");
    setSelectedItem(item);
    setFormVisible(true);
  };

  const handleDelete = (item: encaissementPrime) => {
    showConfirm(
      "error",
      "Supprimer l'encaissement",
      `Supprimer l'encaissement ${item.numero} ?`,
      async () => {
        try {
          await deleteEncaissementPrime(userToken ?? "", Number(item.id));
          setEncaissements((prev) => prev.filter((e) => e.id !== item.id));
        } catch {
          showMessage("error", "Erreur", "Impossible de supprimer cet encaissement.");
        }
      },
      { confirmLabel: "Supprimer", cancelLabel: "Annuler" },
    );
  };

  const handleConsult = (item: encaissementPrime) => {
    setConsultItem(item);
  };

  const handlePrint = (_item: encaissementPrime) => {
    showMessage("info", "Impression", "Fonctionnalité d'impression bientôt disponible.");
  };

  const handleFormSubmit = async (data: EncaissementPrimeFormData) => {
    if (!userToken) return;
    const payload: Partial<encaissementPrime> = {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    };
    if (formMode === "edit" && selectedItem) {
      const updated = await updateEncaissementPrime(userToken, Number(selectedItem.id), payload);
      setEncaissements((prev) => prev.map((e) => (e.id === selectedItem.id ? { ...e, ...updated } : e)));
    } else {
      const created = await createEncaissementPrime(userToken, payload);
      setEncaissements((prev) => [created, ...prev]);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Encaissements primes" />
      </View>

      {/* Bouton créer */}
      <View style={styles.topActions}>
        <ThemedText style={styles.countLabel}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</ThemedText>
        <Pressable style={styles.createBtn} onPress={openCreate}>
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <ThemedText style={styles.createBtnText}>Nouveau</ThemedText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <View key={m.label} style={[styles.metricCard, { backgroundColor: cardBackground }]}>
              <MaterialIcons name={m.icon} size={20} color="#1F8B82" />
              <ThemedText style={styles.metricValue}>{m.value}</ThemedText>
              <ThemedText style={[styles.metricLabel, { color: muted }]}>{m.label}</ThemedText>
            </View>
          ))}
        </View>

        {/* Barre de recherche */}
        <View style={[styles.searchBar, { backgroundColor: cardBackground }]}>
          <MaterialIcons name="search" size={16} color={muted} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#FFFFFF" : "#11131A" }]}
            placeholder="Rechercher par numéro ou client"
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

        {/* Filtres paramétrés */}
        <View style={styles.filterRow}>
          {/* Opérateur */}
          <Pressable
            style={[styles.filterBtn, { backgroundColor: filterOperateur.length > 0 ? "#1F8B82" : cardBackground }]}
            onPress={() => setOpenPicker("operateur")}
          >
            <MaterialIcons name="person-outline" size={14} color={filterOperateur.length > 0 ? "#FFFFFF" : muted} />
            <ThemedText style={[styles.filterBtnText, { color: filterOperateur.length > 0 ? "#FFFFFF" : muted }]} numberOfLines={1}>
              {filterOperateur.length > 0 ? `Opérateur (${filterOperateur.length})` : "Opérateur"}
            </ThemedText>
            {filterOperateur.length > 0 ? (
              <Pressable hitSlop={6} onPress={() => setFilterOperateur([])}>
                <MaterialIcons name="close" size={12} color="#FFFFFF" />
              </Pressable>
            ) : (
              <MaterialIcons name="arrow-drop-down" size={16} color={muted} />
            )}
          </Pressable>

          {/* Agence */}
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

          {/* Mode de paiement */}
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
          style={[styles.datePeriodBtn, { backgroundColor: activeDateFilter ? "#2D6ACF" : cardBackground, borderColor: activeDateFilter ? "#2D6ACF" : borderColor }]}
          onPress={() => {
            setFilterDateFrom(appliedDateFrom);
            setFilterDateTo(appliedDateTo);
            setDatePickerOpen(true);
          }}
        >
          <MaterialIcons name="date-range" size={15} color={activeDateFilter ? "#FFFFFF" : muted} />
          <ThemedText style={[styles.datePeriodText, { color: activeDateFilter ? "#FFFFFF" : muted }]} numberOfLines={1}>
            {activeDateFilter
              ? `${appliedDateFrom || "…"} → ${appliedDateTo || "…"}`
              : "Filtrer par période"}
          </ThemedText>
          {activeDateFilter ? (
            <Pressable hitSlop={8} onPress={() => {
              const d30 = new Date(); d30.setDate(d30.getDate() - 30);
              const from = d30.toISOString().slice(0, 10);
              const to = new Date().toISOString().slice(0, 10);
              setFilterDateFrom(from); setFilterDateTo(from);
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
            setFilterOperateur([]); setFilterAgence([]); setFilterMode([]);
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
                    <TextInput
                      style={[styles.dateInputText, { color: isDark ? "#FFFFFF" : "#11131A" }]}
                      placeholder="AAAA-MM-JJ"
                      placeholderTextColor={muted}
                      value={filterDateFrom}
                      onChangeText={setFilterDateFrom}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                  </View>
                </View>
                <MaterialIcons name="arrow-forward" size={16} color={muted} style={{ marginTop: 28 }} />
                <View style={styles.dateField}>
                  <ThemedText style={[styles.dateFieldLabel, { color: muted }]}>Au</ThemedText>
                  <View style={[styles.dateInput, { backgroundColor: isDark ? "#242735" : "#F2F3F8", borderColor }]}>
                    <MaterialIcons name="calendar-today" size={14} color={muted} />
                    <TextInput
                      style={[styles.dateInputText, { color: isDark ? "#FFFFFF" : "#11131A" }]}
                      placeholder="AAAA-MM-JJ"
                      placeholderTextColor={muted}
                      value={filterDateTo}
                      onChangeText={setFilterDateTo}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.dateShortcuts}>
                {([
                  { label: "Aujourd'hui", fn: () => { const d = new Date().toISOString().slice(0,10); setFilterDateFrom(d); setFilterDateTo(d); } },
                  { label: "Ce mois", fn: () => { const n = new Date(); const y = n.getFullYear(); const m = String(n.getMonth()+1).padStart(2,"0"); setFilterDateFrom(`${y}-${m}-01`); setFilterDateTo(`${y}-${m}-${String(new Date(y,n.getMonth()+1,0).getDate()).padStart(2,"0")}`); } },
                  { label: "Cette année", fn: () => { const y = new Date().getFullYear(); setFilterDateFrom(`${y}-01-01`); setFilterDateTo(`${y}-12-31`); } },
                ] as {label:string; fn:()=>void}[]).map((s) => (
                  <Pressable key={s.label} style={[styles.shortcutBtn, { backgroundColor: isDark ? "#242735" : "#F2F3F8" }]} onPress={s.fn}>
                    <ThemedText style={[styles.shortcutText, { color: muted }]}>{s.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
              <View style={styles.dateActions}>
                <Pressable
                  style={styles.dateClearBtn}
                  onPress={() => {
                    const d30 = new Date(); d30.setDate(d30.getDate() - 30);
                    const from = d30.toISOString().slice(0, 10);
                    const to = new Date().toISOString().slice(0, 10);
                    setFilterDateFrom(from); setFilterDateTo(to);
                    setAppliedDateFrom(from); setAppliedDateTo(to);
                    setDatePickerOpen(false);
                  }}
                >
                  <MaterialIcons name="restart-alt" size={16} color="#E05252" />
                  <ThemedText style={styles.dateClearText}>Effacer</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.dateApplyBtn}
                  onPress={() => {
                    setAppliedDateFrom(filterDateFrom);
                    setAppliedDateTo(filterDateTo);
                    setDatePickerOpen(false);
                  }}
                >
                  <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.dateApplyText}>Appliquer</ThemedText>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modale de sélection */}
        <BottomPickerModal
          visible={openPicker === "operateur"}
          title="Choisir un opérateur"
          multiSelect
          options={operateurs.map((v): BPickerOption => ({ id: v, label: v }))}
          selectedIds={filterOperateur}
          onMultiConfirm={(opts) => { setFilterOperateur(opts.map((o) => o.label)); setOpenPicker(null); }}
          onClose={() => setOpenPicker(null)}
        />
        <BottomPickerModal
          visible={openPicker === "agence"}
          title="Choisir une agence"
          multiSelect
          options={agences.map((v): BPickerOption => ({ id: v, label: v }))}
          selectedIds={filterAgence}
          onMultiConfirm={(opts) => { setFilterAgence(opts.map((o) => o.label)); setOpenPicker(null); }}
          onClose={() => setOpenPicker(null)}
        />
        <BottomPickerModal
          visible={openPicker === "mode"}
          title="Choisir un mode"
          multiSelect
          options={modes.map((v): BPickerOption => ({ id: v, label: v }))}
          selectedIds={filterMode}
          onMultiConfirm={(opts) => { setFilterMode(opts.map((o) => o.label)); setOpenPicker(null); }}
          onClose={() => setOpenPicker(null)}
        />

        {loading ? (
          <ActivityIndicator size="small" color="#1F8B82" style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBackground }]}>
            <MaterialIcons name="payments" size={24} color={muted} />
            <ThemedText style={[styles.emptyText, { color: muted }]}>Aucun encaissement trouvé</ThemedText>
          </View>
        ) : filtered.map((item) => (
          <View key={String(item.id)} style={[styles.card, { backgroundColor: cardBackground }]}>
            {/* Ligne 1 : icône + numéro + boutons */}
            <View style={styles.cardRow}>
              <MaterialIcons name="payments" size={18} color="#1F8B82" />
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
            {/* Ligne 2 : infos + montant */}
            <View style={styles.cardRow}>
              <View style={styles.textBlock}>
                {!!item.clientNom && (
                  <ThemedText style={[styles.cardMeta, { color: muted }]}>{item.clientNom}</ThemedText>
                )}
                <ThemedText style={[styles.cardMeta, { color: muted }]}>
                  {formatDate(item.date)}{item.modeNom ? ` • ${item.modeNom}` : ""}
                </ThemedText>
              </View>
              <ThemedText style={styles.cardValue}>{formatNumber(item.montant)} XOF</ThemedText>
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
        ))}
      </ScrollView>

      {/* Modale consultation */}
      <Modal visible={consultItem !== null} transparent animationType="slide" onRequestClose={() => setConsultItem(null)}>
        <Pressable style={styles.consultOverlay} onPress={() => setConsultItem(null)}>
          <Pressable style={[styles.consultSheet, { backgroundColor: cardBackground }]}>
            <View style={styles.consultHeader}>
              <ThemedText style={styles.consultTitle}>Détail encaissement</ThemedText>
              <Pressable onPress={() => setConsultItem(null)}>
                <MaterialIcons name="close" size={20} color={muted} />
              </Pressable>
            </View>
            {consultItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {([
                  { label: "Numéro", value: consultItem.numero, icon: "tag" },
                  { label: "Client", value: consultItem.clientNom ?? "—", icon: "person" },
                  { label: "Date", value: formatDate(consultItem.date), icon: "calendar-today" },
                  { label: "Montant", value: `${formatNumber(consultItem.montant)} XOF`, icon: "payments" },
                  { label: "Solde", value: `${formatNumber(consultItem.solde)} XOF`, icon: "account-balance-wallet" },
                  { label: "Montant utilisé", value: `${formatNumber(consultItem.montantUtilise)} XOF`, icon: "money-off" },
                  { label: "Mode", value: consultItem.modeNom ?? "—", icon: "payment" },
                  { label: "Agence", value: consultItem.agenceNom ?? "—", icon: "business" },
                  { label: "Banque", value: consultItem.banqueNom ?? "—", icon: "account-balance" },
                  { label: "Opérateur", value: consultItem.operateurNom ?? "—", icon: "person-outline" },
                  { label: "Référence", value: consultItem.ref ?? "—", icon: "bookmark" },
                  { label: "Observation", value: consultItem.obs ?? "—", icon: "notes" },
                ] as { label: string; value: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }[]).map((row) => (
                  <View key={row.label} style={[styles.consultRow, { borderBottomColor: borderColor }]}>
                    <View style={styles.consultRowLeft}>
                      <MaterialIcons name={row.icon} size={14} color={muted} />
                      <ThemedText style={[styles.consultLabel, { color: muted }]}>{row.label}</ThemedText>
                    </View>
                    <ThemedText style={styles.consultValue}>{row.value}</ThemedText>
                  </View>
                ))}
                {(consultItem.details?.length ?? 0) > 0 && (
                  <>
                    <ThemedText style={[styles.consultSectionTitle, { color: muted }]}>Détails documents</ThemedText>
                    {consultItem.details!.map((d) => (
                      <View key={d.id} style={[styles.consultDetailCard, { backgroundColor: softBlock }]}>
                        <ThemedText style={styles.consultDetailCode}>{d.codeDoc}</ThemedText>
                        <ThemedText style={[styles.consultDetailMeta, { color: muted }]}>{d.typeDoc} • {formatDate(d.dateDoc)}</ThemedText>
                        <ThemedText style={styles.consultDetailAmount}>{formatNumber(d.montantRegDoc)} XOF</ThemedText>
                      </View>
                    ))}
                  </>
                )}
                <View style={{ height: 24 }} />
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modale formulaire création/modification */}
      <EncaissementPrimeFormModal
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={formMode === "edit" ? selectedItem : undefined}
        title={formMode === "create" ? "Nouvel encaissement" : `Modifier ${selectedItem?.numero ?? ""}`}
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
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  metricValue: { fontSize: 16, fontWeight: "800", color: "#1F8B82" },
  metricLabel: { fontSize: 11, textAlign: "center" },
  loader: { marginTop: 16 },
  emptyCard: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: { fontSize: 13, fontWeight: "600" },
  card: { borderRadius: 14, padding: 14 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  textBlock: { flex: 1 },
  cardLabel: { fontSize: 14, fontWeight: "700" },
  cardMeta: { fontSize: 12, marginTop: 1 },
  cardValue: { fontSize: 14, fontWeight: "800", color: "#1F8B82" },
  searchBar: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 6 },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  filterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D8DDEB",
    minWidth: 0,
  },
  filterBtnText: { fontSize: 12, fontWeight: "600", flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 15, fontWeight: "700" },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalOptionText: { fontSize: 14 },
  modalConfirm: {
    marginTop: 12,
    backgroundColor: "#1F8B82",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalConfirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  clearFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  clearFiltersText: { fontSize: 12, color: "#E05252", fontWeight: "600" },
  cardTopRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  cardActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cardFooterText: { fontSize: 10 },
  datePeriodBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  datePeriodText: { flex: 1, fontSize: 12, fontWeight: "600" },
  dateRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 14 },
  dateField: { flex: 1 },
  dateFieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  dateInputText: { flex: 1, fontSize: 13 },
  dateShortcuts: { flexDirection: "row", gap: 8, marginBottom: 16 },
  shortcutBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  shortcutText: { fontSize: 11, fontWeight: "600" },
  dateActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  dateClearBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#E05252",
    backgroundColor: "transparent",
  },
  dateClearText: { color: "#E05252", fontSize: 13, fontWeight: "700" },
  dateApplyBtn: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
    backgroundColor: "#1F8B82",
    shadowColor: "#1F8B82",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dateApplyText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  countLabel: { fontSize: 12, opacity: 0.6 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1F8B82",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  createBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  consultOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  consultSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 0,
    maxHeight: "85%",
  },
  consultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  consultTitle: { fontSize: 16, fontWeight: "700" },
  consultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  consultRowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  consultLabel: { fontSize: 12 },
  consultValue: { fontSize: 13, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
  consultSectionTitle: { fontSize: 12, fontWeight: "700", marginTop: 16, marginBottom: 8, textTransform: "uppercase" },
  consultDetailCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  consultDetailCode: { fontSize: 13, fontWeight: "700" },
  consultDetailMeta: { fontSize: 11, marginTop: 2 },
  consultDetailAmount: { fontSize: 13, fontWeight: "700", color: "#1F8B82", marginTop: 4 },
});
