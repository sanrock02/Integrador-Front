export interface BankTransaction {
  id: number;
  fecha: string;
  documento: string;
  sucursal: string;
  descripcion: string;
  referencia: string;
  valor: number;
  desc_usuario: string | number;
  Numero: string | number;
  Prefijo: string;
  Nit: string | number;
  Nombre: string | number;
  link_soporte: string | null;
  cuenta_Django: string;
}

export interface Consignment {
  id: number;
  fecha: string;
  nombre_cliente: string;
  valor: number;
  desc_usuario: string | number;
  nombre_proveedor: string;
  Proveedor: string | number;
  Numero: string | number;
  Prefijo: string;
  Nit?: string | number;
  Nombre: string | number;
  link_soporte: string | null;
  almacen_Django: string;
}

export type TabType = 'Principal' | '101-126848-02' | 'Proveedores' | 'Revision ZH' | 'Referencias';

export type ViewType = 
  | 'dashboard' 
  | 'access-panel' 
  | 'transactions' 
  | 'ventas' 
  | 'dinero-recibido' 
  | 'activos' 
  | 'resoluciones' 
  | 'packing' 
  | 'pedidos' 
  | 'cruce-facturas';

export interface Venta {
  Prefijo: string;
  Numero: string;
  Fecha: string;
  Nit: string;
  Nombre: string;
  Vendedor: string;
  Neto: number;
  pasado: boolean;
  Usuario: string;
  puede_pasar?: boolean;
}

export interface DineroRecibido {
  id: number;
  almacen: string;
  usuario: string;
  fecha: string;
  prefijo: string;
  numero_fra: string;
  nombre_cliente: string;
  valor_recibido: string | number;
}

export interface ActivoTecnologico {
  serial_1: string;
  mac: string;
  tipo_pc: string;
  marca: string;
  fecha_ingreso: string;
  ubicacion: string;
  responsable: string;
  procesador: string;
  almacenamiento: string;
  ram: string;
  fecha_v_antivirus: string;
  usuario_remoto: string;
  fecha_ultima_revision: string;
  observacion: string;
  estado: string;
}

export interface Resolucion {
  Almacen: string;
  Prefijo: string;
  Numero_Inicial: number;
  Numero_Final: number;
  Ultimo_Numero: number;
  Fecha_Resolucion: string;
  Dias_Vencimiento: number;
}

export interface RegistroPacking {
  empresa: string;
  prefijo: string;
  numero: string;
  fecha_ZH: string;
  fecha_Django: string;
  hora_inicio_packing: string;
  hora_fin_packing: string;
  cajas: number;
  paquetes: number;
  tiempo_transcurrido: string;
  usuario: string;
}

export interface Pedido {
  id: number;
  fecha: string;
  bodega: string;
  prefijo: string;
  numero: string;
  cliente: string;
  usuario_pedido: string;
  picking: string;
  venta: string;
  empaque: string;
  fecha_entrega: string;
  cumplimiento: string;
  detalle_cumplimiento: string;
  estado: string;
  enviado: boolean;
}

export interface CruceRecibo {
  fecha: string;
  prefijo_Django: string;
  numero_fra: string;
  valor_recibido: number;
  coincidencia: boolean;
  Nombre: string;
  Pagoredondeado: number;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  name: string;
  hasZH: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  category: string;
}
