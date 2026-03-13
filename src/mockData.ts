import { BankTransaction, BankAccount, Consignment } from './types';

export const BANK_ACCOUNTS: BankAccount[] = [
  { id: '1', accountNumber: '101-126848-02', name: 'Banco Saanye', hasZH: true },
  { id: '2', accountNumber: '010-561639-01', name: 'Banco Dibaby', hasZH: true },
  { id: '3', accountNumber: '603-801700-82', name: 'Banco Gloristy 0082', hasZH: true },
  { id: '4', accountNumber: '603-801699-70', name: 'Banco Aristiduque', hasZH: true },
  { id: '5', accountNumber: '010-000034-12', name: 'Banco Adtienda 3412', hasZH: true },
  { id: '6', accountNumber: '001-000235-25', name: 'Banco Adtienda 3525', hasZH: true },
  { id: '7', accountNumber: '101-126122-24', name: 'Banco NuevaFama', hasZH: true },
  { id: '8', accountNumber: '010-561646-81', name: 'Banco Muyalamoda', hasZH: true },
  { id: '9', accountNumber: 'felipe', name: 'Banco Felipe', hasZH: false },
  { id: '10', accountNumber: 'alonso', name: 'Banco Alonso', hasZH: false },
  { id: '11', accountNumber: 'adtienda8389', name: 'Banco Adtienda 8389', hasZH: false },
];

export const MOCK_CONSIGNMENTS: Consignment[] = [
  {
    id: 1,
    fecha: '2026-02-24',
    nombre_cliente: 'CLIENTE DE PRUEBA',
    valor: 1000000,
    desc_usuario: 'PRUEBA',
    nombre_proveedor: 'PROVEEDOR PRUEBA',
    Proveedor: 'PROV ZH',
    Numero: '123',
    Prefijo: 'FE',
    Nombre: 'NOMBRE ZH',
    link_soporte: null,
    almacen_Django: 'saanye'
  }
];

export const MOCK_DATA: BankTransaction[] = [
  {
    id: 1,
    fecha: '2026-02-24',
    documento: '0',
    sucursal: 'PRUEBA',
    descripcion: 'TRANSACCION DE PRUEBA',
    referencia: 'REF',
    valor: 50000,
    desc_usuario: 'DESC',
    Numero: '0',
    Prefijo: 'FE',
    Nit: '0',
    Nombre: 'NOMBRE',
    link_soporte: null,
    cuenta_Django: '101-126848-02'
  }
];
