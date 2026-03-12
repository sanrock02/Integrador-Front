import React from 'react';
import { Search, Zap } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { apiService } from '../services/api';
import { Venta } from '../types';

interface VentasViewProps {
  isDarkMode: boolean;
  ventas: Venta[];
  setVentas: React.Dispatch<React.SetStateAction<Venta[]>>;
}

export const VentasView = ({ isDarkMode, ventas, setVentas }: VentasViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Ventas Bodega</h2>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all">
          Actualizar Ventas
        </button>
      </div>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <div className={cn("p-4 border-b transition-colors", isDarkMode ? "border-slate-700" : "border-slate-100")}>
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar venta..."
              className={cn("w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0078D4] transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-900")}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="data-table-header">
                <th className="p-4 text-left">Factura</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Nit</th>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Vendedor</th>
                <th className="p-4 text-right">Neto</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {ventas.map((v, i) => (
                <tr key={i} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                  <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{v.Prefijo}-{v.Numero}</td>
                  <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{v.Fecha}</td>
                  <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{v.Nit}</td>
                  <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{v.Nombre}</td>
                  <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{v.Vendedor}</td>
                  <td className={cn("p-4 text-right font-mono font-bold", isDarkMode ? "text-slate-200" : "text-slate-900")}>{formatCurrency(v.Neto)}</td>
                  <td className="p-4 text-center">
                    {v.pasado ? (
                      <span className={cn("px-2 py-1 rounded-lg text-xs font-bold", isDarkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700")}>
                        PASADO ({v.Usuario})
                      </span>
                    ) : (
                      <span className={cn("px-2 py-1 rounded-lg text-xs font-bold", isDarkMode ? "bg-slate-700 text-slate-500" : "bg-slate-100 text-slate-500")}>
                        PENDIENTE
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {!v.pasado && v.puede_pasar && (
                      <button 
                        onClick={async () => {
                          const res = await apiService.pasarFactura(v.Vendedor, v.Nit, v.Prefijo, v.Numero);
                          if (res.status === 'success') {
                            setVentas(prev => prev.map(item => 
                              (item.Prefijo === v.Prefijo && item.Numero === v.Numero) 
                                ? { ...item, pasado: true, Usuario: res.usuario } 
                                : item
                            ));
                          }
                        }}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm"
                      >
                        <Zap size={14} />
                      </button>
                    )}
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
