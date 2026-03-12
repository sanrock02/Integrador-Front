# TransactionsView Component Documentation

## Overview
The `TransactionsView` component is a comprehensive React component that displays and manages bank transactions and consignments (provider shipments) with advanced filtering, export, and editing capabilities.

## Key Features

### 1. **Dual Tab System**
- **Transacciones Tab**: Displays bank transactions with detailed financial information
- **Proveedores Tab**: Shows consignment records from suppliers/providers

### 2. **Data Filtering**
- Column-level filtering for specific fields (fecha, descripcion, valor, etc.)
- Global search functionality across all records
- Real-time filter updates without page reload

### 3. **CSV Export Functionality**
- Exports filtered data to CSV format with proper encoding
- Includes semicolon delimiter support
- Escapes special characters and quotes in cell values
- Generates timestamped filenames for organization

### 4. **Dynamic Table Rendering**
- Responsive table layouts for both transaction and consignment data
- Animated row entries and exits using Framer Motion
- Sortable columns with visual indicators
- Dark mode support throughout the interface

### 5. **Consignment Management** (Proveedores Tab)
- Sticky form panel for creating new consignments
- Input fields for: date, client name, provider, and amount
- Save functionality with loading states
- Delete operations with confirmation

### 6. **Editable Cells**
- Inline editing for user descriptions (desc_usuario)
- Real-time state updates without modal dialogs
- Different styling for transactions vs. consignments

### 7. **Pagination & Display Options**
- Configurable page size (10, 25, 50, 100, 300, 500, 1500 records)
- Result counter showing total filtered records
- Lazy loading with spinner animation

### 8. **Theme Support**
- Full dark and light mode styling
- Consistent color scheme with Microsoft's Fluent Design
- Smooth transitions between theme states

## Component Props

| Prop | Type | Purpose |
|------|------|---------|
| `isDarkMode` | boolean | Controls theme styling |
| `selectedBank` | BankAccount | Current active bank account |
| `year` | string | Selected fiscal year |
| `activeTab` | TabType | Current tab (Transacciones/Proveedores) |
| `filteredData` | BankTransaction[] | Filtered transaction records |
| `filteredConsignments` | Consignment[] | Filtered consignment records |
| `handleColumnFilter` | function | Updates column-specific filters |
| `handleSaveConsignment` | function | Saves new consignment records |
| `handleDeleteConsignment` | function | Removes consignment records |

## Technical Highlights

- **Animation Library**: Uses Framer Motion for smooth transitions
- **Accessibility**: Proper semantic HTML and keyboard navigation
- **Performance**: Efficient re-renders with AnimatePresence
- **Data Handling**: Robust CSV generation with special character escaping
- **Responsive Design**: Mobile-first approach with Tailwind CSS