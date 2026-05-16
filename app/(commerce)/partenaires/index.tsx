import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import PartenaireFormModal from "@/components/partenaire-form-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import {
    createPartenaire,
    deletePartenaire,
    getfetchPartenaires,
    updatePartenaire,
} from "@/services/api-partenaires";
import { getAvatarColor, getInitials } from "@/tools/tools";
import { partenaire, statusPartenaires } from "@/types/partenaires";


function StatusBadge({ status, isDark }: { status?: statusPartenaires; isDark: boolean }) {
  const config: Record<statusPartenaires, { bg: string; text: string; icon: string }> = {
    "Activé":     { bg: isDark ? "#143B39" : "#DBF4F1", text: isDark ? "#A2E3BE" : "#166534", icon: "check-circle" },
    "Désativé":   { bg: isDark ? "#2E1A1A" : "#FFF0F0", text: isDark ? "#F8A0A0" : "#B91C1C", icon: "cancel" },
    "En attente": { bg: isDark ? "#2A2010" : "#FFF8E1", text: isDark ? "#F8CFA4" : "#92400E", icon: "schedule" },
  };
  const s = status ?? "En attente";
  const c = config[s];
  return (
    <View style={[badgeStyles.badge, { backgroundColor: c.bg }]}>
      <MaterialIcons name={c.icon as any} size={12} color={c.text} />
      <ThemedText style={[badgeStyles.text, { color: c.text }]}>{s}</ThemedText>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: "600" },
});

