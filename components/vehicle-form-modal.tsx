import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import BottomPickerModal, { PickerOption } from "@/components/ui/bottom-picker-modal";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getfetchParametres } from "@/services/api-service";
import { client } from "@/types/client.type";
import { personne } from "@/types/contrat.type";
import { itemDefaut, params } from "@/types/other.type";
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
type ActivePicker = { title: string; options: PickerOption[]; onSelect: (opt: PickerOption) => void } | null;
type VehicleAssureForm = personne & { bP?: string; libProfession?: string };
type VehicleFormState = Omit<Partial<vehicule>, "dateImmatriculation" | "dateMiseEnCirculation" | "assure"> & {
  numImmatriculation: string;
  dateImmatriculation: string;
  dateMiseEnCirculation: string;
  numSerie: string;
  numCarteGrise: string;
  numMoteur: string;
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
  luiMemeAssure: boolean;
  usageId: number;
  groupeZoneId: number;
  genreId: number;
  typeId: number;
  carrosserieId: number;
  energieId: number;
  marqueId: number;
  couleurId: number;
  categorieId: number;
  sousCategorieId: number;
  villeId: number;
  clientId: number;
  zoneCirculationId: number;
  libGenre: string;
  libType: string;
  libCarrosserie: string;
  libEnergie: string;
  libMarque: string;
  libUsage: string;
  libCategorie: string;
  libSousCategorie: string;
  libGroupeZone: string;
  libZoneCirculation: string;
  assure?: VehicleAssureForm;
};

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

