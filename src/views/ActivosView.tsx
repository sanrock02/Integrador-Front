import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '../utils/cn';
import { ActivoTecnologico } from '../types';

interface ActivosViewProps {
  isDarkMode: boolean;
  activos: ActivoTecnologico[];
}

export const ActivosView = ({ isDarkMode, activos }: ActivosViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Inventario Tecnológico</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all">
          Agregar Activo
        </button>
      </div>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="data-table-header">
                <th className="p-4 text-left">Serial</th>
                <th className="p-4 text-left">Tipo</th>
                <th className="p-4 text-left">Marca</th>
                <th className="p-4 text-left">Ubicación</th>
                <th className="p-4 text-left">Responsable</th>
                <th className="p-4 text-left">Specs</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {activos.map((a, i) => (
                <tr key={i} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                  <td className={cn("p-4 font-mono text-xs font-bold", isDarkMode ? "text-slate-300" : "text-slate-900")}>{a.serial_1}</td>
                  <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{a.tipo_pc}</td>
                  <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{a.marca}</td>
                  <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{a.ubicacion}</td>
                  <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{a.responsable}</td>
                  <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                    {a.procesador} / {a.ram} / {a.almacenamiento}
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-bold",
                      a.estado === 'ACTIVO' 
                        ? (isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700")
                        : (isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700")
                    )}>
                      {a.estado}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className={cn("p-2 rounded-lg transition-all", isDarkMode ? "text-blue-400 hover:bg-blue-900/30" : "text-blue-600 hover:bg-blue-50")}>
                      <Settings size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
