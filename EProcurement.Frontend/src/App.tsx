import { useState, useEffect, useCallback } from 'react';
import { Toaster } from './components/ui/sonner';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MyProposals } from './components/MyProposals';
import { MyApprovals } from './components/MyApprovals';
import { SourcingDocuments } from './components/SourcingDocuments';
import { SourcingPage } from './components/SourcingPage';
import { UserManagement } from './components/UserManagement';
import { RoleManagement } from './components/RoleManagement';
import { MatrixManagement } from './components/MatrixManagement';
import { ItemDefinitionsManagement } from './components/ItemDefinitionsManagement';
import { SystemDataManagement } from './components/SystemDataManagement';
import { VendorDatabaseManagementNew } from './components/VendorDatabaseManagementNew';
import { ApprovalMatrixManagement } from './components/ApprovalMatrixManagement';
import { CategoryManagement } from './components/CategoryManagement';
import { MatrixContractManagement } from './components/MatrixContractManagement';
import { AnnualPurchasePlan } from './components/AnnualPurchasePlan';
import { mockProposals, mockVendorRecommendations } from './data/mockData';
import { testProposals } from './data/testProposals';
import { approvalMatrixData } from './data/approvalMatrix';
import { defaultRoles } from './data/rolesData';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial, bulkAddMaterials } from './data/materialsData';
import { User, Proposal, ApprovalMatrix, VendorRecommendation, Material } from './types';
import { RoleDefinition } from './types/role'
import { initializeProposalHistory, getFirstApprovalStatus } from './utils/approvalHelper';
import { fetchCurrentUser } from './services/userApi';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  // Combine mockProposals with testProposals for vendor recommendation testing
  const [proposals, setProposals] = useState<Proposal[]>([...mockProposals, ...testProposals]);
  const [approvalMatrices, setApprovalMatrices] = useState<ApprovalMatrix[]>(approvalMatrixData);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vendorRecommendations, setVendorRecommendations] = useState<VendorRecommendation[]>(mockVendorRecommendations);
  const [materials, setMaterials] = useState<Material[]>(getMaterials());
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const handleLogin = useCallback((user: User) => {
      setCurrentUser(user);
      setCurrentPage('dashboard');
  }, [setCurrentUser, setCurrentPage]);

  const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setCurrentPage('dashboard');
        localStorage.removeItem('authToken');
    }, [setCurrentUser, setCurrentPage]);

  useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('authToken');
            console.log('token ->', token);
            if (token) {
                const user = await fetchCurrentUser(token);
                
                if (user) {
                    console.log('✅ [APP] Token valid. Sesi dipulihkan.');
                    
                    handleLogin(user);
                } else {
                    console.log('❌ [APP] Token tidak valid/expired. Menghapus sesi.');
                    localStorage.removeItem('authToken');
                }
            }
            setIsCheckingSession(false);
        };
        
        checkSession();
    }, [handleLogin]);

  // ✅ DEBUG: Log when proposals state changes
  useEffect(() => {
    console.log('📢 [APP] proposals state updated!');
    console.log('   - Total proposals:', proposals.length);
    console.log('   - Proposal IDs:', proposals.map(p => p.id).join(', '));
  }, [proposals]);
  

  // ✅ CRITICAL: Sync materials from localStorage on mount and storage events
  useEffect(() => {
    // Load from localStorage on mount
    const loadedMaterials = getMaterials();
    setMaterials(loadedMaterials);
    console.log('✅ Materials loaded on mount:', loadedMaterials.length);

    // Listen for localStorage changes (from other tabs or components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eproposal_materials_data') {
        const updatedMaterials = getMaterials();
        setMaterials(updatedMaterials);
        console.log('🔄 Materials synced from localStorage:', updatedMaterials.length);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSaveProposal = (proposalData: any, isDraft: boolean) => {
    console.log('💾 [APP] handleSaveProposal called');
    console.log('   - Is Draft:', isDraft);
    console.log('   - Proposal ID:', proposalData.id);
    console.log('   - Proposal No:', proposalData.proposalNo);
    
    // ✅ CHECK: Is this an UPDATE (edit) or CREATE (new)?
    const isEdit = proposalData.id && proposals.some(p => p.id === proposalData.id);
    
    if (isEdit) {
      // ✅ UPDATE EXISTING PROPOSAL
      console.log('📝 [APP] Updating existing proposal:', proposalData.id);
      
      // Get the original proposal to check if it's Rejected
      const originalProposal = proposals.find(p => p.id === proposalData.id);
      const isResubmit = originalProposal?.status === 'Rejected' && !isDraft;
      
      console.log('   - Original Status:', originalProposal?.status);
      console.log('   - Is Resubmit:', isResubmit);
      
      setProposals(prevProposals => 
        prevProposals.map(p => {
          if (p.id === proposalData.id) {
            let newStatus = p.status;
            let newHistory = p.history;
            
            // ✅ RESUBMIT LOGIC: Reset status and history for rejected proposals
            if (isResubmit) {
              console.log('🔄 [RESUBMIT] Resetting approval flow for rejected proposal');
              
              // Get new initial status based on updated amount and routing
              newStatus = getFirstApprovalStatus(
                proposalData.amount,
                currentUser?.department || proposalData.department,
                currentUser?.jobsite || proposalData.jobsite
              );
              
              // Initialize new approval history
              newHistory = initializeProposalHistory(
                currentUser?.name || p.creator,
                currentUser?.roleName || 'Creator',
                false, // Not a draft - it's a resubmission
                proposalData.amount,
                currentUser?.department || proposalData.department,
                currentUser?.jobsite || proposalData.jobsite,
                proposalData.jobsite // Procurement jobsite for Chief Operation
              );
              
              console.log('   - New Status:', newStatus);
              console.log('   - New History Length:', newHistory.length);
            } else if (isDraft) {
              // If saving as draft, set to Draft
              newStatus = 'Draft';
            } else if (p.status === 'Draft' && !isDraft) {
              // ✅ FIX (Nov 13): Draft proposal being submitted for first time
              console.log('📤 [SUBMIT DRAFT] Converting draft to submitted proposal');
              
              // Get initial approval status
              newStatus = getFirstApprovalStatus(
                proposalData.amount,
                currentUser?.department || proposalData.department,
                currentUser?.jobsite || proposalData.jobsite
              );
              
              // Initialize approval history
              newHistory = initializeProposalHistory(
                currentUser?.name || p.creator,
                currentUser?.roleName || 'Creator',
                false, // Not a draft - it's being submitted
                proposalData.amount,
                currentUser?.department || proposalData.department,
                currentUser?.jobsite || proposalData.jobsite,
                proposalData.jobsite // Procurement jobsite for Chief Operation
              );
              
              console.log('   - New Status:', newStatus);
              console.log('   - New History Length:', newHistory.length);
            }
            // Otherwise keep existing status (for normal updates)
            
            // Keep original metadata, update fields
            return {
              ...p,
              proposalNo: proposalData.proposalNo,
              title: proposalData.title,
              description: proposalData.procurementObjective,
              category: proposalData.category,
              classification: proposalData.classification,
              subClassification: proposalData.subClassification,
              subClassifications: proposalData.subClassifications,
              categories: proposalData.categories,
              classifications: proposalData.classifications,
              tor: proposalData.procurementObjective || '',
              ter: proposalData.procurementObjective || '',
              jobsite: proposalData.jobsite,
              department: proposalData.department,
              workLocation: proposalData.workLocation,
              amount: proposalData.amount,
              status: newStatus,
              history: newHistory,
              scopeOfWork: proposalData.scopeOfWork,
              analysis: proposalData.analysis,
              fundingBudget: proposalData.fundingBudget,
              fundingNonBudget: proposalData.fundingNonBudget,
              contractType: proposalData.contractType,
              contractualType: proposalData.contractualType,
              contractPeriod: proposalData.contractPeriod,
              penalty: proposalData.penalty,
              contractTermination: proposalData.contractTermination,
              regulations: proposalData.regulations,
              attachments: proposalData.attachments,
              matrixConditions: proposalData.matrixConditions,
              isTransactionValueExceeded: proposalData.isTransactionValueExceeded,
              isDurationExceeded: proposalData.isDurationExceeded,
              durationMonths: proposalData.durationMonths,
              torItems: proposalData.torItems,
              terItems: proposalData.terItems,
              budgetItems: proposalData.budgetItems || [],
              kbliCodes: proposalData.kbliCodes || [],
              brandSpecifications: proposalData.brandSpecifications || [],
              recommendedVendors: proposalData.recommendedVendors || p.recommendedVendors || [],
              additionalVendors: proposalData.additionalVendors || p.additionalVendors || [],
            };
          }
          return p;
        })
      );
      
      console.log('✅ [APP] Proposal updated successfully');
      return;
    }
    
    // ✅ CREATE NEW PROPOSAL
    console.log('➕ [APP] Creating new proposal');
    console.log('   - 🔍 CURRENT USER INFO:');
    console.log('      • ID:', currentUser?.userID);
    console.log('      • Username:', currentUser?.username);
    console.log('      • Name:', currentUser?.name);
    console.log('      • Role:', currentUser?.roleName);
    console.log('      • Jobsite:', currentUser?.jobsite);
    console.log('      • Department:', currentUser?.department);
    
    // IMPORTANT: Use CREATOR's jobsite and department for approval routing
    // EXCEPTION: Chief Operation uses PROCUREMENT jobsite
    const creatorJobsite = currentUser?.jobsite;
    const creatorDepartment = currentUser?.department;
    const procurementJobsite = proposalData.jobsite; // Procurement jobsite for Chief Operation
    
    // Get initial status based on approval matrix using CREATOR's jobsite/department
    const initialStatus = isDraft 
      ? 'Draft' 
      : getFirstApprovalStatus(
          proposalData.amount,
          creatorDepartment || proposalData.department,
          creatorJobsite || proposalData.jobsite
        );
    
    // Initialize approval history using helper with CREATOR's jobsite/department
    // Pass procurement jobsite for Chief Operation exception
    const history = initializeProposalHistory(
      currentUser?.name || '',
      currentUser?.roleName || 'Creator',
      isDraft,
      proposalData.amount,
      creatorDepartment || proposalData.department,
      creatorJobsite || proposalData.jobsite,
      procurementJobsite // For Chief Operation approval
    );
    
    const newProposal: Proposal = {
      id: `${proposals.length + 1}`,
      proposalNo: proposalData.proposalNo,
      title: proposalData.title,
      description: proposalData.procurementObjective,
      category: proposalData.category,
      classification: proposalData.classification,
      subClassification: proposalData.subClassification,
      subClassifications: proposalData.subClassifications, // ✅ CRITICAL: Include array for vendor matching!
      categories: proposalData.categories, // ✅ Full category objects with codes
      classifications: proposalData.classifications, // ✅ Full classification objects with codes
      tor: proposalData.procurementObjective || '',
      ter: proposalData.procurementObjective || '',
      vendorList: proposalData.vendorList || [],
      jobsite: proposalData.jobsite, // Procurement jobsite (where work will be done)
      department: proposalData.department, // Procurement department
      workLocation: proposalData.workLocation,
      creator: currentUser?.name || '',
      creatorId: currentUser?.userID || '',
      creatorJobsite: creatorJobsite, // Creator's jobsite - for approval routing
      creatorDepartment: creatorDepartment, // Creator's department - for approval routing
      amount: proposalData.amount,
      createdDate: proposalData.createdDate,
      status: initialStatus,
      history: history,
      // Extended fields
      scopeOfWork: proposalData.scopeOfWork,
      analysis: proposalData.analysis,
      fundingBudget: proposalData.fundingBudget,
      fundingNonBudget: proposalData.fundingNonBudget,
      contractType: proposalData.contractType,
      contractualType: proposalData.contractualType,
      contractPeriod: proposalData.contractPeriod,
      penalty: proposalData.penalty,
      contractTermination: proposalData.contractTermination,
      regulations: proposalData.regulations,
      attachments: proposalData.attachments,
      matrixConditions: proposalData.matrixConditions, // Dynamic matrix conditions object
      isTransactionValueExceeded: proposalData.isTransactionValueExceeded, // Auto-check condition
      isDurationExceeded: proposalData.isDurationExceeded, // Auto-check condition
      durationMonths: proposalData.durationMonths, // Duration in months
      torItems: proposalData.torItems,
      terItems: proposalData.terItems,
      budgetItems: proposalData.budgetItems || [], // ✅ CRITICAL: Budget items for funding source
      kbliCodes: proposalData.kbliCodes || [], // ✅ NEW (Nov 12, 2025)
      brandSpecifications: proposalData.brandSpecifications || [], // ✅ NEW (Nov 12, 2025)
      recommendedVendors: proposalData.recommendedVendors || [], // ✅ NEW (Nov 13, 2025)
      additionalVendors: proposalData.additionalVendors || [], // ✅ NEW (Nov 13, 2025)
    };

    // ✅ CRITICAL: Force new array reference to trigger React re-render
    console.log('🔄 [APP] About to call setProposals...');
    console.log('   - Current proposals length:', proposals.length);
    
    setProposals(prevProposals => {
      console.log('📦 [APP] Inside setProposals updater function');
      console.log('   - Previous proposals length:', prevProposals.length);
      
      const updated = [...prevProposals, newProposal];
      
      console.log('✅ [APP] New proposal created successfully');
      console.log('   - Total proposals now:', updated.length);
      console.log('   - New proposal:', newProposal.proposalNo);
      console.log('   - Proposal IDs:', updated.map(p => p.id).join(', '));
      console.log('   - 🔍 NEW PROPOSAL DETAILS:');
      console.log('      • ID:', newProposal.id);
      console.log('      • Proposal No:', newProposal.proposalNo);
      console.log('      • Status:', newProposal.status);
      console.log('      • Creator ID:', newProposal.creatorId);
      console.log('      • Creator:', newProposal.creator);
      console.log('      • Title:', newProposal.title);
      console.log('      • Jobsite:', newProposal.jobsite);
      console.log('      • Department:', newProposal.department);
      
      console.log('📤 [APP] Returning updated array from setProposals');
      return updated;
    });
    
    // ✅ Additional log to confirm state update triggered
    console.log('✅ [APP] setProposals called - React will re-render with new state');
    console.log('🕐 [APP] Waiting for MyProposals component to receive new props...');
  };

  const handleUpdateProposal = (proposalId: string, updates: Partial<Proposal>) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 [APP] handleUpdateProposal called');
    console.log('   - Proposal ID:', proposalId);
    console.log('   - vendorConfirmationStatus:', updates.vendorConfirmationStatus);
    console.log('   - All updates:', updates);
    
    setProposals(prevProposals => {
      const before = prevProposals.find(p => p.id === proposalId);
      const updated = prevProposals.map(p => 
        p.id === proposalId ? { ...p, ...updates } : p
      );
      const after = updated.find(p => p.id === proposalId);
      
      console.log('✅ [APP] Proposal updated');
      console.log('   - Proposal No:', after?.proposalNo);
      console.log('   - BEFORE vendorConfirmationStatus:', before?.vendorConfirmationStatus);
      console.log('   - AFTER vendorConfirmationStatus:', after?.vendorConfirmationStatus);
      console.log('═══════════════════════════════════════════════════════');
      
      return updated;
    });
  };

  const handleRequestVendors = (vendorRequest: Omit<VendorRecommendation, 'id'>) => {
    const newVendorRequest: VendorRecommendation = {
      ...vendorRequest,
      id: `VR-${Date.now()}`,
    };
    setVendorRecommendations([...vendorRecommendations, newVendorRequest]);
  };

  const handleUpdateVendorRecommendation = (vendorReqId: string, updates: Partial<VendorRecommendation>) => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔄 [APP] handleUpdateVendorRecommendation called');
    console.log('   - Vendor Rec ID:', vendorReqId);
    console.log('   - New status:', updates.status);
    console.log('   - All updates:', updates);
    
    setVendorRecommendations(prevRecs => {
      const before = prevRecs.find(vr => vr.id === vendorReqId);
      const updated = prevRecs.map(vr =>
        vr.id === vendorReqId ? { ...vr, ...updates } : vr
      );
      const after = updated.find(vr => vr.id === vendorReqId);
      
      console.log('✅ [APP] Vendor Recommendation updated');
      console.log('   - Proposal No:', after?.proposalNo);
      console.log('   - BEFORE status:', before?.status);
      console.log('   - AFTER status:', after?.status);
      console.log('═══════════════════════════════════════════════════════');
      
      return updated;
    });
  };

  // Annual Purchase Plan handlers
  const handleAddMaterial = (material: Omit<Material, 'id' | 'createdDate'>) => {
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

  const handleBulkUploadMaterials = (materialsData: Omit<Material, 'id' | 'createdDate'>[]) => {
    bulkAddMaterials(materialsData);
    setMaterials(getMaterials());
  };

  const renderPage = () => {
    if (!currentUser) return null;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard proposals={proposals} user={currentUser} onUpdateProposal={handleUpdateProposal} />;
      case 'my-proposals':
        return <MyProposals user={currentUser} proposals={proposals} onSaveProposal={handleSaveProposal} />;
      case 'my-approvals':
        return <MyApprovals user={currentUser} proposals={proposals} onUpdateProposal={handleUpdateProposal} />;
      case 'sourcing-documents':
        return <SourcingDocuments 
          user={currentUser} 
          proposals={proposals} 
          onUpdateProposal={handleUpdateProposal}
          onRequestVendors={handleRequestVendors}
        />;
      case 'sourcing':
        return <SourcingPage 
          user={currentUser} 
          vendorRecommendations={vendorRecommendations}
          onUpdateVendorRecommendation={handleUpdateVendorRecommendation}
          onUpdateProposal={handleUpdateProposal}
          proposals={proposals}
        />;
      case 'users':
        return <UserManagement users={users} onUpdateUsers={setUsers} roles={roles} onNavigateToRoleManagement={() => setCurrentPage('role-management')} />;
      case 'role-management':
        return <RoleManagement roles={roles} onUpdateRoles={setRoles} />;
      case 'matrix-management':
        return <MatrixManagement user={currentUser} onNavigateToItemDefinitions={() => setCurrentPage('item-definitions')} />;
      case 'item-definitions':
        return <ItemDefinitionsManagement user={currentUser} />;
      case 'system-data':
        return <SystemDataManagement user={currentUser} />;
      case 'vendor-database':
        return <VendorDatabaseManagementNew user={currentUser} />;
      case 'approval-matrix':
        return <ApprovalMatrixManagement matrices={approvalMatrices} onUpdateMatrices={setApprovalMatrices} />;
      case 'category-management':
        return <CategoryManagement />;
      case 'matrix-contract':
        return <MatrixContractManagement />;
      case 'annual-purchase-plan':
        return <AnnualPurchasePlan
          user={currentUser}
          materials={materials}
          onAddMaterial={handleAddMaterial}
          onUpdateMaterial={handleUpdateMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          onBulkUpload={handleBulkUploadMaterials}
        />;
      default:
        return <Dashboard proposals={proposals} user={currentUser} onUpdateProposal={handleUpdateProposal} />;
    }
  };

  if (isCheckingSession) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <p className="text-lg font-medium text-blue-600">Loading Session...</p> 
          </div>
      );
  }

  if (!currentUser) {
    if (showForgotPassword) {
      return (
        <>
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
          <Toaster />
        </>
      );
    }
    
    return (
      <>
        <Login 
          onLogin={handleLogin} 
          onForgotPassword={() => setShowForgotPassword(true)}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Layout
        user={currentUser}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}
