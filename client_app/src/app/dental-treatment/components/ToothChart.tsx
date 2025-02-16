'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { STATUS_COLORS } from '@/lib/constants';
import { Treatment } from '@/services/api';

export interface Tooth {
  number: string;
  position: { x: number; y: number };
  type: 'molar' | 'premolar' | 'canine' | 'incisor';
  name: string;
  status?:
    | 'healthy'
    | 'treated'
    | 'pending'
    | 'missing'
    | 'caries'
    | 'filled'
    | 'crown';
}

interface ToothChartProps {
  onToothSelect: (tooth: Tooth) => void;
  selectedTeeth: Set<string>;
  clearSelection: () => void;
  treatments: Record<string, string>;
  patientId: string;
  appointmentId?: string | null;
  activeTab: 'medical' | 'cosmetic';
  onAddTreatment?: (data: TreatmentFormValues) => void;
  onOpenAddModal: () => void;
}

// More realistic tooth path data
const toothPaths = {
  molar: `
    M -12,-12 
    C -12,-15 -10,-18 -6,-18 
    L 6,-18 
    C 10,-18 12,-15 12,-12 
    L 12,-6
    C 12,-3 10,0 6,0
    L -6,0
    C -10,0 -12,-3 -12,-6
    Z
    M -12,0
    C -12,-3 -10,-6 -6,-6
    L 6,-6
    C 10,-6 12,-3 12,0
    L 12,6
    C 12,9 10,12 6,12
    L -6,12
    C -10,12 -12,9 -12,6
    Z
  `,
  premolar: `
    M -10,-12 
    C -10,-15 -8,-18 -5,-18 
    L 5,-18 
    C 8,-18 10,-15 10,-12 
    L 10,12
    C 10,15 8,18 5,18
    L -5,18
    C -8,18 -10,15 -10,12
    Z
  `,
  canine: `
    M 0,-18
    L 8,-9
    L 8,12
    C 8,15 5,18 2,18
    L -2,18
    C -5,18 -8,15 -8,12
    L -8,-9
    Z
  `,
  incisor: `
    M -6,-18
    L 6,-18
    L 5,18
    L -5,18
    Z
  `
};

// Define tooth names mapping
const toothNames: { [key: string]: string } = {
  '18': 'Third Molar',
  '17': 'Second Molar',
  '16': 'First Molar',
  '15': 'Second Premolar',
  '14': 'First Premolar',
  '13': 'Canine',
  '12': 'Lateral Incisor',
  '11': 'Central Incisor'
  // ... add more tooth names
};

