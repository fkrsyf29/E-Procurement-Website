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
import { MatrixContractCondition } from '../types/matrixContractTypes';
import {
  fetchAllMatrixConditions,
  createMatrixCondition,
  updateMatrixConditionApi,
  reorderMatrixConditionsApi,
  getMatrixConditionById,
} from '../services/matrixContractApi';
import { User } from '../types';

const isCodeUniqueClientSide = (conditions: MatrixContractCondition[], code: string, excludeId?: string): boolean => {
  return !conditions.some(
    condition => condition.code === code && condition.id !== excludeId
  );
};

interface MatrixContractManagementProps {
  user: User | null;
}

export function MatrixContractManagement({ user: propCurrentUser }: MatrixContractManagementProps) {
  const [conditions, setConditions] = useState<MatrixContractCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const userId = propCurrentUser?.username ?? 'UNKNOWN_USER';

  useEffect(() => {
    loadConditions();
  }, []);

  const loadConditions = async () => {
    setIsLoading(true);
    try {
      const allConditions = await fetchAllMatrixConditions();
      setConditions(allConditions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conditions.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingCondition(null);
    setCode('');
    setLabel('');
    setDescription('');
    setIsActive(true);
    // Set order baru ke setelah order terakhir
    const maxOrder = conditions.reduce((max, c) => Math.max(max, c.order), 0);
    setOrder(maxOrder + 1);
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

  const handleSave = async () => {
    // Validation
    if (!code.trim()) {
      toast.error('Code is required');
      return;
    }
    if (!label.trim()) {
      toast.error('Label is required');
      return;
    }

    if (!isCodeUniqueClientSide(conditions, code, editingCondition?.id)) {
      toast.error('Condition code already exists. Please use a unique code.');
      return;
    }

    try {
      if (editingCondition) {

        const currentApiData = await getMatrixConditionById(editingCondition.id);
        await updateMatrixConditionApi(editingCondition.id, {
          code,
          label,
          description: description || null,
          isActive,
          order,
          isSoftDelete: false,
        }, currentApiData, userId);

        toast.success('Matrix condition updated successfully');

      } else {
        const newConditionPayload = {
          code,
          label,
          description: description || null,
          isActive,
          order,
        };

        await createMatrixCondition(newConditionPayload, userId);
        toast.success('Matrix condition added successfully');
      }

      loadConditions();
      setIsDialogOpen(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(errorMessage);
    }
  };

  const openDeleteDialog = (condition: MatrixContractCondition) => {
    setConditionToDelete(condition);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (permanent: boolean) => {
    if (!conditionToDelete) return;

    const actionType = permanent ? 'permanentDelete' : 'deactivate'; 
    const successMessage = permanent ? 
        'Matrix condition marked for permanent deletion.' : 
        'Matrix condition deactivated successfully.';
    const failureMessage = permanent ? 
        'Failed to mark condition for permanent deletion.' : 
        'Failed to deactivate condition.';


    try {
      const currentApiData = await getMatrixConditionById(conditionToDelete.id);

      await updateMatrixConditionApi(conditionToDelete.id, {
        isActive: false,
        actionType: actionType,
      }, currentApiData, userId);

      toast.success(successMessage);

      loadConditions();
      setIsDeleteDialogOpen(false);
      setConditionToDelete(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : failureMessage;
      toast.error(errorMessage);
    }
  };

  const handleToggleActive = async (condition: MatrixContractCondition) => {
    try {
      const newIsActive = !condition.isActive;
      const currentApiData = await getMatrixConditionById(condition.id); // <-- Ambil data API saat ini

      await updateMatrixConditionApi(condition.id, {
        isActive: newIsActive,
      }, currentApiData, userId);

      toast.success(`Matrix condition ${newIsActive ? 'activated' : 'deactivated'}`);
      loadConditions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status.';
      toast.error(errorMessage);
    }
  };

  const moveCondition = async (conditionToMove: MatrixContractCondition, direction: 'up' | 'down') => {
    const sortedConditions = [...conditions].sort((a, b) => a.order - b.order);
    const currentIndex = sortedConditions.findIndex(c => c.id === conditionToMove.id);

    if (currentIndex === -1) return;

    let targetIndex;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < sortedConditions.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return;
    }

    const newOrderArray = [...sortedConditions];
    [newOrderArray[currentIndex], newOrderArray[targetIndex]] = [newOrderArray[targetIndex], newOrderArray[currentIndex]];

    const newConditionIds = newOrderArray.map(c => c.id);

    try {
      await reorderMatrixConditionsApi(newConditionIds, userId);
      toast.success('Order updated successfully');
      loadConditions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder.';
      toast.error(errorMessage);
      loadConditions();
    }
  };

  const moveConditionUp = (condition: MatrixContractCondition) => moveCondition(condition, 'up');
  const moveConditionDown = (condition: MatrixContractCondition) => moveCondition(condition, 'down');

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
        {/* Tampilkan Loading state */}
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading conditions...
          </div>
        ) : (
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
                // Pastikan kondisi selalu di-sort berdasarkan 'order' untuk tampilan
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
        )}
      </div>

      {/* Add/Edit Dialog (Sama seperti sebelumnya) */}
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

      {/* Delete Confirmation Dialog  */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Matrix Condition</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>

          {conditionToDelete && (
            <div className="py-4">
              {/* ... (Detail Kondisi) ... */}

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong>
                  Deactivate hanya menonaktifkan status `IsActive`.
                  Permanent Delete (Soft Delete) akan menonaktifkan status **DAN** mengisi kolom `DeletedAt/DeletedBy` untuk tujuan audit.
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
              onClick={() => handleDelete(false)} // false = Deactivate
              className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
            >
              Deactivate Only
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(true)} // true = Permanent Delete (Soft Delete Logis)
            >
              Permanent Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}