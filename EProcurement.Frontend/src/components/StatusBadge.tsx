import { Proposal } from '../types';

interface StatusBadgeProps {
  status: string; // Updated to string to support dynamic statuses from DB
  proposal?: Proposal; // Optional for detailed status display
}

export function StatusBadge({ status, proposal }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    // Normalize status string
    const normalizedStatus = status || '';

    if (normalizedStatus === 'Approved' || normalizedStatus === 'Completed' || normalizedStatus === 'Confirmed') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (normalizedStatus === 'Rejected' || normalizedStatus === 'Cancelled') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (normalizedStatus === 'Draft') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    // All "On Progress", "Waiting", "Verification" statuses get Orange
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  // Get detailed status text with department and jobsite
  const getDetailedStatus = (): string => {
    if (!proposal) return status;
    
    // ✅ FIX: Handle Jobsite/Dept as Object (New API) or String (Legacy)
    const deptName = proposal.department 
      ? (typeof proposal.department === 'object' && 'name' in proposal.department ? proposal.department.name : proposal.department)
      : '';
      
    const siteName = proposal.jobsite 
      ? (typeof proposal.jobsite === 'object' && 'name' in proposal.jobsite ? proposal.jobsite.name : proposal.jobsite)
      : '';
    
    // ✅ NEW: Handle 'In Progress' from Database Workflow
    if (status === 'In Progress') {
        // Jika ada info langkah spesifik dari Backend, tampilkan
        if (proposal.requiredRoleName) {
            return `On ${proposal.requiredRoleName} Approval`;
        }
        if (proposal.currentStepName) {
            return `On ${proposal.currentStepName}`;
        }
        return 'In Progress';
    }

    // ✅ LEGACY: Handle old hardcoded status strings (untuk kompatibilitas)
    switch (status) {
      case 'On Verification':
      case 'On Unit Head Approval':
        return `On Unit Head ${deptName} ${siteName} Approval`;
      
      case 'On Review 1':
      case 'On Section Head Approval':
        return `On Section Head ${deptName} ${siteName} Approval`;
      
      case 'On Review 2':
      case 'On Department Head Approval':
        return `On Dept Head ${deptName} ${siteName} Approval`;
      
      case 'On Approval 1':
      case 'On Manager Approval':
        return `On Manager ${deptName} ${siteName} Approval`;
      
      case 'On Approval 2':
      case 'On Division Head Approval':
        return `On ${deptName} Division Head Approval`;
      
      case 'On Director Approval':
        return `On ${deptName} Director Approval`;
      
      case 'On Sourcing Approval':
        return 'On Sourcing Dept Head Approval';
      
      case 'On Procurement Approval':
        return 'On Procurement Div Head Approval';
      
      case 'On President Director Approval':
        return 'On President Director Approval';
      
      default:
        return status;
    }
  };

  const displayStatus = getDetailedStatus();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs ${getStatusColor(status)} whitespace-nowrap`}>
      {displayStatus}
    </span>
  );
}