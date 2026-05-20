import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { UtilisateurFormModal } from "@/components/utilisateur-form-modal";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppColors } from "@/hooks/use-app-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { putAuthNoBody } from "@/services/api-client";
import { activationUtilisateur, createUtilisateur, desactivationUtilisateur, getfetchUtilisateurs, updateUtilisateur } from "@/services/api-service";
import { getAvatarColor, getInitials } from "@/tools/tools";
import { utilisateur } from "@/types/utilisateurs";

export default function UtilisateursScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

 
  const { pageBackground, inputBg, cardBackground, borderColor, mutedText ,textColor,primaryColor } = useAppColors();

  const [utilisateurs, setUtilisateurs] = useState<utilisateur[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<Partial<utilisateur> | null>(null);
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const { userToken } = useAuthContext();
  const { showMessage, showConfirm } = usePopup();

  useEffect(() => {
    if (!userToken) return;
    setIsLoading(true);
    getfetchUtilisateurs(userToken)
      .then((res) => setUtilisateurs(res.data))
      .catch(() => setUtilisateurs([]))
      .finally(() => setIsLoading(false));
  }, [userToken]);

  const filtered = utilisateurs.filter(
    (u) =>
      u.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      (u.login ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(searchText.toLowerCase()) ||
      (u.partenaireNom ?? "").toLowerCase().includes(searchText.toLowerCase()),
  );

  const totalActifs = utilisateurs.filter((u) => u.compteActive).length;
  const totalSuperUsers = utilisateurs.filter((u) => u.superUser).length;

  const handleOpenModal = (data?: Partial<utilisateur>, readOnly = false) => {
    setModalData(data || null);
    setModalReadOnly(readOnly);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalData(null);
    setModalReadOnly(false);
  };

  const handleSubmitModal = async (data: Partial<utilisateur>) => {
    if (!userToken) return;
    try {
      if (data.id) {
        const updated = await updateUtilisateur(userToken, data.id, data);
        setUtilisateurs((prev) => prev.map((u) => u.id === data.id ? { ...u, ...updated } : u));
        showMessage("success", "Utilisateur modifié", "L'utilisateur a été modifié.");
      } else {
        const created = await createUtilisateur(userToken, data);
        setUtilisateurs((prev) => [created, ...prev]);
        showMessage("success", "Utilisateur créé", "L'utilisateur a été créé.");
      }
    } catch {
      showMessage("error", "Erreur", "Impossible d'enregistrer l'utilisateur.");
    }
    handleCloseModal();
  };

  const handleToggleActive = (u: utilisateur) => {
    if (!userToken || !u.id) return;
    showConfirm(
      "info",
      u.compteActive ? "Désactiver l'utilisateur" : "Activer l'utilisateur",
      `Voulez-vous vraiment ${u.compteActive ? "désactiver" : "activer"} "${u.nom}" ?`,
      async () => {
        try {

          if (u.compteActive) {
            await desactivationUtilisateur(userToken, u.id!);
          }
          else {
            await activationUtilisateur(userToken, u.id!);
          }

          await getfetchUtilisateurs(userToken).then((res) => setUtilisateurs(res.data));

          showMessage("success", u.compteActive ? "Utilisateur désactivé" : "Utilisateur activé", `L'utilisateur a été ${u.compteActive ? "désactivé" : "activé"}.`);
        } catch {
          showMessage("error", "Erreur", `Impossible ${u.compteActive ? "de désactiver" : "d'activer"} cet utilisateur.`);
        }
      },
      { confirmLabel: u.compteActive ? "Désactiver" : "Activer", cancelLabel: "Annuler" }
    );
  };

  const handleResetPassword = (u: utilisateur) => {
    if (!userToken || !u.id) return;
    showConfirm(
      "info",
      "Réinitialiser le mot de passe",
      `Voulez-vous réinitialiser le mot de passe de "${u.nom}" ?`,
      async () => {
        try {
          await putAuthNoBody(`/utilisateurs/${u.id}/reset-password`, userToken);
          showMessage("success", "Mot de passe réinitialisé", "Un email a été envoyé à l'utilisateur.");
        } catch {
          showMessage("error", "Erreur", "Impossible de réinitialiser le mot de passe.");
        }
      },
      { confirmLabel: "Réinitialiser", cancelLabel: "Annuler" }
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Utilisateurs" />
      </View>

      {/* Bouton créer */}
      <View style={{ alignItems: "flex-end", margin: 12 }}>
        <Pressable onPress={() => handleOpenModal()} style={{ backgroundColor: primaryColor, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
          <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>+ Créer utilisateur</ThemedText>
        </Pressable>
      </View>
      {/* Search */}
      <View style={[styles.toolbar, { borderBottomColor: borderColor }]}>
        <View style={[styles.searchBar, { backgroundColor: inputBg, borderColor }]}>
          <MaterialIcons name="search" size={18} color={mutedText} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Rechercher un utilisateur..."
            placeholderTextColor={mutedText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")} hitSlop={8}>
              <MaterialIcons name="close" size={16} color={mutedText} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsBar, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: primaryColor }]}>{utilisateurs.length}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedText }]}>Total</ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: "#166534" }]}>{totalActifs}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedText }]}>Actifs</ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: "#7C3AED" }]}>{totalSuperUsers}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: mutedText }]}>Super-users</ThemedText>
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
              <MaterialIcons name="people" size={48} color={mutedText} />
              <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                {searchText ? "Aucun résultat" : "Aucun utilisateur"}
              </ThemedText>
            </View>
          ) : (
            filtered.map((u) => {
              const avatarColor = getAvatarColor(u.nom);
              const isActive = u.compteActive ?? false;

              return (
                <Pressable
                  key={u.id}
                  style={[styles.card, { backgroundColor: cardBackground, borderColor }]}
                  onPress={() => handleOpenModal(u, true)}
                >
                  <View style={styles.cardMain}>
                    {/* Avatar */}
                    <View style={[styles.avatar, { backgroundColor: avatarColor + "22" }]}>
                      <ThemedText style={[styles.avatarText, { color: avatarColor }]}>
                        {getInitials(u.nom)}
                      </ThemedText>
                    </View>

                    {/* Info */}
                    <View style={styles.cardInfo}>
                      <View style={styles.nameRow}>
                        <ThemedText style={[styles.cardName, { color: textColor }]} numberOfLines={1}>
                          {u.nom}
                        </ThemedText>
                        {u.superUser && (
                          <View style={[styles.superUserBadge, { backgroundColor: isDark ? "#2D1A4A" : "#F3E8FF" }]}>
                            <MaterialIcons name="star" size={11} color="#7C3AED" />
                            <ThemedText style={styles.superUserText}>Super-user</ThemedText>
                          </View>
                        )}
                      </View>

                      {u.login && (
                        <View style={styles.metaRow}>
                          <MaterialIcons name="alternate-email" size={12} color={mutedText} />
                          <ThemedText style={[styles.metaText, { color: mutedText }]}>{u.login}</ThemedText>
                        </View>
                      )}
                      {u.partenaireNom && (
                        <View style={styles.metaRow}>
                          <MaterialIcons name="business" size={12} color={mutedText} />
                          <ThemedText style={[styles.metaText, { color: mutedText }]}>{u.partenaireNom}</ThemedText>
                        </View>
                      )}
                      {u.email && (
                        <View style={styles.metaRow}>
                          <MaterialIcons name="email" size={12} color={mutedText} />
                          <ThemedText style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>{u.email}</ThemedText>
                        </View>
                      )}
                    </View>

                    {/* Status + Actions */}
                    <View style={{ alignItems: "flex-end", gap: 6 }}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: isActive
                              ? isDark ? "#143B39" : "#DBF4F1"
                              : isDark ? "#2E1A1A" : "#FFF0F0",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: isActive ? "#16A34A" : "#DC2626" },
                          ]}
                        />
                        <ThemedText
                          style={[
                            styles.statusText,
                            { color: isActive ? (isDark ? "#A2E3BE" : "#166534") : (isDark ? "#F8A0A0" : "#B91C1C") },
                          ]}
                        >
                          {isActive ? "Actif" : "Inactif"}
                        </ThemedText>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                        <Pressable onPress={() => handleOpenModal(u, false)} hitSlop={6} style={{ padding: 2 }}>
                          <MaterialIcons name="edit" size={16} color="#2A7BE8" />
                        </Pressable>
                        <Pressable onPress={() => handleToggleActive(u)} hitSlop={6} style={{ padding: 2 }}>
                          <MaterialIcons name={u.compteActive ? "block" : "check-circle"} size={16} color={u.compteActive ? "#B91C1C" : "#166534"} />
                        </Pressable>
                        <Pressable onPress={() => handleResetPassword(u)} hitSlop={6} style={{ padding: 2 }}>
                          <MaterialIcons name="lock-reset" size={16} color="#7C3AED" />
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {/* Contact footer */}
                  {u.contacts && (
                    <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
                      <MaterialIcons name="phone" size={12} color={mutedText} />
                      <ThemedText style={[styles.footerText, { color: mutedText }]}>{u.contacts}</ThemedText>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
      <UtilisateurFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        initialData={modalData || {}}
        readOnly={modalReadOnly}
        token={userToken}
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
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cardName: { fontSize: 15, fontWeight: "700" },
  superUserBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  superUserText: { fontSize: 10, fontWeight: "600", color: "#7C3AED" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  statusDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerText: { fontSize: 12 },
});
