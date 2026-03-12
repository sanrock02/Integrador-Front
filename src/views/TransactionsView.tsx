import React from 'react';
import { 
  Search, 
  Download, 
  ChevronDown, 
  FileText, 
  Loader2, 
  X, 
  Copy, 
  ArrowUpDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { formatCurrency } from '../utils/format';
import { 
  BankTransaction, 
  BankAccount, 
  TabType, 
  Consignment 
} from '../types';
import { EditableCell } from '../components/EditableCell';

interface TransactionsViewProps {
  isDarkMode: boolean;
  selectedBank: BankAccount;
  year: string;
  setYear: (year: string) => void;
  years: string[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabs: TabType[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  filteredConsignments: Consignment[];
  filteredData: BankTransaction[];
  pageSize: number;
  setPageSize: (size: number) => void;
  handleDeleteConsignment: (id: number) => void;
  handleColumnFilter: (column: keyof BankTransaction, value: string) => void;
  setConsignments: React.Dispatch<React.SetStateAction<Consignment[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<BankTransaction[]>>;
  consignmentForm: { fecha: string; cliente: string; proveedor: string; valor: string };
  setConsignmentForm: React.Dispatch<React.SetStateAction<{ fecha: string; cliente: string; proveedor: string; valor: string }>>;
  handleSaveConsignment: (e: React.FormEvent) => void;
  isSavingConsignment: boolean;
}

export const TransactionsView = ({
  isDarkMode,
  selectedBank,
  year,
  setYear,
  years,
  activeTab,
  setActiveTab,
  tabs,
  searchTerm,
  setSearchTerm,
  isLoading,
  filteredConsignments,
  filteredData,
  pageSize,
  setPageSize,
  handleDeleteConsignment,
  handleColumnFilter,
  setConsignments,
  setTransactions,
  consignmentForm,
  setConsignmentForm,
  handleSaveConsignment,
  isSavingConsignment
}: TransactionsViewProps) => {
  const buildCsv = (headers: string[], rows: string[][], delimiter = ';') => {
    const escapeCell = (value: string) => {
      const needsQuotes = value.includes('"') || value.includes('\n') || value.includes('\r') || value.includes(delimiter);
      if (!needsQuotes) return value;
      return `"${value.replace(/"/g, '""')}"`;
    };

    const lines = [
      `sep=${delimiter}`,
      headers.map(escapeCell).join(delimiter),
      ...rows.map(row => row.map(cell => escapeCell(cell ?? '')).join(delimiter))
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
    const safeBank = selectedBank.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const dateStamp = new Date().toISOString().slice(0, 10);

    if (activeTab === 'Proveedores') {
      const headers = [
        'Fecha',
        'Cliente',
        'Valor',
        'Desc.Usuario',
        'Proveedor',
        'ProveedorZH',
        '#ZH',
        'NombreZH'
      ];
      const rows = filteredConsignments.map((item) => ([
        item.fecha ?? '',
        item.nombre_cliente ?? '',
        String(item.valor ?? ''),
        String(item.desc_usuario ?? ''),
        item.nombre_proveedor ?? '',
        String(item.Proveedor ?? ''),
        item.Numero === 0 ? '' : `${item.Prefijo ?? ''}-${item.Numero ?? ''}`,
        String(item.Nombre ?? '')
      ]));

      const csv = buildCsv(headers, rows);
      downloadCsv(`consignaciones-${safeBank}-${dateStamp}.csv`, csv);
      return;
    }

    const headers = [
      'Fecha',
      'Descripcion',
      'Valor',
      'Desc.Usuario',
      '#ZH',
      'NombreZH',
      'Link Soporte'
    ];
    const rows = filteredData.slice(0, pageSize).map((item) => ([
      item.fecha ?? '',
      item.descripcion ?? '',
      String(item.valor ?? ''),
      String(item.desc_usuario ?? ''),
      item.Numero === 0 ? '' : `${item.Prefijo ?? ''}-${item.Numero ?? ''}`,
      String(item.Nombre ?? ''),
      item.link_soporte ?? ''
    ]));

    const csv = buildCsv(headers, rows);
    downloadCsv(`transacciones-${safeBank}-${dateStamp}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>{selectedBank.name}</h2>
          <p className={cn("text-sm font-mono", isDarkMode ? "text-slate-500" : "text-slate-500")}>Cuenta: {selectedBank.accountNumber}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={cn("appearance-none border pl-4 pr-10 py-2 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#0078D4] focus:border-transparent outline-none cursor-pointer shadow-sm transition-all", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700")}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Download size={16} />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {activeTab === 'Proveedores' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className={cn("rounded-2xl shadow-sm border p-6 sticky top-24 transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
              <h3 className="text-lg font-bold text-[#0078D4] mb-6 flex items-center gap-2">
                <FileText size={20} />
                Formulario Consignaciones
              </h3>
              <form onSubmit={handleSaveConsignment} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    value={selectedBank.name.toLowerCase().replace('banco ', '')} 
                    disabled 
                    className={cn("w-full px-4 py-2 border rounded-xl text-sm font-medium transition-colors", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400")}
                  />
                </div>
                <div>
                  <input 
                    type="date" 
                    value={consignmentForm.fecha}
                    onChange={(e) => setConsignmentForm(prev => ({ ...prev, fecha: e.target.value }))}
                    className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-900")}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Nombre del Cliente"
                    value={consignmentForm.cliente}
                    onChange={(e) => setConsignmentForm(prev => ({ ...prev, cliente: e.target.value }))}
                    className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-900")}
                  />
                </div>
                <div>
                  <input 
                    type="text" 
                    placeholder="Proveedor"
                    value={consignmentForm.proveedor}
                    onChange={(e) => setConsignmentForm(prev => ({ ...prev, proveedor: e.target.value }))}
                    className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-900")}
                  />
                </div>
                <div>
                  <input 
                    type="number" 
                    placeholder="Valor Consignación"
                    value={consignmentForm.valor}
                    onChange={(e) => setConsignmentForm(prev => ({ ...prev, valor: e.target.value }))}
                    className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-900")}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSavingConsignment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingConsignment ? <Loader2 className="animate-spin" size={18} /> : 'Guardar'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        <div className="flex-1 min-w-0">
          <div className={cn("rounded-2xl shadow-sm border overflow-hidden transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
            <div className={cn("flex flex-col md:flex-row md:items-center justify-between p-4 border-b gap-4 transition-colors", isDarkMode ? "border-slate-700" : "border-slate-100")}>
              <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                      activeTab === tab 
                        ? "bg-[#0078D4] text-white shadow-md shadow-blue-100" 
                        : isDarkMode ? "text-slate-400 hover:bg-slate-700 hover:text-slate-200" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] focus:border-transparent outline-none transition-all", isDarkMode ? "bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-500" : "bg-slate-50 border-slate-200 text-slate-900")}
                />
              </div>
            </div>

            <div className="overflow-x-auto relative min-h-[400px]">
              {isLoading && activeTab !== 'Proveedores' && (
                <div className={cn("absolute inset-0 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3 transition-colors", isDarkMode ? "bg-slate-900/60" : "bg-white/60")}>
                  <Loader2 className="text-[#0078D4] animate-spin" size={40} />
                  <p className={cn("text-sm font-bold", isDarkMode ? "text-slate-400" : "text-slate-600")}>Cargando transacciones...</p>
                </div>
              )}
              
              {activeTab === 'Proveedores' ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="data-table-header">
                      <th className="p-4 text-left w-12 border-r border-white/10">#</th>
                      <th className="p-4 text-left border-r border-white/10">Fecha</th>
                      <th className="p-4 text-left min-w-[200px] border-r border-white/10">Cliente</th>
                      <th className="p-4 text-left border-r border-white/10">Valor</th>
                      <th className="p-4 text-left border-r border-white/10">Des.Usuario</th>
                      <th className="p-4 text-left border-r border-white/10">Proveedor</th>
                      <th className="p-4 text-left border-r border-white/10">ProveedorZH</th>
                      <th className="p-4 text-left border-r border-white/10">#ZH</th>
                      <th className="p-4 text-left min-w-[200px] border-r border-white/10">NombreZH</th>
                      <th className="p-4 text-center">Opcion</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence mode="popLayout">
                      {filteredConsignments.map((item, index) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}
                        >
                          <td className="p-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                          <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.fecha}</td>
                          <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.nombre_cliente}</td>
                          <td className={cn("p-4 font-mono font-bold text-right", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                            {formatCurrency(item.valor)}
                          </td>
                          <td className="p-4 text-slate-500">
                            <EditableCell 
                              id={item.id} 
                              initialValue={item.desc_usuario} 
                              isProvider={true}
                              isDarkMode={isDarkMode}
                              onSave={(val) => {
                                setConsignments(prev => prev.map(c => c.id === item.id ? { ...c, desc_usuario: val } : c));
                              }}
                            />
                          </td>
                          <td className="p-4 font-bold text-blue-600">{item.nombre_proveedor}</td>
                          <td className="p-4 font-bold text-red-500">
                            {item.Proveedor === 0 ? 'XXXX' : item.Proveedor}
                          </td>
                          <td className="p-4 font-bold text-red-500">
                            {item.Numero === 0 ? 'XXXX' : `${item.Prefijo}-${item.Numero}`}
                          </td>
                          <td className="p-4 font-bold text-red-500">
                            {item.Nombre === 0 ? 'XXXX' : item.Nombre}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleDeleteConsignment(item.id)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm"
                              >
                                <X size={14} />
                              </button>
                              {item.Numero !== 0 && (
                                <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm">
                                  <Copy size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="data-table-header">
                      <th className="p-4 text-left w-12 border-r border-white/10">#</th>
                      <th className="p-4 text-left min-w-[120px] border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span className="flex items-center gap-1">Fecha <ArrowUpDown size={12} /></span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('fecha', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left min-w-[300px] border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>Descripción</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('descripcion', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left min-w-[150px] border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>Valor</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('valor', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>Des.Usuario</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('desc_usuario', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>#ZH</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('Numero', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left min-w-[200px] border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>NombreZH</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('Nombre', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-center">Opcione</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence mode="popLayout">
                      {filteredData.slice(0, pageSize).map((item, index) => (
                        <motion.tr 
                          key={`${selectedBank.id}-${item.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className={cn("border-b transition-colors group", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}
                        >
                          <td className="p-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                          <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.fecha}</td>
                          <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.descripcion}</td>
                          <td className={cn(
                            "p-4 font-mono font-bold text-right",
                            item.valor < 0 ? (isDarkMode ? "text-red-400" :"text-red-500") : "text-emerald-600"
                          )}>
                            {formatCurrency(item.valor)}
                          </td>
                          <td className="p-4 text-slate-500">
                            <EditableCell 
                              id={item.id} 
                              initialValue={item.desc_usuario} 
                              isDarkMode={isDarkMode}
                              onSave={(val) => {
                                setTransactions(prev => prev.map(t => t.id === item.id ? { ...t, desc_usuario: val } : t));
                              }}
                            />
                          </td>
                          <td className={cn(
                            "p-4 font-bold",
                            item.Numero === 0 ? (isDarkMode ? "text-red-400" :"text-red-500") : (isDarkMode ? "text-blue-300" :"text-blue-500")
                          )}>
                            {item.Numero === 0 ? 'XXXX' : `${item.Prefijo}-${item.Numero}`}
                          </td>
                          <td className={cn(
                            "p-4 font-bold",
                            item.Nombre === 0 ? (isDarkMode ? "text-red-400" :"text-red-500") : (isDarkMode ? "text-slate-300" : "text-slate-700")
                          )}>
                            {item.Nombre === 0 ? 'XXXX' : item.Nombre}
                          </td>
                          <td className="p-4 text-center">
                            {item.link_soporte ? (
                              <a 
                                href={`/media/${item.link_soporte}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 bg-[#0078D4] text-white rounded-lg hover:bg-[#005a9e] transition-all shadow-sm inline-flex items-center justify-center hover:scale-110 active:scale-95"
                              >
                                <FileText size={16} />
                              </a>
                            ) : item.Numero !== 0 ? (
                              <button className={cn("p-2 rounded-lg transition-all shadow-sm inline-flex items-center justify-center", isDarkMode ? "bg-slate-700 text-slate-500 hover:bg-blue-900/30 hover:text-blue-400" : "bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600")}>
                                <Download size={16} />
                              </button>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
              
              {!isLoading && (activeTab === 'Proveedores' ? filteredConsignments.length === 0 : filteredData.length === 0) && (
                <div className="p-20 text-center space-y-4">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-colors", isDarkMode ? "bg-slate-700" : "bg-slate-50")}>
                    <Search size={32} className={isDarkMode ? "text-slate-600" : "text-slate-300"} />
                  </div>
                  <p className={cn("font-medium", isDarkMode ? "text-slate-500" : "text-slate-500")}>No se encontraron registros.</p>
                </div>
              )}
            </div>
            
            <div className={cn("p-4 border-t flex items-center justify-between transition-colors", isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
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
              
              <div className={cn("text-xs font-bold uppercase tracking-widest", isDarkMode ? "text-slate-600" : "text-slate-400")}>
                {(activeTab === 'Proveedores' ? filteredConsignments.length : filteredData.length)} resultados encontrados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
