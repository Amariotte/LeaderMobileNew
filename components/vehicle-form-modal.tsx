import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { TYPES_PERSONNES } from "@/constants/constants";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getfetchParametres } from "@/services/api-service";
import COLORS from "@/styles/colors";
import { client } from "@/types/client.type";
import { itemDefaut, params } from "@/types/other.type";
import { VehicleFormData, vehicule } from "@/types/vehicule.type";

type VehicleFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<vehicule>) => void;
  initialVehicle?: vehicule;
  selectedClient?: client;
  title: string;
};

type VehicleFormTab = "caracteristiques" | "parametres" | "conducteur";


const CLIENT_TYPES = TYPES_PERSONNES;
const GENRES: itemDefaut[] = [];
const VEHICLE_TYPES: itemDefaut[] = [];
const CARROSSERIES: itemDefaut[] = [];
const ENERGIES: itemDefaut[] = [];
const USAGES: itemDefaut[] = [];
const CATEGORIES: itemDefaut[] = [];
const SOUS_CATEGORIES: itemDefaut[] = [];
const VILLES: itemDefaut[] = [];
const ZONES: itemDefaut[] = [];
const MARQUES: itemDefaut[] = [];
const COULEURS: itemDefaut[] = [];
const PROFESSIONS: itemDefaut[] = [];

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
  const { userToken } = useAuthContext();
  const [activeTab, setActiveTab] = useState<VehicleFormTab>("caracteristiques");
  const [genreOptions, setGenreOptions] = useState<itemDefaut[]>(GENRES);
  const [typeOptions, setTypeOptions] = useState<itemDefaut[]>(VEHICLE_TYPES);
  const [carrosserieOptions, setCarrosserieOptions] = useState<itemDefaut[]>(CARROSSERIES);
  const [energieOptions, setEnergieOptions] = useState<itemDefaut[]>(ENERGIES);
  const [usageOptions, setUsageOptions] = useState<itemDefaut[]>(USAGES);
  const [villeOptions, setVilleOptions] = useState<itemDefaut[]>(VILLES);
  const [zoneOptions, setZoneOptions] = useState<itemDefaut[]>(ZONES);
  const [marqueOptions, setMarqueOptions] = useState<itemDefaut[]>(MARQUES);
  const [couleurOptions, setCouleurOptions] = useState<itemDefaut[]>(COULEURS);
  const [professionOptions, setProfessionOptions] = useState<itemDefaut[]>(PROFESSIONS);

  const [formData, setFormData] = useState<VehicleFormData>({
    numImmatriculation: initialVehicle?.numImmatriculation ?? "",
    dateImmatriculation: initialVehicle?.dateImmatriculation
      ? String(initialVehicle.dateImmatriculation)
      : "",
    dateMiseEnCirculation: initialVehicle?.dateMiseEnCirculation
      ? String(initialVehicle.dateMiseEnCirculation)
      : "",
    numMoteur: initialVehicle?.numMoteur ?? "",
    numSerie: initialVehicle?.numSerie ?? "",
    numCarteGrise: initialVehicle?.numCarteGrise ?? "",
    nbPlaces: initialVehicle?.nbPlaces ?? 0,
    chargeUtile: initialVehicle?.chargeUtile ?? 0,
    cylindree: initialVehicle?.cylindree ?? 0,
    puissance: initialVehicle?.puissance ?? 0,
    valeurNeuve: initialVehicle?.valeurNeuve ?? 0,
    valeurVenale: initialVehicle?.valeurVenale ?? 0,
    modele: initialVehicle?.modele ?? "",
    typeCommercial: initialVehicle?.typeCommercial ?? "",
    nbCartes: initialVehicle?.nbCartes ?? 0,
    commentaires: initialVehicle?.commentaires ?? "",
    luiMemeAssure: initialVehicle?.luiMemeAssure ?? true,
    usageId: initialVehicle?.usageId ?? 0,
    groupeZoneId: initialVehicle?.groupeZoneId ?? 0,
    genreId: initialVehicle?.genreId ?? 0,
    typeId: initialVehicle?.typeId ?? 0,
    carrosserieId: initialVehicle?.carrosserieId ?? 0,
    energieId: initialVehicle?.energieId ?? 0,
    marqueId: initialVehicle?.marqueId ?? 0,
    couleurId: initialVehicle?.couleurId ?? 0,
    categorieId: initialVehicle?.categorieId ?? 0,
    sousCategorieId: initialVehicle?.sousCategorieId ?? 0,
    villeId: initialVehicle?.villeId ?? 0,
    clientId: selectedClient?.id ?? 0,
    zoneCirculationId: initialVehicle?.zoneCirculationId ?? 0,
    assure: initialVehicle?.assure ?? {
      nom: "",
      email: "",
      typeId: 1,
      professionId: 0,
      tel: "",
      bP: "",
      libProfession: "",
    },
  });

  useEffect(() => {
    if (!visible || !userToken) return;

    getfetchParametres(userToken, [
      params.GENRES,
      params.TYPES,
      params.CARROSSERIES,
      params.ENERGIES,
      params.USAGES,
      params.MARQUES,
      params.COULEURS,
      params.PROFESSIONS,
      params.ZONES_CIRCULATIONS,
      params.GROUPES_ZONES,
    ])
      .then((payload) => {
        setGenreOptions(payload.genres?.data ?? GENRES);
        setTypeOptions(payload.types?.data ?? VEHICLE_TYPES);
        setCarrosserieOptions(payload.carrosseries?.data ?? CARROSSERIES);
        setEnergieOptions(payload.energies?.data ?? ENERGIES);
        setUsageOptions(payload.usages?.data ?? USAGES);
        setMarqueOptions(payload.marques?.data ?? MARQUES);
        setCouleurOptions(payload.couleurs?.data ?? COULEURS);
        setProfessionOptions(payload.professions?.data ?? PROFESSIONS);
        setZoneOptions(payload.zonesCirculations?.data ?? ZONES);
        setVilleOptions(payload.groupesZones?.data ?? VILLES);
      })
      .catch(() => {
        setGenreOptions(GENRES);
        setTypeOptions(VEHICLE_TYPES);
        setCarrosserieOptions(CARROSSERIES);
        setEnergieOptions(ENERGIES);
        setUsageOptions(USAGES);
        setMarqueOptions(MARQUES);
        setCouleurOptions(COULEURS);
        setProfessionOptions(PROFESSIONS)
        setZoneOptions(ZONES);
        setVilleOptions(VILLES);
      });
  }, [userToken, visible]);

  useEffect(() => {
    if (!initialVehicle) return;
    const withFallback = (value: string, options: string[]) =>
      options.length === 0 ? value : options.includes(value) ? value : options[0];

    setFormData((prev) => ({
      ...prev,
    }));
  }, [
    carrosserieOptions,
    couleurOptions,
    energieOptions,
    genreOptions,
    marqueOptions,
    professionOptions,
    typeOptions,
    usageOptions,
    villeOptions,
    zoneOptions,
    initialVehicle,
  ]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#D7DCE8";
  const textColor = isDark ? "#FFFFFF" : "#1E2330";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F4F5F9";

  const clientType = useMemo(() => {
    if (!selectedClient) return CLIENT_TYPES[0];
    return selectedClient.typeId === 2 ? CLIENT_TYPES[1] : CLIENT_TYPES[0];
  }, [selectedClient]);

  const updateField = <K extends keyof VehicleFormData>(key: K, value: VehicleFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const cycleOption = <K extends keyof VehicleFormData>(
    labelKey: K,
    options: itemDefaut[],
    idKey?: keyof VehicleFormData,
  ) => {
    if (options.length === 0) return;
    const current = String(formData[labelKey] ?? "");
    const currentIndex = Math.max(0, options.findIndex((item) => item.libelle === current));
    const nextIndex = (currentIndex + 1) % options.length;
    const selected = options[nextIndex];
    updateField(labelKey, selected.libelle as VehicleFormData[K]);
    if (idKey !== undefined) {
      updateField(idKey, selected.id as VehicleFormData[typeof idKey]);
    }
  };

  const handleSubmit = () => {
    if (!formData.numImmatriculation.trim()) return;

    const dataToSubmit: Partial<vehicule> = {
      ...formData,
      dateImmatriculation: formData.dateImmatriculation ? new Date(formData.dateImmatriculation) : undefined,
      dateMiseEnCirculation: formData.dateMiseEnCirculation ? new Date(formData.dateMiseEnCirculation) : undefined,
    };
    onSubmit(dataToSubmit);
    onClose();
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
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
    value: string | number,
    onChangeText: (value: string) => void,
    placeholder = "",
    keyboardType: "default" | "numeric" | "phone-pad" = "default",
  ) => (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <TextInput
        value={String(value)}
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
    value: string | undefined,
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
                selectedClient ? `${selectedClient.nom} ${selectedClient.prenoms ?? ""}`.trim() : "",
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
                    {renderInput("Date d'immatriculation *", formData.dateImmatriculation ?? "", (v) => updateField("dateImmatriculation", v), "jj/mm/aaaa")}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("Genre", formData.libGenre, () => cycleOption("libGenre", genreOptions, "genreId"))}
                    {renderSelect("Type", formData.libType, () => cycleOption("libType", typeOptions, "typeId"))}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("Carrosserie", formData.libCarrosserie, () => cycleOption("libCarrosserie", carrosserieOptions, "carrosserieId"))}
                    {renderSelect("Energie", formData.libEnergie, () => cycleOption("libEnergie", energieOptions, "energieId"))}
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Date 1re mise en circulation *", formData.dateMiseEnCirculation ?? "", (v) => updateField("dateMiseEnCirculation", v), "jj/mm/aaaa")}
                    {renderSelect("Marque", formData.libMarque, () => cycleOption("libMarque", marqueOptions, "marqueId"))}
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Numéro de série", formData.numSerie, (v) => updateField("numSerie", v))}
                    {renderInput("N° carte grise", formData.numCarteGrise, (v) => updateField("numCarteGrise", v))}
                  </View>
                  <View style={styles.row3}>
                    {renderInput("Nombre de places", formData.nbPlaces, (v) => updateField("nbPlaces", parseInt(v) || 0), "0", "numeric")}
                    {renderInput("Charge utile", formData.chargeUtile, (v) => updateField("chargeUtile", parseInt(v) || 0), "0", "numeric")}
                    {renderInput("Cylindrée", formData.cylindree, (v) => updateField("cylindree", parseInt(v) || 0), "0", "numeric")}
                  </View>
                  <View style={styles.row3}>
                    {renderInput("Valeur neuve", formData.valeurNeuve, (v) => updateField("valeurNeuve", parseInt(v) || 0), "0", "numeric")}
                    {renderInput("Valeur vénale", formData.valeurVenale, (v) => updateField("valeurVenale", parseInt(v) || 0), "0", "numeric")}
                    {renderInput("Puissance", formData.puissance, (v) => updateField("puissance", parseInt(v) || 0), "0", "numeric")}
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
                    {renderSelect("Usage", formData.libUsage, () => cycleOption("libUsage", usageOptions, "usageId"))}
                    {renderSelect("Catégorie", formData.libCategorie, () => cycleOption("libCategorie", CATEGORIES, "categorieId"))}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("S/Catégorie", formData.libSousCategorie, () => cycleOption("libSousCategorie", SOUS_CATEGORIES, "sousCategorieId"))}
                    {renderSelect("Ville de circulation", formData.libVille, () => cycleOption("libVille", villeOptions, "villeId"))}
                  </View>
                  <View style={styles.row2}>
                    {renderSelect("Zone de circulation", formData.libZoneCirculation, () => cycleOption("libZoneCirculation", zoneOptions, "zoneCirculationId"))}
                    {renderInput("Nombre de cartes", formData.nbCartes, (v) => updateField("nbCartes", parseInt(v) || 0), "0", "numeric")}
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
                    {renderSelect("Type", String(formData.assure?.typeId ?? 1), () => {
                      const newType = formData.assure?.typeId === 1 ? 2 : 1;
                      const base = formData.assure ?? { nom: "", email: "" };
                      updateField("assure", { ...base, typeId: newType });
                    })}
                    <Pressable
                      style={styles.checkboxRow}
                      onPress={() => updateField("luiMemeAssure", !formData.luiMemeAssure)}
                    >
                      <View style={[styles.checkbox, { borderColor }]}>
                        {formData.luiMemeAssure && <View style={styles.checkboxDot} />}
                      </View>
                      <ThemedText style={{ color: textColor }}>Le client lui-même est l&apos;assuré</ThemedText>
                    </Pressable>
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Nom de l'assuré", formData.assure?.nom ?? "", (v) => {
                      const base = formData.assure ?? { nom: "", email: "" };
                      updateField("assure", { ...base, nom: v });
                    })}
                    {renderInput("Téléphone", formData.assure?.tel ?? "", (v) => {
                      const base = formData.assure ?? { nom: "", email: "" };
                      updateField("assure", { ...base, tel: v });
                    }, "+225 xx xx xx xx", "phone-pad")}
                  </View>
                  <View style={styles.row2}>
                    {renderInput("Email", formData.assure?.email ?? "", (v) => {
                      const base = formData.assure ?? { nom: "", email: "" };
                      updateField("assure", { ...base, email: v });
                    }, "email@example.com")}
                    {renderInput("Boite postale", formData.assure?.bP ?? "", (v) => {
                      const base = formData.assure ?? { nom: "", email: "" };
                      updateField("assure", { ...base, bP: v });
                    })}
                  </View>
                  {renderSelect(
                    "Profession",
                    formData.assure?.libProfession ?? "",
                    () => {
                      if (professionOptions.length === 0) return;
                      const current = formData.assure?.libProfession ?? "";
                      const currentIndex = Math.max(0, professionOptions.findIndex((o) => o.libelle === current));
                      const nextIndex = (currentIndex + 1) % professionOptions.length;
                      const selected = professionOptions[nextIndex];
                      const base = formData.assure ?? { nom: "", email: "" };
                      updateField("assure", { ...base, libProfession: selected.libelle, professionId: selected.id });
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