const createEmptyAssure = (): VehicleAssureForm => ({
  nom: "",
  email: "",
  typeId: 1,
  professionId: 0,
  type: "PERSONNE PHYSIQUE",
  tel: "",
  bp: "",
  profession: "",
});

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
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [genreOptions, setGenreOptions] = useState<itemDefaut[]>(GENRES);
  const [typeOptions, setTypeOptions] = useState<itemDefaut[]>(VEHICLE_TYPES);
  const [carrosserieOptions, setCarrosserieOptions] = useState<itemDefaut[]>(CARROSSERIES);
  const [energieOptions, setEnergieOptions] = useState<itemDefaut[]>(ENERGIES);
  const [usageOptions, setUsageOptions] = useState<itemDefaut[]>(USAGES);
  const [villeOptions, setVilleOptions] = useState<itemDefaut[]>(VILLES);
  const [zoneOptions, setZoneOptions] = useState<itemDefaut[]>(ZONES);
  const [marqueOptions, setMarqueOptions] = useState<itemDefaut[]>(MARQUES);
  const [, setCouleurOptions] = useState<itemDefaut[]>(COULEURS);
  const [professionOptions, setProfessionOptions] = useState<itemDefaut[]>(PROFESSIONS);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [formData, setFormData] = useState<VehicleFormState>({
    numImmatriculation: initialVehicle?.numImmatriculation ?? "",
    dateImmatriculation: initialVehicle?.dateImmatriculation ? String(initialVehicle.dateImmatriculation).slice(0, 10) : "",
    dateMiseEnCirculation: initialVehicle?.dateMiseEnCirculation ? String(initialVehicle.dateMiseEnCirculation).slice(0, 10) : "",
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
    libGenre: initialVehicle?.libGenre ?? "",
    libType: initialVehicle?.libType ?? "",
    libCarrosserie: initialVehicle?.libCarrosserie ?? "",
    libEnergie: initialVehicle?.libEnergie ?? "",
    libMarque: initialVehicle?.libMarque ?? "",
    libUsage: initialVehicle?.libUsage ?? "",
    libCategorie: initialVehicle?.libCategorie ?? "",
    libSousCategorie: initialVehicle?.libSousCategorie ?? "",
    libGroupeZone: initialVehicle?.libGroupeZone ?? "",
    libZoneCirculation: initialVehicle?.libZoneCirculation ?? "",
    assure: initialVehicle?.assure
      ? {
          ...initialVehicle.assure,
          bP: initialVehicle.assure.bp,
          libProfession: initialVehicle.assure.profession,
        }
      : createEmptyAssure(),
  });

  useEffect(() => {
    if (!visible || !userToken) return;

    setLoadingOptions(true);
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
        setZoneOptions(payload.zones_circulations?.data ?? ZONES);
        setVilleOptions(payload.groupes_zones?.data ?? VILLES);
      })
      .catch(() => {
        setGenreOptions(GENRES);
        setTypeOptions(VEHICLE_TYPES);
        setCarrosserieOptions(CARROSSERIES);
        setEnergieOptions(ENERGIES);
        setUsageOptions(USAGES);
        setMarqueOptions(MARQUES);
        setCouleurOptions(COULEURS);
        setProfessionOptions(PROFESSIONS);
        setZoneOptions(ZONES);
        setVilleOptions(VILLES);
      })
      .finally(() => setLoadingOptions(false));
  }, [userToken, visible]);

  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F9F9FC";
  const primaryColor = "#1F8B82";

  const updateField = <K extends keyof VehicleFormState>(key: K, value: VehicleFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.numImmatriculation?.trim()) {
      setValidationError("L'immatriculation est obligatoire.");
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      const assureToSubmit = formData.assure
        ? {
            ...formData.assure,
            bp: formData.assure.bP ?? formData.assure.bp ?? "",
            profession: formData.assure.libProfession ?? formData.assure.profession ?? "",
          }
        : undefined;

      const dataToSubmit: Partial<vehicule> = {
        ...formData,
        dateImmatriculation: formData.dateImmatriculation ? new Date(formData.dateImmatriculation) : undefined,
        dateMiseEnCirculation: formData.dateMiseEnCirculation ? new Date(formData.dateMiseEnCirculation) : undefined,
        assure: assureToSubmit,
      };
      onSubmit(dataToSubmit);
      onClose();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    value: string | number | undefined,
    onChangeText: (value: string) => void,
    icon: React.ComponentProps<typeof MaterialIcons>["name"],
    options?: {
      placeholder?: string;
      keyboardType?: "default" | "email-address" | "phone-pad" | "numeric" | "numbers-and-punctuation";
      multiline?: boolean;
      numberOfLines?: number;
    },
  ) => (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <View
        style={[
          styles.inputRow,
          options?.multiline && styles.textareaRow,
          { backgroundColor: inputBg, borderColor },
        ]}
      >
        <MaterialIcons name={icon} size={16} color={labelColor} />
        <TextInput
          style={[
            styles.input,
            { color: textColor },
            options?.multiline && styles.textarea,
          ]}
          value={String(value ?? "")}
          onChangeText={onChangeText}
          placeholder={options?.placeholder ?? "Saisir..."}
          placeholderTextColor={labelColor}
          keyboardType={options?.keyboardType ?? "default"}
          multiline={options?.multiline}
          numberOfLines={options?.numberOfLines}
        />
      </View>
    </View>
  );

  const openPickerFor = (
    title: string,
    options: itemDefaut[],
    onSelect: (option: itemDefaut) => void,
  ) => {
    setActivePicker({
      title,
      options: options.map((o) => ({ id: o.id, label: o.libelle })),
      onSelect: (opt) => {
        const selectedOption = options.find((option) => option.id === opt.id);
        if (selectedOption) {
          onSelect(selectedOption);
        }
      },
    });
  };

  const renderSelectField = (
    label: string,
    value: string | undefined,
    pickerTitle: string,
    pickerOptions: itemDefaut[],
    onSelect: (option: itemDefaut) => void,
    icon: React.ComponentProps<typeof MaterialIcons>["name"],
  ) => (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <Pressable
        style={[styles.selectBtn, { backgroundColor: inputBg, borderColor }]}
        onPress={() => openPickerFor(pickerTitle, pickerOptions, onSelect)}
      >
        <MaterialIcons name={icon} size={16} color={labelColor} />
        <ThemedText
          style={[styles.selectBtnText, { color: value ? textColor : labelColor }]}
          numberOfLines={1}
        >
          {value || "Choisir..."}
        </ThemedText>
        <MaterialIcons name="arrow-drop-down" size={20} color={labelColor} />
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: cardBackground }]}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>{title}</ThemedText>
            <Pressable onPress={onClose} disabled={isSubmitting}>
              <MaterialIcons name="close" size={22} color={labelColor} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Client Info */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Client</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons name="person" size={16} color={labelColor} />
                <ThemedText style={{ color: textColor, flex: 1, fontSize: 14 }}>
                  {selectedClient
                    ? `${selectedClient.nom} ${selectedClient.prenoms ?? ""}`.trim()
                    : "—"}
                </ThemedText>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {(["caracteristiques", "parametres", "conducteur"] as const).map((tab) => {
                const active = activeTab === tab;
                const labels: Record<VehicleFormTab, string> = {
                  caracteristiques: "Caractéristiques",
                  parametres: "Paramètres",
                  conducteur: "Conducteur",
                };
                return (
                  <Pressable
                    key={tab}
                    style={[
                      styles.tabChip,
                      {
                        borderColor: active ? primaryColor : borderColor,
                        backgroundColor: active ? primaryColor + "1A" : inputBg,
                      },
                    ]}
                    onPress={() => { setActiveTab(tab); }}
                  >
                    <ThemedText
                      style={[
                        styles.tabChipText,
                        { color: active ? primaryColor : labelColor, fontWeight: active ? "700" : "500" },
                      ]}
                    >
                      {labels[tab]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* Caractéristiques Tab */}
            {activeTab === "caracteristiques" && (
              <>
                {renderInput("Immatriculation *", formData.numImmatriculation, (v) => updateField("numImmatriculation", v), "directions-car", {
                  placeholder: "AB-123-CI",
                })}

                <View style={styles.rowDuo}>
                  {renderInput("Date immatriculation", formData.dateImmatriculation, (v) => updateField("dateImmatriculation", v), "calendar-today", {
                    placeholder: "AAAA-MM-JJ",
                  })}
                  {renderInput("1ère mise en circulation", formData.dateMiseEnCirculation, (v) => updateField("dateMiseEnCirculation", v), "calendar-today", {
                    placeholder: "AAAA-MM-JJ",
                  })}
                </View>

                <View style={styles.rowDuo}>
                  {renderSelectField("Genre", formData.libGenre, "Genre", genreOptions, (opt) => updateField("libGenre", opt.libelle), "local-shipping")}
                  {renderSelectField("Type", formData.libType, "Type de véhicule", typeOptions, (opt) => updateField("libType", opt.libelle), "category")}
                </View>

                <View style={styles.rowDuo}>
                  {renderSelectField("Carrosserie", formData.libCarrosserie, "Carrosserie", carrosserieOptions, (opt) => updateField("libCarrosserie", opt.libelle), "car-rental")}
                  {renderSelectField("Énergie", formData.libEnergie, "Énergie", energieOptions, (opt) => updateField("libEnergie", opt.libelle), "local-gas-station")}
                </View>

                <View style={styles.rowDuo}>
                  {renderSelectField("Marque", formData.libMarque, "Marque", marqueOptions, (opt) => updateField("libMarque", opt.libelle), "badge")}
                  {renderInput("Modèle", formData.modele, (v) => updateField("modele", v), "description")}
                </View>

                <View style={styles.rowDuo}>
                  {renderInput("Série", formData.numSerie, (v) => updateField("numSerie", v), "tag")}
                  {renderInput("Carte grise", formData.numCarteGrise, (v) => updateField("numCarteGrise", v), "description")}
                </View>

                <View style={styles.rowDuo}>
                  {renderInput("Places", formData.nbPlaces, (v) => updateField("nbPlaces", parseInt(v) || 0), "event-seat", { keyboardType: "numeric" })}
                  {renderInput("Charge utile (kg)", formData.chargeUtile, (v) => updateField("chargeUtile", parseInt(v) || 0), "scale", { keyboardType: "numeric" })}
                </View>

                <View style={styles.rowDuo}>
                  {renderInput("Cylindrée (cc)", formData.cylindree, (v) => updateField("cylindree", parseInt(v) || 0), "settings", { keyboardType: "numeric" })}
                  {renderInput("Puissance (ch)", formData.puissance, (v) => updateField("puissance", parseInt(v) || 0), "bolt", { keyboardType: "numeric" })}
                </View>

                <View style={styles.rowDuo}>
                  {renderInput("Valeur neuve (XOF)", formData.valeurNeuve, (v) => updateField("valeurNeuve", parseInt(v) || 0), "attach-money", { keyboardType: "numeric" })}
                  {renderInput("Valeur vénale (XOF)", formData.valeurVenale, (v) => updateField("valeurVenale", parseInt(v) || 0), "trending-down", { keyboardType: "numeric" })}
                </View>

                {renderInput("Type commercial", formData.typeCommercial, (v) => updateField("typeCommercial", v), "label")}
              </>
            )}

            {/* Paramètres Tab */}
            {activeTab === "parametres" && (
              <>
                <View style={styles.rowDuo}>
                  {renderSelectField("Usage", formData.libUsage, "Usage", usageOptions, (opt) => updateField("libUsage", opt.libelle), "directions")}
                  {renderSelectField("Catégorie", formData.libCategorie, "Catégorie", CATEGORIES, (opt) => updateField("libCategorie", opt.libelle), "folder")}
                </View>

                <View style={styles.rowDuo}>
                  {renderSelectField("S/Catégorie", formData.libSousCategorie, "Sous-catégorie", SOUS_CATEGORIES, (opt) => updateField("libSousCategorie", opt.libelle), "folder-open")}
                  {renderSelectField("Zone circulation", formData.libZoneCirculation, "Zone de circulation", zoneOptions, (opt) => updateField("libZoneCirculation", opt.libelle), "public")}
                </View>

                <View style={styles.rowDuo}>
                  {renderSelectField("Ville", formData.libGroupeZone, "Ville", villeOptions, (opt) => updateField("libGroupeZone", opt.libelle), "location-city")}
                  {renderInput("N° cartes", formData.nbCartes, (v) => updateField("nbCartes", parseInt(v) || 0), "credit-card", { keyboardType: "numeric" })}
                </View>

                {renderInput("Commentaires", formData.commentaires, (v) => updateField("commentaires", v), "comment", {
                  multiline: true,
                  numberOfLines: 3,
                  placeholder: "Notes...",
                })}
              </>
            )}

            {/* Conducteur Tab */}
            {activeTab === "conducteur" && (
              <>
                <View style={styles.fieldGroup}>
                  <View style={styles.checkboxRow}>
                    <Pressable
                      style={[styles.checkbox, { borderColor }]}
                      onPress={() => updateField("luiMemeAssure", !formData.luiMemeAssure)}
                    >
                      {formData.luiMemeAssure && <View style={[styles.checkboxDot, { backgroundColor: primaryColor }]} />}
                    </Pressable>
                    <ThemedText style={{ color: textColor, flex: 1 }}>Client = Assuré</ThemedText>
                  </View>
                </View>

                {!formData.luiMemeAssure && (
                  <>
                    {renderInput("Nom assuré", formData.assure?.nom ?? "", (v) => {
                      const base = formData.assure ?? createEmptyAssure();
                      updateField("assure", { ...base, nom: v });
                    }, "person")}

                    <View style={styles.rowDuo}>
                      {renderInput("Téléphone", formData.assure?.tel ?? "", (v) => {
                        const base = formData.assure ?? createEmptyAssure();
                        updateField("assure", { ...base, tel: v });
                      }, "phone", { keyboardType: "phone-pad", placeholder: "+225 xx xx xx xx" })}
                      {renderInput("Email", formData.assure?.email ?? "", (v) => {
                        const base = formData.assure ?? createEmptyAssure();
                        updateField("assure", { ...base, email: v });
                      }, "email", { keyboardType: "email-address", placeholder: "email@example.com" })}
                    </View>

                    {renderInput("Boîte postale", formData.assure?.bP ?? formData.assure?.bp ?? "", (v) => {
                      const base = formData.assure ?? createEmptyAssure();
                      updateField("assure", { ...base, bp: v, bP: v });
                    }, "markunread-mailbox")}

                    {renderSelectField("Profession", formData.assure?.libProfession ?? formData.assure?.profession, "Profession", professionOptions, (opt) => {
                      const base = formData.assure ?? createEmptyAssure();
                      updateField("assure", { ...base, profession: opt.libelle, libProfession: opt.libelle, professionId: opt.id });
                    }, "work-outline")}
                  </>
                )}
              </>
            )}

            {validationError && (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={14} color="#E05252" />
                <ThemedText style={styles.errorText}>{validationError}</ThemedText>
              </View>
            )}

            <Pressable
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitBtnText}>Enregistrer</ThemedText>
              )}
            </Pressable>

            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      </View>

      <BottomPickerModal
        visible={activePicker !== null}
        title={activePicker?.title ?? ""}
        options={activePicker?.options ?? []}
        loading={loadingOptions}
        searchable={(activePicker?.options.length ?? 0) > 8}
        onSelect={(opt) => { activePicker?.onSelect(opt); setActivePicker(null); }}
        onClose={() => setActivePicker(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, paddingHorizontal: 16, maxHeight: "92%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  textareaRow: { alignItems: "flex-start" },
  input: { flex: 1, fontSize: 14 },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  rowDuo: { flexDirection: "row", gap: 10 },
  selectBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  selectBtnText: { flex: 1, fontSize: 14 },
  pickerDropdown: { borderRadius: 10, overflow: "hidden", marginBottom: 6, maxHeight: 220 },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 10 },
  pickerOptionText: { fontSize: 14 },
  pickerEmptyState: { paddingHorizontal: 12, paddingVertical: 14 },
  pickerEmptyStateText: { fontSize: 13 },
  tabRow: { flexDirection: "row", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  tabChip: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 9 },
  tabChipText: { fontSize: 12 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  checkboxDot: { width: 12, height: 12, borderRadius: 2 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFE5E5", borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: "#E05252", fontSize: 12, flex: 1 },
  submitBtn: { backgroundColor: "#1F8B82", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});


