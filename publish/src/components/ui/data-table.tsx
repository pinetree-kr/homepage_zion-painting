import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreVertical } from 'lucide-react';
import { Checkbox } from './checkbox';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableAction<T> {
  label: string | ((row: T) => string);
  icon?: React.ReactNode | ((row: T) => React.ReactNode);
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  onSelectionChange?: (selectedRows: T[]) => void;
  getRowId: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  onSelectionChange,
  getRowId,
  emptyMessage = '데이터가 없습니다'
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(data.map(getRowId));
      setSelectedRows(allIds);
      onSelectionChange?.(data);
    }
  };

  const handleSelectRow = (rowId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    setSelectedRows(newSelection);
    
    const selectedData = data.filter(row => newSelection.has(getRowId(row)));
    onSelectionChange?.(selectedData);
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    
    const column = columns.find(col => col.id === sortColumn);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);
      
      const aString = typeof aValue === 'string' ? aValue : String(aValue);
      const bString = typeof bValue === 'string' ? bValue : String(bValue);
      
      if (sortDirection === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [data, sortColumn, sortDirection, columns]);

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="ml-2 h-3.5 w-3.5 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-2 h-3.5 w-3.5 text-[#1A2C6D]" />;
    }
    return <ChevronDown className="ml-2 h-3.5 w-3.5 text-[#1A2C6D]" />;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedRows.size === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="flex items-center hover:text-gray-900 transition-colors"
                    >
                      {column.header}
                      {getSortIcon(column.id)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="w-12 px-4 py-3"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 1)}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.has(rowId);
                const isHovered = hoveredRow === rowId;
                
                return (
                  <tr
                    key={rowId}
                    className={`
                      transition-colors
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${isHovered ? 'bg-gray-50' : ''}
                    `}
                    onMouseEnter={() => setHoveredRow(rowId)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(rowId)}
                        aria-label={`Select row ${rowId}`}
                      />
                    </td>
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className="px-4 py-3 text-sm text-gray-900"
                      >
                        {column.accessor(row)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div
                          className={`
                            transition-opacity duration-150
                            ${isHovered ? 'opacity-100' : 'opacity-0'}
                          `}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded transition-colors inline-flex items-center justify-center">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action, index) => {
                                const label = typeof action.label === 'function' ? action.label(row) : action.label;
                                const icon = typeof action.icon === 'function' ? action.icon(row) : action.icon;
                                
                                return (
                                  <DropdownMenuItem
                                    key={index}
                                    onClick={() => action.onClick(row)}
                                    className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                  >
                                    {icon && <span className="mr-2">{icon}</span>}
                                    {label}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
