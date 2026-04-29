import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

const METRICS = [
  { label: "Total encaissé", value: "12 450 000", icon: "payments" as const },
  { label: "Prime moyenne", value: "178 000", icon: "speed" as const },
  { label: "Dossiers", value: "70", icon: "description" as const },
];

export default function EncaissementsPrimesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const muted = isDark ? "#A8AEC7" : "#61637A";

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Encaissements primes" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.subtitle, { color: muted }]}>Suivi des primes encaissées</ThemedText>

        {METRICS.map((item) => (
          <View key={item.label} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.cardRow}>
              <MaterialIcons name={item.icon} size={18} color="#1F8B82" />
              <ThemedText style={styles.cardLabel}>{item.label}</ThemedText>
            </View>
            <ThemedText style={styles.cardValue}>{item.value} XOF</ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 12 },
  headerWrap: { marginTop: -16, marginHorizontal: -12, marginBottom: 14 },
  content: { gap: 12, paddingBottom: 24 },
  subtitle: { fontSize: 13, marginBottom: 4 },
  card: { borderRadius: 14, padding: 14 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardLabel: { fontSize: 14, fontWeight: "600" },
  cardValue: { marginTop: 10, fontSize: 20, fontWeight: "800", color: "#1F8B82" },
});
