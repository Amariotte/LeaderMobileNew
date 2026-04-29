import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePaginatedCachedResource } from "@/hooks/use-paginated-cached-resource";
import { getfetchVentes } from "@/services/api-service";
import { VENTES_LIST_CACHE_KEY } from "@/services/cache-service";
import { formatDate, formatNumber } from "@/tools/tools";
import { listVentes } from "@/types/ventes.type";
import { useMemo } from "react";

export default function SalesListScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const accent = isDark ? "#6B3CFF" : "#6B3CFF";

  const pageBackground = isDark ? "#11131A" : "#F7F7FB";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const mutedText = isDark ? "#9EA3BA" : "#868A9F";
  const softBlock = isDark ? "#242735" : "#F2F3F8";

  const initialVentes = useMemo<listVentes>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const { userToken } = useAuthContext();
  const { data: ventes } = usePaginatedCachedResource<
    listVentes["data"][number],
    listVentes
  >({
    cacheKey: VENTES_LIST_CACHE_KEY,
    initialData: initialVentes,
    enabled: Boolean(userToken),
    fetchPage: async (page, size) =>
      getfetchVentes(userToken ?? "", { page, size }),
    getItemKey: (item) => item.id,
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Liste des ventes" />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryLabelRow}>
          <ThemedText style={styles.summaryText}>Total ventes</ThemedText>
          <View style={styles.countBadge}>
            <ThemedText style={styles.countBadgeText}>
              {ventes?.data?.length.toString().padStart(2, "0")}
            </ThemedText>
          </View>
        </View>

        <View style={styles.summaryActions}>
          <Pressable
            onPress={() => router.push("/ventes/saisie")}
            style={styles.primaryAction}
          >
            <MaterialIcons name="add" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={[
              styles.secondaryAction,
              { backgroundColor: cardBackground },
            ]}
          >
            <MaterialIcons
              name="tune"
              size={18}
              color={isDark ? "#FFFFFF" : "#4A4F69"}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {ventes?.data?.map((sale) => (
          <View
            key={sale.id}
            style={[
              styles.card,
              {
                backgroundColor: cardBackground,
                shadowColor: "#10131F",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.22 : 0.08,
                shadowRadius: 18,
                elevation: 3,
              },
            ]}
          >
            <View style={styles.cardTop}>
              <View style={styles.companyRow}>
                <View style={[styles.logoBox, { borderColor: accent + "33" }]}>
                  <View style={[styles.logoDot, { backgroundColor: accent }]} />
                  <ThemedText style={styles.logoText}>
                    {sale.nomClient.slice(0, 2).toUpperCase()}
                  </ThemedText>
                </View>

                <View>
                  <ThemedText type="defaultSemiBold" style={styles.companyName}>
                    {sale.nomClient}
                  </ThemedText>
                  <ThemedText
                    style={[styles.companyPhone, { color: mutedText }]}
                  >
                    Tel: {sale.phoneClient}
                  </ThemedText>
                  <ThemedText
                    style={[styles.companyPhone, { color: mutedText }]}
                  >
                    Email: {sale.emailClient}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/ventes/details",
                      params: {
                        id: String(sale.id),
                        codeVente: sale.codeVente,
                        nomClient: sale.nomClient,
                        dateVente: String(sale.dateVente),
                        totalNetPayer: String(sale.totalNetPayer ?? "0"),
                      },
                    })
                  }
                  style={[
                    styles.smallIconButton,
                    { backgroundColor: softBlock },
                  ]}
                >
                  <MaterialIcons
                    name="visibility"
                    size={16}
                    color={isDark ? "#D8DCF7" : "#6D728B"}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.smallIconButton,
                    { backgroundColor: softBlock },
                  ]}
                >
                  <MaterialIcons
                    name="edit"
                    size={16}
                    color={isDark ? "#D8DCF7" : "#6D728B"}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.smallIconButton,
                    { backgroundColor: softBlock },
                  ]}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={16}
                    color={isDark ? "#D8DCF7" : "#6D728B"}
                  />
                </Pressable>
              </View>
            </View>

            <View style={[styles.metaStrip, { backgroundColor: softBlock }]}>
              <View style={styles.metaItem}>
                <ThemedText style={[styles.metaLabel, { color: mutedText }]}>
                  ID vente
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaValue}>
                  {sale.codeVente}
                </ThemedText>
              </View>
              <View style={styles.metaItem}>
                <ThemedText style={[styles.metaLabel, { color: mutedText }]}>
                  Date
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaValue}>
                  {formatDate(sale.dateVente)}
                </ThemedText>
              </View>
              <View style={styles.metaItem}>
                <ThemedText style={[styles.metaLabel, { color: mutedText }]}>
                  Montant
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaValue}>
                  {formatNumber(sale.totalNetPayer)}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  headerWrap: {
    marginTop: -16,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#87D66B",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  summaryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6B3CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    top: 5,
    left: 5,
  },
  logoText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B4F65",
  },
  companyName: {
    fontSize: 15,
    lineHeight: 20,
  },
  companyPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  metaStrip: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    lineHeight: 18,
  },
});
