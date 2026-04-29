import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import ClientEditorModal from "@/components/client-editor-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { useClientEditorModal } from "@/hooks/use-client-editor-modal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getfetchClients } from "@/services/api-service";
import { CLIENTS_LIST_CACHE_KEY } from "@/services/cache-service";
import { client, listClients } from "@/types/client.type";
import { useMemo, useState } from "react";

export default function ClientsScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const [customersList, setCustomersList] = useState<client[]>([]);
  const [searchText, setSearchText] = useState("");
  const clientEditor = useClientEditorModal({
    createTitle: "Creer un nouveau client",
    getEditTitle: (selectedClient) => `Modifier ${selectedClient.nom}`,
  });

  const initialClients = useMemo<listClients>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const { userToken } = useAuthContext();
  const { data: clients } = useCachedResource<listClients>({
    cacheKey: CLIENTS_LIST_CACHE_KEY,
    initialData: initialClients,
    enabled: Boolean(userToken),
    fetcher: async () => getfetchClients(userToken ?? ""),
    hasUsableCachedData: (cachedData) =>
      Boolean(
        cachedData &&
        Array.isArray(cachedData.data) &&
        cachedData.data.length > 0,
      ),
  });

  const customers = clients?.data ?? [];

  // Sync customers list when data changes
  useMemo(() => {
    setCustomersList(customers);
  }, [customers]);

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
      pathname: "/(commerce)/client-details",
      params: { clientData: JSON.stringify(client) },
    });
  };

  const handleCreateCotation = (clientItem: client) => {
    Alert.alert("Cotation", `Créer une cotation pour ${clientItem.nom}`);
  };

  const handleCreateContrat = (clientItem: client) => {
    router.push({
      pathname: "/(commerce)/contrats",
      params: { mode: "create", clientData: JSON.stringify(clientItem) },
    });
  };

  const handleAddVehicule = (clientItem: client) => {
    router.push({
      pathname: "/(commerce)/vehicule-form",
      params: {
        mode: "create",
        clientData: JSON.stringify(clientItem),
        returnTo: "vehicules",
      },
    });
  };

  const getClientTypeLabel = (type?: number) => {
    if (type === 2) return "Personne morale";
    return "Personne physique";
  };

  const handleSubmitClient = (
    data: Partial<client>,
    mode: "create" | "edit",
    selectedClient?: client,
  ) => {
    if (!data.nom || !data.prenom) {
      Alert.alert("Erreur", "Le nom et le prénom sont obligatoires");
      return;
    }

    if (mode === "edit" && selectedClient) {
      // Edit existing client
      const updatedList = customersList.map((c) =>
        c.id === selectedClient.id ? { ...c, ...data } : c
      );
      setCustomersList(updatedList);
    } else {
      // Add new client
      const newClient: client = {
        id: Math.max(...customersList.map((c) => c.id), 0) + 1,
        ...data,
      } as client;
      setCustomersList([...customersList, newClient]);
    }
  };

  const handleDeleteClient = (client: client) => {
    Alert.alert(
      "Confirmation",
      `Êtes-vous sûr de vouloir supprimer ${client.nom}?`,
      [
        { text: "Annuler", onPress: () => {} },
        {
          text: "Supprimer",
          onPress: () => {
            setCustomersList(customersList.filter((c) => c.id !== client.id));
          },
          style: "destructive",
        },
      ]
    );
  };

  // Filter customers based on search
  const filteredCustomers = customersList.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchText.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchText.toLowerCase())) ||
      (c.prenom && c.prenom.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Customers" />
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
        {filteredCustomers?.map((item) => {
          const isActive = item.statut === "Active";

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
                  <View style={[styles.logo, { borderColor: "#E6E8F1" }]}>
                    <ThemedText style={styles.logoText}>
                      {item.nom
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </ThemedText>
                  </View>
                  <View>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.companyName}
                    >
                      {item.nom}
                    </ThemedText>
                    <View style={styles.companyMetaRow}>
                      <ThemedText
                        style={[styles.companyMeta, { color: mutedText }]}
                      >
                        Code : {item.code}
                      </ThemedText>
                      <View style={[styles.typePill, { backgroundColor: softBlock }]}> 
                        <ThemedText style={[styles.typePillText, { color: mutedText }]}> 
                          {getClientTypeLabel(item.type)}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <Pressable
                    style={[styles.actionIcon, { backgroundColor: softBlock }]}
                    onPress={() => handleOpenEditClient(item)}
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
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={15}
                      color={isDark ? "#DCE0F8" : "#707792"}
                    />
                  </Pressable>
                  <Pressable
                    style={[styles.actionIcon, { backgroundColor: softBlock }]}
                    onPress={() => handleOpenClientDetails(item)}
                  >
                    <MaterialIcons
                      name="person-outline"
                      size={15}
                      color={isDark ? "#DCE0F8" : "#707792"}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
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
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logoText: {
    fontSize: 14,
    fontWeight: "700",
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
