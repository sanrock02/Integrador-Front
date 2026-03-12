import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Database 
} from 'lucide-react';
import { cn } from '../utils/cn';
import { BankAccount } from '../types';

interface DashboardViewProps {
  isDarkMode: boolean;
  bankAccounts: BankAccount[];
  onBankSelect: (bank: BankAccount) => void;
}

export const DashboardView = ({ isDarkMode, bankAccounts, onBankSelect }: DashboardViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>Resumen General</h2>
        <div className={cn("text-sm px-3 py-1 rounded-full shadow-sm border flex items-center gap-2 transition-colors", isDarkMode ? "text-slate-400 bg-slate-800 border-slate-700" : "text-slate-500 bg-white border-slate-100")}>
          <Clock size={14} />
          Última actualización: Hoy, 15:20
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Conciliado', value: '$124.5M', change: '+12%', icon: CheckCircle2, color: 'text-emerald-600', bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50' },
          { label: 'Pendientes ZH', value: '42', change: '-5%', icon: AlertCircle, color: 'text-amber-600', bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50' },
          { label: 'Transacciones Mes', value: '1,284', change: '+18%', icon: TrendingUp, color: 'text-blue-600', bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50' },
          { label: 'Bancos Activos', value: bankAccounts.length.toString(), change: '0%', icon: Building2, color: 'text-indigo-600', bg: isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50' },
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
                <p className={cn("text-xs font-medium mt-2", stat.change.startsWith('+') ? 'text-emerald-600' : stat.change === '0%' ? 'text-slate-400' : 'text-red-600')}>
                  {stat.change} vs mes anterior
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
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {bankAccounts.slice(0, 4).map((bank, i) => (
              <div key={i} className={cn("flex items-center justify-between p-3 rounded-lg transition-all border border-transparent cursor-pointer", isDarkMode ? "hover:bg-slate-700 hover:border-slate-600" : "hover:bg-slate-50 hover:border-slate-100")} onClick={() => onBankSelect(bank)}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600")}>
                    <Database size={20} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", isDarkMode ? "text-slate-300" : "text-slate-700")}>Conciliación {bank.name}</p>
                    <p className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-500")}>Hace {i + 1} horas • admin</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">Completado</p>
                  <p className={cn("text-xs", isDarkMode ? "text-slate-500" : "text-slate-400")}>{10 + i} transacciones</p>
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
              <p className={cn("text-xs mt-1", isDarkMode ? "text-amber-500/80" : "text-amber-700")}>Hay transacciones sin número de ZH en Banco Felipe.</p>
            </div>
            <div className={cn("p-3 border rounded-lg transition-colors", isDarkMode ? "bg-blue-900/20 border-blue-900/30" : "bg-blue-50 border-blue-100")}>
              <p className={cn("text-sm font-semibold", isDarkMode ? "text-blue-400" : "text-blue-800")}>Actualización Disponible</p>
              <p className={cn("text-xs mt-1", isDarkMode ? "text-blue-500/80" : "text-blue-700")}>Nueva versión del módulo de conciliación v2.4.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
