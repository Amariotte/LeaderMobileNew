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
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAllClients } from "@/services/api-service";
import { client } from "@/types/client.type";
import { encaissementPrime } from "@/types/encaissementPrime.type";

export type EncaissementPrimeFormData = {
  clientId?: number;
  clientNom?: string;
  agenceId?: number;
  agenceNom?: string;
  banqueId?: number;
  banqueNom?: string;
  modeId?: number;
  modeNom?: string;
  date?: string;
  montant?: number;
  ref?: string;
  obs?: string;
};

type PickerOption = { id: number; nom: string };

type EncaissementPrimeFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: EncaissementPrimeFormData) => Promise<void>;
  initialData?: encaissementPrime;
  title: string;
  agenceOptions: PickerOption[];
  banqueOptions: PickerOption[];
  modeOptions: PickerOption[];
};

type InlinePicker = "client" | "agence" | "banque" | "mode" | null;

function buildInitial(data?: encaissementPrime): EncaissementPrimeFormData {
  return {
    clientId: data?.clientId,
    clientNom: data?.clientNom ?? "",
    agenceId: data?.agenceId,
    agenceNom: data?.agenceNom ?? "",
    banqueId: data?.banqueId,
    banqueNom: data?.banqueNom ?? "",
    modeId: data?.modeId,
    modeNom: data?.modeNom ?? "",
    date: data?.date ? String(data.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    montant: data?.montant,
    ref: data?.ref ?? "",
    obs: data?.obs ?? "",
  };
}

export default function EncaissementPrimeFormModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  title,
  agenceOptions,
  banqueOptions,
  modeOptions,
}: EncaissementPrimeFormModalProps) {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();

  const [form, setForm] = useState<EncaissementPrimeFormData>(buildInitial(initialData));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openPicker, setOpenPicker] = useState<InlinePicker>(null);
  const [clients, setClients] = useState<client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
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

  useEffect(() => {
    if (visible && userToken && clients.length === 0) {
      setLoadingClients(true);
      getAllClients(userToken)
        .then((res) => setClients(res.data ?? []))
        .finally(() => setLoadingClients(false));
    }
  }, [visible, userToken, clients.length]);

  const update = (patch: Partial<EncaissementPrimeFormData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async () => {
    if (!form.clientId) {
      setValidationError("Le client est obligatoire.");
      return;
    }
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
        <ThemedText style={[styles.selectBtnText, { color: value ? textColor : labelColor }]} numberOfLines={1}>
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
            {/* Client */}
            {renderSelectField("Client *", form.clientNom, "client", "person")}

            {/* Agence */}
            {renderSelectField("Agence", form.agenceNom, "agence", "business")}


            {/* Mode de paiement */}
            {renderSelectField("Mode de paiement", form.modeNom, "mode", "payment")}

            
            {/* Banque */}
            {renderSelectField("Banque", form.banqueNom, "banque", "account-balance")}

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

            {/* Observation */}
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.label, { color: labelColor }]}>Observation</ThemedText>
              <View style={[styles.inputRow, styles.textareaRow, { backgroundColor: inputBg, borderColor }]}>
                <TextInput
                  style={[styles.input, styles.textarea, { color: textColor }]}
                  value={form.obs}
                  onChangeText={(v) => update({ obs: v })}
                  placeholder="Observation..."
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

      {/* Client picker */}
      <BottomPickerModal
        visible={openPicker === "client"}
        title="Client"
        options={clients.filter((c) => c.id !== undefined).map((c): BPickerOption => ({ id: c.id as number, label: `${c.nom} ${c.prenoms ?? ""}`.trim(), sublabel: c.code ?? undefined }))}
        loading={loadingClients}
        selectedId={form.clientId}
        searchable
        onSelect={(opt) => { update({ clientId: opt.id as number, clientNom: opt.label }); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />

      {/* Agence picker */}
      <BottomPickerModal
        visible={openPicker === "agence"}
        title="Agence"
        options={agenceOptions.map((a): BPickerOption => ({ id: a.id, label: a.nom }))}
        selectedId={form.agenceId}
        onSelect={(opt) => { update({ agenceId: opt.id as number, agenceNom: opt.label }); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />

      {/* Mode picker */}
      <BottomPickerModal
        visible={openPicker === "mode"}
        title="Mode de paiement"
        options={modeOptions.map((m): BPickerOption => ({ id: m.id, label: m.nom }))}
        selectedId={form.modeId}
        onSelect={(opt) => { update({ modeId: opt.id as number, modeNom: opt.label }); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />

      {/* Banque picker */}
      <BottomPickerModal
        visible={openPicker === "banque"}
        title="Banque"
        options={banqueOptions.map((b): BPickerOption => ({ id: b.id, label: b.nom }))}
        selectedId={form.banqueId}
        onSelect={(opt) => { update({ banqueId: opt.id as number, banqueNom: opt.label }); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBtnText: { flex: 1, fontSize: 14 },
  pickerDropdown: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
    maxHeight: 200,
  },
  pickerSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  pickerSearchInput: { flex: 1, fontSize: 13 },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerOptionText: { fontSize: 14 },
  pickerOptionMeta: { fontSize: 11 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textareaRow: { alignItems: "flex-start", paddingVertical: 10 },
  input: { flex: 1, fontSize: 14 },
  textarea: { minHeight: 70, textAlignVertical: "top" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: "#E05252", fontSize: 12, flex: 1 },
  submitBtn: {
    backgroundColor: "#1F8B82",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
