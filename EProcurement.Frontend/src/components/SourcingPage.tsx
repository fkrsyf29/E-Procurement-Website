import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Eye, CheckCircle, Clock, XCircle, AlertCircle, Send, UserCheck, Users2, ArrowUpDown, ArrowUp, ArrowDown, History, PackagePlus, Trash2, Plus, Upload, FileText, X as XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User, VendorRecommendation, VendorRecommendationStatus, AddedVendorDetail } from '../types';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { formatDate } from '../utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// ✅ Import Service API (Logic Baru)
import { fetchSourcingDocuments, updateVendorStatusApi } from '../services/proposalApi';
import { getVendorsBySubClassification, getVendorsBySubClassificationName } from '../data/vendorDatabase';

type SortField = 'proposalNo' | 'proposalTitle' | 'requestedByName' | 'jobsite' | 'department' | 'estimatedCost' | 'requestDate';
type SortDirection = 'asc' | 'desc' | null;

interface SourcingPageProps {
  user: User;
  // Props lama dihapus
}

export function SourcingPage({ user }: SourcingPageProps) {
  // --- STATE BARU UNTUK API ---
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<VendorRecommendation[]>([]); // Data utama

  // --- STATE LAMA (UI) ---
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
  
  // Enhanced vendor input
  const [vendorDetails, setVendorDetails] = useState<AddedVendorDetail[]>([
    { vendorName: '', contactPerson: '', phoneNumber: '', email: '' }
  ]);
  const [recommendedVendors, setRecommendedVendors] = useState<AddedVendorDetail[]>([]);
  
  // Supporting Documents Upload
  const [supportingDocuments, setSupportingDocuments] = useState<Array<{ name: string; size: number; type: string; uploadDate: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userPermissions = user.permissions || [];

  const isAdministrator = user.roleName === 'Administrator' || userPermissions.includes('approve_all');
  const canManageSourcing = userPermissions.includes('manage_sourcing');
  const canApproveSourcing = userPermissions.includes('approve_sourcing');
  const canApproveProcurement = userPermissions.includes('approve_procurement');
  const canReviewVendor = userPermissions.includes('review_vendors');

  // --- 1. LOGIC BARU: FETCH DATA DARI API ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      const jobsiteId = user.jobsite && typeof user.jobsite === 'object' && 'jobsiteID' in user.jobsite 
        ? user.jobsite.jobsiteID 
        : '';

      const proposals = await fetchSourcingDocuments(user.userID, user.roleName, jobsiteId);
      
      const sourcingItems = proposals.filter(p => 
        p.vendorConfirmationStatus === 'Additional Requested' || 
        p.vendorConfirmationStatus === 'Pending' ||
        (p.vendorRecommendation && p.vendorRecommendation.status !== 'Completed')
      );

      const mappedRecs: VendorRecommendation[] = sourcingItems.map(p => {
        if (p.vendorRecommendation) return p.vendorRecommendation;

        return {
          id: p.id,
          proposalId: p.id,
          proposalNo: p.proposalNo,
          proposalTitle: p.title,
          requestedBy: p.creatorId,
          requestedByName: p.creator,
          requestedByRole: 'Requester',
          requestDate: p.createdDate,
          status: (p.vendorConfirmationStatus === 'Additional Requested' ? 'Pending' : p.vendorConfirmationStatus as VendorRecommendationStatus) || 'Pending',
          category: p.category,
          classification: p.classification,
          subClassification: p.subClassification,
          estimatedCost: p.amount,
          jobsite: p.jobsite?.name || 'Unknown',
          department: p.department?.name || 'Unknown',
          reason: 'Additional vendors requested by Buyer',
          recommendedVendors: p.recommendedVendors || [],
          addedVendorsDetails: p.additionalVendors || []
        };
      });

      setRecommendations(mappedRecs);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load sourcing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.userID) {
        loadData();
    }
  }, [user.userID]);

  // --- LOGIC LAMA (HELPER FUNCTIONS) ---
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxSize = 10 * 1024 * 1024; 

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`);
        continue;
      }
      if (supportingDocuments.some(doc => doc.name === file.name)) {
        toast.error(`Duplicate file: ${file.name}`);
        continue;
      }
      setSupportingDocuments(prev => [...prev, {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const fetchRecommendedVendors = (subClassificationCode: string) => {
    const vendors = getVendorsBySubClassification(subClassificationCode);
    const formattedVendors: AddedVendorDetail[] = vendors.map(v => ({
      vendorName: v.vendorName,
      contactPerson: v.contactPerson || '',
      phoneNumber: v.phoneNumber || '',
      email: v.email || ''
    }));
    setRecommendedVendors(formattedVendors);
  };
  
  const fetchRecommendedVendorsByName = (subClassificationName: string) => {
    const vendors = getVendorsBySubClassificationName(subClassificationName);
    const formattedVendors: AddedVendorDetail[] = vendors.map(v => ({
      vendorName: v.vendorName,
      contactPerson: v.contactPerson || '',
      phoneNumber: v.phoneNumber || '',
      email: v.email || ''
    }));
    setRecommendedVendors(formattedVendors);
  };

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

  // Filter recommendations based on PERMISSION (Logic Baru)
  const getRecommendationsForUser = () => {
    if (isAdministrator) return recommendations;
    
    if (canApproveSourcing) {
      return recommendations.filter(r => r.status === 'Waiting Dept Head Approval');
    }
    
    if (canApproveProcurement) {
      return recommendations.filter(r => r.status === 'Waiting Division Head Approval');
    }
    
    if (canReviewVendor) {
      return recommendations.filter(r => {
        if (r.status === 'Completed') return false;
        return r.status === 'Under Planner Review' || r.status === 'Under Buyer Review';
      });
    }
    
    // Sourcing Team / Manage Sourcing
    return recommendations;
  };

  const filteredRecommendations = useMemo(() => {
    let filtered = getRecommendationsForUser().filter(req => {
      const matchesSearch = req.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.proposalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestedByName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'requestDate') {
          aVal = new Date(a.requestDate).getTime();
          bVal = new Date(b.requestDate).getTime();
        } else if (sortField === 'estimatedCost') {
          aVal = a.estimatedCost;
          bVal = b.estimatedCost;
        } else {
            const sA = String(aVal).toLowerCase();
            const sB = String(bVal).toLowerCase();
            if (sA < sB) return sortDirection === 'asc' ? -1 : 1;
            if (sA > sB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, filterStatus, sortField, sortDirection, user.roleName, recommendations]);

  const getStatusBadge = (status: VendorRecommendationStatus) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
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

    const style = styles[status] || styles['Pending'];
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
    
    if (type === 'submit-approval') {
       if (rec.sourcingNotes) setActionNotes(rec.sourcingNotes);
       else setActionNotes('');
       
       if (rec.addedVendorsDetails && rec.addedVendorsDetails.length > 0) {
         setVendorDetails([...rec.addedVendorsDetails, { vendorName: '', contactPerson: '', phoneNumber: '', email: '' }]);
       } else {
         setVendorDetails([{ vendorName: '', contactPerson: '', phoneNumber: '', email: '' }]);
       }
       
       if (rec.supportingDocuments && rec.supportingDocuments.length > 0) {
         setSupportingDocuments(rec.supportingDocuments);
       } else {
         setSupportingDocuments([]);
       }

       if (rec.recommendedVendors && rec.recommendedVendors.length > 0) {
          setRecommendedVendors(rec.recommendedVendors);
       } else if (rec.subClassification) {
          if (rec.subClassification.includes('.')) fetchRecommendedVendors(rec.subClassification);
          else fetchRecommendedVendorsByName(rec.subClassification);
       }
    } else {
        setActionNotes('');
    }
    
    setActionDialogOpen(true);
  };

  // ✅ LOGIC BARU: SUBMIT ACTION KE BACKEND
  const handleSubmitAction = async () => {
    if (!selectedRecommendation || !actionType) return;
    
    setIsLoading(true);

    try {
        let newStatus: VendorRecommendationStatus = selectedRecommendation.status;
        
        if (actionType === 'start') newStatus = 'In Progress';
        else if (actionType === 'submit-approval') newStatus = 'Waiting Dept Head Approval';
        else if (actionType === 'approve') newStatus = (canApproveSourcing) ? 'Waiting Division Head Approval' : 'Under Planner Review';
        else if (actionType === 'reject') newStatus = 'Revision Required';
        else if (actionType === 'review') newStatus = 'Completed';

        // Simulasi API Call
        await updateVendorStatusApi(
            selectedRecommendation.proposalId, 
            newStatus,
            { userId: user.userID, username: user.username }
        );

        toast.success(`Action ${actionType} successful`, {
            description: `Workflow moved to: ${newStatus}`
        });
        
        await loadData();
        setActionDialogOpen(false);
        setSelectedRecommendation(null);

    } catch (error: any) {
        console.error(error);
        toast.error('Action failed: ' + error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const stats = {
    pending: recommendations.filter(r => r.status === 'Pending').length,
    inProgress: recommendations.filter(r => r.status === 'In Progress').length,
    waitingApproval: recommendations.filter(r => 
      r.status === 'Waiting Dept Head Approval' || r.status === 'Waiting Division Head Approval'
    ).length,
    underReview: recommendations.filter(r => 
      r.status === 'Under Planner Review' || r.status === 'Under Buyer Review'
    ).length,
    revisionRequired: recommendations.filter(r => r.status === 'Revision Required').length,
    completed: recommendations.filter(r => r.status === 'Completed').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Sourcing - Vendor Recommendation</h1>
        <p className="text-gray-600">Manage vendor recommendations from approved proposals</p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg text-sm font-medium">Loading Data...</div>
        </div>
      )}

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
                        
                        {/* ✅ PERMISSION-BASED ACTION BUTTONS */}
                        {canManageSourcing && rec.status === 'Pending' && (
                           <Button variant="outline" size="sm" onClick={() => handleAction('start', rec)} className="text-blue-600 border-blue-300 hover:bg-blue-50">Start</Button>
                        )}
                        {canManageSourcing && (rec.status === 'In Progress' || rec.status === 'Revision Required') && (
                           <Button variant="outline" size="sm" onClick={() => handleAction('submit-approval', rec)} className="text-purple-600 border-purple-300 hover:bg-purple-50">Submit</Button>
                        )}
                        
                        {canApproveSourcing && rec.status === 'Waiting Dept Head Approval' && (
                          <>
                             <Button variant="outline" size="sm" onClick={() => handleAction('approve', rec)} className="text-green-600 border-green-300 hover:bg-green-50">Approve</Button>
                             <Button variant="outline" size="sm" onClick={() => handleAction('reject', rec)} className="text-red-600 border-red-300 hover:bg-red-50">Reject</Button>
                          </>
                        )}

                        {canApproveProcurement && rec.status === 'Waiting Division Head Approval' && (
                          <>
                             <Button variant="outline" size="sm" onClick={() => handleAction('approve', rec)} className="text-green-600 border-green-300 hover:bg-green-50">Approve</Button>
                             <Button variant="outline" size="sm" onClick={() => handleAction('reject', rec)} className="text-red-600 border-red-300 hover:bg-red-50">Reject</Button>
                          </>
                        )}
                        
                        {canReviewVendor && (rec.status.includes('Under Planner Review') || rec.status.includes('Under Buyer Review')) && (
                          <>
                             <Button variant="outline" size="sm" onClick={() => handleAction('review', rec)} className="text-teal-600 border-teal-300 hover:bg-teal-50">Accept</Button>
                             <Button variant="outline" size="sm" onClick={() => handleAction('reject', rec)} className="text-orange-600 border-orange-300 hover:bg-orange-50">Revise</Button>
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
                <DialogDescription>Review vendor recommendation information and workflow progress</DialogDescription>
             </DialogHeader>
             {selectedRecommendation && (
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Information</TabsTrigger>
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="vendors">Vendors</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4 mt-4">
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <h3 className="text-sm mb-3" style={{ fontWeight: '600' }}>Request Information</h3>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div><span className="text-gray-600 text-xs">Status:</span> <div className="mt-0.5">{getStatusBadge(selectedRecommendation.status)}</div></div>
                        <div><span className="text-gray-600 text-xs">Requested By:</span> <p className="mt-0.5">{selectedRecommendation.requestedByName}</p></div>
                        <div><span className="text-gray-600 text-xs">Request Date:</span> <p className="mt-0.5">{formatDate(selectedRecommendation.requestDate)}</p></div>
                        <div><span className="text-gray-600 text-xs">Jobsite:</span> <p className="mt-0.5">{selectedRecommendation.jobsite}</p></div>
                        <div><span className="text-gray-600 text-xs">Department:</span> <p className="mt-0.5">{selectedRecommendation.department}</p></div>
                        <div><span className="text-gray-600 text-xs">Estimated Cost:</span> <p className="mt-0.5">${selectedRecommendation.estimatedCost.toLocaleString()}</p></div>
                      </div>
                    </div>

                    {selectedRecommendation.reason && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h3 className="text-orange-900 mb-2 text-sm font-semibold">Request Reason</h3>
                            <p className="text-orange-800 text-sm">{selectedRecommendation.reason}</p>
                        </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="workflow" className="space-y-4 mt-4">
                    {selectedRecommendation.sourcingNotes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-blue-900 mb-2 text-sm font-semibold">Sourcing Notes</h3>
                        <p className="text-blue-800 text-sm">{selectedRecommendation.sourcingNotes}</p>
                        {selectedRecommendation.startedDate && (
                           <p className="text-xs text-blue-600 mt-2">Started: {formatDate(selectedRecommendation.startedDate)}</p>
                        )}
                      </div>
                    )}

                    {/* Approval Display Logic */}
                    {selectedRecommendation.deptHeadApprovedByName && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="text-purple-900 mb-2 text-sm font-semibold">✓ Sourcing Dept Head</h3>
                            <p className="text-sm text-purple-800">Approved by: {selectedRecommendation.deptHeadApprovedByName}</p>
                            <p className="text-sm text-purple-800">Date: {formatDate(selectedRecommendation.deptHeadApprovedDate!)}</p>
                        </div>
                    )}
                    
                    {selectedRecommendation.divHeadApprovedByName && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h3 className="text-indigo-900 mb-2 text-sm font-semibold">✓ Procurement Div Head</h3>
                            <p className="text-sm text-indigo-800">Approved by: {selectedRecommendation.divHeadApprovedByName}</p>
                            <p className="text-sm text-indigo-800">Date: {formatDate(selectedRecommendation.divHeadApprovedDate!)}</p>
                        </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="vendors" className="space-y-4 mt-4">
                    {/* Recommended Vendors */}
                    {selectedRecommendation.recommendedVendors && selectedRecommendation.recommendedVendors.length > 0 && (
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                         <h3 className="text-blue-900 mb-4 flex items-center gap-2 text-sm font-semibold"><CheckCircle className="w-5 h-5" /> Recommended Vendors</h3>
                         <div className="border rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-xs">
                                <thead className="bg-blue-100 border-b"><tr><th className="px-4 py-2 text-left font-semibold">Name</th><th className="px-4 py-2 text-left font-semibold">Contact</th></tr></thead>
                                <tbody>{selectedRecommendation.recommendedVendors.map((v, i) => <tr key={i} className="border-b last:border-0"><td className="px-4 py-2">{v.vendorName}</td><td className="px-4 py-2">{v.contactPerson}</td></tr>)}</tbody>
                            </table>
                         </div>
                       </div>
                    )}

                    {/* Additional Vendors */}
                    {selectedRecommendation.addedVendorsDetails && selectedRecommendation.addedVendorsDetails.length > 0 && (
                       <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                         <h3 className="text-green-900 mb-4 flex items-center gap-2 text-sm font-semibold"><PackagePlus className="w-5 h-5" /> Additional Vendors</h3>
                         <div className="border rounded-lg overflow-hidden bg-white">
                            <table className="w-full text-xs">
                                <thead className="bg-green-100 border-b"><tr><th className="px-4 py-2 text-left font-semibold">Name</th><th className="px-4 py-2 text-left font-semibold">Contact</th></tr></thead>
                                <tbody>{selectedRecommendation.addedVendorsDetails.map((v, i) => <tr key={i} className="border-b last:border-0"><td className="px-4 py-2">{v.vendorName}</td><td className="px-4 py-2">{v.contactPerson}</td></tr>)}</tbody>
                            </table>
                         </div>
                       </div>
                    )}
                    
                    {/* Supporting Documents */}
                    {selectedRecommendation.supportingDocuments && selectedRecommendation.supportingDocuments.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                            <h3 className="text-purple-900 mb-4 flex items-center gap-2 text-sm font-semibold">
                                <FileText className="w-4 h-4" /> Supporting Documents
                            </h3>
                            <div className="border rounded-lg overflow-hidden bg-white divide-y">
                                {selectedRecommendation.supportingDocuments.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-3 px-4 py-3">
                                        <span className="text-xl">{getFileIcon(doc.type)}</span>
                                        <div>
                                            <p className="text-sm font-medium">{doc.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                  </TabsContent>
                </Tabs>
             )}
             
             {selectedRecommendation && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>Close</Button>
                   
                   {/* Action Buttons inside View Dialog (Optional duplication) */}
                   {canApproveSourcing && selectedRecommendation.status.includes('Waiting Dept') && (
                       <Button size="sm" onClick={() => handleAction('approve', selectedRecommendation)} className="bg-green-600 text-white">Approve</Button>
                   )}
                </div>
             )}
        </DialogContent>
      </Dialog>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-4xl">
             <DialogHeader><DialogTitle>{actionType}</DialogTitle></DialogHeader>
             <div className="p-4 space-y-4">
                 {actionType === 'submit-approval' && (
                     <>
                        <Label>Sourcing Notes</Label>
                        <Textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} />
                        <div className="border p-4 rounded">
                            <div className="flex justify-between mb-2"><Label>Vendors</Label><Button size="sm" onClick={addVendorRow}><Plus className="w-4 h-4"/></Button></div>
                            {vendorDetails.map((v, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <Input placeholder="Name" value={v.vendorName} onChange={(e) => updateVendorDetail(i, 'vendorName', e.target.value)} />
                                    <Button size="sm" variant="destructive" onClick={() => removeVendorRow(i)}><Trash2 className="w-4 h-4"/></Button>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4"><Label>Documents</Label><Input type="file" onChange={handleFileUpload} multiple className="mt-2" /></div>
                     </>
                 )}
                 {(actionType === 'approve' || actionType === 'reject' || actionType === 'review') && (
                    <>
                        <Label>Comments</Label>
                        <Textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} />
                    </>
                 )}
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setActionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmitAction}>Submit</Button>
                 </div>
             </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}