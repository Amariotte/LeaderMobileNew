import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { vehiculesFakeData } from "@/data/datas.fake";
import { useColorScheme } from "@/hooks/use-color-scheme";
import COLORS from "@/styles/colors";
import { client } from "@/types/client.type";
import { contrat } from "@/types/contrat.type";
import { vehicule } from "@/types/vehicule.type";

// ─── Static fake data ──────────────────────────────────────────────────────────

const COMPAGNIES = ["NSIA", "AXA", "SUNU", "ALLIANZ", "SAHAM", "ACTIVA", "COLINA"];
const AGENCES = ["SCA NOUVELLE ERE", "AGENCE ABIDJAN", "AGENCE PLATEAU", "AGENCE YOPOUGON"];
const COUVERTURES = ["RC Simple", "Tierce Collision", "Tous Risques", "Tierce Complète"];
const DUREES = ["1 mois", "3 mois", "6 mois", "12 mois"];

const GARANTIES_CATALOGUE = [
  { id: 1, code: "RC", libelle: "Responsabilité Civile", primeBase: 45000, obligatoire: true },
  { id: 2, code: "INCENDIE", libelle: "Incendie & Explosion", primeBase: 12000, obligatoire: false },
  { id: 3, code: "VOL", libelle: "Vol & Tentative de Vol", primeBase: 15000, obligatoire: false },
  { id: 4, code: "BDGD", libelle: "Bris de Glace", primeBase: 8000, obligatoire: false },
  { id: 5, code: "TIERCE", libelle: "Tierce Collision", primeBase: 30000, obligatoire: false },
  { id: 6, code: "DR", libelle: "Dommages aux Tiers", primeBase: 20000, obligatoire: false },
  { id: 7, code: "CEDEAO", libelle: "Carte CEDEAO", primeBase: 5000, obligatoire: false },
  { id: 8, code: "ASSIST", libelle: "Assistance Dépannage", primeBase: 7000, obligatoire: false },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type GarantieSelected = {
  id: number;
  code: string;
  libelle: string;
  prime: number;
};

type ContratFormData = {
  // Step 1
  vehicule?: vehicule;
  // Step 2
  souscripteurMemeAssure: boolean;
  assureNom: string;
  assureTel: string;
  assureEmail: string;
  assureBp: string;
  assureProfession: string;
  souscripteurNom: string;
  souscripteurTel: string;
  souscripteurEmail: string;
  souscripteurBp: string;
  // Step 3
  compagnie: string;
  agence: string;
  couverture: string;
  duree: string;
  dateEffet: string;
  dateEcheance: string;
  // Step 4
  garantiesSelectionnees: GarantieSelected[];
};

type ContractSelectField = "compagnie" | "agence" | "couverture" | "duree";

const formatDate = (d?: Date | string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("fr-FR");
};

const toInputDate = (value: unknown, fallback: Date) => {
  if (!value) return fallback.toISOString().slice(0, 10);
  const dt = value instanceof Date ? value : new Date(String(value));
  if (isNaN(dt.getTime())) return fallback.toISOString().slice(0, 10);
  return dt.toISOString().slice(0, 10);
};

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <View
              style={[
                stepStyles.circle,
                done && stepStyles.circleDone,
                active && stepStyles.circleActive,
              ]}
            >
              {done ? (
                <MaterialIcons name="check" size={14} color="#fff" />
              ) : (
                <ThemedText style={[stepStyles.circleText, active && { color: "#fff" }]}>
                  {step}
                </ThemedText>
              )}
            </View>
            {i < total - 1 && (
              <View style={[stepStyles.line, done && stepStyles.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 0,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#C5C9DA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F1F8",
  },
  circleActive: {
    borderColor: COLORS.primaryColor,
    backgroundColor: COLORS.primaryColor,
  },
  circleDone: {
    borderColor: COLORS.primaryColor,
    backgroundColor: COLORS.primaryColor,
  },
  circleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9096B2",
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: "#C5C9DA",
    marginHorizontal: 2,
  },
  lineDone: {
    backgroundColor: COLORS.primaryColor,
  },
});

// ─── Step labels ───────────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Véhicule",
  "Personnes",
  "Conditions",
  "Garanties",
  "Résumé",
];

// ─── Main component ────────────────────────────────────────────────────────────

