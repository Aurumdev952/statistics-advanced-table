import { useEffect, useRef } from "react";
import { CellConfig, MergeInfo } from "./types";

interface CellContextMenuProps {
  x: number;
  y: number;
  cellConfig: CellConfig | null;
  hasMerge: boolean;
  onMerge: () => void;
  onUnmerge: () => void;
  onFormat: () => void;
  onStyle: () => void;
  onClose: () => void;
}

export function CellContextMenu({
  x,
  y,
  cellConfig,
  hasMerge,
  onMerge,
  onUnmerge,
  onFormat,
  onStyle,
  onClose,
}: CellContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border rounded shadow-lg z-50 py-1 min-w-[180px]"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {hasMerge ? (
        <button
          onClick={() => {
            onUnmerge();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          Unmerge Cells
        </button>
      ) : (
        <button
          onClick={() => {
            onMerge();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          Merge Cells
        </button>
      )}

      <div className="border-t my-1" />

      <button
        onClick={() => {
          onFormat();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Format...
      </button>

      <button
        onClick={() => {
          onStyle();
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Style...
      </button>
    </div>
  );
}

