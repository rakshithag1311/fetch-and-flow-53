import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser, getShopByOwner, addShop, updateShop, deleteShop,
  getOrders, updateOrderStatus, generateId, type Shop, type Product, type Order
} from '@/lib/storage';
import { logout } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge';

const ShopkeeperDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser()!;
  const [shop, setShop] = useState<Shop | undefined>(getShopByOwner(user.phone));
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'shop' | 'products' | 'orders'>('shop');

  // Refresh data
  const refresh = () => {
    setShop(getShopByOwner(user.phone));
    setOrders(getOrders().filter(o => {
      const s = getShopByOwner(user.phone);
      return s && o.shopId === s.id;
    }));
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold text-primary">Smartfetch</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      {/* Tabs */}
      {shop && (
        <nav className="bg-card border-b px-4">
          <div className="flex gap-1 max-w-lg mx-auto">
            {(['shop', 'products', 'orders'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {!shop ? (
          <CreateShopForm user={user} onCreated={refresh} />
        ) : tab === 'shop' ? (
          <ShopInfo shop={shop} onDeleted={() => { refresh(); setTab('shop'); }} />
        ) : tab === 'products' ? (
          <ProductManager shop={shop} onUpdated={refresh} />
        ) : (
          <OrderManager orders={orders} onUpdated={refresh} />
        )}
      </main>
    </div>
  );
};

// --- Create Shop Form ---
function CreateShopForm({ user, onCreated }: { user: { phone: string; name: string }; onCreated: () => void }) {
  const [form, setForm] = useState({
    shopName: '', category: '', prepTime: '15', upiId: '', gstNumber: '',
    openingTime: '09:00', closingTime: '21:00', location: '', offer: ''
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.shopName || !form.category || !form.upiId || !form.location) return;
    addShop({
      id: generateId(),
      ownerPhone: user.phone,
      ownerName: user.name,
      shopName: form.shopName,
      category: form.category,
      prepTime: Number(form.prepTime) || 15,
      upiId: form.upiId,
      gstNumber: form.gstNumber,
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      location: form.location,
      offer: form.offer,
      products: []
    });
    onCreated();
  };

  const fields: { key: string; label: string; placeholder: string; type?: string; required?: boolean }[] = [
    { key: 'shopName', label: 'Shop Name', placeholder: 'My Awesome Shop', required: true },
    { key: 'category', label: 'Category', placeholder: 'Food, Grocery, etc.', required: true },
    { key: 'prepTime', label: 'Prep Time (minutes)', placeholder: '15', type: 'number' },
    { key: 'upiId', label: 'UPI ID', placeholder: 'shop@upi', required: true },
    { key: 'gstNumber', label: 'GST Number (optional)', placeholder: 'GSTIN' },
    { key: 'openingTime', label: 'Opening Time', placeholder: '', type: 'time' },
    { key: 'closingTime', label: 'Closing Time', placeholder: '', type: 'time' },
    { key: 'location', label: 'Location', placeholder: 'Hyderabad, Kukatpally', required: true },
    { key: 'offer', label: 'Offer (optional)', placeholder: '10% off on all snacks' },
  ];

  return (
    <div className="bg-card rounded-xl border p-5 space-y-4 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">🏬 Create Your Shop</h2>
      {fields.map(f => (
        <div key={f.key}>
          <label className="text-sm font-medium text-foreground mb-1 block">
            {f.label} {f.required && <span className="text-destructive">*</span>}
          </label>
          <Input
            type={f.type || 'text'}
            placeholder={f.placeholder}
            value={(form as any)[f.key]}
            onChange={e => update(f.key, e.target.value)}
            className="h-11"
          />
        </div>
      ))}
      <Button onClick={handleCreate} className="w-full h-12 text-base font-semibold">Create Shop</Button>
    </div>
  );
}

// --- Shop Info ---
function ShopInfo({ shop, onDeleted }: { shop: Shop; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);

  const handleDelete = () => {
    deleteShop(shop.id);
    onDeleted();
  };

  return (
    <div className="bg-card rounded-xl border p-5 space-y-3 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">{shop.shopName}</h2>
      <div className="space-y-1.5 text-sm">
        <p><span className="text-muted-foreground">Category:</span> {shop.category}</p>
        <p><span className="text-muted-foreground">Location:</span> {shop.location}</p>
        <p><span className="text-muted-foreground">Hours:</span> {shop.openingTime} – {shop.closingTime}</p>
        <p><span className="text-muted-foreground">Prep Time:</span> ~{shop.prepTime} min</p>
        <p><span className="text-muted-foreground">UPI:</span> {shop.upiId}</p>
        {shop.gstNumber && <p><span className="text-muted-foreground">GST:</span> {shop.gstNumber}</p>}
        {shop.offer && (
          <div className="bg-accent rounded-lg p-2 mt-2">
            <p className="text-accent-foreground font-medium">🎉 {shop.offer}</p>
          </div>
        )}
      </div>
      <div className="pt-3 border-t">
        {!confirm ? (
          <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}>Delete Shop Permanently</Button>
        ) : (
          <div className="space-y-2">
            <p className="text-destructive text-sm font-medium">This will delete your shop, products, and all related orders. Are you sure?</p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete}>Yes, Delete</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Product Manager ---
function ProductManager({ shop, onUpdated }: { shop: Shop; onUpdated: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const addProduct = () => {
    if (!name || !price) return;
    const p: Product = { id: generateId(), name, price: Number(price), inStock: true };
    shop.products.push(p);
    updateShop(shop);
    setName(''); setPrice('');
    onUpdated();
  };

  const toggleStock = (pid: string) => {
    shop.products = shop.products.map(p => p.id === pid ? { ...p, inStock: !p.inStock } : p);
    updateShop(shop);
    onUpdated();
  };

  const deleteProduct = (pid: string) => {
    shop.products = shop.products.filter(p => p.id !== pid);
    updateShop(shop);
    onUpdated();
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
  };

  const saveEdit = (pid: string) => {
    shop.products = shop.products.map(p => p.id === pid ? { ...p, name: editName, price: Number(editPrice) } : p);
    updateShop(shop);
    setEditingId(null);
    onUpdated();
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border p-4 space-y-3 shadow-sm">
        <h3 className="font-bold text-foreground">Add Product</h3>
        <div className="flex gap-2">
          <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="h-10" />
          <Input placeholder="₹ Price" type="number" value={price} onChange={e => setPrice(e.target.value)} className="h-10 w-24" />
        </div>
        <Button onClick={addProduct} className="w-full h-10 font-semibold">Add Product</Button>
      </div>

      {shop.products.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No products yet. Add your first product above!</p>
      ) : (
        shop.products.map(p => (
          <div key={p.id} className="bg-card rounded-xl border p-4 shadow-sm">
            {editingId === p.id ? (
              <div className="space-y-2">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10" />
                <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="h-10" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(p.id)}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-sm text-muted-foreground">₹{p.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.inStock ? 'In Stock' : 'Out of Stock'} />
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleStock(p.id)}>
                    {p.inStock ? 'Mark OOS' : 'Restock'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteProduct(p.id)}>✕</Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// --- Order Manager ---
function OrderManager({ orders, onUpdated }: { orders: Order[]; onUpdated: () => void }) {
  const nextStatus: Record<string, Order['status'] | null> = {
    New: 'Accepted', Accepted: 'Preparing', Preparing: 'Ready', Ready: null, Rejected: null,
  };

  const advance = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    onUpdated();
  };

  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map(o => (
        <div key={o.id} className="bg-card rounded-xl border p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground text-sm">#{o.id.slice(0, 6).toUpperCase()}</p>
            <StatusBadge status={o.status} />
          </div>
          <p className="text-sm"><span className="text-muted-foreground">Customer:</span> {o.customerName} ({o.customerPhone})</p>
          <div className="text-sm">
            {o.items.map((item, i) => (
              <p key={i}>{item.name} × {item.qty} — ₹{item.price * item.qty}</p>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Pickup: {o.pickupTime}</p>
          <div className="flex gap-2 pt-1">
            {o.status === 'New' && (
              <>
                <Button size="sm" onClick={() => advance(o.id, 'Accepted')}>Accept</Button>
                <Button size="sm" variant="destructive" onClick={() => advance(o.id, 'Rejected')}>Reject</Button>
              </>
            )}
            {nextStatus[o.status] && o.status !== 'New' && (
              <Button size="sm" onClick={() => advance(o.id, nextStatus[o.status]!)}>
                Mark as {nextStatus[o.status]}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShopkeeperDashboard;
