import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { Clipboard } from 'lucide-react';

interface PasteButtonProps {
  onPaste: () => Promise<void>;
  disabled: boolean;
  className?: string;
}

export function PasteButton({ onPaste, disabled, className }: PasteButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onPaste}
      disabled={disabled}
      title="Paste from clipboard"
      className={clsx('bg-transparent text-white', className)}
    >
      <Clipboard className="h-4 w-4" />
    </Button>
  );
}
