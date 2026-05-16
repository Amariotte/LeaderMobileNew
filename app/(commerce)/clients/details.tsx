import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import ClientEditorModal from "@/components/client-editor-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useClientEditorModal } from "@/hooks/use-client-editor-modal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getfetchVehicules } from "@/services/api-service";
import { getLabelCivilite } from "@/tools/tools";
import { client } from "@/types/client.type";
import { vehicule } from "@/types/vehicule.type";

export default function ClientDetailsScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { clientData } = useLocalSearchParams<{ clientData: string }>();
  const [selectedClient, setSelectedClient] = useState<client | undefined>(
    clientData ? JSON.parse(clientData) : undefined
  );
  const [vehiclesList, setVehiclesList] = useState<vehicule[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const { userToken } = useAuthContext();
  const clientEditor = useClientEditorModal({
    createTitle: "Creer un client",
    getEditTitle: (currentClient) => `Modifier ${currentClient.nom}`,
  });

  useEffect(() => {
    if (!userToken || !selectedClient?.id) return;
    setVehiclesLoading(true);
    getfetchVehicules(userToken, selectedClient.id)
      .then((res) => setVehiclesList(res.data ?? []))
      .finally(() => setVehiclesLoading(false));
  }, [userToken, selectedClient?.id]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const accentBg = isDark ? "#242735" : "#F9F9FC";

  const handleOpenEdit = () => {
    if (selectedClient) {
      clientEditor.openEdit(selectedClient);
    }
  };

  const handleSubmitEdit = (data: Partial<client>) => {
    setSelectedClient((prev) => (prev ? { ...prev, ...data } : prev));
    clientEditor.close();
  };

  const handleCreateVehicle = () => {
    router.push({
      pathname: "/(commerce)/vehicules/form",
      params: {
        mode: "create",
        clientData: JSON.stringify(selectedClient),
        returnTo: "vehicules",
      },
    });
  };

  const handleOpenVehicleDetails = (vehicle: vehicule) => {
    router.push({
      pathname: "/(commerce)/vehicules/details",
      params: {
        vehiculeData: JSON.stringify(vehicle),
        clientData: JSON.stringify(selectedClient),
      },
    });
  };

  const handleCreateContract = () => {
    router.push({
      pathname: "/(commerce)/contrats/form",
      params: { mode: "create", clientData: JSON.stringify(selectedClient) },
    });
  };

  if (!selectedClient) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
        <View style={styles.headerWrap}>
          <AppHeaderDrawer title="Détails client" />
        </View>
        <View style={styles.emptyContainer}>
          <ThemedText>Aucun client sélectionné</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const vehiclesClient = vehiclesList;

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value?: string;
  }) => (
    <View style={styles.infoRow}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: accentBg },
        ]}
      >
        <MaterialIcons name={icon as any} size={18} color="#1F8B82" />
      </View>
      <View style={styles.infoContent}>
        <ThemedText style={[styles.infoLabel, { color: labelColor }]}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.infoValue, { color: textColor }]}>
          {value || "—"}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Détails client" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View
          style={[
            styles.headerCard,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <View style={styles.headerTop}>
            <View
              style={[
                styles.avatarLarge,
                { backgroundColor: accentBg, borderColor },
              ]}
            >
              <ThemedText style={styles.avatarText}>
                {selectedClient.nom
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.headerInfo}>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.nameText, { color: textColor }]}
              >
                {selectedClient.nom} {selectedClient.prenoms}
              </ThemedText>
              <ThemedText style={[styles.codeText, { color: labelColor }]}>
                Code : {selectedClient.code}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.headerActions, { gap: 8 }]}>
            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: "#1F8B82" },
              ]}
              onPress={handleOpenEdit}
            >
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              <ThemedText style={[styles.actionButtonText, { color: "#FFFFFF" }]}>
                Modifier
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                { backgroundColor: "#46506B" },
              ]}
              onPress={handleCreateContract}
            >
              <MaterialIcons name="description" size={16} color="#FFFFFF" />
              <ThemedText style={[styles.actionButtonText, { color: "#FFFFFF" }]}>
                Nouveau contrat
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Identity Section */}
        <ThemedText
          type="defaultSemiBold"
          style={[styles.sectionTitle, { color: textColor }]}
        >
          Identité
        </ThemedText>

        <View
          style={[
            styles.card,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <InfoRow
            icon="person"
            label="Nom"
            value={selectedClient.nom}
          />
          <View style={[styles.cardDivider, { borderColor }]} />
          
          {selectedClient.prenoms && (
            <InfoRow
              icon="person"
              label="Prénom"
              value={selectedClient.prenoms}
            />
          )}

          <InfoRow
            icon="badge"
            label="Profession"
            value={selectedClient.professionNom}
          />
          <View style={[styles.cardDivider, { borderColor }]} />
          <InfoRow
            icon="wc"
            label="Civilité"
            value={getLabelCivilite(selectedClient.civilite)}
          />
        </View>


        {/* Contact Section */}
        <ThemedText
          type="defaultSemiBold"
          style={[styles.sectionTitle, { color: textColor }]}
        >
          Contact
        </ThemedText>

        <View
          style={[
            styles.card,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <InfoRow
            icon="phone"
            label="Téléphone"
            value={selectedClient.tel}
          />
          <View style={[styles.cardDivider, { borderColor }]} />
          <InfoRow
            icon="smartphone"
            label="Mobile"
            value={selectedClient.mobile}
          />
          <View style={[styles.cardDivider, { borderColor }]} />
          <InfoRow
            icon="chat"
            label="WhatsApp"
            value={selectedClient.whatsapp}
          />
          <View style={[styles.cardDivider, { borderColor }]} />
          <InfoRow
            icon="email"
            label="Email"
            value={selectedClient.email}
          />
        </View>

        {/* Address Section */}
        <ThemedText
          type="defaultSemiBold"
          style={[styles.sectionTitle, { color: textColor }]}
        >
          Adresse
        </ThemedText>

        <View
          style={[
            styles.card,
            { backgroundColor: cardBackground, borderColor },
          ]}
        >
          <InfoRow
            icon="mail"
            label="Boîte postale"
            value={selectedClient.bp}
          />
        </View>

        {/* Vehicles Section */}
        <View style={styles.vehiclesSectionHeader}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}
          >
            Véhicules {!vehiclesLoading && `(${vehiclesList.length})`}
          </ThemedText>
          <Pressable
            style={[styles.addVehicleButton, { backgroundColor: "#1F8B82" }]}
            onPress={handleCreateVehicle}
          >
            <MaterialIcons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {vehiclesLoading ? (
          <View style={[styles.emptyVehiclesContainer, { backgroundColor: cardBackground, borderColor }]}>
            <ActivityIndicator size="small" color="#1F8B82" />
          </View>
        ) : vehiclesClient.length > 0 ? (
          <View style={styles.vehiclesList}>
            {vehiclesClient.map((vehicle) => (
              <View
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  { backgroundColor: cardBackground, borderColor },
                ]}
              >
                <View style={styles.vehicleHeader}>
                  <View style={styles.vehicleInfo}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[styles.vehicleTitle, { color: textColor }]}
                    >
                      {vehicle.modele || "Sans modèle"}
                    </ThemedText>
                    <ThemedText style={[styles.vehicleSubtitle, { color: labelColor }]}>
                      {vehicle.numImmatriculation}
                    </ThemedText>
                  </View>
                  <View style={styles.vehicleActions}>
                    <Pressable
                      style={[styles.vehicleActionIcon, { backgroundColor: accentBg }]}
                      onPress={() => handleOpenVehicleDetails(vehicle)}
                    >
                      <MaterialIcons name="edit" size={14} color="#1F8B82" />
                    </Pressable>
                    <Pressable
                      style={[styles.vehicleActionIcon, { backgroundColor: accentBg }]}
                      onPress={() => handleOpenVehicleDetails(vehicle)}
                    >
                      <MaterialIcons name="delete-outline" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.vehicleDivider, { borderColor }]} />

                <View style={styles.vehicleDetails}>
                  <View style={styles.detailItem}>
                    <ThemedText style={[styles.detailLabel, { color: labelColor }]}>
                      Type
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: textColor }]}>
                      {vehicle.typeCommercial || "—"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailItem}>
                    <ThemedText style={[styles.detailLabel, { color: labelColor }]}>
                      Puissance
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: textColor }]}>
                      {vehicle.puissance ? `${vehicle.puissance} ch` : "—"}
                    </ThemedText>
                  </View>

                  <View style={styles.detailItem}>
                    <ThemedText style={[styles.detailLabel, { color: labelColor }]}>
                      Places
                    </ThemedText>
                    <ThemedText style={[styles.detailValue, { color: textColor }]}>
                      {vehicle.nbPlaces ?? "—"}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyVehiclesContainer,
              { backgroundColor: cardBackground, borderColor },
            ]}
          >
            <MaterialIcons name="directions-car" size={48} color={labelColor} />
            <ThemedText style={[styles.emptyText, { color: labelColor }]}>
              Aucun véhicule enregistré
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <ClientEditorModal
        controller={clientEditor}
        onSubmit={async (data) => handleSubmitEdit(data)}
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
  scrollContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F8B82",
  },
  headerInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 12,
    color: "#D64545",
  },
  card: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardDivider: {
    height: 1,
    borderWidth: 1,
  },
  vehiclesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 10,
  },
  addVehicleButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  vehiclesList: {
    gap: 10,
    marginBottom: 14,
  },
  vehicleCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 10,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  vehicleSubtitle: {
    fontSize: 12,
  },
  vehicleActions: {
    flexDirection: "row",
    gap: 6,
  },
  vehicleActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleDivider: {
    height: 1,
    borderWidth: 1,
  },
  vehicleDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  detailItem: {
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyVehiclesContainer: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
