import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import ClientFormModal from "@/components/client-form-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import BottomPickerModal, { PickerOption as BPickerOption } from "@/components/ui/bottom-picker-modal";
import { TYPES_PERSONNES } from "@/constants/constants";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import {
  createClient,
  createVehicule,
  getfetchClients,
  getfetchParametres,
  updateClient,
  updateVehicule,
} from "@/services/api-service";
import COLORS from "@/styles/colors";
import { client, listClients } from "@/types/client.type";
import { itemDefaut, params } from "@/types/other.type";
import { vehicule } from "@/types/vehicule.type";

const GENRES: itemDefaut[] = [];
const USAGES: itemDefaut[] = [];
const VEHICLE_TYPES: itemDefaut[] = [];
const CARROSSERIES: itemDefaut[] = [];
const ENERGIES: itemDefaut[] = [];
const MARQUES: itemDefaut[] = [];
const COULEURS: itemDefaut[] = [];
const CATEGORIES: itemDefaut[] = [];
const SOUS_CATEGORIES: itemDefaut[] = [];
const GROUPES_ZONES: itemDefaut[] = [];
const ZONES_CIRCULATIONS: itemDefaut[] = [];
const PROFESSIONS: itemDefaut[] = [];

type VehicleFormState = {
  numImmatriculation: string;
  dateImmatriculation: string;
  dateMiseEnCirculation: string;
  numSerie: string;
  numCarteGrise: string;
  nbPlaces: number;
  chargeUtile: number;
  cylindree: number;
  puissance: number;
  valeurNeuve: number;
  valeurVenale: number;
  modele: string;
  typeCommercial: string;
  nbCartes: number;
  commentaires: string;

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

  conducteurLuiMeme: boolean;
  libTypeConducteur: string;
  nomConducteur: string;
  telConducteur: string;
  emailConducteur: string;
  boitePostaleConducteur: string;
  libProfessionConducteur: string;
};

type VehicleSelectField =
  | "libGenre"
  | "libType"
  | "libCarrosserie"
  | "libEnergie"
  | "libUsage"
  | "libCategorie"
  | "libSousCategorie"
  | "libGroupeZone"
  | "libZoneCirculation"
  | "libMarque"
  | "libCouleur"
  | "libTypeConducteur"
  | "libProfessionConducteur";

type FormSection = "vehicule" | "assure";

const normalizeOptions = (options: (string | itemDefaut)[]): BPickerOption[] =>
  options.reduce<BPickerOption[]>((acc, option, index) => {
    if (typeof option === "string") {
      const label = option.trim();
      if (label) {
        acc.push({ id: `opt-${index + 1}`, label });
      }
      return acc;
    }

    const label = option.libelle?.trim();
    if (label) {
      acc.push({ id: option.id, label });
    }
    return acc;
  }, []);

const formatDateForInput = (date?: Date | string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("fr-FR");
};

