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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import BottomPickerModal, { PickerOption as BPickerOption } from "@/components/ui/bottom-picker-modal";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { annulerPolice, getfetchContrats } from "@/services/api-service";
import { formatDate, formatNumber } from "@/tools/tools";
import { contrat } from "@/types/contrat.type";

export default function PolicesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();
  const { showMessage, showConfirm } = usePopup();

  const [polices, setPolices] = useState<contrat[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<"" | "Actif" | "Annulé">("");
  const [filterCompagnie, setFilterCompagnie] = useState<string[]>([]);
  const [filterAgence, setFilterAgence] = useState<string[]>([]);
  const [openPicker, setOpenPicker] = useState<"compagnie" | "agence" | null>(null);
  const [attestationItem, setAttestationItem] = useState<contrat | null>(null);
  const [printItem, setPrintItem] = useState<contrat | null>(null);

  useEffect(() => {
    if (!userToken) { setPolices([]); return; }
    setLoading(true);
    getfetchContrats(userToken)
      .then((res) => setPolices(res?.data ?? []))
      .catch(() => {
        showMessage("error", "Erreur", "Impossible de charger les polices.");
        setPolices([]);
      })
      .finally(() => setLoading(false));
  }, [userToken, showMessage]);

  // Métriques
  const metrics = useMemo(() => {
    const actives = polices.filter((p) => !isAnnule(p)).length;
    const annulees = polices.filter(isAnnule).length;
    const total = polices.reduce((s, p) => s + (Number(p.netAPayer) || 0), 0);
    return [
      { label: "Actives", value: String(actives), icon: "verified" as const, color: "#16A34A" },
      { label: "Annulées", value: String(annulees), icon: "cancel" as const, color: "#E05252" },
      { label: "Net total", value: formatNumber(total), icon: "payments" as const, color: "#1F8B82" },
    ];
  }, [polices]);

  // Options filtres
  const compagnies = useMemo(() => {
    return Array.from(new Set(polices.map((p) => p.compagnie).filter(Boolean))).sort();
  }, [polices]);

  const agences = useMemo(() => {
    return Array.from(new Set(polices.map((p) => p.agence).filter(Boolean))).sort();
  }, [polices]);

  // Filtrage
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return polices.filter((p) => {
      if (q &&
        !p.numeroPolice?.toLowerCase().includes(q) &&
        !p.assureNom?.toLowerCase().includes(q) &&
        !p.immatriculation?.toLowerCase().includes(q)
      ) return false;
      if (filterStatut === "Actif" && isAnnule(p)) return false;
      if (filterStatut === "Annulé" && !isAnnule(p)) return false;
      if (filterCompagnie.length > 0 && !filterCompagnie.includes(p.compagnie)) return false;
      if (filterAgence.length > 0 && !filterAgence.includes(p.agence)) return false;
      return true;
    });
  }, [polices, search, filterStatut, filterCompagnie, filterAgence]);

  const activeFilters = (filterStatut ? 1 : 0) + filterCompagnie.length + filterAgence.length;

  // Couleurs
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const muted = isDark ? "#A8AEC7" : "#61637A";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";

  // Handlers
  const handleAnnuler = (item: contrat) => {
    if (isAnnule(item)) {
      showMessage("info", "Police annulée", "Cette police est déjà annulée.");
      return;
    }
    showConfirm(
      "error",
      "Annuler la police",
      `Annuler la police ${item.numeroPolice} ?\nCette action est irréversible.`,
      async () => {
        try {
          const updated = await annulerPolice(userToken ?? "", item.id);
          setPolices((prev) => prev.map((p) => (p.id === item.id ? { ...p, ...updated } : p)));
          showMessage("success", "Police annulée", `La police ${item.numeroPolice} a été annulée.`);
        } catch {
          showMessage("error", "Erreur", "Impossible d'annuler cette police.");
        }
      },
      { confirmLabel: "Annuler la police", cancelLabel: "Garder" },
    );
  };

  const pickerConfig = useMemo(() => {
    if (openPicker === "compagnie") return { list: compagnies, current: filterCompagnie, setter: setFilterCompagnie, title: "Filtrer par compagnie" };
    if (openPicker === "agence") return { list: agences, current: filterAgence, setter: setFilterAgence, title: "Filtrer par agence" };
    return { list: [] as string[], current: [] as string[], setter: (_v: string[]) => {}, title: "" };
  }, [openPicker, compagnies, agences, filterCompagnie, filterAgence]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Polices" />
      </View>

      <View style={styles.topBar}>
        <ThemedText style={styles.countLabel}>
          {filtered.length} police{filtered.length > 1 ? "s" : ""}
        </ThemedText>
        {activeFilters > 0 && (
          <Pressable style={styles.clearAllBtn} onPress={() => { setFilterStatut(""); setFilterCompagnie([]); setFilterAgence([]); }}>
            <MaterialIcons name="filter-alt-off" size={14} color="#E05252" />
            <ThemedText style={styles.clearAllText}>Réinitialiser ({activeFilters})</ThemedText>
          </Pressable>
        )}
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

        {/* Recherche */}
        <View style={[styles.searchBar, { backgroundColor: cardBackground }]}>
          <MaterialIcons name="search" size={16} color={muted} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#FFF" : "#11131A" }]}
            placeholder="N° police, assuré, immatriculation…"
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

        {/* Filtres statut */}
        <View style={styles.statusRow}>
          {(["", "Actif", "Annulé"] as const).map((val) => {
            const active = filterStatut === val;
            const color = val === "Annulé" ? "#E05252" : val === "Actif" ? "#16A34A" : "#1F8B82";
            const label = val === "" ? "Tous" : val;
            return (
              <Pressable
                key={label}
                style={[styles.statusChip, { backgroundColor: active ? color : cardBackground, borderColor: active ? color : borderColor }]}
                onPress={() => setFilterStatut(active ? "" : val)}
              >
                <ThemedText style={[styles.statusChipText, { color: active ? "#FFF" : muted }]}>{label}</ThemedText>
              </Pressable>
            );
          })}

          <Pressable
            style={[styles.filterBtn, { backgroundColor: filterCompagnie.length > 0 ? "#6B3CFF" : cardBackground, borderColor: filterCompagnie.length > 0 ? "#6B3CFF" : borderColor }]}
            onPress={() => setOpenPicker("compagnie")}
          >
            <MaterialIcons name="business" size={13} color={filterCompagnie.length > 0 ? "#FFF" : muted} />
            <ThemedText style={[styles.filterBtnText, { color: filterCompagnie.length > 0 ? "#FFF" : muted }]} numberOfLines={1}>
              {filterCompagnie.length > 0 ? `Cie (${filterCompagnie.length})` : "Compagnie"}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.filterBtn, { backgroundColor: filterAgence.length > 0 ? "#E8872A" : cardBackground, borderColor: filterAgence.length > 0 ? "#E8872A" : borderColor }]}
            onPress={() => setOpenPicker("agence")}
          >
            <MaterialIcons name="store" size={13} color={filterAgence.length > 0 ? "#FFF" : muted} />
            <ThemedText style={[styles.filterBtnText, { color: filterAgence.length > 0 ? "#FFF" : muted }]} numberOfLines={1}>
              {filterAgence.length > 0 ? `Agence (${filterAgence.length})` : "Agence"}
            </ThemedText>
          </Pressable>
        </View>

        {/* Picker multi-choix */}
        <BottomPickerModal
          visible={openPicker === "compagnie"}
          title="Filtrer par compagnie"
          multiSelect
          options={compagnies.map((v): BPickerOption => ({ id: v, label: v }))}
          selectedIds={filterCompagnie}
          onMultiConfirm={(opts) => { setFilterCompagnie(opts.map((o) => o.label)); setOpenPicker(null); }}
          onClose={() => setOpenPicker(null)}
        />
        <BottomPickerModal
          visible={openPicker === "agence"}
          title="Filtrer par agence"
          multiSelect
          options={agences.map((v): BPickerOption => ({ id: v, label: v }))}
          selectedIds={filterAgence}
          onMultiConfirm={(opts) => { setFilterAgence(opts.map((o) => o.label)); setOpenPicker(null); }}
          onClose={() => setOpenPicker(null)}
        />

        {/* Liste */}
        {loading ? (
          <ActivityIndicator size="small" color="#1F8B82" style={{ marginTop: 20 }} />
        ) : filtered.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBackground }]}>
            <MaterialIcons name="policy" size={28} color={muted} />
            <ThemedText style={[styles.emptyText, { color: muted }]}>Aucune police trouvée</ThemedText>
          </View>
        ) : (
          filtered.map((item) => {
            const annule = isAnnule(item);
            const statusColor = annule ? "#E05252" : "#16A34A";
            const isExpired = item.dateEcheance ? new Date(item.dateEcheance) < new Date() : false;
            return (
              <View key={item.id} style={[styles.card, { backgroundColor: cardBackground }]}>
                {/* En-tête carte */}
                <View style={styles.cardHead}>
                  <View style={styles.cardHeadLeft}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <ThemedText style={styles.policeNum}>{item.numeroPolice || item.numeroContrat}</ThemedText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                      {annule ? "Annulée" : isExpired ? "Échue" : "Active"}
                    </ThemedText>
                  </View>
                </View>

                {/* Assuré */}
                <View style={styles.cardRow}>
                  <MaterialIcons name="person" size={14} color={muted} />
                  <ThemedText style={[styles.cardFieldLabel, { color: muted }]}>Assuré</ThemedText>
                  <ThemedText style={styles.cardFieldValue} numberOfLines={1}>
                    {item.assureNom || "—"}
                  </ThemedText>
                </View>

                {/* Véhicule + couverture */}
                <View style={styles.cardRow}>
                  <MaterialIcons name="directions-car" size={14} color={muted} />
                  <ThemedText style={[styles.cardFieldLabel, { color: muted }]}>Véhicule</ThemedText>
                  <ThemedText style={styles.cardFieldValue}>
                    {item.immatriculation || "—"} — {item.couverture || "—"}
                  </ThemedText>
                </View>

                {/* Compagnie */}
                <View style={styles.cardRow}>
                  <MaterialIcons name="business" size={14} color={muted} />
                  <ThemedText style={[styles.cardFieldLabel, { color: muted }]}>Compagnie</ThemedText>
                  <ThemedText style={styles.cardFieldValue}>{item.compagnie || "—"} / {item.agence || "—"}</ThemedText>
                </View>

                {/* Période */}
                <View style={styles.cardRow}>
                  <MaterialIcons name="date-range" size={14} color={muted} />
                  <ThemedText style={[styles.cardFieldLabel, { color: muted }]}>Validité</ThemedText>
                  <ThemedText style={[styles.cardFieldValue, isExpired && !annule && { color: "#E8872A" }]}>
                    {formatDate(item.dateEffet)} → {formatDate(item.dateEcheance)}
                  </ThemedText>
                </View>

                {/* Net à payer */}
                <View style={[styles.cardAmountRow, { borderTopColor: borderColor }]}>
                  <ThemedText style={[styles.cardAmountLabel, { color: muted }]}>Net à payer</ThemedText>
                  <ThemedText style={styles.cardAmount}>{formatNumber(item.netAPayer)} XOF</ThemedText>
                </View>

                {/* Actions */}
                <View style={[styles.cardActions, { borderTopColor: borderColor }]}>
                  <Pressable
                    style={[styles.actionBtn, annule && styles.actionBtnDisabled, { backgroundColor: annule ? softBlock : "#FFF0F0" }]}
                    onPress={() => handleAnnuler(item)}
                    disabled={annule}
                  >
                    <MaterialIcons name="cancel" size={15} color={annule ? muted : "#E05252"} />
                    <ThemedText style={[styles.actionBtnText, { color: annule ? muted : "#E05252" }]}>
                      {annule ? "Annulée" : "Annuler"}
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: "#EEF4FF" }]}
                    onPress={() => setAttestationItem(item)}
                  >
                    <MaterialIcons name="description" size={15} color="#2D6ACF" />
                    <ThemedText style={[styles.actionBtnText, { color: "#2D6ACF" }]}>Attestation</ThemedText>
                  </Pressable>

                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: "#F0FDF4" }]}
                    onPress={() => setPrintItem(item)}
                  >
                    <MaterialIcons name="print" size={15} color="#16A34A" />
                    <ThemedText style={[styles.actionBtnText, { color: "#16A34A" }]}>Imprimer</ThemedText>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── Modale Attestation ──────────────────────────────────────── */}
      <Modal visible={attestationItem !== null} transparent animationType="slide" onRequestClose={() => setAttestationItem(null)}>
        <Pressable style={styles.overlay} onPress={() => setAttestationItem(null)}>
          <Pressable style={[styles.attestationSheet, { backgroundColor: cardBackground }]}>
            {/* Fermer */}
            <Pressable style={styles.attestationClose} onPress={() => setAttestationItem(null)}>
              <MaterialIcons name="close" size={20} color={muted} />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false}>
              {attestationItem && (
                <>
                  {/* En-tête attestation */}
                  <View style={styles.attHeader}>
                    <View style={[styles.attLogo, { backgroundColor: isDark ? "#242735" : "#F2F3F8" }]}>
                      <MaterialIcons name="policy" size={32} color="#1F8B82" />
                    </View>
                    <ThemedText style={styles.attTitle}>ATTESTATION D'ASSURANCE</ThemedText>
                    <ThemedText style={[styles.attSubtitle, { color: muted }]}>République de Côte d'Ivoire</ThemedText>
                  </View>

                  <View style={[styles.attDivider, { backgroundColor: borderColor }]} />

                  {/* Numéros */}
                  <View style={[styles.attNumRow, { backgroundColor: isDark ? "#1F8B8215" : "#F0FDF8" }]}>
                    <View style={styles.attNumItem}>
                      <ThemedText style={[styles.attNumLabel, { color: muted }]}>N° Police</ThemedText>
                      <ThemedText style={styles.attNumValue}>{attestationItem.numeroPolice || "—"}</ThemedText>
                    </View>
                    <View style={[styles.attNumSep, { backgroundColor: borderColor }]} />
                    <View style={styles.attNumItem}>
                      <ThemedText style={[styles.attNumLabel, { color: muted }]}>N° Attestation</ThemedText>
                      <ThemedText style={styles.attNumValue}>{attestationItem.numeroAttestation || "—"}</ThemedText>
                    </View>
                  </View>

                  {/* Sections */}
                  <AttSection title="ASSURÉ" icon="person" muted={muted} borderColor={borderColor} rows={[
                    { label: "Nom / Raison sociale", value: attestationItem.assureNom || "—" },
                    { label: "Téléphone", value: attestationItem.assureTel || "—" },
                    { label: "Profession", value: attestationItem.assureProfession || "—" },
                    { label: "Adresse / B.P.", value: attestationItem.assureBp || "—" },
                  ]} />

                  <AttSection title="VÉHICULE ASSURÉ" icon="directions-car" muted={muted} borderColor={borderColor} rows={[
                    { label: "Immatriculation", value: attestationItem.immatriculation || "—" },
                    { label: "Couverture", value: attestationItem.couverture || "—" },
                  ]} />

                  <AttSection title="CONTRAT" icon="article" muted={muted} borderColor={borderColor} rows={[
                    { label: "Compagnie", value: attestationItem.compagnie || "—" },
                    { label: "Agence", value: attestationItem.agence || "—" },
                    { label: "Catégorie", value: attestationItem.categorie || "—" },
                    { label: "Durée", value: attestationItem.duree || `${attestationItem.nombreJours} j` || "—" },
                  ]} />

                  <AttSection title="PÉRIODE DE VALIDITÉ" icon="date-range" muted={muted} borderColor={borderColor} rows={[
                    { label: "Date d'effet", value: formatDate(attestationItem.dateEffet) || "—" },
                    { label: "Date d'échéance", value: formatDate(attestationItem.dateEcheance) || "—" },
                  ]} />

                  <AttSection title="PRIME" icon="payments" muted={muted} borderColor={borderColor} rows={[
                    { label: "Prime nette", value: `${formatNumber(attestationItem.primeNette)} XOF` },
                    { label: "Accessoires", value: `${formatNumber(attestationItem.accessoires)} XOF` },
                    { label: "Taxe", value: `${formatNumber(attestationItem.taxe)} XOF` },
                    { label: "Taxe FGA", value: `${formatNumber(attestationItem.taxeFga)} XOF` },
                    { label: "CEDEAO", value: `${formatNumber(attestationItem.cedeao)} XOF` },
                    { label: "Net à payer", value: `${formatNumber(attestationItem.netAPayer)} XOF`, bold: true },
                  ]} />

                  {/* Statut */}
                  <View style={[styles.attStatusBox, { backgroundColor: isAnnule(attestationItem) ? "#FFF0F0" : "#F0FDF4", borderColor: isAnnule(attestationItem) ? "#E05252" : "#16A34A" }]}>
                    <MaterialIcons name={isAnnule(attestationItem) ? "cancel" : "verified"} size={18} color={isAnnule(attestationItem) ? "#E05252" : "#16A34A"} />
                    <ThemedText style={[styles.attStatusText, { color: isAnnule(attestationItem) ? "#E05252" : "#16A34A" }]}>
                      {isAnnule(attestationItem) ? "POLICE ANNULÉE" : "POLICE EN VIGUEUR"}
                    </ThemedText>
                  </View>

                  {/* Bouton imprimer depuis attestation */}
                  <Pressable style={styles.attPrintBtn} onPress={() => { setAttestationItem(null); setPrintItem(attestationItem); }}>
                    <MaterialIcons name="print" size={16} color="#FFF" />
                    <ThemedText style={styles.attPrintBtnText}>Imprimer l'attestation</ThemedText>
                  </Pressable>

                  <View style={{ height: 32 }} />
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Modale Impression ──────────────────────────────────────── */}
      <Modal visible={printItem !== null} transparent animationType="fade" onRequestClose={() => setPrintItem(null)}>
        <Pressable style={styles.overlay} onPress={() => setPrintItem(null)}>
          <Pressable style={[styles.printSheet, { backgroundColor: cardBackground }]}>
            <View style={[styles.printIconWrap, { backgroundColor: "#F0FDF4" }]}>
              <MaterialIcons name="print" size={36} color="#16A34A" />
            </View>
            <ThemedText style={styles.printTitle}>Impression</ThemedText>
            {printItem && (
              <ThemedText style={[styles.printSub, { color: muted }]}>
                Police {printItem.numeroPolice}{"\n"}Assuré : {printItem.assureNom || "—"}
              </ThemedText>
            )}
            <View style={[styles.printDivider, { backgroundColor: borderColor }]} />
            <View style={styles.printOptions}>
              <Pressable
                style={[styles.printOptionBtn, { backgroundColor: softBlock }]}
                onPress={() => {
                  setPrintItem(null);
                  showMessage("info", "Impression police", "L'impression de la police sera disponible prochainement.");
                }}
              >
                <MaterialIcons name="article" size={22} color="#1F8B82" />
                <ThemedText style={styles.printOptionLabel}>Police</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.printOptionBtn, { backgroundColor: softBlock }]}
                onPress={() => {
                  const it = printItem;
                  setPrintItem(null);
                  setAttestationItem(null);
                  showMessage("info", "Impression attestation", `Impression de l'attestation ${it?.numeroAttestation || ""} disponible prochainement.`);
                }}
              >
                <MaterialIcons name="description" size={22} color="#2D6ACF" />
                <ThemedText style={styles.printOptionLabel}>Attestation</ThemedText>
              </Pressable>
            </View>
            <Pressable style={styles.printCancelBtn} onPress={() => setPrintItem(null)}>
              <ThemedText style={[styles.printCancelText, { color: muted }]}>Fermer</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

