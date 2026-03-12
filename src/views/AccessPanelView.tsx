import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { BankAccount, ViewType } from '../types';
import { REPORT_ITEMS } from '../constants';

interface AccessPanelViewProps {
  isDarkMode: boolean;
  bankAccounts: BankAccount[];
  onBankSelect: (bank: BankAccount) => void;
  onViewChange: (view: ViewType) => void;
}

export const AccessPanelView = ({ 
  isDarkMode, 
  bankAccounts, 
  onBankSelect, 
  onViewChange 
}: AccessPanelViewProps) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <h2 className={cn("text-3xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Bienvenido al Panel de Accesos</h2>
        <p className={cn("text-slate-500", isDarkMode ? "text-slate-400" : "text-slate-500")}>Selecciona una opción para comenzar a trabajar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Informes en Excel */}
        <div className={cn("rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <div className={cn("p-4 border-b text-center transition-colors", isDarkMode ? "bg-slate-700/50 border-slate-700" : "bg-slate-50 border-slate-200")}>
            <h3 className={cn("font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>Informes en Excel</h3>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {REPORT_ITEMS.map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm group">
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Otras opciones */}
        <div className={cn("rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <div className={cn("p-4 border-b text-center transition-colors", isDarkMode ? "bg-slate-700/50 border-slate-700" : "bg-slate-50 border-slate-200")}>
            <h3 className={cn("font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>Otras opciones</h3>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {[
              { label: 'Dinero recibido almacenes', id: 'dinero-recibido' },
              { label: 'Cruces Facturas Saanye', id: 'cruce-facturas' },
              { label: 'Ventas Bodegas', id: 'ventas' },
              { label: 'Pedidos Saanye', id: 'pedidos' },
              { label: 'Activos Tecnológicos', id: 'activos' }
            ].map((opt, i) => (
              <button 
                key={i} 
                onClick={() => onViewChange(opt.id as ViewType)}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bancos con ZH */}
        <div className={cn("rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <div className={cn("p-4 border-b text-center transition-colors", isDarkMode ? "bg-slate-700/50 border-slate-700" : "bg-slate-50 border-slate-200")}>
            <h3 className={cn("font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>Bancos</h3>
          </div>
          <div className="p-4 space-y-2 flex-1">
            <div className="relative group">
              <button className="w-full flex items-center justify-between p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm">
                <span className="text-sm font-medium">Bancos con ZH</span>
                <ChevronDown size={16} />
              </button>
              <div className={cn("absolute left-0 right-0 mt-1 border rounded-xl shadow-xl z-30 hidden group-hover:block overflow-hidden transition-colors", isDarkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200")}>
                {bankAccounts.filter(b => b.hasZH).map(bank => (
                  <button 
                    key={bank.id}
                    onClick={() => onBankSelect(bank)}
                    className={cn("w-full text-left px-4 py-2 text-sm transition-colors", isDarkMode ? "text-slate-400 hover:bg-slate-700 hover:text-blue-400" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600")}
                  >
                    {bank.name}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm">
              Actualizar banco
            </button>
          </div>
        </div>

        {/* Bancos sin ZH */}
        <div className={cn("rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <div className={cn("p-4 border-b text-center transition-colors", isDarkMode ? "bg-slate-700/50 border-slate-700" : "bg-slate-50 border-slate-200")}>
            <h3 className={cn("font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>Bancos sin ZH</h3>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {bankAccounts.filter(b => !b.hasZH).map((bank) => (
              <button 
                key={bank.id} 
                onClick={() => onBankSelect(bank)}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
              >
                {bank.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