const parseDateInput = (value?: string) => {
  if (!value?.trim()) return undefined;
  const normalized = value.trim();

  if (normalized.includes("/")) {
    const [day, month, year] = normalized.split("/");
    if (day && month && year) {
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  const fallback = new Date(normalized);
  return Number.isNaN(fallback.getTime()) ? undefined : fallback;
};

const findIdByLabel = (label: string, options: itemDefaut[]) => {
  const normalized = label.trim().toLowerCase();
  const match = options.find((option) => option.libelle?.trim().toLowerCase() === normalized);
  return match?.id ?? 0;
};

const toNumber = (value: string) => {
  const parsed = Number(value.replace(/\s+/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function VehiculeFormScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();
  const { showMessage } = usePopup();

  const { mode, vehiculeData, clientData, returnTo } = useLocalSearchParams<{
    mode?: "create" | "edit";
    vehiculeData?: string;
    clientData?: string;
    returnTo?: "vehicules" | "vehicule-details";
  }>();

  const initialVehicle = useMemo<vehicule | undefined>(() => {
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
  const [localClients, setLocalClients] = useState<client[]>([]);
  const [selectedClient, setSelectedClient] = useState<client | undefined>(initialClient);
  const [isClientPickerVisible, setIsClientPickerVisible] = useState(false);
  const [isClientCreateVisible, setIsClientCreateVisible] = useState(false);
  const [isClientEditVisible, setIsClientEditVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSearchText, setClientSearchText] = useState("");
  const [activeSection, setActiveSection] = useState<FormSection>("vehicule");

  const [genresOptions, setGenresOptions] = useState<itemDefaut[]>(GENRES);
  const [usagesOptions, setUsagesOptions] = useState<itemDefaut[]>(USAGES);
  const [vehicleTypesOptions, setVehicleTypesOptions] = useState<itemDefaut[]>(VEHICLE_TYPES);
  const [carrosseriesOptions, setCarrosseriesOptions] = useState<itemDefaut[]>(CARROSSERIES);
  const [energiesOptions, setEnergiesOptions] = useState<itemDefaut[]>(ENERGIES);
  const [marquesOptions, setMarquesOptions] = useState<itemDefaut[]>(MARQUES);
  const [couleursOptions, setCouleursOptions] = useState<itemDefaut[]>(COULEURS);
  const [zonesCirculationsOptions, setZonesCirculationsOptions] = useState<itemDefaut[]>(ZONES_CIRCULATIONS);
  const [groupesZonesOptions, setGroupesZonesOptions] = useState<itemDefaut[]>(GROUPES_ZONES);
  const [professionsOptions, setProfessionsOptions] = useState<itemDefaut[]>(PROFESSIONS);

  const [pickerState, setPickerState] = useState<{
    visible: boolean;
    field?: VehicleSelectField;
    title: string;
    options: BPickerOption[];
  }>({
    visible: false,
    title: "",
    options: [],
  });

  const [formData, setFormData] = useState<VehicleFormState>({
    numImmatriculation: initialVehicle?.numImmatriculation ?? "",
    dateImmatriculation: formatDateForInput(initialVehicle?.dateImmatriculation),
    dateMiseEnCirculation: formatDateForInput(initialVehicle?.dateMiseEnCirculation),
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

    libGenre: initialVehicle?.libGenre ?? "",
    libType: initialVehicle?.libType ?? "",
    libCarrosserie: initialVehicle?.libCarrosserie ?? "",
    libEnergie: initialVehicle?.libEnergie ?? "",
    libUsage: initialVehicle?.libUsage ?? "",
    libCategorie: initialVehicle?.libCategorie ?? "",
    libSousCategorie: initialVehicle?.libSousCategorie ?? "",
    libGroupeZone: initialVehicle?.libGroupeZone ?? "",
    libZoneCirculation: initialVehicle?.libZoneCirculation ?? "",
    libMarque: initialVehicle?.libMarque ?? "",
    libCouleur: initialVehicle?.libCouleur ?? "",

    conducteurLuiMeme: initialVehicle?.luiMemeAssure ?? true,
    libTypeConducteur: initialVehicle?.assure?.typeId === 2 ? TYPES_PERSONNES[1] : TYPES_PERSONNES[0],
    nomConducteur: initialVehicle?.assure?.nom ?? "",
    telConducteur: initialVehicle?.assure?.tel ?? "",
    emailConducteur: initialVehicle?.assure?.email ?? "",
    boitePostaleConducteur: initialVehicle?.assure?.bP ?? "",
    libProfessionConducteur: initialVehicle?.assure?.libProfession ?? "",
  });

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
        setGenresOptions(payload?.genres?.data && payload.genres.data.length > 0 ? payload.genres.data : GENRES);
        setVehicleTypesOptions(payload?.types?.data && payload.types.data.length > 0 ? payload.types.data : VEHICLE_TYPES);
        setCarrosseriesOptions(payload?.carrosseries?.data && payload.carrosseries.data.length > 0 ? payload.carrosseries.data : CARROSSERIES);
        setEnergiesOptions(payload?.energies?.data && payload.energies.data.length > 0 ? payload.energies.data : ENERGIES);
        setUsagesOptions(payload?.usages?.data && payload.usages.data.length > 0 ? payload.usages.data : USAGES);
        setMarquesOptions(payload?.marques?.data && payload.marques.data.length > 0 ? payload.marques.data : MARQUES);
        setCouleursOptions(payload?.couleurs?.data && payload.couleurs.data.length > 0 ? payload.couleurs.data : COULEURS);
        setProfessionsOptions(payload?.professions?.data && payload.professions.data.length > 0 ? payload.professions.data : PROFESSIONS);
        setZonesCirculationsOptions(payload?.zones_circulations?.data && payload.zones_circulations.data.length > 0 ? payload.zones_circulations.data : ZONES_CIRCULATIONS);
        setGroupesZonesOptions(payload?.groupes_zones?.data && payload.groupes_zones.data.length > 0 ? payload.groupes_zones.data : GROUPES_ZONES);
      })
      .catch(() => {
        setGenresOptions(GENRES);
        setVehicleTypesOptions(VEHICLE_TYPES);
        setCarrosseriesOptions(CARROSSERIES);
        setEnergiesOptions(ENERGIES);
        setUsagesOptions(USAGES);
        setMarquesOptions(MARQUES);
        setCouleursOptions(COULEURS);
        setProfessionsOptions(PROFESSIONS);
        setZonesCirculationsOptions(ZONES_CIRCULATIONS);
        setGroupesZonesOptions(GROUPES_ZONES);
      });
  }, [userToken]);

  const allClients = useMemo(() => {
    const byId = new Map<number, client>();
    const withoutId: client[] = [];

    clientsData.data.forEach((currentClient) => {
      if (typeof currentClient.id === "number") {
        byId.set(currentClient.id, currentClient);
      } else {
        withoutId.push(currentClient);
      }
    });

    localClients.forEach((currentClient) => {
      if (typeof currentClient.id === "number") {
        byId.set(currentClient.id, currentClient);
      } else {
        withoutId.unshift(currentClient);
      }
    });

    return [...withoutId, ...Array.from(byId.values())];
  }, [clientsData.data, localClients]);

  const filteredClients = useMemo(() => {
    const query = clientSearchText.trim().toLowerCase();
    if (!query) return allClients;

    return allClients.filter((currentClient) =>
      currentClient.nom.toLowerCase().includes(query) ||
      currentClient.code?.toLowerCase().includes(query),
    );
  }, [allClients, clientSearchText]);

  const pageBackground = isDark ? "#0F1117" : "#F4F6FB";
  const cardBackground = isDark ? "#171B24" : "#FFFFFF";
  const borderColor = isDark ? "#2D3444" : "#DBE1F0";
  const textColor = isDark ? "#F2F5FF" : "#1F2737";
  const labelColor = isDark ? "#AEB9D3" : "#6D768B";
  const mutedBlock = isDark ? "#212838" : "#EEF2FA";
  const inputBg = isDark ? "#242735" : "#F9F9FC";
  const primaryColor = "#1F8B82";

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
  };

  const closePicker = () => {
    setPickerState((prev) => ({ ...prev, visible: false, field: undefined }));
  };

  const getPickerSelectedId = () => {
    if (!pickerState.field) return undefined;
    const selectedLabel = formData[pickerState.field];
    return pickerState.options.find((option) => option.label === selectedLabel)?.id;
  };

  const selectPickerOption = (option: BPickerOption) => {
    if (pickerState.field) {
      updateField(pickerState.field, option.label as VehicleFormState[typeof pickerState.field]);
    }
    closePicker();
  };

  const goBackWithPayload = (payload?: Partial<vehicule>) => {
    const selectedClientData = selectedClient ? JSON.stringify(selectedClient) : clientData;

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

  const handleSubmit = async () => {
    if (!userToken) {
      showMessage("error", "Session", "Session invalide. Veuillez vous reconnecter.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    if (!formData.numImmatriculation.trim()) {
      showMessage("error", "Champs requis", "Le numéro d'immatriculation est obligatoire.");
      return;
    }

    if (!selectedClient) {
      showMessage("error", "Client requis", "Veuillez sélectionner un client.");
      return;
    }

    const payload: Partial<vehicule> = {
      id: initialVehicle?.id,
      client: selectedClient,
      clientId: selectedClient.id ?? 0,
      numImmatriculation: formData.numImmatriculation.trim().toUpperCase(),
      dateImmatriculation: parseDateInput(formData.dateImmatriculation),
      dateMiseEnCirculation: parseDateInput(formData.dateMiseEnCirculation),
      numSerie: formData.numSerie,
      numCarteGrise: formData.numCarteGrise,
      nbPlaces: formData.nbPlaces,
      chargeUtile: formData.chargeUtile,
      cylindree: formData.cylindree,
      puissance: formData.puissance,
      nbCartes: formData.nbCartes,
      valeurNeuve: formData.valeurNeuve,
      valeurVenale: formData.valeurVenale,
      modele: formData.modele,
      typeCommercial: formData.typeCommercial,
      commentaires: formData.commentaires,

      genreId: findIdByLabel(formData.libGenre, genresOptions),
      typeId: findIdByLabel(formData.libType, vehicleTypesOptions),
      carrosserieId: findIdByLabel(formData.libCarrosserie, carrosseriesOptions),
      energieId: findIdByLabel(formData.libEnergie, energiesOptions),
      usageId: findIdByLabel(formData.libUsage, usagesOptions),
      categorieId: findIdByLabel(formData.libCategorie, CATEGORIES),
      sousCategorieId: findIdByLabel(formData.libSousCategorie, SOUS_CATEGORIES),
      groupeZoneId: findIdByLabel(formData.libGroupeZone, groupesZonesOptions),
      zoneCirculationId: findIdByLabel(formData.libZoneCirculation, zonesCirculationsOptions),
      marqueId: findIdByLabel(formData.libMarque, marquesOptions),
      couleurId: findIdByLabel(formData.libCouleur, couleursOptions),

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
        typeId: formData.libTypeConducteur === TYPES_PERSONNES[1] ? 2 : 1,
        professionId: findIdByLabel(formData.libProfessionConducteur, professionsOptions),
        libProfession: formData.libProfessionConducteur,
      },
    };

    try {
      setIsSubmitting(true);

      const savedVehicule =
        mode === "edit" && typeof initialVehicle?.id === "number"
          ? await updateVehicule(userToken, initialVehicle.id, payload)
          : await createVehicule(userToken, payload);

      const returnPayload: Partial<vehicule> = {
        ...payload,
        ...savedVehicule,
        client: selectedClient,
      };

      showMessage(
        "success",
        "Succès",
        mode === "edit" ? "Véhicule mis à jour." : "Véhicule créé.",
      );
      goBackWithPayload(returnPayload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Échec de l'enregistrement du véhicule.";
      showMessage("error", "Enregistrement", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClient = async (data: Partial<client>) => {
    if (!userToken) {
      showMessage("error", "Session", "Session invalide. Veuillez vous reconnecter.");
      return;
    }

    if (!data.nom?.trim()) {
      showMessage("error", "Champs requis", "Le nom est obligatoire.");
      return;
    }

    try {
      const newClient = await createClient(userToken, {
        ...data,
        nom: data.nom.trim(),
        prenoms: data.prenoms?.trim(),
      });

      setLocalClients((prev) => [newClient, ...prev]);
      setSelectedClient(newClient);
      setIsClientCreateVisible(false);
      setIsClientPickerVisible(false);
      showMessage("success", "Succès", "Nouveau client créé et sélectionné.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Échec de création du client.";
      showMessage("error", "Client", message);
    }
  };

  const handleEditClient = async (data: Partial<client>) => {
    if (!userToken) {
      showMessage("error", "Session", "Session invalide. Veuillez vous reconnecter.");
      return;
    }

    if (!selectedClient) {
      showMessage("error", "Client requis", "Veuillez sélectionner un client à modifier.");
      return;
    }

    if (typeof selectedClient.id !== "number") {
      showMessage("error", "Client", "Impossible de modifier ce client sans identifiant.");
      return;
    }

    try {
      const updatedClient = await updateClient(userToken, selectedClient.id, {
        ...data,
        nom: data.nom?.trim() || selectedClient.nom,
        prenoms: data.prenoms?.trim() || selectedClient.prenoms,
      });

      setLocalClients((prev) => {
        if (typeof updatedClient.id !== "number") {
          return [updatedClient, ...prev.filter((currentClient) => currentClient !== selectedClient)];
        }

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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Échec de mise à jour du client.";
      showMessage("error", "Client", message);
    }
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

  const applyClientAsConducteur = () => {
    if (!selectedClient) return;

    updateField("libTypeConducteur", selectedClient.typeId === 2 ? TYPES_PERSONNES[1] : TYPES_PERSONNES[0]);
    updateField("nomConducteur", `${selectedClient.nom} ${selectedClient.prenoms ?? ""}`.trim());
    updateField("telConducteur", selectedClient.tel ?? selectedClient.mobile ?? "");
    updateField("emailConducteur", selectedClient.email ?? "");
    updateField("boitePostaleConducteur", selectedClient.bP ?? "");
    updateField("libProfessionConducteur", selectedClient.libProfession ?? "");
  };

  useEffect(() => {
    if (!formData.conducteurLuiMeme) return;
    applyClientAsConducteur();
  }, [selectedClient, formData.conducteurLuiMeme]);

  const renderTextInput = (
    label: string,
    value: string,
    onChangeText: (next: string) => void,
    placeholder = "",
    keyboardType: "default" | "numeric" | "phone-pad" | "email-address" = "default",
    editable = true,
    icon: React.ComponentProps<typeof MaterialIcons>["name"] = "edit-note",
  ) => (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: inputBg,
            borderColor,
          },
        ]}
      >
        <MaterialIcons name={icon} size={16} color={labelColor} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={labelColor}
          keyboardType={keyboardType}
          editable={editable}
          style={[
            styles.inputText,
            {
              color: editable ? textColor : labelColor,
            },
          ]}
        />
      </View>
    </View>
  );

  const renderNumberInput = (
    label: string,
    value: number,
    onChangeNumber: (next: number) => void,
    placeholder = "0",
    icon: React.ComponentProps<typeof MaterialIcons>["name"] = "pin",
  ) =>
    renderTextInput(
      label,
      String(value),
      (next) => onChangeNumber(toNumber(next)),
      placeholder,
      "numeric",
      true,
      icon,
    );

  const renderSelect = (
    label: string,
    value: string,
    onPress: () => void,
    showLabel = true,
    icon: React.ComponentProps<typeof MaterialIcons>["name"] = "list-alt",
  ) => (
    <View style={styles.fieldGroup}>
      {showLabel && <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>}
      <Pressable onPress={onPress} style={[styles.selectBtn, { backgroundColor: inputBg, borderColor }]}> 
        <MaterialIcons name={icon} size={16} color={labelColor} />
        <ThemedText style={[styles.selectBtnText, { color: value ? textColor : labelColor }]}>
          {value || "Sélectionner"}
        </ThemedText>
        <MaterialIcons name="arrow-drop-down" size={20} color={labelColor} />
      </Pressable>
    </View>
  );

  const sectionButton = (section: FormSection, label: string, icon: keyof typeof MaterialIcons.glyphMap) => {
    const isActive = activeSection === section;

    return (
      <Pressable
        key={section}
        style={[
          styles.segmentButton,
          {
            backgroundColor: isActive ? COLORS.primaryColor : cardBackground,
            borderColor: isActive ? COLORS.primaryColor : borderColor,
          },
        ]}
        onPress={() => setActiveSection(section)}
      >
        <MaterialIcons
          name={icon}
          size={15}
          color={isActive ? "#FFFFFF" : labelColor}
        />
        <ThemedText style={{ color: isActive ? "#FFFFFF" : textColor, fontWeight: "700", fontSize: 13 }}>
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  const isSameClient = (currentClient: client) => {
    if (!selectedClient) return false;

    if (typeof selectedClient.id === "number" && typeof currentClient.id === "number") {
      return selectedClient.id === currentClient.id;
    }

    return `${selectedClient.nom}-${selectedClient.prenoms}` === `${currentClient.nom}-${currentClient.prenoms}`;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title={mode === "edit" ? "Modifier véhicule" : "Créer véhicule"} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.heroAccent} />
          <ThemedText type="defaultSemiBold" style={[styles.heroTitle, { color: textColor }]}>
            {mode === "edit" ? "Mise à jour de la fiche véhicule" : "Nouvelle fiche véhicule"}
          </ThemedText>
          <ThemedText style={[styles.heroSubtitle, { color: labelColor }]}>
            Renseignez les informations administratives, techniques et conducteur.
          </ThemedText>

          <View style={styles.segmentRow}>
            {sectionButton("vehicule", "Véhicule", "directions-car")}
            {sectionButton("assure", "Conducteur", "person")}
          </View>
        </View>

        <View style={[styles.blockCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.clientHeaderRow}>
            <ThemedText type="defaultSemiBold" style={[styles.blockTitle, { color: textColor }]}>
              Client associé
            </ThemedText>

            <View style={styles.clientActionIconsRow}>
              <Pressable
                style={[styles.clientActionIconButton, { backgroundColor: COLORS.primaryColor }]}
                onPress={() => setIsClientCreateVisible(true)}
              >
                <MaterialIcons name="person-add" size={16} color="#FFFFFF" />
              </Pressable>

              <Pressable
                style={[styles.clientActionIconButton, { borderColor, backgroundColor: mutedBlock }]}
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
                style={[styles.clientActionIconButton, { borderColor, backgroundColor: mutedBlock }]}
                onPress={handleOpenClientDetails}
              >
                <MaterialIcons name="visibility" size={16} color={COLORS.primaryColor} />
              </Pressable>
            </View>
          </View>

          {renderSelect(
            "Client",
            selectedClient ? `${selectedClient.nom} ${selectedClient.prenoms ?? ""}`.trim() : "",
            () => setIsClientPickerVisible(true),
            false,
          )}

          <View style={styles.grid3}>
            {renderTextInput("Code", selectedClient?.code ?? "", () => {}, "", "default", false)}
            {renderTextInput("Type", clientType, () => {}, "", "default", false)}
            {renderTextInput("Téléphone", selectedClient?.tel ?? "", () => {}, "", "phone-pad", false)}
          </View>

          {!selectedClient && (
            <View style={[styles.inlineInfo, { borderColor, backgroundColor: mutedBlock }]}>
              <MaterialIcons name="info-outline" size={16} color={COLORS.primaryColor} />
              <ThemedText style={[styles.inlineInfoText, { color: labelColor }]}>
                Sélectionnez un client avant d&apos;enregistrer le véhicule.
              </ThemedText>
            </View>
          )}
        </View>

        {activeSection === "vehicule" && (
          <View style={[styles.blockCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText type="defaultSemiBold" style={[styles.blockTitle, { color: textColor }]}>
              Informations véhicule
            </ThemedText>

            {renderTextInput(
              "Immatriculation *",
              formData.numImmatriculation,
              (value) => updateField("numImmatriculation", value.toUpperCase()),
              "AB-123-CD",
            )}
            <View style={styles.grid2}>
              {renderTextInput(
                "Date immatriculation",
                formData.dateImmatriculation,
                (value) => updateField("dateImmatriculation", value),
                "jj/mm/aaaa",
              )}
              {renderTextInput(
                "Date 1re circulation",
                formData.dateMiseEnCirculation,
                (value) => updateField("dateMiseEnCirculation", value),
                "jj/mm/aaaa",
              )}
            </View>

              {renderSelect("Genre", formData.libGenre, () => openPicker("libGenre", "Choisir un genre", genresOptions))}
              {renderSelect("Type", formData.libType, () => openPicker("libType", "Choisir un type", vehicleTypesOptions))}

              {renderSelect("Carrosserie", formData.libCarrosserie, () => openPicker("libCarrosserie", "Choisir une carrosserie", carrosseriesOptions))}
              {renderSelect("Energie", formData.libEnergie, () => openPicker("libEnergie", "Choisir une énergie", energiesOptions))}

              {renderSelect("Marque", formData.libMarque, () => openPicker("libMarque", "Choisir une marque", marquesOptions))}
              {renderSelect("Couleur", formData.libCouleur, () => openPicker("libCouleur", "Choisir une couleur", couleursOptions))}

            <View style={styles.grid2}>
              {renderTextInput("Numéro de série", formData.numSerie, (value) => updateField("numSerie", value))}
              {renderTextInput("N° carte grise", formData.numCarteGrise, (value) => updateField("numCarteGrise", value))}
            </View>

            <View style={styles.grid3}>
              {renderNumberInput("Nombre de places", formData.nbPlaces, (value) => updateField("nbPlaces", value))}
              {renderNumberInput("Charge utile", formData.chargeUtile, (value) => updateField("chargeUtile", value))}
              {renderNumberInput("Puissance", formData.puissance, (value) => updateField("puissance", value))}
            </View>

            <View style={styles.grid3}>
              {renderNumberInput("Cylindrée", formData.cylindree, (value) => updateField("cylindree", value))}
              {renderNumberInput("Nombre de cartes", formData.nbCartes, (value) => updateField("nbCartes", value))}
              {renderTextInput("Type commercial", formData.typeCommercial, (value) => updateField("typeCommercial", value))}
            </View>

            <View style={styles.grid2}>
              {renderNumberInput("Valeur neuve", formData.valeurNeuve, (value) => updateField("valeurNeuve", value))}
              {renderNumberInput("Valeur vénale", formData.valeurVenale, (value) => updateField("valeurVenale", value))}
            </View>

            {renderTextInput("Modèle", formData.modele, (value) => updateField("modele", value))}

              {renderSelect("Usage", formData.libUsage, () => openPicker("libUsage", "Choisir un usage", usagesOptions))}
              {renderSelect("Catégorie", formData.libCategorie, () => openPicker("libCategorie", "Choisir une catégorie", CATEGORIES))}
              {renderSelect("Sous-catégorie", formData.libSousCategorie, () => openPicker("libSousCategorie", "Choisir une sous-catégorie", SOUS_CATEGORIES))}
              {renderSelect("Zone de circulation", formData.libZoneCirculation, () => openPicker("libZoneCirculation", "Choisir une zone", groupesZonesOptions))}
              {renderSelect("Ville de circulation", formData.libGroupeZone, () => openPicker("libGroupeZone", "Choisir une ville", zonesCirculationsOptions))}

            <View style={styles.field}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Commentaires</ThemedText>
              <View style={[styles.inputRow, styles.textareaRow, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons name="notes" size={16} color={labelColor} />
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={formData.commentaires}
                  onChangeText={(value) => updateField("commentaires", value)}
                  style={[styles.inputText, styles.textareaInput, { color: textColor }]}
                  placeholder="Commentaires utiles..."
                  placeholderTextColor={labelColor}
                />
              </View>
            </View>
          </View>
        )}

        {activeSection === "assure" && (
          <View style={[styles.blockCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText type="defaultSemiBold" style={[styles.blockTitle, { color: textColor }]}>
              Conducteur habituel
            </ThemedText>

            <Pressable
              style={styles.checkboxRow}
              onPress={() => {
                const nextValue = !formData.conducteurLuiMeme;
                updateField("conducteurLuiMeme", nextValue);
                if (nextValue) {
                  applyClientAsConducteur();
                }
              }}
            >
              <View style={[styles.checkbox, { borderColor }]}> 
                {formData.conducteurLuiMeme && <View style={styles.checkboxDot} />}
              </View>
              <ThemedText style={{ color: textColor }}>
                Le client lui-même est l&apos;assuré
              </ThemedText>
            </Pressable>

            {formData.conducteurLuiMeme ? (
              <View style={[styles.inlineInfo, { borderColor, backgroundColor: mutedBlock }]}>
                <MaterialIcons name="person" size={16} color={primaryColor} />
                <View style={styles.conducteurSummaryWrap}>
                  <ThemedText style={[styles.conducteurSummaryTitle, { color: textColor }]}> 
                    {formData.nomConducteur || "Conducteur basé sur le client"}
                  </ThemedText>
                  <ThemedText style={[styles.conducteurSummaryText, { color: labelColor }]}> 
                    {formData.telConducteur || "Téléphone non renseigné"}
                  </ThemedText>
                  <ThemedText style={[styles.conducteurSummaryText, { color: labelColor }]}> 
                    {formData.emailConducteur || "Email non renseigné"}
                  </ThemedText>
                </View>
              </View>
            ) : (
              <>
                {renderSelect(
                  "Type assuré",
                  formData.libTypeConducteur,
                  () => openPicker("libTypeConducteur", "Choisir le type", TYPES_PERSONNES),
                )}
                {renderSelect(
                  "Profession",
                  formData.libProfessionConducteur,
                  () => openPicker("libProfessionConducteur", "Choisir une profession", professionsOptions),
                )}

                {renderTextInput("Nom assuré", formData.nomConducteur, (value) => updateField("nomConducteur", value))}
                {renderTextInput("Téléphone", formData.telConducteur, (value) => updateField("telConducteur", value), "+225 xx xx xx xx", "phone-pad")}

                {renderTextInput("Email", formData.emailConducteur, (value) => updateField("emailConducteur", value), "email@example.com", "email-address")}
                {renderTextInput("Boite postale", formData.boitePostaleConducteur, (value) => updateField("boitePostaleConducteur", value))}
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderColor, backgroundColor: cardBackground }]}> 
        <Pressable
          style={[styles.footerButton, { backgroundColor: "#46506B", opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={() => goBackWithPayload()}
          disabled={isSubmitting}
        >
          <ThemedText style={styles.footerButtonText}>Annuler</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.footerButton, { backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <ThemedText style={styles.footerButtonText}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </ThemedText>
        </Pressable>
      </View>

      <BottomPickerModal
        visible={pickerState.visible}
        title={pickerState.title}
        options={pickerState.options}
        selectedId={getPickerSelectedId()}
        searchable={
          pickerState.options.length > 8
          || pickerState.field === "libMarque"
          || pickerState.field === "libCouleur"
        }
        creatableFromSearch={pickerState.field === "libMarque" || pickerState.field === "libCouleur"}
        createPrefixLabel="Saisir"
        onSelect={selectPickerOption}
        onClose={closePicker}
      />

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

          <View style={[styles.clientPickerSheet, { backgroundColor: cardBackground, borderColor }]}> 
            <View style={[styles.clientPickerHeaderRow, { borderColor }]}>
              <ThemedText type="defaultSemiBold" style={[styles.clientPickerTitle, { color: textColor }]}> 
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
                  <MaterialIcons name="close" size={24} color={labelColor} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.clientPickerSearchWrap, { backgroundColor: mutedBlock, borderColor }]}> 
              <MaterialIcons name="search" size={18} color={labelColor} />
              <TextInput
                value={clientSearchText}
                onChangeText={setClientSearchText}
                placeholder="Rechercher un client..."
                placeholderTextColor={labelColor}
                style={[styles.clientPickerSearchInput, { color: textColor }]}
              />
            </View>

            <ScrollView style={styles.clientPickerList} showsVerticalScrollIndicator={false}>
              {filteredClients.length === 0 && (
                <View style={styles.clientPickerEmptyState}>
                  <MaterialIcons name="search-off" size={20} color={labelColor} />
                  <ThemedText style={[styles.clientPickerEmptyText, { color: labelColor }]}> 
                    Aucun client trouvé pour cette recherche.
                  </ThemedText>
                </View>
              )}

              {filteredClients.map((currentClient, index) => {
                const key = typeof currentClient.id === "number" ? String(currentClient.id) : `row-${index}`;
                const selected = isSameClient(currentClient);

                return (
                  <View key={key} style={[styles.clientPickerRow, { borderColor }]}> 
                    <View style={styles.clientPickerRowTextWrap}>
                      <ThemedText style={[styles.clientPickerRowTitle, { color: textColor }]}> 
                        {`${currentClient.nom} ${currentClient.prenoms ?? ""}`.trim()}
                      </ThemedText>
                      <ThemedText style={[styles.clientPickerRowCode, { color: labelColor }]}> 
                        {currentClient.code || "Sans code"}
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
                        name={selected ? "check-circle" : "add-circle-outline"}
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
        onSubmit={handleCreateClient}
        title="Créer un client"
      />

      <ClientFormModal
        visible={isClientEditVisible}
        onClose={() => setIsClientEditVisible(false)}
        onSubmit={handleEditClient}
        initialClient={selectedClient}
        title={selectedClient ? `Modifier ${selectedClient.nom}` : "Modifier un client"}
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
  },
  content: {
    paddingTop: 14,
    paddingBottom: 96,
    gap: 12,
  },
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    overflow: "hidden",
  },
  heroAccent: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: "rgba(31,139,130,0.15)",
    right: -40,
    top: -60,
  },
  heroTitle: {
    fontSize: 18,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
  },
  blockCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  blockTitle: {
    fontSize: 16,
  },
  clientHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clientActionIconsRow: {
    flexDirection: "row",
    gap: 8,
  },
  clientActionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    flex: 1,
    gap: 4,
  },
  fieldGroup: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
  inputRow: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
  },
  selectBtn: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectBtnText: {
    flex: 1,
    fontSize: 13,
  },
  textareaRow: {
    minHeight: 108,
    alignItems: "flex-start",
    paddingTop: 10,
  },
  textareaInput: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  grid2: {
    flexDirection: "row",
    gap: 8,
  },
  grid3: {
    flexDirection: "row",
    gap: 8,
  },
  inlineInfo: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  inlineInfoText: {
    flex: 1,
    fontSize: 12,
  },
  checkboxRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
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
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    gap: 10,
  },
  footerButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pickerSheet: {
    borderWidth: 1,
    borderRadius: 14,
    maxHeight: "72%",
  },
  pickerHeader: {
    borderBottomWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerList: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pickerItem: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownItemCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPickerState: {
    paddingVertical: 20,
    alignItems: "center",
  },

  clientPickerBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  clientPickerOverlayTouch: {
    flex: 1,
  },
  clientPickerSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    maxHeight: "80%",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 18,
  },
  clientPickerHeaderRow: {
    borderBottomWidth: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  clientPickerTitle: {
    fontSize: 16,
  },
  clientPickerHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clientHeaderAdd: {
    padding: 2,
  },
  clientPickerSearchWrap: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  clientPickerSearchInput: {
    flex: 1,
    fontSize: 14,
  },
  clientPickerList: {
    marginTop: 10,
  },
  clientPickerRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    minHeight: 54,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  clientPickerRowTextWrap: {
    flex: 1,
    gap: 2,
  },
  clientPickerRowTitle: {
    fontWeight: "700",
    fontSize: 14,
  },
  clientPickerRowCode: {
    fontSize: 12,
  },
  clientPickerAddButton: {
    minWidth: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  clientPickerEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 18,
  },
  clientPickerEmptyText: {
    fontSize: 13,
  },
  conducteurSummaryWrap: {
    flex: 1,
    gap: 2,
  },
  conducteurSummaryTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  conducteurSummaryText: {
    fontSize: 12,
  },
});
