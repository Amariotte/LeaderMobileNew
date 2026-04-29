import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import COLORS from "@/styles/colors";

type Tile = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

const QUICK_TILES: Tile[] = [
  {
    id: "contrat",
    label: "Nouveau contrat",
    icon: "point-of-sale",
    color: "#EAE8FF",
  },
  {
    id: "vehicule",
    label: "Nouveau véhicule",
    icon: "local-shipping",
    color: "#E4F7E8",
  },
  {
    id: "encaissement-primes",
    label: "Encaissement primes",
    icon: "payments",
    color: "#E8F0FF",
  },
   {
    id: "operation-diverse",
    label: "Nouvelle op. diverse",
    icon: "inventory-2",
    color: "#FFE9ED",
  },
  {
    id: "reg-fourn",
    label: "Regl. fourn.",
    icon: "request-quote",
    color: "#FCE9FF",
  }
];

const WEEK_DATA = [86, 18, 22, 61, 47, 73, 28];
const WEEK_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const CUSTOMERS = [
  { id: "c1", name: "Hotel Saphir", amount: "236 000 FCFA" },
  { id: "c2", name: "Restaurant Lagon", amount: "189 500 FCFA" },
  { id: "c3", name: "Superette Amani", amount: "147 000 FCFA" },
];

export default function HomeScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const surface = isDark ? "#1A1A22" : "#FFFFFF";
  const screenBg = isDark ? "#1F8B82" : "#1F8B82";
  const textMute = isDark ? "#B7B8C7" : "#61637A";
  const innerBorder = isDark ? "#363A4C" : "#E7EAF5";

  const handleQuickTilePress = (tileId: string) => {
    if (tileId === "vente") {
      router.push("/ventes");
      return;
    }

    if (tileId === "clients") {
      router.push("/clients");
      return;
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: screenBg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: COLORS.primaryColor }]}>
          <View style={styles.headerEdge}>
            <AppHeaderDrawer title="Dashboard" variant="primary" />
          </View>

          <ThemedText style={styles.heroHint}>Total ventes du mois</ThemedText>
          <View style={styles.amountRow}>
            <ThemedText style={styles.heroAmount}>100 000</ThemedText>
            <View style={styles.deltaPill}>
              <MaterialIcons name="trending-up" size={12} color="#35B673" />
              <ThemedText style={styles.deltaText}>+45%</ThemedText>
            </View>
          </View>

          <View style={styles.heroCardsRow}>
            <View style={styles.heroCard}>
              <View style={styles.heroCardTop}>
                <ThemedText style={styles.heroCardLabel}>Factures</ThemedText>
                <MaterialIcons name="description" size={16} color="#6E7092" />
              </View>
              <ThemedText style={styles.heroCardCaption}>
                Cette semaine
              </ThemedText>
              <View style={styles.heroCardBottom}>
                <ThemedText style={styles.heroCardValue}>125 467</ThemedText>
                <ThemedText style={styles.heroCardDelta}>+12.53%</ThemedText>
              </View>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroCardTop}>
                <ThemedText style={styles.heroCardLabel}>Montant du</ThemedText>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={16}
                  color="#6E7092"
                />
              </View>
              <ThemedText style={styles.heroCardCaption}>
                Cette semaine
              </ThemedText>
              <View style={styles.heroCardBottom}>
                <ThemedText style={styles.heroCardValue}>32 014</ThemedText>
                <ThemedText style={styles.heroCardDelta}>+1.44%</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.bottomSection, { backgroundColor: surface }]}>
          <View
            style={[
              styles.block,
              {
                backgroundColor: surface,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.blockTitle}>
              Raccourcis rapides
            </ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRowContent}
              nestedScrollEnabled
            >
              {QUICK_TILES.map((tile) => (
                <Pressable
                  key={tile.id}
                  onPress={() => handleQuickTilePress(tile.id)}
                  style={[
                    styles.quickTile,
                    {
                      backgroundColor: tile.color,
                      borderColor: innerBorder,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View style={styles.quickPlusButton}>
                    <MaterialIcons name="add" size={16} color="#1E2238" />
                  </View>
                  <ThemedText style={styles.quickLabel}>
                    {tile.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View
            style={[
              styles.block,
              {
                backgroundColor: surface,
                shadowColor: "#1B1E2E",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.34 : 0.1,
                shadowRadius: 18,
                elevation: 4,
              },
            ]}
          >
            <View style={styles.statsTop}>
              <ThemedText type="subtitle" style={styles.blockTitle}>
                Statistiques de paiement
              </ThemedText>
              <View
                style={[
                  styles.filterPill,
                  { borderColor: isDark ? "#3B3D52" : "#DFE1ED" },
                ]}
              >
                <ThemedText style={[styles.filterText, { color: textMute }]}>
                  Hebdo
                </ThemedText>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={16}
                  color={textMute}
                />
              </View>
            </View>

            <ThemedText style={[styles.legendTop, { color: textMute }]}>
              Montant total facture
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.legendAmount}>
              97 650 FCFA
            </ThemedText>

            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: isDark ? "#222432" : "#FFFFFF",
                  shadowColor: "#1B1E2E",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.34 : 0.12,
                  shadowRadius: 18,
                  elevation: 5,
                },
              ]}
            >
              {WEEK_DATA.map((value, index) => (
                <View key={WEEK_LABELS[index]} style={styles.barSlot}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${value}%`,
                          backgroundColor:
                            index % 2 === 0 ? "#5B3BFF" : "#1F2431",
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.barLabel, { color: textMute }]}>
                    {WEEK_LABELS[index]}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.bottomBlock,
              {
                backgroundColor: isDark ? "#171425" : "#17142A",
                borderColor: isDark ? "#2E2851" : "#2B244A",
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.bottomHead}>
              <ThemedText type="subtitle" style={styles.bottomTitle}>
                Clients frequents
              </ThemedText>
              <ThemedText style={styles.seeAll}>Voir tout</ThemedText>
            </View>

            {CUSTOMERS.map((customer) => (
              <View key={customer.id} style={styles.customerRow}>
                <View style={styles.customerAvatar}>
                  <ThemedText style={styles.customerAvatarText}>
                    {customer.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </ThemedText>
                </View>
                <View style={styles.customerInfo}>
                  <ThemedText style={styles.customerName}>
                    {customer.name}
                  </ThemedText>
                  <ThemedText style={styles.customerAmount}>
                    {customer.amount}
                  </ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#BFC3FF" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 0,
  },
  hero: {
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerEdge: {
    marginTop: -16,
    marginHorizontal: -14,
  },
  bottomSection: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  heroHint: {
    color: "#CFC4FF",
    fontSize: 12,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    flexShrink: 1,
  },
  deltaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#ECF9F1",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deltaText: {
    color: "#35B673",
    fontSize: 11,
    fontWeight: "700",
  },
  heroCardsRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  heroCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E9F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  heroCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroCardLabel: {
    color: "#272940",
    fontSize: 12,
    fontWeight: "700",
  },
  heroCardCaption: {
    color: "#80839D",
    fontSize: 10,
    marginTop: 2,
  },
  heroCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  heroCardValue: {
    color: "#242741",
    fontSize: 19,
    fontWeight: "800",
  },
  heroCardDelta: {
    color: "#3AB679",
    fontSize: 10,
    fontWeight: "700",
  },
  block: {
    borderRadius: 18,
    padding: 12,
  },
  blockTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  quickRowContent: {
    marginTop: 10,
    gap: 8,
    paddingRight: 4,
    paddingBottom: 2,
  },
  quickTile: {
    width: 106,
    minHeight: 84,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickPlusButton: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: "#252840",
    textAlign: "center",
  },
  statsTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  legendTop: {
    marginTop: 12,
    fontSize: 12,
  },
  legendAmount: {
    marginTop: 2,
    fontSize: 23,
    lineHeight: 28,
  },
  chartCard: {
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingBottom: 6,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barSlot: {
    width: "13%",
    alignItems: "center",
  },
  barTrack: {
    width: 14,
    height: 100,
    borderRadius: 10,
    justifyContent: "flex-end",
    backgroundColor: "#ECEEFA",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 10,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 10,
  },
  bottomBlock: {
    borderRadius: 18,
    padding: 12,
  },
  bottomHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bottomTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 22,
  },
  seeAll: {
    color: "#CACDFF",
    fontSize: 12,
    fontWeight: "600",
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2D2950",
    paddingVertical: 10,
    gap: 10,
  },
  customerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5A46D8",
    alignItems: "center",
    justifyContent: "center",
  },
  customerAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  customerAmount: {
    color: "#BFC3FF",
    fontSize: 12,
    marginTop: 1,
  },
});
