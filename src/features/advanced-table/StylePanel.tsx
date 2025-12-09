import { useState, useEffect } from "react";
import { CellFormatting, CellStyle } from "./types";

interface StylePanelProps {
  formatting?: CellFormatting;
  onChange: (formatting: CellFormatting) => void;
}

export function StylePanel({ formatting, onChange }: StylePanelProps) {
  const [style, setStyle] = useState<CellStyle | undefined>(formatting?.style);

  useEffect(() => {
    const newFormatting: CellFormatting = {
      ...formatting,
      style,
    };
    onChange(newFormatting);
  }, [style]);

  const updateStyle = (updates: Partial<CellStyle>) => {
    setStyle((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold mb-2">Colors</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1">Background</label>
            <input
              type="color"
              value={style?.background_color || "#ffffff"}
              onChange={(e) => updateStyle({ background_color: e.target.value })}
              className="w-full h-8 border rounded"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Text</label>
            <input
              type="color"
              value={style?.text_color || "#000000"}
              onChange={(e) => updateStyle({ text_color: e.target.value })}
              className="w-full h-8 border rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Font</div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs mb-1">Family</label>
            <select
              value={style?.font_family || "inherit"}
              onChange={(e) => updateStyle({ font_family: e.target.value === "inherit" ? undefined : e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="inherit">Default</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Size</label>
            <input
              type="number"
              min="8"
              max="72"
              value={style?.font_size || 14}
              onChange={(e) => updateStyle({ font_size: parseInt(e.target.value) || undefined })}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={style?.font_weight === "bold" || style?.font_weight === "bolder" || style?.font_weight === 700}
                onChange={(e) => updateStyle({ font_weight: e.target.checked ? "bold" : "normal" })}
              />
              Bold
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={style?.font_style === "italic"}
                onChange={(e) => updateStyle({ font_style: e.target.checked ? "italic" : "normal" })}
              />
              Italic
            </label>
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Alignment</div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs mb-1">Horizontal</label>
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle({ text_align: align })}
                  className={`flex-1 px-2 py-1 text-xs border rounded ${
                    style?.text_align === align ? "bg-blue-100 border-blue-500" : ""
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1">Vertical</label>
            <div className="flex gap-1">
              {(["top", "middle", "bottom"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle({ vertical_align: align })}
                  className={`flex-1 px-2 py-1 text-xs border rounded ${
                    style?.vertical_align === align ? "bg-blue-100 border-blue-500" : ""
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Borders</div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs mb-1">Style</label>
            <select
              value={style?.border_style || "none"}
              onChange={(e) => updateStyle({ border_style: e.target.value === "none" ? undefined : e.target.value as CellStyle["border_style"] })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>
          {style?.border_style && style.border_style !== "none" && (
            <>
              <div>
                <label className="block text-xs mb-1">Width</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={style?.border_width || 1}
                  onChange={(e) => updateStyle({ border_width: parseInt(e.target.value) || 1 })}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Color</label>
                <input
                  type="color"
                  value={style?.border_color || "#000000"}
                  onChange={(e) => updateStyle({ border_color: e.target.value })}
                  className="w-full h-8 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Sides</label>
                <div className="grid grid-cols-2 gap-1">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <label key={side} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={style?.[`border_${side}` as keyof CellStyle] ?? true}
                        onChange={(e) => updateStyle({ [`border_${side}`]: e.target.checked } as Partial<CellStyle>)}
                      />
                      {side}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

