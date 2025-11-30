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
// Mock helper jika import asli bermasalah
const getKBLIDisplay = (code: string) => `${code} - KBLI Description`;

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
  const [actionComment, setActionComment] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | null>(null);

  // Check if user can approve this proposal
  // Logic Permission sudah dihandle di MyApprovals.tsx, disini kita validasi ulang
  const canApprove = proposal.status !== 'Approved' && proposal.status !== 'Rejected' && proposal.status !== 'Draft';

  const handleActionClick = (action: 'approve' | 'reject') => {
    if (!canApprove) {
      toast.error('This proposal has already been processed');
      return;
    }
    // Trigger parent action directly (MyApprovals handles the dialog)
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
        'Material Code', 'Material Description', 'Plant', 'Sub-Classification',
        'Unit', 'Quantity', 'Unit Price (USD)', 'Total Price (USD)',
        'Currency', 'Contract Type', 'Contract No', 'Contract Name'
      ];

      const rows = proposal.budgetItems.map(item => [
        item.materialCode || '',
        item.materialDescription || '',
        item.plant || '',
        item.subClassification || '',
        item.uom || '',
        item.qty?.toString() || '0',
        item.estimatedPrice?.toString() || '0',
        item.totalPrice?.toString() || '0',
        item.currency || 'USD',
        item.contractType || 'Non-Contractual',
        item.contractNo || '',
        item.contractName || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
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
      // Placeholder logic for Excel export
      if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
        toast.error('No budget items to export');
        return;
      }
      toast.success('Budget items exported for Excel successfully');
  };

  const handleExportBudgetPDF = async () => {
    // Placeholder logic for PDF export
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
        toast.error('No budget items to export');
        return;
      }
      toast.success('Budget items exported to PDF successfully');
  };

  // Approval Actions Component - Reusable across all tabs
  const ApprovalActions = () => (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6 mt-6 rounded-b-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-700">
            Current Step: <span className="font-medium text-blue-700">{proposal.currentStepName || proposal.status}</span>
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
            <Badge variant="outline" className="py-2 px-4 bg-gray-100 text-gray-600">
               {proposal.status === 'Approved' ? '✅ Proposal Approved' : 
                proposal.status === 'Rejected' ? '❌ Proposal Rejected' : 
                '👁️ View Only'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-4 flex-1">
        {/* Header with Status */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h2 className="text-2xl text-gray-900">📋 Proposal Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {proposal.proposalNo} - Review all information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={proposal.status} proposal={proposal} />
          </div>
        </div>

        {/* 3-Tab Structure */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'general' | 'tor' | 'ter')} className="w-full flex flex-col h-full">
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
          <TabsContent value="general" className="space-y-3 mt-0 pb-20">
            {/* Main Proposal Details Container */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="text-sm mb-3" style={{ fontWeight: '600' }}>Proposal Details</h3>
              
              <div className="space-y-4">
                {/* General Information */}
                <div className="border-b pb-3">
                  <h4 className="text-xs text-gray-600 mb-2" style={{ fontWeight: '600' }}>General Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Title:</span>
                      <p className="mt-0.5 font-medium">{proposal.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                             <span className="text-gray-600 text-xs">Jobsite:</span>
                             <p className="mt-0.5">{proposal.jobsite?.name || proposal.jobsite}</p>
                         </div>
                         <div>
                             <span className="text-gray-600 text-xs">Department:</span>
                             <p className="mt-0.5">{proposal.department?.name || proposal.department}</p>
                         </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Category:</span>
                      <p className="mt-0.5">{proposal.category} → {proposal.classification} → {proposal.subClassification}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded border border-blue-100">
                      <span className="text-gray-600 text-xs">Total Cost Estimation:</span>
                      <p className="mt-0.5 text-lg font-bold text-blue-700">${formatNumberWithSeparator(proposal.amount || 0)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Created By:</span>
                      <p className="mt-0.5">{proposal.creator} on {formatDate(proposal.createdDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Procurement Objective */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Procurement Objective</h3>
                <p className="text-sm whitespace-pre-wrap">{proposal.description || 'N/A'}</p>
            </div>

            {/* Scope of Work */}
            {proposal.scopeOfWork && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Scope of Work</h3>
                <p className="text-sm whitespace-pre-wrap">{proposal.scopeOfWork}</p>
                </div>
            )}

            {/* Analysis */}
            {proposal.analysis && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Analysis and Benefit</h3>
                <p className="text-sm whitespace-pre-wrap">{proposal.analysis}</p>
                </div>
            )}

            {/* Budget Items Section */}
            {proposal.budgetItems && proposal.budgetItems.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm" style={{ fontWeight: '600' }}>Budget Items ({proposal.budgetItems.length})</h3>
                    <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleExportBudgetExcel} className="h-7 text-xs border-green-600 text-green-700 hover:bg-green-50">
                        <FileSpreadsheet className="w-3 h-3 mr-1" /> Excel
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleExportBudgetPDF} className="h-7 text-xs border-red-600 text-red-700 hover:bg-red-50">
                        <FileText className="w-3 h-3 mr-1" /> PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowBudgetPreview(!showBudgetPreview)} className="h-7 text-xs border-blue-600 text-blue-700 hover:bg-blue-50">
                        <Eye className="w-3 h-3 mr-1" /> {showBudgetPreview ? 'Hide' : 'Show'}
                    </Button>
                    </div>
                </div>

                {showBudgetPreview && (
                    <div className="bg-white rounded border border-blue-200 overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-blue-100 border-b border-blue-300">
                        <tr>
                            <th className="px-2 py-1 text-left font-semibold">Material</th>
                            <th className="px-2 py-1 text-right font-semibold">Qty</th>
                            <th className="px-2 py-1 text-right font-semibold">Price</th>
                            <th className="px-2 py-1 text-right font-semibold">Total</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-200">
                        {proposal.budgetItems.map((item, index) => (
                            <tr key={index} className="bg-white hover:bg-blue-50">
                            <td className="px-2 py-2 text-gray-900">{item.materialDescription || item.materialCode}</td>
                            <td className="px-2 py-2 text-right">{item.qty} {item.uom}</td>
                            <td className="px-2 py-2 text-right">${formatNumberWithSeparator(item.estimatedPrice)}</td>
                            <td className="px-2 py-2 text-right font-semibold">${formatNumberWithSeparator(item.totalPrice)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
                </div>
            )}
            
            {/* Approval Timeline - Moved inside General Tab for context */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mt-6">
                <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontWeight: '600', color: '#1E40AF' }}>
                <Shield className="w-4 h-4" />
                Approval Timeline & History
                </h3>
                <ApprovalTimeline history={proposal.history} />
            </div>
            
            {/* Actions Footer */}
            <ApprovalActions />
          </TabsContent>

          {/* ==================== TAB 2: TERMS OF REFERENCE ==================== */}
          <TabsContent value="tor" className="space-y-3 mt-0 pb-20">
            {/* KBLI Codes */}
            {proposal.kbliCodes && proposal.kbliCodes.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-300">
                <h3 className="text-sm mb-3 flex items-center gap-2 font-semibold">
                  <Info className="w-4 h-4 text-blue-600" /> KBLI Codes
                </h3>
                <div className="space-y-1.5">
                  {proposal.kbliCodes.map((kbli, idx) => (
                    <div key={idx} className="bg-white rounded border border-blue-300 px-3 py-2 text-sm text-blue-900">
                      {getKBLIDisplay(kbli)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Specifications */}
            {proposal.brandSpecifications && proposal.brandSpecifications.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-300">
                <h3 className="text-sm mb-3 flex items-center gap-2 font-semibold">
                  <Info className="w-4 h-4 text-purple-600" /> Brand Specifications
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
                <h3 className="text-sm font-semibold">Terms of Reference (TOR) Items</h3>
                <Badge variant="outline">{proposal.torItems?.filter(t => t.enabled).length || 0} items</Badge>
              </div>

              {proposal.torItems && proposal.torItems.length > 0 ? (
                <div className="space-y-3">
                  {proposal.torItems.filter(item => item.enabled).map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">{index + 1}. {item.label}</h4>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                            <p className="text-gray-600 font-semibold">Parameter</p>
                            <div className="px-2 py-1.5 bg-white rounded border border-gray-300 mt-1">{item.parameter || '-'}</div>
                        </div>
                        <div>
                            <p className="text-gray-600 font-semibold">Requirement</p>
                            <div className="px-2 py-1.5 bg-white rounded border border-gray-300 mt-1">{item.requirement || '-'}</div>
                        </div>
                        {item.description && (
                            <div>
                                <p className="text-gray-600 font-semibold">Description</p>
                                <p className="px-2 py-1.5 bg-white rounded border border-gray-300 mt-1">{item.description}</p>
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No TOR items defined</p>
                </div>
              )}
            </div>

            <ApprovalActions />
          </TabsContent>

          {/* ==================== TAB 3: TECHNICAL EVALUATION ==================== */}
          <TabsContent value="ter" className="space-y-3 mt-0 pb-20">
            <div className="bg-white rounded-lg p-4 border border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Technical Evaluation Requirements (TER)</h3>
                <Badge variant="outline">{proposal.terItems?.filter(t => t.enabled).length || 0} items</Badge>
              </div>

              {proposal.terItems && proposal.terItems.length > 0 ? (
                <div className="space-y-3">
                  {proposal.terItems.filter(item => item.enabled).map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">{index + 1}. {item.label}</h4>
                        {item.uploadedFile && <Badge className="bg-green-600">File Attached</Badge>}
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                            <p className="text-gray-600 font-semibold">Parameter</p>
                            <div className="px-2 py-1.5 bg-white rounded border border-gray-300 mt-1">{item.parameter || '-'}</div>
                        </div>
                        <div>
                            <p className="text-gray-600 font-semibold">Requirement</p>
                            <div className="px-2 py-1.5 bg-white rounded border border-gray-300 mt-1">{item.requirement || '-'}</div>
                        </div>
                        {item.uploadedFile && (
                            <div>
                                <p className="text-gray-600 font-semibold">File</p>
                                <div className="px-2 py-1.5 bg-green-50 text-green-900 rounded border border-green-200 mt-1 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {typeof item.uploadedFile === 'string' ? item.uploadedFile : 'Document attached'}
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
            <ApprovalActions />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}