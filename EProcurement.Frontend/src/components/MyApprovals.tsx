import { useState, useMemo, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown, FileText, Shield, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { User, Proposal, ProposalStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { AdminApprovalActions } from './AdminApprovalActions';
import { ProposalDetailsView } from './ProposalDetailsView';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { formatDate, parseDate } from '../utils/formatters';
import { getNextApprovalStep, isWorkflowComplete } from '../utils/approvalHelper';

type SortField = 'proposalNo' | 'title' | 'creator' | 'jobsite' | 'amount' | 'createdDate';
type SortDirection = 'asc' | 'desc' | null;

interface MyApprovalsProps {
  user: User;
  proposals: Proposal[];
  onUpdateProposal: (proposalId: string, updates: Partial<Proposal>) => void;
}

export function MyApprovals({ user, proposals, onUpdateProposal }: MyApprovalsProps) {
  console.log('🔄 [MY APPROVALS RENDER] Component rendering');
  console.log('🔄 [MY APPROVALS RENDER] User:', user.name, user.roleName);
  console.log('🔄 [MY APPROVALS RENDER] Proposals count:', proposals.length);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [actionProposal, setActionProposal] = useState<Proposal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);

  const isAdmin = user.roleName === 'Administrator';

  // Get approval stage based on user role
  const getApprovalStage = (role: string): ProposalStatus | 'all' | null => {
    // Administrator super power - can see and approve ALL proposals at any stage
    if (role === 'Administrator') return 'all';
    
    // For other roles, check if they can approve based on role name patterns
    if (role.includes('Unit Head') || 
        role.includes('Section Head') || 
        role.includes('Department Head') ||
        role.includes('Manager') ||
        role.includes('Division Head') ||
        role.includes('Director') ||
        role.includes('Chief Operation') ||
        role === 'President Director') {
      return 'all'; // All approver roles can see pending approvals
    }
    
    // Sourcing team roles
    if (role === 'Sourcing Department Head') return 'On Sourcing Approval';
    if (role === 'Procurement Division Head') return 'On Procurement Approval';
    
    return null;
  };

  // Get next status after approval - uses dynamic approval matrix
  const getNextStatus = (proposal: Proposal): ProposalStatus => {
    // Check if workflow is complete
    if (isWorkflowComplete(proposal)) {
      return 'Approved';
    }
    
    // Get next step from approval matrix
    const nextStep = getNextApprovalStep(proposal);
    
    if (nextStep) {
      return nextStep.status as ProposalStatus;
    }
    
    // Fallback to approved if no next step
    return 'Approved';
  };

  // Get stage name for history
  const getStageName = (status: ProposalStatus): string => {
    return status.replace('On ', '');
  };

  // Get required approver role based on proposal status
  // Helper function to get Chief Operation entity from procurement jobsite
  const getChiefOperationEntity = (procurementJobsite: string): string | null => {
    if (procurementJobsite.startsWith('ADMO')) {
      return 'ADMO'; // ADMO MINING or ADMO HAULING → Chief Operation ADMO
    }
    if (procurementJobsite.startsWith('MACO')) {
      return 'MACO'; // MACO MINING or MACO HAULING → Chief Operation MACO
    }
    if (procurementJobsite === 'SERA') {
      return 'SERA'; // SERA → Chief Operation SERA
    }
    // JAHO and NARO don't have Chief Operation
    return null;
  };

  // IMPORTANT: Uses CREATOR's jobsite and department for approval routing
  // EXCEPTION: Chief Operation uses PROCUREMENT jobsite with entity mapping
  const getRequiredApproverRole = (proposal: Proposal): string | null => {
    const status = proposal.status;
    // Use creator's department and jobsite if available, fallback to proposal's
    const dept = proposal.creatorDepartment || proposal.department;
    const creatorSite = proposal.creatorJobsite || proposal.jobsite;
    const procurementSite = proposal.jobsite; // Procurement jobsite
    
    // Map status to required role with department and jobsite context
    switch (status) {
      case 'On Unit Head Approval':
      case 'On Verification':
        return `Unit Head ${dept} Department ${creatorSite}`;
      case 'On Section Head Approval':
      case 'On Review 1':
        return `Section Head ${dept} Department ${creatorSite}`;
      case 'On Department Head Approval':
      case 'On Review 2':
        return `Department Head ${dept} Department ${creatorSite}`;
      case 'On Manager Approval':
      case 'On Approval 1':
        return `Manager ${dept} Department ${creatorSite}`;
      case 'On Division Head Approval':
      case 'On Approval 2':
        return `${dept} Division Head`;
      case 'On Director Approval':
        return `${dept} Director`;
      case 'On Chief Operation Approval':
        // EXCEPTION: Chief Operation uses procurement jobsite with entity mapping
        // ADMO MINING/HAULING → Chief Operation ADMO
        // MACO MINING/HAULING → Chief Operation MACO
        // SERA → Chief Operation SERA
        const entity = getChiefOperationEntity(procurementSite);
        if (!entity) {
          // No Chief Operation for this jobsite (JAHO, NARO)
          return null;
        }
        return `Chief Operation ${entity}`;
      case 'On Sourcing Approval':
        return 'Sourcing Department Head';
      case 'On Procurement Approval':
        return 'Procurement Division Head';
      case 'On President Director Approval':
        return 'President Director';
      default:
        return null;
    }
  };

  // Check if user can approve this specific proposal
  const canUserApproveProposal = (proposal: Proposal): boolean => {
    console.log(`\n🔍 [CAN APPROVE START] =================================`);
    console.log(`🔍 [CAN APPROVE START] Checking proposal ${proposal.proposalNo}`);
    console.log(`🔍 [CAN APPROVE START] Proposal ID: ${proposal.id}`);
    console.log(`🔍 [CAN APPROVE START] Status: ${proposal.status}`);
    console.log(`🔍 [CAN APPROVE START] User: ${user.name} | Role: ${user.roleName}`);
    
    // Admin can approve everything
    if (isAdmin) {
      console.log(`✅ [CAN APPROVE] ${proposal.proposalNo} - Admin can approve all`);
      return true;
    }
    
    // Check if proposal is in a status that can be approved
    if (proposal.status === 'Draft' || proposal.status === 'Approved' || proposal.status === 'Rejected') {
      console.log(`❌ [CAN APPROVE] ${proposal.proposalNo} - Status is ${proposal.status}, cannot approve`);
      return false;
    }
    
    // Try to get from history first (preferred if pending entry exists)
    let requiredRole = null;
    const currentPendingEntry = proposal.history.find(h => h.action === 'Pending');
    if (currentPendingEntry && currentPendingEntry.roleName) {
      requiredRole = currentPendingEntry.roleName.toString();
      console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Required role from pending entry:`, requiredRole);
    } else {
      // Fall back to deriving from status
      requiredRole = getRequiredApproverRole(proposal);
      console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Required role from status (${proposal.status}):`, requiredRole);
    }
    
    if (!requiredRole) {
      console.log(`❌ [CAN APPROVE] ${proposal.proposalNo} - No required role found`);
      return false;
    }
    
    // Role matching - case insensitive
    const userRoleLower = user.roleName.toLowerCase().trim();
    const requiredRoleLower = requiredRole.toLowerCase().trim();
    
    console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - User role: "${userRoleLower}" | Required: "${requiredRoleLower}"`);
    
    // Check if roles match
    const roleMatches = userRoleLower === requiredRoleLower;
    
    if (!roleMatches) {
      console.log(`❌ [CAN APPROVE] ${proposal.proposalNo} - Role mismatch`);
      return false;
    }
    
    console.log(`✅ [CAN APPROVE] ${proposal.proposalNo} - Role matches!`);
    
    // IMPORTANT: Use CREATOR's jobsite and department for approval routing
    // EXCEPTION: Chief Operation uses PROCUREMENT jobsite
    const isChiefOperation = userRoleLower.includes('chief operation');
    const proposalJobsite = isChiefOperation 
      ? proposal.jobsite // Use procurement jobsite for Chief Operation
      : (proposal.creatorJobsite || proposal.jobsite); // Use creator's jobsite for others
    const proposalDepartment = proposal.creatorDepartment || proposal.department;
    
    console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Jobsite check: User="${user.jobsite}" | Proposal="${proposalJobsite}"`);
    console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Dept check: User="${user.department}" | Proposal="${proposalDepartment}"`);
    
    // For site-specific roles (with jobsite and department), also check context
    if (user.jobsite && user.department) {
      const canApprove = proposalJobsite === user.jobsite && proposalDepartment === user.department;
      console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Site-specific role check: ${canApprove}`);
      return canApprove;
    }
    
    // For Chief Operation (jobsite but no department), only check jobsite
    if (user.jobsite && !user.department && isChiefOperation) {
      const canApprove = proposalJobsite === user.jobsite;
      console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Chief Operation check: ${canApprove}`);
      return canApprove;
    }
    
    // For division/director level roles (no specific jobsite), only check department
    if (user.department && !user.jobsite) {
      const canApprove = proposalDepartment === user.department;
      console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Division/Director check: ${canApprove}`);
      return canApprove;
    }
    
    // For top-level roles (President Director, Sourcing/Procurement heads), no restriction
    console.log(`🔍 [CAN APPROVE] ${proposal.proposalNo} - Top-level role: TRUE`);
    return true;
  };

  // Filter proposals pending user's approval
  const pendingApprovals = useMemo(() => {
    const stage = getApprovalStage(user.roleName);
    if (!stage) return [];
    
    // Admin can see all pending proposals (not Draft, not Approved, not Rejected)
    if (stage === 'all' && isAdmin) {
      return proposals.filter(p => 
        p.status !== 'Draft' && 
        p.status !== 'Approved' && 
        p.status !== 'Rejected'
      );
    }
    
    // For non-admin users, filter by role, jobsite, and department
    // Only show proposals where they are the CURRENT approver
    return proposals.filter(p => {
      // Must not be draft, approved, or rejected
      if (p.status === 'Draft' || p.status === 'Approved' || p.status === 'Rejected') {
        return false;
      }
      
      // Must be able to approve this specific proposal
      return canUserApproveProposal(p);
    });
  }, [user.roleName, user.jobsite, user.department, proposals, isAdmin]);

  // Get unique creators for filter
  const uniqueCreators = useMemo(() => {
    const creators = [...new Set(pendingApprovals.map(p => p.creator))];
    return creators.sort();
  }, [pendingApprovals]);

  // DEBUG: Log when proposals change
  useEffect(() => {
    console.log('\n🔄 [PROPOSALS UPDATED] =================================');
    console.log('🔄 [PROPOSALS UPDATED] Total proposals:', proposals.length);
    console.log('🔄 [PROPOSALS UPDATED] Proposals array reference changed');
    const pending = proposals.filter(p => p.status !== 'Draft' && p.status !== 'Approved' && p.status !== 'Rejected');
    console.log('🔄 [PROPOSALS UPDATED] Pending proposals:', pending.map(p => `${p.proposalNo} (${p.status})`));
  }, [proposals]);

  // DEBUG: Log when filtered approvals change
  useEffect(() => {
    console.log('\n🔄 [FILTERED UPDATED] =================================');
    console.log('🔄 [FILTERED UPDATED] Pending approvals count:', pendingApprovals.length);
    console.log('🔄 [FILTERED UPDATED] Proposals:', pendingApprovals.map(p => `${p.proposalNo} (${p.status})`));
  }, [pendingApprovals]);

  // DEBUG: Log when actionProposal changes
  useEffect(() => {
    if (actionProposal) {
      console.log('\n🎯 [ACTION PROPOSAL CHANGED] =================================');
      console.log('🎯 [ACTION PROPOSAL] Proposal:', actionProposal.proposalNo);
      console.log('🎯 [ACTION PROPOSAL] ID:', actionProposal.id);
      console.log('🎯 [ACTION PROPOSAL] Status:', actionProposal.status);
      console.log('🎯 [ACTION PROPOSAL] Action Type:', actionType);
    }
  }, [actionProposal, actionType]);
  
  // DEBUG: Log when selectedProposal changes
  useEffect(() => {
    if (selectedProposal) {
      console.log('\n📄 [SELECTED PROPOSAL CHANGED] =================================');
      console.log('📄 [SELECTED PROPOSAL] Proposal:', selectedProposal.proposalNo);
      console.log('📄 [SELECTED PROPOSAL] ID:', selectedProposal.id);
      console.log('📄 [SELECTED PROPOSAL] Status:', selectedProposal.status);
    } else {
      console.log('\n📄 [SELECTED PROPOSAL CLEARED] =================================');
    }
  }, [selectedProposal]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 inline" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3 ml-1 inline" />;
    }
    return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  // Search filter and sort
  const filteredApprovals = useMemo(() => {
    let filtered = pendingApprovals.filter(p => {
      const matchesSearch = p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCreator = filterCreator === 'all' || p.creator === filterCreator;
      
      return matchesSearch && matchesCreator;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'createdDate') {
          aVal = parseDate(a.createdDate).getTime();
          bVal = parseDate(b.createdDate).getTime();
        }

        if (sortField === 'amount') {
          aVal = a.amount;
          bVal = b.amount;
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [pendingApprovals, searchTerm, filterCreator, sortField, sortDirection]);

  const handleApprovalAction = (proposal: Proposal, action: 'approve' | 'reject') => {
    console.log('\n✅ [APPROVAL ACTION] =================================');
    console.log('✅ [APPROVAL ACTION] handleApprovalAction called');
    console.log('✅ [APPROVAL ACTION] Proposal:', proposal?.proposalNo);
    console.log('✅ [APPROVAL ACTION] Proposal ID:', proposal?.id);
    console.log('✅ [APPROVAL ACTION] Proposal Status:', proposal?.status);
    console.log('✅ [APPROVAL ACTION] Action:', action);
    console.log('✅ [APPROVAL ACTION] Setting actionProposal state...');
    setActionProposal(proposal);
    setActionType(action);
    setComment('');
  };

  const confirmAction = () => {
    console.log('🎯 [CONFIRM ACTION] confirmAction called');
    console.log('🎯 [CONFIRM ACTION] Action Proposal:', actionProposal?.proposalNo);
    console.log('🎯 [CONFIRM ACTION] Action Type:', actionType);
    
    if (!actionProposal) {
      console.log('❌ [CONFIRM ACTION] No action proposal - exiting');
      return;
    }
    
    // Safety check: Don't allow approval/rejection of already approved or rejected proposals
    if (actionProposal.status === 'Approved') {
      console.log('❌ [CONFIRM ACTION] Already approved - showing error');
      toast.error('This proposal has already been approved');
      // Clear all states
      setActionProposal(null);
      setActionType(null);
      setComment('');
      setSelectedProposal(null);
      return;
    }
    
    if (actionProposal.status === 'Rejected') {
      console.log('❌ [CONFIRM ACTION] Already rejected - showing error');
      toast.error('This proposal has already been rejected');
      // Clear all states
      setActionProposal(null);
      setActionType(null);
      setComment('');
      setSelectedProposal(null);
      return;
    }
    
    if (actionType === 'reject' && !comment.trim()) {
      console.log('❌ [CONFIRM ACTION] Rejection requires comment - showing error');
      toast.error('Please provide a comment for rejection');
      return;
    }
    
    console.log('✅ [CONFIRM ACTION] All validations passed, proceeding with action:', actionType);
    console.log('📊 [APPROVAL DEBUG] Current User:', user.name, '| Role:', user.roleName);
    console.log('📊 [APPROVAL DEBUG] Proposal:', actionProposal.proposalNo, '| Current Status:', actionProposal.status);
    console.log('📊 [APPROVAL DEBUG] Creator Jobsite:', actionProposal.creatorJobsite, '| Creator Dept:', actionProposal.creatorDepartment);

    if (actionType === 'approve') {
      // CRITICAL FIX: Update history FIRST, then calculate next status
      // This ensures getNextApprovalStep counts the current approval
      
      // Step 1: Create approval entry
      const newHistoryEntry = {
        id: `h${Date.now()}`,
        stage: getStageName(actionProposal.status),
        approver: user.name,
        role: user.roleName,
        action: 'Approved' as const,
        date: new Date().toISOString(),
        comment: comment.trim() || undefined,
      };
      console.log('📝 [HISTORY] New approval entry:', newHistoryEntry);

      // Step 2: Remove ALL pending entries (clean slate), then add approval entry
      const filteredHistory = actionProposal.history.filter(
        h => h.action !== 'Pending'
      );
      console.log('🗑️  [HISTORY] Removed pending entries. Count before:', actionProposal.history.length, 'After:', filteredHistory.length);
      
      const updatedHistory = [...filteredHistory, newHistoryEntry];
      console.log('➕ [HISTORY] Added approval entry. Total count:', updatedHistory.length);
      
      // Step 3: Create TEMPORARY updated proposal for next step calculation
      // This ensures getNextApprovalStep has the CURRENT approval in history
      const proposalWithNewApproval = {
        ...actionProposal,
        history: updatedHistory
      };
      
      // Step 4: NOW calculate next status with UPDATED history
      const nextStatus = getNextStatus(proposalWithNewApproval);
      console.log('🔄 [NEXT STATUS] Calculated next status:', nextStatus);
      
      // Step 5: If not final approval, add next pending entry
      if (nextStatus !== 'Approved') {
        const nextStep = getNextApprovalStep(proposalWithNewApproval);
        console.log('⏭️  [NEXT STEP] Next approval step:', nextStep);
        
        if (nextStep) {
          const nextPendingEntry = {
            id: `h${Date.now() + 1}`,
            stage: getStageName(nextStatus),
            approver: '',
            role: nextStep.roleName,
            action: 'Pending' as const,
          };
          updatedHistory.push(nextPendingEntry);
          console.log('📝 [HISTORY] Added next pending entry:', nextPendingEntry);
          console.log('📊 [HISTORY] Final history length:', updatedHistory.length);
        }
      } else {
        console.log('✅ [FINAL] This is the final approval - no next step');
      }

      // Update proposal
      const updates = {
        status: nextStatus,
        currentApprover: nextStatus === 'Approved' ? undefined : '',
        history: updatedHistory,
      };
      console.log('💾 [UPDATE] Updating proposal with:', updates);
      console.log('💾 [UPDATE] Proposal ID:', actionProposal.id);
      console.log('💾 [UPDATE] Calling onUpdateProposal...');
      
      onUpdateProposal(actionProposal.id, updates);
      
      console.log('✅ [UPDATE] onUpdateProposal called successfully');
      console.log('✅ [UPDATE] Proposal should now be updated in parent state');

      toast.success('Proposal approved successfully!', {
        description: `Proposal ${actionProposal.proposalNo} moved to ${nextStatus}`,
      });
      
      console.log('✅ [COMPLETE] Approval completed. Closing all dialogs and clearing states...');
      
    } else if (actionType === 'reject') {
      // Update history with rejection
      const newHistoryEntry = {
        id: `h${Date.now()}`,
        stage: getStageName(actionProposal.status),
        approver: user.name,
        role: user.roleName,
        action: 'Rejected' as const,
        date: new Date().toISOString(),
        comment: comment.trim(),
      };

      // Update proposal
      console.log('💾 [UPDATE] Updating proposal with rejection');
      console.log('💾 [UPDATE] Proposal ID:', actionProposal.id);
      console.log('💾 [UPDATE] Calling onUpdateProposal...');
      
      onUpdateProposal(actionProposal.id, {
        status: 'Rejected',
        history: [...actionProposal.history, newHistoryEntry],
      });
      
      console.log('✅ [UPDATE] onUpdateProposal called successfully');
      console.log('✅ [UPDATE] Proposal should now be rejected in parent state');

      toast.error('Proposal rejected', {
        description: `Proposal ${actionProposal.proposalNo} has been rejected`,
      });
      
      console.log('✅ [COMPLETE] Rejection completed. Closing all dialogs and clearing states...');
    }
    
    // CRITICAL FIX: Close ALL dialogs and clear ALL states after approval/rejection
    // This ensures proposal is removed from pending list and user doesn't see it anymore
    setSelectedProposal(null); // Close detail dialog
    setActionProposal(null);    // Clear action proposal
    setActionType(null);         // Clear action type  
    setComment('');              // Clear comment
    
    console.log('🔒 [CLEANUP] All dialogs closed and states cleared');
  };

  // Handle admin approval
  const handleApprove = (proposal: Proposal, role: string, comments: string) => {
    // Safety check: Don't allow approval of already approved proposals
    if (proposal.status === 'Approved') {
      toast.error('This proposal has already been approved');
      return;
    }
    
    if (proposal.status === 'Rejected') {
      toast.error('This proposal has already been rejected');
      return;
    }
    
    // CRITICAL FIX: Update history FIRST, then calculate next status
    // Step 1: Create approval entry
    const newHistoryEntry = {
      id: `h${Date.now()}`,
      stage: getStageName(proposal.status),
      approver: `${user.name} (as ${role})`,
      role: role as any,
      action: 'Approved' as const,
      date: new Date().toISOString(),
      comment: comments.trim() || undefined,
    };

    // Step 2: Remove ALL pending entries (clean slate), then add approval entry
    const filteredHistory = proposal.history.filter(
      h => h.action !== 'Pending'
    );
    const updatedHistory = [...filteredHistory, newHistoryEntry];
    
    // Step 3: Create TEMPORARY updated proposal for next step calculation
    const proposalWithNewApproval = {
      ...proposal,
      history: updatedHistory
    };
    
    // Step 4: NOW calculate next status with UPDATED history
    const nextStatus = getNextStatus(proposalWithNewApproval);
    
    // Step 5: If not final approval, add next pending entry
    if (nextStatus !== 'Approved') {
      const nextStep = getNextApprovalStep(proposalWithNewApproval);
      if (nextStep) {
        updatedHistory.push({
          id: `h${Date.now() + 1}`,
          stage: getStageName(nextStatus),
          approver: '',
          role: nextStep.roleName,
          action: 'Pending' as const,
        });
      }
    }

    // Update proposal
    onUpdateProposal(proposal.id, {
      status: nextStatus,
      currentApprover: nextStatus === 'Approved' ? undefined : '',
      history: updatedHistory,
    });

    toast.success(`Approved as ${role}`, {
      description: `Proposal ${proposal.proposalNo} moved to ${nextStatus}`,
    });
  };

  // Handle admin rejection
  const handleReject = (proposal: Proposal, role: string, comments: string) => {
    // Safety check: Don't allow rejection of already approved or rejected proposals
    if (proposal.status === 'Approved') {
      toast.error('Cannot reject an already approved proposal');
      return;
    }
    
    if (proposal.status === 'Rejected') {
      toast.error('This proposal has already been rejected');
      return;
    }
    
    // Update history with rejection
    const newHistoryEntry = {
      id: `h${Date.now()}`,
      stage: getStageName(proposal.status),
      approver: `${user.name} (as ${role})`,
      role: role as any,
      action: 'Rejected' as const,
      date: new Date().toISOString(),
      comment: comments.trim(),
    };

    // Update proposal
    onUpdateProposal(proposal.id, {
      status: 'Rejected',
      history: [...proposal.history, newHistoryEntry],
    });

    toast.error(`Rejected as ${role}`, {
      description: `Proposal ${proposal.proposalNo} has been rejected`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">My Approvals</h1>
        <p className="text-gray-600">Review and approve pending proposals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Pending Approvals</p>
          <p className="text-2xl" style={{ color: '#FFC107', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{pendingApprovals.length}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>My Role</p>
          <p style={{ fontSize: '18px', color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', marginTop: '4px' }}>{user.roleName}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>My Scope</p>
          <p style={{ fontSize: '16px', color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', marginTop: '4px' }}>
            {user.department && user.jobsite ? `${user.department} - ${user.jobsite}` :
             user.department ? `${user.department} (All Sites)` :
             user.jobsite ? `${user.jobsite} (All Depts)` :
             'All Departments & Sites'}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Approval Stage</p>
          <p style={{ fontSize: '16px', color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', marginTop: '4px' }}>
            {isAdmin ? 'All Stages' : getApprovalStage(user.roleName)?.replace('On ', '')}
          </p>
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse mt-1.5"></div>
            <div>
              <h4 className="text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">ADMIN</span>
                Super User Access - All Pending Proposals
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                You have full access to <strong>all pending approvals</strong> across all departments, jobsites, and approval stages. You can approve or reject proposals at any stage on behalf of any role.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Non-Admin Notice */}
      {!isAdmin && pendingApprovals.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
            <div>
              <h4 className="text-sm text-gray-900">
                Outstanding Approvals for {user.roleName}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Showing only proposals pending your approval
                {user.department && user.jobsite && ` in ${user.department} - ${user.jobsite}`}
                {user.department && !user.jobsite && ` in ${user.department} department`}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger>
                <SelectValue placeholder="All Creators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {uniqueCreators.map(creator => (
                  <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('proposalNo')}
                >
                  Proposal No {getSortIcon('proposalNo')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('title')}
                >
                  Title {getSortIcon('title')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('creator')}
                >
                  Creator {getSortIcon('creator')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('jobsite')}
                >
                  Jobsite {getSortIcon('jobsite')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('amount')}
                >
                  Amount {getSortIcon('amount')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('createdDate')}
                >
                  Created Date {getSortIcon('createdDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Status</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">No pending approvals for your role</p>
                      {!isAdmin && (
                        <p className="text-sm">
                          You will see proposals here when they reach your approval stage ({user.roleName})
                          {user.jobsite && user.department && ` for ${user.department} - ${user.jobsite}`}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((proposal) => {
                  const canApprove = canUserApproveProposal(proposal);
                  
                  return (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proposal.proposalNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{proposal.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.creator}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.jobsite}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Math.round(proposal.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(proposal.createdDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={proposal.status} proposal={proposal} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {canApprove ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprovalAction(proposal, 'approve')}
                              style={{ backgroundColor: '#28A745', color: 'white' }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApprovalAction(proposal, 'reject')}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not your turn
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Details Dialog - 3-TAB LAYOUT */}
      <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              Review proposal information and take approval action
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <ProposalDetailsView
              proposal={selectedProposal}
              user={user}
              onApprove={(proposal, comment) => {
                handleApprovalAction(proposal, 'approve');
                setComment(comment);
              }}
              onReject={(proposal, comment) => {
                handleApprovalAction(proposal, 'reject');
                setComment(comment);
              }}
              onClose={() => setSelectedProposal(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Action Dialog */}
      <AlertDialog open={!!actionProposal} onOpenChange={() => setActionProposal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Proposal' : 'Reject Proposal'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this proposal? This will move it to the next stage.'
                : 'Please provide a reason for rejecting this proposal.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Textarea
              placeholder={actionType === 'approve' ? 'Add comment (optional)...' : 'Enter rejection reason (required)...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className={actionType === 'reject' ? 'border-red-300' : ''}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setActionProposal(null);
              setComment('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper function
function getStageName(status: ProposalStatus): string {
  switch (status) {
    case 'Draft':
      return 'Draft';
    case 'Pending Department Head':
      return 'Department Head Review';
    case 'Pending General Manager':
      return 'General Manager Review';
    case 'Pending Chief of Operation':
      return 'Chief of Operation Review';
    case 'Pending CEO':
      return 'CEO Review';
    case 'Pending Planner':
      return 'Planner Review';
    case 'Pending Buyer':
      return 'Buyer Review';
    case 'Vendor Selection':
      return 'Vendor Selection';
    case 'Approved':
      return 'Approved';
    case 'Rejected':
      return 'Rejected';
    default:
      return status;
  }
}
