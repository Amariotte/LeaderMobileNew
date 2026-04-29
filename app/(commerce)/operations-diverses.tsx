import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

const OPS = [
  { code: "OP-2401", lib: "Ajustement prime", montant: "95 000" },
  { code: "OP-2402", lib: "Régularisation commission", montant: "42 500" },
  { code: "OP-2403", lib: "Frais dossier", montant: "18 000" },
];

export default function OperationsDiversesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const muted = isDark ? "#A8AEC7" : "#61637A";

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Opérations diverses" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {OPS.map((op) => (
          <View key={op.code} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.row}>
              <View style={styles.leftRow}>
                <MaterialIcons name="receipt-long" size={18} color="#1F8B82" />
                <View>
                  <ThemedText style={styles.code}>{op.code}</ThemedText>
                  <ThemedText style={[styles.lib, { color: muted }]}>{op.lib}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.amount}>{op.montant} XOF</ThemedText>
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
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  leftRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  code: { fontSize: 14, fontWeight: "700" },
  lib: { fontSize: 12 },
  amount: { fontSize: 14, fontWeight: "800", color: "#1F8B82" },
});
