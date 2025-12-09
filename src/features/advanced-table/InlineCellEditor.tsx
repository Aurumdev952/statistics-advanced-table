import { useEffect, useRef, useState } from "react";

interface InlineCellEditorProps {
  initialValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
}

export function InlineCellEditor({
  initialValue,
  onSubmit,
  onCancel,
  onTab,
  onShiftTab,
}: InlineCellEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      onSubmit(value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    } else if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      onSubmit(value);
      if (e.shiftKey) {
        onShiftTab?.();
      } else {
        onTab?.();
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('.cell-editor')) {
      onSubmit(value);
    }
  };

  return (
    <input
      ref={inputRef}
      className="w-full h-full px-2 py-1 text-sm border border-blue-400 outline-none"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    />
  );
}

