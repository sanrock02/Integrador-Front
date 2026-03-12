import React from 'react';
import { 
  Building2, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';
import { cn } from '../utils/cn';
import { ViewType } from '../types';
import { NAV_ITEMS, REPORT_ITEMS } from '../constants';

interface SidebarProps {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export const Sidebar = ({ 
  isDarkMode, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  currentView, 
  setCurrentView 
}: SidebarProps) => {
  return (
    <aside 
      className={cn(
        "border-r flex flex-col transition-all duration-300 z-20",
        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
        isSidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className={cn("p-4 border-b flex items-center justify-between", isDarkMode ? "border-slate-700" : "border-slate-100")}>
        <div className={cn("flex items-center gap-3 transition-opacity duration-300", !isSidebarOpen && "opacity-0 invisible w-0")}>
          <div className="bg-[#0078D4] p-1.5 rounded-lg">
            <Building2 className="text-white" size={20} />
          </div>
          <span className={cn("font-bold tracking-tight", isDarkMode ? "text-slate-100" : "text-slate-800")}>Grupo Ad</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500")}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-6">
          {['main', 'operaciones', 'admin'].map((category) => (
            <div key={category} className="space-y-1">
              {isSidebarOpen && (
                <p className={cn("px-3 text-[10px] font-bold uppercase tracking-widest mb-2", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                  {category === 'main' ? 'Principal' : category === 'operaciones' ? 'Operaciones' : 'Administración'}
                </p>
              )}
              {NAV_ITEMS.filter(item => item.category === category).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewType)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                    currentView === item.id 
                      ? "bg-[#0078D4] text-white shadow-md shadow-blue-100" 
                      : isDarkMode ? "text-slate-400 hover:bg-slate-700 hover:text-slate-200" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon size={20} className={cn(currentView === item.id ? "text-white" : isDarkMode ? "text-slate-500 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-600")} />
                  {isSidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        {isSidebarOpen && (
          <>
            {/* Reports Section */}
            <div className="space-y-2">
              <p className={cn("px-3 text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-slate-500" : "text-slate-400")}>Informes</p>
              <div className="space-y-1">
                {REPORT_ITEMS.map((item, i) => (
                  <button key={i} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group", isDarkMode ? "text-slate-500 hover:bg-slate-700 hover:text-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")}>
                    <item.icon size={18} className={cn("transition-colors", isDarkMode ? "text-slate-600 group-hover:text-blue-400" : "text-slate-400 group-hover:text-blue-500")} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      <div className={cn("p-4 border-t", isDarkMode ? "border-slate-700" : "border-slate-100")}>
        <button className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group", isDarkMode ? "text-red-400 hover:bg-red-900/10" : "text-red-500 hover:bg-red-50")}>
          <LogOut size={20} />
          {isSidebarOpen && <span className="text-sm font-bold">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
