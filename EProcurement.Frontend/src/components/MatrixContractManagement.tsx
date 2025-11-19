import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import {
  MatrixContractCondition,
  getAllMatrixConditions,
  addMatrixCondition,
  updateMatrixCondition,
  deleteMatrixCondition,
  hardDeleteMatrixCondition,
  reorderMatrixConditions,
  isMatrixConditionCodeUnique,
} from '../data/matrixContractConditions';

export function MatrixContractManagement() {
  const [conditions, setConditions] = useState<MatrixContractCondition[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<MatrixContractCondition | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState<MatrixContractCondition | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);

  useEffect(() => {
    loadConditions();
  }, []);

  const loadConditions = () => {
    const allConditions = getAllMatrixConditions();
    setConditions(allConditions);
  };

  const openAddDialog = () => {
    setEditingCondition(null);
    setCode('');
    setLabel('');
    setDescription('');
    setIsActive(true);
    setOrder(conditions.length + 1);
    setIsDialogOpen(true);
  };

  const openEditDialog = (condition: MatrixContractCondition) => {
    setEditingCondition(condition);
    setCode(condition.code);
    setLabel(condition.label);
    setDescription(condition.description || '');
    setIsActive(condition.isActive);
    setOrder(condition.order);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    // Validation
    if (!code.trim()) {
      toast.error('Code is required');
      return;
    }
    if (!label.trim()) {
      toast.error('Label is required');
      return;
    }

    // Check code uniqueness
    if (!isMatrixConditionCodeUnique(code, editingCondition?.id)) {
      toast.error('Condition code already exists');
      return;
    }

    if (editingCondition) {
      // Update existing condition
      const success = updateMatrixCondition(editingCondition.id, {
        code,
        label,
        description,
        isActive,
        order,
      });

      if (success) {
        toast.success('Matrix condition updated successfully');
        loadConditions();
        setIsDialogOpen(false);
      } else {
        toast.error('Failed to update matrix condition');
      }
    } else {
      // Add new condition
      const newCondition = addMatrixCondition({
        code,
        label,
        description,
        isActive,
        order,
      });

      if (newCondition) {
        toast.success('Matrix condition added successfully');
        loadConditions();
        setIsDialogOpen(false);
      } else {
        toast.error('Failed to add matrix condition');
      }
    }
  };

  const openDeleteDialog = (condition: MatrixContractCondition) => {
    setConditionToDelete(condition);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = (permanent: boolean = false) => {
    if (!conditionToDelete) return;

    let success = false;
    if (permanent) {
      success = hardDeleteMatrixCondition(conditionToDelete.id);
      if (success) {
        toast.success('Matrix condition permanently deleted');
      }
    } else {
      success = deleteMatrixCondition(conditionToDelete.id);
      if (success) {
        toast.success('Matrix condition deactivated');
      }
    }

    if (success) {
      loadConditions();
      setIsDeleteDialogOpen(false);
      setConditionToDelete(null);
    } else {
      toast.error('Failed to delete matrix condition');
    }
  };

  const handleToggleActive = (condition: MatrixContractCondition) => {
    const success = updateMatrixCondition(condition.id, {
      isActive: !condition.isActive,
    });

    if (success) {
      toast.success(`Matrix condition ${!condition.isActive ? 'activated' : 'deactivated'}`);
      loadConditions();
    } else {
      toast.error('Failed to update status');
    }
  };

  const moveConditionUp = (condition: MatrixContractCondition) => {
    if (condition.order === 1) return;
    
    const sortedConditions = [...conditions].sort((a, b) => a.order - b.order);
    const currentIndex = sortedConditions.findIndex(c => c.id === condition.id);
    
    if (currentIndex > 0) {
      const newOrder = [...sortedConditions];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      
      reorderMatrixConditions(newOrder.map(c => c.id));
      loadConditions();
      toast.success('Order updated');
    }
  };

  const moveConditionDown = (condition: MatrixContractCondition) => {
    const sortedConditions = [...conditions].sort((a, b) => a.order - b.order);
    const currentIndex = sortedConditions.findIndex(c => c.id === condition.id);
    
    if (currentIndex < sortedConditions.length - 1) {
      const newOrder = [...sortedConditions];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      
      reorderMatrixConditions(newOrder.map(c => c.id));
      loadConditions();
      toast.success('Order updated');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Matrix Contract Evaluation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage conditions for determining contract type (Contractual vs Non-Contractual)
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Condition
        </Button>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="mb-1">
            <strong>Contract Type Logic:</strong> If <strong>ANY</strong> condition is checked in the form, the contract type will be <strong>Contractual</strong>. If <strong>NONE</strong> are checked, it will be <strong>Non-Contractual</strong>.
          </p>
          <p className="text-blue-700">
            Only active conditions will appear in the New Proposal form.
          </p>
        </div>
      </div>

      {/* Matrix Conditions Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead className="w-32">Code</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="w-40">Description</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-40 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conditions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No matrix conditions found. Add your first condition to get started.
                </TableCell>
              </TableRow>
            ) : (
              conditions.map((condition) => (
                <TableRow key={condition.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{condition.order}</span>
                      <div className="flex flex-col ml-1">
                        <button
                          onClick={() => moveConditionUp(condition)}
                          disabled={condition.order === 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveConditionDown(condition)}
                          disabled={condition.order === conditions.length}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {condition.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm text-gray-900">{condition.label}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {condition.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={condition.isActive}
                      onCheckedChange={() => handleToggleActive(condition)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(condition)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(condition)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCondition ? 'Edit Matrix Condition' : 'Add New Matrix Condition'}
            </DialogTitle>
            <DialogDescription>
              {editingCondition
                ? 'Update the details of the matrix contract condition.'
                : 'Add a new condition for matrix contract evaluation.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, '_'))}
                  placeholder="e.g., VALUE_ABOVE_200K"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier (uppercase, no spaces)
                </p>
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Transaction Value > USD 200,000"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed in the New Proposal form
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about this condition..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (show in New Proposal form)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCondition ? 'Update' : 'Add'} Condition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Matrix Condition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this condition?
            </DialogDescription>
          </DialogHeader>

          {conditionToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-sm">
                  <strong>Code:</strong> {conditionToDelete.code}
                </p>
                <p className="text-sm mt-1">
                  <strong>Label:</strong> {conditionToDelete.label}
                </p>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Deactivating will hide this condition from forms but keep the data. Permanent deletion will remove it completely.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDelete(false)}
              className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
            >
              Deactivate Only
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(true)}
            >
              Permanent Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