export default function ContratFormScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { mode, clientData, vehiculeData, contractData } = useLocalSearchParams<{
    mode?: "create" | "edit";
    clientData?: string;
    vehiculeData?: string;
    contractData?: string;
  }>();

  const isEditMode = mode === "edit";

  const initialClient = useMemo<client | undefined>(() => {
    if (!clientData) return undefined;
    try { return JSON.parse(clientData); } catch { return undefined; }
  }, [clientData]);

  const initialVehicule = useMemo<vehicule | undefined>(() => {
    if (!vehiculeData) return undefined;
    try { return JSON.parse(vehiculeData); } catch { return undefined; }
  }, [vehiculeData]);

  const initialContract = useMemo<contrat | undefined>(() => {
    if (!contractData) return undefined;
    try { return JSON.parse(contractData); } catch { return undefined; }
  }, [contractData]);

  const vehicleFromContract = useMemo<vehicule | undefined>(() => {
    if (!initialContract) return undefined;
    if (initialContract.vehicule) return initialContract.vehicule;
    return vehiculesFakeData.data.find(
      (v) => v.numImmatriculation === initialContract.immatriculation,
    );
  }, [initialContract]);

  const selectedInitialVehicule = vehicleFromContract ?? initialVehicule;

  const [step, setStep] = useState(1);
  const [immatSearch, setImmatSearch] = useState(
    selectedInitialVehicule?.numImmatriculation ?? initialContract?.immatriculation ?? "",
  );
  const [searchResult, setSearchResult] = useState<vehicule | undefined>(selectedInitialVehicule);
  const [notFound, setNotFound] = useState(false);

  const assureNomInitial =
    initialContract?.assureNom ??
    (initialClient ? `${initialClient.nom} ${initialClient.prenom}`.trim() : "");
  const assureTelInitial = initialContract?.assureTel ?? initialClient?.tel ?? initialClient?.mobile ?? "";
  const assureEmailInitial = initialContract?.assureEmail ?? initialClient?.email ?? "";
  const assureBpInitial = initialContract?.assureBp ?? initialClient?.boitePostale ?? "";
  const assureProfessionInitial = initialContract?.assureProfession ?? initialClient?.libProfession ?? "";
  const souscripteurNomInitial =
    initialContract?.souscripteurNom ??
    (initialClient ? `${initialClient.nom} ${initialClient.prenom}`.trim() : "");
  const souscripteurTelInitial =
    initialContract?.souscripteurTel ?? initialClient?.tel ?? initialClient?.mobile ?? "";
  const souscripteurEmailInitial = initialContract?.souscripteurEmail ?? initialClient?.email ?? "";
  const souscripteurBpInitial = initialContract?.souscripteurBp ?? initialClient?.boitePostale ?? "";

  const [form, setForm] = useState<ContratFormData>({
    vehicule: selectedInitialVehicule,
    souscripteurMemeAssure:
      !initialContract ||
      (assureNomInitial === souscripteurNomInitial && assureTelInitial === souscripteurTelInitial),
    assureNom: assureNomInitial,
    assureTel: assureTelInitial,
    assureEmail: assureEmailInitial,
    assureBp: assureBpInitial,
    assureProfession: assureProfessionInitial,
    souscripteurNom: souscripteurNomInitial,
    souscripteurTel: souscripteurTelInitial,
    souscripteurEmail: souscripteurEmailInitial,
    souscripteurBp: souscripteurBpInitial,
    compagnie: initialContract?.compagnie ?? COMPAGNIES[0],
    agence: initialContract?.agence ?? AGENCES[0],
    couverture: initialContract?.couverture ?? COUVERTURES[0],
    duree: initialContract?.duree ?? DUREES[3],
    dateEffet: toInputDate(initialContract?.dateEffet, new Date()),
    dateEcheance: toInputDate(
      initialContract?.dateEcheance,
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    ),
    garantiesSelectionnees: [
      { id: 1, code: "RC", libelle: "Responsabilité Civile", prime: 45000 },
    ],
  });

  // ── Colors ────────────────────────────────────────────────────────────────────
  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#E0E3F0";
  const textColor = isDark ? "#FFFFFF" : "#1E2330";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F4F5F9";
  const softBlock = isDark ? "#242735" : "#F2F3F8";
  const mutedText = isDark ? "#A8AEC7" : "#8B90A5";

  const [pickerState, setPickerState] = useState<{
    visible: boolean;
    field?: ContractSelectField;
    title: string;
    options: string[];
  }>({
    visible: false,
    title: "",
    options: [],
  });

  const update = <K extends keyof ContratFormData>(key: K, value: ContratFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Navigation ───────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 1 && !form.vehicule) {
      Alert.alert("Véhicule requis", "Veuillez sélectionner ou créer un véhicule.");
      return;
    }
    if (step < 5) setStep((s) => s + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.back();
  };

  // ─── Step 1: Recherche véhicule ───────────────────────────────────────────────
  const handleSearch = () => {
    const q = immatSearch.trim().toLowerCase();
    if (!q) return;
    const found = vehiculesFakeData.data.find(
      (v) => v.numImmatriculation.toLowerCase() === q,
    );
    if (found) {
      setSearchResult(found);
      setNotFound(false);
      update("vehicule", found);
    } else {
      setSearchResult(undefined);
      setNotFound(true);
      update("vehicule", undefined);
    }
  };

  const handleCreateVehicule = () => {
    router.push({
      pathname: "/(commerce)/vehicules/form",
      params: {
        mode: "create",
        clientData,
        returnTo: "contrats",
      },
    });
  };

  const handleSelectVehicule = (v: vehicule) => {
    setSearchResult(v);
    setNotFound(false);
    update("vehicule", v);
  };

  // ─── Step 4: Garanties ────────────────────────────────────────────────────────
  const isGarantieSelected = (id: number) =>
    form.garantiesSelectionnees.some((g) => g.id === id);

  const toggleGarantie = (g: typeof GARANTIES_CATALOGUE[number]) => {
    if (g.obligatoire) return; // RC cannot be deselected
    if (isGarantieSelected(g.id)) {
      update(
        "garantiesSelectionnees",
        form.garantiesSelectionnees.filter((sel) => sel.id !== g.id),
      );
    } else {
      update("garantiesSelectionnees", [
        ...form.garantiesSelectionnees,
        { id: g.id, code: g.code, libelle: g.libelle, prime: g.primeBase },
      ]);
    }
  };

  const totalPrimeNette = form.garantiesSelectionnees.reduce(
    (acc, g) => acc + g.prime, 0,
  );
  const taxe = Math.round(totalPrimeNette * 0.14);
  const fga = Math.round(totalPrimeNette * 0.015);
  const accessoires = 5000;
  const netAPayer = totalPrimeNette + taxe + fga + accessoires;

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const money = (n: number) =>
    n.toLocaleString("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 });

  const renderField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { placeholder?: string; keyboard?: "default" | "phone-pad" | "email-address"; editable?: boolean },
  ) => (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
        value={value}
        onChangeText={onChange}
        placeholder={opts?.placeholder ?? ""}
        placeholderTextColor={mutedText}
        keyboardType={opts?.keyboard ?? "default"}
        editable={opts?.editable !== false}
      />
    </View>
  );

  const renderSelect = (
    field: ContractSelectField,
    label: string,
    value: string,
    options: string[],
  ) => (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <Pressable
        onPress={() => openSelectPicker(field, label, options)}
        style={[styles.comboInput, { backgroundColor: inputBg, borderColor }]}
      >
        <ThemedText style={[styles.comboText, { color: value ? textColor : mutedText }]}>
          {value || "Sélectionner..."}
        </ThemedText>
        <MaterialIcons name="expand-more" size={20} color={mutedText} />
      </Pressable>
    </View>
  );

  const openSelectPicker = (
    field: ContractSelectField,
    title: string,
    options: string[],
  ) => {
    setPickerState({
      visible: true,
      field,
      title,
      options,
    });
  };

  const closeSelectPicker = () => {
    setPickerState((prev) => ({ ...prev, visible: false }));
  };

  const selectPickerOption = (value: string) => {
    if (pickerState.field) {
      update(pickerState.field, value as ContratFormData[ContractSelectField]);
    }
    closeSelectPicker();
  };

  // ─── Card vehicles list ───────────────────────────────────────────────────────
  const renderVehiculeCard = (v: vehicule, selected = false) => (
    <Pressable
      key={v.id}
      onPress={() => handleSelectVehicule(v)}
      style={[
        styles.vehiculeCard,
        {
          backgroundColor: cardBackground,
          borderColor: selected ? COLORS.primaryColor : borderColor,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.vehiculePlate, { backgroundColor: COLORS.primaryColor + "22" }]}>
        <MaterialIcons name="directions-car" size={18} color={COLORS.primaryColor} />
        <ThemedText style={[styles.vehiculePlateText, { color: COLORS.primaryColor }]}>
          {v.numImmatriculation}
        </ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.vehiculeMeta, { color: textColor }]}>
          {v.libMarque ?? "—"} • {v.modele ?? "—"}
        </ThemedText>
        <ThemedText style={[styles.vehiculeSubMeta, { color: mutedText }]}>
          {v.libGenre ?? ""} {v.libEnergie ? `• ${v.libEnergie}` : ""}
        </ThemedText>
      </View>
      {selected && <MaterialIcons name="check-circle" size={22} color={COLORS.primaryColor} />}
    </Pressable>
  );

  // ─── Steps ────────────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.stepTitle, { color: textColor }]}>Recherche du véhicule</ThemedText>
      <ThemedText style={[styles.stepSub, { color: mutedText }]}>
        Saisissez le numéro d&apos;immatriculation pour rechercher un véhicule existant.
      </ThemedText>

      <View style={[styles.searchRow]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: inputBg, borderColor, color: textColor, flex: 1 }]}
          placeholder="Ex: AB-123-CD"
          placeholderTextColor={mutedText}
          value={immatSearch}
          onChangeText={setImmatSearch}
          autoCapitalize="characters"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={[styles.searchBtn, { backgroundColor: COLORS.primaryColor }]} onPress={handleSearch}>
          <MaterialIcons name="search" size={20} color="#fff" />
        </Pressable>
      </View>

      {searchResult && (
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: COLORS.primaryColor }]}>Véhicule trouvé</ThemedText>
          {renderVehiculeCard(searchResult, form.vehicule?.id === searchResult.id)}
        </View>
      )}

      {notFound && (
        <View style={[styles.notFoundBox, { backgroundColor: softBlock, borderColor }]}>
          <MaterialIcons name="info-outline" size={20} color={mutedText} />
          <ThemedText style={[styles.notFoundText, { color: mutedText }]}>
            Aucun véhicule trouvé avec cette immatriculation.
          </ThemedText>
        </View>
      )}

      {/* Client vehicles */}
      {initialClient?.vehicules && initialClient.vehicules.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={[styles.sectionLabel, { color: labelColor }]}>
            Véhicules du client
          </ThemedText>
          {initialClient.vehicules.map((v) =>
            renderVehiculeCard(v, form.vehicule?.id === v.id),
          )}
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <Pressable style={[styles.outlineBtn, { borderColor: COLORS.primaryColor }]} onPress={handleCreateVehicule}>
        <MaterialIcons name="add" size={18} color={COLORS.primaryColor} />
        <ThemedText style={[styles.outlineBtnText, { color: COLORS.primaryColor }]}>
          Créer un nouveau véhicule
        </ThemedText>
      </Pressable>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.stepTitle, { color: textColor }]}>Souscripteur & Assuré</ThemedText>

      {/* Vehicle recap */}
      {form.vehicule && (
        <View style={[styles.recapBox, { backgroundColor: COLORS.primaryColor + "15", borderColor: COLORS.primaryColor + "40" }]}>
          <MaterialIcons name="directions-car" size={16} color={COLORS.primaryColor} />
          <ThemedText style={[styles.recapText, { color: COLORS.primaryColor }]}>
            {form.vehicule.numImmatriculation} — {form.vehicule.libMarque ?? ""} {form.vehicule.modele ?? ""}
          </ThemedText>
        </View>
      )}

      {form.vehicule && (
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.cardTitleRow}>
            <MaterialIcons name="directions-car" size={16} color={COLORS.primaryColor} />
            <ThemedText style={[styles.cardTitle, { color: COLORS.primaryColor }]}>Véhicule</ThemedText>
          </View>

          {[
            ["Immatriculation", form.vehicule.numImmatriculation],
            ["Marque / Modèle", `${form.vehicule.libMarque ?? "—"} ${form.vehicule.modele ?? ""}`.trim()],
            ["Genre", form.vehicule.libGenre ?? "—"],
            ["Usage", form.vehicule.libUsage ?? "—"],
            ["Catégorie", form.vehicule.libCategorie ?? "—"],
            ["Sous-catégorie", form.vehicule.libSousCategorie ?? "—"],
            ["Énergie", form.vehicule.libEnergie ?? "—"],
            ["Carrosserie", form.vehicule.libCarrosserie ?? "—"],
            ["Puissance", `${form.vehicule.puissance ?? 0} CV`],
            ["Cylindrée", `${form.vehicule.cylindree ?? 0} cm3`],
            ["Nombre de places", `${form.vehicule.nbPlaces ?? 0}`],
            ["Nbre de cartes", `${form.vehicule.nbCartes ?? 0}`],
            ["Numéro de série", form.vehicule.numSerie ?? "—"],
            ["Numéro carte grise", form.vehicule.numCarteGrise ?? "—"],
            ["Date d'immatriculation", formatDate(form.vehicule.dateImmatriculation) || "—"],
            ["Date 1ère mise en service", formatDate(form.vehicule.dateMiseEnCirculation) || "—"],
          ].map(([label, value]) => (
            <View key={label} style={[styles.vehicleInfoRow, { borderBottomColor: borderColor }]}> 
              <ThemedText style={[styles.vehicleInfoLeft, { color: labelColor }]}>{label}</ThemedText>
              <ThemedText style={[styles.vehicleInfoRight, { color: textColor }]}>{value}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Same person toggle */}
      <Pressable
        onPress={() => update("souscripteurMemeAssure", !form.souscripteurMemeAssure)}
        style={[styles.toggleRow, { backgroundColor: softBlock, borderColor }]}
      >
        <View style={[styles.checkbox, {
          borderColor: form.souscripteurMemeAssure ? COLORS.primaryColor : borderColor,
          backgroundColor: form.souscripteurMemeAssure ? COLORS.primaryColor : "transparent",
        }]}>
          {form.souscripteurMemeAssure && <MaterialIcons name="check" size={14} color="#fff" />}
        </View>
        <ThemedText style={[styles.toggleLabel, { color: textColor }]}>
          Le souscripteur est aussi l&apos;assuré
        </ThemedText>
      </Pressable>

      {/* Assuré */}
      <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="person" size={16} color={COLORS.primaryColor} />
          <ThemedText style={[styles.cardTitle, { color: COLORS.primaryColor }]}>Assuré</ThemedText>
        </View>
        {renderField("Nom complet", form.assureNom, (v) => update("assureNom", v), { placeholder: "Nom et prénom" })}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>{renderField("Téléphone", form.assureTel, (v) => update("assureTel", v), { keyboard: "phone-pad" })}</View>
          <View style={{ flex: 1 }}>{renderField("Email", form.assureEmail, (v) => update("assureEmail", v), { keyboard: "email-address" })}</View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>{renderField("Boîte postale", form.assureBp, (v) => update("assureBp", v))}</View>
          <View style={{ flex: 1 }}>{renderField("Profession", form.assureProfession, (v) => update("assureProfession", v))}</View>
        </View>
      </View>

      {/* Souscripteur */}
      {!form.souscripteurMemeAssure && (
        <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.cardTitleRow}>
            <MaterialIcons name="person-outline" size={16} color={labelColor} />
            <ThemedText style={[styles.cardTitle, { color: labelColor }]}>Souscripteur</ThemedText>
          </View>
          {renderField("Nom complet", form.souscripteurNom, (v) => update("souscripteurNom", v), { placeholder: "Nom et prénom" })}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>{renderField("Téléphone", form.souscripteurTel, (v) => update("souscripteurTel", v), { keyboard: "phone-pad" })}</View>
            <View style={{ flex: 1 }}>{renderField("Email", form.souscripteurEmail, (v) => update("souscripteurEmail", v), { keyboard: "email-address" })}</View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>{renderField("Boîte postale", form.souscripteurBp, (v) => update("souscripteurBp", v))}</View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <ThemedText style={[styles.stepTitle, { color: textColor }]}>Conditions du contrat</ThemedText>

      <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="business" size={16} color={COLORS.primaryColor} />
          <ThemedText style={[styles.cardTitle, { color: COLORS.primaryColor }]}>Compagnie & Agence</ThemedText>
        </View>
        {renderSelect("compagnie", "Compagnie d'assurance", form.compagnie, COMPAGNIES)}
        {renderSelect("agence", "Agence", form.agence, AGENCES)}
      </View>

      <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="shield" size={16} color={COLORS.primaryColor} />
          <ThemedText style={[styles.cardTitle, { color: COLORS.primaryColor }]}>Couverture & Durée</ThemedText>
        </View>
        {renderSelect("couverture", "Type de couverture", form.couverture, COUVERTURES)}
        {renderSelect("duree", "Durée", form.duree, DUREES)}
      </View>

      <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.cardTitleRow}>
          <MaterialIcons name="calendar-today" size={16} color={COLORS.primaryColor} />
          <ThemedText style={[styles.cardTitle, { color: COLORS.primaryColor }]}>Dates</ThemedText>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>{renderField("Date d'effet", form.dateEffet, (v) => update("dateEffet", v), { placeholder: "AAAA-MM-JJ" })}</View>
          <View style={{ flex: 1 }}>{renderField("Date d'échéance", form.dateEcheance, (v) => update("dateEcheance", v), { placeholder: "AAAA-MM-JJ" })}</View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.stepTitle, { color: textColor }]}>Garanties</ThemedText>
        <ThemedText style={[styles.stepSub, { color: mutedText }]}>
          Sélectionnez les garanties souhaitées. La RC est obligatoire.
        </ThemedText>

        {GARANTIES_CATALOGUE.map((g) => {
          const selected = isGarantieSelected(g.id);
          return (
            <Pressable
              key={g.id}
              onPress={() => toggleGarantie(g)}
              style={[
                styles.garantieRow,
                {
                  backgroundColor: selected ? COLORS.primaryColor + "12" : cardBackground,
                  borderColor: selected ? COLORS.primaryColor : borderColor,
                },
              ]}
            >
              <View style={[
                styles.garantieCheck,
                {
                  borderColor: g.obligatoire || selected ? COLORS.primaryColor : borderColor,
                  backgroundColor: g.obligatoire || selected ? COLORS.primaryColor : "transparent",
                },
              ]}>
                {(g.obligatoire || selected) && <MaterialIcons name="check" size={14} color="#fff" />}
              </View>

              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.garantieLib, { color: textColor }]}>
                  {g.libelle}
                  {g.obligatoire && (
                    <ThemedText style={{ color: COLORS.primaryColor, fontSize: 11 }}> (obligatoire)</ThemedText>
                  )}
                </ThemedText>
                <ThemedText style={[styles.garantieCode, { color: mutedText }]}>{g.code}</ThemedText>
              </View>

              <ThemedText style={[styles.garantiePrime, { color: selected || g.obligatoire ? COLORS.primaryColor : mutedText }]}>
                {money(g.primeBase)}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Totaux sticky */}
      <View style={[styles.totauxBox, { backgroundColor: cardBackground, borderColor }]}>
        <View style={styles.totauxRow}>
          <ThemedText style={[styles.totauxLabel, { color: mutedText }]}>Prime nette</ThemedText>
          <ThemedText style={[styles.totauxVal, { color: textColor }]}>{money(totalPrimeNette)}</ThemedText>
        </View>
        <View style={styles.totauxRow}>
          <ThemedText style={[styles.totauxLabel, { color: mutedText }]}>Taxes (14%)</ThemedText>
          <ThemedText style={[styles.totauxVal, { color: textColor }]}>{money(taxe)}</ThemedText>
        </View>
        <View style={styles.totauxRow}>
          <ThemedText style={[styles.totauxLabel, { color: mutedText }]}>FGA (1.5%)</ThemedText>
          <ThemedText style={[styles.totauxVal, { color: textColor }]}>{money(fga)}</ThemedText>
        </View>
        <View style={styles.totauxRow}>
          <ThemedText style={[styles.totauxLabel, { color: mutedText }]}>Accessoires</ThemedText>
          <ThemedText style={[styles.totauxVal, { color: textColor }]}>{money(accessoires)}</ThemedText>
        </View>
        <View style={[styles.totauxDivider, { backgroundColor: borderColor }]} />
        <View style={styles.totauxRow}>
          <ThemedText style={[styles.totauxLabelBold, { color: textColor }]}>Net à payer</ThemedText>
          <ThemedText style={[styles.totauxTotal, { color: COLORS.primaryColor }]}>{money(netAPayer)}</ThemedText>
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => {
    const souscripteurNom = form.souscripteurMemeAssure ? form.assureNom : form.souscripteurNom;
    return (
      <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.stepTitle, { color: textColor }]}>Résumé & Validation</ThemedText>

        {/* Véhicule */}
        <View style={[styles.resumeCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.resumeHeader}>
            <MaterialIcons name="directions-car" size={16} color={COLORS.primaryColor} />
            <ThemedText style={[styles.resumeHeaderText, { color: COLORS.primaryColor }]}>Véhicule</ThemedText>
          </View>
          <ResumeRow label="Immatriculation" value={form.vehicule?.numImmatriculation} />
          <ResumeRow label="Marque / Modèle" value={`${form.vehicule?.libMarque ?? "—"} ${form.vehicule?.modele ?? ""}`.trim()} />
          <ResumeRow label="Genre" value={form.vehicule?.libGenre} />
          <ResumeRow label="Usage" value={form.vehicule?.libUsage} />
          <ResumeRow label="Catégorie" value={form.vehicule?.libCategorie} />
          <ResumeRow label="Sous-catégorie" value={form.vehicule?.libSousCategorie} />
          <ResumeRow label="Énergie" value={form.vehicule?.libEnergie} />
          <ResumeRow label="Carrosserie" value={form.vehicule?.libCarrosserie} />
          <ResumeRow label="Puissance" value={`${form.vehicule?.puissance ?? 0} CV`} />
          <ResumeRow label="Cylindrée" value={`${form.vehicule?.cylindree ?? 0} cm3`} />
          <ResumeRow label="Nombre de places" value={`${form.vehicule?.nbPlaces ?? 0}`} />
          <ResumeRow label="Nbre de cartes" value={`${form.vehicule?.nbCartes ?? 0}`} />
          <ResumeRow label="Numéro de série" value={form.vehicule?.numSerie} />
          <ResumeRow label="Numéro carte grise" value={form.vehicule?.numCarteGrise} />
          <ResumeRow label="Date d'immatriculation" value={formatDate(form.vehicule?.dateImmatriculation)} />
          <ResumeRow label="Date 1ère mise en service" value={formatDate(form.vehicule?.dateMiseEnCirculation)} />
        </View>

        {/* Personnes */}
        <View style={[styles.resumeCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.resumeHeader}>
            <MaterialIcons name="people" size={16} color={COLORS.primaryColor} />
            <ThemedText style={[styles.resumeHeaderText, { color: COLORS.primaryColor }]}>Personnes</ThemedText>
          </View>
          <ResumeRow label="Assuré" value={form.assureNom} labelColor={labelColor} />
          <ResumeRow label="Téléphone assuré" value={form.assureTel} labelColor={labelColor} />
          <ResumeRow label="Souscripteur" value={souscripteurNom || form.assureNom} labelColor={labelColor} />
        </View>

        {/* Contrat */}
        <View style={[styles.resumeCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.resumeHeader}>
            <MaterialIcons name="description" size={16} color={COLORS.primaryColor} />
            <ThemedText style={[styles.resumeHeaderText, { color: COLORS.primaryColor }]}>Contrat</ThemedText>
          </View>
          <ResumeRow label="Compagnie" value={form.compagnie} />
          <ResumeRow label="Agence" value={form.agence} />
          <ResumeRow label="Couverture" value={form.couverture} />
          <ResumeRow label="Durée" value={form.duree} />
          <ResumeRow label="Date d'effet" value={form.dateEffet} />
          <ResumeRow label="Date d'échéance" value={form.dateEcheance} />
        </View>

        {/* Garanties */}
        <View style={[styles.resumeCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.resumeHeader}>
            <MaterialIcons name="shield" size={16} color={COLORS.primaryColor} />
            <ThemedText style={[styles.resumeHeaderText, { color: COLORS.primaryColor }]}>Garanties sélectionnées</ThemedText>
          </View>
          {form.garantiesSelectionnees.map((g) => (
            <View key={g.id} style={styles.resumeGarantieRow}>
              <MaterialIcons name="check-circle" size={14} color={COLORS.primaryColor} />
              <ThemedText style={[styles.resumeGarantieLib, { color: textColor }]}>{g.libelle}</ThemedText>
              <ThemedText style={[styles.resumeGarantiePrime, { color: COLORS.primaryColor }]}>{money(g.prime)}</ThemedText>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={[styles.resumeCard, { backgroundColor: COLORS.primaryColor + "10", borderColor: COLORS.primaryColor + "40" }]}>
          <ResumeRow label="Prime nette" value={money(totalPrimeNette)} />
          <ResumeRow label="Taxes" value={money(taxe)} />
          <ResumeRow label="FGA" value={money(fga)} />
          <ResumeRow label="Accessoires" value={money(accessoires)} />
          <View style={[styles.totauxDivider, { backgroundColor: COLORS.primaryColor + "30" }]} />
          <View style={styles.resumeRow}>
            <ThemedText style={[styles.resumeTotalLabel, { color: textColor }]}>Net à payer</ThemedText>
            <ThemedText style={[styles.resumeTotalVal, { color: COLORS.primaryColor }]}>{money(netAPayer)}</ThemedText>
          </View>
        </View>
      </ScrollView>
    );
  };

  const handleValidate = () => {
    if (!form.vehicule?.numImmatriculation) {
      Alert.alert("Validation", "Veuillez sélectionner un véhicule.");
      return;
    }

    const payload: Partial<contrat> = {
      id: initialContract?.id,
      numeroContrat:
        initialContract?.numeroContrat ?? `CTR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      categorie: initialContract?.categorie ?? "NOUVELLE AFFAIRE",
      dateContrat: initialContract?.dateContrat ?? new Date(),
      numeroPolice: initialContract?.numeroPolice ?? "",
      numeroAttestation: initialContract?.numeroAttestation ?? "",
      immatriculation: form.vehicule.numImmatriculation,
      vehiculeId: form.vehicule.id,
      assureType: initialContract?.assureType ?? "PERSONNE PHYSIQUE",
      assureNom: form.assureNom,
      assureTel: form.assureTel,
      assureEmail: form.assureEmail,
      assureBp: form.assureBp,
      assureProfession: form.assureProfession,
      souscripteurType: initialContract?.souscripteurType ?? "PERSONNE PHYSIQUE",
      souscripteurNom: form.souscripteurMemeAssure ? form.assureNom : form.souscripteurNom,
      souscripteurTel: form.souscripteurMemeAssure ? form.assureTel : form.souscripteurTel,
      souscripteurEmail: form.souscripteurMemeAssure ? form.assureEmail : form.souscripteurEmail,
      souscripteurBp: form.souscripteurMemeAssure ? form.assureBp : form.souscripteurBp,
      agence: form.agence,
      compagnie: form.compagnie,
      duree: form.duree,
      couverture: form.couverture,
      dateEffet: form.dateEffet ? new Date(form.dateEffet) : undefined,
      dateEcheance: form.dateEcheance ? new Date(form.dateEcheance) : undefined,
      primeNette: totalPrimeNette,
      accessoires,
      taxe,
      taxeFga: fga,
      cedeao: 0,
      netAPayer,
      client: initialContract?.client ?? initialClient,
      vehicule: form.vehicule,
    };

    router.replace({
      pathname: "../contrats",
      params: {
        action: isEditMode ? "updated" : "created",
        savedContractData: JSON.stringify(payload),
      },
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.primaryColor }]}>
        <Pressable onPress={goPrev} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {isEditMode ? "Modifier contrat" : "Nouveau contrat"}
        </ThemedText>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={[styles.stepIndicatorWrap, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        <StepIndicator current={step} total={5} />
        <ThemedText style={[styles.stepLabelText, { color: COLORS.primaryColor }]}>
          Étape {step}/5 — {STEP_LABELS[step - 1]}
        </ThemedText>
      </View>

      {/* Step content */}
      <View style={{ flex: 1 }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </View>

      {/* Footer navigation */}
      <View style={[styles.footer, { backgroundColor: cardBackground, borderTopColor: borderColor }]}>
        {step > 1 ? (
          <Pressable style={[styles.btnSecondary, { borderColor }]} onPress={goPrev}>
            <MaterialIcons name="arrow-back" size={16} color={labelColor} />
            <ThemedText style={[styles.btnSecondaryText, { color: labelColor }]}>Précédent</ThemedText>
          </Pressable>
        ) : (
          <Pressable style={[styles.btnSecondary, { borderColor }]} onPress={() => router.back()}>
            <MaterialIcons name="close" size={16} color={labelColor} />
            <ThemedText style={[styles.btnSecondaryText, { color: labelColor }]}>Annuler</ThemedText>
          </Pressable>
        )}

        {step < 5 ? (
          <Pressable style={[styles.btnPrimary, { backgroundColor: COLORS.primaryColor }]} onPress={goNext}>
            <ThemedText style={styles.btnPrimaryText}>Suivant</ThemedText>
            <MaterialIcons name="arrow-forward" size={16} color="#fff" />
          </Pressable>
        ) : (
          <Pressable style={[styles.btnPrimary, { backgroundColor: COLORS.primaryColor }]} onPress={handleValidate}>
            <MaterialIcons name="check" size={16} color="#fff" />
            <ThemedText style={styles.btnPrimaryText}>
              {isEditMode ? "Enregistrer les modifications" : "Valider le contrat"}
            </ThemedText>
          </Pressable>
        )}
      </View>

      <Modal visible={pickerState.visible} transparent animationType="fade">
        <Pressable style={styles.pickerOverlay} onPress={closeSelectPicker}>
          <Pressable
            style={[styles.pickerPopup, { backgroundColor: cardBackground, borderColor }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.pickerHeader, { borderBottomColor: borderColor }]}> 
              <ThemedText type="defaultSemiBold" style={{ color: textColor }}>
                {pickerState.title}
              </ThemedText>
              <Pressable onPress={closeSelectPicker}>
                <MaterialIcons name="close" size={20} color={mutedText} />
              </Pressable>
            </View>

            <ScrollView style={styles.pickerList} showsVerticalScrollIndicator={false}>
              {pickerState.options.map((option) => {
                const currentValue = pickerState.field ? form[pickerState.field] : "";
                const isActive = currentValue === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => selectPickerOption(option)}
                    style={[
                      styles.pickerItem,
                      { backgroundColor: isActive ? COLORS.primaryColor + "16" : "transparent" },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: isActive ? COLORS.primaryColor : textColor,
                        fontWeight: isActive ? "700" : "500",
                      }}
                    >
                      {option}
                    </ThemedText>
                    {isActive && <MaterialIcons name="check" size={18} color={COLORS.primaryColor} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

// ─── Resume row helper ─────────────────────────────────────────────────────────

function ResumeRow({ label, value, labelColor }: { label: string; value?: string; labelColor?: string }) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const textColor = isDark ? "#FFFFFF" : "#1E2330";
  const muted = isDark ? "#A8AEC7" : "#61637A";

  return (
    <View style={styles.resumeRow}>
      <ThemedText style={[styles.resumeLabel, { color: labelColor ?? muted }]}>{label}</ThemedText>
      <ThemedText style={[styles.resumeValue, { color: textColor }]}>{value ?? "—"}</ThemedText>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Step indicator wrapper
  stepIndicatorWrap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  stepLabelText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },

  // Step content
  stepContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  stepSub: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },

  // Search
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Sections
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  // Not found
  notFoundBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  notFoundText: { flex: 1, fontSize: 13 },

  // Vehicule card
  vehiculeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  vehiculePlate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vehiculePlateText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  vehiculeMeta: { fontSize: 14, fontWeight: "600" },
  vehiculeSubMeta: { fontSize: 12, marginTop: 2 },

  // Divider
  divider: { height: 1, marginVertical: 4 },

  // Outline button
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
  },
  outlineBtnText: { fontSize: 14, fontWeight: "700" },

  // Recap box
  recapBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  recapText: { fontSize: 13, fontWeight: "600", flex: 1 },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  vehicleInfoLeft: {
    fontSize: 13,
    flex: 1,
  },
  vehicleInfoRight: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleLabel: { fontSize: 14, fontWeight: "600" },

  // Card
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },

  // Field
  field: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },

  comboInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  comboText: {
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },

  // Row
  row: { flexDirection: "row", gap: 10 },

  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  pickerPopup: {
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: "72%",
    overflow: "hidden",
  },
  pickerHeader: {
    height: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  pickerList: {
    maxHeight: 360,
  },
  pickerItem: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Garanties
  garantieRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  garantieCheck: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  garantieLib: { fontSize: 14, fontWeight: "600" },
  garantieCode: { fontSize: 11, marginTop: 1 },
  garantiePrime: { fontSize: 13, fontWeight: "700" },

  // Totaux sticky
  totauxBox: {
    padding: 14,
    borderTopWidth: 1,
    gap: 6,
  },
  totauxRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totauxLabel: { fontSize: 13 },
  totauxLabelBold: { fontSize: 14, fontWeight: "700" },
  totauxVal: { fontSize: 13, fontWeight: "600" },
  totauxTotal: { fontSize: 16, fontWeight: "800" },
  totauxDivider: { height: 1, marginVertical: 4 },

  // Resume
  resumeCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  resumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  resumeHeaderText: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
  resumeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  resumeLabel: { fontSize: 13 },
  resumeValue: { fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1, marginLeft: 8 },
  resumeGarantieRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  resumeGarantieLib: { flex: 1, fontSize: 13 },
  resumeGarantiePrime: { fontSize: 13, fontWeight: "700" },
  resumeTotalLabel: { fontSize: 15, fontWeight: "700" },
  resumeTotalVal: { fontSize: 18, fontWeight: "800" },

  // Footer
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "600" },
  btnPrimary: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: 10,
  },
  btnPrimaryText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
