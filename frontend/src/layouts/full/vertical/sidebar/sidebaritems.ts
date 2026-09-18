export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: string;
  children?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: string;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  isPro?: boolean;
}

import { uniqueId } from 'lodash';

const SidebarContent: MenuItem[] = [
  {
    heading: 'E-Commerce & Gestión',
    children: [
      {
        name: 'Dashboard General',
        icon: 'solar:widget-2-bold-duotone',
        id: uniqueId(),
        url: '/',
        isPro: false,
      },
      {
        name: 'Catálogo de Productos',
        icon: 'solar:box-minimalistic-bold-duotone',
        id: uniqueId(),
        url: '/catalog',
        isPro: false,
      },
      {
        name: 'Crear Nuevo Pedido',
        icon: 'solar:cart-large-4-bold-duotone',
        id: uniqueId(),
        url: '/orders/new',
        isPro: false,
      },
      {
        name: 'Gestión de Pedidos & Pagos',
        icon: 'solar:bag-check-bold-duotone',
        id: uniqueId(),
        url: '/orders',
        isPro: false,
      },
      {
        name: 'Auditoría de Pagos (SHA-256)',
        icon: 'solar:card-recive-bold-duotone',
        id: uniqueId(),
        url: '/payments',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Observabilidad & DevOps',
    children: [
      {
        name: 'Hub de Herramientas',
        icon: 'solar:graph-up-bold-duotone',
        id: uniqueId(),
        url: '/observability',
        isPro: false,
      },
    ],
  },
];

export default SidebarContent;
