import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { getfetchOperations } from "@/services/api-service";
import { formatDate, formatNumber } from "@/tools/tools";
import { operation } from "@/types/operations.type";

export default function OperationsDiversesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();
  const { showMessage } = usePopup();
  const [operations, setOperations] = useState<operation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!userToken) {
      setOperations([]);
      return;
    }

    setLoading(true);
    getfetchOperations(userToken)
      .then((response) => setOperations(response?.data ?? []))
      .catch(() => {
        showMessage("error", "Erreur", "Impossible de charger les opérations.");
        setOperations([]);
      })
      .finally(() => setLoading(false));
  }, [showMessage, userToken]);

  const filteredOperations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return operations;
    }

    return operations.filter((op) => {
      const numero = op.numero?.toLowerCase() ?? "";
      const description = op.desc?.toLowerCase() ?? "";
      const beneficiaire = op.beneOrDep?.toLowerCase() ?? "";
      return numero.includes(query) || description.includes(query) || beneficiaire.includes(query);
    });
  }, [operations, search]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const muted = isDark ? "#A8AEC7" : "#61637A";
  const softBlock = isDark ? "#242735" : "#F2F3F8";

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Opérations diverses" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchWrap, { backgroundColor: softBlock }]}>
          <MaterialIcons name="search" size={16} color={muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher par numéro, libellé ou bénéficiaire"
            placeholderTextColor={muted}
            style={[styles.searchInput, { color: muted }]}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#1F8B82" style={styles.loader} />
        ) : filteredOperations.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBackground }]}>
            <MaterialIcons name="receipt-long" size={24} color={muted} />
            <ThemedText style={[styles.emptyText, { color: muted }]}>Aucune opération trouvée</ThemedText>
          </View>
        ) : filteredOperations.map((op) => (
          <View key={op.id} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.row}>
              <View style={styles.leftRow}>
                <MaterialIcons name="receipt-long" size={18} color="#1F8B82" />
                <View style={styles.textBlock}>
                  <ThemedText style={styles.code}>{op.numero || `OP-${op.id}`}</ThemedText>
                  <ThemedText style={[styles.lib, { color: muted }]}>{op.desc || "Sans libellé"}</ThemedText>
                  <ThemedText style={[styles.meta, { color: muted }]}>
                    {formatDate(op.date)} • {op.modeNom || "Mode non défini"}
                  </ThemedText>s
                  {!!op.beneOrDep && (
                    <ThemedText style={[styles.meta, { color: muted }]}>{op.beneOrDep}</ThemedText>
                  )}
                </View>
              </View>
              <ThemedText style={styles.amount}>{formatNumber(op.montant)} XOF</ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 12 },
  headerWrap: { marginTop: -16, marginHorizontal: -12, marginBottom: 14 },
  content: { gap: 10, paddingBottom: 24 },
  searchWrap: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
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
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  leftRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  textBlock: { flexShrink: 1, maxWidth: "90%" },
  code: { fontSize: 14, fontWeight: "700" },
  lib: { fontSize: 12 },
  meta: { fontSize: 11, marginTop: 1 },
  amount: { fontSize: 14, fontWeight: "800", color: "#1F8B82" },
});
