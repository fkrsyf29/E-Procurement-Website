import { useState, useEffect, useCallback } from "react";
import { Toaster } from "./components/ui/sonner";
import { Login } from "./components/Login";
import { ForgotPassword } from "./components/ForgotPassword";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { MyProposals } from "./components/MyProposals";
import { MyApprovals } from "./components/MyApprovals";
import { SourcingDocuments } from "./components/SourcingDocuments";
import { SourcingPage } from "./components/SourcingPage";
import { UserManagement } from "./components/UserManagement";
import { RoleManagement } from "./components/RoleManagement";
import { MatrixManagement } from "./components/MatrixManagement";
import { ItemDefinitionsManagement } from "./components/ItemDefinitionsManagement";
import { SystemDataManagement } from "./components/SystemDataManagement";
import { VendorDatabaseManagementNew } from "./components/VendorDatabaseManagementNew";
import { ApprovalMatrixManagement } from "./components/ApprovalMatrixManagement";
import { CategoryManagement } from "./components/CategoryManagement";
import { MatrixContractManagement } from "./components/MatrixContractManagement";
import { AnnualPurchasePlan } from "./components/AnnualPurchasePlan";
import { mockProposals, mockVendorRecommendations } from "./data/mockData";
import { testProposals } from "./data/testProposals";
import { approvalMatrixData } from "./data/approvalMatrix";
import {
  getMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  bulkAddMaterials,
} from "./data/materialsData";
import {
  User,
  Proposal,
  ApprovalMatrix,
  VendorRecommendation,
  Material,
  Regions,
} from "./types";
import {
  ApprovalRoles,
  Departments,
  Jobsites,
  RoleDefinition,
  Permission,
  RoleCategories,
  PermissionCategories,
} from "../types";
import { fetchCurrentUser, fetchApiUsers } from "./services/userApi";
import { fetchApiRoles } from "./services/roleApi";
import { fetchApiPermissions } from "./services/permissionApi";
import { fetchApiDepartment } from "./services/departmentApi";
import { fetchApiJobsite } from "./services/jobsiteApi";
import { fetchApiApprovalRole } from "./services/approvalRoleApi";
import { fetchApiRoleCategory } from "./services/roleCategoryApi";
import { fetchApiPermissionCategory } from "./services/permissionCategoryApi";
import { fetchApiRegion } from "./services/regionApi";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  // State Legacy (Mock Data) - Tetap dipertahankan agar tidak error saat compile
  const [proposals, setProposals] = useState<Proposal[]>([ ...mockProposals, ...testProposals ]);
  const [materials, setMaterials] = useState<Material[]>(getMaterials());
  
  // State Master Data
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Departments[]>([]);
  const [availableJobsites, setAvailableJobsites] = useState<Jobsites[]>([]);
  const [availableRegions, setAvailableRegions] = useState<Regions[]>([]);
  const [availableRoleCategories, setAvailableRoleCategories] = useState<RoleCategories[]>([]);
  const [availablePermissionCategories, setAvailablePermissionCategories] = useState<PermissionCategories[]>([]);
  const [availableApprovalRoles, setAvailableApprovalRoles] = useState<ApprovalRoles[]>([]);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const handleLogin = useCallback(
    (user: User) => {
      // ✅ BERSIH: Langsung terima user dari API (karena sudah ada permissions di dalamnya)
      setCurrentUser(user);
      
      // Auto Redirect berdasarkan Permission yang dibawa user
      // Kita gunakan optional chaining (?.) dan fallback array kosong untuk keamanan
      const perms = user.permissions || [];
      
      console.log("🔐 [LOGIN] User Permissions:", perms);

      if (perms.includes('manage_sourcing') && !perms.includes('approve_sourcing')) {
          setCurrentPage("sourcing");
      } else if (perms.includes('review_vendors') && !perms.includes('approve_manager_level')) {
          setCurrentPage("sourcing-documents");
      } else if (perms.some(p => p.startsWith('approve_'))) {
          setCurrentPage("my-approvals");
      } else {
          setCurrentPage("dashboard");
      }
    },
    [setCurrentUser, setCurrentPage],
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage("dashboard");
    localStorage.removeItem("authToken");
  }, [setCurrentUser, setCurrentPage]);

  // Fetch Master Data on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // Parallel fetch
        const [
          mappedRoles,
          permissionsList,
          departmentList,
          jobsiteList,
          regionList,
          approvalRoleList,
          roleCategoryList,
          permissionCategoryList,
          mappedUsers
        ] = await Promise.all([
            fetchApiRoles().catch(() => []),
            fetchApiPermissions().catch(() => []),
            fetchApiDepartment().catch(() => []),
            fetchApiJobsite().catch(() => []),
            fetchApiRegion().catch(() => []),
            fetchApiApprovalRole().catch(() => []),
            fetchApiRoleCategory().catch(() => []),
            fetchApiPermissionCategory().catch(() => []),
            fetchApiUsers().catch(() => [])
        ]);

        if (isMounted) {
          setUsers(mappedUsers || []);
          setRoles(mappedRoles || []);
          setAvailablePermissions(permissionsList || []);
          setAvailableDepartments(departmentList || []);
          setAvailableJobsites(jobsiteList || []);
          setAvailableRegions(regionList || []);
          setAvailableApprovalRoles(approvalRoleList || []);
          setAvailablePermissionCategories(permissionCategoryList || []);
          setAvailableRoleCategories(roleCategoryList || []);
        }
      } catch (err) {
        console.error("Error fetching master data:", err);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Check Session
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsCheckingSession(false);
        return;
      }
      try {
        const user = await fetchCurrentUser(token);
        if (user) {
             // ✅ User dari API checkSession sekarang juga sudah membawa permissions
             handleLogin(user);
        } else {
             localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        localStorage.removeItem("authToken");
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, [handleLogin]);

  // Material Management Handlers (Legacy/Admin)
  const handleAddMaterial = (material: Omit<Material, "id" | "createdDate">) => {
    const newMaterial = addMaterial(material);
    setMaterials(getMaterials());
    return newMaterial;
  };
  const handleUpdateMaterial = (id: string, updates: Partial<Material>) => {
    updateMaterial(id, updates);
    setMaterials(getMaterials());
  };
  const handleDeleteMaterial = (id: string) => {
    deleteMaterial(id);
    setMaterials(getMaterials());
  };
  const handleBulkUploadMaterials = (materialsData: Omit<Material, "id" | "createdDate">[]) => {
    bulkAddMaterials(materialsData);
    setMaterials(getMaterials());
  };

  const renderPage = () => {
    if (!currentUser) return null;
    switch (currentPage) {
      // --- REFACTORED MODULES (API BASED) ---
      // Module-module ini sekarang MANDIRI (Self-contained), tidak butuh props dari App
      case "dashboard":
        return <Dashboard user={currentUser} />;
      case "my-proposals":
        return <MyProposals user={currentUser} />;
      case "my-approvals":
        return <MyApprovals user={currentUser} />;
      case "sourcing-documents":
        return <SourcingDocuments user={currentUser} />;
      case "sourcing":
        return <SourcingPage user={currentUser} />;

      // --- ADMIN MODULES (Legacy/Local State) ---
      case "users":
        return (
          <UserManagement
            users={users}
            currentUser={currentUser}
            onUpdateUsers={setUsers}
            roles={roles}
            availableDepartments={availableDepartments}
            availableJobsites={availableJobsites}
            onNavigateToRoleManagement={() => setCurrentPage("role-management")}
          />
        );
      case "role-management":
        return (
          <RoleManagement
            user={currentUser}
            roles={roles}
            availableDepartments={availableDepartments}
            availableJobsites={availableJobsites}
            availableRegions={availableRegions}
            availableApprovalRoles={availableApprovalRoles}
            availablePermissionCategories={availablePermissionCategories}
            permissions={availablePermissions}
            availableRoleCategories={availableRoleCategories}
            onUpdateRoles={setRoles}
          />
        );
      case "matrix-management":
        return <MatrixManagement user={currentUser} onNavigateToItemDefinitions={() => setCurrentPage("item-definitions")} />;
      case "item-definitions":
        return <ItemDefinitionsManagement user={currentUser} />;
      case "system-data":
        return <SystemDataManagement user={currentUser} />;
      case "vendor-database":
        return <VendorDatabaseManagementNew user={currentUser} />;
      case "approval-matrix":
        return <ApprovalMatrixManagement user={currentUser} departments={availableDepartments} jobsites={availableJobsites} roles={availableApprovalRoles} />;
      case "category-management":
        return <CategoryManagement user={currentUser} />;
      case "matrix-contract":
        return <MatrixContractManagement user={currentUser} />;
      case "annual-purchase-plan":
        return (
          <AnnualPurchasePlan
            user={currentUser}
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onBulkUpload={handleBulkUploadMaterials}
          />
        );
      default:
        return <Dashboard user={currentUser} />;
    }
  };

  if (isCheckingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-lg font-medium text-blue-600">Loading Session...</p></div>;
  }

  if (!currentUser) {
    if (showForgotPassword) {
      return <><ForgotPassword onBack={() => setShowForgotPassword(false)} /><Toaster /></>;
    }
    return <><Login onLogin={handleLogin} onForgotPassword={() => setShowForgotPassword(true)} /><Toaster /></>;
  }

  return (
    <>
      <Layout user={currentUser} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}