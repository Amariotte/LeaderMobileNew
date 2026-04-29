import ClientFormModal from "@/components/client-form-modal";
import {
    ClientEditorModalController,
    ClientEditorMode,
} from "@/hooks/use-client-editor-modal";
import { client } from "@/types/client.type";

type ClientEditorModalProps = {
  controller: ClientEditorModalController;
  onSubmit: (
    data: Partial<client>,
    mode: ClientEditorMode,
    selectedClient?: client,
  ) => void;
};

export default function ClientEditorModal({
  controller,
  onSubmit,
}: ClientEditorModalProps) {
  return (
    <ClientFormModal
      visible={controller.visible}
      onClose={controller.close}
      initialClient={controller.selectedClient}
      title={controller.title}
      onSubmit={(data) =>
        onSubmit(data, controller.mode, controller.selectedClient)
      }
    />
  );
}
