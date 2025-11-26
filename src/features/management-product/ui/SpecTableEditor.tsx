'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface LineCellData {
  content: string; // 줄 내용
  rowspan: number; // 항상 1 (병합 기능 제거됨)
  colspan: number; // 항상 1 (병합 기능 제거됨)
}

export interface CellData {
  lines: LineCellData[]; // 각 줄이 독립적인 셀
}

export interface SpecTableData {
  headers: string[];
  rows: {
    cells: CellData[]; // 각 셀은 CellData 타입
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
      // 기존 데이터를 새 형식으로 변환
      return convertLegacyData(value);
    }
    return {
      headers: [...DEFAULT_HEADERS],
      rows: [],
    };
  });


  useEffect(() => {
    if (value && value.headers && value.rows) {
      setSpecData(convertLegacyData(value));
    }
  }, [value]);

  // 기존 데이터 형식을 새 형식으로 변환
  function convertLegacyData(data: any): SpecTableData {
    if (!data || !data.rows) {
      return {
        headers: data?.headers || [...DEFAULT_HEADERS],
        rows: [],
      };
    }

    return {
      headers: data.headers || [...DEFAULT_HEADERS],
      rows: data.rows.map((row: any) => ({
        cells: (row.cells || []).map((cell: any) => {
          if (typeof cell === 'object' && 'lines' in cell) {
            // 새 형식: lines가 LineCellData[]인 경우
            if (Array.isArray(cell.lines) && cell.lines.length > 0) {
              if (typeof cell.lines[0] === 'object' && 'content' in cell.lines[0]) {
                return {
                  lines: cell.lines.map((line: any) => ({
                    content: line.content || '',
                    rowspan: 1, // 병합 기능 제거: 항상 1로 고정
                    colspan: 1, // 병합 기능 제거: 항상 1로 고정
                  })),
                };
              }
              // 기존 형식: lines가 string[]인 경우
              return {
                lines: (cell.lines as string[]).map((line: string) => ({
                  content: line,
                  rowspan: 1,
                  colspan: 1,
                })),
              };
            }
            return {
              lines: [{ content: '', rowspan: 1, colspan: 1 }],
            };
          }
          // 기존 형식 (string[])인 경우
          if (Array.isArray(cell)) {
            return {
              lines: cell.map((line: string) => ({
                content: line,
                rowspan: 1,
                colspan: 1,
              })),
            };
          }
          return {
            lines: [{ content: '', rowspan: 1, colspan: 1 }],
          };
        }),
      })),
    };
  }

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
        cells: [
          ...row.cells,
          { lines: [{ content: '', rowspan: 1, colspan: 1 }] }, // 새 컬럼에 빈 셀 추가
        ],
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
      cells: specData.headers.map(() => ({ lines: [{ content: '', rowspan: 1, colspan: 1 }] })), // 각 컬럼에 빈 셀 추가
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

  const updateCell = (rowIndex: number, cellIndex: number, cellData: Partial<CellData>) => {
    const newData = {
      ...specData,
      rows: specData.rows.map((row, rIdx) => {
        if (rIdx === rowIndex) {
          return {
            cells: row.cells.map((cell, cIdx) => {
              if (cIdx === cellIndex) {
                return { ...cell, ...cellData };
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

  const updateCellLines = (rowIndex: number, cellIndex: number, lines: LineCellData[]) => {
    updateCell(rowIndex, cellIndex, { lines });
  };

  const addLineToCell = (rowIndex: number, cellIndex: number, lineIndex: number) => {
    const cell = specData.rows[rowIndex]?.cells[cellIndex];
    if (!cell) return;
    const newLines = [
      ...cell.lines.slice(0, lineIndex + 1),
      { content: '', rowspan: 1, colspan: 1 },
      ...cell.lines.slice(lineIndex + 1),
    ];
    updateCellLines(rowIndex, cellIndex, newLines);
  };

  const removeLineFromCell = (rowIndex: number, cellIndex: number, lineIndex: number) => {
    const cell = specData.rows[rowIndex]?.cells[cellIndex];
    if (!cell || cell.lines.length <= 1) {
      return; // 최소 1줄 유지
    }
    const newLines = cell.lines.filter((_, i) => i !== lineIndex);
    updateCellLines(rowIndex, cellIndex, newLines);
  };

  const updateLineInCell = (rowIndex: number, cellIndex: number, lineIndex: number, value: string) => {
    const cell = specData.rows[rowIndex]?.cells[cellIndex];
    if (!cell) return;
    const newLines = cell.lines.map((line, i) =>
      i === lineIndex ? { ...line, content: value } : line
    );
    updateCellLines(rowIndex, cellIndex, newLines);
  };

  const updateLineCell = (rowIndex: number, cellIndex: number, lineIndex: number, lineData: Partial<LineCellData>) => {
    const cell = specData.rows[rowIndex]?.cells[cellIndex];
    if (!cell) return;
    const newLines = cell.lines.map((line, i) =>
      i === lineIndex ? { ...line, ...lineData } : line
    );
    updateCellLines(rowIndex, cellIndex, newLines);
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
                specData.rows.map((row, rowIndex) => {
                  // 각 행에서 최대 줄 수 계산
                  const maxLines = Math.max(
                    ...row.cells.map((cell) => cell.lines.length),
                    1
                  );

                  // 각 줄에 대해 행 생성
                  return Array.from({ length: maxLines }, (_, lineIndex) => (
                    <tr
                      key={`${rowIndex}-${lineIndex}`}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      {lineIndex === 0 && (
                        <td
                          rowSpan={maxLines}
                          className="w-12 p-2 border-r border-gray-300 bg-gray-50 text-center"
                        >
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
                      )}
                      {specData.headers.map((_, cellIndex) => {
                        const cell = row.cells[cellIndex] || {
                          lines: [{ content: '', rowspan: 1, colspan: 1 }],
                        };
                        let lineCell = cell.lines[lineIndex];

                        // 줄 셀이 없으면 빈 줄 셀 생성 (렌더링용, 실제 데이터에는 추가하지 않음)
                        if (!lineCell) {
                          lineCell = { content: '', rowspan: 1, colspan: 1 };
                        }

                        const isVirtualCell = !cell.lines[lineIndex]; // 실제 데이터에 없는 가상 셀

                        return (
                          <td
                            key={cellIndex}
                            className={`p-2 border-r border-gray-300 last:border-r-0 ${
                              isVirtualCell ? 'align-middle' : 'align-top'
                            }`}
                          >
                            {isVirtualCell ? (
                              // 가상 셀: 원형 + 아이콘 버튼
                              <div className="flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addLineToCell(rowIndex, cellIndex, cell.lines.length);
                                  }}
                                  className="h-10 w-10 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                  title="줄 추가"
                                >
                                  <Plus className="h-5 w-5" />
                                </Button>
                              </div>
                            ) : (
                              // 실제 셀: 기존 입력 폼
                              <>
                                <div className="flex gap-1">
                                  <Textarea
                                    value={lineCell.content}
                                    onChange={(e) =>
                                      updateLineInCell(rowIndex, cellIndex, lineIndex, e.target.value)
                                    }
                                    className="min-h-[60px] text-sm flex-1"
                                    placeholder="입력..."
                                    rows={2}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addLineToCell(rowIndex, cellIndex, lineIndex);
                                      }}
                                      className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                      title="줄 추가"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    {cell.lines.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeLineFromCell(rowIndex, cellIndex, lineIndex);
                                        }}
                                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        title="줄 삭제"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                }).flat()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

