import React from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { apiService } from '../services/api';
import { DineroRecibido } from '../types';

interface DineroRecibidoViewProps {
  isDarkMode: boolean;
  dineroRecibido: DineroRecibido[];
  setDineroRecibido: React.Dispatch<React.SetStateAction<DineroRecibido[]>>;
}

export const DineroRecibidoView = ({ isDarkMode, dineroRecibido, setDineroRecibido }: DineroRecibidoViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Dinero Recibido Almacenes</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all">
          Nuevo Registro
        </button>
      </div>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="data-table-header">
                <th className="p-4 text-left">Almacén</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Factura</th>
                <th className="p-4 text-left">Cliente</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-left">Usuario</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dineroRecibido.map((d, i) => (
                <tr key={i} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                  <td className="p-4 font-bold text-blue-600 uppercase">{d.almacen}</td>
                  <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{d.fecha}</td>
                  <td className={cn("p-4 font-mono", isDarkMode ? "text-slate-300" : "text-slate-900")}>{d.prefijo}-{d.numero_fra}</td>
                  <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{d.nombre_cliente}</td>
                  <td className="p-4 text-right font-mono font-bold text-emerald-600">{d.valor_recibido}</td>
                  <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{d.usuario}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className={cn("p-2 rounded-lg transition-all", isDarkMode ? "text-blue-400 hover:bg-blue-900/30" : "text-blue-600 hover:bg-blue-50")}>
                        <FileText size={14} />
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('¿Eliminar este registro?')) {
                            const ok = await apiService.deleteDineroRecibido(d.id);
                            if (ok) setDineroRecibido(prev => prev.filter(item => item.id !== d.id));
                          }
                        }}
                        className={cn("p-2 rounded-lg transition-all", isDarkMode ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50")}
                      >
                        <X size={14} />
                      </button>
                    </div>
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
