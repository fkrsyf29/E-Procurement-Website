import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Shield, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Proposal } from '../types';

interface AdminApprovalActionsProps {
  proposal: Proposal;
  onApprove: (roleName: string, comments: string) => void;
  onReject: (roleName: string, comments: string) => void;
}

const APPROVAL_ROLES = [
  { value: 'verificator', label: 'Verificator', status: 'On Verification', nextStatus: 'On Review 1' },
  { value: 'reviewer1', label: 'Reviewer 1', status: 'On Review 1', nextStatus: 'On Review 2' },
  { value: 'reviewer2', label: 'Reviewer 2', status: 'On Review 2', nextStatus: 'On Approval 1' },
  { value: 'approver1', label: 'Approver 1', status: 'On Approval 1', nextStatus: 'On Approval 2' },
  { value: 'approver2', label: 'Approver 2', status: 'On Approval 2', nextStatus: 'On Sourcing Approval' },
  { value: 'sourcing-head', label: 'Sourcing Dept Head', status: 'On Sourcing Approval', nextStatus: 'On Procurement Approval' },
  { value: 'procurement-head', label: 'Procurement Division Head', status: 'On Procurement Approval', nextStatus: 'Approved' },
];

export const AdminApprovalActions: React.FC<AdminApprovalActionsProps> = ({
  proposal,
  onApprove,
  onReject,
}) => {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [comments, setComments] = useState('');

  // Get available roles based on current status
  const getAvailableRoles = () => {
    return APPROVAL_ROLES.filter(role => 
      role.status === proposal.status || 
      (proposal.status === 'Draft' && role.value === 'verificator')
    );
  };

  const getCurrentRoleInfo = () => {
    return APPROVAL_ROLES.find(role => role.value === selectedRole);
  };

  const handleApprove = () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    const roleInfo = getCurrentRoleInfo();
    if (!roleInfo) return;

    onApprove(roleInfo.label, comments);
    setIsApproveDialogOpen(false);
    setSelectedRole('');
    setComments('');
    toast.success(`Approved as ${roleInfo.label}`, {
      description: `Proposal status updated to ${roleInfo.nextStatus}`,
    });
  };

  const handleReject = () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if (!comments.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    const roleInfo = getCurrentRoleInfo();
    if (!roleInfo) return;

    onReject(roleInfo.label, comments);
    setIsRejectDialogOpen(false);
    setSelectedRole('');
    setComments('');
    toast.success(`Rejected as ${roleInfo.label}`, {
      description: 'Proposal has been rejected',
    });
  };

  const availableRoles = getAvailableRoles();

  if (availableRoles.length === 0 || proposal.status === 'Approved' || proposal.status === 'Rejected') {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        onClick={() => setIsApproveDialogOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Shield className="w-4 h-4 mr-2" />
        Admin Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsRejectDialogOpen(true)}
        className="border-red-600 text-red-600 hover:bg-red-50"
      >
        <Shield className="w-4 h-4 mr-2" />
        Admin Reject
      </Button>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Admin Super User - Approve Proposal
            </DialogTitle>
            <DialogDescription>
              As an administrator, you can approve this proposal on behalf of any role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Status Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Proposal No:</span> {proposal.proposalNo}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Current Status:</span>{' '}
                    <Badge variant="outline" className="ml-1">{proposal.status}</Badge>
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    <span className="font-medium">Title:</span> {proposal.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label>Select Role to Act As *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose approval role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label} → {role.nextStatus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Select the role you want to approve as
              </p>
            </div>

            {/* Next Status Preview */}
            {selectedRole && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Next Status:</span>{' '}
                  <Badge className="ml-1 bg-green-600">
                    {getCurrentRoleInfo()?.nextStatus}
                  </Badge>
                </p>
              </div>
            )}

            {/* Comments */}
            <div>
              <Label>Comments (Optional)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add approval comments..."
                rows={3}
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-xs text-gray-700">
                  <strong>Admin Override:</strong> This action will bypass normal approval workflow. 
                  The action will be logged as "Admin ({getCurrentRoleInfo()?.label || 'Selected Role'})".
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsApproveDialogOpen(false);
                setSelectedRole('');
                setComments('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedRole}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Admin Super User - Reject Proposal
            </DialogTitle>
            <DialogDescription>
              As an administrator, you can reject this proposal on behalf of any role
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Status Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Proposal No:</span> {proposal.proposalNo}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Current Status:</span>{' '}
                    <Badge variant="outline" className="ml-1">{proposal.status}</Badge>
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    <span className="font-medium">Title:</span> {proposal.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label>Select Role to Act As *</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose rejection role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Select the role you want to reject as
              </p>
            </div>

            {/* Rejection Reason */}
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Please provide detailed reason for rejection..."
                rows={4}
                className="border-red-200 focus:border-red-400"
              />
              <p className="text-xs text-red-600 mt-1">
                * Rejection reason is required
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-xs text-gray-700">
                  <strong>Admin Override:</strong> This action will reject the proposal and it will be sent back 
                  to the creator for revision. The action will be logged as "Admin ({getCurrentRoleInfo()?.label || 'Selected Role'})".
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectDialogOpen(false);
                setSelectedRole('');
                setComments('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              variant="destructive"
              disabled={!selectedRole || !comments.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
