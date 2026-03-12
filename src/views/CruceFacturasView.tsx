import React from 'react';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { CruceRecibo } from '../types';

interface CruceFacturasViewProps {
  isDarkMode: boolean;
  cruceFacturas: CruceRecibo[];
}

export const CruceFacturasView = ({ isDarkMode, cruceFacturas }: CruceFacturasViewProps) => {
  return (
    <div className="space-y-6">
      <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Cruce de Facturas Saanye</h2>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="data-table-header">
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Factura</th>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-right">Valor Recibido</th>
              <th className="p-4 text-right">Pago ZH</th>
              <th className="p-4 text-center">Match</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {cruceFacturas.map((c, i) => (
              <tr key={i} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{c.fecha}</td>
                <td className={cn("p-4 font-mono", isDarkMode ? "text-slate-400" : "text-slate-900")}>{c.prefijo_Django}-{c.numero_fra}</td>
                <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{c.Nombre}</td>
                <td className={cn("p-4 text-right font-mono font-bold", isDarkMode ? "text-blue-400" : "text-blue-600")}>{formatCurrency(c.valor_recibido)}</td>
                <td className={cn("p-4 text-right font-mono font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{formatCurrency(c.Pagoredondeado)}</td>
                <td className="p-4 text-center">
                  {c.coincidencia ? (
                    <div className="flex justify-center"><div className={cn("w-3 h-3 rounded-full shadow-sm", isDarkMode ? "bg-emerald-500 shadow-emerald-800/50" : "bg-emerald-500 shadow-emerald-200")}></div></div>
                  ) : (
                    <div className="flex justify-center"><div className={cn("w-3 h-3 rounded-full shadow-sm", isDarkMode ? "bg-red-500 shadow-red-800/50" : "bg-red-500 shadow-red-200")}></div></div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
