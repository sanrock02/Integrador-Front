/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BANK_ACCOUNTS } from './mockData';
import { BankTransaction, TabType, ViewType, BankAccount, Consignment } from './types';
import { apiService } from './services/api';
import { cn } from './utils/cn';
import { formatCurrency } from './utils/format';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { AccessPanelView } from './views/AccessPanelView';
import { TransactionsView } from './views/TransactionsView';
import { VentasView } from './views/VentasView';
import { DineroRecibidoView } from './views/DineroRecibidoView';
import { ActivosView } from './views/ActivosView';
import { ResolucionesView } from './views/ResolucionesView';
import { PackingView } from './views/PackingView';
import { PedidosView } from './views/PedidosView';
import { CruceFacturasView } from './views/CruceFacturasView';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('101-126848-02');
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof BankTransaction, string>>>({});
  const [pageSize, setPageSize] = useState(10);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  // Dynamic Bank Selection
  const [selectedBank, setSelectedBank] = useState<BankAccount>(BANK_ACCOUNTS[0]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Consignments State
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [consignmentForm, setConsignmentForm] = useState({
    fecha: '',
    cliente: '',
    proveedor: '',
    valor: ''
  });
  const [isSavingConsignment, setIsSavingConsignment] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = activeTab === 'Revision ZH'
        ? await apiService.fetchTransactionsReverso(selectedBank, year)
        : await apiService.fetchTransactions(selectedBank, year);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsignments = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchConsignments(selectedBank, year);
      setConsignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading consignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'transactions') {
      if (activeTab === 'Proveedores') {
        loadConsignments();
      } else {
        loadTransactions();
      }
    }
  }, [selectedBank, year, currentView, activeTab]);

  const tabs: TabType[] = ['Principal', 'Proveedores', 'Revision ZH', 'Referencias'];

  const handleSaveConsignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consignmentForm.fecha || !consignmentForm.cliente || !consignmentForm.proveedor || !consignmentForm.valor) {
      alert("Por favor complete todos los campos");
      return;
    }

    setIsSavingConsignment(true);
    try {
      const slug = selectedBank.accountNumber === '101-126848-02' ? 'saanye' : 
                   selectedBank.accountNumber === '603-801700-82' ? 'gloristy' :
                   selectedBank.accountNumber === '603-801699-70' ? 'aristiduque' :
                   selectedBank.accountNumber === '010-561639-01' ? 'dibaby' :
                   selectedBank.accountNumber === '010-000034-12' ? 'adtienda3412' :
                   selectedBank.accountNumber === '001-000235-25' ? 'adtienda3525' :
                   selectedBank.accountNumber === '101-126122-24' ? 'nuevafama' :
                   selectedBank.accountNumber === '010-561646-81' ? 'muyalamoda' : 'saanye';


      const success = await apiService.saveConsignment({
        almacen: slug,
        fecha: consignmentForm.fecha,
        nombre_cliente: consignmentForm.cliente,
        Proveedor: consignmentForm.proveedor,
        valor_consignacion: Number(consignmentForm.valor)
      });
      
      if (success) {
        loadConsignments();
        setConsignmentForm({ fecha: '', cliente: '', proveedor: '', valor: '' });
      }
    } catch (error) {
      console.error("Error saving consignment:", error);
      alert("Error al guardar la consignación");
    } finally {
      setIsSavingConsignment(false);
    }
  };

  const handleDeleteConsignment = async (id: number) => {
    if (!confirm('¿Seguro de eliminar el registro?')) return;
    
    try {
      const success = await apiService.deleteConsignment(id);
      if (success) {
        setConsignments(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Error deleting consignment:", error);
      alert("Error al eliminar el registro");
    }
  };

  const filteredData = useMemo(() => {
    return (transactions || []).filter(item => {
      const globalMatch = Object.values(item).some(val => 
        String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const columnMatch = Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key as keyof BankTransaction];
        return String(itemValue ?? '').toLowerCase().includes(String(value).toLowerCase());
      });

      return globalMatch && columnMatch;
    });
  }, [transactions, searchTerm, columnFilters]);

  const filteredConsignments = useMemo(() => {
    return (consignments || []).filter(item => {
      return Object.values(item).some(val => 
        String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [consignments, searchTerm]);

  const handleColumnFilter = (key: keyof BankTransaction, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };



  const handleBankSelect = (bank: BankAccount) => {
    setSelectedBank(bank);
    setCurrentView('transactions');
  };



  const [ventas, setVentas] = useState<any[]>([]);
  const [dineroRecibido, setDineroRecibido] = useState<any[]>([]);
  const [activos, setActivos] = useState<any[]>([]);
  const [resoluciones, setResoluciones] = useState<any[]>([]);
  const [packing, setPacking] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cruceFacturas, setCruceFacturas] = useState<any[]>([]);

  useEffect(() => {
    const loadModuleData = async () => {
      setIsLoading(true);
      try {
        switch (currentView) {
          case 'ventas':
            setVentas(await apiService.fetchVentas());
            break;
          case 'dinero-recibido':
            setDineroRecibido(await apiService.fetchDineroRecibido());
            break;
          case 'activos':
            setActivos(await apiService.fetchActivos());
            break;
          case 'resoluciones':
            setResoluciones(await apiService.fetchResoluciones());
            break;
          case 'packing':
            setPacking(await apiService.fetchPacking());
            break;
          case 'pedidos':
            setPedidos(await apiService.fetchPedidos());
            break;
          case 'cruce-facturas':
            setCruceFacturas(await apiService.fetchCruceFacturas());
            break;
        }
      } catch (error) {
        console.error(`Error loading ${currentView}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModuleData();
  }, [currentView]);













  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const yearsList = [];
    for (let y = currentYear; y >= startYear; y--) {
      yearsList.push(y.toString());
    }
    return yearsList;
  }, []);



  return (
    <div className={cn("min-h-screen flex transition-colors duration-300", isDarkMode ? "dark bg-slate-900" : "bg-[#F8FAFC]")}>
      <Sidebar 
        isDarkMode={isDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentView={currentView}
          selectedBank={selectedBank}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (currentView === 'transactions' ? selectedBank.id : '')}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && (
                <DashboardView 
                  isDarkMode={isDarkMode}
                  bankAccounts={BANK_ACCOUNTS}
                  onBankSelect={handleBankSelect} selectedBank={undefined} dashboardSummary={undefined} isDashboardLoading={false} dashboardUpdatedAt={undefined}                />
              )}
              {currentView === 'access-panel' && (
                <AccessPanelView 
                  isDarkMode={isDarkMode}
                  bankAccounts={BANK_ACCOUNTS}
                  onBankSelect={handleBankSelect}
                  onViewChange={setCurrentView}
                />
              )}
              {currentView === 'transactions' && (
                <TransactionsView 
                  isDarkMode={isDarkMode}
                  bankAccounts={BANK_ACCOUNTS}
                  selectedBank={selectedBank}
                  onBankSelect={handleBankSelect}
                  year={year}
                  setYear={setYear}
                  years={years}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  tabs={tabs}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isLoading={isLoading}
                  filteredConsignments={filteredConsignments}
                  filteredData={filteredData}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  handleDeleteConsignment={handleDeleteConsignment}
                  handleColumnFilter={handleColumnFilter}
                  setConsignments={setConsignments}
                  setTransactions={setTransactions}
                  consignmentForm={consignmentForm}
                  setConsignmentForm={setConsignmentForm}
                  handleSaveConsignment={handleSaveConsignment}
                  isSavingConsignment={isSavingConsignment}
                />
              )}
              {currentView === 'ventas' && (
                <VentasView 
                  isDarkMode={isDarkMode}
                  ventas={ventas}
                  setVentas={setVentas}
                />
              )}
              {currentView === 'dinero-recibido' && (
                <DineroRecibidoView 
                  isDarkMode={isDarkMode}
                  dineroRecibido={dineroRecibido}
                  setDineroRecibido={setDineroRecibido}
                />
              )}
              {currentView === 'activos' && (
                <ActivosView 
                  isDarkMode={isDarkMode}
                  activos={activos}
                />
              )}
              {currentView === 'resoluciones' && (
                <ResolucionesView 
                  isDarkMode={isDarkMode}
                  resoluciones={resoluciones}
                />
              )}
              {currentView === 'packing' && (
                <PackingView 
                  isDarkMode={isDarkMode}
                  packing={packing}
                />
              )}
              {currentView === 'pedidos' && (
                <PedidosView 
                  isDarkMode={isDarkMode}
                  pedidos={pedidos}
                />
              )}
              {currentView === 'cruce-facturas' && (
                <CruceFacturasView 
                  isDarkMode={isDarkMode}
                  cruceFacturas={cruceFacturas}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className={cn("border-t px-8 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest transition-colors", isDarkMode ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-white border-slate-200 text-slate-400")}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Version 2.3</span>
            </div>
            <span>ID Sesión: 8291-X</span>
          </div>
          <div className="flex items-center gap-6">
            <span>© 2026 all rights reserved</span>
            <span>Powered by Santiago Echavarría</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
