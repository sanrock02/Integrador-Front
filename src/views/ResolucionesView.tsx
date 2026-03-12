import React from 'react';
import { cn } from '../utils/cn';
import { Resolucion } from '../types';

interface ResolucionesViewProps {
  isDarkMode: boolean;
  resoluciones: Resolucion[];
}

export const ResolucionesView = ({ isDarkMode, resoluciones }: ResolucionesViewProps) => {
  return (
    <div className="space-y-6">
      <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Resoluciones</h2>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="data-table-header">
              <th className="p-4 text-left">Almacén</th>
              <th className="p-4 text-left">Prefijo</th>
              <th className="p-4 text-left">Rango</th>
              <th className="p-4 text-left">Último</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-center">Vencimiento</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {resoluciones.map((r, i) => (
              <tr key={i} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{r.Almacen}</td>
                <td className={cn("p-4 font-mono", isDarkMode ? "text-slate-400" : "text-slate-600")}>{r.Prefijo}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{r.Numero_Inicial} - {r.Numero_Final}</td>
                <td className={cn("p-4 font-bold", isDarkMode ? "text-blue-400" : "text-blue-600")}>{r.Ultimo_Numero}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{r.Fecha_Resolucion}</td>
                <td className="p-4 text-center">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-bold",
                    r.Dias_Vencimiento < 30 
                      ? (isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700")
                      : (isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700")
                  )}>
                    {r.Dias_Vencimiento} días
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
