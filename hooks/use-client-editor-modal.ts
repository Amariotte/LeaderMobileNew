import { useMemo, useState } from "react";

import { client } from "@/types/client.type";

export type ClientEditorMode = "create" | "edit";

type UseClientEditorModalOptions = {
  createTitle?: string;
  getEditTitle?: (selectedClient: client) => string;
};

export type ClientEditorModalController = {
  visible: boolean;
  mode: ClientEditorMode;
  selectedClient?: client;
  title: string;
  openCreate: () => void;
  openEdit: (selectedClient: client) => void;
  close: () => void;
};

export function useClientEditorModal(
  options?: UseClientEditorModalOptions,
): ClientEditorModalController {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ClientEditorMode>("create");
  const [selectedClient, setSelectedClient] = useState<client | undefined>();

  const createTitle = options?.createTitle ?? "Creer un nouveau client";
  const getEditTitle =
    options?.getEditTitle ?? ((currentClient: client) => `Modifier ${currentClient.code} - ${currentClient.nom} ${currentClient.prenoms}`);

  const title = useMemo(() => {
    if (mode === "edit" && selectedClient) {
      return getEditTitle(selectedClient);
    }

    return createTitle;
  }, [createTitle, getEditTitle, mode, selectedClient]);

  const openCreate = () => {
    setMode("create");
    setSelectedClient(undefined);
    setVisible(true);
  };

  const openEdit = (currentClient: client) => {
    setMode("edit");
    setSelectedClient(currentClient);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    setSelectedClient(undefined);
  };

  return {
    visible,
    mode,
    selectedClient,
    title,
    openCreate,
    openEdit,
    close,
  };
}
