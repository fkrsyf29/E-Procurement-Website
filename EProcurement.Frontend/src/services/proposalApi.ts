import { toast } from 'sonner';
import { 
  Proposal, 
  ProposalStatus, 
  ApprovalHistory, 
  BudgetItem, 
  TORItem, 
  TERItem,
  Jobsites,
  Departments
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined!");
}

// --- 1. MAPPER (PENTING: BE string -> FE Object) ---
const mapApiToProposal = (apiData: any): Proposal => {
  
  // Backend hanya mengirim string nama Jobsite/Dept via SP.
  // Kita bungkus jadi object agar sesuai interface 'Jobsites' di FE.
  const jobsiteObj: Jobsites = {
    jobsiteID: '0', // ID dummy karena SP list tidak return ID master
    code: apiData.jobsiteName || '',
    name: apiData.jobsiteName || 'Unknown Site',
    isActive: true,
    createdAt: '',
    createdBy: ''
  };

  const deptObj: Departments = {
    departmentID: '0',
    code: apiData.departmentName || '',
    name: apiData.departmentName || 'Unknown Dept',
    isActive: true,
    createdAt: '',
    createdBy: ''
  };

  // Map History
  const history: ApprovalHistory[] = (apiData.history || []).map((h: any, idx: number) => ({
    id: `hist-${idx}`,
    action: h.action,
    approver: h.actorName,
    roleName: h.roleName,
    comment: h.comment,
    date: h.actionDate,
    stage: h.stepName
  }));

  // Map Budget Items
  const budgetItems: BudgetItem[] = (apiData.budgetItems || []).map((b: any, idx: number) => ({
    id: `bi-${idx}`,
    materialId: '0',
    materialCode: '', 
    materialDescription: b.materialName,
    uom: b.uomName || 'EA',
    qty: b.qty,
    estimatedPrice: b.price,
    totalPrice: b.qty * b.price,
    currency: 'USD'
  }));

  return {
    id: apiData.proposalID.toString(),
    proposalNo: apiData.proposalNo,
    title: apiData.title,
    status: apiData.status as ProposalStatus,
    amount: apiData.amount,
    
    // Object Mapping
    jobsite: jobsiteObj,
    department: deptObj,
    
    // Workflow Info (Dari SP Baru)
    currentStepName: apiData.currentStepName,
    requiredRoleName: apiData.requiredRoleName,

    // Detail
    description: apiData.description,
    scopeOfWork: apiData.scopeOfWork,
    analysis: apiData.analysis,
    
    creator: apiData.createdBy,
    creatorId: '0', // TODO: Minta BE return CreatorID di SP jika butuh
    createdDate: apiData.createdAt,
    
    // Sourcing
    vendorConfirmationStatus: apiData.vendorConfirmationStatus,
    vendorsConfirmedBy: apiData.vendorsConfirmedBy,
    vendorsConfirmedDate: apiData.vendorsConfirmedDate,

    // Arrays
    budgetItems: budgetItems,
    history: history,
    torItems: [], // Detail Requirements biasanya diambil via GetById, bukan List
    terItems: [],
    
    // Default/Placeholder untuk field wajib lainnya
    category: '', 
    classification: '', 
    subClassification: '',
    tor: '',
    ter: '',
    vendorList: [],
    contractType: 'Non-Contractual'
  };
};


// --- 2. API CALLS ---

