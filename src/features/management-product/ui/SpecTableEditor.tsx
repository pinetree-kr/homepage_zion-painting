'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface SpecTableData {
  headers: string[];
  rows: {
    cells: string[][]; // 각 셀은 문자열 배열 (여러 줄 가능)
  }[];
}

interface SpecTableEditorProps {
  value: SpecTableData | null;
  onChange: (value: SpecTableData | null) => void;
}

const DEFAULT_HEADERS = ['구분', '사양', '세부사양', '비고'];

export function SpecTableEditor({ value, onChange }: SpecTableEditorProps) {
  const [specData, setSpecData] = useState<SpecTableData>(() => {
    if (value && value.headers && value.rows) {
      return value;
    }
    return {
      headers: [...DEFAULT_HEADERS],
      rows: [],
    };
  });

  useEffect(() => {
    if (value && value.headers && value.rows) {
      setSpecData(value);
    }
  }, [value]);

  const updateSpecData = (newData: SpecTableData) => {
    setSpecData(newData);
    onChange(newData);
  };

  const addHeader = () => {
    const newHeader = `컬럼${specData.headers.length + 1}`;
    const newData = {
      ...specData,
      headers: [...specData.headers, newHeader],
      rows: specData.rows.map((row) => ({
        cells: [...row.cells, ['']], // 새 컬럼에 빈 셀 추가
      })),
    };
    updateSpecData(newData);
  };

  const removeHeader = (index: number) => {
    if (specData.headers.length <= 1) {
      return; // 최소 1개 컬럼 유지
    }
    const newData = {
      ...specData,
      headers: specData.headers.filter((_, i) => i !== index),
      rows: specData.rows.map((row) => ({
        cells: row.cells.filter((_, i) => i !== index),
      })),
    };
    updateSpecData(newData);
  };

  const updateHeader = (index: number, value: string) => {
    const newData = {
      ...specData,
      headers: specData.headers.map((h, i) => (i === index ? value : h)),
    };
    updateSpecData(newData);
  };

  const addRow = () => {
    const newRow = {
      cells: specData.headers.map(() => ['']), // 각 컬럼에 빈 셀 추가
    };
    const newData = {
      ...specData,
      rows: [...specData.rows, newRow],
    };
    updateSpecData(newData);
  };

  const removeRow = (index: number) => {
    const newData = {
      ...specData,
      rows: specData.rows.filter((_, i) => i !== index),
    };
    updateSpecData(newData);
  };

  const updateCell = (rowIndex: number, cellIndex: number, lines: string[]) => {
    const newData = {
      ...specData,
      rows: specData.rows.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          return {
            cells: row.cells.map((cell, cIdx) => {
              if (cIdx === cellIndex) {
                return lines;
              }
              return cell;
            }),
          };
        }
        return row;
      }),
    };
    updateSpecData(newData);
  };

  const addLineToCell = (rowIndex: number, cellIndex: number, lineIndex: number) => {
    const cell = specData.rows[rowIndex]?.cells[cellIndex] || [];
    const newLines = [
      ...cell.slice(0, lineIndex + 1),
      '',
      ...cell.slice(lineIndex + 1),
    ];
    updateCell(rowIndex, cellIndex, newLines);
  };

  const removeLineFromCell = (rowIndex: number, cellIndex: number, lineIndex: number) => {
    const cell = specData.rows[rowIndex]?.cells[cellIndex] || [];
    if (cell.length <= 1) {
      return; // 최소 1줄 유지
    }
    const newLines = cell.filter((_, i) => i !== lineIndex);
    updateCell(rowIndex, cellIndex, newLines);
  };

  const updateLineInCell = (rowIndex: number, cellIndex: number, lineIndex: number, value: string) => {
    const cell = specData.rows[rowIndex]?.cells[cellIndex] || [''];
    const newLines = cell.map((line, i) => (i === lineIndex ? value : line));
    updateCell(rowIndex, cellIndex, newLines);
  };

  if (!specData.headers.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>제품 스펙</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addHeader}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            컬럼 추가
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            행 추가
          </Button>
        </div>
      </div>

      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="w-12 p-2 border-r border-gray-300"></th>
                {specData.headers.map((header, index) => (
                  <th key={index} className="p-2 border-r border-gray-300 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Input
                        value={header}
                        onChange={(e) => updateHeader(index, e.target.value)}
                        className="h-8 text-sm font-semibold"
                        placeholder="컬럼명"
                      />
                      {specData.headers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHeader(index)}
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specData.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={specData.headers.length + 1}
                    className="p-8 text-center text-gray-400"
                  >
                    행을 추가하여 스펙을 입력하세요.
                  </td>
                </tr>
              ) : (
                specData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-200 last:border-b-0">
                    <td className="w-12 p-2 border-r border-gray-300 bg-gray-50 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(rowIndex)}
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    {specData.headers.map((_, cellIndex) => {
                      const cell = row.cells[cellIndex] || [''];
                      return (
                        <td
                          key={cellIndex}
                          className="p-2 border-r border-gray-300 last:border-r-0 align-top"
                        >
                          <div className="space-y-1">
                            {cell.map((line, lineIndex) => (
                              <div key={lineIndex} className="flex gap-1">
                                <Textarea
                                  value={line}
                                  onChange={(e) =>
                                    updateLineInCell(rowIndex, cellIndex, lineIndex, e.target.value)
                                  }
                                  className="min-h-[60px] text-sm flex-1"
                                  placeholder="입력..."
                                  rows={2}
                                />
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => addLineToCell(rowIndex, cellIndex, lineIndex)}
                                    className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                    title="줄 추가"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  {cell.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeLineFromCell(rowIndex, cellIndex, lineIndex)}
                                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="줄 삭제"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

