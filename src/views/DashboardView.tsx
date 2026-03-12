import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  TrendingUp,
  AlertCircle,
  Building2,
  Database,
  Wallet,
  BadgeDollarSign
} from 'lucide-react';
import { cn } from '../utils/cn';
import { BankAccount } from '../types';
import { formatCurrency } from '../utils/format';

interface DashboardViewProps {
  isDarkMode: boolean;
  bankAccounts: BankAccount[];
  onBankSelect: (bank: BankAccount) => void;
  selectedBank: BankAccount;
  dashboardSummary: any | null;
  isDashboardLoading: boolean;
  dashboardUpdatedAt: Date | null;
}

export const DashboardView = ({
  isDarkMode,
  bankAccounts,
  onBankSelect,
  selectedBank,
  dashboardSummary,
  isDashboardLoading,
  dashboardUpdatedAt
}: DashboardViewProps) => {
  const parseAmount = (value: any) => {
    if (typeof value === 'number') return value;
    if (value === null || value === undefined) return 0;
    const raw = String(value).trim();
    if (!raw) return 0;
    const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

    const safeSelectedBank = selectedBank || bankAccounts[0];

const summary = useMemo(() => {
    const data = dashboardSummary || {};
    const ventas = Array.isArray(data.ventas) ? data.ventas : [];
    const dinero = Array.isArray(data.dinero_recibido) ? data.dinero_recibido : [];
    const pedidos = Array.isArray(data.pedidos) ? data.pedidos : [];
    const bancos = Array.isArray(data.bancos) ? data.bancos : [];
    const proveedores = Array.isArray(data.proveedores) ? data.proveedores : [];

    const ventasTotal = ventas.reduce((acc: number, v: any) => acc + (Number(v.Neto) || 0), 0);
    const dineroTotal = dinero.reduce((acc: number, r: any) => acc + parseAmount(r.valor_recibido), 0);
    const pedidosPendientes = pedidos.length;

    const pendientesZH = bancos.reduce((acc: number, item: any) => {
      const val = item?.Numero ?? item?.numero ?? item?.numero_zh ?? item?.Numero_ZH;
      if (val === 0 || val === '0' || val === '' || val === null) return acc + 1;
      return acc;
    }, 0);

    const proveedoresPend = proveedores.reduce((acc: number, item: any) => {
      const val = item?.Proveedor ?? item?.proveedor ?? item?.Proveedor_ZH;
      if (val === 0 || val === '0' || val === '' || val === null) return acc + 1;
      return acc;
    }, 0);

    return {
      ventasTotal,
      ventasCount: ventas.length,
      dineroTotal,
      pedidosPendientes,
      pendientesZH,
      proveedoresPend,
      bancosCount: bancos.length
    };
  }, [dashboardSummary]);

  const updatedLabel = dashboardUpdatedAt
    ? dashboardUpdatedAt.toLocaleString()
    : 'Sin actualizar';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Resumen General</h2>
        <div className={cn("text-sm px-3 py-1 rounded-full shadow-sm border flex items-center gap-2 transition-colors", isDarkMode ? "text-slate-400 bg-slate-800 border-slate-700" : "text-slate-500 bg-white border-slate-100")}>
          <Clock size={14} />
          Ultima actualizacion: {isDashboardLoading ? 'Cargando...' : updatedLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ventas (14 dias)', value: formatCurrency(summary.ventasTotal), change: `${summary.ventasCount} facturas`, icon: TrendingUp, color: 'text-blue-600', bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50' },
          { label: 'Dinero Recibido', value: formatCurrency(summary.dineroTotal), change: 'Ult. 100 dias', icon: Wallet, color: 'text-emerald-600', bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50' },
          { label: 'Pendientes ZH', value: summary.pendientesZH.toString(), change: 'Bancos seleccionados', icon: AlertCircle, color: 'text-amber-600', bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50' },
          { label: 'Proveedores Pend.', value: summary.proveedoresPend.toString(), change: 'Cruces pendientes', icon: BadgeDollarSign, color: 'text-indigo-600', bg: isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("p-5 rounded-xl border shadow-sm hover:shadow-md transition-all", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-500" : "text-slate-500")}>{stat.label}</p>
                <h3 className={cn("text-2xl font-bold mt-1", isDarkMode ? "text-slate-100" : "text-slate-800")}>{stat.value}</h3>
                <p className={cn("text-xs font-medium mt-2", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  {stat.change}
                </p>
              </div>
              <div className={cn("p-3 rounded-lg", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn("lg:col-span-2 p-6 rounded-xl border shadow-sm transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <h3 className={cn("font-bold mb-4 flex items-center gap-2", isDarkMode ? "text-slate-100" : "text-slate-800")}>
            <TrendingUp size={18} className="text-blue-600" />
            Bancos Recientes
          </h3>
          <div className="space-y-4">
            {bankAccounts.slice(0, 4).map((bank, i) => (
              <div key={i} className={cn("flex items-center justify-between p-3 rounded-lg transition-all border border-transparent cursor-pointer", isDarkMode ? "hover:bg-slate-700 hover:border-slate-600" : "hover:bg-slate-50 hover:border-slate-100")} onClick={() => onBankSelect(bank)}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600")}>
                    <Database size={20} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", isDarkMode ? "text-slate-300" : "text-slate-700")}>Conciliacion {bank.name}</p>
                    <p className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>Seleccionar banco</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{safeSelectedBank && bank.id === safeSelectedBank.id ? 'Activo' : 'Ver'}</p>
                  <p className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-400")}>{bank.accountNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={cn("p-6 rounded-xl border shadow-sm transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
          <h3 className={cn("font-bold mb-4 flex items-center gap-2", isDarkMode ? "text-slate-100" : "text-slate-800")}>
            <AlertCircle size={18} className="text-amber-600" />
            Alertas de Sistema
          </h3>
          <div className="space-y-3">
            <div className={cn("p-3 border rounded-lg transition-colors", isDarkMode ? "bg-amber-900/20 border-amber-900/30" : "bg-amber-50 border-amber-100")}>
              <p className={cn("text-sm font-semibold", isDarkMode ? "text-amber-400" : "text-amber-800")}>ZH Pendiente</p>
              <p className={cn("text-xs mt-1", isDarkMode ? "text-amber-500/80" : "text-amber-700")}>
                {summary.pendientesZH} movimientos pendientes en {safeSelectedBank ? safeSelectedBank.name : 'Banco'}.
              </p>
            </div>
            <div className={cn("p-3 border rounded-lg transition-colors", isDarkMode ? "bg-blue-900/20 border-blue-900/30" : "bg-blue-50 border-blue-100")}>
              <p className={cn("text-sm font-semibold", isDarkMode ? "text-blue-400" : "text-blue-800")}>Pedidos Pendientes</p>
              <p className={cn("text-xs mt-1", isDarkMode ? "text-blue-500/80" : "text-blue-700")}>
                {summary.pedidosPendientes} pedidos sin entregar.
              </p>
            </div>
            <div className={cn("p-3 border rounded-lg transition-colors", isDarkMode ? "bg-emerald-900/20 border-emerald-900/30" : "bg-emerald-50 border-emerald-100")}>
              <p className={cn("text-sm font-semibold", isDarkMode ? "text-emerald-400" : "text-emerald-800")}>Dinero Recibido</p>
              <p className={cn("text-xs mt-1", isDarkMode ? "text-emerald-500/80" : "text-emerald-700")}>
                {formatCurrency(summary.dineroTotal)} en los ultimos 100 dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
