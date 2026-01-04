import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_SCRIPT_TEMPLATE } from '@youtube-to-ersatztv/shared';

interface ScriptOptionsInputProps {
  scriptOptions: string;
  onScriptOptionsChange: (value: string) => void;
  disabled: boolean;
}

export function ScriptOptionsInput({
  scriptOptions,
  onScriptOptionsChange,
  disabled,
}: ScriptOptionsInputProps) {
  return (
    <div>
      <Label htmlFor="scriptOptions" className="text-sm text-white font-medium mb-2 block">
        Script Options
      </Label>
      <Input
        id="scriptOptions"
        type="text"
        value={scriptOptions}
        onChange={(e) => onScriptOptionsChange(e.target.value)}
        disabled={disabled}
        placeholder="--hls-use-mpegts"
        className="font-mono text-sm"
      />
      <p className="text-xs text-gray-300 mt-2">
        Default template: {DEFAULT_SCRIPT_TEMPLATE}
      </p>
    </div>
  );
}
