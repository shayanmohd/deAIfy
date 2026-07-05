import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Button } from './Button';

interface Props {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary';
}

export function CopyButton({ text, label = 'Copy', variant = 'secondary' }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <Button
      label={copied ? 'Copied!' : label}
      variant={variant}
      disabled={!text}
      onPress={async () => {
        await Clipboard.setStringAsync(text);
        setCopied(true);
      }}
    />
  );
}
