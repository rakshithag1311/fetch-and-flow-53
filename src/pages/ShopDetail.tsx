import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShops, getCurrentUser, addOrder, generateId, type OrderItem } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge';
import { QRCodeSVG } from 'qrcode.react';

const ShopDetail = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser()!;
  const shop = getShops().find(s => s.id === shopId);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pickupTime, setPickupTime] = useState('');
  const [step, setStep] = useState<'browse' | 'checkout' | 'done'>('browse');
  const [orderId, setOrderId] = useState('');

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">Shop not found</p>
          <Button className="mt-4" onClick={() => navigate('/customer')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const addToCart = (pid: string) => {
    setCart(c => ({ ...c, [pid]: (c[pid] || 0) + 1 }));
  };
  const removeFromCart = (pid: string) => {
    setCart(c => {
      const n = { ...c };
      if (n[pid] > 1) n[pid]--;
      else delete n[pid];
      return n;
    });
  };

  const cartItems: OrderItem[] = Object.entries(cart).map(([pid, qty]) => {
    const p = shop.products.find(p => p.id === pid)!;
    return { name: p.name, price: p.price, qty };
  });

  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = () => {
    const id = generateId();
    addOrder({
      id,
      shopId: shop.id,
      shopName: shop.shopName,
      customerPhone: user.phone,
      customerName: user.name,
      items: cartItems,
      pickupTime,
      status: 'New',
      createdAt: new Date().toISOString()
    });
    setOrderId(id);
    setStep('done');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Button variant="outline" size="sm" onClick={() => navigate('/customer')}>← Back</Button>
          <div>
            <h1 className="text-base font-bold text-foreground">{shop.shopName}</h1>
            <p className="text-xs text-muted-foreground">{shop.category} · {shop.location}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {step === 'browse' && (
          <>
            {shop.offer && (
              <div className="bg-accent rounded-xl px-4 py-2">
                <p className="text-accent-foreground font-medium text-sm">🎉 {shop.offer}</p>
              </div>
            )}

            {shop.products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No products available.</p>
            ) : (
              shop.products.map(p => (
                <div key={p.id} className="bg-card rounded-xl border p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground">₹{p.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.inStock ? 'In Stock' : 'Out of Stock'} />
                    {p.inStock ? (
                      cart[p.id] ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => removeFromCart(p.id)}>−</Button>
                          <span className="w-6 text-center text-sm font-bold text-foreground">{cart[p.id]}</span>
                          <Button size="sm" variant="outline" onClick={() => addToCart(p.id)}>+</Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(p.id)}>Add</Button>
                      )
                    ) : null}
                  </div>
                </div>
              ))
            )}

            {Object.keys(cart).length > 0 && (
              <div className="bg-card rounded-xl border p-4 shadow-sm space-y-3 sticky bottom-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground">{Object.values(cart).reduce((s, q) => s + q, 0)} items</p>
                  <p className="font-bold text-primary text-lg">₹{total}</p>
                </div>
                <Button className="w-full h-12 text-base font-semibold" onClick={() => setStep('checkout')}>
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </>
        )}

        {step === 'checkout' && (
          <div className="bg-card rounded-xl border p-5 space-y-4 shadow-sm">
            <h2 className="font-bold text-lg text-foreground">Checkout</h2>
            <div className="space-y-1 text-sm">
              {cartItems.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.name} × {item.qty}</span>
                  <span className="font-medium">₹{item.price * item.qty}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-bold text-foreground">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Pickup Time</label>
              <Input type="text" placeholder="e.g. 6:00 PM" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="h-11" />
            </div>

            <div className="bg-accent rounded-lg p-3 text-center">
              <p className="text-xs text-accent-foreground font-medium">Simulated UPI Payment</p>
              <p className="text-sm text-accent-foreground mt-1">Pay <strong>₹{total}</strong> to <strong>{shop.upiId}</strong></p>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold"
              disabled={!pickupTime}
              onClick={placeOrder}
            >
              Place Order (₹{total})
            </Button>
            <button className="text-sm text-primary underline w-full text-center" onClick={() => setStep('browse')}>
              ← Back to menu
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-card rounded-xl border p-6 text-center space-y-4 shadow-sm">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold text-foreground">Order Placed!</h2>
            <p className="text-muted-foreground text-sm">Order ID: <strong className="text-foreground">#{orderId.slice(0, 6).toUpperCase()}</strong></p>
            <div className="bg-white rounded-xl p-4 mx-auto w-48 h-48 flex items-center justify-center">
              <QRCodeSVG
                value={`SMARTFETCH-ORDER:${orderId}`}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-muted-foreground">Order: #{orderId.slice(0, 6).toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">Show this at pickup. Pickup at {pickupTime}.</p>
            <Button className="w-full h-12 font-semibold" onClick={() => navigate('/customer')}>
              Back to Home
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopDetail;
