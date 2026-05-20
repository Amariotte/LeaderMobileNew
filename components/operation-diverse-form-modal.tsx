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
import BottomPickerModal, { PickerOption as BPickerOption } from "@/components/ui/bottom-picker-modal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { operation } from "@/types/operations.type";

export type OperationDiverseFormData = {
  agenceId?: number;
  agenceNom?: string;
  banqueId?: number;
  banqueNom?: string;
  modeId?: number;
  modeNom?: string;
  date?: string;
  montant?: number;
  desc?: string;
  objetOp?: string;
  beneOrDep?: string;
  bEnc?: boolean;
  ref?: string;
};

type PickerOption = { id: number; nom: string };

type OperationDiverseFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: OperationDiverseFormData) => Promise<void>;
  initialData?: operation;
  title: string;
  banqueOptions: PickerOption[];
  modeOptions: PickerOption[];
};

type InlinePicker = "agence" | "banque" | "mode" | "type" | null;

function buildInitial(data?: operation): OperationDiverseFormData {
  return {
    agenceId: data?.agenceId,
    agenceNom: data?.agenceNom ?? "",
    banqueId: data?.banqueId,
    banqueNom: data?.banqueNom ?? "",
    modeId: data?.modeId,
    modeNom: data?.modeNom ?? "",
    date: data?.date ? String(data.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    montant: data?.montant,
    desc: data?.desc ?? "",
    objetOp: data?.objetOp ?? "",
    beneOrDep: data?.beneOrDep ?? "Encaissement",
    bEnc: data?.bEnc ?? true,
    ref: data?.ref ?? "",
  };
}

const TYPE_OPTIONS = [
  { label: "Encaissement", bEnc: true },
  { label: "Décaissement", bEnc: false },
];

export default function OperationDiverseFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  title,
  banqueOptions,
  modeOptions,
}: OperationDiverseFormModalProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";

  const [form, setForm] = useState<OperationDiverseFormData>(buildInitial(initialData));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openPicker, setOpenPicker] = useState<InlinePicker>(null);
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const [agenceOptions, setAgenceOptions] = useState<PickerOption[]>([]);
  
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";
  const textColor = isDark ? "#FFFFFF" : "#2D3142";
  const labelColor = isDark ? "#A8AEC7" : "#61637A";
  const inputBg = isDark ? "#242735" : "#F9F9FC";

  useEffect(() => {
    if (visible) {
      setForm(buildInitial(initialData));
      setValidationError(null);
      setOpenPicker(null);
    }
  }, [visible, initialData]);

  const update = (patch: Partial<OperationDiverseFormData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    if (!form.montant || Number(form.montant) <= 0) {
      setValidationError("Le montant doit être supérieur à 0.");
      return;
    }
    if (!form.date) {
      setValidationError("La date est obligatoire.");
      return;
    }
    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSelectField = (
    label: string,
    value: string | undefined,
    picker: InlinePicker,
    icon: React.ComponentProps<typeof MaterialIcons>["name"],
  ) => (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.label, { color: labelColor }]}>{label}</ThemedText>
      <Pressable
        style={[styles.selectBtn, { backgroundColor: inputBg, borderColor }]}
        onPress={() => setOpenPicker(picker)}
      >
        <MaterialIcons name={icon} size={16} color={labelColor} />
        <ThemedText
          style={[styles.selectBtnText, { color: value ? textColor : labelColor }]}
          numberOfLines={1}
        >
          {value || `Choisir ${label.toLowerCase()}`}
        </ThemedText>
        <MaterialIcons name="arrow-drop-down" size={20} color={labelColor} />
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: cardBackground }]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>{title}</ThemedText>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={22} color={labelColor} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Type opération */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Type *</ThemedText>
              <View style={styles.typeRow}>
                {TYPE_OPTIONS.map((t) => {
                  const active = form.bEnc === t.bEnc;
                  const color = t.bEnc ? "#16A34A" : "#E05252";
                  return (
                    <Pressable
                      key={t.label}
                      style={[
                        styles.typeBtn,
                        { borderColor: active ? color : borderColor, backgroundColor: active ? color + "18" : inputBg },
                      ]}
                      onPress={() => update({ bEnc: t.bEnc, beneOrDep: t.label })}
                    >
                      <MaterialIcons
                        name={t.bEnc ? "arrow-downward" : "arrow-upward"}
                        size={15}
                        color={active ? color : labelColor}
                      />
                      <ThemedText
                        style={[styles.typeBtnText, { color: active ? color : labelColor, fontWeight: active ? "700" : "400" }]}
                      >
                        {t.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Agence */}
            {renderSelectField("Agence", form.agenceNom, "agence", "business")}

            {/* Banque */}
            {renderSelectField("Banque / Caisse", form.banqueNom, "banque", "account-balance")}

            {/* Mode */}
            {renderSelectField("Mode de paiement", form.modeNom, "mode", "payment")}

            {/* Date */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Date *</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons name="calendar-today" size={16} color={labelColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={form.date}
                  onChangeText={(v) => update({ date: v })}
                  placeholder="AAAA-MM-JJ"
                  placeholderTextColor={labelColor}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {/* Montant */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Montant *</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons name="attach-money" size={16} color={labelColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={form.montant !== undefined ? String(form.montant) : ""}
                  onChangeText={(v) => update({ montant: v === "" ? undefined : Number(v) })}
                  placeholder="0"
                  placeholderTextColor={labelColor}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Bénéficiaire / Déposant */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Bénéficiaire / Déposant</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons name="person" size={16} color={labelColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={form.beneOrDep}
                  onChangeText={(v) => update({ beneOrDep: v })}
                  placeholder="Nom du bénéficiaire ou déposant"
                  placeholderTextColor={labelColor}
                />
              </View>
            </View>

            {/* Objet */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Objet</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons name="subject" size={16} color={labelColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={form.objetOp}
                  onChangeText={(v) => update({ objetOp: v })}
                  placeholder="Objet de l'opération"
                  placeholderTextColor={labelColor}
                />
              </View>
            </View>

            {/* Référence */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Référence</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor }]}>
                <MaterialIcons name="tag" size={16} color={labelColor} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={form.ref}
                  onChangeText={(v) => update({ ref: v })}
                  placeholder="N° de référence"
                  placeholderTextColor={labelColor}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Description</ThemedText>
              <View style={[styles.inputRow, styles.textareaRow, { backgroundColor: inputBg, borderColor }]}>
                <TextInput
                  style={[styles.input, styles.textarea, { color: textColor }]}
                  value={form.desc}
                  onChangeText={(v) => update({ desc: v })}
                  placeholder="Description..."
                  placeholderTextColor={labelColor}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

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
        visible={openPicker === "agence"}
        title="Agence"
        options={agenceOptions.map((a): BPickerOption => ({ id: a.id, label: a.nom }))}
        selectedId={form.agenceId}
        onSelect={(opt) => { update({ agenceId: opt.id as number, agenceNom: opt.label }); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />

      <BottomPickerModal
        visible={openPicker === "banque"}
        title="Banque / Caisse"
        options={banqueOptions.map((b): BPickerOption => ({ id: b.id, label: b.nom }))}
        selectedId={form.banqueId}
        onSelect={(opt) => { update({ banqueId: opt.id as number, banqueNom: opt.label }); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />

      <BottomPickerModal
        visible={openPicker === "mode"}
        title="Mode de paiement"
        options={modeOptions.map((m): BPickerOption => ({ id: m.id, label: m.nom }))}
        selectedId={form.modeId}
        onSelect={(opt) => { update({ modeId: opt.id as number, modeNom: opt.label }); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
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
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, borderWidth: 1.5, paddingVertical: 10 },
  typeBtnText: { fontSize: 13 },
  selectBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  selectBtnText: { flex: 1, fontSize: 14 },
  pickerDropdown: { borderRadius: 10, overflow: "hidden", marginBottom: 6, maxHeight: 200 },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 10 },
  pickerOptionText: { fontSize: 14 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  textareaRow: { alignItems: "flex-start", paddingVertical: 10 },
  input: { flex: 1, fontSize: 14 },
  textarea: { minHeight: 70, textAlignVertical: "top" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFE5E5", borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: "#E05252", fontSize: 12, flex: 1 },
  submitBtn: { backgroundColor: "#1F8B82", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
