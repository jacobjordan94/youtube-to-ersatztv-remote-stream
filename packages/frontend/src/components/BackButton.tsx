import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onBack: () => void;
}

export function BackButton({ onBack }: BackButtonProps) {
  return (
    <Button
      onClick={onBack}
      variant="ghost"
      size="sm"
      className="fixed top-4 left-4 z-40 text-gray-300 hover:text-white hover:bg-gray-700/80"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
}
