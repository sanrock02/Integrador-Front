import React, { useState } from 'react';
import { cn } from '../utils/cn';
import { Pedido } from '../types';
import { apiService } from '../services/api';
import { Download } from 'lucide-react';

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
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstados, setSelectedEstados] = useState<string[]>([]);

  const availableEstados = Array.from(new Set(pedidos.map(p => getEstadoLabel(p)))).sort();

  const filteredPedidos = pedidos.filter(p => {
    if (!searchTerm.trim()) return true;
    const hay = [
      p.fecha,
      p.bodega,
      p.prefijo,
      p.numero,
      p.cliente,
      p.usuario_pedido,
      p.picking,
      p.venta,
      p.empaque,
      p.fecha_entrega,
      p.cumplimiento,
      p.detalle_cumplimiento,
      p.estado,
      p.enviado ? 'si' : 'no'
    ].join(' ').toLowerCase();
    return hay.includes(searchTerm.toLowerCase());
  }).filter(p => {
    if (selectedEstados.length === 0) return true;
    return selectedEstados.includes(getEstadoLabel(p));
  });

  const visiblePedidos = filteredPedidos.slice(0, pageSize);

  const buildCsv = (headers: string[], rows: Array<Array<string | number | boolean | null | undefined>>, delimiter = ';') => {
    const escapeCell = (value: string | number | boolean | null | undefined) => {
      const text = String(value ?? '');
      const needsQuotes = text.includes('"') || text.includes('\n') || text.includes('\r') || text.includes(delimiter);
      if (!needsQuotes) return text;
      return `"${text.replace(/"/g, '""')}"`;
    };

    const lines = [
      `sep=${delimiter}`,
      headers.map(escapeCell).join(delimiter),
      ...rows.map(row => row.map(cell => escapeCell(cell)).join(delimiter))
    ];

    return `\ufeff${lines.join('\n')}`;
  };

  const downloadCsv = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const headers = [
      '#',
      'Fecha',
      'Bodega',
      'Prefijo',
      'Numero',
      'Cliente',
      'Estado',
      'Usuario',
      'Picking',
      'Venta',
      'Empaque',
      'F.Entrega',
      '%Cumplimiento',
      'Det.Cumpl',
      'Enviado'
    ];

    const rows = visiblePedidos.map((p, index) => ([
      String(index + 1),
      p.fecha ?? '',
      p.bodega ?? '',
      p.prefijo ?? '',
      p.numero ?? '',
      p.cliente ?? '',
      getEstadoLabel(p) ?? '',
      p.usuario_pedido ?? '',
      p.picking ?? '',
      p.venta ?? '',
      p.empaque ?? '',
      p.fecha_entrega ?? '',
      p.cumplimiento ?? '',
      p.detalle_cumplimiento ?? '',
      p.enviado ? 'SI' : 'NO'
    ]));

    const dateStamp = new Date().toISOString().slice(0, 10);
    const csv = buildCsv(headers, rows);
    downloadCsv(`pedidos-saanye-${dateStamp}.csv`, csv);
  };

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Pedidos Saanye</h2>
        <div className={cn("rounded-2xl shadow-sm border p-3 flex flex-col lg:flex-row lg:items-center gap-4 transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <div className="flex-1 lg:max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className={cn("w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] focus:border-transparent outline-none transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-900")}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableEstados.map((estado) => {
              const checked = selectedEstados.includes(estado);
              return (
                <label
                  key={estado}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold cursor-pointer border transition-colors",
                    checked
                      ? (isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-blue-50 border-blue-200 text-blue-700")
                      : (isDarkMode ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-500")
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelectedEstados(prev => e.target.checked ? [...prev, estado] : prev.filter(s => s !== estado));
                    }}
                  />
                  <span>{estado}</span>
                </label>
              );
            })}
          </div>
          <div className={cn("flex items-center gap-2 text-xs font-bold", isDarkMode ? "text-slate-500" : "text-slate-500")}>
            <span>Mostrar</span>
            <select 
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={cn("border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#0078D4] transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-white border-slate-200 text-slate-700")}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={300}>300</option>
              <option value={500}>500</option>
              <option value={1500}>1500</option>
            </select>
            <span>registros</span>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Download size={16} />
            Exportar Excel
          </button>
          <div className={cn("text-xs font-bold uppercase tracking-widest", isDarkMode ? "text-slate-600" : "text-slate-400")}>
            {filteredPedidos.length} resultados
          </div>
        </div>
      </div>
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
    {visiblePedidos.map((p, i) => (
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
            {filteredPedidos.length === 0 && (
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
