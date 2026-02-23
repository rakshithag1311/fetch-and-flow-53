import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addUser, login } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RoleSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = (location.state as any)?.phone || '';
  const [role, setRole] = useState<'customer' | 'shopkeeper' | ''>('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!phone) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleContinue = () => {
    if (!role) { setError('Please select a role'); return; }
    if (!name.trim()) { setError('Please enter your name'); return; }
    addUser({ phone, role, name: name.trim() });
    login(phone);
    navigate(role === 'shopkeeper' ? '/shopkeeper' : '/customer', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Welcome to Smartfetch!</h1>
          <p className="text-muted-foreground text-sm">Tell us about yourself</p>
        </div>
        <div className="bg-card rounded-xl border p-6 space-y-5 shadow-sm">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {(['customer', 'shopkeeper'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setError(''); }}
                  className={`rounded-xl border-2 p-4 text-center font-semibold capitalize transition-all ${role === r ? 'border-primary bg-accent text-accent-foreground' : 'border-border bg-card text-foreground hover:border-primary/50'}`}
                >
                  {r === 'customer' ? '🛒' : '🏪'}<br />{r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="h-12 text-base"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
