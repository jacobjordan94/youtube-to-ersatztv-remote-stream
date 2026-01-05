import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  disabled: boolean;
}

export function UrlInput({ url, onUrlChange, disabled }: UrlInputProps) {
  return (
    <div>
      <Label htmlFor="url" className="text-white font-semibold mb-2 block">
        YouTube URL
      </Label>
      <Input
        id="url"
        type="url"
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        disabled={disabled}
        className="text-base flex-1"
      />
      <p className="text-sm text-gray-300 mt-2">Enter a YouTube video or playlist URL</p>
    </div>
  );
}
