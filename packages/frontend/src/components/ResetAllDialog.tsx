import { Button } from '@/components/ui/button';

interface ResetAllDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetAllDialog({ open, onConfirm, onCancel }: ResetAllDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Reset All Files to Default Settings?
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          This will reset all files to their original default settings and mark them as unvisited.
          The currently selected file will remain visited. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={onConfirm}>
            Reset All
          </Button>
        </div>
      </div>
    </div>
  );
}
