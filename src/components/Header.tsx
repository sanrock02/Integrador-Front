import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../utils/cn';
import { ViewType, BankAccount } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  currentView: ViewType;
  selectedBank: BankAccount;
}

export const Header = ({ 
  isDarkMode, 
  setIsDarkMode, 
  currentView, 
  selectedBank 
}: HeaderProps) => {
  return (
    <header className={cn("border-b h-16 flex items-center justify-between px-8 z-10 transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
      <div className="flex items-center gap-4">
        <h2 className={cn("text-lg font-bold capitalize", isDarkMode ? "text-slate-100" : "text-slate-800")}>
          {currentView === 'transactions' ? `Conciliación: ${selectedBank.name}` : currentView.replace('-', ' ')}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            "p-2 rounded-lg transition-all duration-300",
            isDarkMode ? "bg-slate-700 text-amber-400 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={cn("flex items-center gap-3 px-4 py-1.5 border rounded-full transition-colors", isDarkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200")}>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            AD
          </div>
          <div className="hidden sm:block">
            <p className={cn("text-xs font-bold", isDarkMode ? "text-slate-200" : "text-slate-800")}>Admin User</p>
            <p className={cn("text-[10px]", isDarkMode ? "text-slate-500" : "text-slate-500")}>Grupo Aristizabal Duque</p>
          </div>
        </div>
      </div>
    </header>
  );
};