// ── Helper: is police annulée ────────────────────────────────────────────────
function isAnnule(p: contrat) {
  return p.categorie?.toUpperCase().includes("ANNUL") ?? false;
}

// ── Sub-component: attestation section ───────────────────────────────────────
function AttSection({
  title,
  icon,
  muted,
  borderColor,
  rows,
}: {
  title: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  muted: string;
  borderColor: string;
  rows: { label: string; value: string; bold?: boolean }[];
}) {
  return (
    <View style={attStyles.section}>
      <View style={attStyles.sectionHead}>
        <MaterialIcons name={icon} size={14} color={muted} />
        <ThemedText style={[attStyles.sectionTitle, { color: muted }]}>{title}</ThemedText>
      </View>
      {rows.map((row) => (
        <View key={row.label} style={[attStyles.row, { borderBottomColor: borderColor }]}>
          <ThemedText style={[attStyles.label, { color: muted }]}>{row.label}</ThemedText>
          <ThemedText style={[attStyles.value, row.bold && attStyles.valueBold]}>{row.value}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const attStyles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 12 },
  value: { fontSize: 12, fontWeight: "600", maxWidth: "55%", textAlign: "right" },
  valueBold: { fontWeight: "800", fontSize: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 12 },
  headerWrap: { marginTop: -16, marginHorizontal: -12, marginBottom: 14 },
  content: { gap: 12, paddingBottom: 24 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  countLabel: { fontSize: 12, opacity: 0.6 },
  clearAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearAllText: { fontSize: 12, color: "#E05252", fontWeight: "600" },
  metricsRow: { flexDirection: "row", gap: 10 },
  metricCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  metricValue: { fontSize: 15, fontWeight: "800" },
  metricLabel: { fontSize: 10, textAlign: "center" },
  searchBar: { height: 42, borderRadius: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 6 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusChip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  statusChipText: { fontSize: 12, fontWeight: "600" },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  filterBtnText: { fontSize: 12, fontWeight: "600" },
  emptyCard: { borderRadius: 14, padding: 24, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 13, fontWeight: "600" },
  // Card
  card: { borderRadius: 16, padding: 16, gap: 8 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  cardHeadLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 999 },
  policeNum: { fontSize: 15, fontWeight: "800" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardFieldLabel: { fontSize: 11, width: 72 },
  cardFieldValue: { fontSize: 13, fontWeight: "600", flex: 1 },
  cardAmountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  cardAmountLabel: { fontSize: 12 },
  cardAmount: { fontSize: 16, fontWeight: "800", color: "#1F8B82" },
  cardActions: { flexDirection: "row", gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 10, paddingVertical: 9 },
  actionBtnDisabled: { opacity: 0.55 },
  actionBtnText: { fontSize: 12, fontWeight: "700" },
  // Modals
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 32, maxHeight: "60%" },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sheetTitle: { fontSize: 15, fontWeight: "700" },
  pickerOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  pickerOptionText: { fontSize: 14 },
  sheetConfirm: { marginTop: 12, backgroundColor: "#1F8B82", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  sheetConfirmText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  // Attestation
  attestationSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 0, maxHeight: "90%" },
  attestationClose: { alignSelf: "flex-end", marginBottom: 8 },
  attHeader: { alignItems: "center", gap: 8, marginBottom: 16 },
  attLogo: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  attTitle: { fontSize: 17, fontWeight: "800", textAlign: "center", letterSpacing: 0.5 },
  attSubtitle: { fontSize: 12, textAlign: "center" },
  attDivider: { height: 1, marginBottom: 16 },
  attNumRow: { flexDirection: "row", borderRadius: 12, padding: 14, marginBottom: 20 },
  attNumItem: { flex: 1, alignItems: "center", gap: 4 },
  attNumSep: { width: 1 },
  attNumLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  attNumValue: { fontSize: 14, fontWeight: "800" },
  attStatusBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1.5, paddingVertical: 12, marginTop: 8, marginBottom: 16 },
  attStatusText: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  attPrintBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1F8B82", borderRadius: 12, paddingVertical: 14 },
  attPrintBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  // Print
  printSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 36, alignItems: "center" },
  printIconWrap: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  printTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  printSub: { fontSize: 13, textAlign: "center", marginBottom: 16, lineHeight: 20 },
  printDivider: { width: "100%", height: 1, marginBottom: 20 },
  printOptions: { flexDirection: "row", gap: 16, width: "100%", marginBottom: 20 },
  printOptionBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 18 },
  printOptionLabel: { fontSize: 13, fontWeight: "700" },
  printCancelBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  printCancelText: { fontSize: 14, fontWeight: "600" },
});
