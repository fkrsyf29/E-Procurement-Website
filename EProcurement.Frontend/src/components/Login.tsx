import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { User } from '../types';
import logoImage from 'figma:asset/904487f40e518b88e2b9435d33aa8cfa6557436d.png';
import { loginUser } from '../services/userApi';

interface LoginProps {
  onLogin: (user: User) => void;
  onForgotPassword: () => void;
}

export function Login({ onLogin, onForgotPassword }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { token, user } = await loginUser(username, password);
      localStorage.setItem('authToken', token); 
      
      onLogin(user);
    } catch (err) {
      console.error('Login API Error:', err);
      setError(err instanceof Error ? err.message : 'Login gagal. Cek kredensial Anda.');

    } finally {
      setIsLoading(false);
    }
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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="AlamTri Geo" 
              className="h-20 object-contain"
            />
          </div>
          <h1 className="text-gray-900">e-Proposal Management System</h1>
          <p className="text-gray-700 mt-1" style={{ fontWeight: '600', fontSize: '15px' }}>
            PT SAPTAINDRA SEJATI
          </p>
          <p className="text-gray-600 mt-3">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        {/* Demo Accounts Section */}
        <div className="mt-8 p-4 rounded-lg border border-blue-200 bg-blue-50">
          <h3 className="mb-3 text-center" style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            🔐 Demo Accounts - Quick Access
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {/* Admin & Leadership */}
            <div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#007BFF', fontWeight: 'bold' }}>
                ADMIN & LEADERSHIP
              </p>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-600">Admin:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">dev36003</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">dev36003</span>
                </div>
                {/* <div>
                  <span className="text-gray-600">President Dir:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">presdir</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">presdir123</span>
                </div> */}
              </div>
            </div>

            {/* Creators */}
            {/* <div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#28A745', fontWeight: 'bold' }}>
                CREATORS
              </p>
              <div className="space-y-1 text-xs">
                <div className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">creator.plant.jaho</div>
                <div className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">creator.it.sera</div>
                <div className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">creator.logistic.admo</div>
                <div className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">creator.finance.maco</div>
                <div className="text-gray-500 italic text-[10px] mt-1">Password: creator123</div>
              </div>
            </div> */}

            {/* Approvers */}
            {/* <div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#FFC107', fontWeight: 'bold' }}>
                APPROVERS
              </p>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-600">Unit Head:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">uh.[dept].[site]</span>
                </div>
                <div>
                  <span className="text-gray-600">Section Head:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">sh.[dept].[site]</span>
                </div>
                <div>
                  <span className="text-gray-600">Dept Head:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">dh.[dept].[site]</span>
                </div>
                <div>
                  <span className="text-gray-600">Manager:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">mgr.[dept].[site]</span>
                </div>
                <div className="text-gray-500 italic text-[10px] mt-1">Passwords: unithead123, sectionhead123, depthead123, manager123</div>
              </div>
            </div> */}

            {/* Division & Directors */}
            {/* <div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#6F42C1', fontWeight: 'bold' }}>
                DIVISION & DIRECTORS
              </p>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-600">Division Head:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">divhead.[dept]</span>
                </div>
                <div>
                  <span className="text-gray-600">Director:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">dir.[dept]</span>
                </div>
                <div>
                  <span className="text-gray-600">Chief Operation:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">co.[site]</span>
                </div>
                <div className="text-gray-500 italic text-[10px] mt-1">Passwords: divhead123, director123, chiefop123</div>
              </div>
            </div>*/}

            {/* Sourcing Team */}
            {/*<div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#DC3545', fontWeight: 'bold' }}>
                SOURCING TEAM
              </p>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-600">Buyer:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">buyer1</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">buyer123</span>
                </div>
                <div>
                  <span className="text-gray-600">Sourcing:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">sourcing1</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">sourcing123</span>
                </div>
                <div>
                  <span className="text-gray-600">Planner:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">planner1</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">planner123</span>
                </div>
              </div>
            </div> */}

            {/* Examples */}
            {/*<div className="p-2.5 bg-white rounded-lg border border-gray-200">
              <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: '#17A2B8', fontWeight: 'bold' }}>
                EXAMPLES
              </p>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-600">✓</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">uh.it.sera</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">unithead123</span>
                </div>
                <div>
                  <span className="text-gray-600">✓</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">sh.plant.jaho</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">sectionhead123</span>
                </div>
                <div>
                  <span className="text-gray-600">✓</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">mgr.plant.jaho</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">manager123</span>
                </div>
                <div>
                  <span className="text-gray-600">✓</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">divhead.it</span> / 
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded ml-1 text-[10px]">divhead123</span>
                </div>
              </div>
            </div>*/}
          </div>
        </div>
      </div>
    </div>
  );
}
