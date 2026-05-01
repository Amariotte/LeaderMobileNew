import COLORS from "@/styles/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type PopupType = "error" | "success" | "info";
export type FeedbackPopupType = PopupType;

type BasePopupProps = {
  visible: boolean;
  type: PopupType;
  title: string;
  message: string;
};

export type MessagePopupProps = BasePopupProps & {
  onClose: () => void;
  buttonLabel?: string;
};

export type ConfirmationPopupProps = BasePopupProps & {
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type FeedbackPopupProps = MessagePopupProps;

const popupConfig: Record<
  PopupType,
  {
    icon: keyof typeof MaterialIcons.glyphMap;
    iconColor: string;
    iconBackground: string;
  }
> = {
  error: {
    icon: "error-outline",
    iconColor: COLORS.errorColor,
    iconBackground: "#fee2e2",
  },
  success: {
    icon: "check-circle-outline",
    iconColor: "#16a34a",
    iconBackground: "#dcfce7",
  },
  info: {
    icon: "info-outline",
    iconColor: COLORS.primaryColor,
    iconBackground: "#d1fae5",
  },
};

type PopupCardProps = BasePopupProps & {
  onRequestClose: () => void;
  onBackdropPress?: () => void;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

function PopupCard({
  visible,
  type,
  title,
  message,
  onRequestClose,
  onBackdropPress,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: PopupCardProps) {
  const config = popupConfig[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles.overlay} onPress={onBackdropPress}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: config.iconBackground },
            ]}
          >
            <MaterialIcons
              name={config.icon}
              size={34}
              color={config.iconColor}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {onSecondaryPress ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onSecondaryPress}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <View style={styles.cancelButtonContent}>
                  <MaterialIcons name="close" size={16} color="#374151" />
                  <Text
                    style={[styles.actionButtonText, styles.cancelButtonText]}
                  >
                    {secondaryLabel}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPrimaryPress}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>{primaryLabel}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onPrimaryPress}
              style={[styles.actionButton, styles.singleActionButton]}
            >
              <View style={styles.actionButtonContent}>
                <MaterialIcons name="close" size={16} color="#ffffff" />
                <Text style={styles.actionButtonText}>{primaryLabel}</Text>
              </View>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function MessagePopup({
  visible,
  type,
  title,
  message,
  onClose,
  buttonLabel = "Fermer",
}: MessagePopupProps) {
  return (
    <PopupCard
      visible={visible}
      type={type}
      title={title}
      message={message}
      onRequestClose={onClose}
      onBackdropPress={onClose}
      primaryLabel={buttonLabel}
      onPrimaryPress={onClose}
    />
  );
}

export function ConfirmationPopup({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Valider",
  cancelLabel = "Annuler",
}: ConfirmationPopupProps) {
  return (
    <PopupCard
      visible={visible}
      type={type}
      title={title}
      message={message}
      onRequestClose={onCancel}
      primaryLabel={confirmLabel}
      onPrimaryPress={onConfirm}
      secondaryLabel={cancelLabel}
      onSecondaryPress={onCancel}
    />
  );
}

export function FeedbackPopup(props: FeedbackPopupProps) {
  return <MessagePopup {...props} />;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#11181C",
    textAlign: "center",
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    minHeight: 48,
    marginTop: 0,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryColor,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  singleActionButton: {
    flex: 0,
    width: "100%",
    marginTop: 22,
  },
  cancelButton: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  cancelButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  cancelButtonText: {
    color: "#374151",
    fontWeight: "700",
  },
});
