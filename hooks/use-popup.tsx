import React, { createContext, useCallback, useContext, useState } from "react";

import {
    ConfirmationPopup,
    MessagePopup,
    PopupType,
} from "@/components/ui/feedback-popup";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageState = {
  kind: "message";
  type: PopupType;
  title: string;
  message: string;
  buttonLabel?: string;
};

type ConfirmState = {
  kind: "confirm";
  type: PopupType;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PopupState = MessageState | ConfirmState | null;

type PopupContextValue = {
  /** Affiche un popup informatif / erreur / succès */
  showMessage: (
    type: PopupType,
    title: string,
    message: string,
    buttonLabel?: string,
  ) => void;
  /** Affiche un popup de confirmation avec deux boutons */
  showConfirm: (
    type: PopupType,
    title: string,
    message: string,
    onConfirm: () => void,
    opts?: { confirmLabel?: string; cancelLabel?: string },
  ) => void;
  // internal – used by PopupHost
  _state: PopupState;
  _dismiss: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const PopupContext = createContext<PopupContextValue | null>(null);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PopupState>(null);

  const dismiss = useCallback(() => setState(null), []);

  const showMessage = useCallback(
    (type: PopupType, title: string, message: string, buttonLabel?: string) => {
      setState({ kind: "message", type, title, message, buttonLabel });
    },
    [],
  );

  const showConfirm = useCallback(
    (
      type: PopupType,
      title: string,
      message: string,
      onConfirm: () => void,
      opts?: { confirmLabel?: string; cancelLabel?: string },
    ) => {
      setState({
        kind: "confirm",
        type,
        title,
        message,
        onConfirm,
        confirmLabel: opts?.confirmLabel,
        cancelLabel: opts?.cancelLabel,
      });
    },
    [],
  );

  return (
    <PopupContext.Provider
      value={{ showMessage, showConfirm, _state: state, _dismiss: dismiss }}
    >
      {children}
      <PopupHost />
    </PopupContext.Provider>
  );
}

// ─── Host (renders the actual modals) ────────────────────────────────────────

function PopupHost() {
  const ctx = useContext(PopupContext)!;
  const { _state: s, _dismiss: dismiss } = ctx;

  if (!s) return null;

  if (s.kind === "message") {
    return (
      <MessagePopup
        visible
        type={s.type}
        title={s.title}
        message={s.message}
        buttonLabel={s.buttonLabel}
        onClose={dismiss}
      />
    );
  }

  return (
    <ConfirmationPopup
      visible
      type={s.type}
      title={s.title}
      message={s.message}
      confirmLabel={s.confirmLabel}
      cancelLabel={s.cancelLabel}
      onConfirm={() => {
        dismiss();
        s.onConfirm();
      }}
      onCancel={dismiss}
    />
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used inside <PopupProvider>");
  return { showMessage: ctx.showMessage, showConfirm: ctx.showConfirm };
}
