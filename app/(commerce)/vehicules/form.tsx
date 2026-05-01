import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import ClientFormModal from "@/components/client-form-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TYPES_PERSONNES } from "@/constants/constants";
import { carroreseriesFakeData, categorieVehiculeFakeData, couleursFakeData, energiesFakeData, genresFakeData, marquesFakeData, professionsFakeData, sousCategoriesFakeData, UsagesFakeData, VehiculeTypesFakeData, villesFakeData, zonesFakeData } from "@/data/datas.fake";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { getfetchClients, getfetchParametres } from "@/services/api-service";
import COLORS from "@/styles/colors";
import { client, listClients } from "@/types/client.type";
import { itemDefaut, params } from "@/types/other.type";
import { vehicule } from "@/types/vehicule.type";

type VehicleSelectField =
  | "libGenre"
  | "libType"
  | "libCarrosserie"
  | "libEnergie"
  | "libUsage"
  | "libCategorie"
  | "libSousCategorie"
  | "libVille"
  | "libZoneCirculation"
  | "libMarque"
  | "libTypeConducteur"
  | "libProfessionConducteur";

type VehicleFormState = {
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
  libGroupeZone: string;
  libZoneCirculation: string;
  libMarque: string;
  libCouleur: string;
  libVille: string;
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

const toNumber = (v: string | number): number => {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

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



const GENRES: itemDefaut[] = genresFakeData;
const USAGES: itemDefaut[] = UsagesFakeData;
const VEHICLE_TYPES: itemDefaut[] = VehiculeTypesFakeData;
const CARROSSERIES: itemDefaut[] = carroreseriesFakeData;
const ENERGIES: itemDefaut[] = energiesFakeData;
const MARQUES: itemDefaut[] = marquesFakeData;
const COULEURS: itemDefaut[] = couleursFakeData;
const CATEGORIES: itemDefaut[] = categorieVehiculeFakeData;
const SOUS_CATEGORIES: itemDefaut[] = sousCategoriesFakeData;
const VILLES: itemDefaut[] = villesFakeData;
const ZONES: itemDefaut[] = zonesFakeData;

function getOptionLabel(option: string | itemDefaut) {
  return typeof option === "string" ? option : option.libelle;
}

function getFirstOptionLabel(options: (string | itemDefaut)[]) {
  return options.length > 0 ? getOptionLabel(options[0]) : "";
}

function normalizeOptions(options: (string | itemDefaut)[]) {
  return options.map(getOptionLabel);
}

export default function VehiculeFormScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();
  const {
    mode,
    vehiculeData,
    clientData,
    returnTo,
  } = useLocalSearchParams<{
    mode?: "create" | "edit";
    vehiculeData?: string;
    clientData?: string;
    returnTo?: "vehicules" | "vehicule-details";
  }>();

  const initialVehicle = useMemo<vehicule>(() => {
    if (!vehiculeData) return undefined;
    try {
      return JSON.parse(vehiculeData);
    } catch {
      return undefined;
    }
  }, [vehiculeData]);

  const initialClient = useMemo<client | undefined>(() => {
    if (!clientData) return undefined;
    try {
      return JSON.parse(clientData);
    } catch {
      return undefined;
    }
  }, [clientData]);

  const initialClients = useMemo<listClients>(
    () => ({
      meta: { page: 1, next: 1, totalPages: 1, total: 0, size: 0 },
      data: [],
    }),
    [],
  );

  const [clientsData, setClientsData] = useState<listClients>(initialClients);
  const [genresOptions, setGenresOptions] = useState<itemDefaut[]>(GENRES);
  const [usagesOptions, setUsagesOptions] = useState<itemDefaut[]>(USAGES);
  const [vehicleTypesOptions, setVehicleTypesOptions] = useState<itemDefaut[]>(VEHICLE_TYPES);
  const [carrosseriesOptions, setCarrosseriesOptions] = useState<itemDefaut[]>(CARROSSERIES);
  const [energiesOptions, setEnergiesOptions] = useState<itemDefaut[]>(ENERGIES);
  const [marquesOptions, setMarquesOptions] = useState<itemDefaut[]>(MARQUES);
  const [couleursOptions, setCouleursOptions] = useState<itemDefaut[]>(COULEURS);
  const [zonesOptions, setZonesOptions] = useState<itemDefaut[]>(ZONES);
  const [villesOptions, setVillesOptions] = useState<itemDefaut[]>(VILLES);
  const [professionsOptions, setProfessionsOptions] = useState<itemDefaut[]>(professionsFakeData);

  useEffect(() => {
    if (!userToken) return;
    getfetchClients(userToken).then(setClientsData);
  }, [userToken]);

  useEffect(() => {
    if (!userToken) return;

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
        setGenresOptions(payload?.genres && payload.genres.length > 0 ? payload.genres : GENRES);
        setVehicleTypesOptions(payload?.types && payload.types.length > 0 ? payload.types : VEHICLE_TYPES);
        setCarrosseriesOptions(payload?.carrosseries && payload.carrosseries.length > 0 ? payload.carrosseries : CARROSSERIES);
        setEnergiesOptions(payload?.energies && payload.energies.length > 0 ? payload.energies : ENERGIES);
        setUsagesOptions(payload?.usages && payload.usages.length > 0 ? payload.usages : USAGES);
        setMarquesOptions(payload?.marques && payload.marques.length > 0 ? payload.marques : MARQUES);
        setCouleursOptions(payload?.couleurs && payload.couleurs.length > 0 ? payload.couleurs : COULEURS);
        setProfessionsOptions(payload?.professions && payload.professions.length > 0 ? payload.professions : professionsFakeData);
        setZonesOptions(payload?.zonesCirculations && payload.zonesCirculations.length > 0 ? payload.zonesCirculations : ZONES);
        setVillesOptions(payload?.groupesZones && payload.groupesZones.length > 0 ? payload.groupesZones : VILLES);
      })
      .catch(() => {
        setGenresOptions(GENRES);
        setVehicleTypesOptions(VEHICLE_TYPES);
        setCarrosseriesOptions(CARROSSERIES);
        setEnergiesOptions(ENERGIES);
        setUsagesOptions(USAGES);
        setMarquesOptions(MARQUES);
        setCouleursOptions(COULEURS);
        setProfessionsOptions(professionsFakeData);
        setZonesOptions(ZONES);
        setVillesOptions(VILLES);
      });
  }, [userToken]);

  const [selectedClient, setSelectedClient] = useState<client | undefined>(initialClient);
  const [localClients, setLocalClients] = useState<client[]>([]);
  const [isClientPickerVisible, setIsClientPickerVisible] = useState(false);
  const [isClientCreateVisible, setIsClientCreateVisible] = useState(false);
  const [isClientEditVisible, setIsClientEditVisible] = useState(false);
  const [clientSearchText, setClientSearchText] = useState("");

  const allClients = useMemo(() => {
    const indexedClients = new Map<number, client>();

    clientsData.data.forEach((currentClient) => {
      indexedClients.set(currentClient.id, currentClient);
    });

    localClients.forEach((currentClient) => {
      indexedClients.set(currentClient.id, currentClient);
    });

    return Array.from(indexedClients.values());
  }, [localClients, clientsData.data]);

  const filteredClients = useMemo(() => {
    const query = clientSearchText.trim().toLowerCase();

    if (!query) return allClients;

    return allClients.filter((currentClient) =>
      currentClient.nom.toLowerCase().includes(query) ||
      currentClient.code?.toLowerCase().includes(query),
    );
  }, [clientSearchText, allClients]);

  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const [pickerState, setPickerState] = useState<{
    visible: boolean;
    field?: VehicleSelectField;
    title: string;
    options: string[];
  }>({
    visible: false,
    title: "",
    options: [],
  });
  const [formData, setFormData] = useState<VehicleFormState>({
    numImmatriculation: initialVehicle?.numImmatriculation ?? "",
    dateImmatriculation: initialVehicle?.dateImmatriculation
      ? new Date(initialVehicle.dateImmatriculation).toLocaleDateString("fr-FR")
      : "",
    dateMiseEnCirculation: initialVehicle?.dateMiseEnCirculation
      ? new Date(initialVehicle.dateMiseEnCirculation).toLocaleDateString("fr-FR")
      : "",
    libGenre: initialVehicle?.libGenre ?? getFirstOptionLabel(GENRES),
    libType: initialVehicle?.libType ?? getFirstOptionLabel(VEHICLE_TYPES),
    libCarrosserie: initialVehicle?.libCarrosserie ?? getFirstOptionLabel(CARROSSERIES),
    libEnergie: initialVehicle?.libEnergie ?? getFirstOptionLabel(ENERGIES),
    libUsage: initialVehicle?.libUsage ?? getFirstOptionLabel(USAGES),
    libCategorie: initialVehicle?.libCategorie ?? getFirstOptionLabel(CATEGORIES),
    libSousCategorie: initialVehicle?.libSousCategorie ?? getFirstOptionLabel(SOUS_CATEGORIES),
    libGroupeZone: initialVehicle?.libGroupeZone ?? getFirstOptionLabel(VILLES),
    libZoneCirculation: initialVehicle?.libZoneCirculation ?? getFirstOptionLabel(ZONES),
    libMarque: initialVehicle?.libMarque ?? getFirstOptionLabel(MARQUES),
    libCouleur: initialVehicle?.libCouleur ?? getFirstOptionLabel(COULEURS),
    libVille: "",
    numSerie: initialVehicle?.numSerie ?? "",
    numCarteGrise: initialVehicle?.numCarteGrise ?? "",
    nbPlaces: String(initialVehicle?.nbPlaces ?? ""),
    chargeUtile: String(initialVehicle?.chargeUtile ?? ""),
    cylindree: String(initialVehicle?.cylindree ?? ""),
    puissance: String(initialVehicle?.puissance ?? ""),
    valeurNeuve: String(initialVehicle?.valeurNeuve ?? ""),
    valeurVenale: String(initialVehicle?.valeurVenale ?? ""),
    modele: initialVehicle?.modele ?? "",
    typeCommercial: initialVehicle?.typeCommercial ?? "",
    nbCartes: String(initialVehicle?.nbCartes ?? ""),
    commentaires: initialVehicle?.commentaires ?? "",
    conducteurLuiMeme: initialVehicle?.luiMemeAssure ?? true,
    libTypeConducteur: "",
    nomConducteur: initialVehicle?.assure?.nom ?? "",
    telConducteur: initialVehicle?.assure?.tel ?? "",
    emailConducteur: initialVehicle?.assure?.email ?? "",
    boitePostaleConducteur: initialVehicle?.assure?.bP ?? "",
    libProfessionConducteur: initialVehicle?.assure?.libProfession ?? "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      libGenre: prev.libGenre || getFirstOptionLabel(genresOptions),
      libType: prev.libType || getFirstOptionLabel(vehicleTypesOptions),
      libCarrosserie: prev.libCarrosserie || getFirstOptionLabel(carrosseriesOptions),
      libEnergie: prev.libEnergie || getFirstOptionLabel(energiesOptions),
      libUsage: prev.libUsage || getFirstOptionLabel(usagesOptions),
      libMarque: prev.libMarque || getFirstOptionLabel(marquesOptions),
      libCouleur: prev.libCouleur || getFirstOptionLabel(couleursOptions),
      libVille: prev.libVille || getFirstOptionLabel(villesOptions),
      libZoneCirculation: prev.libZoneCirculation || getFirstOptionLabel(zonesOptions),
      libProfessionConducteur: prev.libProfessionConducteur || getFirstOptionLabel(professionsOptions),
    }));
  }, [
    carrosseriesOptions,
    couleursOptions,
    energiesOptions,
    genresOptions,
    marquesOptions,
    professionsOptions,
    usagesOptions,
    vehicleTypesOptions,
    villesOptions,
    zonesOptions,
  ]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#D7DCE8";
  const textColor = isDark ? "#FFFFFF" : "#1E2330";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F4F5F9";

  const { showMessage } = usePopup();

  const clientType = useMemo(() => {
    if (!selectedClient) return TYPES_PERSONNES[0];
    return selectedClient.typeId === 2 ? TYPES_PERSONNES[1] : TYPES_PERSONNES[0];
  }, [selectedClient]);

  const updateField = <K extends keyof VehicleFormState>(key: K, value: VehicleFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openPicker = (
    field: VehicleSelectField,
    title: string,
    options: (string | itemDefaut)[],
  ) => {
    setPickerState({
      visible: true,
      field,
      title,
      options: normalizeOptions(options),
    });
    Animated.timing(dropdownAnimation, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closePicker = () => {
    Animated.timing(dropdownAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setPickerState((prev) => ({ ...prev, visible: false })));
  };

  const selectPickerOption = (value: string) => {
    if (pickerState.field) {
      updateField(pickerState.field, value as VehicleFormState[typeof pickerState.field]);
    }
    closePicker();
  };

  const goBackWithPayload = (payload?: Partial<vehicule>) => {
    const selectedClientData = selectedClient
      ? JSON.stringify(selectedClient)
      : clientData;

    if (returnTo === "vehicule-details" && initialVehicle) {
      router.replace({
        pathname: "/(commerce)/vehicules/details",
        params: {
          vehiculeData: JSON.stringify(payload ? { ...initialVehicle, ...payload } : initialVehicle),
          clientData: selectedClientData,
        },
      });
      return;
    }

    if (payload) {
      router.replace({
        pathname: "../vehicules",
        params: {
          action: mode === "edit" ? "updated" : "created",
          savedVehiculeData: JSON.stringify(payload),
          clientData: selectedClientData,
        },
      });
      return;
    }

    router.back();
  };

  const handleSubmit = () => {
    if (!formData.numImmatriculation.trim()) return;
    if (!selectedClient) {
      showMessage("error", "Client requis", "Veuillez sélectionner un client.");
      return;
    }

    const payload: Partial<vehicule> = {
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
      libGroupeZone: formData.libGroupeZone,
      libZoneCirculation: formData.libZoneCirculation,
      libMarque: formData.libMarque,
      libCouleur: formData.libCouleur,
      luiMemeAssure: formData.conducteurLuiMeme,
      assure: {
        nom: formData.nomConducteur,
        email: formData.emailConducteur,
        tel: formData.telConducteur,
        bP: formData.boitePostaleConducteur,
        libProfession: formData.libProfessionConducteur,
      },
      client: selectedClient,
    };

    goBackWithPayload(payload);
  };

  const handleCreateClient = (data: Partial<client>) => {
    if (!data.nom?.trim()) {
      showMessage("error", "Champs requis", "Le nom est obligatoire.");
      return;
    }

    const maxId = allClients.reduce((acc, currentClient) => Math.max(acc, currentClient.id), 0);
    const newId = maxId + 1;
    const newClient: client = {
      id: newId,
      civilite: data.civilite ?? 1,
      typeId: data.typeId ?? 1,
      professionId: data.professionId ?? 0,
      nom: data.nom.trim(),
      prenoms: data.prenoms?.trim(),
      email: data.email ?? "",
      mobile: data.mobile ?? "",
      tel: data.tel ?? "",
      whatsapp: data.whatsapp ?? "",
      bP: data.bP ?? "",
      exoTaxe: data.exoTaxe ?? false,
      rccm: data.rccm ?? "",
      libProfession: data.libProfession,
    };

    setLocalClients((prev) => [newClient, ...prev]);
    setSelectedClient(newClient);
    setIsClientCreateVisible(false);
    setIsClientPickerVisible(false);
    showMessage("success", "Succès", "Nouveau client créé et sélectionné.");
  };

  const handleEditClient = (data: Partial<client>) => {
    if (!selectedClient) {
      showMessage("error", "Client requis", "Veuillez sélectionner un client à modifier.");
      return;
    }

    const updatedClient: client = {
      ...selectedClient,
      ...data,
      nom: data.nom?.trim() || selectedClient.nom,
      prenoms: data.prenoms?.trim() || selectedClient.prenoms,
    };

    setLocalClients((prev) => {
      const exists = prev.some((currentClient) => currentClient.id === updatedClient.id);
      if (exists) {
        return prev.map((currentClient) =>
          currentClient.id === updatedClient.id ? updatedClient : currentClient,
        );
      }

      return [updatedClient, ...prev];
    });
    setSelectedClient(updatedClient);
    setIsClientEditVisible(false);
    showMessage("success", "Succès", "Client modifié.");
  };

  const handleOpenClientDetails = () => {
    if (!selectedClient) {
      showMessage("error", "Client requis", "Veuillez sélectionner un client à consulter.");
      return;
    }

    router.push({
      pathname: "/(commerce)/clients/details",
      params: { clientData: JSON.stringify(selectedClient) },
    });
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder = "",
    keyboardType: "default" | "numeric" | "phone-pad" = "default",
    editable = true,
  ) => (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={labelColor}
        keyboardType={keyboardType}
        editable={editable}
        style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
      />
    </View>
  );

  const renderSelect = (
    label: string,
    value: string,
    onPress: () => void,
    showLabel = true,
  ) => (
    <View style={styles.field}>
      {showLabel && <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>}
      <Pressable onPress={onPress} style={[styles.select, { backgroundColor: inputBg, borderColor }]}>
        <ThemedText style={{ color: textColor, flex: 1 }}>{value || "<Sélectionner ...>"}</ThemedText>
        <MaterialIcons name="expand-more" size={20} color={labelColor} />
      </Pressable>
    </View>
  );

  const renderSectionHeader = (
    icon: keyof typeof MaterialIcons.glyphMap,
    title: string,
  ) => (
    <View style={styles.formSectionHeader}>
      <View style={[styles.formSectionIconWrap, { backgroundColor: inputBg, borderColor }]}>
        <MaterialIcons name={icon} size={15} color={COLORS.primaryColor} />
      </View>
      <ThemedText type="defaultSemiBold" style={[styles.formSectionTitle, { color: textColor }]}>
        {title}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title={mode === "edit" ? "Modifier un véhicule" : "Enregistrer un nouveau véhicule"} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, { color: textColor }]}> 
          Informations du véhicule
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: labelColor }]}> 
          Complétez les données du véhicule et du conducteur pour finaliser la fiche.
        </ThemedText>

        <View style={[styles.topPanel, { backgroundColor: cardBackground, borderColor }]}> 
          <View style={styles.clientHeaderRow}>
            <ThemedText type="defaultSemiBold" style={[styles.clientHeaderTitle, { color: textColor }]}>Client</ThemedText>

            <View style={styles.clientActionIconsRow}>
              <Pressable
                style={[styles.clientActionIconButton, { backgroundColor: COLORS.primaryColor }]}
                onPress={() => setIsClientCreateVisible(true)}
              >
                <MaterialIcons name="person-add" size={16} color="#FFFFFF" />
              </Pressable>

              <Pressable
                style={[styles.clientActionIconButton, { borderColor, backgroundColor: inputBg }]}
                onPress={() => {
                  if (!selectedClient) {
                    showMessage("error", "Client requis", "Veuillez sélectionner un client à modifier.");
                    return;
                  }
                  setIsClientEditVisible(true);
                }}
              >
                <MaterialIcons name="edit" size={16} color={COLORS.primaryColor} />
              </Pressable>

              <Pressable
                style={[styles.clientActionIconButton, { borderColor, backgroundColor: inputBg }]}
                onPress={handleOpenClientDetails}
              >
                <MaterialIcons name="visibility" size={16} color={COLORS.primaryColor} />
              </Pressable>
            </View>
          </View>

          <View style={styles.row2}>
            {renderSelect(
              "Client",
              selectedClient ? `${selectedClient.nom} ${selectedClient.prenoms ?? ""}`.trim() : "<Sélectionner ...>",
              () => setIsClientPickerVisible(true),
              false,
            )}
          </View>

          <View style={styles.row2}>
            {renderInput("Code", selectedClient?.code ?? "", () => {}, "", "default", false)}
            {renderInput("Type", clientType, () => {}, "", "default", false)}
            {renderInput("Téléphone", selectedClient?.tel ?? "", () => {}, "", "phone-pad", false)}
          </View>
          {!selectedClient && (
            <View style={[styles.inlineInfo, { borderColor, backgroundColor: inputBg }]}> 
              <MaterialIcons name="info-outline" size={16} color={COLORS.primaryColor} />
              <ThemedText style={[styles.inlineInfoText, { color: labelColor }]}>
                Sélectionnez d&apos;abord un client pour lier correctement ce véhicule.
              </ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.tabPanel, { backgroundColor: cardBackground, borderColor }]}> 
          {renderSectionHeader("directions-car", "Caractéristiques du véhicule")}
          <View style={styles.row2}>
            {renderInput("Immatriculation *", formData.numImmatriculation, (v) => updateField("numImmatriculation", v), "AB-123-CD")}
          </View>

           <View style={styles.row2}>
                {renderInput("Date d'immatriculation *", formData.dateImmatriculation, (v) => updateField("dateImmatriculation", v), "jj/mm/aaaa")}
          </View>

          <View style={styles.row2}>
            {renderInput("Date 1re mise en circulation *", formData.dateMiseEnCirculation, (v) => updateField("dateMiseEnCirculation", v), "jj/mm/aaaa")}
          </View>


          <View style={styles.row2}>
            {renderSelect("Genre", formData.libGenre, () => openPicker("libGenre", "Choisir un genre", genresOptions))}
          </View>


  <View style={styles.row2}>
            {renderSelect("Type", formData.libType, () => openPicker("libType", "Choisir un type", vehicleTypesOptions))}
          </View>


  <View style={styles.row2}>
            {renderSelect("Carrosserie", formData.libCarrosserie, () => openPicker("libCarrosserie", "Choisir une carrosserie", carrosseriesOptions))}
          </View>

          <View style={styles.row2}>
            {renderSelect("Energie", formData.libEnergie, () => openPicker("libEnergie", "Choisir une énergie", energiesOptions))}
          </View>

          <View style={styles.row2}>
            {renderSelect("Marque", formData.libMarque, () => openPicker("libMarque", "Choisir une marque", marquesOptions))}
          </View>

          <View style={styles.row2}>
            {renderInput("Numéro de série", formData.numSerie, (v) => updateField("numSerie", v))}
          </View>

            <View style={styles.row2}>
            {renderInput("N° carte grise", formData.numCarteGrise, (v) => updateField("numCarteGrise", v))}
          </View>
          <View style={styles.row3}>
            {renderInput("Nombre de places", formData.nbPlaces, (v) => updateField("nbPlaces", v), "0", "numeric")}
            {renderInput("Charge utile", formData.chargeUtile, (v) => updateField("chargeUtile", v), "0", "numeric")}
          </View>
           <View style={styles.row3}>
           
            {renderInput("Cylindrée", formData.cylindree, (v) => updateField("cylindree", v), "0", "numeric")}
            {renderInput("Nombre de cartes", formData.nbCartes, (v) => updateField("nbCartes", v), "0", "numeric")}
          </View>
          <View style={styles.row3}>
            {renderInput("Valeur neuve", formData.valeurNeuve, (v) => updateField("valeurNeuve", v), "0", "numeric")}
            {renderInput("Valeur vénale", formData.valeurVenale, (v) => updateField("valeurVenale", v), "0", "numeric")}
            {renderInput("Puissance", formData.puissance, (v) => updateField("puissance", v), "0", "numeric")}
          </View>
          <View style={styles.row2}>
            {renderInput("Modèle", formData.modele, (v) => updateField("modele", v))}
          </View>

          <View style={styles.row2}>
            {renderInput("Type commercial", formData.typeCommercial, (v) => updateField("typeCommercial", v))}
          </View>


          {renderSectionHeader("settings", "Paramètres Techniques Assurances")}

          <View style={styles.row2}>
            {renderSelect("Usage", formData.libUsage, () => openPicker("libUsage", "Choisir un usage", usagesOptions))}
          </View>

           <View style={styles.row2}>
            {renderSelect("Catégorie", formData.libCategorie, () => openPicker("libCategorie", "Choisir une catégorie", CATEGORIES))}
          </View>
             <View style={styles.row2}>
            {renderSelect("S/Catégorie", formData.libSousCategorie, () => openPicker("libSousCategorie", "Choisir une sous-catégorie", SOUS_CATEGORIES))}
          </View>
          <View style={styles.row2}>
            {renderSelect("Ville de circulation", formData.libVille, () => openPicker("libVille", "Choisir une ville", villesOptions))}
          </View>

           <View style={styles.row2}>
            {renderSelect("Zone de circulation", formData.libZoneCirculation, () => openPicker("libZoneCirculation", "Choisir une zone", zonesOptions))}
          </View>
          
          <View style={styles.field}>
            <ThemedText style={[styles.label, { color: labelColor }]}>Commentaires</ThemedText>
            <TextInput
              multiline
              numberOfLines={3}
              value={formData.commentaires}
              onChangeText={(v) => updateField("commentaires", v)}
              style={[styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor }]}
            />
          </View>

        </View>

        <View style={[styles.tabPanel, { backgroundColor: cardBackground, borderColor }]}> 
          {renderSectionHeader("person", "Conducteur habituel")}

          <View style={styles.row2}>
            <Pressable style={styles.checkboxRow} onPress={() => updateField("conducteurLuiMeme", !formData.conducteurLuiMeme)}>
              <View style={[styles.checkbox, { borderColor }]}> 
                {formData.conducteurLuiMeme && <View style={styles.checkboxDot} />}
              </View>
              <ThemedText style={{ color: textColor }}>Le client lui-même est l&apos;assuré</ThemedText>
            </Pressable>
          </View>
          <View style={styles.row2}>
            {renderSelect("Type", formData.libTypeConducteur, () => openPicker("libTypeConducteur", "Choisir un type", TYPES_PERSONNES))}
          </View>
          <View style={styles.row2}>
            {renderInput("Nom de l'assuré", formData.nomConducteur, (v) => updateField("nomConducteur", v))}
          </View>
          <View style={styles.row2}>
            {renderInput("Téléphone", formData.telConducteur, (v) => updateField("telConducteur", v), "+225 xx xx xx xx", "phone-pad")}
          </View>
          <View style={styles.row2}>
            {renderInput("Email", formData.emailConducteur, (v) => updateField("emailConducteur", v), "email@example.com")}
          </View>
          <View style={styles.row2}>
            {renderInput("Boite postale", formData.boitePostaleConducteur, (v) => updateField("boitePostaleConducteur", v))}
          </View>
          {renderSelect("Profession", formData.libProfessionConducteur, () => openPicker("libProfessionConducteur", "Choisir une profession", professionsOptions))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderColor }]}> 
        <Pressable style={[styles.footerButton, { backgroundColor: COLORS.primaryColor }]} onPress={handleSubmit}>
          <ThemedText style={styles.footerButtonText}>Enregistrer</ThemedText>
        </Pressable>
        <Pressable style={[styles.footerButton, { backgroundColor: "#46506B" }]} onPress={() => goBackWithPayload()}>
          <ThemedText style={styles.footerButtonText}>Annuler</ThemedText>
        </Pressable>
      </View>

      <Modal transparent visible={pickerState.visible} animationType="none" onRequestClose={closePicker}>
        <Pressable style={styles.pickerOverlay} onPress={closePicker}>
          <Animated.View
            style={[
              styles.pickerSheet,
              {
                backgroundColor: cardBackground,
                borderColor,
                transform: [
                  {
                    translateY: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
                opacity: dropdownAnimation,
              },
            ]}
          >
            <View style={[styles.pickerHeader, { borderColor }]}>
              <ThemedText type="defaultSemiBold" style={{ color: textColor, fontSize: 16 }}>
                {pickerState.title}
              </ThemedText>
              <Pressable onPress={closePicker}>
                <MaterialIcons name="close" size={20} color={labelColor} />
              </Pressable>
            </View>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {pickerState.options.map((option) => {
                const isSelected = pickerState.field ? formData[pickerState.field] === option : false;

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.pickerItem,
                      {
                        borderColor: "transparent",
                        backgroundColor: isSelected ? borderColor : "transparent",
                      },
                    ]}
                    onPress={() => selectPickerOption(option)}
                  >
                    <View
                      style={[
                        styles.dropdownItemCheckbox,
                        {
                          borderColor: isSelected ? COLORS.primaryColor : labelColor,
                          backgroundColor: isSelected ? COLORS.primaryColor : "transparent",
                        },
                      ]}
                    >
                      {isSelected && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                    </View>
                    <ThemedText style={{ color: isSelected ? COLORS.primaryColor : textColor, fontWeight: isSelected ? "600" : "400", flex: 1 }}>
                      {option}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={isClientPickerVisible}
        animationType="fade"
        onRequestClose={() => setIsClientPickerVisible(false)}
      >
        <View style={styles.clientPickerBackdrop}>
          <Pressable
            style={styles.clientPickerOverlayTouch}
            onPress={() => setIsClientPickerVisible(false)}
          />

          <View style={styles.clientPickerSheet}>
            <View style={styles.clientPickerHandle} />
            <View style={styles.clientPickerHeaderRow}>
              <ThemedText type="defaultSemiBold" style={styles.clientPickerTitle}>
                Catalogue clients
              </ThemedText>
              <View style={styles.clientPickerHeaderActions}>
                <Pressable
                  style={styles.clientHeaderAdd}
                  onPress={() => {
                    setIsClientPickerVisible(false);
                    setIsClientCreateVisible(true);
                  }}
                >
                  <MaterialIcons name="person-add" size={22} color={COLORS.primaryColor} />
                </Pressable>
                <Pressable onPress={() => setIsClientPickerVisible(false)}>
                  <MaterialIcons name="close" size={26} color="#6C7088" />
                </Pressable>
              </View>
            </View>

            <View style={styles.clientPickerSearchWrap}>
              <MaterialIcons name="search" size={18} color="#A0A5BC" />
              <TextInput
                value={clientSearchText}
                onChangeText={setClientSearchText}
                placeholder="Rechercher un client..."
                placeholderTextColor="#A0A5BC"
                style={styles.clientPickerSearchInput}
              />
            </View>

            <ScrollView
              style={styles.clientPickerList}
              showsVerticalScrollIndicator={false}
            >
              {filteredClients.length === 0 && (
                <View style={styles.clientPickerEmptyState}>
                  <MaterialIcons name="search-off" size={20} color="#A0A5BC" />
                  <ThemedText style={styles.clientPickerEmptyText}>
                    Aucun client trouvé pour cette recherche.
                  </ThemedText>
                </View>
              )}
              {filteredClients.map((currentClient) => {
                const isSelected = selectedClient?.id === currentClient.id;

                return (
                  <View key={currentClient.id} style={styles.clientPickerRow}>
                    <View style={styles.clientPickerRowTextWrap}>
                      <ThemedText style={styles.clientPickerRowTitle}>
                        {`${currentClient.nom} ${currentClient.prenoms ?? ""}`.trim()}
                      </ThemedText>
                      <ThemedText style={styles.clientPickerRowCode}>
                        {currentClient.code}
                      </ThemedText>
                    </View>

                    <Pressable
                      onPress={() => {
                        setSelectedClient(currentClient);
                        setIsClientPickerVisible(false);
                      }}
                      style={styles.clientPickerAddButton}
                    >
                      <MaterialIcons
                        name={isSelected ? "check-circle" : "add-circle-outline"}
                        size={30}
                        color={COLORS.primaryColor}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ClientFormModal
        visible={isClientCreateVisible}
        onClose={() => setIsClientCreateVisible(false)}
        onSubmit={async (data) => handleCreateClient(data)}
        title="Créer un client"
      />

      <ClientFormModal
        visible={isClientEditVisible}
        onClose={() => setIsClientEditVisible(false)}
        onSubmit={async (data) => handleEditClient(data)}
        initialClient={selectedClient}
        title={selectedClient ? `Modifier ${selectedClient.nom}` : "Modifier un client"}
      />
    </ThemedView>
  );
}


