import BottomPickerModal, { PickerOption } from "@/components/ui/bottom-picker-modal";
import { USER_TYPE_OPTIONS } from "@/constants/constants";
import { useAuthContext } from "@/hooks/auth-context";
import { useAppColors } from "@/hooks/use-app-theme";
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

interface UtilisateurFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<utilisateur>) => void;
  initialData?: Partial<utilisateur>;
  readOnly?: boolean;
  token?: string | null;
}

export const UtilisateurFormModal: React.FC<UtilisateurFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData = {},
  readOnly = false,
  token,
}) => {
  const {
    isDark,
    cardBackground,
    borderColor,
    textColor,
    mutedText: labelColor,
    inputBg,
    primaryColor,
    sectionBg,
  } = useAppColors();
  const { user } = useAuthContext();
  const { showMessage } = usePopup();
  const isAdministrateurCourtier =
    user?.typeId === 2 ;
  const connectedUserPartenaireId = user?.partenaireId;
  const fallbackPartenaireId = isAdministrateurCourtier ? undefined : connectedUserPartenaireId;
  const [form, setForm] = useState<Partial<utilisateur>>({
    nom: "",
    codeAsaci: "",
    login: "",
    email: "",
    contacts: "",
    ...initialData,
  });
  const [selectedPartenaireId, setSelectedPartenaireId] = useState<number | undefined>(
    initialData.partenaireId ?? fallbackPartenaireId,
  );
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
      codeAsaci: "",
      login: "",
      email: "",
      contacts: "",
      ...initialData,
    });
    setSelectedPartenaireId(initialData.partenaireId ?? fallbackPartenaireId);
    setSelectedTypeUser(initialData.typeUser ?? 1);
    setPrimaryAgenceId(initialData.agenceId);
    setSelectedAgenceIds(
      parseCsv(initialData.listeDesIdAgences)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value)),
    );
    setSelectedPermissions(parseCsv(initialData.listeDesPermissions));
  }, [fallbackPartenaireId, initialData, visible]);

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
      return;
    }

    let cancelled = false;

    const loadAgences = async () => {
      setIsLoadingAgences(true);
      try {
        const payload = await getfetchAgences(token, selectedPartenaireId);
        if (cancelled) return;

        const data = payload.data ?? [];
       
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

  useEffect(() => {
    if (!selectedPartenaire?.allUseCodeAsaci || !selectedPartenaire.codeAsaciProducteur) return;
    setForm((prev) => ({ ...prev, codeAsaci: selectedPartenaire.codeAsaciProducteur }));
  }, [selectedPartenaire]);

  const selectedPartenaireLabel = useMemo(() => {
    if (selectedPartenaire?.nom) return selectedPartenaire.nom;
    if (!isAdministrateurCourtier) return user?.partenaireNom ?? initialData.partenaireNom ?? "Partenaire connecté";
    return "Sélectionner";
  }, [initialData.partenaireNom, isAdministrateurCourtier, selectedPartenaire?.nom, user?.partenaireNom]);

  const selectedTypeLabel = useMemo(
    () => USER_TYPE_OPTIONS.find((item) => Number(item.id) === selectedTypeUser)?.label ?? "Sélectionner",
    [selectedTypeUser],
  );

  const primaryAgenceLabel = useMemo(
    () => agenceOptions.find((item) => item.id === primaryAgenceId)?.label ?? "Sélectionner",
    [agenceOptions, primaryAgenceId],
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
    const resolvedPartenaireId = selectedPartenaireId ?? fallbackPartenaireId;
    onSubmit({
      ...form,
      partenaireId: resolvedPartenaireId,
      partenaireNom: selectedPartenaire?.nom ?? selectedPartenaireLabel,
      typeUser: selectedTypeUser,
      agenceId: primaryAgenceId,
      agenceNom: primaryAgence?.label,
      listeDesPermissions: selectedPermissions.join(","),
      listeDesIdAgences: form.allAgences ? "" : selectedAgenceIds.join(","),
      allAgences: Boolean(form.allAgences),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: cardBackground }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              {readOnly ? "Consultation utilisateur" : initialData?.id ? "Modification utilisateur" : "Création utilisateur"}
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={labelColor} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={[styles.section, { backgroundColor: sectionBg }]}>
              <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>Informations générales</ThemedText>

              <Pressable
                style={[
                  styles.selectBox,
                  { backgroundColor: inputBg, borderColor },
                  (readOnly || isLoadingPartenaires || !isAdministrateurCourtier) && styles.disabled,
                ]}
                onPress={() =>
                  !readOnly && isAdministrateurCourtier && !isLoadingPartenaires && setIsPartenairePickerVisible(true)
                }
              >
                <ThemedText style={[styles.selectLabel, { color: labelColor }]}>Partenaire</ThemedText>
                <View style={styles.selectRow}>
                  <ThemedText style={[styles.selectValue, { color: textColor }]}>{selectedPartenaireLabel}</ThemedText>
                  {isAdministrateurCourtier && isLoadingPartenaires && <ActivityIndicator size="small" color={primaryColor} />}
                </View>
              </Pressable>

              <Pressable
                style={[styles.selectBox, { backgroundColor: inputBg, borderColor }, readOnly && styles.disabled]}
                onPress={() => !readOnly && setIsTypePickerVisible(true)}
              >
                <ThemedText style={[styles.selectLabel, { color: labelColor }]}>Type utilisateur</ThemedText>
                <ThemedText style={[styles.selectValue, { color: textColor }]}>{selectedTypeLabel}</ThemedText>
              </Pressable>

              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.label, { color: labelColor }]}>Nom et prénom(s)</ThemedText>
                <TextInput
                  placeholder="Nom et prénom(s)"
                  placeholderTextColor={labelColor}
                  value={form.nom || ""}
                  onChangeText={(value: string) => handleChange("nom", value)}
                  editable={!readOnly}
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                />
              </View>
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.label, { color: labelColor }]}>Login</ThemedText>
                <TextInput
                  placeholder="Login"
                  placeholderTextColor={labelColor}
                  value={form.login || ""}
                  onChangeText={(value: string) => handleChange("login", value)}
                  editable={!readOnly}
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                />
              </View>
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.label, { color: labelColor }]}>Code ASACI</ThemedText>
                <TextInput
                  placeholder="Code ASACI"
                  placeholderTextColor={labelColor}
                  value={form.codeAsaci || ""}
                  onChangeText={(value: string) => handleChange("codeAsaci", value)}
                  editable={!readOnly}
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                />
              </View>
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.label, { color: labelColor }]}>Email</ThemedText>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={labelColor}
                  value={form.email || ""}
                  onChangeText={(value: string) => handleChange("email", value)}
                  editable={!readOnly}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                />
              </View>
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.label, { color: labelColor }]}>Mobile</ThemedText>
                <TextInput
                  placeholder="Mobile"
                  placeholderTextColor={labelColor}
                  value={form.contacts || ""}
                  onChangeText={(value: string) => handleChange("contacts", value)}
                  editable={!readOnly}
                  keyboardType="phone-pad"
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                />
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: sectionBg }]}>
              <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>Affectation agences</ThemedText>

              <Pressable
                style={[styles.selectBox, { backgroundColor: inputBg, borderColor }, (readOnly || !selectedPartenaireId || isLoadingAgences) && styles.disabled]}
                onPress={() => !readOnly && !!selectedPartenaireId && !isLoadingAgences && setIsAgencePickerVisible(true)}
              >
                <ThemedText style={[styles.selectLabel, { color: labelColor }]}>Agence associée</ThemedText>
                <View style={styles.selectRow}>
                  <ThemedText style={[styles.selectValue, { color: textColor }]}>{primaryAgenceLabel}</ThemedText>
                  {isLoadingAgences && <ActivityIndicator size="small" color={primaryColor} />}
                </View>
              </Pressable>

              <Pressable
                style={styles.checkboxRow}
                onPress={() => !readOnly && setForm((prev) => ({ ...prev, allAgences: !prev.allAgences }))}
              >
                <MaterialIcons
                  name={form.allAgences ? "check-box" : "check-box-outline-blank"}
                  size={20}
                  color={primaryColor}
                />
                <ThemedText style={[styles.checkboxText, { color: textColor }]}>Toutes les agences</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.selectBox, { backgroundColor: inputBg, borderColor }, (readOnly || Boolean(form.allAgences) || !selectedPartenaireId || isLoadingAgences) && styles.disabled]}
                onPress={() => !readOnly && !form.allAgences && !!selectedPartenaireId && !isLoadingAgences && setIsOtherAgencesPickerVisible(true)}
              >
                <ThemedText style={[styles.selectLabel, { color: labelColor }]}>Autres agences</ThemedText>
                <ThemedText style={[styles.selectValue, { color: textColor }]}>{otherAgencesLabel}</ThemedText>
              </Pressable>

              <Pressable
                style={styles.checkboxRow}
                onPress={() => !readOnly && setForm((prev) => ({ ...prev, superUser: !prev.superUser }))}
              >
                <MaterialIcons
                  name={form.superUser ? "check-box" : "check-box-outline-blank"}
                  size={20}
                  color={primaryColor}
                />
                <ThemedText style={[styles.checkboxText, { color: textColor }]}>Super administrateur</ThemedText>
              </Pressable>
            </View>

            <View style={[styles.section, { backgroundColor: sectionBg }]}> 
              <View style={styles.rightsHeader}>
                <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>Permissions</ThemedText>
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

              <View style={[styles.rightsContainer, { backgroundColor: inputBg, borderColor }]}> 
                {isLoadingPermissions ? (
                  <ActivityIndicator size="small" color={primaryColor} style={styles.permissionsLoader} />
                ) : permissionOptions.length === 0 ? (
                  <ThemedText style={[styles.emptyStateText, { color: labelColor }]}>Aucune permission disponible pour ce type utilisateur.</ThemedText>
                ) : (
                  permissionOptions.map((item) => {
                    const checked = selectedPermissions.includes(item.code);
                    return (
                      <Pressable
                        key={item.code}
                        style={[styles.rightItem, { borderBottomColor: borderColor }]}
                        onPress={() => !readOnly && togglePermission(item.code)}
                      >
                        <MaterialIcons
                          name={checked ? "check-box" : "check-box-outline-blank"}
                          size={20}
                          color={checked ? primaryColor : labelColor}
                        />
                        <ThemedText style={[styles.rightLabel, { color: textColor }]}>{item.libelle}</ThemedText>
                      </Pressable>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.actions, { borderTopColor: borderColor }]}> 
            <Pressable onPress={onClose} style={[styles.button, styles.secondaryButton, { borderColor }]}>
              <ThemedText style={[styles.secondaryButtonText, { color: textColor }]}>Fermer</ThemedText>
            </Pressable>
            {!readOnly && (
              <Pressable onPress={handleSubmit} style={[styles.button, styles.primaryButton, styles.submitBtn]}>
                <MaterialIcons name="save" size={18} color="#FFFFFF" />
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 17, fontWeight: "700", flex: 1, marginRight: 12 },
  scrollContent: { padding: 16, gap: 12 },
  section: { borderRadius: 12, padding: 14, gap: 10 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
    marginTop: 0,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  selectLabel: { fontSize: 12, marginBottom: 3 },
  selectValue: { fontSize: 14, fontWeight: "600", flex: 1 },
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
  checkboxText: { fontSize: 14 },
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
    borderRadius: 10,
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
  rightLabel: { flex: 1, fontSize: 13 },
  permissionsLoader: { marginVertical: 20 },
  emptyStateText: { fontSize: 13, padding: 12 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  submitBtn: { marginLeft: 0, gap: 8, flexDirection: "row", alignItems: "center" },
  button: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: "#1F8B82",
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
  fieldGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
});
