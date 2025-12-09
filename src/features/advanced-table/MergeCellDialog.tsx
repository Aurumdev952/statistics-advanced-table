import { useState } from "react";
import { getCellRange, canMerge } from "./utils/mergeCells";

interface MergeCellDialogProps {
  startCell: string;
  endCell: string;
  onConfirm: (cells: string[]) => void;
  onCancel: () => void;
}

export function MergeCellDialog({ startCell, endCell, onConfirm, onCancel }: MergeCellDialogProps) {
  const [start, setStart] = useState(startCell);
  const [end, setEnd] = useState(endCell);

  const cells = getCellRange(start, end);
  const isValid = canMerge(cells);

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(cells);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Merge Cells</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Cell</label>
            <input
              type="text"
              value={start}
              onChange={(e) => setStart(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded"
              placeholder="A1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Cell</label>
            <input
              type="text"
              value={end}
              onChange={(e) => setEnd(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border rounded"
              placeholder="B2"
            />
          </div>

          {!isValid && cells.length > 0 && (
            <div className="text-sm text-red-600">
              Selected cells must form a rectangular region
            </div>
          )}

          <div className="text-sm text-gray-600">
            Selected range: {start} to {end} ({cells.length} cells)
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Merge
          </button>
        </div>
      </div>
    </div>
  );
}

