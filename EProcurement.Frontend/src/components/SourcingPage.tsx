import { useState, useMemo, useRef } from 'react';
import { Search, Eye, CheckCircle, Clock, XCircle, AlertCircle, Send, UserCheck, Users2, ArrowUpDown, ArrowUp, ArrowDown, History, PackagePlus, Trash2, Plus, Upload, FileText, X as XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User, VendorRecommendation, VendorRecommendationStatus, Proposal, AddedVendorDetail } from '../types';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { formatDate } from '../utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getVendorsBySubClassification, getVendorsBySubClassificationName } from '../data/vendorDatabase';

type SortField = 'proposalNo' | 'proposalTitle' | 'requestedByName' | 'jobsite' | 'department' | 'estimatedCost' | 'requestDate';
type SortDirection = 'asc' | 'desc' | null;

interface SourcingPageProps {
  user: User;
  vendorRecommendations: VendorRecommendation[];
  onUpdateVendorRecommendation: (vendorReqId: string, updates: Partial<VendorRecommendation>) => void;
  onUpdateProposal: (proposalId: string, updates: Partial<Proposal>) => void;
  proposals: Proposal[];
}

export function SourcingPage({ user, vendorRecommendations, onUpdateVendorRecommendation, onUpdateProposal, proposals }: SourcingPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<VendorRecommendation | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Action states
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'start' | 'submit-approval' | 'approve' | 'reject' | 'review' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [addedVendorsList, setAddedVendorsList] = useState('');
  
  // Enhanced vendor input with full details (updated fields: contactPerson instead of address/npwp/status)
  const [vendorInputMode, setVendorInputMode] = useState<'simple' | 'detailed'>('detailed');
  const [vendorDetails, setVendorDetails] = useState<AddedVendorDetail[]>([
    { vendorName: '', contactPerson: '', phoneNumber: '', email: '' }
  ]);
  const [recommendedVendors, setRecommendedVendors] = useState<AddedVendorDetail[]>([]);
  
  // Supporting Documents Upload
  const [supportingDocuments, setSupportingDocuments] = useState<Array<{ name: string; size: number; type: string; uploadDate: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isApprover = user.roleName === 'Sourcing Department Head' || user.roleName === 'Procurement Division Head';
  const isReviewer = user.roleName === 'Planner' || user.roleName === 'Buyer';
  const isSourcingTeam = user.roleName === 'Sourcing' || user.roleName === 'Buyer' || user.roleName === 'Planner';

  // Vendor table functions
  const addVendorRow = () => {
    setVendorDetails([...vendorDetails, { vendorName: '', contactPerson: '', phoneNumber: '', email: '' }]);
  };

  const removeVendorRow = (index: number) => {
    if (vendorDetails.length > 1) {
      setVendorDetails(vendorDetails.filter((_, i) => i !== index));
    }
  };

  const updateVendorDetail = (index: number, field: keyof AddedVendorDetail, value: string) => {
    const updated = [...vendorDetails];
    updated[index] = { ...updated[index], [field]: value };
    setVendorDetails(updated);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`, {
          description: 'Only PDF, DOCX, and XLSX files are allowed'
        });
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`, {
          description: 'Maximum file size is 10MB'
        });
        continue;
      }

      // Check for duplicate
      if (supportingDocuments.some(doc => doc.name === file.name)) {
        toast.error(`Duplicate file: ${file.name}`);
        continue;
      }

      // Add to list
      setSupportingDocuments(prev => [...prev, {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      }]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (index: number) => {
    setSupportingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  // Fetch recommended vendors from database based on sub-classification CODE
  const fetchRecommendedVendors = (subClassificationCode: string) => {
   // console.log('🔍 [fetchRecommendedVendors] Fetching by CODE:', subClassificationCode);
    const vendors = getVendorsBySubClassification(subClassificationCode);
   // console.log('✅ [fetchRecommendedVendors] Found vendors:', vendors.length);
    const formattedVendors: AddedVendorDetail[] = vendors.map(v => ({
      vendorName: v.vendorName,
      contactPerson: v.contactPerson || '',
      phoneNumber: v.phoneNumber || '',
      email: v.email || ''
    }));
    setRecommendedVendors(formattedVendors);
  };
  
  // Fetch recommended vendors from database based on sub-classification NAME (fallback)
  const fetchRecommendedVendorsByName = (subClassificationName: string) => {
   // console.log('🔍 [fetchRecommendedVendorsByName] Fetching by NAME:', subClassificationName);
    const vendors = getVendorsBySubClassificationName(subClassificationName);
   // console.log('✅ [fetchRecommendedVendorsByName] Found vendors:', vendors.length);
    const formattedVendors: AddedVendorDetail[] = vendors.map(v => ({
      vendorName: v.vendorName,
      contactPerson: v.contactPerson || '',
      phoneNumber: v.phoneNumber || '',
      email: v.email || ''
    }));
    setRecommendedVendors(formattedVendors);
  };

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

  // Filter recommendations based on user role
  const getRecommendationsForUser = () => {
    if (user.roleName === 'Administrator') {
      return vendorRecommendations;
    }
    
    if (user.roleName === 'Sourcing Department Head') {
      return vendorRecommendations.filter(r => 
        r.status === 'Waiting Dept Head Approval'
      );
    }
    
    if (user.roleName === 'Procurement Division Head') {
      return vendorRecommendations.filter(r => 
        r.status === 'Waiting Division Head Approval'
      );
    }
    
    if (user.roleName === 'Planner') {
      // ✅ PLANNER (HO) - Sees ALL vendor requests from all Buyers
      return vendorRecommendations.filter(r => {
        // ✅ Exclude Completed status
        if (r.status === 'Completed') return false;
        
        // ✅ Exclude if proposal vendorConfirmationStatus is "Confirmed"
        const proposal = proposals.find(p => p.id === r.proposalId);
        if (proposal?.vendorConfirmationStatus === 'Confirmed') return false;
        
        // Planner HO sees ALL requests
        return r.status === 'Under Planner Review' || 
               (r.requestedByRole === 'Planner' && r.status === 'Under Buyer Review');
      });
    }
    
    if (user.roleName === 'Buyer') {
      // ✅ BUYER - Sees requests from their jobsite only
      return vendorRecommendations.filter(r => {
        // ✅ Exclude Completed status
        if (r.status === 'Completed') return false;
        
        // ✅ Exclude if proposal vendorConfirmationStatus is "Confirmed"
        const proposal = proposals.find(p => p.id === r.proposalId);
        if (proposal?.vendorConfirmationStatus === 'Confirmed') return false;
        
        // ✅ Filter by jobsite - Buyer only sees their jobsite
        const creatorJobsite = proposal?.creatorJobsite || proposal?.jobsite;
        const matchesJobsite = creatorJobsite === user.jobsite;
        
        // Show only relevant statuses AND from their jobsite
        return matchesJobsite && (
          r.status === 'Under Buyer Review' ||
          (r.requestedByRole === 'Buyer' && r.status === 'Under Planner Review')
        );
      });
    }
    
    // Sourcing team sees all
    return vendorRecommendations;
  };

  // Search filter and sort
  const filteredRecommendations = useMemo(() => {
    let filtered = getRecommendationsForUser().filter(req => {
      const matchesSearch = req.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.proposalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedByName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'requestDate') {
          aVal = new Date(a.requestDate).getTime();
          bVal = new Date(b.requestDate).getTime();
        }

        if (sortField === 'estimatedCost') {
          aVal = a.estimatedCost;
          bVal = b.estimatedCost;
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
  }, [searchTerm, filterStatus, sortField, sortDirection, user.roleName, vendorRecommendations]);

  const getStatusBadge = (status: VendorRecommendationStatus) => {
    const styles: Record<VendorRecommendationStatus, { bg: string; text: string; icon: any }> = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
      'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'Waiting Dept Head Approval': { bg: 'bg-purple-100', text: 'text-purple-800', icon: UserCheck },
      'Waiting Division Head Approval': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Users2 },
      'Under Planner Review': { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: Eye },
      'Under Buyer Review': { bg: 'bg-teal-100', text: 'text-teal-800', icon: Eye },
      'Revision Required': { bg: 'bg-orange-100', text: 'text-orange-800', icon: History },
      'Accepted': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Revised': { bg: 'bg-orange-100', text: 'text-orange-800', icon: History },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };

    const style = styles[status];
    const Icon = style.icon;

    return (
      <Badge className={`${style.bg} ${style.text} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const handleAction = (type: 'start' | 'submit-approval' | 'approve' | 'reject' | 'review', rec: VendorRecommendation) => {
    setSelectedRecommendation(rec);
    setActionType(type);
    
    // ✅ FIX: Pre-populate sourcing notes when revising
    if (type === 'submit-approval' && rec.sourcingNotes) {
     // console.log('✅ [REVISE] Loading previously entered sourcing notes');
      setActionNotes(rec.sourcingNotes);
    } else {
      setActionNotes('');
    }
    setAddedVendorsList('');
    
    // ✅ FIX: Pre-populate previously added vendors when revising
    if (type === 'submit-approval' && rec.addedVendorsDetails && rec.addedVendorsDetails.length > 0) {
      // Load existing additional vendors + add one empty row for new vendor
     // console.log('✅ [REVISE] Loading previously added vendors:', rec.addedVendorsDetails.length);
      setVendorDetails([
        ...rec.addedVendorsDetails,
        { vendorName: '', contactPerson: '', phoneNumber: '', email: '' } // New empty row
      ]);
    } else {
      // Reset vendor details table (new submission)
      setVendorDetails([{ vendorName: '', contactPerson: '', phoneNumber: '', email: '' }]);
    }
    
    // ✅ FIX: Pre-populate previously uploaded supporting documents when revising
    if (type === 'submit-approval' && rec.supportingDocuments && rec.supportingDocuments.length > 0) {
     // console.log('✅ [REVISE] Loading previously uploaded documents:', rec.supportingDocuments.length);
      setSupportingDocuments(rec.supportingDocuments);
    } else {
      // Reset supporting documents (new submission)
      setSupportingDocuments([]);
    }
    
    // Fetch recommended vendors when opening submit-approval dialog
    if (type === 'submit-approval') {
     // console.log('═══════════════════════════════════════════════════════');
     // console.log('🔍 [SOURCING PAGE] Opening Submit for Approval Dialog');
     // console.log('📋 [SOURCING PAGE] Status:', rec.status);
      
      // ✅ FIX: If revising, load previously recommended vendors first
      if (rec.recommendedVendors && rec.recommendedVendors.length > 0) {
       // console.log('✅ [REVISE] Loading previously recommended vendors:', rec.recommendedVendors.length);
        setRecommendedVendors(rec.recommendedVendors);
      } else {
        // Fetch recommended vendors from database (first time submission)
        const proposal = proposals.find(p => p.id === rec.proposalId);
        
       // console.log('🔍 [SOURCING PAGE] Fetching vendors for Submit for Approval');
       // console.log('📋 [SOURCING PAGE] Proposal:', proposal?.proposalNo);
       // console.log('📋 [SOURCING PAGE] subClassification:', proposal?.subClassification);
       // console.log('📋 [SOURCING PAGE] subClassifications array:', proposal?.subClassifications);
        
        if (proposal) {
          // Try to get code from array first (new format)
          let codes: string[] = [];
          
          if (proposal.subClassifications && Array.isArray(proposal.subClassifications)) {
            codes = proposal.subClassifications
              .map((sc: any) => sc.code)
              .filter((c: string) => c);
           // console.log('✅ [SOURCING PAGE] Extracted codes from array:', codes);
          }
          
          // If no codes from array, try string subClassification
          if (codes.length === 0 && proposal.subClassification) {
            // Check if it's a code (contains dot) or name
            if (proposal.subClassification.includes('.')) {
              codes = [proposal.subClassification];
             // console.log('✅ [SOURCING PAGE] Using code from string:', codes);
            } else {
              // It's a name, we need to use name-based search
             // console.log('⚠️ [SOURCING PAGE] subClassification is NAME format:', proposal.subClassification);
             // console.log('⚠️ [SOURCING PAGE] Will use name-based vendor search');
            }
          }
          
          // Fetch vendors by code(s) or name
          if (codes.length > 0) {
            // Use first code for now (can be enhanced to support multiple)
            const code = codes[0];
           // console.log('🔎 [SOURCING PAGE] Fetching vendors for code:', code);
            fetchRecommendedVendors(code);
          } else if (proposal.subClassification) {
            // Fallback: Try fetching by name
           // console.log('🔎 [SOURCING PAGE] Fetching vendors by NAME:', proposal.subClassification);
            fetchRecommendedVendorsByName(proposal.subClassification);
          } else {
           // console.log('❌ [SOURCING PAGE] No codes or names found - cannot fetch vendors');
            setRecommendedVendors([]);
          }
        } else {
         // console.log('❌ [SOURCING PAGE] Proposal not found!');
          setRecommendedVendors([]);
        }
      }
      
     // console.log('═══════════════════════════════════════════════════════');
    }
    
    setActionDialogOpen(true);
  };

  const handleSubmitAction = () => {
    if (!selectedRecommendation || !actionType) return;

    if (actionType === 'start') {
      onUpdateVendorRecommendation(selectedRecommendation.id, {
        status: 'In Progress',
        assignedTo: user.userID,
        assignedToName: user.name,
        startedDate: new Date().toISOString()
      });
      toast.success('Vendor recommendation started', {
        description: `Assigned to ${user.name}`,
      });
    } else if (actionType === 'submit-approval') {
      // Validate vendor input (at least one vendor from recommended OR additional)
      const validAdditionalVendors = vendorDetails.filter(v => v.vendorName.trim());
      const totalVendors = recommendedVendors.length + validAdditionalVendors.length;
      
      if (totalVendors === 0) {
        toast.error('Please add at least one vendor');
        return;
      }
      
      // Check for duplicates between recommended and additional vendors
      const recommendedNames = new Set(recommendedVendors.map(v => v.vendorName.toLowerCase().trim()));
      const hasDuplicates = validAdditionalVendors.some(v => 
        recommendedNames.has(v.vendorName.toLowerCase().trim())
      );
      
      if (hasDuplicates) {
        toast.error('Duplicate vendor detected', {
          description: 'Additional vendors cannot duplicate recommended vendors'
        });
        return;
      }
      
      // Check email format
      const hasInvalidEmail = validAdditionalVendors.some(v => v.email && !v.email.includes('@'));
      if (hasInvalidEmail) {
        toast.error('Please provide valid email addresses');
        return;
      }
      
      if (!actionNotes.trim()) {
        toast.error('Please provide sourcing notes');
        return;
      }
      
      onUpdateVendorRecommendation(selectedRecommendation.id, {
        status: 'Waiting Dept Head Approval',
        recommendedVendors: recommendedVendors, // Auto-fetched vendors
        addedVendors: validAdditionalVendors.map(v => v.vendorName), // Legacy field
        addedVendorsDetails: validAdditionalVendors, // New detailed field
        sourcingNotes: actionNotes,
        supportingDocuments: supportingDocuments, // Supporting documents
        submittedForApprovalDate: new Date().toISOString()
      });
      toast.success('Submitted for approval', {
        description: `${totalVendors} vendor(s) sent to Sourcing Department Head for review (${recommendedVendors.length} recommended + ${validAdditionalVendors.length} additional)`,
      });
    } else if (actionType === 'approve') {
      const isDeptHead = user.roleName === 'Sourcing Department Head';
      const updates: Partial<VendorRecommendation> = isDeptHead ? {
        status: 'Waiting Division Head Approval',
        deptHeadApprovedBy: user.userID,
        deptHeadApprovedByName: user.name,
        deptHeadApprovedDate: new Date().toISOString(),
        deptHeadComments: actionNotes
      } : {
        status: selectedRecommendation.requestedByRole === 'Planner' ? 'Under Planner Review' : 'Under Buyer Review',
        divHeadApprovedBy: user.userID,
        divHeadApprovedByName: user.name,
        divHeadApprovedDate: new Date().toISOString(),
        divHeadComments: actionNotes
      };
      onUpdateVendorRecommendation(selectedRecommendation.id, updates);
      
      // ✅ FIX NOV 12: Copy vendor data to Proposal when Proc Div Head approves
      // This ensures Planner/Buyer can see vendors BEFORE accepting
      if (!isDeptHead) {
       // console.log('═══════════════════════════════════════════════════════');
       // console.log('🔄 [PROC DIV HEAD APPROVE] Copying vendor data to proposal');
       // console.log('📋 [VENDOR COPY] Proposal ID:', selectedRecommendation.proposalId);
       // console.log('📋 [VENDOR COPY] Recommended Vendors:', selectedRecommendation.recommendedVendors?.length || 0);
       // console.log('📋 [VENDOR COPY] Additional Vendors:', selectedRecommendation.addedVendorsDetails?.length || 0);
        
        const updatedVendorRec = {
          ...selectedRecommendation,
          ...updates
        };
        
        const proposalUpdates: Partial<Proposal> = {
          recommendedVendors: selectedRecommendation.recommendedVendors || [],
          additionalVendors: selectedRecommendation.addedVendorsDetails || [],
          vendorRecommendation: updatedVendorRec
        };
        
        onUpdateProposal(selectedRecommendation.proposalId, proposalUpdates);
        
       // console.log('✅ [VENDOR COPY] Vendor data copied to proposal successfully');
       // console.log('✅ [VENDOR COPY] Planner/Buyer can now view vendors in Sourcing Documents');
       // console.log('═══════════════════════════════════════════════════════');
      }
      
      toast.success(`Approved by ${isDeptHead ? 'Dept Head' : 'Division Head'}`, {
        description: isDeptHead 
          ? 'Forwarded to Procurement Division Head' 
          : 'Sent to Planner/Buyer for review',
      });
    } else if (actionType === 'reject') {
      if (!actionNotes.trim()) {
        toast.error('Please provide rejection reason');
        return;
      }
      const isReview = selectedRecommendation.status.includes('Review');
      const isPlannerOrBuyerReview = selectedRecommendation.status === 'Under Planner Review' || 
                                     selectedRecommendation.status === 'Under Buyer Review';
      
      // ✅ NEW LOGIC: Planner/Buyer Revise → status: 'Revised'
      // Dept/Div Head reject → status: 'Revision Required'
      const newStatus = (isReview && isPlannerOrBuyerReview) ? 'Revised' : 
                        isReview ? 'Revision Required' : 
                        'Rejected';
      
      onUpdateVendorRecommendation(selectedRecommendation.id, {
        status: newStatus
      });
      
      const successMessage = isPlannerOrBuyerReview ? 'Sent to Sourcing for revision' : 
                            isReview ? 'Sent back for revision' : 
                            'Vendor recommendation rejected';
      
      toast.success(successMessage);
    } else if (actionType === 'review') {
      if (!actionNotes.trim()) {
        toast.error('Please provide review comments');
        return;
      }
      const isPlanner = user.roleName === 'Planner';
      const isBuyer = user.roleName === 'Buyer';
      
      // ✅ PLANNER = BUYER (SAME ROLE) - Both Accept → Completed + Confirmed
      // Update vendor recommendation with reviewer-specific fields
      const updates: Partial<VendorRecommendation> = isPlanner ? {
        plannerReviewedBy: user.userID,
        plannerReviewedByName: user.name,
        plannerReviewDate: new Date().toISOString(),
        plannerDecision: 'Approved',
        plannerComments: actionNotes,
        status: 'Completed',  // ✅ Planner Accept → Completed (FINAL!)
        completedDate: new Date().toISOString()
      } : {
        buyerReviewedBy: user.userID,
        buyerReviewedByName: user.name,
        buyerReviewDate: new Date().toISOString(),
        buyerDecision: 'Approved',
        buyerComments: actionNotes,
        status: 'Completed',  // ✅ Buyer Accept → Completed (FINAL!)
        completedDate: new Date().toISOString()
      };
      
      onUpdateVendorRecommendation(selectedRecommendation.id, updates);
      
     // console.log('═══════════════════════════════════════════════════════');
     // console.log('🎯 [REVIEW ACTION] Planner/Buyer accepting vendor recommendation');
     // console.log('👤 [REVIEW ACTION] User Role:', user.roleName);
     // console.log('📋 [REVIEW ACTION] Proposal ID:', selectedRecommendation.proposalId);
     // console.log('🔹 [REVIEW ACTION] Recommended Vendors:', selectedRecommendation.recommendedVendors?.length || 0);
     // console.log('🔹 [REVIEW ACTION] Additional Vendors:', selectedRecommendation.addedVendorsDetails?.length || 0);
      
      // ✅ Both Planner and Buyer Accept → Sourcing Documents "Confirmed" + Vendor Rec "Completed"
      const updatedVendorRec = {
        ...selectedRecommendation,
        ...updates
      };
      
      const proposalUpdates: Partial<Proposal> = {
        vendorConfirmationStatus: 'Confirmed',
        vendorsConfirmedBy: user.name,
        vendorsConfirmedDate: new Date().toISOString(),
        recommendedVendors: selectedRecommendation.recommendedVendors || [],
        additionalVendors: selectedRecommendation.addedVendorsDetails || [],
        vendorRecommendation: updatedVendorRec
      };
        
     // console.log(`✅ [${user.roleName.toUpperCase()} ACCEPT] Vendor recommendation accepted`);
     // console.log('📦 [ACCEPT] Sourcing Documents status → "Confirmed"');
     // console.log('📦 [ACCEPT] Vendor Recommendation status → "Completed"');
     // console.log('📦 [ACCEPT] Recommended vendors:', proposalUpdates.recommendedVendors?.length);
     // console.log('📦 [ACCEPT] Additional vendors:', proposalUpdates.additionalVendors?.length);
     // console.log('📋 [ACCEPT] Will disappear from Buyer/Planner table');
      
      onUpdateProposal(selectedRecommendation.proposalId, proposalUpdates);
      
     // console.log('═══════════════════════════════════════════════════════');
      
      toast.success(`${isPlanner ? 'Planner' : 'Buyer'} review submitted`, {
        description: 'Vendor process completed!',
      });
    }

    setActionDialogOpen(false);
    setSelectedRecommendation(null);
    setActionType(null);
    setActionNotes('');
    setAddedVendorsList('');
  };

  // Calculate stats
  const stats = {
    pending: vendorRecommendations.filter(r => r.status === 'Pending').length,
    inProgress: vendorRecommendations.filter(r => r.status === 'In Progress').length,
    waitingApproval: vendorRecommendations.filter(r => 
      r.status === 'Waiting Dept Head Approval' || r.status === 'Waiting Division Head Approval'
    ).length,
    underReview: vendorRecommendations.filter(r => 
      r.status === 'Under Planner Review' || r.status === 'Under Buyer Review'
    ).length,
    revisionRequired: vendorRecommendations.filter(r => r.status === 'Revision Required').length,
    completed: vendorRecommendations.filter(r => r.status === 'Completed').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Sourcing - Vendor Recommendation</h1>
        <p className="text-gray-600">Manage vendor recommendations from approved proposals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Pending</p>
          <p className="text-2xl" style={{ color: '#FFA500', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.pending}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>In Progress</p>
          <p className="text-2xl" style={{ color: '#007BFF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.inProgress}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Waiting Approval</p>
          <p className="text-2xl" style={{ color: '#6F42C1', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.waitingApproval}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Under Review</p>
          <p className="text-2xl" style={{ color: '#17A2B8', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.underReview}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Revision</p>
          <p className="text-2xl" style={{ color: '#FD7E14', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.revisionRequired}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Completed</p>
          <p className="text-2xl" style={{ color: '#28A745', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.completed}</p>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-orange-900 mb-2">Vendor Recommendation Workflow</h3>
        <ul className="space-y-2 text-sm text-orange-800">
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
            <span><strong>Sourcing Team:</strong> Receive vendor request from Planner/Buyer → Add new vendors outside system recommendations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">2</span>
            <span><strong>Submit for Approval:</strong> Send vendor list to Sourcing Dept Head → Then to Procurement Division Head</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">3</span>
            <span><strong>Planner/Buyer Review:</strong> Original requester reviews → Accept or Request Revision</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">4</span>
            <span><strong>Completion:</strong> After both Planner & Buyer approve → Status becomes Complete</span>
          </li>
        </ul>
      </div>

      {/* Recommendations List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search vendor recommendations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Waiting Dept Head Approval">Waiting Dept Head Approval</SelectItem>
                <SelectItem value="Waiting Division Head Approval">Waiting Division Head Approval</SelectItem>
                <SelectItem value="Under Planner Review">Under Planner Review</SelectItem>
                <SelectItem value="Under Buyer Review">Under Buyer Review</SelectItem>
                <SelectItem value="Revision Required">Revision Required</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Revised">Revised</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
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
                  onClick={() => handleSort('proposalTitle')}
                >
                  Proposal Title {getSortIcon('proposalTitle')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('requestedByName')}
                >
                  Requested By {getSortIcon('requestedByName')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('requestDate')}
                >
                  Request Date {getSortIcon('requestDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Status</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecommendations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No vendor recommendations found
                  </td>
                </tr>
              ) : (
                filteredRecommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rec.proposalNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{rec.proposalTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rec.requestedByName}
                      <Badge variant="outline" className="ml-2 text-xs">{rec.requestedByRole}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(rec.requestDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecommendation(rec)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        {/* Sourcing Team Actions */}
                        {isSourcingTeam && rec.status === 'Pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('start', rec)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            Start
                          </Button>
                        )}
                        {isSourcingTeam && rec.status === 'In Progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('submit-approval', rec)}
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        )}
                        {isSourcingTeam && rec.status === 'Revision Required' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('submit-approval', rec)}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          >
                            Resubmit
                          </Button>
                        )}
                        
                        {/* Approver Actions */}
                        {user.roleName === 'Sourcing Department Head' && rec.status === 'Waiting Dept Head Approval' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('approve', rec)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('reject', rec)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {user.roleName === 'Procurement Division Head' && rec.status === 'Waiting Division Head Approval' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('approve', rec)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('reject', rec)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {/* Planner Review */}
                        {user.roleName === 'Planner' && rec.status === 'Under Planner Review' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('review', rec)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('reject', rec)}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              Revise
                            </Button>
                          </>
                        )}
                        
                        {/* Buyer Review */}
                        {user.roleName === 'Buyer' && rec.status === 'Under Buyer Review' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('review', rec)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction('reject', rec)}
                              className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                              Revise
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={selectedRecommendation !== null && !actionDialogOpen} onOpenChange={() => setSelectedRecommendation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Recommendation Details</DialogTitle>
            <DialogDescription>
              Review vendor recommendation information and workflow progress
            </DialogDescription>
          </DialogHeader>
          {selectedRecommendation && (() => {
            const relatedProposal = proposals.find(p => p.id === selectedRecommendation.proposalId);
            
            return (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-4">
                {/* Request Information - 1 Column Compact */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="text-sm mb-3" style={{ fontWeight: '600' }}>Request Information</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Request ID:</span>
                      <p className="mt-0.5">{selectedRecommendation.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Status:</span>
                      <div className="mt-0.5">{getStatusBadge(selectedRecommendation.status)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Requested By:</span>
                      <p className="mt-0.5">
                        {selectedRecommendation.requestedByName}
                        <Badge variant="outline" className="ml-2 text-xs">{selectedRecommendation.requestedByRole}</Badge>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Request Date:</span>
                      <p className="mt-0.5">{formatDate(selectedRecommendation.requestDate)}</p>
                    </div>
                    {selectedRecommendation.assignedToName && (
                      <div>
                        <span className="text-gray-600 text-xs">Assigned To (Sourcing):</span>
                        <p className="mt-0.5">{selectedRecommendation.assignedToName}</p>
                      </div>
                    )}
                    {selectedRecommendation.completedDate && (
                      <div>
                        <span className="text-gray-600 text-xs">Completed Date:</span>
                        <p className="mt-0.5">{formatDate(selectedRecommendation.completedDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proposal Information - General Information, TOR, TER */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="text-sm mb-3" style={{ fontWeight: '600' }}>Proposal Information</h3>
                  
                  {relatedProposal ? (
                    <div className="space-y-4">
                      {/* General Information */}
                      <div className="border-b pb-3">
                        <h4 className="text-xs text-gray-600 mb-2" style={{ fontWeight: '600' }}>General Information</h4>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600 text-xs">Proposal No:</span>
                            <p className="mt-0.5">{relatedProposal.proposalNo}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs">Title:</span>
                            <p className="mt-0.5">{relatedProposal.title}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs">Jobsite:</span>
                            <p className="mt-0.5">{relatedProposal.jobsite}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs">Department:</span>
                            <p className="mt-0.5">{relatedProposal.department}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs">Category:</span>
                            <p className="mt-0.5">{relatedProposal.category} → {relatedProposal.classification} → {relatedProposal.subClassification}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs">Contract Type:</span>
                            <p className="mt-0.5">{relatedProposal.contractType || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-xs">Total Cost Estimation:</span>
                            <p className="mt-0.5">${selectedRecommendation.estimatedCost.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Terms of Reference (TOR) */}
                      {relatedProposal.torItems && relatedProposal.torItems.length > 0 && (
                        <div className="border-b pb-3">
                          <h4 className="text-xs text-gray-600 mb-2" style={{ fontWeight: '600' }}>Terms of Reference (TOR)</h4>
                          <div className="space-y-2">
                            {relatedProposal.torItems.map((item, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border text-xs">
                                <div className="mb-2 pb-2 border-b border-gray-100">
                                  <span className="text-gray-500 font-semibold">Item #{idx + 1}</span>
                                </div>
                                <div className="space-y-1.5">
                                  <div>
                                    <span className="text-gray-500 font-semibold">Parameter:</span>
                                    <p className="mt-0.5 text-gray-900">{item.parameter || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 font-semibold">Requirement:</span>
                                    <p className="mt-0.5 text-gray-900">{item.requirement || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 font-semibold">Description:</span>
                                    <p className="mt-0.5 text-gray-900">{item.description || '-'}</p>
                                  </div>
                                  {item.remarks && (
                                    <div>
                                      <span className="text-gray-500 font-semibold">Remarks:</span>
                                      <p className="mt-0.5 text-gray-900">{item.remarks}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Technical Evaluation Requirements (TER) */}
                      {relatedProposal.terItems && relatedProposal.terItems.length > 0 && (
                        <div>
                          <h4 className="text-xs text-gray-600 mb-2" style={{ fontWeight: '600' }}>Technical Evaluation Requirements (TER)</h4>
                          <div className="space-y-2">
                            {relatedProposal.terItems.map((item, idx) => (
                              <div key={idx} className="bg-white p-3 rounded border text-xs">
                                <div className="mb-2 pb-2 border-b border-gray-100">
                                  <span className="text-gray-500 font-semibold">Item #{idx + 1}</span>
                                </div>
                                <div className="space-y-1.5">
                                  <div>
                                    <span className="text-gray-500 font-semibold">Parameter:</span>
                                    <p className="mt-0.5 text-gray-900">{item.parameter || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 font-semibold">Requirement:</span>
                                    <p className="mt-0.5 text-gray-900">{item.requirement || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 font-semibold">Description:</span>
                                    <p className="mt-0.5 text-gray-900">{item.description || '-'}</p>
                                  </div>
                                  {item.remarks && (
                                    <div>
                                      <span className="text-gray-500 font-semibold">Remarks:</span>
                                      <p className="mt-0.5 text-gray-900">{item.remarks}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Proposal data not available</p>
                  )}
                </div>

                {/* Request Reason */}
                {selectedRecommendation.reason && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-orange-900 mb-2">Request Reason</h3>
                    <p className="text-orange-800 text-sm">{selectedRecommendation.reason}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="workflow" className="space-y-4 mt-4">
                {/* Sourcing Work */}
                {selectedRecommendation.sourcingNotes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-blue-900 mb-2">Sourcing Notes</h3>
                    <p className="text-blue-800 text-sm">{selectedRecommendation.sourcingNotes}</p>
                    {selectedRecommendation.startedDate && (
                      <p className="text-xs text-blue-600 mt-2">Started: {formatDate(selectedRecommendation.startedDate)}</p>
                    )}
                  </div>
                )}

                {/* Dept Head Approval */}
                {selectedRecommendation.deptHeadApprovedByName && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-purple-900 mb-2">✓ Sourcing Dept Head Approval</h3>
                    <p className="text-sm text-purple-800">
                      <strong>Approved by:</strong> {selectedRecommendation.deptHeadApprovedByName}
                    </p>
                    <p className="text-sm text-purple-800">
                      <strong>Date:</strong> {formatDate(selectedRecommendation.deptHeadApprovedDate!)}
                    </p>
                    {selectedRecommendation.deptHeadComments && (
                      <p className="text-sm text-purple-800 mt-2">
                        <strong>Comments:</strong> {selectedRecommendation.deptHeadComments}
                      </p>
                    )}
                  </div>
                )}

                {/* Division Head Approval */}
                {selectedRecommendation.divHeadApprovedByName && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="text-indigo-900 mb-2">✓ Procurement Division Head Approval</h3>
                    <p className="text-sm text-indigo-800">
                      <strong>Approved by:</strong> {selectedRecommendation.divHeadApprovedByName}
                    </p>
                    <p className="text-sm text-indigo-800">
                      <strong>Date:</strong> {formatDate(selectedRecommendation.divHeadApprovedDate!)}
                    </p>
                    {selectedRecommendation.divHeadComments && (
                      <p className="text-sm text-indigo-800 mt-2">
                        <strong>Comments:</strong> {selectedRecommendation.divHeadComments}
                      </p>
                    )}
                  </div>
                )}

                {/* Planner Review */}
                {selectedRecommendation.plannerReviewedByName && (
                  <div className={`border rounded-lg p-4 ${
                    selectedRecommendation.plannerDecision === 'Approved' 
                      ? 'bg-cyan-50 border-cyan-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <h3 className={selectedRecommendation.plannerDecision === 'Approved' ? 'text-cyan-900 mb-2' : 'text-orange-900 mb-2'}>
                      {selectedRecommendation.plannerDecision === 'Approved' ? '✓' : '⚠'} Planner Review
                    </h3>
                    <p className={`text-sm ${selectedRecommendation.plannerDecision === 'Approved' ? 'text-cyan-800' : 'text-orange-800'}`}>
                      <strong>Reviewed by:</strong> {selectedRecommendation.plannerReviewedByName}
                    </p>
                    <p className={`text-sm ${selectedRecommendation.plannerDecision === 'Approved' ? 'text-cyan-800' : 'text-orange-800'}`}>
                      <strong>Decision:</strong> {selectedRecommendation.plannerDecision}
                    </p>
                    <p className={`text-sm ${selectedRecommendation.plannerDecision === 'Approved' ? 'text-cyan-800' : 'text-orange-800'}`}>
                      <strong>Date:</strong> {formatDate(selectedRecommendation.plannerReviewDate!)}
                    </p>
                    {selectedRecommendation.plannerComments && (
                      <p className={`text-sm mt-2 ${selectedRecommendation.plannerDecision === 'Approved' ? 'text-cyan-800' : 'text-orange-800'}`}>
                        <strong>Comments:</strong> {selectedRecommendation.plannerComments}
                      </p>
                    )}
                  </div>
                )}

                {/* Buyer Review */}
                {selectedRecommendation.buyerReviewedByName && (
                  <div className={`border rounded-lg p-4 ${
                    selectedRecommendation.buyerDecision === 'Approved' 
                      ? 'bg-teal-50 border-teal-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <h3 className={selectedRecommendation.buyerDecision === 'Approved' ? 'text-teal-900 mb-2' : 'text-orange-900 mb-2'}>
                      {selectedRecommendation.buyerDecision === 'Approved' ? '✓' : '⚠'} Buyer Review
                    </h3>
                    <p className={`text-sm ${selectedRecommendation.buyerDecision === 'Approved' ? 'text-teal-800' : 'text-orange-800'}`}>
                      <strong>Reviewed by:</strong> {selectedRecommendation.buyerReviewedByName}
                    </p>
                    <p className={`text-sm ${selectedRecommendation.buyerDecision === 'Approved' ? 'text-teal-800' : 'text-orange-800'}`}>
                      <strong>Decision:</strong> {selectedRecommendation.buyerDecision}
                    </p>
                    <p className={`text-sm ${selectedRecommendation.buyerDecision === 'Approved' ? 'text-teal-800' : 'text-orange-800'}`}>
                      <strong>Date:</strong> {formatDate(selectedRecommendation.buyerReviewDate!)}
                    </p>
                    {selectedRecommendation.buyerComments && (
                      <p className={`text-sm mt-2 ${selectedRecommendation.buyerDecision === 'Approved' ? 'text-teal-800' : 'text-orange-800'}`}>
                        <strong>Comments:</strong> {selectedRecommendation.buyerComments}
                      </p>
                    )}
                  </div>
                )}

                {/* Revision History */}
                {selectedRecommendation.revisionHistory && selectedRecommendation.revisionHistory.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Revision History
                    </h3>
                    <div className="space-y-3">
                      {selectedRecommendation.revisionHistory.map((rev, idx) => (
                        <div key={idx} className="border-l-2 border-orange-400 pl-3">
                          <p className="text-sm text-gray-700">
                            <strong>Revision #{rev.revisionNumber}</strong> - {formatDate(rev.requestedDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Requested by: {rev.requestedByName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Reason: {rev.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="vendors" className="space-y-4 mt-4">
                {/* Recommended Vendors Section */}
                {selectedRecommendation.recommendedVendors && selectedRecommendation.recommendedVendors.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-blue-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Recommended Vendors (Auto-Fetched: {selectedRecommendation.recommendedVendors.length})
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <table className="w-full">
                        <thead className="bg-blue-100 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Vendor Name</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Contact Person</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Phone</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecommendation.recommendedVendors.map((vendor, idx) => (
                            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{vendor.vendorName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vendor.contactPerson || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vendor.phoneNumber || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vendor.email || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Additional Vendors Section */}
                {selectedRecommendation.addedVendorsDetails && selectedRecommendation.addedVendorsDetails.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-green-900 mb-4 flex items-center gap-2">
                      <PackagePlus className="w-5 h-5" />
                      Additional Vendors Added by Sourcing ({selectedRecommendation.addedVendorsDetails.length})
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Vendor Name</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Contact Person</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Phone</th>
                            <th className="px-4 py-3 text-left text-xs text-gray-700">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecommendation.addedVendorsDetails.map((vendor, idx) => (
                            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{vendor.vendorName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vendor.contactPerson || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vendor.phoneNumber || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{vendor.email || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedRecommendation.addedVendors && selectedRecommendation.addedVendors.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-green-900 mb-4 flex items-center gap-2">
                      <PackagePlus className="w-5 h-5" />
                      Vendors Added by Sourcing ({selectedRecommendation.addedVendors.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedRecommendation.addedVendors.map((vendor, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-green-200">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-gray-900">{vendor}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-green-700 mt-3">💡 Legacy format - newer vendors include detailed information</p>
                  </div>
                ) : null}

                {/* No vendors message */}
                {(!selectedRecommendation.recommendedVendors || selectedRecommendation.recommendedVendors.length === 0) &&
                 (!selectedRecommendation.addedVendorsDetails || selectedRecommendation.addedVendorsDetails.length === 0) &&
                 (!selectedRecommendation.addedVendors || selectedRecommendation.addedVendors.length === 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-yellow-800">No vendors added yet</p>
                    <p className="text-sm text-yellow-700 mt-1">Sourcing team will add vendors shortly</p>
                  </div>
                )}

                {/* Supporting Documents Section */}
                {selectedRecommendation.supportingDocuments && selectedRecommendation.supportingDocuments.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-purple-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Supporting Documents ({selectedRecommendation.supportingDocuments.length})
                    </h3>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <div className="divide-y">
                        {selectedRecommendation.supportingDocuments.map((doc, idx) => (
                          <div key={idx} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                            <span className="text-2xl flex-shrink-0">{getFileIcon(doc.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.size)} • Uploaded: {new Date(doc.uploadDate).toLocaleString('id-ID', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-purple-700 mt-3">
                      📎 Documents uploaded by Sourcing team for vendor verification and approval reference
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            );
          })()}
          
          {/* Action Buttons in View Details Dialog */}
          {selectedRecommendation && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              {/* Sourcing Department Head Actions */}
              {user.roleName === 'Sourcing Department Head' && selectedRecommendation.status === 'Waiting Dept Head Approval' && (
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('reject', selectedRecommendation);
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('approve', selectedRecommendation);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
              
              {/* Procurement Division Head Actions */}
              {user.roleName === 'Procurement Division Head' && selectedRecommendation.status === 'Waiting Division Head Approval' && (
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('reject', selectedRecommendation);
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('approve', selectedRecommendation);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
              
              {/* Planner Review Actions */}
              {user.roleName === 'Planner' && selectedRecommendation.status === 'Under Planner Review' && (
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('reject', selectedRecommendation);
                    }}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Revise
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('review', selectedRecommendation);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </div>
              )}
              
              {/* Buyer Review Actions */}
              {user.roleName === 'Buyer' && selectedRecommendation.status === 'Under Buyer Review' && (
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('reject', selectedRecommendation);
                    }}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Revise
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedRecommendation(null);
                      handleAction('review', selectedRecommendation);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </div>
              )}
              
              {/* Info message when no actions available */}
              {!((user.roleName === 'Sourcing Department Head' && selectedRecommendation.status === 'Waiting Dept Head Approval') ||
                 (user.roleName === 'Procurement Division Head' && selectedRecommendation.status === 'Waiting Division Head Approval') ||
                 (user.roleName === 'Planner' && selectedRecommendation.status === 'Under Planner Review') ||
                 (user.roleName === 'Buyer' && selectedRecommendation.status === 'Under Buyer Review')) && (
                <div className="text-sm text-gray-500 text-center py-2">
                  {selectedRecommendation.status === 'Completed' && '✓ This vendor recommendation has been completed'}
                  {selectedRecommendation.status === 'Accepted' && '✅ This vendor recommendation has been accepted'}
                  {selectedRecommendation.status === 'Rejected' && '✗ This vendor recommendation has been rejected'}
                  {selectedRecommendation.status === 'Pending' && '⏳ Waiting for Sourcing team to start processing'}
                  {selectedRecommendation.status === 'In Progress' && '🔄 Sourcing team is working on this request'}
                  {selectedRecommendation.status === 'Revision Required' && '⚠️ Revision is required from Sourcing team'}
                  {selectedRecommendation.status === 'Revised' && '🔄 Revised by Planner/Buyer - Sourcing needs to update'}
                  {selectedRecommendation.status === 'Under Planner Review' && '👤 Planner is reviewing this recommendation'}
                  {selectedRecommendation.status === 'Under Buyer Review' && '👤 Buyer is reviewing this recommendation'}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className={actionType === 'submit-approval' ? "max-w-6xl" : "max-w-md"}>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'start' && 'Start Processing'}
              {actionType === 'submit-approval' && 'Submit for Approval'}
              {actionType === 'approve' && 'Approve Vendor Recommendation'}
              {actionType === 'reject' && 'Reject / Request Revision'}
              {actionType === 'review' && `${user.roleName} Review`}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'start' && 'Assign this vendor recommendation to yourself'}
              {actionType === 'submit-approval' && 'Submit added vendors to Sourcing Dept Head for approval'}
              {actionType === 'approve' && 'Approve vendor list and forward to next step'}
              {actionType === 'reject' && 'Provide reason for rejection or revision'}
              {actionType === 'review' && 'Accept or request revision for vendor list'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === 'submit-approval' && (
              <div className="space-y-6">
                {/* Recommended Vendors Table (Read-only) */}
                {recommendedVendors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-blue-700">🔹 Recommended Vendors (Auto-Fetched from Database)</Label>
                    <p className="text-xs text-gray-600">
                      Based on Sub-Classification from the proposal. These vendors are system-recommended.
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-blue-50">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-blue-100 border-b">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs text-gray-700">Vendor Name</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-700">Contact Person</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-700">Phone</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-700">Email</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {recommendedVendors.map((vendor, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="px-4 py-2 text-sm text-gray-900">{vendor.vendorName}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{vendor.contactPerson || '-'}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{vendor.phoneNumber || '-'}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{vendor.email || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600">
                      ℹ️ {recommendedVendors.length} recommended vendor(s) will be included automatically
                    </p>
                  </div>
                )}

                {/* Additional Vendors Table (Editable) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>🔹 Additional Vendors (Manually Added)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVendorRow}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Vendor
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Add vendors that are not in the recommended list. All fields required. Cannot duplicate recommended vendors.
                  </p>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs text-gray-600">Vendor Name *</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-600">Contact Person</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-600">Phone</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-600">Email</th>
                            <th className="px-3 py-2 text-center text-xs text-gray-600 w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendorDetails.map((vendor, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="px-3 py-2">
                                <Input
                                  value={vendor.vendorName}
                                  onChange={(e) => updateVendorDetail(index, 'vendorName', e.target.value)}
                                  placeholder="PT Vendor Name"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={vendor.contactPerson || ''}
                                  onChange={(e) => updateVendorDetail(index, 'contactPerson', e.target.value)}
                                  placeholder="John Doe"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={vendor.phoneNumber || ''}
                                  onChange={(e) => updateVendorDetail(index, 'phoneNumber', e.target.value)}
                                  placeholder="+62 21 xxx"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={vendor.email || ''}
                                  onChange={(e) => updateVendorDetail(index, 'email', e.target.value)}
                                  placeholder="email@vendor.com"
                                  className="h-8 text-sm"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                {vendorDetails.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVendorRow(index)}
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                  <p className="text-xs text-gray-600">
                    ℹ️ You can add additional vendors or leave empty if recommended vendors are sufficient
                  </p>
                </div>

                {/* Supporting Documents Upload Section */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>📎 Supporting Documents (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Files
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-600">
                    Upload vendor profiles, quotations, compliance forms, or other supporting documents. Accepted formats: PDF, DOCX, XLSX (Max 10MB each)
                  </p>
                  
                  {/* Uploaded Documents List */}
                  {supportingDocuments.length > 0 && (
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <div className="bg-gray-100 px-4 py-2 border-b">
                        <p className="text-sm text-gray-700">
                          Uploaded Documents ({supportingDocuments.length})
                        </p>
                      </div>
                      <div className="divide-y">
                        {supportingDocuments.map((doc, index) => (
                          <div key={index} className="px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-2xl flex-shrink-0">{getFileIcon(doc.type)}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-900 truncate">{doc.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleString('id-ID', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                              className="flex-shrink-0 ml-2 text-red-600 hover:bg-red-50"
                            >
                              <XIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {(actionType === 'submit-approval' || actionType === 'approve' || actionType === 'reject' || actionType === 'review') && (
              <div>
                <Label htmlFor="notes">
                  {actionType === 'submit-approval' && 'Sourcing Notes *'}
                  {actionType === 'approve' && 'Approval Comments'}
                  {actionType === 'reject' && 'Rejection Reason / Revision Request *'}
                  {actionType === 'review' && 'Review Comments *'}
                </Label>
                <Textarea
                  id="notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionType === 'submit-approval' 
                      ? 'Describe vendor selection process and verification...'
                      : actionType === 'approve'
                      ? 'Enter approval comments (optional)...'
                      : actionType === 'review'
                      ? 'Enter your review comments...'
                      : 'Enter reason for rejection or what needs to be revised...'
                  }
                  rows={4}
                  className="mt-2"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAction}>
                {actionType === 'start' && 'Start Processing'}
                {actionType === 'submit-approval' && 'Submit for Approval'}
                {actionType === 'approve' && 'Approve'}
                {actionType === 'reject' && 'Submit'}
                {actionType === 'review' && 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
