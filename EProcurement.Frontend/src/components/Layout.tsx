import { ReactNode, useState, forwardRef, useRef  } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Package, 
  Users, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  MapPin,
  Key,
  Grid3x3,
  Settings,
  Store,
  ShieldCheck,
  FolderTree,
  PackageSearch,
  Boxes
} from 'lucide-react';
import { User } from '../types';
import logoImage from 'figma:asset/904487f40e518b88e2b9435d33aa8cfa6557436d.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface LayoutProps {
  user: User;
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

// Forwardref for the dropdown overlay
const DropdownOverlay = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} {...props} />
));
DropdownOverlay.displayName = 'DropdownOverlay';

export function Layout({ user, children, currentPage, onNavigate, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (page: string) => {
    if (navRef.current) {
      const scrollPosition = navRef.current.scrollTop; // Simpan posisi
      onNavigate(page);
      setSidebarOpen(false);
      // Restore setelah render (gunakan setTimeout untuk tunggu DOM update)
      setTimeout(() => {
        if (navRef.current) {
          navRef.current.scrollTop = scrollPosition;
        }
      }, 0);
    } else {
      onNavigate(page);
      setSidebarOpen(false);
    }
  };

  const getMenuItems = () => {
    const userRole = (user.roleName || 'Unknown Role').trim();
    
    // Check role-based access
    const isAdmin = userRole === 'Administrator';
    const isCreator = userRole.includes('Creator');
    const isApprover = userRole.includes('Unit Head') || 
                       userRole.includes('Section Head') || 
                       userRole.includes('Department Head') ||
                       userRole.includes('Manager') ||
                       userRole.includes('Division Head') ||
                       userRole.includes('Director') ||
                       userRole.includes('Chief Operation') ||
                       userRole === 'President Director';
    const isSourcingTeam = userRole === 'Buyer' || 
                           userRole === 'Planner' || 
                           userRole === 'Sourcing' ||
                           userRole === 'Sourcing Department Head' ||
                           userRole === 'Procurement Division Head';
    
    // Annual Purchase Plan access: ONLY Administrator and Creator role
    const hasAnnualPurchasePlanAccess = isAdmin || isCreator;
    
    const items = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        show: true // Everyone can see dashboard
      },
      { 
        id: 'my-proposals', 
        label: 'My Proposals', 
        icon: FileText, 
        show: isCreator
      },
      { 
        id: 'my-approvals', 
        label: 'My Approvals', 
        icon: CheckSquare, 
        show: isApprover || isAdmin
      },
      { 
        id: 'sourcing-documents', 
        label: 'Sourcing Documents', 
        icon: Package, 
        show: isSourcingTeam || isAdmin
      },
      { 
        id: 'sourcing', 
        label: 'Sourcing', 
        icon: PackageSearch, 
        show: isSourcingTeam || isAdmin
      },
      { 
        id: 'annual-purchase-plan', 
        label: 'Annual Purchase Plan', 
        icon: Boxes, 
        show: hasAnnualPurchasePlanAccess
      },
      { 
        id: 'system-data', 
        label: 'System Data', 
        icon: Building, 
        show: isAdmin
      },
      { 
        id: 'category-management', 
        label: 'Category Management', 
        icon: FolderTree, 
        show: isAdmin
      },
      { 
        id: 'vendor-database', 
        label: 'Vendor Database', 
        icon: Store, 
        show: isAdmin
      },
      { 
        id: 'approval-matrix', 
        label: 'Approval Matrix', 
        icon: Grid3x3, 
        show: isAdmin
      },
      { 
        id: 'matrix-management', 
        label: 'TOR/TER Matrix', 
        icon: Grid3x3, 
        show: isAdmin
      },
      { 
        id: 'item-definitions', 
        label: 'Item Definitions', 
        icon: Settings, 
        show: isAdmin
      },
      { 
        id: 'matrix-contract', 
        label: 'Matrix Contract', 
        icon: CheckSquare, 
        show: isAdmin
      },
      { 
        id: 'users', 
        label: 'User Management', 
        icon: Users, 
        show: isAdmin
      },
      { 
        id: 'role-management', 
        label: 'Role Management', 
        icon: ShieldCheck, 
        show: isAdmin
      },
    ];

    return items.filter(item => item.show);
  };

  const menuItems = getMenuItems();

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // Simulate password reset
    toast.success('Password reset successfully');
    setResetPasswordOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    
    return (
      <button
        onClick={() => handleNavigate(item.id)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
        style={{
          backgroundColor: isActive ? '#4DA3FF' : 'transparent',
          color: isActive ? '#FFFFFF' : '#000000',
          fontWeight: isActive ? '500' : '400'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#E0E0E0';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span
          className="flex-1 min-w-0 break-words hyphens-auto"
          style={{
            // Izinkan wrap otomatis, tapi hanya jika perlu
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            // Opsional: batasi maksimal 2 baris
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3f2fd] via-[#f0f7ff] to-[#e1f5fe]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 shadow-md" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="h-full pr-6 flex items-center justify-between">
          {/* Logo - Left side */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: '#000000' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* AlamTri Geo Logo */}
            <img 
              src={logoImage} 
              alt="AlamTri Geo" 
              className="h-20 object-contain -ml-2"
            />
          </div>

          {/* Centered header title */}
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <h1 style={{ color: '#000000', fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.5px', lineHeight: '1.2' }}>
                E-PROPOSAL MANAGEMENT SYSTEM
              </h1>
              <p style={{ color: '#000000', fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>
                PT SAPTAINDRA SEJATI
              </p>
            </div>
          </div>

          {/* User account dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all border"
              style={{ 
                backgroundColor: '#B3D9FF',
                borderColor: '#4DA3FF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#9CCEFF';
                e.currentTarget.style.borderColor = '#4DA3FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#B3D9FF';
                e.currentTarget.style.borderColor = '#4DA3FF';
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                <span className="text-sm" style={{ color: '#FFFFFF', fontWeight: '600' }}>{user.name.charAt(0)}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm" style={{ color: '#000000', fontWeight: '500' }}>{user.name}</p>
                <p className="text-xs" style={{ color: '#000000' }}>{user.roleName}</p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#000000' }} />
            </button>

            {/* Dropdown menu */}
            {userDropdownOpen && (
              <>
                <DropdownOverlay
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border py-2 z-50" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }}>
                  {/* User Identity Details */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: '#E0E0E0' }}>
                    <p className="text-xs mb-3" style={{ color: '#6C757D' }}>User Identity Details</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <UserIcon className="w-4 h-4 mt-0.5" style={{ color: '#6C757D' }} />
                        <div>
                          <p className="text-xs" style={{ color: '#6C757D' }}>Name</p>
                          <p className="text-sm" style={{ color: '#000000' }}>{user.name}</p>
                        </div>
                      </div>
                      {user.department && (
                        <div className="flex items-start gap-2">
                          <Building className="w-4 h-4 mt-0.5" style={{ color: '#6C757D' }} />
                          <div>
                            <p className="text-xs" style={{ color: '#6C757D' }}>Department</p>
                            <p className="text-sm" style={{ color: '#000000' }}>{user.department}</p>
                          </div>
                        </div>
                      )}
                      {user.jobsite && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#6C757D' }} />
                          <div>
                            <p className="text-xs" style={{ color: '#6C757D' }}>Jobsite</p>
                            <p className="text-sm" style={{ color: '#000000' }}>{user.jobsite}</p>
                          </div>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 mt-0.5" style={{ color: '#6C757D' }} />
                          <div>
                            <p className="text-xs" style={{ color: '#6C757D' }}>Email</p>
                            <p className="text-sm" style={{ color: '#000000' }}>{user.email}</p>
                          </div>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 mt-0.5" style={{ color: '#6C757D' }} />
                          <div>
                            <p className="text-xs" style={{ color: '#6C757D' }}>Phone</p>
                            <p className="text-sm" style={{ color: '#000000' }}>{user.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setResetPasswordOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{ color: '#000000' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F4F4F4'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Key className="w-4 h-4" />
                      <span>Reset Password</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{ color: '#DC3545' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEBEE'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-20 left-0 bottom-0 z-40 w-64 border-r transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: '#F4F4F4', borderColor: '#E0E0E0' }}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Brand */}
          <div className="p-6 border-b" style={{ borderColor: '#E0E0E0' }}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 style={{ color: '#000000', fontWeight: '600' }}>e-Proposal</h2>
                <p className="text-xs" style={{ color: '#6C757D' }}>Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav 
            ref={navRef} // Tambah ref
            className="flex-1 p-4 space-y-1 overflow-y-auto"
          >
            {menuItems.map(item => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Logout at bottom */}
          <div className="p-4 border-t" style={{ borderColor: '#E0E0E0', backgroundColor: '#FFFFFF' }}>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg transition-all"
              style={{ 
                color: '#FFFFFF',
                fontWeight: '400',
                fontSize: '18px',
                backgroundColor: '#000000',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
              }}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-20 lg:pl-64">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. Password must be at least 6 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleResetPassword}>
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
