// localStorage helpers for Smartfetch

export interface User {
  phone: string;
  role: 'customer' | 'shopkeeper';
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

export interface Shop {
  id: string;
  ownerPhone: string;
  ownerName: string;
  shopName: string;
  category: string;
  prepTime: number;
  upiId: string;
  gstNumber: string;
  openingTime: string;
  closingTime: string;
  location: string;
  offer: string;
  products: Product[];
}

export interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  customerPhone: string;
  customerName: string;
  items: OrderItem[];
  pickupTime: string;
  status: 'New' | 'Accepted' | 'Preparing' | 'Ready' | 'Rejected';
  createdAt: string;
}

// --- Users ---
export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem('smartfetch_users') || '[]');
}
export function saveUsers(users: User[]) {
  localStorage.setItem('smartfetch_users', JSON.stringify(users));
}
export function findUser(phone: string): User | undefined {
  return getUsers().find(u => u.phone === phone);
}
export function addUser(user: User) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

// --- Shops ---
export function getShops(): Shop[] {
  return JSON.parse(localStorage.getItem('smartfetch_shops') || '[]');
}
export function saveShops(shops: Shop[]) {
  localStorage.setItem('smartfetch_shops', JSON.stringify(shops));
}
export function getShopByOwner(phone: string): Shop | undefined {
  return getShops().find(s => s.ownerPhone === phone);
}
export function addShop(shop: Shop) {
  const shops = getShops();
  shops.push(shop);
  saveShops(shops);
}
export function updateShop(shop: Shop) {
  const shops = getShops().map(s => s.id === shop.id ? shop : s);
  saveShops(shops);
}
export function deleteShop(shopId: string) {
  saveShops(getShops().filter(s => s.id !== shopId));
  // also remove related orders
  saveOrders(getOrders().filter(o => o.shopId !== shopId));
}

// --- Orders ---
export function getOrders(): Order[] {
  return JSON.parse(localStorage.getItem('smartfetch_orders') || '[]');
}
export function saveOrders(orders: Order[]) {
  localStorage.setItem('smartfetch_orders', JSON.stringify(orders));
}
export function addOrder(order: Order) {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
}
export function updateOrderStatus(orderId: string, status: Order['status']) {
  const orders = getOrders().map(o => o.id === orderId ? { ...o, status } : o);
  saveOrders(orders);
}

// --- Session ---
export function login(phone: string) {
  localStorage.setItem('smartfetch_loggedIn', 'true');
  localStorage.setItem('smartfetch_currentPhone', phone);
}
export function logout() {
  localStorage.removeItem('smartfetch_loggedIn');
  localStorage.removeItem('smartfetch_currentPhone');
}
export function isLoggedIn(): boolean {
  return localStorage.getItem('smartfetch_loggedIn') === 'true';
}
export function getCurrentPhone(): string {
  return localStorage.getItem('smartfetch_currentPhone') || '';
}
export function getCurrentUser(): User | undefined {
  return findUser(getCurrentPhone());
}

// --- Helpers ---
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function isShopOpen(openingTime: string, closingTime: string): boolean {
  const now = new Date();
  const [oh, om] = openingTime.split(':').map(Number);
  const [ch, cm] = closingTime.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  return nowMins >= openMins && nowMins <= closeMins;
}
