import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import ClientEditorModal from "@/components/client-editor-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useClientEditorModal } from "@/hooks/use-client-editor-modal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { createClient, getfetchClients, updateClient } from "@/services/api-service";
import { getLabelTypeClient } from "@/tools/tools";
import { client } from "@/types/client.type";
import { useEffect, useState } from "react";

const AVATAR_COLORS = [
  "#1F8B82", "#6B3CFF", "#E05252", "#E8872A", "#2A7BE8",
  "#50C52A", "#A83CFF", "#2AC5C5", "#FF6B6B", "#3CB87A",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ClientsScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const [customersList, setCustomersList] = useState<client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { showConfirm } = usePopup();
  const clientEditor = useClientEditorModal({
    createTitle: "Creer un nouveau client",
    getEditTitle: (selectedClient) => `Modifier ${selectedClient.code} - ${selectedClient.nom} ${selectedClient.prenoms}`,
  });

  const { userToken } = useAuthContext();

  useEffect(() => {
    if (!userToken) return;
    setIsLoading(true);
    getfetchClients(userToken)
      .then((res) => setCustomersList(res.data ?? []))
      .finally(() => setIsLoading(false));
  }, [userToken]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const mutedText = isDark ? "#A8AEC7" : "#8B90A5";

  const handleOpenNewClient = () => {
    clientEditor.openCreate();
  };

  const handleOpenEditClient = (client: client) => {
    clientEditor.openEdit(client);
  };

  const handleOpenClientDetails = (client: client) => {
    router.push({
      pathname: "/(commerce)/clients/details",
      params: { clientData: JSON.stringify(client) },
    });
  };


  const handleSubmitClient = async (
    data: Partial<client>,
    mode: "create" | "edit",
    selectedClient?: client,
  ): Promise<void> => {

     if (!data.nom) {
      throw new Error("Le nom est obligatoire");
    }

    if (data.typeId === 1) {
      if (!data.civilite) {
        throw new Error("La civilité est obligatoire pour une personne physique.");
      }

        if (!data.prenoms?.trim()) {
      throw new Error("Le prénom est obligatoire");
    }
    } else if (data.typeId === 2) {
       data.civilite = 4; // Forcer à "Société" si typeId est 2
       data.prenoms = ""; // Vider les prénoms pour une société
     }
   

    if (mode === "edit" && selectedClient) {
      const updated = await updateClient(userToken ?? "", selectedClient?.id ?? 0, data);
      setCustomersList((prev) =>
        prev.map((c) => (c.id === selectedClient.id ? { ...c, ...updated } : c)),
      );
    } else {
      const created = await createClient(userToken ?? "", data);
      setCustomersList((prev) => [created, ...prev]);
    }
  };

  const handleDeleteClient = (client: client) => {
    showConfirm(
      "error",
      "Supprimer le client",
      `Êtes-vous sûr de vouloir supprimer ${client.nom} ${client.prenoms} ?`,
      () => setCustomersList((prev) => prev.filter((c) => c.id !== client.id)),
      { confirmLabel: "Supprimer", cancelLabel: "Annuler" },
    );
  };

  // Filter customers based on search
  const filteredCustomers = customersList.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchText.toLowerCase())) ||
      (c.prenoms && c.prenoms.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Clients" />
      </View>

      <View style={[styles.searchBar, { backgroundColor: cardBackground }]}>
        <MaterialIcons name="search" size={18} color={mutedText} />
        <TextInput
          style={[styles.searchInput, { color: mutedText }]}
          placeholder="Chercher par nom, code ou prénom"
          placeholderTextColor={mutedText}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText("")}>
            <MaterialIcons name="close" size={18} color={mutedText} />
          </Pressable>
        )}
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.totalRow}>
          <ThemedText style={styles.totalLabel}>Clients</ThemedText>
          <View style={styles.countBadge}>
            <ThemedText style={styles.countText}>
              {customersList?.length ?? 0}
            </ThemedText>
          </View>
        </View>
        <View style={styles.summaryActions}>
          <Pressable
            style={styles.primaryAction}
            onPress={handleOpenNewClient}
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
              size={17}
              color={isDark ? "#FFFFFF" : "#69708A"}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && customersList.length === 0 ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#1F8B82" />
            <ThemedText style={[styles.centerStateText, { color: mutedText }]}>
              Chargement des clients…
            </ThemedText>
          </View>
        ) : filteredCustomers.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialIcons name="people-outline" size={48} color={mutedText} />
            <ThemedText style={[styles.centerStateText, { color: mutedText }]}>
              {searchText.length > 0
                ? "Aucun client ne correspond à votre recherche"
                : "Aucun client pour le moment"}
            </ThemedText>
          </View>
        ) : (
        filteredCustomers.map((item) => {
          const avatarColor = getAvatarColor(item.nom);
          const initials = item.nom
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: cardBackground,
                  shadowColor: "#10131F",
                  shadowOffset: { width: 0, height: 7 },
                  shadowOpacity: isDark ? 0.24 : 0.08,
                  shadowRadius: 16,
                  elevation: 3,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.companyRow}>
                  <View style={[styles.logo, { backgroundColor: avatarColor }]}>
                    <ThemedText style={styles.logoText}>{initials}</ThemedText>
                  </View>
                  <View style={styles.clientInfo}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.companyName}
                      numberOfLines={1}
                    >
                      {item.nom} {item.prenoms}
                    </ThemedText>
                    <View style={styles.companyMetaRow}>
                      <ThemedText
                        style={[styles.companyMeta, { color: mutedText }]}
                      >
                        {item.code}
                      </ThemedText>
                      {item.typeId ? (
                        <View style={[styles.typePill, { backgroundColor: softBlock }]}>
                          <ThemedText style={[styles.typePillText, { color: mutedText }]}>
                            {getLabelTypeClient(item.typeId)}
                          </ThemedText>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <Pressable
                    style={[styles.actionIcon, { backgroundColor: softBlock }]}
                    onPress={() => handleOpenEditClient(item)}
                    hitSlop={6}
                  >
                    <MaterialIcons
                      name="edit"
                      size={15}
                      color={isDark ? "#DCE0F8" : "#707792"}
                    />
                  </Pressable>
                  <Pressable
                    style={[styles.actionIcon, { backgroundColor: softBlock }]}
                    onPress={() => handleDeleteClient(item)}
                    hitSlop={6}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={15}
                      color={isDark ? "#DCE0F8" : "#E05252"}
                    />
                  </Pressable>
                  <Pressable
                    style={[styles.actionIcon, { backgroundColor: softBlock }]}
                    onPress={() => handleOpenClientDetails(item)}
                    hitSlop={6}
                  >
                    <MaterialIcons
                      name="chevron-right"
                      size={17}
                      color={isDark ? "#DCE0F8" : "#707792"}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={[styles.contactBlock, { backgroundColor: softBlock }]}>
                <View style={styles.contactRow}>
                  <MaterialIcons name="email" size={13} color={mutedText} />
                  <ThemedText style={[styles.contactText, { color: mutedText }]}>
                    {item.email || "—"}
                  </ThemedText>
                </View>
                <View style={styles.contactRow}>
                  <MaterialIcons name="phone" size={13} color={mutedText} />
                  <ThemedText style={[styles.contactText, { color: mutedText }]}>
                    {item.tel || "—"}
                  </ThemedText>
                </View>
                <View style={styles.contactRow}>
                  <MaterialIcons name="smartphone" size={13} color={mutedText} />
                  <ThemedText style={[styles.contactText, { color: mutedText }]}>
                    {item.mobile || "—"}
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })
        )}
      </ScrollView>

      <ClientEditorModal
        controller={clientEditor}
        onSubmit={handleSubmitClient}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  headerWrap: {
    marginTop: -16,
    marginHorizontal: -12,
    marginBottom: 14,
  },
  searchBar: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 8,
  },
  searchPlaceholder: {
    fontSize: 13,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#50C52A",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F8B82",
  },
  secondaryAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  centerStateText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  clientInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
  },
  companyMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  companyMetaRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8DDEB",
  },
  contactBlock: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  contactText: {
    fontSize: 12,
    flex: 1,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8DDEB",
  },
 
  statusPill: {
    minWidth: 68,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
