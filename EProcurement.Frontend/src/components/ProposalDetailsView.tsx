import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Eye, 
  Download,
  Shield,
  AlertCircle,
  Info,
  FileSpreadsheet
} from 'lucide-react';
import { Proposal, User } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { formatDate, formatNumberWithSeparator } from '../utils/formatters';
import { toast } from 'sonner';
import { getKBLIDisplay } from '../data/systemReferenceData';

interface ProposalDetailsViewProps {
  proposal: Proposal;
  user: User;
  onApprove: (proposal: Proposal, comment: string) => void;
  onReject: (proposal: Proposal, comment: string) => void;
  onClose: () => void;
}

export function ProposalDetailsView({ 
  proposal, 
  user, 
  onApprove, 
  onReject,
  onClose 
}: ProposalDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'tor' | 'ter'>('general');
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);

  // Check if user can approve this proposal
  const canApprove = proposal.status !== 'Approved' && proposal.status !== 'Rejected';

  const handleActionClick = (action: 'approve' | 'reject') => {
    if (!canApprove) {
      toast.error('This proposal has already been processed');
      return;
    }
    // Directly call onApprove/onReject - parent (MyApprovals) will handle confirmation dialog
    if (action === 'approve') {
      onApprove(proposal, '');
    } else {
      onReject(proposal, '');
    }
  };

  const handleExportBudgetCSV = () => {
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }

    try {
      const headers = [
        'Material Code',
        'Material Description',
        'Plant',
        'Sub-Classification',
        'Unit',
        'Quantity',
        'Unit Price (USD)',
        'Total Price (USD)',
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
        item.unitPrice?.toString() || '0',
        item.totalPrice?.toString() || '0',
        item.currency || 'USD',
        item.contractType || 'Non-Contractual',
        item.contractNo || '',
        item.contractName || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `\"${cell}\"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `budget_items_${proposal.proposalNo}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Budget items exported to CSV successfully');
    } catch (error) {
      console.error('Error exporting budget items:', error);
      toast.error('Failed to export budget items');
    }
  };

  const handleExportBudgetExcel = () => {
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }

    try {
      const headers = [
        'Material Code',
        'Material Description',
        'Plant',
        'Sub-Classification',
        'Unit',
        'Quantity',
        'Unit Price (USD)',
        'Total Price (USD)',
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

  const handleExportBudgetPDF = async () => {
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }

    try {
      // Dynamic import jsPDF and autoTable plugin
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      // Import autoTable plugin - this extends jsPDF
      await import('jspdf-autotable');
      
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
      
      doc.autoTable({
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
              2: { cellWidth: 50 },
              3: { cellWidth: 20 },
              4: { cellWidth: 25 },
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

  // Approval Actions Component - Reusable across all tabs
  const ApprovalActions = () => (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 mt-6 rounded-b-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-700">
            Approval Required: <span className="font-medium">{user.roleName}</span>
          </span>
        </div>
        
        <div className="flex gap-3">
          {canApprove ? (
            <>
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700"
                onClick={() => handleActionClick('reject')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleActionClick('approve')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          ) : (
            <Badge variant="outline" className="py-2 px-4">
              {proposal.status === 'Approved' ? '✅ Already Approved' : '❌ Already Rejected'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Header with Status */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl">📋 Proposal Details - Complete Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Review all proposal information before making approval decision
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={proposal.status} proposal={proposal} />
            <Badge variant="outline" className="text-sm">{proposal.proposalNo}</Badge>
          </div>
        </div>

        {/* 3-Tab Structure */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'general' | 'tor' | 'ter')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">
              1. General Information
            </TabsTrigger>
            <TabsTrigger value="tor">
              2. Terms of Reference
            </TabsTrigger>
            <TabsTrigger value="ter">
              3. Technical Evaluation
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: GENERAL INFORMATION ==================== */}
          <TabsContent value="general" className="space-y-3 mt-0">
            {/* Main Proposal Details Container */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="text-sm mb-3" style={{ fontWeight: '600' }}>Proposal Details</h3>
              
              <div className="space-y-4">
                {/* General Information */}
                <div className="border-b pb-3">
                  <h4 className="text-xs text-gray-600 mb-2" style={{ fontWeight: '600' }}>General Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Proposal No:</span>
                      <p className="mt-0.5">{proposal.proposalNo}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Title:</span>
                      <p className="mt-0.5">{proposal.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Department:</span>
                      <p className="mt-0.5">{proposal.department}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Jobsite:</span>
                      <p className="mt-0.5">{proposal.jobsite}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Classification:</span>
                      <p className="mt-0.5">{proposal.classification}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Sub-Classification:</span>
                      <p className="mt-0.5">{proposal.subClassification}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Approval:</span>
                      <p className="mt-0.5">
                        {proposal.approvers && proposal.approvers.length > 0 
                          ? proposal.approvers.map(a => a.roleName).join(' → ')
                          : 'No approvers assigned'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Contract Type:</span>
                      <p className="mt-0.5">{proposal.contractType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Total Cost Estimation:</span>
                      <p className="mt-0.5">${formatNumberWithSeparator(proposal.amount || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Timeline:</span>
                      <p className="mt-0.5">{formatDate(proposal.createdDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Terms of Reference (TOR) */}
                {proposal.torItems && proposal.torItems.filter(t => t.enabled).length > 0 && (
                  <div className="border-b pb-3">
                    <h4 className="text-xs text-gray-600 mb-2" style={{ fontWeight: '600' }}>Terms of Reference (TOR)</h4>
                    <div className="space-y-2">
                      {proposal.torItems
                        .filter(item => item.enabled)
                        .map((item, idx) => {
                          // ✅ BACKWARD COMPATIBILITY: If requirement is empty, fill from top-level arrays (Nov 12, 2025)
                          let displayRequirement = item.requirement;
                          
                          if (!displayRequirement || displayRequirement.trim() === '' || displayRequirement === '-') {
                            if (item.id === 'KBLI' && proposal.kbliCodes && proposal.kbliCodes.length > 0) {
                              displayRequirement = proposal.kbliCodes.map(code => getKBLIDisplay(code)).join(', ');
                            } else if (item.id === 'brandSpec' && proposal.brandSpecifications && proposal.brandSpecifications.length > 0) {
                              displayRequirement = proposal.brandSpecifications.join(', ');
                            }
                          }
                          
                          // ✅ FORMAT KBLI: If this is KBLI item and has requirement, format with description
                          if (item.id === 'KBLI' && displayRequirement && displayRequirement !== '-') {
                            // Split by comma, format each code with description
                            const codes = displayRequirement.split(',').map(c => c.trim());
                            displayRequirement = codes.map(code => {
                              // If already has description (contains " - "), keep as is
                              if (code.includes(' - ')) return code;
                              // Otherwise, add description from system data
                              return getKBLIDisplay(code);
                            }).join(', ');
                          }

                          return (
                            <div key={item.id} className="bg-white p-3 rounded border text-xs">
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
                                  <p className="mt-0.5 text-gray-900">{displayRequirement || '-'}</p>
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
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Technical Evaluation Requirements (TER) */}
                {proposal.terItems && proposal.terItems.filter(t => t.enabled).length > 0 && (
                  <div>
                    <h4 className="text-xs text-gray-600 mb-2" style={{ fontWeight: '600' }}>Technical Evaluation Requirements (TER)</h4>
                    <div className="space-y-2">
                      {proposal.terItems
                        .filter(item => item.enabled)
                        .map((item, idx) => (
                          <div key={item.id} className="bg-white p-3 rounded border text-xs">
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
            </div>

            {/* Approval Actions */}
            <ApprovalActions />
          </TabsContent>

          {/* ==================== TAB 2: TERMS OF REFERENCE ==================== */}
          <TabsContent value="tor" className="space-y-3 mt-0">
            {/* KBLI Codes from TOR */}
            {proposal.kbliCodes && proposal.kbliCodes.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-300">
                <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontWeight: '600' }}>
                  <Info className="w-4 h-4 text-blue-600" />
                  KBLI Codes (TOR Specification)
                </h3>
                <div className="space-y-1.5">
                  {proposal.kbliCodes.map((kbli, idx) => (
                    <div key={idx} className="bg-white rounded border border-blue-300 px-3 py-2">
                      <p className="text-sm text-blue-900">{getKBLIDisplay(kbli)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Specifications from TOR */}
            {proposal.brandSpecifications && proposal.brandSpecifications.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-300">
                <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontWeight: '600' }}>
                  <Info className="w-4 h-4 text-purple-600" />
                  Brand Specifications (TOR Specification)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {proposal.brandSpecifications.map((brand, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white border-purple-300 text-purple-900">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* TOR Items */}
            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm" style={{ fontWeight: '600' }}>
                  Terms of Reference (TOR) Items
                </h3>
                <Badge variant="outline">
                  {proposal.torItems?.filter(t => t.enabled).length || 0} items enabled
                </Badge>
              </div>

              {proposal.torItems && proposal.torItems.length > 0 ? (
                <div className="space-y-3">
                  {proposal.torItems
                    .filter(item => item.enabled)
                    .map((item, index) => {
                      // ✅ BACKWARD COMPATIBILITY: If requirement is empty, fill from top-level arrays (Nov 12, 2025)
                      let displayRequirement = item.requirement;
                      let isFromBackwardCompatibility = false;
                      
                      if (!displayRequirement || displayRequirement.trim() === '' || displayRequirement === '-') {
                        if (item.id === 'KBLI' && proposal.kbliCodes && proposal.kbliCodes.length > 0) {
                          displayRequirement = proposal.kbliCodes.map(code => getKBLIDisplay(code)).join(', ');
                          isFromBackwardCompatibility = true;
                        } else if (item.id === 'brandSpec' && proposal.brandSpecifications && proposal.brandSpecifications.length > 0) {
                          displayRequirement = proposal.brandSpecifications.join(', ');
                          isFromBackwardCompatibility = true;
                        }
                      }
                      
                      // ✅ FORMAT KBLI: If this is KBLI item and has requirement, format with description
                      if (item.id === 'KBLI' && displayRequirement && displayRequirement !== '-') {
                        // Split by comma, format each code with description
                        const codes = displayRequirement.split(',').map(c => c.trim());
                        displayRequirement = codes.map(code => {
                          // If already has description (contains " - "), keep as is
                          if (code.includes(' - ')) return code;
                          // Otherwise, add description from system data
                          return getKBLIDisplay(code);
                        }).join(', ');
                      }
                      
                      return (
                        <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {index + 1}. {item.label}
                            </h4>
                            <Badge variant="outline" className="text-xs">Enabled</Badge>
                          </div>
                          
                          {/* ONE COLUMN LAYOUT */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Parameter</p>
                              <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                                <p className="text-xs text-gray-900">{item.parameter || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Requirement</p>
                              <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                                <p className="text-xs text-gray-900">{displayRequirement || '-'}</p>
                              </div>
                            </div>
                          {item.description && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Description</p>
                              <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                                <p className="text-xs text-gray-900 whitespace-pre-wrap">{item.description}</p>
                              </div>
                            </div>
                          )}
                          {item.remarks && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Remarks</p>
                              <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                                <p className="text-xs text-gray-900 whitespace-pre-wrap">{item.remarks}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No TOR items defined</p>
                </div>
              )}
            </div>

            {/* Approval Actions */}
            <ApprovalActions />
          </TabsContent>

          {/* ==================== TAB 3: TECHNICAL EVALUATION REQUIREMENTS ==================== */}
          <TabsContent value="ter" className="space-y-3 mt-0">
            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm" style={{ fontWeight: '600' }}>
                  Technical Evaluation Requirements (TER)
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {proposal.terItems?.filter(t => t.enabled).length || 0} items enabled
                  </Badge>
                  <Badge variant="outline">
                    {proposal.terItems?.filter(t => t.uploadedFile).length || 0} files uploaded
                  </Badge>
                </div>
              </div>

              {proposal.terItems && proposal.terItems.length > 0 ? (
                <div className="space-y-3">
                  {proposal.terItems
                    .filter(item => item.enabled)
                    .map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {index + 1}. {item.label}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Enabled</Badge>
                            {item.uploadedFile && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                <FileText className="w-3 h-3 mr-1" />
                                File Attached
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* ONE COLUMN LAYOUT */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Parameter</p>
                            <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                              <p className="text-xs text-gray-900">{item.parameter || '-'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Requirement</p>
                            <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                              <p className="text-xs text-gray-900">{item.requirement || '-'}</p>
                            </div>
                          </div>
                          {item.description && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Description</p>
                              <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                                <p className="text-xs text-gray-900 whitespace-pre-wrap">{item.description}</p>
                              </div>
                            </div>
                          )}
                          {item.remarks && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Remarks</p>
                              <div className="px-2 py-1.5 bg-white rounded border border-gray-300">
                                <p className="text-xs text-gray-900 whitespace-pre-wrap">{item.remarks}</p>
                              </div>
                            </div>
                          )}
                          {item.uploadedFile && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Attached Document</p>
                              <div className="px-2 py-1.5 bg-green-50 rounded border border-green-300 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-600" />
                                <p className="text-xs text-green-900 flex-1">{item.uploadedFile.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {(item.uploadedFile.size / 1024).toFixed(1)} KB
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No TER items defined</p>
                </div>
              )}
            </div>

            {/* Approval Actions */}
            <ApprovalActions />
          </TabsContent>
        </Tabs>

        {/* Approval Timeline - MOVED TO BOTTOM */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mt-6">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontWeight: '600', color: '#1E40AF' }}>
            <Shield className="w-4 h-4" />
            Approval Timeline & History
          </h3>
          <ApprovalTimeline history={proposal.history} />
        </div>
      </div>

    </>
  );
}
