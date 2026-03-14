import { BankTransaction, Consignment, BankAccount } from '../types';

const BASE_URL = 'http://192.168.1.66:3000';

const getCsrfToken = () => {
  const meta = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
  if (meta) return meta;
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
};

export const apiService = {
  async fetchTransactions(bank: BankAccount, year: string): Promise<BankTransaction[]> {
    // Mapeo de nombres de bancos a los slugs que espera tu backend
    const bankSlugs: Record<string, string> = {
      '101-126848-02': 'saanye',
      '603-801700-82': 'gloristy0082',
      '101-153111-37': 'gloristy1137',
      '603-801699-70': 'aristiduque',
      '010-561639-01': 'dibaby',
      '010-000034-12': 'adtienda3412',
      '001-000235-25': 'adtienda3525',
      '101-126122-24': 'nuevafama',
      '010-561646-81': 'muyalamoda',
      'felipe': 'felipe',
      'alonso': 'alonso',
      'adtienda8389': 'adtienda8389'
    };

    const slug = bankSlugs[bank.accountNumber] || bank.accountNumber.toLowerCase();
    
    // Usamos la ruta de tu views.py: list_bancos(request, year, almacen)
    const response = await fetch(`${BASE_URL}/app/list_bancos/${year}/${slug}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    const data = await response.json();
    return Array.isArray(data.Registros_banco) ? data.Registros_banco : [];
  },

  async fetchTransactionsReverso(bank: BankAccount, year: string): Promise<BankTransaction[]> {
    const bankSlugs: Record<string, string> = {
      '101-126848-02': 'saanye',
      '603-801700-82': 'gloristy',
      '101-153111-37': 'gloristy',
      '603-801699-70': 'aristiduque',
      '010-561639-01': 'dibaby',
      '010-000034-12': 'adtienda3412',
      '001-000235-25': 'adtienda3525',
      '101-126122-24': 'nuevafama',
      '010-561646-81': 'muyalamoda',
      'felipe': 'felipe',
      'alonso': 'alonso',
      'adtienda8389': 'adtienda8389'
    };

    const slug = bankSlugs[bank.accountNumber] || bank.accountNumber.toLowerCase();
    const response = await fetch(`${BASE_URL}/app/list_bancos_reverso/${year}/${slug}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch transactions reverso');
    const data = await response.json();
    const rows = Array.isArray(data.Registros_ZH) ? data.Registros_ZH : [];
    return rows.map((item: any, index: number) => ({
      id: Number(item.id) || index + 1,
      fecha: item.Fecha ?? item.fecha ?? '',
      documento: item.Documento ?? item.documento ?? '',
      sucursal: item.Sucursal ?? item.sucursal ?? '',
      descripcion: item.Tipo ?? item.descripcion ?? '',
      referencia: item.Referencia ?? item.referencia ?? '',
      valor: Number(item.Valor ?? item.valor ?? 0),
      desc_usuario: item.desc_usuario ?? '',
      Numero: item.Numero ?? item.numero ?? 0,
      Prefijo: item.Prefijo ?? item.prefijo ?? '',
      Nit: item.Nit ?? item.nit ?? 0,
      Nombre: item.Nombre ?? item.nombre ?? '',
      link_soporte: item.link_soporte ?? null,
      cuenta_Django: item.cuenta_Django ?? bank.accountNumber
    }));
  },

  
  async fetchConsignments(bank: BankAccount, year: string): Promise<Consignment[]> {
    const bankSlugs: Record<string, string> = {
      '101-126848-02': 'saanye',
      '603-801700-82': 'gloristy',
      '603-801699-70': 'aristiduque',
      '010-561639-01': 'dibaby',
      '010-000034-12': 'adtienda3412',
      '001-000235-25': 'adtienda3525',
      '101-126122-24': 'nuevafama',
      '010-561646-81': 'muyalamoda'
    };

    const slug = bankSlugs[bank.accountNumber] || 'saanye';
    
    // Usamos la ruta de tu views.py: list_proveedor(request, year, almacen)
    const response = await fetch(`${BASE_URL}/app/list_proveedor/${year}/${slug}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch consignments');
    const data = await response.json();
    return Array.isArray(data.proveedores) ? data.proveedores : [];
  },

  async saveConsignment(data: {
    almacen: string;
    fecha: string;
    nombre_cliente: string;
    Proveedor: string;
    valor_consignacion: number;
  }): Promise<boolean> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const response = await fetch(`${BASE_URL}/app/guardar_nuevo_proveedor/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error('Failed to save consignment');
    const result = await response.json();
    return result.success;
  },

  async deleteConsignment(id: number): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/app/eliminarPagoProveedor/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCsrfToken(),
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to delete consignment');
    const result = await response.json();
    return result.success;
  },

  async uploadProveedorFile(data: {
    file: File;
    id: number;
    prefijo: string;
    numero: string | number;
    nit: string | number;
    nombre: string | number;
    almacen: string;
  }): Promise<{ success: boolean; path?: string }> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('idint', data.id.toString());
    formData.append('prefijo', String(data.prefijo));
    formData.append('numero', String(data.numero));
    formData.append('nit', String(data.nit ?? ''));
    formData.append('nombre', String(data.nombre ?? ''));
    formData.append('almacen', data.almacen);

    const response = await fetch(`${BASE_URL}/app/upload_bank_document_proveedor/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error('Failed to upload proveedor file');
    const result = await response.json();
    return { success: true, path: result?.path };
  },

  async updateDescription(id: number, value: string, isProvider: boolean = false): Promise<boolean> {
    const url = isProvider ? `${BASE_URL}/app/update_desc_usuario_proveedor/` : `${BASE_URL}/app/update_desc_usuario/`;
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('field', 'desc_usuario');
    formData.append('value', value);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCsrfToken()
      }
    });

    if (!response.ok) throw new Error('Failed to update description');
    const result = await response.json();
    return result.status === 'success';
  },

  // New Methods for Full Migration
  async fetchVentas(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/app/list_ventas/`, { credentials: 'include' });
    return this.handleResponse(response, 'ventas');
  },

  async pasarFactura(vendedor: string, nit: string, prefijo: string, numero: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/app/pasar_facturas/${vendedor}/${nit}/${prefijo}/${numero}/`, { credentials: 'include' });
    return this.handleResponse(response, 'pasar factura');
  },

  async fetchDineroRecibido(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/app/list_dinRecibido/`, { credentials: 'include' });
    const data = await this.handleResponse(response, 'recibido');
    return data.recibido || [];
  },

  async fetchActivos(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/app/list_activo_tecnologico/`, { credentials: 'include' });
    const data = await this.handleResponse(response, 'activos');
    return data.activos_tecnologicos || [];
  },

  async fetchResoluciones(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/app/list_resoluciones/`, { credentials: 'include' });
    const data = await this.handleResponse(response, 'resoluciones');
    return data.resoluciones || [];
  },

  async fetchPacking(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/app/list_RegistroPacking/`, { credentials: 'include' });
    const data = await this.handleResponse(response, 'packing');
    return data.Registros_Packing || [];
  },

  async fetchPedidos(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/app/list_pedidos_saanye/`, { credentials: 'include' });
    const data = await this.handleResponse(response, 'pedidos');
    const raw = data.pedidos || data.Pedidos || data.Registros_Pedidos || data.registros || data.data || data.results || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: any, index: number) => ({
      id: Number(item.id ?? item.ID ?? index + 1),
      fecha: item.fecha ?? item.Fecha ?? '',
      bodega: item.bodega ?? item.Bodega ?? '',
      prefijo: item.prefijo ?? item.Prefijo ?? '',
      numero: String(item.numero ?? item.Numero ?? ''),
      cliente: item.cliente ?? item.Cliente ?? '',
      usuario_pedido: item.usuario_pedido ?? item.Usuario_Pedido ?? item.usuario ?? item.Usuario ?? '',
      picking: item.picking ?? item.Picking ?? '',
      venta: item.venta ?? item.Venta ?? '',
      empaque: item.empaque ?? item.Empaque ?? '',
      fecha_entrega: item.fecha_entrega ?? item.Fecha_Entrega ?? '',
      cumplimiento: item.cumplimiento ?? item.Cumplimiento ?? '',
      detalle_cumplimiento: item.detalle_cumplimiento ?? item.Detalle_Cumplimiento ?? '',
      estado: item.estado ?? item.Estado ?? '',
      enviado: Boolean(item.enviado ?? item.Enviado ?? false)
    }));
  },

  async updatePedidoSaanye(data: {
    id?: number;
    field: 'fecha_entrega' | 'detalle_cumplimiento' | 'enviado';
    value: string | boolean;
    prefijo: string;
    numero: string;
    fecha: string;
  }): Promise<{ success: boolean; id?: number }> {
    const formData = new FormData();
    if (data.id) formData.append('id', data.id.toString());
    formData.append('field', data.field);
    formData.append('value', data.value.toString());
    formData.append('prefijo', data.prefijo);
    formData.append('numero', data.numero);
    formData.append('fecha', data.fecha);

    const response = await fetch(`${BASE_URL}/app/update_pedidos_saanye_entrega_detalle/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error('Failed to update pedido');
    const result = await response.json();
    return { success: true, id: result?.id };
  },

  async fetchCruceFacturas(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/app/list_saanye_cruce_recibos/`, { credentials: 'include' });
    const data = await this.handleResponse(response, 'cruce');
    return data.cruce || [];
  },

  async handleResponse(response: Response, context: string) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error(`Error en ${context}. El servidor no devolvió JSON. Respuesta:`, text.slice(0, 500));
      throw new Error(`El servidor devolvió HTML en lugar de JSON en ${context}. Revisa la consola.`);
    }
  },

  async deleteDineroRecibido(id: number): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/app/eliminarRegistro/${id}/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': getCsrfToken() }
    });
    return response.ok;
  },

  async deleteActivo(serial_1: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/app/eliminar_activo_tecnologico/${serial_1}/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': getCsrfToken() }
    });
    return response.ok;
  }
};
