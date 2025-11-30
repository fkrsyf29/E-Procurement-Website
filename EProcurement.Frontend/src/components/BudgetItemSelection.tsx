import { useState, useMemo, useEffect } from 'react';
import { Search, CheckSquare, Square, Trash2, X, ArrowUpDown, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Material, BudgetItem } from '../types';
import { toast } from 'sonner';
import { formatNumberWithSeparator } from '../utils/formatters';

interface BudgetItemSelectionProps {
  materials: Material[];
  selectedSubClassifications: string[];
  budgetItems: BudgetItem[];
  onBudgetItemsChange: (items: BudgetItem[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJobsite: string; 
}

type SortField = 'materialCode' | 'description' | 'brand' | 'subClassification' | 'plant';
type SortDirection = 'asc' | 'desc' | null;

export function BudgetItemSelection({ 
  materials, 
  selectedSubClassifications,
  budgetItems,
  onBudgetItemsChange,
  open,
  onOpenChange,
  selectedJobsite
}: BudgetItemSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(
    new Set(budgetItems.map(item => item.materialId || ''))
  );
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  useEffect(() => {
    // Ensure valid IDs are used
    const validIds = budgetItems
        .map(item => item.materialId)
        .filter((id): id is string => !!id);
    setSelectedMaterialIds(new Set(validIds));
  }, [budgetItems]);

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    // PLANT FILTERING
    if (selectedJobsite && selectedJobsite !== 'JAHO') {
      filtered = filtered.filter(m => m.jobsite === selectedJobsite || m.jobsiteName === selectedJobsite);
    }

    // Filter by sub-classification
    if (selectedSubClassifications.length > 0) {
      filtered = filtered.filter(m => 
        selectedSubClassifications.some(subClass => 
          (m.subClassification || m.subClassificationName || '').toLowerCase().includes(subClass.toLowerCase())
        )
      );
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        (m.material || m.materialCode || '').toLowerCase().includes(search) ||
        (m.materialDescription || m.description || '').toLowerCase().includes(search) ||
        (m.extMaterialGroup || m.externalBrandName || '').toLowerCase().includes(search) ||
        (m.plant || m.jobsiteName || '').toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = '';
        let bVal = '';
        
        switch (sortField) {
          case 'materialCode':
            aVal = a.material || a.materialCode || '';
            bVal = b.material || b.materialCode || '';
            break;
          case 'description':
            aVal = a.materialDescription || a.description || '';
            bVal = b.materialDescription || b.description || '';
            break;
          case 'brand':
            aVal = a.extMaterialGroup || a.externalBrandName || '';
            bVal = b.extMaterialGroup || b.externalBrandName || '';
            break;
          case 'subClassification':
            aVal = a.subClassification || a.subClassificationName || '';
            bVal = b.subClassification || b.subClassificationName || '';
            break;
          case 'plant':
            aVal = a.plant || a.jobsiteName || '';
            bVal = b.plant || b.jobsiteName || '';
            break;
        }
        
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [materials, selectedSubClassifications, searchTerm, sortField, sortDirection, selectedJobsite]);

  const handleMaterialToggle = (material: Material) => {
    const isSelected = selectedMaterialIds.has(material.id);
    const newSelectedIds = new Set(selectedMaterialIds);

    if (isSelected) {
      newSelectedIds.delete(material.id);
      const newBudgetItems = budgetItems.filter(item => item.materialId !== material.id);
      onBudgetItemsChange(newBudgetItems);
    } else {
      newSelectedIds.add(material.id);
      const newBudgetItem: BudgetItem = {
        id: `budget-${Date.now()}-${material.id}`,
        materialId: material.id,
        materialCode: material.material || material.materialCode,
        materialDescription: material.materialDescription || material.description || '',
        uom: material.baseUnitOfMeasure || material.uomName || 'EA',
        brand: material.extMaterialGroup || material.externalBrandName,
        qty: 0,
        estimatedPrice: 0,
        totalPrice: 0, // Init
        unique: undefined,
        subClassification: material.subClassification || material.subClassificationName,
        plant: material.plant || material.jobsiteName,
        contractType: material.contractType,
        contractNo: material.contractNumber,
        contractName: material.contractName,
        currency: 'USD',
        
        // Placeholders
        placeholderQty: material.qty || undefined,
        placeholderPrice: material.estimatedPrice || undefined,
        placeholderUnique: material.unique || undefined
      };
      onBudgetItemsChange([...budgetItems, newBudgetItem]);
    }

    setSelectedMaterialIds(newSelectedIds);
  };

  const handleSelectAll = () => {
    const newBudgetItems = [...budgetItems];
    const newSelectedIds = new Set(selectedMaterialIds);

    filteredMaterials.forEach(material => {
      if (!selectedMaterialIds.has(material.id)) {
        newSelectedIds.add(material.id);
        const newBudgetItem: BudgetItem = {
          id: `budget-${Date.now()}-${material.id}`,
          materialId: material.id,
          materialCode: material.material || material.materialCode,
          materialDescription: material.materialDescription || material.description || '',
          uom: material.baseUnitOfMeasure || material.uomName || 'EA',
          brand: material.extMaterialGroup || material.externalBrandName,
          qty: 0,
          estimatedPrice: 0,
          totalPrice: 0,
          unique: undefined,
          subClassification: material.subClassification || material.subClassificationName,
          plant: material.plant || material.jobsiteName,
          contractType: material.contractType,
          contractNo: material.contractNumber,
          contractName: material.contractName,
          currency: 'USD',
          placeholderQty: material.qty || undefined,
          placeholderPrice: material.estimatedPrice || undefined,
          placeholderUnique: material.unique || undefined
        };
        newBudgetItems.push(newBudgetItem);
      }
    });

    setSelectedMaterialIds(newSelectedIds);
    onBudgetItemsChange(newBudgetItems);
    toast.success(`Selected ${filteredMaterials.length} items`);
  };

  const handleDeselectAll = () => {
    const filteredMaterialIds = new Set(filteredMaterials.map(m => m.id));
    const newSelectedIds = new Set(
      Array.from(selectedMaterialIds).filter(id => !filteredMaterialIds.has(id))
    );
    const newBudgetItems = budgetItems.filter(item => item.materialId && !filteredMaterialIds.has(item.materialId));

    setSelectedMaterialIds(newSelectedIds);
    onBudgetItemsChange(newBudgetItems);
    toast.success(`Deselected items`);
  };

  const handleQtyChange = (materialId: string, value: string) => {
    const qty = parseFloat(value) || 0;
    const newBudgetItems = budgetItems.map(item => {
      if (item.materialId === materialId) {
         return { ...item, qty, totalPrice: qty * (item.estimatedPrice || 0) };
      }
      return item;
    });
    onBudgetItemsChange(newBudgetItems);
  };

  const handlePriceChange = (materialId: string, value: string) => {
    const price = parseFloat(value) || 0;
    const newBudgetItems = budgetItems.map(item => {
       if (item.materialId === materialId) {
           return { ...item, estimatedPrice: price, totalPrice: (item.qty || 0) * price };
       }
       return item;
    });
    onBudgetItemsChange(newBudgetItems);
  };

  const handleUniqueChange = (materialId: string, value: 'Yes' | 'No') => {
    const newBudgetItems = budgetItems.map(item =>
      item.materialId === materialId ? { ...item, unique: value } : item
    );
    onBudgetItemsChange(newBudgetItems);
  };

  const handleRemoveItem = (materialId: string) => {
    const newSelectedIds = new Set(selectedMaterialIds);
    newSelectedIds.delete(materialId);
    setSelectedMaterialIds(newSelectedIds);
    
    const newBudgetItems = budgetItems.filter(item => item.materialId !== materialId);
    onBudgetItemsChange(newBudgetItems);
    toast.success('Item removed from budget');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const totalEstimatedCost = useMemo(() => {
    return budgetItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }, [budgetItems]);

  const handleSaveItems = () => {
    onOpenChange(false);
    toast.success(`${budgetItems.length} budget items saved`);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const getBudgetItem = (materialId: string): BudgetItem | undefined => {
    return budgetItems.find(item => item.materialId === materialId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Budget Item Selection</DialogTitle>
          <DialogDescription>
            Select materials and specify quantities and estimated prices
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button 
                onClick={handleSelectAll} 
                variant="outline" 
                size="sm"
                disabled={filteredMaterials.length === 0}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All ({filteredMaterials.length})
              </Button>
              <Button 
                onClick={handleDeselectAll} 
                variant="outline" 
                size="sm"
                disabled={selectedMaterialIds.size === 0}
              >
                <Square className="w-4 h-4 mr-2" />
                Deselect All
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveItems} variant="default" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Items ({budgetItems.length})
              </Button>
              <Button onClick={handleClose} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>

          {/* Stats and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">Filtered Materials</p>
                <p className="text-xl text-blue-900 mt-1">{filteredMaterials.length}</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm text-teal-800">Selected Items</p>
                <p className="text-xl text-teal-900 mt-1">{budgetItems.length}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">Total Estimated Cost</p>
                <p className="text-xl text-purple-900 mt-1">
                  {formatNumberWithSeparator(totalEstimatedCost)}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by material code, description, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Material Selection Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-700 w-12">Select</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">
                      <button onClick={() => handleSort('materialCode')} className="flex items-center gap-2 hover:text-blue-600">
                        Material Code {getSortIcon('materialCode')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">
                      <button onClick={() => handleSort('description')} className="flex items-center gap-2 hover:text-blue-600">
                        Description {getSortIcon('description')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">UoM</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">
                      <button onClick={() => handleSort('brand')} className="flex items-center gap-2 hover:text-blue-600">
                        Brand {getSortIcon('brand')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700 min-w-[140px]">Unique</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700 w-24">Plant</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700 min-w-[200px]">
                      <button onClick={() => handleSort('subClassification')} className="flex items-center gap-2 hover:text-blue-600">
                        Sub-Classification {getSortIcon('subClassification')}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700 min-w-[180px]">Qty</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700 min-w-[180px]">Price (USD)</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-700 min-w-[180px]">Total</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700 w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                        {selectedSubClassifications.length === 0 
                          ? 'Please select at least one sub-classification to view materials'
                          : 'No materials found matching your criteria'
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((material) => {
                      const isSelected = selectedMaterialIds.has(material.id);
                      const budgetItem = getBudgetItem(material.id);
                      
                      return (
                        <tr key={material.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleMaterialToggle(material)}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{material.material || material.materialCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{material.materialDescription || material.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{material.baseUnitOfMeasure || material.uomName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{material.extMaterialGroup || material.externalBrandName}</td>
                          <td className="px-4 py-3">
                            {isSelected && budgetItem ? (
                              <Select
                                value={budgetItem.unique || ''}
                                onValueChange={(value: 'Yes' | 'No') => handleUniqueChange(material.id, value)}
                              >
                                <SelectTrigger className="min-w-[120px] text-base font-semibold text-center">
                                  <SelectValue placeholder={budgetItem.placeholderUnique || 'Select'} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-sm text-gray-400 text-center block">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center font-semibold bg-blue-50">
                            {material.plant || material.jobsiteName || '-'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700 bg-purple-50">
                            <div className="max-w-[200px]">
                              {material.subClassification || material.subClassificationName || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isSelected && budgetItem ? (
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={budgetItem.qty || ''}
                                onChange={(e) => handleQtyChange(material.id, e.target.value)}
                                placeholder={budgetItem.placeholderQty ? String(budgetItem.placeholderQty) : 'Enter qty'}
                                className="min-w-[160px] text-base font-semibold text-center px-3 py-2"
                              />
                            ) : (
                              <span className="text-sm text-gray-400 text-center block">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isSelected && budgetItem ? (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={budgetItem.estimatedPrice || ''}
                                onChange={(e) => handlePriceChange(material.id, e.target.value)}
                                placeholder={budgetItem.placeholderPrice ? String(budgetItem.placeholderPrice) : 'Enter price'}
                                className="min-w-[160px] text-base font-semibold text-right px-3 py-2"
                              />
                            ) : (
                              <span className="text-sm text-gray-400 text-center block">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-base font-semibold text-gray-900 text-center">
                            {isSelected && budgetItem ? (
                              formatNumberWithSeparator(budgetItem.totalPrice || 0)
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isSelected && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(material.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {budgetItems.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={10} className="px-4 py-3 text-right text-gray-900">
                        <strong>Total Estimated Cost:</strong>
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-center">
                        <strong>{formatNumberWithSeparator(totalEstimatedCost)}</strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Save Button at Bottom */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {budgetItems.length > 0 
                ? `${budgetItems.length} item(s) selected with total cost: ${formatNumberWithSeparator(totalEstimatedCost)}`
                : 'No items selected'
              }
            </p>
            <Button onClick={handleSaveItems} variant="default">
              <Save className="w-4 h-4 mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}