export function ToothChart({
  onToothSelect,
  selectedTeeth,
  clearSelection,
  treatments,
  patientId,
  appointmentId,
  activeTab,
  onAddTreatment,
  onOpenAddModal
}: ToothChartProps) {
  const handleAddClick = () => {
    if (selectedTeeth.size === 0) {
      toast.error('Please select at least one tooth');
      return;
    }
    onOpenAddModal();
  };

  // Calculate arch positions
  const createArchPositions = (
    startX: number,
    endX: number,
    y: number,
    count: number,
    isUpper: boolean
  ) => {
    const positions = [];
    const width = endX - startX;
    const step = width / (count - 1);
    const archHeight = 50;

    for (let i = 0; i < count; i++) {
      const x = startX + i * step;
      const progress = i / (count - 1);
      const archY = isUpper
        ? y - Math.sin(progress * Math.PI) * archHeight
        : y + Math.sin(progress * Math.PI) * archHeight;
      positions.push({ x, y: archY });
    }

    return positions;
  };

  // Define teeth with proper positions along arches
  const teeth: Tooth[] = [
    // Upper teeth (1-16)
    ...createArchPositions(50, 450, 60, 16, true).map((pos, i) => ({
      number: (18 - i).toString().padStart(2, '0'),
      name: toothNames[(18 - i).toString().padStart(2, '0')] || '',
      position: pos,
      type:
        i < 3 || i > 12
          ? 'molar'
          : i < 5 || i > 10
          ? 'premolar'
          : i < 6 || i > 9
          ? 'canine'
          : 'incisor'
    })),
    // Lower teeth (17-32)
    ...createArchPositions(50, 450, 220, 16, false).map((pos, i) => ({
      number: (48 - i).toString().padStart(2, '0'),
      name: toothNames[(48 - i).toString().padStart(2, '0')] || '',
      position: pos,
      type:
        i < 3 || i > 12
          ? 'molar'
          : i < 5 || i > 10
          ? 'premolar'
          : i < 6 || i > 9
          ? 'canine'
          : 'incisor'
    }))
  ];

  // Helper function to get tooth status from treatments
  const getToothStatus = (toothNumber: string) => {
    // Ensure treatments is an array
    if (!Array.isArray(treatments)) return undefined;

    // Find any treatment that has this tooth number
    for (const treatment of treatments) {
      const toothTreatment = treatment.toothTreatments?.find(
        t => t.toothNumber === toothNumber
      );
      if (toothTreatment) {
        return toothTreatment.status;
      }
    }
    return undefined;
  };

  // Helper function to get tooth class based on status
  const getToothClass = (toothNumber: string) => {
    const status = getToothStatus(toothNumber);
    const isSelected = selectedTeeth.has(toothNumber);

    return cn('tooth-path cursor-pointer transition-all duration-200', {
      // Selection highlight (only if not treated)
      'fill-blue-200 stroke-blue-500': isSelected && !status,

      // Status colors from constants
      [STATUS_COLORS.Done.fill + ' ' + STATUS_COLORS.Done.stroke]:
        status === 'Done',
      [STATUS_COLORS.Ongoing.fill + ' ' + STATUS_COLORS.Ongoing.stroke]:
        status === 'Ongoing',
      [STATUS_COLORS.Pending.fill + ' ' + STATUS_COLORS.Pending.stroke]:
        status === 'Pending',

      // Default state
      'fill-white stroke-gray-300 hover:fill-gray-50': !isSelected && !status
    });
  };

  return (
    <div className="relative">
      {/* Show buttons only when teeth are selected */}
      {selectedTeeth.size > 0 && (
        <div className="absolute -top-12 right-0 flex gap-2">
          <Button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Add Treatment
          </Button>
          <Button
            onClick={clearSelection}
            className="bg-gray-600 hover:bg-gray-700 text-white">
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      )}

      {/* Tooth chart SVG */}
      <svg width="500" height="280" className="mx-auto">
        {/* Draw connecting lines for upper and lower arches */}
        <path
          d="M 50,60 C 250,10 250,10 450,60"
          fill="none"
          stroke="#ddd"
          strokeWidth="1"
        />
        <path
          d="M 50,220 C 250,270 250,270 450,220"
          fill="none"
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* Render teeth with status colors */}
        {teeth.map(tooth => (
          <g
            key={tooth.number}
            transform={`translate(${tooth.position.x}, ${tooth.position.y})`}
            onClick={() => onToothSelect(tooth)}
            className={getToothClass(tooth.number)}>
            <path d={toothPaths[tooth.type]} />
            <text
              x="0"
              y="0"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="fill-current text-black"
              style={{ pointerEvents: 'none' }}>
              {tooth.number}
            </text>
            <title>{`${tooth.number} - ${tooth.name}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ToothShape({
  type,
  isSelected,
  status
}: {
  type: Tooth['type'];
  isSelected: boolean;
  status?: Tooth['status'];
}) {
  const getFill = () => {
    if (isSelected) return '#93c5fd';
    switch (status) {
      case 'treated':
        return '#86efac';
      case 'pending':
        return '#fde047';
      case 'missing':
        return '#fee2e2';
      case 'caries':
        return '#fca5a5';
      case 'filled':
        return '#86efac';
      case 'crown':
        return '#c4b5fd';
      default:
        return 'white';
    }
  };

  return (
    <path
      d={toothPaths[type]}
      fill={getFill()}
      stroke="black"
      strokeWidth="0.5"
      className={cn(
        'transition-colors duration-200',
        status === 'missing' && 'stroke-red-300 stroke-dasharray-2'
      )}
    />
  );
}