export default function PartenairesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#2F3547" : "#E4E9F5";
  const mutedText = isDark ? "#A8AEC7" : "#75809A";
  const inputBg = isDark ? "#1E2230" : "#F9FAFD";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const primaryColor = "#1F8B82";

  const [partenaires, setPartenaires] = useState<partenaire[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedPartenaire, setSelectedPartenaire] = useState<partenaire | undefined>();
  const { userToken } = useAuthContext();
  const { showConfirm, showMessage } = usePopup();

  useEffect(() => {
    if (!userToken) return;
    setIsLoading(true);
    getfetchPartenaires(userToken)
      .then((res) => setPartenaires(res.data ?? []))
      .finally(() => setIsLoading(false));
  }, [userToken]);

  const filtered = partenaires.filter((p) =>
    p.nom.toLowerCase().includes(searchText.toLowerCase()) ||
    (p.code ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
    (p.nomRepresentant ?? "").toLowerCase().includes(searchText.toLowerCase()),
  );

  const openCreate = () => {
    setModalMode("create");
    setSelectedPartenaire(undefined);
    setModalVisible(true);
  };

  const openEdit = (p: partenaire) => {
    setModalMode("edit");
    setSelectedPartenaire(p);
    setModalVisible(true);
  };

  const handleSubmit = async (data: Partial<partenaire>) => {
    if (!userToken) throw new Error("Session invalide");
    if (modalMode === "edit" && selectedPartenaire) {
      const updated = await updatePartenaire(userToken, selectedPartenaire.id ?? 0, data);
      setPartenaires((prev) => prev.map((p) => (p.id === selectedPartenaire.id ? { ...p, ...updated } : p)));
      showMessage("success", "Partenaire modifié", "Les informations ont été mises à jour.");
    } else {
      const created = await createPartenaire(userToken, data);
      setPartenaires((prev) => [created, ...prev]);
      showMessage("success", "Partenaire créé", "Le partenaire a été ajouté avec succès.");
    }
  };

  const handleDelete = (p: partenaire) => {
    showConfirm(
      "info",
      "Supprimer ce partenaire",
      `Voulez-vous vraiment supprimer "${p.nom}" ? Cette action est irréversible.`,
      async () => {
        if (!userToken) return;
        try {
          await deletePartenaire(userToken, p.id ?? 0);
          setPartenaires((prev) => prev.filter((x) => x.id !== p.id));
          showMessage("success", "Supprimé", "Le partenaire a été supprimé.");
        } catch {
          showMessage("error", "Erreur", "Impossible de supprimer ce partenaire.");
        }
      },
    );
  };

  const handleOpenDetails = (p: partenaire) => {
    router.push({
      pathname: "/(commerce)/partenaires/details",
      params: { partenaireData: JSON.stringify(p) },
    });
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Partenaires" />
      </View>

      {/* Search + Add */}
      <View style={[styles.toolbar, { borderBottomColor: borderColor }]}>
        <View style={[styles.searchBar, { backgroundColor: inputBg, borderColor }]}>
          <MaterialIcons name="search" size={18} color={mutedText} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Rechercher un partenaire..."
            placeholderTextColor={mutedText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")} hitSlop={8}>
              <MaterialIcons name="close" size={16} color={mutedText} />
            </Pressable>
          )}
        </View>
        <Pressable style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={openCreate}>
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: primaryColor }]}>{partenaires.length}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedText }]}>Total</ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: "#166534" }]}>
            {partenaires.filter((p) => p.etatLib === "Activé").length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedText }]}>Actifs</ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: "#92400E" }]}>
            {partenaires.filter((p) => p.etatLib === "En attente").length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedText }]}>En attente</ThemedText>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: mutedText }]}>Chargement...</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="business" size={48} color={mutedText} />
              <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                {searchText ? "Aucun résultat" : "Aucun partenaire"}
              </ThemedText>
            </View>
          ) : (
            filtered.map((p) => {
              const avatarColor = getAvatarColor(p.nom);
              return (
                <Pressable
                  key={p.id}
                  style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
                  onPress={() => handleOpenDetails(p)}
                >
                  {/* Avatar + info */}
                  <View style={styles.cardMain}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
                      <ThemedText style={[styles.avatarText, { color: avatarColor }]}>
                        {getInitials(p.nom)}
                      </ThemedText>
                    </View>
                    <View style={styles.cardInfo}>
                      <ThemedText style={[styles.cardName, { color: textColor }]} numberOfLines={1}>
                        {p.nom}
                      </ThemedText>
                      {p.code && (
                        <ThemedText style={[styles.cardCode, { color: mutedText }]}>
                          {p.code}
                        </ThemedText>
                      )}
                      {p.nomRepresentant && (
                        <View style={styles.cardMeta}>
                          <MaterialIcons name="person" size={12} color={mutedText} />
                          <ThemedText style={[styles.cardMetaText, { color: mutedText }]}>
                            {p.nomRepresentant}
                          </ThemedText>
                        </View>
                      )}
                      {p.contacts && (
                        <View style={styles.cardMeta}>
                          <MaterialIcons name="phone" size={12} color={mutedText} />
                          <ThemedText style={[styles.cardMetaText, { color: mutedText }]}>
                            {p.contacts}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardRight}>
                      <StatusBadge status={p.etatLib} isDark={isDark} />
                      <View style={styles.cardActions}>
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: isDark ? "#1E2A3A" : "#E8F2FF" }]}
                          onPress={(e) => { e.stopPropagation(); openEdit(p); }}
                          hitSlop={6}
                        >
                          <MaterialIcons name="edit" size={15} color="#2A7BE8" />
                        </Pressable>
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: isDark ? "#2E1A1A" : "#FFF0F0" }]}
                          onPress={(e) => { e.stopPropagation(); handleDelete(p); }}
                          hitSlop={6}
                        >
                          <MaterialIcons name="delete" size={15} color="#E05252" />
                        </Pressable>
                        <Pressable
                          style={[styles.actionBtn, { backgroundColor: p.etatLib === "Activé" ? (isDark ? "#2E1A1A" : "#FFF0F0") : (isDark ? "#143B39" : "#DBF4F1") }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            const newEtat = p.etatLib === "Activé" ? "Désativé" : "Activé";
                            showConfirm(
                              "info",
                              newEtat === "Activé" ? "Activer le partenaire" : "Désactiver le partenaire",
                              `Voulez-vous vraiment ${newEtat === "Activé" ? "activer" : "désactiver"} "${p.nom}" ?`,
                              async () => {
                                if (!userToken) return;
                                try {
                                  const updated = await updatePartenaire(userToken, p.id ?? 0, { etatLib: newEtat });
                                  setPartenaires((prev) => prev.map((x) => x.id === p.id ? { ...x, ...updated, etatLib: newEtat } : x));
                                  showMessage("success", newEtat === "Activé" ? "Partenaire activé" : "Partenaire désactivé", `Le partenaire a été ${newEtat === "Activé" ? "activé" : "désactivé"}.`);
                                } catch {
                                  showMessage("error", "Erreur", `Impossible de ${newEtat === "Activé" ? "activer" : "désactiver"} ce partenaire.`);
                                }
                              },
                              { confirmLabel: newEtat === "Activé" ? "Activer" : "Désactiver", cancelLabel: "Annuler" }
                            );
                          }}
                          hitSlop={6}
                        >
                          <MaterialIcons
                            name={p.etatLib === "Activé" ? "block" : "check-circle"}
                            size={15}
                            color={p.etatLib === "Activé" ? "#B91C1C" : "#166534"}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* Footer */}
                  {(p.adresse || p.email) && (
                    <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
                      {p.adresse && (
                        <View style={styles.footerItem}>
                          <MaterialIcons name="place" size={12} color={mutedText} />
                          <ThemedText style={[styles.footerText, { color: mutedText }]} numberOfLines={1}>
                            {p.adresse}
                          </ThemedText>
                        </View>
                      )}
                      {p.email && (
                        <View style={styles.footerItem}>
                          <MaterialIcons name="email" size={12} color={mutedText} />
                          <ThemedText style={[styles.footerText, { color: mutedText }]} numberOfLines={1}>
                            {p.email}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Arrow */}
                  <View style={styles.cardArrow}>
                    <MaterialIcons name="chevron-right" size={18} color={mutedText} />
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}

      <PartenaireFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialPartenaire={selectedPartenaire}
        title={modalMode === "create" ? "Nouveau partenaire" : `Modifier ${selectedPartenaire?.nom ?? ""}`}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: {},
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 1 },
  statDivider: { width: 1, height: 28 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14 },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: "700" },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: "700" },
  cardCode: { fontSize: 12 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMetaText: { fontSize: 12 },
  cardRight: { alignItems: "flex-end", gap: 8 },
  cardActions: { flexDirection: "row", gap: 6 },
  actionBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardArrow: { position: "absolute", right: 12, bottom: 14 },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12 },
});
