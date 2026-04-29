import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

const PARTENAIRES = [
  { nom: "Partenaire A", stock: 340 },
  { nom: "Partenaire B", stock: 185 },
  { nom: "Partenaire C", stock: 92 },
];

export default function StockPartenairesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Stocks partenaires" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {PARTENAIRES.map((item) => (
          <View key={item.nom} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.row}>
              <View style={styles.leftRow}>
                <MaterialIcons name="groups" size={18} color="#1F8B82" />
                <ThemedText style={styles.name}>{item.nom}</ThemedText>
              </View>
              <ThemedText style={styles.stock}>{item.stock}</ThemedText>
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
  name: { fontSize: 14, fontWeight: "600" },
  stock: { fontSize: 18, fontWeight: "800", color: "#1F8B82" },
});
