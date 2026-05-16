import BottomPickerModal, { PickerOption } from "@/components/ui/bottom-picker-modal";
import { usePopup } from "@/hooks/use-popup";
import { getfetchPermissions } from "@/services/api-parametres";
import { getfetchAgences, getfetchPartenaires } from "@/services/api-partenaires";
import { parseCsv } from "@/tools/tools";
import { permission } from "@/types/other.type";
import { partenaire } from "@/types/partenaires";
import { utilisateur } from "@/types/utilisateurs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface UtilisateurFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<utilisateur>) => void;
  initialData?: Partial<utilisateur>;
  readOnly?: boolean;
  token?: string | null;
}

const USER_TYPE_OPTIONS: PickerOption[] = [
  { id: 1, label: "PRODUCTEUR" },
  { id: 2, label: "ADMINISTRATEUR" },
];



type AgenceDetail = {
  id: number;
  nom: string;
  adresse?: string;
  tel?: string;
  email?: string;
};

export const UtilisateurFormModal: React.FC<UtilisateurFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData = {},
  readOnly = false,
  token,
}) => {
  const { showMessage } = usePopup();
  const [form, setForm] = useState<Partial<utilisateur>>({
    nom: "",
    login: "",
    email: "",
    contacts: "",
    ...initialData,
  });
  const [selectedPartenaireId, setSelectedPartenaireId] = useState<number | undefined>(initialData.partenaireId);
  const [selectedTypeUser, setSelectedTypeUser] = useState<number>(initialData.typeUser ?? 1);
  const [primaryAgenceId, setPrimaryAgenceId] = useState<number | undefined>(initialData.agenceId);
  const [selectedAgenceIds, setSelectedAgenceIds] = useState<number[]>(
    parseCsv(initialData.listeDesIdAgences)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value)),
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(parseCsv(initialData.listeDesPermissions));
  const [partenaires, setPartenaires] = useState<partenaire[]>([]);
  const [agenceOptions, setAgenceOptions] = useState<PickerOption[]>([]);
  const [agenceDetails, setAgenceDetails] = useState<AgenceDetail[]>([]);
  const [permissionOptions, setPermissionOptions] = useState<permission[]>([]);
  const [isLoadingPartenaires, setIsLoadingPartenaires] = useState(false);
  const [isLoadingAgences, setIsLoadingAgences] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isPartenairePickerVisible, setIsPartenairePickerVisible] = useState(false);
  const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
  const [isAgencePickerVisible, setIsAgencePickerVisible] = useState(false);
  const [isOtherAgencesPickerVisible, setIsOtherAgencesPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setForm({
      nom: "",
      login: "",
      email: "",
      contacts: "",
      ...initialData,
    });
    setSelectedPartenaireId(initialData.partenaireId);
    setSelectedTypeUser(initialData.typeUser ?? 1);
    setPrimaryAgenceId(initialData.agenceId);
    setSelectedAgenceIds(
      parseCsv(initialData.listeDesIdAgences)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value)),
    );
    setSelectedPermissions(parseCsv(initialData.listeDesPermissions));
  }, [initialData, visible]);

  useEffect(() => {
    if (!visible || !token) return;
    let cancelled = false;

    const loadPartenaires = async () => {
      setIsLoadingPartenaires(true);
      try {
        const payload = await getfetchPartenaires(token);
        if (cancelled) return;

        const data = payload.data ?? [];
        setPartenaires(data);

        if (!initialData.partenaireId && initialData.partenaireNom) {
          const matched = data.find((item) => item.nom === initialData.partenaireNom);
          if (matched?.id) {
            setSelectedPartenaireId(matched.id);
          }
        }
      } catch {
        if (!cancelled) {
          showMessage("error", "Erreur", "Impossible de charger les partenaires.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPartenaires(false);
        }
      }
    };

    loadPartenaires();

    return () => {
      cancelled = true;
    };
  }, [initialData.partenaireId, initialData.partenaireNom, showMessage, token, visible]);

  useEffect(() => {
    if (!visible || !token || !selectedPartenaireId) {
      setAgenceOptions([]);
      setAgenceDetails([]);
      return;
    }

    let cancelled = false;

    const loadAgences = async () => {
      setIsLoadingAgences(true);
      try {
        const payload = await getfetchAgences(token, selectedPartenaireId);
        if (cancelled) return;

        const data = payload.data ?? [];
        setAgenceDetails(
          data.map((item) => ({
            id: item.id ?? 0,
            nom: item.nom,
            adresse: item.adresse,
            tel: item.tel,
            email: item.email,
          })),
        );
        setAgenceOptions(
          data.map((item) => ({
            id: item.id ?? 0,
            label: item.nom,
            sublabel: item.adresse,
          })),
        );

        if (!initialData.agenceId && initialData.agenceNom) {
          const matched = data.find((item) => item.nom === initialData.agenceNom);
          if (matched?.id) {
            setPrimaryAgenceId(matched.id);
          }
        }
      } catch {
        if (!cancelled) {
          showMessage("error", "Erreur", "Impossible de charger les agences du partenaire.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAgences(false);
        }
      }
    };

    loadAgences();

    return () => {
      cancelled = true;
    };
  }, [initialData.agenceId, initialData.agenceNom, selectedPartenaireId, showMessage, token, visible]);

  useEffect(() => {
    if (!visible || !token || !selectedTypeUser) {
      setPermissionOptions([]);
      return;
    }

    let cancelled = false;

    const loadPermissions = async () => {
      setIsLoadingPermissions(true);
      try {
        const payload = await getfetchPermissions(token, selectedTypeUser);
        if (cancelled) return;

        const permissions = payload ?? [];
        const validCodes = new Set(permissions.map((item) => item.code));
        setPermissionOptions(permissions);
        setSelectedPermissions((prev) => {
          const preserved = prev.filter((code) => validCodes.has(code));
          if (preserved.length > 0) return preserved;
          return parseCsv(initialData.listeDesPermissions).filter((code) => validCodes.has(code));
        });
      } catch {
        if (!cancelled) {
          showMessage("error", "Erreur", "Impossible de charger les permissions du type utilisateur.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPermissions(false);
        }
      }
    };

    loadPermissions();

    return () => {
      cancelled = true;
    };
  }, [initialData.listeDesPermissions, selectedTypeUser, showMessage, token, visible]);

  const partenaireOptions = useMemo(
    () => partenaires.map((item) => ({ id: item.id ?? 0, label: item.nom, sublabel: item.code })),
    [partenaires],
  );

  const selectedPartenaire = useMemo(
    () => partenaires.find((item) => item.id === selectedPartenaireId),
    [partenaires, selectedPartenaireId],
  );

  const selectedTypeLabel = useMemo(
    () => USER_TYPE_OPTIONS.find((item) => Number(item.id) === selectedTypeUser)?.label ?? "Sélectionner",
    [selectedTypeUser],
  );

  const primaryAgenceLabel = useMemo(
    () => agenceOptions.find((item) => item.id === primaryAgenceId)?.label ?? "Sélectionner",
    [agenceOptions, primaryAgenceId],
  );

  const selectedAgence = useMemo(
    () => agenceDetails.find((item) => item.id === primaryAgenceId),
    [agenceDetails, primaryAgenceId],
  );

  const otherAgencesLabel = useMemo(() => {
    if (form.allAgences) return "Toutes les agences";
    if (selectedAgenceIds.length === 0) return "Aucune agence";
    return `${selectedAgenceIds.length} agence(s) sélectionnée(s)`;
  }, [form.allAgences, selectedAgenceIds]);

  const handleChange = (key: keyof utilisateur, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePermission = (permissionCode: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((item) => item !== permissionCode)
        : [...prev, permissionCode],
    );
  };

  const handleSubmit = () => {
    const primaryAgence = agenceOptions.find((item) => item.id === primaryAgenceId);
    onSubmit({
      ...form,
      partenaireId: selectedPartenaireId,
      partenaireNom: selectedPartenaire?.nom,
      typeUser: selectedTypeUser,
      agenceId: primaryAgenceId,
      agenceNom: primaryAgence?.label,
      listeDesPermissions: selectedPermissions.join(","),
      listeDesIdAgences: form.allAgences ? "" : selectedAgenceIds.join(","),
      allAgences: Boolean(form.allAgences),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {readOnly ? "Consultation utilisateur" : initialData?.id ? "Modification utilisateur" : "Création utilisateur"}
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={8}>
            <MaterialIcons name="close" size={22} color="#64748B" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText style={styles.sectionTitle}>Informations générales</ThemedText>

          <Pressable
            style={[styles.selectBox, (readOnly || isLoadingPartenaires) && styles.disabled]}
            onPress={() => !readOnly && !isLoadingPartenaires && setIsPartenairePickerVisible(true)}
          >
            <ThemedText style={styles.selectLabel}>Partenaire</ThemedText>
            <View style={styles.selectRow}>
              <ThemedText style={styles.selectValue}>{selectedPartenaire?.nom ?? "Sélectionner"}</ThemedText>
              {isLoadingPartenaires && <ActivityIndicator size="small" color="#1F8B82" />}
            </View>
          </Pressable>

          <Pressable
            style={[styles.selectBox, readOnly && styles.disabled]}
            onPress={() => !readOnly && setIsTypePickerVisible(true)}
          >
            <ThemedText style={styles.selectLabel}>Type utilisateur</ThemedText>
            <ThemedText style={styles.selectValue}>{selectedTypeLabel}</ThemedText>
          </Pressable>

          <TextInput
            placeholder="Nom et prénom(s)"
            value={form.nom || ""}
            onChangeText={(value: string) => handleChange("nom", value)}
            editable={!readOnly}
            style={styles.input}
          />
          <TextInput
            placeholder="Login"
            value={form.login || ""}
            onChangeText={(value: string) => handleChange("login", value)}
            editable={!readOnly}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={form.email || ""}
            onChangeText={(value: string) => handleChange("email", value)}
            editable={!readOnly}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Mobile"
            value={form.contacts || ""}
            onChangeText={(value: string) => handleChange("contacts", value)}
            editable={!readOnly}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Pressable
            style={[styles.selectBox, (readOnly || !selectedPartenaireId || isLoadingAgences) && styles.disabled]}
            onPress={() => !readOnly && !!selectedPartenaireId && !isLoadingAgences && setIsAgencePickerVisible(true)}
          >
            <ThemedText style={styles.selectLabel}>Agence associée</ThemedText>
            <View style={styles.selectRow}>
              <ThemedText style={styles.selectValue}>{primaryAgenceLabel}</ThemedText>
              {isLoadingAgences && <ActivityIndicator size="small" color="#1F8B82" />}
            </View>
          </Pressable>

          {selectedAgence && (
            <View style={styles.agenceCard}>
              <ThemedText style={styles.agenceCardTitle}>{selectedAgence.nom}</ThemedText>
              {selectedAgence.adresse ? <ThemedText style={styles.agenceCardText}>{selectedAgence.adresse}</ThemedText> : null}
              {selectedAgence.tel ? <ThemedText style={styles.agenceCardText}>Tél: {selectedAgence.tel}</ThemedText> : null}
              {selectedAgence.email ? <ThemedText style={styles.agenceCardText}>Email: {selectedAgence.email}</ThemedText> : null}
            </View>
          )}

          <Pressable
            style={styles.checkboxRow}
            onPress={() => !readOnly && setForm((prev) => ({ ...prev, allAgences: !prev.allAgences }))}
          >
            <MaterialIcons
              name={form.allAgences ? "check-box" : "check-box-outline-blank"}
              size={20}
              color="#1F8B82"
            />
            <ThemedText style={styles.checkboxText}>Toutes les agences</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.selectBox, (readOnly || Boolean(form.allAgences) || !selectedPartenaireId || isLoadingAgences) && styles.disabled]}
            onPress={() => !readOnly && !form.allAgences && !!selectedPartenaireId && !isLoadingAgences && setIsOtherAgencesPickerVisible(true)}
          >
            <ThemedText style={styles.selectLabel}>Autres agences</ThemedText>
            <ThemedText style={styles.selectValue}>{otherAgencesLabel}</ThemedText>
          </Pressable>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => !readOnly && setForm((prev) => ({ ...prev, superUser: !prev.superUser }))}
          >
            <MaterialIcons
              name={form.superUser ? "check-box" : "check-box-outline-blank"}
              size={20}
              color="#1F8B82"
            />
            <ThemedText style={styles.checkboxText}>Super administrateur</ThemedText>
          </Pressable>

          <View style={styles.rightsHeader}>
            <ThemedText style={styles.sectionTitle}>Permissions</ThemedText>
            {!readOnly && (
              <View style={styles.rightsActions}>
                <Pressable onPress={() => setSelectedPermissions(permissionOptions.map((item) => item.code))}>
                  <ThemedText style={styles.linkAction}>Tout cocher</ThemedText>
                </Pressable>
                <Pressable onPress={() => setSelectedPermissions([])}>
                  <ThemedText style={styles.linkAction}>Tout décocher</ThemedText>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.rightsContainer}>
            {isLoadingPermissions ? (
              <ActivityIndicator size="small" color="#1F8B82" style={styles.permissionsLoader} />
            ) : permissionOptions.length === 0 ? (
              <ThemedText style={styles.emptyStateText}>Aucune permission disponible pour ce type utilisateur.</ThemedText>
            ) : (
              permissionOptions.map((item) => {
                const checked = selectedPermissions.includes(item.code);
                return (
                  <Pressable
                    key={item.code}
                    style={styles.rightItem}
                    onPress={() => !readOnly && togglePermission(item.code)}
                  >
                    <MaterialIcons
                      name={checked ? "check-box" : "check-box-outline-blank"}
                      size={20}
                      color={checked ? "#1F8B82" : "#64748B"}
                    />
                    <ThemedText style={styles.rightLabel}>{item.libelle}</ThemedText>
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Pressable onPress={onClose} style={[styles.button, styles.secondaryButton]}>
            <ThemedText style={styles.secondaryButtonText}>Fermer</ThemedText>
          </Pressable>
          {!readOnly && (
            <Pressable onPress={handleSubmit} style={[styles.button, styles.primaryButton, styles.submitBtn]}>
              <ThemedText style={styles.primaryButtonText}>{initialData?.id ? "Modifier" : "Créer"}</ThemedText>
            </Pressable>
          )}
        </View>

        <BottomPickerModal
          visible={isPartenairePickerVisible}
          title="Choisir un partenaire"
          options={partenaireOptions}
          selectedId={selectedPartenaireId}
          onSelect={(option) => {
            setSelectedPartenaireId(Number(option.id));
            setPrimaryAgenceId(undefined);
            setSelectedAgenceIds([]);
          }}
          onClose={() => setIsPartenairePickerVisible(false)}
          searchable
        />

        <BottomPickerModal
          visible={isTypePickerVisible}
          title="Choisir un type utilisateur"
          options={USER_TYPE_OPTIONS}
          selectedId={selectedTypeUser}
          onSelect={(option) => {
            setSelectedTypeUser(Number(option.id));
            setSelectedPermissions([]);
          }}
          onClose={() => setIsTypePickerVisible(false)}
        />

        <BottomPickerModal
          visible={isAgencePickerVisible}
          title="Agence associée"
          options={agenceOptions}
          selectedId={primaryAgenceId}
          onSelect={(option) => setPrimaryAgenceId(Number(option.id))}
          onClose={() => setIsAgencePickerVisible(false)}
          searchable
        />

        <BottomPickerModal
          visible={isOtherAgencesPickerVisible}
          title="Autres agences"
          options={agenceOptions.filter((item) => item.id !== primaryAgenceId)}
          multiSelect
          selectedIds={selectedAgenceIds}
          onMultiConfirm={(options) => setSelectedAgenceIds(options.map((item) => Number(item.id)))}
          onClose={() => setIsOtherAgencesPickerVisible(false)}
          searchable
        />
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "700" },
  scrollContent: { paddingBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8, marginTop: 6 },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  selectLabel: { fontSize: 12, color: "#64748B", marginBottom: 3 },
  selectValue: { fontSize: 14, fontWeight: "600", color: "#0F172A", flex: 1 },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  agenceCard: {
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 12,
  },
  agenceCardTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 4 },
  agenceCardText: { fontSize: 12, color: "#475569", marginBottom: 2 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  checkboxText: { fontSize: 14, color: "#0F172A" },
  disabled: { opacity: 0.55 },
  rightsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  rightsActions: { flexDirection: "row", gap: 12 },
  linkAction: { fontSize: 12, fontWeight: "700", color: "#1F8B82" },
  rightsContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
  },
  rightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rightLabel: { flex: 1, fontSize: 13, color: "#0F172A" },
  permissionsLoader: { marginVertical: 20 },
  emptyStateText: { fontSize: 13, color: "#64748B", padding: 12 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24 },
  submitBtn: { marginLeft: 12 },
  button: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: "#1F8B82",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#94A3B8",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
});
