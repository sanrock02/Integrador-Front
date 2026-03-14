import React, { useMemo, useState } from 'react';
import { 
  Search, 
  Download, 
  ChevronDown, 
  FileText, 
  Loader2, 
  X, 
  Copy,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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
  bankAccounts: BankAccount[];
  selectedBank: BankAccount;
  onBankSelect: (bank: BankAccount) => void;
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
  handleConsignmentColumnFilter: (column: keyof Consignment, value: string) => void;
  setConsignments: React.Dispatch<React.SetStateAction<Consignment[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<BankTransaction[]>>;
  consignmentForm: { fecha: string; cliente: string; proveedor: string; valor: string };
  setConsignmentForm: React.Dispatch<React.SetStateAction<{ fecha: string; cliente: string; proveedor: string; valor: string }>>;
  handleSaveConsignment: (e: React.FormEvent) => void;
  isSavingConsignment: boolean;
}

export const TransactionsView = ({
  isDarkMode,
  bankAccounts,
  selectedBank,
  onBankSelect,
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
  handleConsignmentColumnFilter,
  setConsignments,
  setTransactions,
  consignmentForm,
  setConsignmentForm,
  handleSaveConsignment,
  isSavingConsignment
}: TransactionsViewProps) => {
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [fechaSort, setFechaSort] = useState<'asc' | 'desc' | null>(null);
  const [isUploading, setIsUploading] = useState<number | null>(null);

  const parseDateValue = (value?: string | null) => {
    if (!value) return Number.NaN;
    const direct = Date.parse(value);
    if (!Number.isNaN(direct)) return direct;
    const match = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (!match) return Number.NaN;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const yearRaw = match[3];
    const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw);
    const parsed = new Date(year, month - 1, day).getTime();
    return Number.isNaN(parsed) ? Number.NaN : parsed;
  };

  const toggleFechaSort = () => {
    setFechaSort(prev => (prev === 'desc' ? 'asc' : prev === 'asc' ? null : 'desc'));
  };

  const sortedConsignments = useMemo(() => {
    if (!fechaSort) return filteredConsignments;
    const dir = fechaSort === 'asc' ? 1 : -1;
    return [...filteredConsignments].sort((a, b) => {
      const aTime = parseDateValue(a.fecha);
      const bTime = parseDateValue(b.fecha);
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return (aTime - bTime) * dir;
    });
  }, [filteredConsignments, fechaSort]);

  const sortedData = useMemo(() => {
    if (!fechaSort) return filteredData;
    const dir = fechaSort === 'asc' ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      const aTime = parseDateValue(a.fecha);
      const bTime = parseDateValue(b.fecha);
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return (aTime - bTime) * dir;
    });
  }, [filteredData, fechaSort]);

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

  const handleUploadProveedorFile = async (item: Consignment, file: File) => {
    setIsUploading(item.id);
    try {
      const result = await apiService.uploadProveedorFile({
        file,
        id: item.id,
        prefijo: item.Prefijo ?? '',
        numero: item.Numero ?? '',
        nit: item.Nit ?? 0,
        nombre: item.Nombre ?? '',
        almacen: item.almacen_Django ?? ''
      });
      if (result.path) {
        setConsignments(prev => prev.map(c => c.id === item.id ? { ...c, link_soporte: result.path } : c));
      }
    } catch (error) {
      console.error('Error uploading proveedor file:', error);
      alert('Error al subir archivo.');
    } finally {
      setIsUploading(null);
    }
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
              value={selectedBank.id}
              onChange={(e) => {
                const next = bankAccounts.find(b => b.id === e.target.value);
                if (next) onBankSelect(next);
              }}
              className={cn("appearance-none border pl-4 pr-10 py-2 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#0078D4] focus:border-transparent outline-none cursor-pointer shadow-sm transition-all", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700")}
            >
              {bankAccounts.map(bank => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
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

      <div className="flex flex-col">
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

              {activeTab === 'Proveedores' && (
                <button
                  onClick={() => setIsConsignmentModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <FileText size={16} />
                  Nueva consignacion
                </button>
              )}
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
                      <th className="p-4 text-left border-r border-white/10">
                        <button
                          type="button"
                          onClick={toggleFechaSort}
                          className="inline-flex items-center gap-1 font-bold hover:text-blue-500 transition-colors"
                        >
                          Fecha
                          {fechaSort === 'asc' ? <ArrowUp size={12} /> : fechaSort === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} />}
                        </button>
                      </th>
                      <th className="p-4 text-left min-w-[200px] border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>Cliente</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleConsignmentColumnFilter('nombre_cliente', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>Valor</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleConsignmentColumnFilter('valor', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>Des.Usuario</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleConsignmentColumnFilter('desc_usuario', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>Proveedor</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleConsignmentColumnFilter('nombre_proveedor', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>ProveedorZH</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleConsignmentColumnFilter('Proveedor', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>#ZH</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleConsignmentColumnFilter('Numero', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-left min-w-[200px] border-r border-white/10">
                        <div className="flex flex-col gap-2">
                          <span>NombreZH</span>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleConsignmentColumnFilter('Nombre', e.target.value)} />
                        </div>
                      </th>
                      <th className="p-4 text-center">Opcion</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence mode="popLayout">
                      {sortedConsignments.map((item, index) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("border-b transition-colors", isDarkMode ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50")}
                        >
                          <td className="p-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                          <td className={cn("p-4 font-bold", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.fecha}</td>
                          <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.nombre_cliente}</td>
                          <td className={cn(
                            "p-4 font-mono font-bold text-right",
                            isDarkMode ? "text-emerald-400" : "text-slate-700"
                          )}>
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
                          <td className={cn("p-4 font-bold", isDarkMode ? "text-blue-300" : "text-blue-500")}>{item.nombre_proveedor}</td>
                          <td className={cn(
                            "p-4 font-bold",
                            item.Proveedor === 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : (isDarkMode ? "text-slate-200" : "text-slate-800")
                          )}>
                            {item.Proveedor === 0 ? 'XXXX' : item.Proveedor}
                          </td>
                          <td className={cn(
                            "p-4 font-bold",
                            item.Numero === 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : (isDarkMode ? "text-blue-300" : "text-blue-500")
                          )}>
                            {item.Numero === 0 ? 'XXXX' : `${item.Prefijo}-${item.Numero}`}
                          </td>
                          <td className={cn(
                            "p-4 font-bold",
                            item.Nombre === 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : (isDarkMode ? "text-slate-200" : "text-slate-800")
                          )}>
                            {item.Nombre === 0 ? 'XXXX' : item.Nombre}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {item.link_soporte ? (
                                <a 
                                  href={`/media/${item.link_soporte}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-2 bg-[#0078D4] text-white rounded-lg hover:bg-[#005a9e] transition-all shadow-sm inline-flex items-center justify-center hover:scale-110 active:scale-95"
                                >
                                  <FileText size={14} />
                                </a>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleDeleteConsignment(item.id)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm"
                                  >
                                    <X size={14} />
                                  </button>
                                  {item.Numero !== 0 && (
                                    <>
                                      <label className={cn("p-2 rounded-lg transition-all shadow-sm inline-flex items-center justify-center cursor-pointer", isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-blue-900/30 hover:text-blue-400" : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600")}>
                                        <Upload size={14} />
                                        <input
                                          type="file"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadProveedorFile(item, file);
                                            e.currentTarget.value = '';
                                          }}
                                        />
                                      </label>
                                      {isUploading === item.id && (
                                        <Loader2 size={14} className="animate-spin text-blue-500" />
                                      )}
                                    </>
                                  )}
                                </>
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
                          <button
                            type="button"
                            onClick={toggleFechaSort}
                            className="flex items-center gap-1 font-bold hover:text-blue-500 transition-colors text-left"
                          >
                            Fecha
                            {fechaSort === 'asc' ? <ArrowUp size={12} /> : fechaSort === 'desc' ? <ArrowDown size={12} /> : <ArrowUpDown size={12} />}
                          </button>
                          <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('fecha', e.target.value)} />
                        </div>
                      </th>
                      {activeTab === 'Revision ZH' ? (
                        <>
                          <th className="p-4 text-left min-w-[200px] border-r border-white/10">
                            <div className="flex flex-col gap-2">
                              <span>Tipo</span>
                              <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('descripcion', e.target.value)} />
                            </div>
                          </th>
                          <th className="p-4 text-left border-r border-white/10">
                            <div className="flex flex-col gap-2">
                              <span>#ZH</span>
                              <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('Numero', e.target.value)} />
                            </div>
                          </th>
                          <th className="p-4 text-left min-w-[150px] border-r border-white/10">
                            <div className="flex flex-col gap-2">
                              <span>Nit</span>
                              <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('Nit', e.target.value)} />
                            </div>
                          </th>
                          <th className="p-4 text-left min-w-[200px] border-r border-white/10">
                            <div className="flex flex-col gap-2">
                              <span>Cliente</span>
                              <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('Nombre', e.target.value)} />
                            </div>
                          </th>
                          <th className="p-4 text-left min-w-[150px] border-r border-white/10">
                            <div className="flex flex-col gap-2">
                              <span>Valor</span>
                              <input type="text" placeholder="Filtrar..." className="search-input" onChange={(e) => handleColumnFilter('valor', e.target.value)} />
                            </div>
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="p-4 text-left min-w-[300px] border-r border-white/10">
                            <div className="flex flex-col gap-2">
                              <span>Descripcion</span>
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
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence mode="popLayout">
                      {sortedData.slice(0, pageSize).map((item, index) => (
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
                          {activeTab === 'Revision ZH' ? (
                            <>
                              <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.descripcion}</td>
                              <td className={cn(
                                "p-4 font-bold",
                                item.Numero === 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : (isDarkMode ? "text-blue-300" : "text-blue-500")
                              )}>
                                {item.Numero === 0 ? 'XXXX' : `${item.Prefijo}-${item.Numero}`}
                              </td>
                              <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.Nit}</td>
                              <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.Nombre}</td>
                              <td className={cn(
                                "p-4 font-mono font-bold text-right",
                                item.valor < 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : "text-emerald-600"
                              )}>
                                {formatCurrency(item.valor)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className={cn("p-4 font-medium", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.descripcion}</td>
                              <td className={cn(
                                "p-4 font-mono font-bold text-right",
                                item.valor < 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : "text-emerald-600"
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
                                item.Numero === 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : (isDarkMode ? "text-blue-300" : "text-blue-500")
                              )}>
                                {item.Numero === 0 ? 'XXXX' : `${item.Prefijo}-${item.Numero}`}
                              </td>
                              <td className={cn(
                                "p-4 font-bold",
                                item.Nombre === 0 ? (isDarkMode ? "text-red-400" : "text-red-500") : (isDarkMode ? "text-slate-300" : "text-slate-700")
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
                            </>
                          )}
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
          {activeTab === 'Proveedores' && isConsignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsConsignmentModalOpen(false)}
          />
          <div className={cn("relative w-full max-w-lg mx-4 rounded-2xl shadow-xl border p-6", isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn("text-lg font-bold", isDarkMode ? "text-slate-100" : "text-slate-800")}>
                Nueva consignacion
              </h3>
              <button
                onClick={() => setIsConsignmentModalOpen(false)}
                className={cn("p-2 rounded-lg transition-all", isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100")}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                const hasMissing = !consignmentForm.fecha || !consignmentForm.cliente || !consignmentForm.proveedor || !consignmentForm.valor;
                handleSaveConsignment(e);
                if (!hasMissing) setIsConsignmentModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  Banco
                </label>
                <input 
                  type="text" 
                  value={selectedBank.name.toLowerCase().replace('banco ', '')} 
                  disabled 
                  className={cn("w-full px-4 py-2 border rounded-xl text-sm font-medium transition-colors", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400")}
                />
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  Fecha
                </label>
                <input 
                  type="date" 
                  value={consignmentForm.fecha}
                  onChange={(e) => setConsignmentForm(prev => ({ ...prev, fecha: e.target.value }))}
                  className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-900")}
                />
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  Cliente
                </label>
                <input 
                  type="text" 
                  placeholder="Nombre del Cliente"
                  value={consignmentForm.cliente}
                  onChange={(e) => setConsignmentForm(prev => ({ ...prev, cliente: e.target.value }))}
                  className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-900")}
                />
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  Proveedor
                </label>
                <input 
                  type="text" 
                  placeholder="Proveedor"
                  value={consignmentForm.proveedor}
                  onChange={(e) => setConsignmentForm(prev => ({ ...prev, proveedor: e.target.value }))}
                  className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-900")}
                />
              </div>
              <div>
                <label className={cn("block text-xs font-bold uppercase tracking-widest mb-1", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                  Valor
                </label>
                <input 
                  type="number" 
                  placeholder="Valor Consignacion"
                  value={consignmentForm.valor}
                  onChange={(e) => setConsignmentForm(prev => ({ ...prev, valor: e.target.value }))}
                  className={cn("w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-[#0078D4] outline-none transition-all", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-900")}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConsignmentModalOpen(false)}
                  className={cn("flex-1 py-3 rounded-xl font-bold transition-all border", isDarkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSavingConsignment}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingConsignment ? <Loader2 className="animate-spin" size={18} /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
</div>


  );
};
