import { Button } from '@/components/ui/button';

interface ModeChangeDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModeChangeDialog({ open, onConfirm, onCancel }: ModeChangeDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-2">Switch to Global Settings?</h3>
        <p className="text-sm text-gray-300 mb-4">
          This will discard all per-file customizations and apply the current settings to all
          videos. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
