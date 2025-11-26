'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/shared/ui';
import { Input } from '@/src/shared/ui';
import { Label } from '@/src/shared/ui';
import { Textarea } from '@/src/shared/ui';
import { Plus, Trash2, GripVertical, Merge, Split } from 'lucide-react';

export interface LineCellData {
  content: string; // 줄 내용
  rowspan: number; // 세로 병합 개수
  colspan: number; // 가로 병합 개수
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

  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number; line: number }[]>([]);

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
                    rowspan: line.rowspan || 1,
                    colspan: line.colspan || 1,
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

  // 줄 셀 선택 토글 (각 줄을 독립적인 셀로 취급)
  const toggleLineCellSelection = (rowIndex: number, colIndex: number, lineIndex: number) => {
    setSelectedCells((prev) => {
      const exists = prev.some(
        (c) => c.row === rowIndex && c.col === colIndex && c.line === lineIndex
      );
      if (exists) {
        return prev.filter(
          (c) => !(c.row === rowIndex && c.col === colIndex && c.line === lineIndex)
        );
      }
      return [...prev, { row: rowIndex, col: colIndex, line: lineIndex }];
    });
  };

  // 선택된 줄 셀들 병합
  const mergeSelectedCells = () => {
    if (selectedCells.length < 2) return;

    // 선택된 셀들을 정렬 (행 우선, 그 다음 열, 그 다음 줄)
    const sorted = [...selectedCells].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      if (a.col !== b.col) return a.col - b.col;
      return a.line - b.line;
    });

    const firstCell = sorted[0];
    const minRow = Math.min(...sorted.map((c) => c.row));
    const maxRow = Math.max(...sorted.map((c) => c.row));
    const minCol = Math.min(...sorted.map((c) => c.col));
    const maxCol = Math.max(...sorted.map((c) => c.col));

    // 행과 열 범위 계산
    const rowspan = maxRow - minRow + 1;
    const colspan = maxCol - minCol + 1;

    // 모든 선택된 줄 셀의 내용을 첫 번째 셀로 병합
    const mergedContents: string[] = [];
    sorted.forEach((cell) => {
      const lineCell = specData.rows[cell.row]?.cells[cell.col]?.lines[cell.line];
      if (lineCell && lineCell.content.trim()) {
        mergedContents.push(lineCell.content);
      }
    });

    // 첫 번째 셀의 줄을 병합된 셀로 업데이트
    const firstLineCell = specData.rows[firstCell.row]?.cells[firstCell.col]?.lines[firstCell.line];
    if (!firstLineCell) return;

    const newData = {
      ...specData,
      rows: specData.rows.map((row, rIdx) => ({
        cells: row.cells.map((cell, cIdx) => {
          if (rIdx === firstCell.row && cIdx === firstCell.col) {
            // 첫 번째 셀: 해당 줄을 병합된 셀로 업데이트
            return {
              lines: cell.lines.map((line, lIdx) => {
                if (lIdx === firstCell.line) {
                  return {
                    content: mergedContents.join('\n') || '',
                    rowspan,
                    colspan,
                  };
                }
                // 병합 범위 내의 다른 줄들: 숨김 처리
                const isInMergeRange = sorted.some(
                  (c) => c.row === rIdx && c.col === cIdx && c.line === lIdx
                );
                if (isInMergeRange) {
                  return {
                    content: '',
                    rowspan: 0,
                    colspan: 0,
                  };
                }
                return line;
              }),
            };
          }
          // 다른 셀의 병합 범위 내 줄들: 숨김 처리
          const isInMergeRange = sorted.some(
            (c) => c.row === rIdx && c.col === cIdx
          );
          if (isInMergeRange) {
            return {
              lines: cell.lines.map((line, lIdx) => {
                const isSelected = sorted.some(
                  (c) => c.row === rIdx && c.col === cIdx && c.line === lIdx
                );
                if (isSelected) {
                  return {
                    content: '',
                    rowspan: 0,
                    colspan: 0,
                  };
                }
                return line;
              }),
            };
          }
          return cell;
        }),
      })),
    };

    updateSpecData(newData);
    setSelectedCells([]);
  };

  // 줄 셀 병합 해제
  const unmergeLineCell = (rowIndex: number, colIndex: number, lineIndex: number) => {
    const lineCell = specData.rows[rowIndex]?.cells[colIndex]?.lines[lineIndex];
    if (!lineCell || (lineCell.rowspan === 1 && lineCell.colspan === 1)) return;

    const rowspan = lineCell.rowspan;
    const colspan = lineCell.colspan;
    const content = lineCell.content;

    // 병합된 셀의 내용을 각 줄 셀로 분배
    const contents = content.split('\n').filter((c) => c.trim());
    const contentsPerCell = Math.ceil(contents.length / (rowspan * colspan));

    const newData = {
      ...specData,
      rows: specData.rows.map((row, rIdx) => ({
        cells: row.cells.map((cell, cIdx) => {
          if (rIdx === rowIndex && cIdx === colIndex) {
            // 같은 셀 내의 줄들 업데이트
            return {
              lines: cell.lines.map((line, lIdx) => {
                if (lIdx === lineIndex) {
                  // 병합 해제: 첫 번째 줄 셀만 내용 유지
                  return {
                    content: contents[0] || '',
                    rowspan: 1,
                    colspan: 1,
                  };
                }
                // 병합 범위 내의 다른 줄들: 복원
                const isInMergeRange =
                  rIdx >= rowIndex &&
                  rIdx < rowIndex + rowspan &&
                  cIdx >= colIndex &&
                  cIdx < colIndex + colspan &&
                  line.rowspan === 0 &&
                  line.colspan === 0;

                if (isInMergeRange) {
                  const cellIndex = (rIdx - rowIndex) * colspan + (cIdx - colIndex);
                  const contentIndex = cellIndex * contentsPerCell + (lIdx > lineIndex ? 1 : 0);
                  return {
                    content: contents[contentIndex] || '',
                    rowspan: 1,
                    colspan: 1,
                  };
                }
                return line;
              }),
            };
          }
          // 다른 셀의 병합 범위 내 줄들 복원
          const isInMergeRange =
            rIdx >= rowIndex &&
            rIdx < rowIndex + rowspan &&
            cIdx >= colIndex &&
            cIdx < colIndex + colspan;

          if (isInMergeRange) {
            return {
              lines: cell.lines.map((line) => {
                if (line.rowspan === 0 && line.colspan === 0) {
                  const cellIndex = (rIdx - rowIndex) * colspan + (cIdx - colIndex);
                  const contentIndex = cellIndex * contentsPerCell + 1;
                  return {
                    content: contents[contentIndex] || '',
                    rowspan: 1,
                    colspan: 1,
                  };
                }
                return line;
              }),
            };
          }
          return cell;
        }),
      })),
    };

    updateSpecData(newData);
  };

  // 줄 셀이 병합된 셀의 일부인지 확인 (렌더링하지 않아야 함)
  const isLineCellHidden = (rowIndex: number, colIndex: number, lineIndex: number): boolean => {
    const currentRow = specData.rows[rowIndex];
    if (!currentRow) return false;

    const currentCell = currentRow.cells[colIndex];
    if (!currentCell) return false;

    const currentLineCell = currentCell.lines[lineIndex];
    if (!currentLineCell) return false;

    // 현재 줄 셀이 rowspan=0, colspan=0인 경우 (병합된 셀의 일부)
    if (currentLineCell.rowspan === 0 && currentLineCell.colspan === 0) {
      return true;
    }

    // 이전 행들을 확인하여 rowspan이 이 줄 셀을 덮는지 확인
    for (let r = 0; r < rowIndex; r++) {
      const row = specData.rows[r];
      if (!row) continue;
      for (let c = 0; c < row.cells.length; c++) {
        const cell = row.cells[c];
        if (!cell) continue;
        for (let l = 0; l < cell.lines.length; l++) {
          const lineCell = cell.lines[l];
          if (lineCell.rowspan > 1) {
            // 이 줄 셀의 rowspan 범위가 현재 줄 셀을 포함하는지 확인
            if (
              r + lineCell.rowspan > rowIndex &&
              c <= colIndex &&
              c + lineCell.colspan > colIndex
            ) {
              return true;
            }
          }
        }
      }
    }

    // 같은 행의 이전 셀들을 확인하여 colspan이 이 줄 셀을 덮는지 확인
    for (let c = 0; c < colIndex; c++) {
      const cell = currentRow.cells[c];
      if (!cell) continue;
      for (let l = 0; l < cell.lines.length; l++) {
        const lineCell = cell.lines[l];
        if (lineCell.colspan > 1 && c + lineCell.colspan > colIndex) {
          return true;
        }
      }
    }

    // 같은 셀 내의 이전 줄들을 확인하여 rowspan이 이 줄을 덮는지 확인
    for (let l = 0; l < lineIndex; l++) {
      const lineCell = currentCell.lines[l];
      if (lineCell.rowspan > 1 && l + lineCell.rowspan > lineIndex) {
        return true;
      }
    }

    return false;
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
        {selectedCells.length > 1 && (
          <div className="bg-blue-50 border-b border-blue-200 p-2 flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedCells.length}개 셀이 선택되었습니다.
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={mergeSelectedCells}
                className="gap-1 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <Merge className="h-3 w-3" />
                셀 병합
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCells([])}
                className="text-gray-600"
              >
                선택 해제
              </Button>
            </div>
          </div>
        )}
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

                        // 숨겨진 줄 셀은 렌더링하지 않음
                        if (isLineCellHidden(rowIndex, cellIndex, lineIndex)) {
                          return null;
                        }

                        const isSelected = selectedCells.some(
                          (c) =>
                            c.row === rowIndex &&
                            c.col === cellIndex &&
                            c.line === lineIndex
                        );
                        const isMerged = lineCell.rowspan > 1 || lineCell.colspan > 1;
                        const isVirtualCell = !cell.lines[lineIndex]; // 실제 데이터에 없는 가상 셀

                        return (
                          <td
                            key={cellIndex}
                            rowSpan={lineCell.rowspan > 1 ? lineCell.rowspan : undefined}
                            colSpan={lineCell.colspan > 1 ? lineCell.colspan : undefined}
                            className={`p-2 border-r border-gray-300 last:border-r-0 ${
                              isVirtualCell ? 'align-middle' : 'align-top'
                            } ${
                              isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                            } ${isMerged ? 'bg-yellow-50' : ''}`}
                            onClick={(e) => {
                              // 버튼 클릭 시에는 셀 선택 토글하지 않음
                              if ((e.target as HTMLElement).closest('button')) {
                                return;
                              }
                              // 가상 셀은 셀 클릭으로 줄 추가하지 않음 (버튼으로만 추가)
                              if (!isVirtualCell) {
                                toggleLineCellSelection(rowIndex, cellIndex, lineIndex);
                              }
                            }}
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
                                {isMerged && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        unmergeLineCell(rowIndex, cellIndex, lineIndex);
                                      }}
                                      className="w-full gap-1 text-xs"
                                    >
                                      <Split className="h-3 w-3" />
                                      병합 해제
                                    </Button>
                                  </div>
                                )}
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

