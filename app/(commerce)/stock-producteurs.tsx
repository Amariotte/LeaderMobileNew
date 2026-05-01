import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getfetchStockProducteurs } from "@/services/api-service";
import { formatNumber } from "@/tools/tools";
import { listStockProducteur } from "@/types/stock.type";

export default function StockProducteursScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const mutedText = isDark ? "#A8AEC7" : "#75809A";
  const heroTint = isDark ? "#163E3A" : "#E5F7F5";
  const availableBg = isDark ? "#143B39" : "#DBF4F1";
  const receivedBg = isDark ? "#1C334A" : "#E8F2FF";
  const receivedColor = isDark ? "#98C6FF" : "#1D4ED8";
  const retiredBg = isDark ? "#3A2A1A" : "#FFF1E7";
  const retiredColor = isDark ? "#F8CFA4" : "#C2410C";
  const producedBg = isDark ? "#173127" : "#E8F6ED";
  const producedColor = isDark ? "#A2E3BE" : "#166534";
  const [items, setItems] = useState<listStockProducteur>({ data: [] });
  const [loading, setLoading] = useState(false);
  const { userToken } = useAuthContext();
  const [compagnieFilter, setCompagnieFilter] = useState("");
  const [attestationFilter, setAttestationFilter] = useState("");
   

  useEffect(() => {
    if (!userToken) return;
    setLoading(true);
    getfetchStockProducteurs(userToken)
      .then((data) => setItems(data))
      .catch(() => setItems({ data: [] }))
      .finally(() => setLoading(false));
  }, [userToken]);

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
        <AppHeaderDrawer title="Stocks producteurs" />
      </View>
      <View style={styles.content}>
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
          <View key={`${item.compagnieId ?? "c"}-${item.partenaireId ?? "p"}-${item.producteurId ?? "pr"}-${index}`} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.rowTop}>
              <View style={styles.leftRow}>
                <View style={[styles.iconWrap, { backgroundColor: heroTint }]}> 
                  <MaterialIcons name="verified" size={18} color="#1F8B82" />
                </View>
                <View style={styles.titleBlock}>
                  <ThemedText style={styles.lib}>{item.compagnieNom || "Compagnie inconnue"}</ThemedText>
                  <ThemedText style={[styles.subText, { color: mutedText }]}>Partenaire : {item.partenaireNom || "Non défini"}</ThemedText>
                  <ThemedText style={[styles.subText, { color: mutedText }]}>Producteur : {item.producteurNom || "Non défini"}</ThemedText>
                  <ThemedText style={[styles.subText, { color: mutedText }]}>Attestation : {item.typeNom || "Non défini"}</ThemedText>
                </View>
              </View>
              <View style={[styles.qtyBadge, { backgroundColor: availableBg }]}> 
                <ThemedText style={styles.qty}>{formatNumber(item.qteDisponibles)}</ThemedText>
                <ThemedText style={[styles.qtyLabel, { color: mutedText }]}>disponibles</ThemedText>
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
                <ThemedText style={[styles.metricLabel, { color: mutedText }]}>Produites</ThemedText>
                <ThemedText style={[styles.metricValue, { color: producedColor }]}>{formatNumber(item.qteProduites)}</ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 12 },
  headerWrap: { marginTop: -16, marginHorizontal: -12, marginBottom: 14 },
  content: { gap: 10, paddingBottom: 24 },
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
