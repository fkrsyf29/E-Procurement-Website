import { useState, useMemo, useRef } from 'react';
import { Search, Eye, Download, CheckCircle, FileText, ArrowUpDown, ArrowUp, ArrowDown, Send, Star, Printer, UserPlus, Check, AlertCircle, FileSpreadsheet, Printer as PrinterIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User, Proposal, TORItem, TERItem, VendorRecommendation } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { toast } from 'sonner@2.0.3';
import { formatDate, formatCurrency, formatCurrencyNoCommas, formatNumberWithSeparator, parseDate } from '../utils/formatters';
import { VendorRecord } from '../data/vendorDatabase_NEW';
import { getRecommendedVendors as getVendorRecommendations } from '../utils/vendorRecommendation';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type SortField = 'proposalNo' | 'title' | 'creator' | 'jobsite' | 'department' | 'amount' | 'createdDate';
type SortDirection = 'asc' | 'desc' | null;

interface SourcingDocumentsProps {
  user: User;
  proposals: Proposal[];
  onUpdateProposal?: (proposalId: string, updates: Partial<Proposal>) => void;
  onRequestVendors?: (vendorRequest: Omit<VendorRecommendation, 'id'>) => void;
}

export function SourcingDocuments({ user, proposals, onUpdateProposal, onRequestVendors }: SourcingDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [filterVendorStatus, setFilterVendorStatus] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [autoFetchedVendors, setAutoFetchedVendors] = useState<VendorRecord[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Vendor action dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  
  // Budget Items Preview
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);

  // Filter approved proposals - WITH JOBSITE FILTERING FOR BUYER
  const approvedProposals = useMemo(() => {
    const approved = proposals.filter(p => p.status === 'Approved');
    
    // ✅ BUYER FILTERING RULE
    // Buyer only sees proposals from their OWN jobsite
    // Planner (HO) sees ALL proposals
    // Sourcing (JAHO) sees ALL proposals
    if (user.role === 'Buyer') {
      // Buyer sees only proposals from their jobsite
      return approved.filter(p => {
        const creatorJobsite = p.creatorJobsite || p.jobsite;
        return creatorJobsite === user.jobsite;
      });
    }
    
    // Other roles (Planner HO, Sourcing, Admin) see ALL proposals
    return approved;
  }, [proposals, user]);

  // Get unique creators for filter
  const uniqueCreators = useMemo(() => {
    const creators = [...new Set(approvedProposals.map(p => p.creator))];
    return creators.sort();
  }, [approvedProposals]);

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
  const filteredProposals = useMemo(() => {
    let filtered = approvedProposals.filter(p => {
      const matchesSearch = p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCreator = filterCreator === 'all' || p.creator === filterCreator;
      
      const vendorStatus = p.vendorConfirmationStatus || 'Pending';
      const matchesVendorStatus = filterVendorStatus === 'all' || vendorStatus === filterVendorStatus;
      
      // ✅ REMOVED FILTER: All roles (Planner, Buyer, Sourcing) see the SAME data in Sourcing Documents
      // Only SourcingPage.tsx has role-based filtering
      
      return matchesSearch && matchesCreator && matchesVendorStatus;
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
  }, [approvedProposals, searchTerm, filterCreator, filterVendorStatus, sortField, sortDirection]);

  const handleDownloadPDF = (proposal: Proposal) => {
    toast.success(`Downloading Complete Proposal PDF`, {
      description: `${proposal.proposalNo} - All details included`
    });
  };

  const handleDownloadApprovalTimeline = (proposal: Proposal) => {
    toast.success(`Downloading Approval Timeline PDF`, {
      description: `Timeline for ${proposal.proposalNo} ready for download`
    });
  };

  // ✅ NEW: Extract KBLI codes from TOR items
  const extractKBLICodesFromTOR = (torItems?: TORItem[]): string[] => {
    console.log('🔍 [KBLI EXTRACTION] Starting extraction...');
    console.log('🔍 [KBLI EXTRACTION] TOR items:', torItems);
    
    if (!torItems || torItems.length === 0) {
      console.log('⚠️ [KBLI EXTRACTION] No TOR items found!');
      return [];
    }
    
    const kbliCodes: string[] = [];
    const kbliItem = torItems.find(item => item.id === 'KBLI' && item.enabled);
    
    console.log('🔍 [KBLI EXTRACTION] KBLI item found:', kbliItem);
    console.log('🔍 [KBLI EXTRACTION] KBLI enabled?', kbliItem?.enabled);
    console.log('🔍 [KBLI EXTRACTION] KBLI requirement value:', kbliItem?.requirement);
    
    if (kbliItem && kbliItem.requirement) {
      console.log('🔍 [KBLI EXTRACTION] Raw requirement string:', kbliItem.requirement);
      
      // Parse comma-separated KBLI codes from requirement field
      // Handle both formats: "46499" and "46499-Description"
      const codes = kbliItem.requirement.split(',').map(c => {
        const trimmed = c.trim();
        console.log('  📌 [KBLI EXTRACTION] Processing:', trimmed);
        
        // Extract only the code part (before '-' if exists)
        const codePart = trimmed.split('-')[0].trim();
        console.log('  ✅ [KBLI EXTRACTION] Extracted code:', codePart);
        
        return codePart;
      }).filter(c => c);
      kbliCodes.push(...codes);
      
      console.log('✅ [KBLI EXTRACTION] Final extracted codes:', kbliCodes);
    } else {
      console.log('⚠️ [KBLI EXTRACTION] No KBLI requirement found or KBLI not enabled!');
    }
    
    console.log('🔍 [KBLI EXTRACTION] Returning codes:', kbliCodes);
    return kbliCodes;
  };
  
  // ✅ NEW: Extract brands from TOR items
  const extractBrandsFromTOR = (torItems?: TORItem[]): string[] => {
    console.log('🔍 [BRAND EXTRACTION] Starting extraction...');
    console.log('🔍 [BRAND EXTRACTION] TOR items:', torItems);
    
    if (!torItems || torItems.length === 0) {
      console.log('⚠️ [BRAND EXTRACTION] No TOR items found!');
      return [];
    }
    
    const brands: string[] = [];
    const brandItem = torItems.find(item => item.id === 'brandSpec' && item.enabled);
    
    console.log('🔍 [BRAND EXTRACTION] Brand item found:', brandItem);
    console.log('🔍 [BRAND EXTRACTION] Brand enabled?', brandItem?.enabled);
    console.log('🔍 [BRAND EXTRACTION] Brand requirement value:', brandItem?.requirement);
    
    if (brandItem && brandItem.requirement) {
      console.log('🔍 [BRAND EXTRACTION] Raw requirement string:', brandItem.requirement);
      
      // Parse comma-separated brands from requirement field
      // Handle both formats: "SKF" and "SKF-Premium Bearing"
      const brandList = brandItem.requirement.split(',').map(b => {
        const trimmed = b.trim();
        console.log('  📌 [BRAND EXTRACTION] Processing:', trimmed);
        
        // Extract only the brand name part (before '-' if exists)
        const brandPart = trimmed.split('-')[0].trim();
        console.log('  ✅ [BRAND EXTRACTION] Extracted brand:', brandPart);
        
        return brandPart;
      }).filter(b => b);
      brands.push(...brandList);
      
      console.log('✅ [BRAND EXTRACTION] Final extracted brands:', brandList);
    } else {
      console.log('⚠️ [BRAND EXTRACTION] No brand requirement found or brand not enabled!');
    }
    
    console.log('🔍 [BRAND EXTRACTION] Returning brands:', brands);
    return brands;
  };

  // Budget Items Export Functions
  const handleExportBudgetExcel = (proposal: Proposal) => {
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }

    try {
      const headers = [
        'Material Code',
        'Description',
        'Plant',
        'Sub-Classification',
        'Unit',
        'Qty',
        'Unit Price',
        'Total Price',
        'Currency',
        'Contract Type',
        'Contract No',
        'Contract Name'
      ];

      const rows = proposal.budgetItems.map(item => [
        item.materialCode || '',
        item.materialDescription || '',
        item.plant || '',
        item.subClassification || '',
        item.unit || '',
        item.quantity?.toString() || '0',
        formatNumberWithSeparator(item.unitPrice || 0),
        formatNumberWithSeparator(item.totalPrice || 0),
        item.currency || 'USD',
        item.contractType || 'Non-Contractual',
        item.contractNo || '',
        item.contractName || ''
      ]);

      // Create Excel-compatible CSV with BOM for proper Excel opening
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `\"${cell}\"`).join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `budget_items_${proposal.proposalNo}.xlsx.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Budget items exported for Excel successfully');
    } catch (error) {
      console.error('Error exporting budget items:', error);
      toast.error('Failed to export budget items');
    }
  };

  const handleExportBudgetPDF = (proposal: Proposal) => {
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }

    try {
      const doc = new jsPDF('landscape') as any;
      
      // Title
      doc.setFontSize(16);
      doc.text(`Budget Preview - ${proposal.proposalNo}`, 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Proposal: ${proposal.title}`, 14, 28);
      doc.text(`Date: ${formatDate(proposal.createdDate)}`, 14, 34);
      
      // Table
      const tableData = proposal.budgetItems.map((item, index) => [
        (index + 1).toString(),
        item.materialCode || '',
        item.materialDescription || '',
        item.plant || '',
        item.subClassification || '',
        item.quantity?.toString() || '0',
        item.unit || '',
        `$${formatNumberWithSeparator(item.unitPrice || 0)}`,
        `$${formatNumberWithSeparator(item.totalPrice || 0)}`,
        item.contractType || 'Non-Contractual'
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [[
          '#',
          'Material Code',
          'Description',
          'Plant',
          'Sub-Class',
          'Qty',
          'Unit',
          'Unit Price',
          'Total',
          'Contract Type'
        ]],
        body: tableData,
        foot: [[
          '', '', '', '', '', '', '', 'Grand Total:',
          `$${formatNumberWithSeparator(
            proposal.budgetItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
          )}`,
          ''
        ]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        footStyles: { fillColor: [243, 244, 246], textColor: 0, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 20 },
          4: { cellWidth: 35 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 25 },
          8: { cellWidth: 25 },
          9: { cellWidth: 30 }
        }
      });
      
      doc.save(`budget_preview_${proposal.proposalNo}.pdf`);
      toast.success('Budget items exported to PDF successfully');
    } catch (error) {
      console.error('Error exporting budget items to PDF:', error);
      toast.error('Failed to export budget items to PDF');
    }
  };

  // When proposal is selected, fetch recommended vendors
  const handleViewProposal = (proposal: Proposal) => {
    console.log('🚀 [VIEW PROPOSAL] Button clicked!');
    console.log('📋 [VIEW PROPOSAL] Full proposal data:', proposal);
    console.log('📋 [VIEW PROPOSAL] Proposal ID:', proposal.id);
    console.log('📋 [VIEW PROPOSAL] Proposal No:', proposal.proposalNo);
    console.log('📋 [VIEW PROPOSAL] Status:', proposal.status);
    console.log('📋 [VIEW PROPOSAL] Vendor Confirmation Status:', proposal.vendorConfirmationStatus);
    console.log('📋 [VIEW PROPOSAL] subClassification:', proposal.subClassification);
    console.log('📋 [VIEW PROPOSAL] subClassifications array:', proposal.subClassifications);
    
    setSelectedProposal(proposal);
    
    // ✅ FIX (Nov 13, 2025): Check if proposal has vendor data with proper length check
    const hasRecommendedVendors = proposal.recommendedVendors && proposal.recommendedVendors.length > 0;
    const hasAdditionalVendors = proposal.additionalVendors && proposal.additionalVendors.length > 0;
    const hasVendorData = hasRecommendedVendors || hasAdditionalVendors;
    
    console.log('───────────────────────────────────────────────────────');
    console.log('🔍 [VENDOR DATA CHECK] Checking proposal vendor data...');
    console.log('📦 [VENDOR DATA] proposal.recommendedVendors:', proposal.recommendedVendors);
    console.log('📦 [VENDOR DATA] recommendedVendors count:', proposal.recommendedVendors?.length || 0);
    console.log('📦 [VENDOR DATA] hasRecommendedVendors?', hasRecommendedVendors ? 'YES ✅' : 'NO ❌');
    console.log('📦 [VENDOR DATA] proposal.additionalVendors:', proposal.additionalVendors);
    console.log('📦 [VENDOR DATA] additionalVendors count:', proposal.additionalVendors?.length || 0);
    console.log('📦 [VENDOR DATA] hasAdditionalVendors?', hasAdditionalVendors ? 'YES ✅' : 'NO ❌');
    console.log('📦 [VENDOR DATA] Has ANY vendor data?', hasVendorData ? 'YES ✅' : 'NO ❌');
    console.log('───────────────────────────────────────────────────────');
    
    // If proposal already has vendor data from VendorRecommendation, use that
    // Otherwise, auto-fetch from database using new recommendation algorithm
    if (hasVendorData) {
      console.log('✅ [VENDOR DATA] Using vendors from proposal (already saved during creation)');
      console.log('✅ [VENDOR DATA] recommendedVendors count:', proposal.recommendedVendors?.length || 0);
      console.log('✅ [VENDOR DATA] additionalVendors count:', proposal.additionalVendors?.length || 0);
      // Don't fetch - vendors will be displayed from proposal.recommendedVendors and proposal.additionalVendors
      setAutoFetchedVendors([]); // Clear auto-fetch state since we'll use proposal data
    } else {
      console.log('🔎 [VENDOR DATA] No vendor data in proposal - AUTO-FETCHING from database...');
      
      // ��� Extract KBLI codes and brands from TOR
      const kbliCodesFromTOR = extractKBLICodesFromTOR(proposal.torItems);
      const brandsFromTOR = extractBrandsFromTOR(proposal.torItems);
      
      // Merge with legacy fields for backward compatibility
      const kbliCodes = [...new Set([...(kbliCodesFromTOR || []), ...(proposal.kbliCodes || [])])];
      const brands = [...new Set([...(brandsFromTOR || []), ...(proposal.brandSpecifications || [])])];
      
      console.log('[VENDOR AUTO-FETCH] KBLI from TOR:', kbliCodesFromTOR);
      console.log('[VENDOR AUTO-FETCH] Brands from TOR:', brandsFromTOR);
      console.log('[VENDOR AUTO-FETCH] Legacy KBLI:', proposal.kbliCodes);
      console.log('[VENDOR AUTO-FETCH] Legacy Brands:', proposal.brandSpecifications);
      console.log('[VENDOR AUTO-FETCH] Final KBLI codes:', kbliCodes);
      console.log('[VENDOR AUTO-FETCH] Final Brands:', brands);
      
      // Handle sub-classifications format (array or string)
      let subClassifications = proposal.subClassifications;
      
      // Fallback: If no array, convert from string format
      if (!subClassifications || subClassifications.length === 0) {
        if (proposal.subClassification) {
          console.log('⚠️ [VENDOR RECOMMENDATION] No subClassifications array, converting from string:', proposal.subClassification);
          
          // Parse string format: "M.01.02" or "M.01.02-Bearing" or multiple comma-separated
          const subClassString = proposal.subClassification;
          const parts = subClassString.split(',').map(s => s.trim());
          
          subClassifications = parts.map(part => {
            // Extract code - handle formats: "M.01.02", "M.01.02-Bearing", "M.01.02 - Bearing"
            let code = part;
            if (part.includes(' - ')) {
              code = part.split(' - ')[0].trim();
            } else if (part.includes('-')) {
              code = part.split('-')[0].trim();
            }
            return {
              code: code,
              name: part,
              category: code.split('.')[0],
              classification: code.split('.').slice(0, 2).join('.')
            };
          });
          
          console.log('✅ [VENDOR RECOMMENDATION] Converted to array:', subClassifications);
        }
      }
      
      console.log('📋 [VENDOR RECOMMENDATION] Sub-classifications:', subClassifications);
      console.log('📋 [VENDOR RECOMMENDATION] KBLI codes from TOR:', kbliCodes);
      console.log('📋 [VENDOR RECOMMENDATION] Brands from TOR:', brands);
      
      // ✅ Use new recommendation algorithm with multiple KBLI and brand support
      const recommendations = getVendorRecommendations({
        subClassifications: subClassifications,
        kbliCodes,
        brands
      });
      
      console.log('✅ [VENDOR RECOMMENDATION] Found recommendations:', recommendations.length);
      console.log('✅ [VENDOR RECOMMENDATION] Details:', recommendations.map(r => ({
        name: r.vendor.vendorName,
        matchCount: r.matchDetails.matchCount,
        subClassMatch: r.matchDetails.subClassificationMatch,
        kbliMatch: r.matchDetails.kbliMatch,
        brandMatch: r.matchDetails.brandMatch
      })));
      
      // Convert to VendorRecord format for display
      const vendors = recommendations.map(r => r.vendor);
      setAutoFetchedVendors(vendors);
    }
  };

  // Mark as complete without vendor addition
  const handleNoVendorAddition = () => {
    if (!selectedProposal || !onUpdateProposal) return;
    
    onUpdateProposal(selectedProposal.id, {
      vendorConfirmationStatus: 'Completed',
      vendorsCompletedBy: user.name,
      vendorsCompletedDate: new Date().toISOString()
    });
    
    toast.success('Proposal Marked as Complete', {
      description: 'No additional vendor addition required - proposal ready for sourcing'
    });
    
    setSelectedProposal(null);
  };

  // Confirm vendors are sufficient
  const handleConfirmVendors = () => {
    if (!selectedProposal || !onUpdateProposal) return;
    
    onUpdateProposal(selectedProposal.id, {
      vendorConfirmationStatus: 'Confirmed',
      vendorsConfirmedBy: user.name,
      vendorsConfirmedDate: new Date().toISOString()
    });
    
    toast.success('Vendor List Confirmed', {
      description: 'This proposal is marked as confirmed with the current vendor list'
    });
    
    setShowConfirmDialog(false);
    setSelectedProposal(null);
  };

  // Request additional vendors
  const handleRequestAdditionalVendors = () => {
    if (!selectedProposal || !requestReason.trim()) {
      toast.error('Please provide a reason for requesting additional vendors');
      return;
    }
    
    if (!onUpdateProposal || !onRequestVendors) {
      toast.error('Vendor request functionality not available');
      return;
    }
    
    // ✅ FIX (Nov 13, 2025): Include recommended vendors from proposal or auto-fetch state
    // Priority: Use saved vendors from proposal, fallback to auto-fetched state
    const recommendedVendorsToInclude = selectedProposal.recommendedVendors || 
      (autoFetchedVendors.length > 0 ? autoFetchedVendors.map(v => ({
        vendorName: v.vendorName,
        contactPerson: v.contactPerson,
        phoneNumber: v.phoneNumber,
        email: v.email
      })) : undefined);
    
    console.log('🔧 [REQUEST VENDORS] Including recommended vendors:', recommendedVendorsToInclude);
    console.log('🔧 [REQUEST VENDORS] From proposal:', selectedProposal.recommendedVendors);
    console.log('🔧 [REQUEST VENDORS] From auto-fetch state:', autoFetchedVendors);
    
    // Create vendor request
    const vendorRequest: Omit<VendorRecommendation, 'id'> = {
      proposalId: selectedProposal.id,
      proposalNo: selectedProposal.proposalNo,
      proposalTitle: selectedProposal.title,
      requestedBy: user.id,
      requestedByName: user.name,
      requestedByRole: user.role,
      requestDate: new Date().toISOString(),
      status: 'Pending',
      category: selectedProposal.category,
      classification: selectedProposal.classification,
      subClassification: selectedProposal.subClassification,
      estimatedCost: selectedProposal.amount,
      jobsite: selectedProposal.jobsite,
      department: selectedProposal.department,
      reason: requestReason,
      revisionCount: 0,
      recommendedVendors: recommendedVendorsToInclude // ✅ Include auto-fetched vendors
    };
    
    console.log('🔧 [REQUEST VENDORS] Final vendor request:', vendorRequest);
    
    // Call parent function to add vendor request
    onRequestVendors(vendorRequest);
    
    // Update proposal status
    onUpdateProposal(selectedProposal.id, {
      vendorConfirmationStatus: 'Additional Requested',
      vendorRequestSubmitted: true
    });
    
    toast.success('Vendor Request Submitted', {
      description: 'Your request will appear on the Sourcing page for processing'
    });
    
    setShowRequestDialog(false);
    setRequestReason('');
    setSelectedProposal(null);
  };

  const getVendorStatusBadge = (status?: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Confirmed</Badge>;
      case 'Additional Requested':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Additional Requested</Badge>;
      case 'Completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div>
        <h1 className="text-gray-900">Sourcing Documents</h1>
        <p className="text-gray-600 text-sm">Review approved proposals and manage vendor recommendations</p>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Total Approved</p>
          <p className="text-xl" style={{ color: '#28A745', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{approvedProposals.length}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Pending Review</p>
          <p className="text-xl" style={{ color: '#FFA500', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => !p.vendorConfirmationStatus || p.vendorConfirmationStatus === 'Pending').length}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Confirmed</p>
          <p className="text-xl" style={{ color: '#007BFF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => p.vendorConfirmationStatus === 'Confirmed').length}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Additional Requested</p>
          <p className="text-xl" style={{ color: '#DC3545', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => p.vendorConfirmationStatus === 'Additional Requested').length}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Completed</p>
          <p className="text-xl" style={{ color: '#17A2B8', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => p.vendorConfirmationStatus === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Compact Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-900 mb-2 text-sm" style={{ fontWeight: '600' }}>Vendor Recommendation Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-blue-800">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
            <span>Review proposal, TOR/TER, and auto-recommended vendors</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">2</span>
            <span><strong>No Vendor Addition:</strong> Mark as Complete immediately</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">3</span>
            <span><strong>Confirm Vendors:</strong> Current list is sufficient</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">4</span>
            <span><strong>Request Additional:</strong> Submit vendor request to Sourcing</span>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Creators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {uniqueCreators.map(creator => (
                  <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterVendorStatus} onValueChange={setFilterVendorStatus}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Vendor Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendor Status</SelectItem>
                <SelectItem value="Pending">Pending Review</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Additional Requested">Additional Requested</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('proposalNo')}
                >
                  Proposal No {getSortIcon('proposalNo')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('title')}
                >
                  Title {getSortIcon('title')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('jobsite')}
                >
                  Jobsite {getSortIcon('jobsite')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('amount')}
                >
                  Amount {getSortIcon('amount')}
                </th>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                  Vendor Status
                </th>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No approved proposals found
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{proposal.proposalNo}</td>
                    <td className="px-4 py-3 text-sm">{proposal.title}</td>
                    <td className="px-4 py-3 text-sm">{proposal.jobsite}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrencyNoCommas(proposal.amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      {getVendorStatusBadge(proposal.vendorConfirmationStatus)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProposal(proposal)}
                        className="h-7 px-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compact Proposal Detail Dialog */}
      <Dialog open={selectedProposal !== null} onOpenChange={(open) => !open && setSelectedProposal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg">Proposal Details</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedProposal?.proposalNo} - Review and manage vendor recommendations
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
              <div className="space-y-3">
                {/* Basic Info - Single Column Layout */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Basic Information</h3>
                  <div className="grid grid-cols-1 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Title:</span>
                      <p className="mt-0.5">{selectedProposal.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Proposal No:</span>
                      <p className="mt-0.5">{selectedProposal.proposalNo}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Jobsite:</span>
                      <p className="mt-0.5">{selectedProposal.jobsite}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Department:</span>
                      <p className="mt-0.5">{selectedProposal.department}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Work Location:</span>
                      <p className="mt-0.5">{selectedProposal.workLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Creator:</span>
                      <p className="mt-0.5">{selectedProposal.creator}</p>
                    </div>
                  </div>
                </div>

                {/* Category - Compact Display */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Category & Classification</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-600 text-xs">Category:</span> {selectedProposal.category}</p>
                    <p><span className="text-gray-600 text-xs">Classification:</span> {selectedProposal.classification}</p>
                    <p><span className="text-gray-600 text-xs">Sub-Classification:</span> {selectedProposal.subClassification}</p>
                  </div>
                </div>

                {/* Procurement Objective */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Procurement Objective</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.description || 'N/A'}</p>
                </div>

                {/* Scope of Work */}
                {selectedProposal.scopeOfWork && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Scope of Work</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedProposal.scopeOfWork}</p>
                  </div>
                )}

                {/* Analysis */}
                {selectedProposal.analysis && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Analysis and Benefit</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedProposal.analysis}</p>
                  </div>
                )}

                {/* Funding & Cost - Compact */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Funding & Cost Estimation</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Funding Source:</span>
                      <div className="mt-1 space-y-1">
                        {selectedProposal.fundingBudget && <Badge className="bg-green-100 text-green-800 text-xs">Budget</Badge>}
                        {selectedProposal.fundingNonBudget && <Badge className="bg-orange-100 text-orange-800 text-xs">Non-Budget</Badge>}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Estimated Cost:</span>
                      <p className="mt-1" style={{ fontWeight: '600', color: '#007BFF' }}>{formatCurrencyNoCommas(selectedProposal.amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Budget Items Section */}
                {selectedProposal.budgetItems && selectedProposal.budgetItems.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm" style={{ fontWeight: '600' }}>Budget Items ({selectedProposal.budgetItems.length})</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportBudgetExcel(selectedProposal)}
                          className="h-7 text-xs border-green-600 text-green-700 hover:bg-green-50"
                        >
                          <FileSpreadsheet className="w-3 h-3 mr-1" />
                          Export Excel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportBudgetPDF(selectedProposal)}
                          className="h-7 text-xs border-red-600 text-red-700 hover:bg-red-50"
                        >
                          <PrinterIcon className="w-3 h-3 mr-1" />
                          Export PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowBudgetPreview(!showBudgetPreview)}
                          className="h-7 text-xs border-blue-600 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {showBudgetPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                      </div>
                    </div>

                    {showBudgetPreview && (
                      <div className="bg-white rounded border border-blue-200 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-blue-100 border-b border-blue-300">
                            <tr>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>#</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Material Code</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Description</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Plant</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Sub-Classification</th>
                              <th className="px-2 py-1 text-right" style={{ fontWeight: '600' }}>Qty</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Unit</th>
                              <th className="px-2 py-1 text-right" style={{ fontWeight: '600' }}>Unit Price</th>
                              <th className="px-2 py-1 text-right" style={{ fontWeight: '600' }}>Total</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Contract Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-200">
                            {selectedProposal.budgetItems.map((item, index) => (
                              <tr key={index} className="bg-white hover:bg-blue-50">
                                <td className="px-2 py-2 text-gray-700">{index + 1}</td>
                                <td className="px-2 py-2 text-gray-900">{item.materialCode || '-'}</td>
                                <td className="px-2 py-2 text-gray-900">{item.materialDescription || '-'}</td>
                                <td className="px-2 py-2 text-gray-700">{item.plant || '-'}</td>
                                <td className="px-2 py-2 text-gray-700 max-w-[200px] truncate" title={item.subClassification || ''}>
                                  {item.subClassification || '-'}
                                </td>
                                <td className="px-2 py-2 text-right text-gray-900">{item.quantity || 0}</td>
                                <td className="px-2 py-2 text-gray-700">{item.unit || '-'}</td>
                                <td className="px-2 py-2 text-right text-gray-900">
                                  ${formatNumberWithSeparator(item.unitPrice || 0)}
                                </td>
                                <td className="px-2 py-2 text-right font-semibold text-blue-900">
                                  ${formatNumberWithSeparator(item.totalPrice || 0)}
                                </td>
                                <td className="px-2 py-2 text-gray-700">{item.contractType || 'Non-Contractual'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-blue-100 border-t-2 border-blue-300">
                            <tr>
                              <td colSpan={8} className="px-2 py-2 text-right font-semibold text-gray-900">
                                Grand Total:
                              </td>
                              <td className="px-2 py-2 text-right font-bold text-blue-900">
                                ${formatNumberWithSeparator(
                                  selectedProposal.budgetItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
                                )}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                    
                    {!showBudgetPreview && (
                      <div className="text-center py-2 text-xs text-blue-700">
                        Click "Show Preview" to view {selectedProposal.budgetItems.length} budget items
                      </div>
                    )}
                  </div>
                )}

                {/* Contract Type - Compact */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Contract Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Contract Type:</span>
                      <p className="mt-1">{selectedProposal.contractType || 'N/A'}</p>
                    </div>
                    {selectedProposal.contractualType && (
                      <div>
                        <span className="text-gray-600 text-xs">Contractual Sub-type:</span>
                        <p className="mt-1">{selectedProposal.contractualType}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOR (Terms of Reference) */}
                {selectedProposal.torItems && selectedProposal.torItems.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Terms of Reference (TOR)</h3>
                    <div className="space-y-2">
                      {selectedProposal.torItems
                        .filter(item => item.enabled)
                        .map((item, idx) => (
                          <div key={item.id} className="bg-white p-3 rounded border border-gray-200">
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs">{item.label}</Badge>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Parameter:</span>{' '}
                                <span className="text-gray-900">{item.parameter || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Requirement:</span>{' '}
                                <span className="text-gray-900">{item.requirement || '-'}</span>
                              </div>
                              {item.description && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Description:</span>{' '}
                                  <span className="text-gray-700">{item.description}</span>
                                </div>
                              )}
                              {item.remarks && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Remarks:</span>{' '}
                                  <span className="text-gray-600 italic">{item.remarks}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* TER (Technical Evaluation Requirements) */}
                {selectedProposal.terItems && selectedProposal.terItems.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Technical Evaluation Requirements (TER)</h3>
                    <div className="space-y-2">
                      {selectedProposal.terItems
                        .filter(item => item.enabled)
                        .map((item, idx) => (
                          <div key={item.id} className="bg-white p-3 rounded border border-gray-200">
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs">{item.label}</Badge>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Parameter:</span>{' '}
                                <span className="text-gray-900">{item.parameter || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Requirement:</span>{' '}
                                <span className="text-gray-900">{item.requirement || '-'}</span>
                              </div>
                              {item.description && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Description:</span>{' '}
                                  <span className="text-gray-700">{item.description}</span>
                                </div>
                              )}
                              {item.remarks && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Remarks:</span>{' '}
                                  <span className="text-gray-600 italic">{item.remarks}</span>
                                </div>
                              )}
                              {item.uploadedFile && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Uploaded File:</span>{' '}
                                  <span className="text-blue-600">📎 {item.uploadedFile}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Recommended Vendors Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm" style={{ fontWeight: '600' }}>
                      <Star className="w-4 h-4 inline mr-1" />
                      Recommended Vendors
                    </h3>
                    <Badge className={
                      selectedProposal.vendorConfirmationStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      selectedProposal.vendorConfirmationStatus === 'Additional Requested' ? 'bg-yellow-100 text-yellow-800' :
                      selectedProposal.vendorConfirmationStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedProposal.vendorConfirmationStatus || 'Pending Review'}
                    </Badge>
                  </div>

                  {/* ✅ RESTRUCTURED NOV 13: Standardized Vendor Display with Actions Always Visible */}
                  {(() => {
                    // Get vendor data from both sources
                    const savedRecommendedVendors = selectedProposal.vendorRecommendation?.recommendedVendors || selectedProposal.recommendedVendors || [];
                    const additionalVendors = selectedProposal.vendorRecommendation?.addedVendorsDetails || selectedProposal.additionalVendors || [];
                    const hasVendorData = savedRecommendedVendors.length > 0 || additionalVendors.length > 0;
                    
                    return (
                      <div className="space-y-3">
                        {/* Display Vendor Tables */}
                        {hasVendorData ? (
                          <>
                            {/* Recommended Vendors Table */}
                            {savedRecommendedVendors.length > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h4 className="text-xs mb-2" style={{ fontWeight: '600', color: '#0056b3' }}>
                                  ✓ Recommended Vendors (Auto-Fetched: {savedRecommendedVendors.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-blue-100 border-b border-blue-300">
                                      <tr>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Vendor Name</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Contact Person</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Phone</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Email</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-200">
                                      {savedRecommendedVendors.map((vendor, idx) => (
                                        <tr key={idx} className="bg-white">
                                          <td className="px-2 py-2">{vendor.vendorName}</td>
                                          <td className="px-2 py-2">{vendor.contactPerson || '-'}</td>
                                          <td className="px-2 py-2">{vendor.phoneNumber || '-'}</td>
                                          <td className="px-2 py-2">{vendor.email || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Additional Vendors Table */}
                            {additionalVendors.length > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <h4 className="text-xs mb-2" style={{ fontWeight: '600', color: '#059669' }}>
                                  + Additional Vendors Added by Sourcing ({additionalVendors.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-green-100 border-b border-green-300">
                                      <tr>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Vendor Name</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Contact Person</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Phone</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Email</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-200">
                                      {additionalVendors.map((vendor, idx) => (
                                        <tr key={idx} className="bg-white">
                                          <td className="px-2 py-2">{vendor.vendorName}</td>
                                          <td className="px-2 py-2">{vendor.contactPerson || '-'}</td>
                                          <td className="px-2 py-2">{vendor.phoneNumber || '-'}</td>
                                          <td className="px-2 py-2">{vendor.email || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* Show Auto-Fetched Vendors if no confirmed data yet */
                          autoFetchedVendors.length > 0 ? (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <h4 className="text-xs mb-2" style={{ fontWeight: '600', color: '#0056b3' }}>
                                Auto-Fetched Vendors ({autoFetchedVendors.length})
                              </h4>
                              <div className="space-y-2">
                                {autoFetchedVendors.map((vendor, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded border border-blue-200">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm" style={{ fontWeight: '600' }}>{vendor.vendorName}</p>
                                        <p className="text-xs text-gray-600 mt-1">{vendor.vendorCode || 'N/A'}</p>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                          {vendor.certifications && vendor.certifications.length > 0 ? (
                                            vendor.certifications.map((cert, certIdx) => (
                                              <Badge key={certIdx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                                ✓ {cert}
                                              </Badge>
                                            ))
                                          ) : (
                                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                                              No Certifications
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <Badge className="bg-green-100 text-green-800 text-xs">Auto-Matched</Badge>
                                    </div>
                                    {(vendor.contactPerson || vendor.phoneNumber || vendor.email) && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                                        {vendor.contactPerson && <div>Contact: {vendor.contactPerson}</div>}
                                        {vendor.phoneNumber && <div>Phone: {vendor.phoneNumber}</div>}
                                        {vendor.email && <div>Email: {vendor.email}</div>}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center text-sm text-gray-500">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>No vendors found for this sub-classification</p>
                            </div>
                          )
                        )}

                        {/* Status Messages for Confirmed/Completed */}
                        {selectedProposal.vendorConfirmationStatus === 'Confirmed' && (
                          <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2 text-xs">
                            <div className="text-green-800">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              <strong>Vendor confirmed by {selectedProposal.vendorsConfirmedBy}</strong> on {selectedProposal.vendorsConfirmedDate ? formatDate(selectedProposal.vendorsConfirmedDate) : 'N/A'}
                            </div>
                            {selectedProposal.vendorRecommendation?.deptHeadApprovedByName && selectedProposal.vendorRecommendation?.deptHeadApprovedDate && (
                              <div className="text-green-800">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                <strong>Sourcing Approved by Sourcing Department Head</strong> on {formatDate(selectedProposal.vendorRecommendation.deptHeadApprovedDate)}
                              </div>
                            )}
                            {selectedProposal.vendorRecommendation?.divHeadApprovedByName && selectedProposal.vendorRecommendation?.divHeadApprovedDate && (
                              <div className="text-green-800">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                <strong>Approved by Procurement Division Head</strong> on {formatDate(selectedProposal.vendorRecommendation.divHeadApprovedDate)}
                              </div>
                            )}
                          </div>
                        )}
                        {selectedProposal.vendorConfirmationStatus === 'Completed' && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center text-xs text-blue-800">
                            <Check className="w-3 h-3 inline mr-1" />
                            Completed by {selectedProposal.vendorsCompletedBy} on {selectedProposal.vendorsCompletedDate ? formatDate(selectedProposal.vendorsCompletedDate) : 'N/A'}
                          </div>
                        )}

                        {/* ✅ MOVED OUTSIDE: Vendor Action Buttons - Always Check Status */}
                        {(() => {
                          const currentStatus = selectedProposal.vendorConfirmationStatus || 'Pending';
                          
                          // Show action buttons only if status is Pending (or undefined/null)
                          if (currentStatus === 'Pending' || !selectedProposal.vendorConfirmationStatus) {
                            return (
                              <div className="space-y-2 mt-4">
                                <Button
                                  onClick={handleNoVendorAddition}
                                  className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  No Vendor Addition - Mark as Complete
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    onClick={() => setShowConfirmDialog(true)}
                                    variant="outline"
                                    className="border-green-500 text-green-700 hover:bg-green-50 h-9 text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Confirm Vendors
                                  </Button>
                                  <Button
                                    onClick={() => setShowRequestDialog(true)}
                                    variant="outline"
                                    className="border-orange-500 text-orange-700 hover:bg-orange-50 h-9 text-sm"
                                  >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Request Additional
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                          
                          // Show status message for Additional Requested
                          if (currentStatus === 'Additional Requested') {
                            return (
                              <div className="w-full p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm text-yellow-800">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Additional vendors requested - Check Sourcing page for updates
                              </div>
                            );
                          }
                          
                          // No buttons for Confirmed or Completed status
                          return null;
                        })()}
                      </div>
                    );
                  })()}
                </div>

                <Separator />

                {/* Approval Timeline - Compact */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-3" style={{ fontWeight: '600' }}>Approval Timeline</h3>
                  <div ref={timelineRef}>
                    <ApprovalTimeline history={selectedProposal.history} compact />
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => handleDownloadPDF(selectedProposal)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => handleDownloadApprovalTimeline(selectedProposal)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print Timeline
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Vendors Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Vendor List</DialogTitle>
            <DialogDescription>
              Are you sure the current vendor list is sufficient for this proposal?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
              <p className="text-blue-900">
                By confirming, you indicate that the automatically recommended vendors are sufficient for sourcing this proposal.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmVendors} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, Confirm Vendors
              </Button>
              <Button onClick={() => setShowConfirmDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Additional Vendors Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Vendors</DialogTitle>
            <DialogDescription>
              Explain why additional vendors are needed for this proposal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Additional Vendors *</Label>
              <Textarea
                id="reason"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="e.g., Current vendor list lacks specialized capabilities required for this project..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
              <p className="text-yellow-900">
                Your request will be sent to the Sourcing team for processing and approval.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestAdditionalVendors} 
                className="flex-1"
                disabled={!requestReason.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
              <Button onClick={() => {
                setShowRequestDialog(false);
                setRequestReason('');
              }} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
