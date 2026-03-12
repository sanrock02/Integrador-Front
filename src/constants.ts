import { 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  Zap,
  LayoutDashboard,
  Grid,
  Database,
  TrendingUp,
  Settings,
  Building2,
  Wallet
} from 'lucide-react';

export const REPORT_ITEMS = [
  { label: 'Listado precios', icon: FileSpreadsheet },
  { label: 'Informes EU', icon: FileText },
  { label: 'Informes VE y DV', icon: BarChart3 },
  { label: 'Resoluciones', icon: Zap },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'main' },
  { id: 'access-panel', label: 'Panel de Accesos', icon: Grid, category: 'main' },
  { id: 'transactions', label: 'Bancos / Conciliación', icon: Database, category: 'main' },
  { id: 'ventas', label: 'Ventas Bodega', icon: TrendingUp, category: 'operaciones' },
  { id: 'dinero-recibido', label: 'Dinero Recibido', icon: Wallet, category: 'operaciones' },
  { id: 'activos', label: 'Inventario IT', icon: Settings, category: 'admin' },
  { id: 'resoluciones', label: 'Resoluciones', icon: FileText, category: 'admin' },
  { id: 'packing', label: 'Registro Packing', icon: Zap, category: 'operaciones' },
  { id: 'pedidos', label: 'Pedidos Saanye', icon: FileSpreadsheet, category: 'operaciones' },
  { id: 'cruce-facturas', label: 'Cruce Facturas', icon: BarChart3, category: 'operaciones' },
];
