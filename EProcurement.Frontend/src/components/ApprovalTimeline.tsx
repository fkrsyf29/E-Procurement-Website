import { ApprovalHistory, Proposal } from '../types';
import { Check, X, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { mockUsers } from '../data/mockData';

interface ApprovalTimelineProps {
  history?: ApprovalHistory[];
  proposal?: Proposal;
  compact?: boolean;
}

// Helper function to get user name based on role
function getUserNameByRole(role: string, jobsite?: string, department?: string): string {
  // Try exact role match first
  let user = mockUsers.find(u => u.role === role);
  
  // If not found, try to match by role pattern and context
  if (!user && jobsite && department) {
    user = mockUsers.find(u => 
      u.role === role && 
      u.jobsite === jobsite && 
      u.department === department
    );
  }
  
  // If still not found, try partial matching
  if (!user) {
    // Extract key parts from role name
    const roleLower = role.toLowerCase();
    user = mockUsers.find(u => {
      const userRoleLower = u.role.toLowerCase();
      // Check if roles match closely
      return userRoleLower.includes(roleLower) || roleLower.includes(userRoleLower);
    });
  }
  
  return user?.name || '';
}

export function ApprovalTimeline({ history, proposal, compact = false }: ApprovalTimelineProps) {
  // Support both history array and proposal object
  let timelineHistory = history || proposal?.history || [];
  
  // If proposal is approved or rejected, filter out pending entries
  if (proposal?.status === 'Approved' || proposal?.status === 'Rejected') {
    timelineHistory = timelineHistory.filter(item => item.action !== 'Pending');
  }
  
  // Remove duplicate pending entries for stages that already have approved/rejected entries
  // This prevents showing "Review 2 Pending" when "Review 2 Approved" already exists
  const approvedStages = new Set(
    timelineHistory
      .filter(item => item.action === 'Approved' || item.action === 'Rejected')
      .map(item => item.stage)
  );
  
  timelineHistory = timelineHistory.filter(item => {
    // Keep all approved/rejected entries
    if (item.action !== 'Pending') return true;
    // Only keep pending entries for stages that haven't been approved/rejected yet
    return !approvedStages.has(item.stage);
  });
  
  // Find the current pending stage (first pending entry)
  const currentPendingIndex = timelineHistory.findIndex(item => item.action === 'Pending');
  
  const getIcon = (action: 'Approved' | 'Rejected' | 'Pending' | 'Created' | 'Submitted') => {
    switch (action) {
      case 'Approved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'Rejected':
        return <X className="w-4 h-4 text-red-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'Created':
      case 'Submitted':
        return <Check className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (action: 'Approved' | 'Rejected' | 'Pending' | 'Created' | 'Submitted') => {
    switch (action) {
      case 'Approved':
        return 'bg-green-100 border-green-300';
      case 'Rejected':
        return 'bg-red-100 border-red-300';
      case 'Pending':
        return 'bg-orange-100 border-orange-300';
      case 'Created':
      case 'Submitted':
        return 'bg-blue-100 border-blue-300';
    }
  };

  // Get final status display info
  const getFinalStatusInfo = () => {
    if (!proposal?.status) return null;
    
    const status = proposal.status;
    
    // Map status to display info
    if (status === 'Approved') {
      return {
        icon: <CheckCircle2 className="w-6 h-6 text-white" />,
        bgColor: 'bg-green-600',
        borderColor: 'border-green-600',
        textColor: 'text-green-900',
        bgLight: 'bg-green-50',
        label: 'Proposal Approved',
        description: 'This proposal has been fully approved and is ready for execution'
      };
    } else if (status === 'Rejected') {
      return {
        icon: <XCircle className="w-6 h-6 text-white" />,
        bgColor: 'bg-red-600',
        borderColor: 'border-red-600',
        textColor: 'text-red-900',
        bgLight: 'bg-red-50',
        label: 'Proposal Rejected',
        description: 'This proposal has been rejected and will not proceed'
      };
    } else if (status === 'Draft') {
      return null; // Don't show final status for draft
    } else {
      // For pending statuses (On Verification, On Review, etc.)
      return {
        icon: <Clock className="w-6 h-6 text-white" />,
        bgColor: 'bg-orange-500',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-900',
        bgLight: 'bg-orange-50',
        label: 'In Progress',
        description: `Current Status: ${status}`
      };
    }
  };

  const finalStatus = getFinalStatusInfo();

  return (
    <div className="space-y-4">
      {/* Matrix Approval Info Box - Show creator's jobsite drives approval */}
      {proposal && proposal.creatorJobsite && proposal.creatorJobsite !== proposal.jobsite && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-gray-900 mb-1">Matrix Approval Routing</h4>
              <p className="text-sm text-gray-700">
                <strong>Approval follows creator's organizational structure:</strong>
              </p>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>• Creator's Jobsite: <strong className="text-blue-700">{proposal.creatorJobsite}</strong></p>
                <p>• Creator's Department: <strong className="text-blue-700">{proposal.creatorDepartment || proposal.department}</strong></p>
                <p className="text-xs text-gray-500 mt-2">
                  Note: Procurement is for <strong>{proposal.jobsite}</strong>, but approval routing 
                  is based on the creator's location (<strong>{proposal.creatorJobsite}</strong>) 
                  to maintain organizational consistency and accountability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {timelineHistory && timelineHistory.length > 0 ? (
        <>
          {timelineHistory.map((item, index) => {
            const isCurrentPending = index === currentPendingIndex && item.action === 'Pending';
            const userName = getUserNameByRole(
              item.role || '', 
              proposal?.jobsite, 
              proposal?.department
            );
            
            return (
              <div key={item.id || `history-${index}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(item.action)}`}>
                    {getIcon(item.action)}
                  </div>
                  {(index < timelineHistory.length - 1 || finalStatus) && (
                    <div key={`connector-${index}`} className="w-0.5 h-12 bg-gray-200 my-1" />
                  )}
                </div>
                <div className={`flex-1 pb-4 ${isCurrentPending ? 'bg-orange-50 -ml-2 -mr-4 pl-6 pr-4 py-3 rounded-lg border-l-4 border-orange-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-900">{item.stage}</p>
                        {isCurrentPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-orange-500 text-white animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            Awaiting Approval
                          </span>
                        )}
                      </div>
                      
                      {/* Role display */}
                      <p className="text-sm" style={{ color: '#007BFF', fontWeight: '600' }}>{item.role}</p>
                      
                      {/* Current pending - show awaiting message */}
                      {isCurrentPending && (
                        <div className="mt-2 p-2 bg-white rounded border border-orange-200">
                          <p className="text-xs text-gray-600 mb-1">⏳ Awaiting approval from:</p>
                          {userName ? (
                            <p className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>
                              {userName} ({item.role})
                            </p>
                          ) : (
                            <p className="text-sm" style={{ color: '#000000', fontWeight: '600' }}>
                              {item.role}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Non-pending - show approver name */}
                      {!isCurrentPending && userName && (
                        <p className="text-sm text-gray-600">{userName}</p>
                      )}
                      {!isCurrentPending && item.approver && item.approver !== userName && (
                        <p className="text-sm text-gray-600">{item.approver}</p>
                      )}
                      
                      {item.comment && (
                        <p className="text-sm text-gray-500 mt-1 italic">"{item.comment}"</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-500">
                        {item.date ? formatDate(item.date) : 'Pending'}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                        item.action === 'Approved' ? 'bg-green-100 text-green-800' :
                        item.action === 'Rejected' ? 'bg-red-100 text-red-800' :
                        item.action === 'Created' || item.action === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.action}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Final Status Display */}
          {finalStatus && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 ${finalStatus.borderColor} ${finalStatus.bgColor} flex items-center justify-center shadow-lg`}>
                  {finalStatus.icon}
                </div>
              </div>
              <div className={`flex-1 pb-4 ${finalStatus.bgLight} -ml-2 -mr-4 pl-6 pr-4 py-4 rounded-lg border-2 ${finalStatus.borderColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-lg ${finalStatus.textColor}`} style={{ fontWeight: 'bold' }}>
                      {finalStatus.label}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {finalStatus.description}
                    </p>
                    {proposal?.status === 'Approved' && (
                      <p className="text-xs text-gray-500 mt-2">
                        ✓ All approval stages completed successfully
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded ${
                      proposal?.status === 'Approved' ? 'bg-green-600 text-white' :
                      proposal?.status === 'Rejected' ? 'bg-red-600 text-white' :
                      'bg-orange-500 text-white'
                    }`} style={{ fontWeight: 'bold' }}>
                      {proposal?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No approval history yet
        </div>
      )}
    </div>
  );
}
