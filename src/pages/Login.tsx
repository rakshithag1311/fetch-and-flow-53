import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUser, login } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setStep('otp');
    setError('');
  };

  const handleVerifyOtp = () => {
    if (otp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      return;
    }
    const user = findUser(phone);
    if (user) {
      login(phone);
      navigate(user.role === 'shopkeeper' ? '/shopkeeper' : '/customer', { replace: true });
    } else {
      navigate('/role-select', { state: { phone } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-primary">Smartfetch</h1>
          <p className="text-muted-foreground">Your local marketplace</p>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-4 shadow-sm">
          {step === 'phone' ? (
            <>
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter 10-digit phone"
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                className="text-lg h-12"
                maxLength={10}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button onClick={handleSendOtp} className="w-full h-12 text-base font-semibold">
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">OTP sent to <span className="font-semibold text-foreground">{phone}</span></p>
              <div className="bg-accent rounded-lg p-3 text-center">
                <p className="text-xs text-accent-foreground font-medium">Demo OTP</p>
                <p className="text-2xl font-bold tracking-widest text-accent-foreground">{generatedOtp}</p>
              </div>
              <Input
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                className="text-lg h-12 text-center tracking-widest"
                maxLength={4}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button onClick={handleVerifyOtp} className="w-full h-12 text-base font-semibold">
                Verify & Login
              </Button>
              <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="text-sm text-primary underline w-full text-center">
                Change number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
