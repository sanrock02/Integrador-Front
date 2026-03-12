import React, { useState } from 'react';
import { apiService } from '../services/api';
import { cn } from '../utils/cn';

interface EditableCellProps {
  id: number;
  initialValue: string | number;
  isProvider?: boolean;
  isDarkMode: boolean;
  onSave: (newValue: string) => void;
}

export const EditableCell = ({ 
  id, 
  initialValue, 
  isProvider, 
  isDarkMode,
  onSave 
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(initialValue === 0 ? '' : initialValue));

  const handleBlur = async () => {
    setIsEditing(false);
    if (value !== String(initialValue === 0 ? '' : initialValue)) {
      try {
        const success = await apiService.updateDescription(id, value.toUpperCase(), isProvider);
        if (success) {
          onSave(value.toUpperCase());
        }
      } catch (error) {
        console.error("Error updating description:", error);
        setValue(String(initialValue === 0 ? '' : initialValue));
      }
    }
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className="w-full px-2 py-1 border border-blue-400 rounded outline-none bg-blue-50 text-xs font-bold"
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer px-2 py-1 rounded transition-colors min-h-[24px] flex items-center",
        isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-blue-50 text-slate-700"
      )}
    >
      {initialValue === 0 || !initialValue ? <span className={isDarkMode ? "text-slate-600" : "text-slate-300"}>-</span> : initialValue}
    </div>
  );
};
