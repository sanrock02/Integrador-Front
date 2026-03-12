import React from 'react';
import { cn } from '../utils/cn';
import { Pedido } from '../types';

interface PedidosViewProps {
  isDarkMode: boolean;
  pedidos: Pedido[];
}

export const PedidosView = ({ isDarkMode, pedidos }: PedidosViewProps) => {
  return (
    <div className="space-y-6">
      <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Pedidos Saanye</h2>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="data-table-header">
              <th className="p-4 text-left">Pedido</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Entrega</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Usuario</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {pedidos.map((p, i) => (
              <tr key={i} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{p.prefijo}-{p.numero}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{p.fecha_pedido}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{p.fecha_entrega}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-bold",
                    p.estado === 'ENTREGADO' 
                      ? (isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700")
                      : (isDarkMode ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700")
                  )}>
                    {p.estado}
                  </span>
                </td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{p.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
