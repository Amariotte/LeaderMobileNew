import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { professionsFakeData } from "@/data/datas.fake";
import { useColorScheme } from "@/hooks/use-color-scheme";
import COLORS from "@/styles/colors";
import { client } from "@/types/client.type";
import { vehicule } from "@/types/vehicule.type";

type VehicleFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<vehicule>) => void;
  initialVehicle?: vehicule;
  selectedClient?: client;
  title: string;
};

type VehicleFormTab = "caracteristiques" | "parametres" | "conducteur";

type VehicleFormData = {
  numImmatriculation: string;
  dateImmatriculation: string;
  dateMiseEnCirculation: string;
  libGenre: string;
  libType: string;
  libCarrosserie: string;
  libEnergie: string;
  libUsage: string;
  libCategorie: string;
  libSousCategorie: string;
  libVille: string;
  libZoneCirculation: string;
  libMarque: string;
  libCouleur: string;
  numSerie: string;
  numCarteGrise: string;
  nbPlaces: string;
  chargeUtile: string;
  cylindree: string;
  puissance: string;
  valeurNeuve: string;
  valeurVenale: string;
  modele: string;
  typeCommercial: string;
  nbCartes: string;
  commentaires: string;
  conducteurLuiMeme: boolean;
  libTypeConducteur: string;
  nomConducteur: string;
  telConducteur: string;
  emailConducteur: string;
  boitePostaleConducteur: string;
  libProfessionConducteur: string;
};

const CLIENT_TYPES = ["PERSONNE PHYSIQUE", "PERSONNE MORALE"];
const GENRES = ["Tourisme", "Utilitaire", "Camion", "Moto"];
const VEHICLE_TYPES = ["VP", "VUL", "PL", "Moto"];
const CARROSSERIES = ["Berline", "SUV", "Break", "Pickup"];
const ENERGIES = ["Essence", "Diesel", "Hybride", "Electrique"];
const USAGES = ["Affaire", "Personnel", "Transport", "Mixte"];
const CATEGORIES = ["Nouvelle affaire", "Renouvellement", "Avenant"];
const SOUS_CATEGORIES = ["Standard", "Premium", "Entreprise"];
const VILLES = ["Abidjan", "Yamoussoukro", "Bouake"];
const ZONES = ["Urbain", "Inter-urbain", "National"];
const MARQUES = ["Toyota", "Hyundai", "Peugeot", "Renault"];
const COULEURS = ["Blanc", "Noir", "Gris", "Bleu"];
const CONDUCTEUR_TYPES = ["PERSONNE PHYSIQUE", "PERSONNE MORALE"];

function formatDate(value?: Date) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const day = `${d.getDate()}`.padStart(2, "0");
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(value: string, fallback?: Date) {
  const parts = value.split("/");
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    const parsed = new Date(year, month - 1, day);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback ?? new Date();
}

