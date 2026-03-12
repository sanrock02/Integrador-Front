import React from 'react';
import { cn } from '../utils/cn';
import { RegistroPacking } from '../types';

interface PackingViewProps {
  isDarkMode: boolean;
  packing: RegistroPacking[];
}

export const PackingView = ({ isDarkMode, packing }: PackingViewProps) => {
  return (
    <div className="space-y-6">
      <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Registro Packing</h2>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="data-table-header">
              <th className="p-4 text-left">Empresa</th>
              <th className="p-4 text-left">Factura</th>
              <th className="p-4 text-left">Fecha ZH</th>
              <th className="p-4 text-left">Tiempo</th>
              <th className="p-4 text-left">Cajas/Paq</th>
              <th className="p-4 text-left">Usuario</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {packing.map((p, i) => (
              <tr key={i} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                <td className={cn("p-4 font-bold uppercase", isDarkMode ? "text-slate-300" : "text-slate-700")}>{p.empresa}</td>
                <td className={cn("p-4 font-mono", isDarkMode ? "text-slate-400" : "text-slate-900")}>{p.prefijo}-{p.numero}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{p.fecha_ZH}</td>
                <td className={cn("p-4 font-bold text-blue-500", isDarkMode ? "text-blue-400" : "text-blue-600")}>{p.tiempo_transcurrido}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{p.cajas} / {p.paquetes}</td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{p.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
