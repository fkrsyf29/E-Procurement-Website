import { ProposalStatus, Proposal } from '../types';

interface StatusBadgeProps {
  status: ProposalStatus;
  proposal?: Proposal; // Optional for detailed status display
}

export function StatusBadge({ status, proposal }: StatusBadgeProps) {
  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'On Verification':
      case 'On Review 1':
      case 'On Review 2':
      case 'On Approval 1':
      case 'On Approval 2':
      case 'On Sourcing Approval':
      case 'On Procurement Approval':
      case 'On Unit Head Approval':
      case 'On Section Head Approval':
      case 'On Department Head Approval':
      case 'On Manager Approval':
      case 'On Division Head Approval':
      case 'On Director Approval':
      case 'On President Director Approval':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get detailed status text with department and jobsite
  // IMPORTANT: Uses CREATOR's jobsite and department for approval routing consistency
  const getDetailedStatus = (): string => {
    if (!proposal) return status;
    
    // Use creator's department and jobsite if available, fallback to proposal's
    const dept = proposal.creatorDepartment || proposal.department;
    const site = proposal.creatorJobsite || proposal.jobsite;
    
    switch (status) {
      case 'On Verification':
      case 'On Unit Head Approval':
        return `On Unit Head ${dept} ${site} Approval`;
      
      case 'On Review 1':
      case 'On Section Head Approval':
        return `On Section Head ${dept} ${site} Approval`;
      
      case 'On Review 2':
      case 'On Department Head Approval':
        return `On Dept Head ${dept} ${site} Approval`;
      
      case 'On Approval 1':
      case 'On Manager Approval':
        return `On Manager ${dept} ${site} Approval`;
      
      case 'On Approval 2':
      case 'On Division Head Approval':
        return `On ${dept} Division Head Approval`;
      
      case 'On Director Approval':
        return `On ${dept} Director Approval`;
      
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs ${getStatusColor(status)}`}>
      {displayStatus}
    </span>
  );
}
