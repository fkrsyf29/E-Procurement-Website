import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Mail, Key, CheckCircle } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { toast } from 'sonner@2.0.3';
import logoImage from 'figma:asset/904487f40e518b88e2b9435d33aa8cfa6557436d.png';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userId, setUserId] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Find user by email or username
    const user = mockUsers.find(
      u => u.email?.toLowerCase() === email.toLowerCase() || 
           u.username.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      toast.error('Email or username not found in our system');
      return;
    }

    if (!user.email) {
      toast.error('This account does not have an email address configured. Please contact administrator.');
      return;
    }

    // Generate random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setUserId(user.id);
    setUsername(user.username);

    // Simulate sending email
    toast.success(`Verification code sent to ${user.email}`);
    console.log(`VERIFICATION CODE: ${code}`); // For demo purposes
    
    setStep('verify');
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode !== generatedCode) {
      toast.error('Invalid verification code');
      return;
    }

    toast.success('Code verified successfully');
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Update user password
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.password = newPassword;
      user.lastPasswordChange = new Date().toISOString().split('T')[0];
      toast.success('Password reset successfully!');
      setStep('success');
    } else {
      toast.error('User not found');
    }
  };

  const handleBackToLogin = () => {
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedCode('');
    setUserId('');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e88e5] via-[#42a5f5] to-[#64b5f6] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 relative z-10 backdrop-blur-sm bg-opacity-95">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="AlamTri Geo" 
              className="h-20 object-contain"
            />
          </div>
          <h1 className="text-gray-900">
            {step === 'success' ? 'Password Reset Complete' : 'Reset Password'}
          </h1>
          <p className="text-gray-700 mt-1" style={{ fontWeight: '600', fontSize: '15px' }}>
            PT SAPTAINDRA SEJATI
          </p>
        </div>

        {/* Step 1: Enter Email/Username */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email or Username
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or username"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500">
                We'll send a verification code to your registered email address.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Send Verification Code
            </Button>

            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                We've sent a 6-digit verification code to your email address.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                For demo: Check console or use code: <code className="bg-blue-200 px-2 py-1 rounded">{generatedCode}</code>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                autoFocus
                maxLength={6}
              />
            </div>

            <Button type="submit" className="w-full">
              Verify Code
            </Button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                Code verified! You can now reset your password for account: <strong>{username}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters long.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div>
              <h2 className="text-xl text-gray-900 mb-2">Password Reset Successful!</h2>
              <p className="text-gray-600">
                Your password has been reset successfully. You can now login with your new password.
              </p>
            </div>

            <Button onClick={handleBackToLogin} className="w-full">
              Back to Login
            </Button>
          </div>
        )}

        {/* Help Text */}
        {step !== 'success' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Need help?</p>
            <p className="text-xs text-gray-500">
              If you're having trouble resetting your password, please contact your system administrator at <strong>admin@eproposal.com</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