// GET MY PROPOSALS
export async function fetchMyProposals(userId: string): Promise<Proposal[]> {
  try {
    const response = await fetch(`${API_BASE}/Proposal/MyProposals?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch proposals');
    const data = await response.json();
    return data.map(mapApiToProposal);
  } catch (error) {
    console.error(error);
    toast.error('Gagal mengambil data proposal');
    return [];
  }
}

// GET MY APPROVALS (Logic Baru: Cukup UserID)
export async function fetchMyApprovals(userId: string): Promise<Proposal[]> {
  try {
    // Tidak perlu kirim RoleName/JobsiteID lagi, DB yang cek Permission
    const response = await fetch(`${API_BASE}/Proposal/MyApprovals?userId=${userId}`);
    
    if (!response.ok) throw new Error('Failed to fetch approvals');
    
    const data = await response.json();
    return data.map(mapApiToProposal);
  } catch (error) {
    console.error(error);
    return [];
  }
}

// CREATE PROPOSAL
export async function createProposalApi(
  proposal: Partial<Proposal>,
  user: { userId: string; username: string; jobsiteId?: string; departmentId?: string }
): Promise<string> {
  try {
    // Construct Payload sesuai DTO C#
    // Pastikan ID dikirim sebagai Integer
    const payload = {
      userId: parseInt(user.userId),
      userName: user.username,
      
      proposalNo: proposal.proposalNo,
      title: proposal.title,
      
      // ID Master Data (Harus ada di form state)
      categoryID: 1, // TODO: Ambil dari state form
      classificationID: 1,
      subClassificationID: 1,
      jobsiteID: user.jobsiteId ? parseInt(user.jobsiteId) : 1,
      departmentID: user.departmentId ? parseInt(user.departmentId) : 1,
      
      amount: proposal.amount,
      description: proposal.description,
      scopeOfWork: proposal.scopeOfWork,
      analysis: proposal.analysis,
      
      fundingSourceID: 1, // TODO: Ambil real ID
      contractTypeID: 1, 
      
      budgetItems: (proposal.budgetItems || []).map(b => ({
        materialName: b.materialDescription,
        qty: b.qty,
        estimatedPrice: b.estimatedPrice,
        uomID: 1 // TODO: Mapping real UOM ID
      })),
      
      requirements: [] // Tambahkan mapping TOR/TER jika form sudah support
    };

    const response = await fetch(`${API_BASE}/Proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.Message || 'Create failed');
    
    return data.Id?.toString() || "0";
  } catch (error: any) {
    console.error('Create Proposal Error:', error);
    toast.error(error.message);
    throw error;
  }
}

// APPROVE / REJECT
export async function approveProposalApi(
  proposalId: string,
  action: 'Approve' | 'Reject',
  comment: string,
  user: { userId: string; username: string }
): Promise<void> {
  try {
    const payload = {
      userId: parseInt(user.userId),
      userName: user.username,
      proposalID: parseInt(proposalId),
      action: action,
      comment: comment
    };

    const response = await fetch(`${API_BASE}/Proposal/Approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.Message || 'Approval failed');
    }
  } catch (error: any) {
    console.error(error);
    throw error;
  }
}

// GET DETAIL
export async function fetchProposalDetail(id: string): Promise<Proposal | null> {
  try {
    const response = await fetch(`${API_BASE}/Proposal/${id}`);
    if (!response.ok) throw new Error('Failed to fetch detail');
    const data = await response.json();
    return mapApiToProposal(data);
  } catch (error) {
    console.error(error);
    return null;
  }
}

// GET SOURCING DOCUMENTS
export async function fetchSourcingDocuments(userId: string, roleName: string, jobsiteId: string): Promise<Proposal[]> {
    // ... Implementasi sama seperti sebelumnya jika controller sudah support
    // Untuk sekarang return array kosong dulu agar tidak error
    return []; 
}

// 8. GET DASHBOARD DATA
export async function fetchDashboardProposals(
  userId: string,
  roleName: string,   // Parameter ini optional sekarang karena logic di DB
  jobsiteId: string,  // Parameter ini optional sekarang karena logic di DB
  deptId: string      // Parameter ini optional sekarang karena logic di DB
): Promise<Proposal[]> {
  try {
    // Kita kirim semua parameter untuk jaga-jaga jika nanti logic backend butuh
    // Tapi SP utama hanya pakai userId
    const params = new URLSearchParams({
      userId: userId,
      roleName: roleName || '',
      jobsiteId: jobsiteId || '0',
      deptId: deptId || '0'
    });

    const response = await fetch(`${API_BASE}/Proposal/Dashboard?${params}`);
    
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    
    const data = await response.json();
    // Reuse mapper yang sama
    return data.map(mapApiToProposal);
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return [];
  }
}

export async function updateVendorStatusApi(
  proposalId: string,
  status: string,
  user: { userId: string; username: string }
): Promise<void> {
  try {
    const payload = {
      // Pastikan userId dikirim sebagai integer sesuai Backend
      userId: parseInt(user.userId),
      userName: user.username,
      
      // Data Transaksi
      proposalID: parseInt(proposalId),
      vendorConfirmationStatus: status
    };

    // Endpoint ini mengarah ke ProposalController -> UpdateVendorStatus
    const response = await fetch(`${API_BASE}/Proposal/${proposalId}/VendorStatus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.Message || 'Gagal mengupdate status vendor');
    }
  } catch (error: any) {
    console.error('Update Vendor Status Error:', error);
    throw error;
  }
}