import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getShops, getOrders, logout, isShopOpen, type Shop, type Order } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser()!;
  const [shops, setShops] = useState<Shop[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'shops' | 'orders'>('shops');

  const refresh = () => {
    setShops(getShops());
    setMyOrders(getOrders().filter(o => o.customerPhone === user.phone));
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
      <header className="bg-card border-b sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-lg font-bold text-primary">Smartfetch</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <nav className="bg-card border-b px-4">
        <div className="flex gap-1 max-w-lg mx-auto">
          {(['shops', 'orders'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            >
              {t === 'orders' ? `My Orders (${myOrders.length})` : 'Browse Shops'}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-lg mx-auto p-4 space-y-3">
        {tab === 'shops' ? (
          shops.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No shops available yet.</p>
          ) : (
            shops.map(shop => {
              const open = isShopOpen(shop.openingTime, shop.closingTime);
              return (
                <div key={shop.id} className="bg-card rounded-xl border p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground">{shop.shopName}</h3>
                    <StatusBadge status={open ? 'Open' : 'Closed'} />
                  </div>
                  <p className="text-sm text-muted-foreground">{shop.category} · {shop.location}</p>
                  <p className="text-sm text-muted-foreground">👤 {shop.ownerName} · ⏱ ~{shop.prepTime} min</p>
                  <p className="text-xs text-muted-foreground">{shop.openingTime} – {shop.closingTime}</p>
                  {shop.offer && (
                    <div className="bg-accent rounded-lg px-3 py-1.5">
                      <p className="text-accent-foreground text-sm font-medium">🎉 {shop.offer}</p>
                    </div>
                  )}
                  <Button
                    className="w-full h-10 font-semibold"
                    disabled={!open}
                    onClick={() => navigate(`/shop/${shop.id}`)}
                  >
                    {open ? 'Order Now' : 'Shop Closed'}
                  </Button>
                </div>
              );
            })
          )
        ) : (
          myOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet.</p>
          ) : (
            myOrders.map(o => (
              <div key={o.id} className="bg-card rounded-xl border p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground text-sm">#{o.id.slice(0, 6).toUpperCase()}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-sm text-muted-foreground">{o.shopName}</p>
                <div className="text-sm">
                  {o.items.map((item, i) => (
                    <p key={i}>{item.name} × {item.qty} — ₹{item.price * item.qty}</p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Pickup: {o.pickupTime} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
