import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate, formatNumber } from "@/tools/tools";

type DetailParams = {
  id?: string;
  codeVente?: string;
  nomClient?: string;
  dateVente?: string;
  totalNetPayer?: string;
};

export default function VenteDetailsScreen() {
  const { codeVente, nomClient, dateVente, totalNetPayer } =
    useLocalSearchParams<DetailParams>();

  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const mutedText = isDark ? "#A8AEC7" : "#8C90A3";
  const lineColor = isDark ? "#2B2E3A" : "#E6E7EE";
  const successBg = isDark ? "#2A7B1A" : "#47B824";
  const danger = "#FF5A3B";

  const invoiceCode = codeVente?.trim() || "#INV124544";
  const customer = nomClient?.trim() || "Client non renseigne";
  const issueDateText = formatDate(dateVente ?? null);

  const parsedAmount = Number(totalNetPayer ?? "0");
  const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
  const tax = Math.round(amount * 0.04);
  const grandTotal = amount + tax;

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Details de vente" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: cardBackground,
              shadowColor: "#10131F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.24 : 0.08,
              shadowRadius: 18,
              elevation: 4,
            },
          ]}
        >
          <View style={styles.invoiceHeaderRow}>
            <View>
              <ThemedText type="defaultSemiBold" style={styles.invoiceTitle}>
                Invoice Name
              </ThemedText>
              <ThemedText style={[styles.invoiceCode, { color: danger }]}>
                {invoiceCode}
              </ThemedText>
            </View>

            <View style={styles.invoiceActions}>
              <Pressable style={styles.smallIconButton}>
                <MaterialIcons
                  name="edit"
                  size={15}
                  color={isDark ? "#D4D9F4" : "#767C95"}
                />
              </Pressable>
              <Pressable style={styles.smallIconButton}>
                <MaterialIcons
                  name="delete-outline"
                  size={15}
                  color={isDark ? "#D4D9F4" : "#767C95"}
                />
              </Pressable>
              <View
                style={[styles.statusBadge, { backgroundColor: successBg }]}
              >
                <ThemedText style={styles.statusText}>Paid</ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: lineColor }]} />

          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                Issue Date
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: mutedText }]}>
                {issueDateText}
              </ThemedText>
            </View>
            <View style={styles.infoCell}>
              <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                Due Date
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: mutedText }]}>
                {issueDateText}
              </ThemedText>
            </View>
            <View style={styles.infoCell}>
              <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                Invoice To
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: mutedText }]}>
                {customer}
              </ThemedText>
            </View>
            <View style={styles.infoCell}>
              <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                Pay To
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: mutedText }]}>
                eGaz Distribution
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: mutedText }]}>
                Abidjan, CI
              </ThemedText>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: lineColor }]} />

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Items
          </ThemedText>

          <View style={[styles.itemCard, { borderColor: lineColor }]}>
            <View style={styles.itemTopRow}>
              <ThemedText type="defaultSemiBold" style={styles.itemName}>
                Gaz 12kg
              </ThemedText>
              <ThemedText style={[styles.itemAmount, { color: danger }]}>
                ${formatNumber(amount)}
              </ThemedText>
            </View>
            <View style={styles.itemMetaRow}>
              <View>
                <ThemedText style={[styles.metaLabel, { color: mutedText }]}>
                  Unit
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaValue}>
                  Pc
                </ThemedText>
              </View>
              <View>
                <ThemedText style={[styles.metaLabel, { color: mutedText }]}>
                  Quantity
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaValue}>
                  1
                </ThemedText>
              </View>
              <View>
                <ThemedText style={[styles.metaLabel, { color: mutedText }]}>
                  Rate
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaValue}>
                  ${formatNumber(amount)}
                </ThemedText>
              </View>
              <View>
                <ThemedText style={[styles.metaLabel, { color: mutedText }]}>
                  Discount
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metaValue}>
                  $0
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.totalRow, { borderTopColor: lineColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.totalLabel}>
              Total
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.totalValue}>
              ${formatNumber(amount)}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: cardBackground,
              shadowColor: "#10131F",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.22 : 0.07,
              shadowRadius: 16,
              elevation: 3,
            },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Summary
          </ThemedText>

          <View style={styles.summaryRow}>
            <ThemedText style={[styles.summaryLabel, { color: mutedText }]}>
              Amount
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              ${formatNumber(amount)}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={[styles.summaryLabel, { color: mutedText }]}>
              Tax
            </ThemedText>
            <ThemedText style={styles.summaryValue}>
              ${formatNumber(tax)}
            </ThemedText>
          </View>

          <View style={[styles.summaryTotal, { borderTopColor: lineColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.summaryTotalLabel}>
              Total
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.summaryTotalValue}>
              ${formatNumber(grandTotal)}
            </ThemedText>
          </View>
        </View>
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
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 28,
    gap: 12,
  },
  mainCard: {
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  invoiceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  invoiceTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  invoiceCode: {
    fontSize: 13,
  },
  invoiceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallIconButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0F6",
  },
  statusBadge: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  separator: {
    height: 1,
    width: "100%",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 10,
  },
  infoCell: {
    width: "48%",
    minHeight: 52,
  },
  infoTitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 15,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  itemMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: 11,
  },
  metaValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 24,
  },
  totalValue: {
    fontSize: 28,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryTotal: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTotalLabel: {
    fontSize: 24,
  },
  summaryTotalValue: {
    fontSize: 28,
  },
});