function toNumber(value: string, fallback = 0) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export default function VehicleFormModal({
  visible,
  onClose,
  onSubmit,
  initialVehicle,
  selectedClient,
  title,
}: VehicleFormModalProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const [activeTab, setActiveTab] = useState<VehicleFormTab>("caracteristiques");

  const [formData, setFormData] = useState<VehicleFormData>({
    numImmatriculation: initialVehicle?.numImmatriculation ?? "",
    dateImmatriculation: formatDate(initialVehicle?.dateImmatriculation),
    dateMiseEnCirculation: formatDate(initialVehicle?.dateMiseEnCirculation),
    libGenre: initialVehicle?.libGenre ?? GENRES[0],
    libType: initialVehicle?.libType ?? VEHICLE_TYPES[0],
    libCarrosserie: initialVehicle?.libCarrosserie ?? CARROSSERIES[0],
    libEnergie: initialVehicle?.libEnergie ?? ENERGIES[0],
    libUsage: initialVehicle?.libUsage ?? USAGES[0],
    libCategorie: initialVehicle?.libCategorie ?? CATEGORIES[0],
    libSousCategorie: initialVehicle?.libSousCategorie ?? SOUS_CATEGORIES[0],
    libVille: initialVehicle?.libVille ?? VILLES[0],
    libZoneCirculation: initialVehicle?.libZoneCirculation ?? ZONES[0],
    libMarque: initialVehicle?.libMarque ?? MARQUES[0],
    libCouleur: initialVehicle?.libCouleur ?? COULEURS[0],
    numSerie: initialVehicle?.numSerie ?? "",
    numCarteGrise: initialVehicle?.numCarteGrise ?? "",
    nbPlaces: `${initialVehicle?.nbPlaces ?? 0}`,
    chargeUtile: `${initialVehicle?.chargeUtile ?? 0}`,
    cylindree: `${initialVehicle?.cylindree ?? 0}`,
    puissance: `${initialVehicle?.puissance ?? 0}`,
    valeurNeuve: `${initialVehicle?.valeurNeuve ?? 0}`,
    valeurVenale: `${initialVehicle?.valeurVenale ?? 0}`,
    modele: initialVehicle?.modele ?? "",
    typeCommercial: initialVehicle?.typeCommercial ?? "",
    nbCartes: `${initialVehicle?.nbCartes ?? 0}`,
    commentaires: initialVehicle?.commentaires ?? "",
    conducteurLuiMeme: initialVehicle?.conducteurLuiMeme ?? true,
    libTypeConducteur: initialVehicle?.libTypeConducteur ?? CONDUCTEUR_TYPES[0],
    nomConducteur: initialVehicle?.nomConducteur ?? "",
    telConducteur: initialVehicle?.telConducteur ?? "",
    emailConducteur: initialVehicle?.emailConducteur ?? "",
    boitePostaleConducteur: initialVehicle?.boitePostaleConducteur ?? "",
    libProfessionConducteur:
      initialVehicle?.libProfessionConducteur ?? professionsFakeData[0]?.libelle ?? "",
  });

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#D7DCE8";
  const textColor = isDark ? "#FFFFFF" : "#1E2330";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F4F5F9";

  const clientType = useMemo(() => {
    if (!selectedClient) return CLIENT_TYPES[0];
    return selectedClient.type === 2 ? CLIENT_TYPES[1] : CLIENT_TYPES[0];
  }, [selectedClient]);

  const updateField = <K extends keyof VehicleFormData>(key: K, value: VehicleFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const cycleOption = <K extends keyof VehicleFormData>(
    key: K,
    options: string[],
  ) => {
    const current = String(formData[key] ?? "");
    const currentIndex = Math.max(0, options.findIndex((item) => item === current));
    const nextIndex = (currentIndex + 1) % options.length;
    updateField(key, options[nextIndex] as VehicleFormData[K]);
  };

  const handleSubmit = () => {
    if (!formData.numImmatriculation.trim()) return;

    onSubmit({
      id: initialVehicle?.id,
      numImmatriculation: formData.numImmatriculation.trim(),
      dateImmatriculation: parseDate(formData.dateImmatriculation, initialVehicle?.dateImmatriculation),
      dateMiseEnCirculation: parseDate(formData.dateMiseEnCirculation, initialVehicle?.dateMiseEnCirculation),
      numSerie: formData.numSerie,
      numCarteGrise: formData.numCarteGrise,
      nbPlaces: toNumber(formData.nbPlaces),
      chargeUtile: toNumber(formData.chargeUtile),
      cylindree: toNumber(formData.cylindree),
      puissance: toNumber(formData.puissance),
      nbCartes: toNumber(formData.nbCartes),
      valeurNeuve: toNumber(formData.valeurNeuve),
      valeurVenale: toNumber(formData.valeurVenale),
      modele: formData.modele,
      typeCommercial: formData.typeCommercial,
      commentaires: formData.commentaires,
      libGenre: formData.libGenre,
      libType: formData.libType,
      libCarrosserie: formData.libCarrosserie,
      libEnergie: formData.libEnergie,
      libUsage: formData.libUsage,
      libCategorie: formData.libCategorie,
      libSousCategorie: formData.libSousCategorie,
      libVille: formData.libVille,
      libZoneCirculation: formData.libZoneCirculation,
      libMarque: formData.libMarque,
      libCouleur: formData.libCouleur,
      conducteurLuiMeme: formData.conducteurLuiMeme,
      libTypeConducteur: formData.libTypeConducteur,
      nomConducteur: formData.nomConducteur,
      telConducteur: formData.telConducteur,
      emailConducteur: formData.emailConducteur,
      boitePostaleConducteur: formData.boitePostaleConducteur,
      libProfessionConducteur: formData.libProfessionConducteur,
      client: selectedClient,
    });
    onClose();
  };

  const renderTabButton = (tab: VehicleFormTab, label: string) => {
    const active = activeTab === tab;
    return (
      <Pressable
        key={tab}
        style={[
          styles.tabButton,
          {
            backgroundColor: active ? cardBackground : inputBg,
            borderColor,
          },
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <ThemedText
          style={{
            color: active ? COLORS.primaryColor : textColor,
            fontWeight: active ? "700" : "600",
            fontSize: 13,
          }}
        >
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder = "",
    keyboardType: "default" | "numeric" | "phone-pad" = "default",
  ) => (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={labelColor}
        keyboardType={keyboardType}
        style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
      />
    </View>
  );

  const renderSelect = (
    label: string,
    value: string,
    onPress: () => void,
  ) => (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <Pressable
        onPress={onPress}
        style={[styles.select, { backgroundColor: inputBg, borderColor }]}
      >
        <ThemedText style={{ color: textColor, flex: 1 }}>{value || "<Sélectionner ...>"}</ThemedText>
        <MaterialIcons name="expand-more" size={20} color={labelColor} />
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
        <View style={[styles.modal, { backgroundColor: pageBackground }]}> 
          <View style={[styles.header, { backgroundColor: COLORS.primaryColor }]}> 
            <ThemedText style={styles.headerTitle}>{title}</ThemedText>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.topPanel, { backgroundColor: cardBackground, borderColor }]}> 
              <View style={styles.row2}>
                {renderInput("Code", selectedClient?.code ?? "", () => {}, "")}
                {renderSelect("Type", clientType, () => {})}
              </View>
              {renderInput(
                "Nom et prénom(s)",
                selectedClient ? `${selectedClient.nom} ${selectedClient.prenom}`.trim() : "",
                () => {},
                "",
              )}
            </View>

            <View style={styles.tabsRow}>
              {renderTabButton("caracteristiques", "Caractéristiques du véhicule")}
              {renderTabButton("parametres", "Paramètres Techniques Assurances")}
              {renderTabButton("conducteur", "Conducteur habituel")}
            </View>

            <View style={[styles.tabPanel, { backgroundColor: cardBackground, borderColor }]}> 
              {activeTab === "caracteristiques" && (
                <>
                  <View style={styles.row2}>
                    {renderInput("Immatriculation *", formData.numImmatriculation, (v) => updateField("numImmatriculation", v), "AB-123-CD")}
                    {renderInput("Date d'immatriculation *", formData.dateImmatriculation, (v) => updateField("dateImmatriculation", v), "jj/mm/aaaa")}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("Genre", formData.libGenre, () => cycleOption("libGenre", GENRES))}
                    {renderSelect("Type", formData.libType, () => cycleOption("libType", VEHICLE_TYPES))}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("Carrosserie", formData.libCarrosserie, () => cycleOption("libCarrosserie", CARROSSERIES))}
                    {renderSelect("Energie", formData.libEnergie, () => cycleOption("libEnergie", ENERGIES))}
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Date 1re mise en circulation *", formData.dateMiseEnCirculation, (v) => updateField("dateMiseEnCirculation", v), "jj/mm/aaaa")}
                    {renderSelect("Marque", formData.libMarque, () => cycleOption("libMarque", MARQUES))}
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Numéro de série", formData.numSerie, (v) => updateField("numSerie", v))}
                    {renderInput("N° carte grise", formData.numCarteGrise, (v) => updateField("numCarteGrise", v))}
                  </View>
                  <View style={styles.row3}>
                    {renderInput("Nombre de places", formData.nbPlaces, (v) => updateField("nbPlaces", v), "0", "numeric")}
                    {renderInput("Charge utile", formData.chargeUtile, (v) => updateField("chargeUtile", v), "0", "numeric")}
                    {renderInput("Cylindrée", formData.cylindree, (v) => updateField("cylindree", v), "0", "numeric")}
                  </View>
                  <View style={styles.row3}>
                    {renderInput("Valeur neuve", formData.valeurNeuve, (v) => updateField("valeurNeuve", v), "0", "numeric")}
                    {renderInput("Valeur vénale", formData.valeurVenale, (v) => updateField("valeurVenale", v), "0", "numeric")}
                    {renderInput("Puissance", formData.puissance, (v) => updateField("puissance", v), "0", "numeric")}
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Modèle", formData.modele, (v) => updateField("modele", v))}
                    {renderInput("Type commercial", formData.typeCommercial, (v) => updateField("typeCommercial", v))}
                  </View>
                </>
              )}

              {activeTab === "parametres" && (
                <>
                  <View style={styles.row2}>
                    {renderSelect("Usage", formData.libUsage, () => cycleOption("libUsage", USAGES))}
                    {renderSelect("Catégorie", formData.libCategorie, () => cycleOption("libCategorie", CATEGORIES))}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("S/Catégorie", formData.libSousCategorie, () => cycleOption("libSousCategorie", SOUS_CATEGORIES))}
                    {renderSelect("Ville de circulation", formData.libVille, () => cycleOption("libVille", VILLES))}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("Zone de circulation", formData.libZoneCirculation, () => cycleOption("libZoneCirculation", ZONES))}
                    {renderInput("Nombre de cartes", formData.nbCartes, (v) => updateField("nbCartes", v), "0", "numeric")}
                  </View>
                  <View style={styles.field}>
                    <ThemedText style={[styles.label, { color: labelColor }]}>Commentaires</ThemedText>
                    <TextInput
                      multiline
                      numberOfLines={5}
                      value={formData.commentaires}
                      onChangeText={(v) => updateField("commentaires", v)}
                      style={[styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor }]}
                    />
                  </View>
                </>
              )}

              {activeTab === "conducteur" && (
                <>
                  <View style={styles.row2}>
                    {renderSelect("Type", formData.libTypeConducteur, () => cycleOption("libTypeConducteur", CONDUCTEUR_TYPES))}
                    <Pressable
                      style={styles.checkboxRow}
                      onPress={() => updateField("conducteurLuiMeme", !formData.conducteurLuiMeme)}
                    >
                      <View style={[styles.checkbox, { borderColor }]}> 
                        {formData.conducteurLuiMeme && <View style={styles.checkboxDot} />}
                      </View>
                      <ThemedText style={{ color: textColor }}>Le client lui-même est l'assuré</ThemedText>
                    </Pressable>
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Nom de l'assuré", formData.nomConducteur, (v) => updateField("nomConducteur", v))}
                    {renderInput("Téléphone", formData.telConducteur, (v) => updateField("telConducteur", v), "+225 xx xx xx xx", "phone-pad")}
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Email", formData.emailConducteur, (v) => updateField("emailConducteur", v), "email@example.com")}
                    {renderInput("Boite postale", formData.boitePostaleConducteur, (v) => updateField("boitePostaleConducteur", v))}
                  </View>
                  {renderSelect(
                    "Profession",
                    formData.libProfessionConducteur,
                    () => {
                      const options = professionsFakeData.map((p) => p.libelle);
                      cycleOption("libProfessionConducteur", options.length > 0 ? options : [""]);
                    },
                  )}
                </>
              )}
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderColor }]}> 
            <Pressable style={[styles.footerButton, { backgroundColor: COLORS.primaryColor }]} onPress={handleSubmit}>
              <ThemedText style={styles.footerButtonText}>Enregistrer</ThemedText>
            </Pressable>
            <Pressable style={[styles.footerButton, { backgroundColor: "#46506B" }]} onPress={onClose}>
              <ThemedText style={styles.footerButtonText}>Annuler</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  modal: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    height: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 12,
    gap: 10,
  },
  topPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 6,
  },
  tabButton: {
    flex: 1,
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  row2: {
    flexDirection: "row",
    gap: 10,
  },
  row3: {
    flexDirection: "row",
    gap: 10,
  },
  field: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  select: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  checkboxRow: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: COLORS.primaryColor,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerButton: {
    minWidth: 130,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
