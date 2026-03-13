import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { Pedido } from '../types';
import { apiService } from '../services/api';

interface PedidosViewProps {
  isDarkMode: boolean;
  pedidos: Pedido[];
  setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>;
}

const getEstadoLabel = (pedido: Pedido) => {
  if (pedido.estado === 'EMPACADO' && pedido.enviado) return 'ENTREGADO';
  return pedido.estado;
};

const getEstadoColor = (pedido: Pedido) => {
  if (pedido.estado === 'EMPACADO' && pedido.enviado) return 'green';
  if (pedido.estado === 'EMPACADO') return '#2a8be6be';
  if (pedido.estado === 'EN EMPAQUE') return '#90EE90';
  if (pedido.estado === 'EN PROCESO') return 'yellow';
  return 'red';
};

export const PedidosView = ({ isDarkMode, pedidos, setPedidos }: PedidosViewProps) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const beginEdit = (pedido: Pedido, field: 'fecha_entrega' | 'detalle_cumplimiento') => {
    const key = `${pedido.prefijo}-${pedido.numero}-${pedido.fecha}-${field}`;
    const current = field === 'fecha_entrega' ? pedido.fecha_entrega : pedido.detalle_cumplimiento;
    setEditingKey(key);
    setEditingValue(String(current || '').trim());
  };

  const commitEdit = async (pedido: Pedido, field: 'fecha_entrega' | 'detalle_cumplimiento') => {
    const newValue = editingValue.trim().toUpperCase();
    const key = `${pedido.prefijo}-${pedido.numero}-${pedido.fecha}-${field}`;
    setEditingKey(null);
    if (newValue === String(field === 'fecha_entrega' ? pedido.fecha_entrega : pedido.detalle_cumplimiento).trim()) {
      return;
    }
    try {
      const result = await apiService.updatePedidoSaanye({
        id: pedido.id,
        field,
        value: newValue,
        prefijo: pedido.prefijo,
        numero: pedido.numero,
        fecha: pedido.fecha
      });
      setPedidos(prev => prev.map(p => {
        const same = p.id === pedido.id || (p.prefijo === pedido.prefijo && p.numero === pedido.numero && p.fecha === pedido.fecha);
        if (!same) return p;
        return {
          ...p,
          id: result.id ?? p.id,
          fecha_entrega: field === 'fecha_entrega' ? newValue : p.fecha_entrega,
          detalle_cumplimiento: field === 'detalle_cumplimiento' ? newValue : p.detalle_cumplimiento
        };
      }));
    } catch (error) {
      console.error('Error updating pedido:', error);
      setEditingKey(key);
      alert('Error al actualizar el campo. Si es fecha, usa formato YYYY-MM-DD.');
    }
  };

  const toggleEnviado = async (pedido: Pedido, nextValue: boolean) => {
    try {
      const result = await apiService.updatePedidoSaanye({
        id: pedido.id,
        field: 'enviado',
        value: nextValue,
        prefijo: pedido.prefijo,
        numero: pedido.numero,
        fecha: pedido.fecha
      });
      setPedidos(prev => prev.map(p => {
        const same = p.id === pedido.id || (p.prefijo === pedido.prefijo && p.numero === pedido.numero && p.fecha === pedido.fecha);
        if (!same) return p;
        return {
          ...p,
          id: result.id ?? p.id,
          enviado: nextValue
        };
      }));
    } catch (error) {
      console.error('Error updating envio:', error);
      alert('Error al actualizar el estado de envío.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Pedidos Saanye</h2>
      <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="data-table-header">
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Bodega</th>
              <th className="p-4 text-left">Prefijo</th>
              <th className="p-4 text-left">Numero</th>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Estado</th>
              <th className="p-4 text-left">Usuario</th>
              <th className="p-4 text-left">Picking</th>
              <th className="p-4 text-left">Venta</th>
              <th className="p-4 text-left">Empaque</th>
              <th className="p-4 text-left">F.Entrega</th>
              <th className="p-4 text-left">%Cumplimiento</th>
              <th className="p-4 text-left">Det.Cumpl</th>
              <th className="p-4 text-left">Enviado</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {pedidos.map((p, i) => (
              <tr key={`${p.prefijo}-${p.numero}-${p.fecha}-${i}`} className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}>
                <td className={cn("p-4 text-slate-400 font-mono text-xs")}>{i + 1}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{p.fecha}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{p.bodega}</td>
                <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{p.prefijo}</td>
                <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{p.numero}</td>
                <td className={cn("p-4", isDarkMode ? "text-slate-400" : "text-slate-600")}>{p.cliente}</td>
                <td className="p-4">
                  <span
                    className={cn("px-2 py-1 rounded-lg text-xs font-bold", isDarkMode ? "text-slate-100" : "text-slate-900")}
                    style={{ backgroundColor: getEstadoColor(p) }}
                  >
                    {getEstadoLabel(p)}
                  </span>
                </td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{p.usuario_pedido}</td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{p.picking}</td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{p.venta}</td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{p.empaque}</td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  {editingKey === `${p.prefijo}-${p.numero}-${p.fecha}-fecha_entrega` ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => commitEdit(p, 'fecha_entrega')}
                      className="w-full px-2 py-1 border border-blue-400 rounded outline-none bg-blue-50 text-xs font-bold"
                    />
                  ) : (
                    <span
                      onClick={() => beginEdit(p, 'fecha_entrega')}
                      className={cn(
                        "cursor-pointer px-2 py-1 rounded transition-colors min-h-[24px] inline-flex items-center",
                        isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-blue-50 text-slate-700"
                      )}
                    >
                      {p.fecha_entrega?.trim() ? p.fecha_entrega : <span className={isDarkMode ? "text-slate-600" : "text-slate-300"}>-</span>}
                    </span>
                  )}
                </td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>{p.cumplimiento}</td>
                <td className={cn("p-4 text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  {editingKey === `${p.prefijo}-${p.numero}-${p.fecha}-detalle_cumplimiento` ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => commitEdit(p, 'detalle_cumplimiento')}
                      className="w-full px-2 py-1 border border-blue-400 rounded outline-none bg-blue-50 text-xs font-bold"
                    />
                  ) : (
                    <span
                      onClick={() => beginEdit(p, 'detalle_cumplimiento')}
                      className={cn(
                        "cursor-pointer px-2 py-1 rounded transition-colors min-h-[24px] inline-flex items-center",
                        isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-blue-50 text-slate-700"
                      )}
                    >
                      {p.detalle_cumplimiento?.trim() ? p.detalle_cumplimiento : <span className={isDarkMode ? "text-slate-600" : "text-slate-300"}>-</span>}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={p.enviado}
                    disabled={p.estado !== 'EMPACADO'}
                    onChange={(e) => toggleEnviado(p, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={15} className={cn("p-10 text-center text-sm", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  No se encontraron pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
