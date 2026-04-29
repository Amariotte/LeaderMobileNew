import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useCachedResource } from "@/hooks/use-cached-resource";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAllProduits, getfetchClients } from "@/services/api-service";
import {
    CLIENTS_LIST_CACHE_KEY,
    PRODUITS_LIST_CACHE_KEY,
} from "@/services/cache-service";
import { formatNumber } from "@/tools/tools";
import { listClients } from "@/types/client.type";
import { listProduits } from "@/types/produits.type";

type SaleLine = {
  id: string;
  productId: string | null;
  quantity: string;
};

function makeLine(): SaleLine {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    productId: null,
    quantity: "1",
  };
}

export default function VenteSaisieScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [saleLines, setSaleLines] = useState<SaleLine[]>([makeLine()]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [productModalForLineId, setProductModalForLineId] = useState<
    string | null
  >(null);
  const [clientQuery, setClientQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");

  const pageBackground = isDark ? "#11131A" : "#F7F7FB";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const mutedText = isDark ? "#9EA3BA" : "#868A9F";
  const lineBorder = isDark ? "#363A4D" : "#E6E8F2";

  const initialClients = useMemo<listClients>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const initialProduits = useMemo<listProduits>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const { data: clientsData } = useCachedResource<listClients>({
    cacheKey: CLIENTS_LIST_CACHE_KEY,
    initialData: initialClients,
    enabled: Boolean(userToken),
    fetcher: async () => getfetchClients(userToken ?? ""),
    hasUsableCachedData: (cachedData) =>
      Boolean(cachedData && Array.isArray(cachedData.data)),
  });

  const { data: produitsData } = useCachedResource<listProduits>({
    cacheKey: PRODUITS_LIST_CACHE_KEY,
    initialData: initialProduits,
    enabled: Boolean(userToken),
    fetcher: async () => getAllProduits(userToken ?? ""),
    hasUsableCachedData: (cachedData) =>
      Boolean(cachedData && Array.isArray(cachedData.data)),
  });

  const selectedClient =
    clientsData.data.find((c) => c.id === selectedClientId) ?? null;

  const lineTotals = saleLines.map((line) => {
    const produit = produitsData.data.find((p) => p.id === line.productId);
    const qty = Number(line.quantity);
    const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 0;

    return (produit?.prixVenteTTC ?? 0) * safeQty;
  });

  const totalVente = lineTotals.reduce((acc, value) => acc + value, 0);

  const filteredClients = clientsData.data.filter((client) => {
    const query = clientQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      client.nom.toLowerCase().includes(query) ||
      client.code.toLowerCase().includes(query)
    );
  });

  const filteredProduits = produitsData.data.filter((produit) => {
    const query = productQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      produit.designation.toLowerCase().includes(query) ||
      produit.reference.toLowerCase().includes(query)
    );
  });

  const setLineField = (
    lineId: string,
    patch: Partial<Pick<SaleLine, "productId" | "quantity">>,
  ) => {
    setSaleLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => {
    setSaleLines((prev) => [...prev, makeLine()]);
  };

  const removeLine = (lineId: string) => {
    setSaleLines((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      return prev.filter((line) => line.id !== lineId);
    });
  };

  const handleSave = () => {
    if (!selectedClientId) {
      Alert.alert("Client requis", "Veuillez selectionner un client.");
      return;
    }

    const hasValidLine = saleLines.some((line) => {
      const qty = Number(line.quantity);
      return Boolean(line.productId) && Number.isFinite(qty) && qty > 0;
    });

    if (!hasValidLine) {
      Alert.alert(
        "Produits requis",
        "Ajoutez au moins un produit avec une quantite valide.",
      );
      return;
    }

    Alert.alert("Vente enregistree", "La saisie de vente est prete.", [
      {
        text: "OK",
        onPress: () => router.replace("/ventes"),
      },
    ]);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Nouvelle vente" />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBackground,
              shadowColor: "#10131F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.22 : 0.08,
              shadowRadius: 18,
              elevation: 3,
            },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Client
          </ThemedText>

          <Pressable
            onPress={() => setClientModalOpen(true)}
            style={[
              styles.comboField,
              { borderColor: lineBorder, backgroundColor: softBlock },
            ]}
          >
            <ThemedText
              style={[
                styles.comboText,
                { color: selectedClient ? "#2E3248" : mutedText },
              ]}
            >
              {selectedClient ? selectedClient.nom : "Selectionner un client"}
            </ThemedText>
            <MaterialIcons name="expand-more" size={20} color={mutedText} />
          </Pressable>

          {selectedClient ? (
            <View style={styles.clientMeta}>
              <ThemedText style={[styles.metaText, { color: mutedText }]}>
                Tel: {selectedClient.tel || "-"}
              </ThemedText>
              <ThemedText style={[styles.metaText, { color: mutedText }]}>
                Email: {selectedClient.email || "-"}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: cardBackground,
              shadowColor: "#10131F",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.22 : 0.08,
              shadowRadius: 18,
              elevation: 3,
            },
          ]}
        >
          <View style={styles.linesTopRow}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Produits
            </ThemedText>
            <Pressable onPress={addLine} style={styles.addLineButton}>
              <MaterialIcons name="add" size={16} color="#FFFFFF" />
              <ThemedText style={styles.addLineText}>Ajouter</ThemedText>
            </Pressable>
          </View>

          {saleLines.map((line, index) => {
            const produit =
              produitsData.data.find((p) => p.id === line.productId) ?? null;
            const qtyNumber = Number(line.quantity);
            const safeQty =
              Number.isFinite(qtyNumber) && qtyNumber > 0 ? qtyNumber : 0;
            const lineTotal = (produit?.prixVenteTTC ?? 0) * safeQty;

            return (
              <View
                key={line.id}
                style={[styles.lineCard, { borderColor: lineBorder }]}
              >
                <View style={styles.lineHeader}>
                  <ThemedText style={styles.lineTitle}>
                    Ligne {index + 1}
                  </ThemedText>
                  <Pressable onPress={() => removeLine(line.id)}>
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color={mutedText}
                    />
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => setProductModalForLineId(line.id)}
                  style={[
                    styles.comboField,
                    { borderColor: lineBorder, backgroundColor: softBlock },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.comboText,
                      { color: produit ? "#2E3248" : mutedText },
                    ]}
                  >
                    {produit ? produit.designation : "Selectionner un produit"}
                  </ThemedText>
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color={mutedText}
                  />
                </Pressable>

                <View style={styles.qtyRow}>
                  <TextInput
                    value={line.quantity}
                    onChangeText={(text) =>
                      setLineField(line.id, {
                        quantity: text.replace(/[^0-9.]/g, ""),
                      })
                    }
                    keyboardType="numeric"
                    placeholder="Quantite"
                    placeholderTextColor="#A0A5BC"
                    style={[
                      styles.qtyInput,
                      { borderColor: lineBorder, backgroundColor: softBlock },
                    ]}
                  />

                  <View
                    style={[styles.priceBadge, { backgroundColor: softBlock }]}
                  >
                    <ThemedText style={styles.priceBadgeText}>
                      {formatNumber(lineTotal)} FCFA
                    </ThemedText>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.totalCard, { backgroundColor: cardBackground }]}>
          <ThemedText type="defaultSemiBold" style={styles.totalLabel}>
            Total vente
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.totalValue}>
            {formatNumber(totalVente)} FCFA
          </ThemedText>
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
          <ThemedText style={styles.saveText}>Enregistrer la vente</ThemedText>
        </Pressable>
      </ScrollView>

      <Modal visible={clientModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalOverlayTouch}
            onPress={() => setClientModalOpen(false)}
          />

          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
                Catalogue clients
              </ThemedText>
              <Pressable onPress={() => setClientModalOpen(false)}>
                <MaterialIcons name="close" size={26} color="#6C7088" />
              </Pressable>
            </View>

            <View style={styles.sheetSearchWrap}>
              <MaterialIcons name="search" size={18} color="#A0A5BC" />
              <TextInput
                value={clientQuery}
                onChangeText={setClientQuery}
                placeholder="Rechercher un client..."
                placeholderTextColor="#A0A5BC"
                style={styles.sheetSearchInput}
              />
            </View>

            <ScrollView
              style={styles.sheetList}
              showsVerticalScrollIndicator={false}
            >
              {filteredClients.map((client) => (
                <View key={client.id} style={styles.sheetRow}>
                  <View style={styles.sheetRowTextWrap}>
                    <ThemedText style={styles.sheetRowTitle}>
                      {client.nom}
                    </ThemedText>
                    <ThemedText style={styles.sheetRowPrice}>
                      {client.code}
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => {
                      setSelectedClientId(client.id);
                      setClientModalOpen(false);
                    }}
                    style={styles.sheetAddButton}
                  >
                    <MaterialIcons
                      name="add-circle-outline"
                      size={30}
                      color="#0F6B5B"
                    />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(productModalForLineId)}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalOverlayTouch}
            onPress={() => setProductModalForLineId(null)}
          />

          <View style={styles.bottomSheetCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
                Catalogue produits
              </ThemedText>
              <Pressable onPress={() => setProductModalForLineId(null)}>
                <MaterialIcons name="close" size={26} color="#6C7088" />
              </Pressable>
            </View>

            <View style={styles.sheetSearchWrap}>
              <MaterialIcons name="search" size={18} color="#A0A5BC" />
              <TextInput
                value={productQuery}
                onChangeText={setProductQuery}
                placeholder="Rechercher par designation, reference..."
                placeholderTextColor="#A0A5BC"
                style={styles.sheetSearchInput}
              />
            </View>

            <ScrollView
              style={styles.sheetList}
              showsVerticalScrollIndicator={false}
            >
              {filteredProduits.map((produit) => (
                <View key={produit.id} style={styles.sheetRow}>
                  <View style={styles.sheetRowTextWrap}>
                    <ThemedText style={styles.sheetRowTitle}>
                      {produit.designation}
                    </ThemedText>
                    <ThemedText style={styles.sheetRowPrice}>
                      {formatNumber(produit.prixVenteTTC)} FCFA
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() => {
                      if (productModalForLineId) {
                        setLineField(productModalForLineId, {
                          productId: produit.id,
                        });
                      }
                      setProductModalForLineId(null);
                    }}
                    style={styles.sheetAddButton}
                  >
                    <MaterialIcons
                      name="add-circle-outline"
                      size={30}
                      color="#0F6B5B"
                    />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
  },
  comboField: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  comboText: {
    flex: 1,
    fontSize: 14,
  },
  clientMeta: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  linesTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addLineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6B3CFF",
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  addLineText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  lineCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  lineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lineTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyInput: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  priceBadge: {
    minWidth: 120,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  totalCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 15,
  },
  totalValue: {
    fontSize: 20,
  },
  saveButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#6B3CFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 20, 30, 0.42)",
    justifyContent: "flex-end",
  },
  modalOverlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "78%",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E3E6EE",
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 22,
    color: "#22273A",
  },
  sheetSearchWrap: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E5ED",
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sheetSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#2D3348",
  },
  sheetList: {
    maxHeight: 430,
  },
  sheetRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E9EBF3",
    paddingVertical: 8,
  },
  sheetRowTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  sheetRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E2336",
  },
  sheetRowPrice: {
    fontSize: 15,
    color: "#0F6B5B",
    fontWeight: "700",
    marginTop: 2,
  },
  sheetAddButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
