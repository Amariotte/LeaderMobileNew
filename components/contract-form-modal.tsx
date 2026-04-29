import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
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
import { contrat } from "@/types/contrat.type";
import { vehicule } from "@/types/vehicule.type";

type ContractFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<contrat>) => void;
  initialContract?: contrat;
  selectedClient?: client;
  selectedVehicle?: vehicule;
  title: string;
};

type ContractFormData = {
  immatriculation: string;
  numeroContrat: string;
  categorie: string;
  dateContrat: string;
  heureContrat: string;
  numeroPolice: string;
  numeroAttestation: string;

  assureType: string;
  assureNom: string;
  assureTelephone: string;
  assureEmail: string;
  assureBoitePostale: string;
  assureProfession: string;

  souscripteurType: string;
  souscripteurNom: string;
  souscripteurTelephone: string;
  souscripteurEmail: string;
  souscripteurBoitePostale: string;

  agence: string;
  compagnie: string;
  duree: string;
  nombreJours: string;
  couverture: string;
  dateEffet: string;
  heureEffet: string;
  dateEcheance: string;
};

const TYPES = ["PERSONNE PHYSIQUE", "PERSONNE MORALE"];
const CATEGORIES = ["NOUVELLE AFFAIRE", "RENOUVELLEMENT", "AVENANT"];
const COMPAGNIES = ["NSIA", "SUNU", "ALLIANZ", "SAHAM"];
const DUREES = ["1 mois", "3 mois", "6 mois", "12 mois"];
const COUVERTURES = ["RC Simple", "Tous risques", "Intermédiaire"];

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
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function ContractFormModal({
  visible,
  onClose,
  onSubmit,
  initialContract,
  selectedClient,
  selectedVehicle,
  title,
}: ContractFormModalProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const [formData, setFormData] = useState<ContractFormData>({
    immatriculation: initialContract?.immatriculation ?? selectedVehicle?.numImmatriculation ?? "",
    numeroContrat: initialContract?.numeroContrat ?? "",
    categorie: initialContract?.categorie ?? CATEGORIES[0],
    dateContrat: formatDate(initialContract?.dateContrat),
    heureContrat: initialContract?.heureContrat ?? "10:13",
    numeroPolice: initialContract?.numeroPolice ?? "",
    numeroAttestation: initialContract?.numeroAttestation ?? "",
    assureType: initialContract?.assureType ?? TYPES[0],
    assureNom:
      initialContract?.assureNom ??
      (selectedClient ? `${selectedClient.nom} ${selectedClient.prenom}`.trim() : ""),
    assureTelephone: initialContract?.assureTelephone ?? selectedClient?.tel ?? "",
    assureEmail: initialContract?.assureEmail ?? selectedClient?.email ?? "",
    assureBoitePostale: initialContract?.assureBoitePostale ?? selectedClient?.boitePostale ?? "",
    assureProfession: initialContract?.assureProfession ?? selectedClient?.libProfession ?? professionsFakeData[0]?.libelle ?? "",
    souscripteurType: initialContract?.souscripteurType ?? TYPES[0],
    souscripteurNom:
      initialContract?.souscripteurNom ??
      (selectedClient ? `${selectedClient.nom} ${selectedClient.prenom}`.trim() : ""),
    souscripteurTelephone: initialContract?.souscripteurTelephone ?? selectedClient?.tel ?? "",
    souscripteurEmail: initialContract?.souscripteurEmail ?? selectedClient?.email ?? "",
    souscripteurBoitePostale: initialContract?.souscripteurBoitePostale ?? selectedClient?.boitePostale ?? "",
    agence: initialContract?.agence ?? "SCA NOUVELLE ERE",
    compagnie: initialContract?.compagnie ?? COMPAGNIES[0],
    duree: initialContract?.duree ?? DUREES[3],
    nombreJours: `${initialContract?.nombreJours ?? 0}`,
    couverture: initialContract?.couverture ?? COUVERTURES[0],
    dateEffet: formatDate(initialContract?.dateEffet),
    heureEffet: initialContract?.heureEffet ?? "",
    dateEcheance: formatDate(initialContract?.dateEcheance),
  });

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const borderColor = isDark ? "#363A4C" : "#D7DCE8";
  const textColor = isDark ? "#FFFFFF" : "#1E2330";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F4F5F9";

  const updateField = <K extends keyof ContractFormData>(key: K, value: ContractFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const cycleOption = <K extends keyof ContractFormData>(
    key: K,
    options: string[],
  ) => {
    const current = String(formData[key] ?? "");
    const currentIndex = Math.max(0, options.findIndex((item) => item === current));
    const nextIndex = (currentIndex + 1) % options.length;
    updateField(key, options[nextIndex] as ContractFormData[K]);
  };

  const submit = () => {
    onSubmit({
      id: initialContract?.id,
      immatriculation: formData.immatriculation,
      numeroContrat: formData.numeroContrat,
      categorie: formData.categorie,
      dateContrat: parseDate(formData.dateContrat, initialContract?.dateContrat),
      heureContrat: formData.heureContrat,
      numeroPolice: formData.numeroPolice,
      numeroAttestation: formData.numeroAttestation,
      assureType: formData.assureType,
      assureNom: formData.assureNom,
      assureTelephone: formData.assureTelephone,
      assureEmail: formData.assureEmail,
      assureBoitePostale: formData.assureBoitePostale,
      assureProfession: formData.assureProfession,
      souscripteurType: formData.souscripteurType,
      souscripteurNom: formData.souscripteurNom,
      souscripteurTelephone: formData.souscripteurTelephone,
      souscripteurEmail: formData.souscripteurEmail,
      souscripteurBoitePostale: formData.souscripteurBoitePostale,
      agence: formData.agence,
      compagnie: formData.compagnie,
      duree: formData.duree,
      nombreJours: toNumber(formData.nombreJours),
      couverture: formData.couverture,
      dateEffet: parseDate(formData.dateEffet, initialContract?.dateEffet),
      heureEffet: formData.heureEffet,
      dateEcheance: parseDate(formData.dateEcheance, initialContract?.dateEcheance),
      client: selectedClient,
      vehicule: selectedVehicle,
      vehiculeId: selectedVehicle?.id,
      primeNette: initialContract?.primeNette ?? 0,
      accessoires: initialContract?.accessoires ?? 0,
      taxe: initialContract?.taxe ?? 0,
      taxeFga: initialContract?.taxeFga ?? 0,
      cedeao: initialContract?.cedeao ?? 0,
      netAPayer: initialContract?.netAPayer ?? 0,
    });
    onClose();
  };

  const input = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
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

  const select = (label: string, value: string, onPress: () => void) => (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <Pressable onPress={onPress} style={[styles.select, { backgroundColor: inputBg, borderColor }]}> 
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
            <View style={[styles.block, { backgroundColor: cardBackground, borderColor }]}> 
              <View style={styles.row3}>
                {input("Immatriculation *", formData.immatriculation, (v) => updateField("immatriculation", v), "AB-123-CD")}
                {input("N° de contrat", formData.numeroContrat, (v) => updateField("numeroContrat", v))}
                {select("Catégorie", formData.categorie, () => cycleOption("categorie", CATEGORIES))}
              </View>
              <View style={styles.row3}>
                {input("Date", formData.dateContrat, (v) => updateField("dateContrat", v), "jj/mm/aaaa")}
                {input("Heure", formData.heureContrat, (v) => updateField("heureContrat", v), "10:13")}
                {input("N° Police", formData.numeroPolice, (v) => updateField("numeroPolice", v))}
              </View>
              <View style={styles.row3}>
                {input("N° Attestation", formData.numeroAttestation, (v) => updateField("numeroAttestation", v))}
                {select("Compagnie", formData.compagnie, () => cycleOption("compagnie", COMPAGNIES))}
                {select("Durée", formData.duree, () => cycleOption("duree", DUREES))}
              </View>
              <View style={styles.row3}>
                {input("Date d'effet", formData.dateEffet, (v) => updateField("dateEffet", v), "jj/mm/aaaa")}
                {input("Heure d'effet", formData.heureEffet, (v) => updateField("heureEffet", v))}
                {input("Date d'échéance", formData.dateEcheance, (v) => updateField("dateEcheance", v), "jj/mm/aaaa")}
              </View>
            </View>

            <View style={[styles.block, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText type="defaultSemiBold" style={{ color: textColor, marginBottom: 8 }}>
                Informations de l'assuré
              </ThemedText>
              <View style={styles.row2}>
                {select("Type", formData.assureType, () => cycleOption("assureType", TYPES))}
                {input("Nom", formData.assureNom, (v) => updateField("assureNom", v))}
              </View>
              <View style={styles.row2}>
                {input("N° Téléphone", formData.assureTelephone, (v) => updateField("assureTelephone", v), "+225 xx xx xx xx", "phone-pad")}
                {input("Email", formData.assureEmail, (v) => updateField("assureEmail", v), "email@example.com")}
              </View>
              <View style={styles.row2}>
                {input("Boite postale", formData.assureBoitePostale, (v) => updateField("assureBoitePostale", v))}
                {select(
                  "Profession",
                  formData.assureProfession,
                  () => {
                    const options = professionsFakeData.map((p) => p.libelle);
                    cycleOption("assureProfession", options.length > 0 ? options : [""]);
                  },
                )}
              </View>
            </View>

            <View style={[styles.block, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText type="defaultSemiBold" style={{ color: textColor, marginBottom: 8 }}>
                Informations du souscripteur
              </ThemedText>
              <View style={styles.row2}>
                {select("Type", formData.souscripteurType, () => cycleOption("souscripteurType", TYPES))}
                {input("Nom", formData.souscripteurNom, (v) => updateField("souscripteurNom", v))}
              </View>
              <View style={styles.row2}>
                {input("N° Téléphone", formData.souscripteurTelephone, (v) => updateField("souscripteurTelephone", v), "+225 xx xx xx xx", "phone-pad")}
                {input("Email", formData.souscripteurEmail, (v) => updateField("souscripteurEmail", v), "email@example.com")}
              </View>
              <View style={styles.row2}>
                {input("Boite postale", formData.souscripteurBoitePostale, (v) => updateField("souscripteurBoitePostale", v))}
                {input("Agence", formData.agence, (v) => updateField("agence", v))}
              </View>
            </View>

            <View style={[styles.block, { backgroundColor: cardBackground, borderColor }]}> 
              <ThemedText type="defaultSemiBold" style={{ color: textColor, marginBottom: 8 }}>
                Garanties et calcul
              </ThemedText>
              <View style={styles.row3}>
                {select("Couverture", formData.couverture, () => cycleOption("couverture", COUVERTURES))}
                {input("Nombre de jours", formData.nombreJours, (v) => updateField("nombreJours", v), "0", "numeric")}
                <View style={styles.summaryBox}>
                  <ThemedText style={[styles.summaryLabel, { color: labelColor }]}>Net à payer</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: textColor }]}>0</ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderColor }]}> 
            <Pressable style={[styles.footerButton, { backgroundColor: COLORS.primaryColor }]} onPress={submit}>
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
    paddingHorizontal: 8,
    paddingVertical: 10,
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
    padding: 10,
    gap: 10,
  },
  block: {
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
  summaryBox: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "flex-end",
    backgroundColor: "#E9F4EA",
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
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
