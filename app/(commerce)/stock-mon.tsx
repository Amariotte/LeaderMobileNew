import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

const ITEMS = [
  { lib: "Cartes auto", qty: 120 },
  { lib: "Vignettes", qty: 67 },
  { lib: "Attestations", qty: 215 },
];

export default function StockMonScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Mon stock" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {ITEMS.map((item) => (
          <View key={item.lib} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.row}>
              <View style={styles.leftRow}>
                <MaterialIcons name="inventory-2" size={18} color="#1F8B82" />
                <ThemedText style={styles.lib}>{item.lib}</ThemedText>
              </View>
              <ThemedText style={styles.qty}>{item.qty}</ThemedText>
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
  card: { borderRadius: 14, padding: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  leftRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  lib: { fontSize: 14, fontWeight: "600" },
  qty: { fontSize: 18, fontWeight: "800", color: "#1F8B82" },
});
