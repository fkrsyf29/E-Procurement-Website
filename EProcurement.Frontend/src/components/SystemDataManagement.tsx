import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../types';
import { toast } from 'sonner@2.0.3';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown, Database, AlertCircle } from 'lucide-react';
import {
  ReferenceDataItem,
  ReferenceDataCategory,
  referenceDataCategories,
  getReferenceDataByCategory,
  createReferenceDataItem,
  updateReferenceDataItem,
  deleteReferenceDataItem,
  reorderReferenceDataItems,
} from '../data/systemReferenceData';

interface SystemDataManagementProps {
  user: User;
}

export function SystemDataManagement({ user }: SystemDataManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<ReferenceDataCategory | null>(null);
  const [items, setItems] = useState<ReferenceDataItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferenceDataItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form fields
  const [value, setValue] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    if (referenceDataCategories.length > 0) {
      setSelectedCategory(referenceDataCategories[0]);
      loadItems(referenceDataCategories[0].code);
    }
  }, []);
  
  const loadItems = (categoryCode: string) => {
    const categoryItems = getReferenceDataByCategory(categoryCode);
    setItems([...categoryItems].sort((a, b) => a.order - b.order));
  };
  
  const handleCategoryChange = (categoryCode: string) => {
    const category = referenceDataCategories.find(cat => cat.code === categoryCode);
    if (category) {
      setSelectedCategory(category);
      loadItems(categoryCode);
      setSearchTerm('');
    }
  };
  
  const handleNewItem = () => {
    setEditingItem(null);
    setValue('');
    setAbbreviation('');
    setDescription('');
    setIsActive(true);
    setShowForm(true);
  };
  
  const handleEditItem = (item: ReferenceDataItem) => {
    setEditingItem(item);
    setValue(item.value);
    setAbbreviation(item.abbreviation || '');
    // Check if item has description (for Material Group)
    setDescription((item as any).description || '');
    setIsActive(item.isActive);
    setShowForm(true);
  };
  
  const handleDeleteItem = (item: ReferenceDataItem) => {
    if (!selectedCategory) return;
    
    if (window.confirm(`Are you sure you want to delete "${item.value}"?`)) {
      const success = deleteReferenceDataItem(selectedCategory.code, item.id);
      if (success) {
        toast.success('Item deleted successfully');
        loadItems(selectedCategory.code);
      } else {
        toast.error('Failed to delete item');
      }
    }
  };
  
  const handleSaveItem = () => {
    if (!selectedCategory) return;
    
    if (!value.trim()) {
      toast.error('Please enter a value');
      return;
    }
    
    // Check for duplicates
    const existingItems = getReferenceDataByCategory(selectedCategory.code);
    const isDuplicate = existingItems.some(
      item => item.value.toLowerCase() === value.trim().toLowerCase() && 
      (!editingItem || item.id !== editingItem.id)
    );
    
    if (isDuplicate) {
      toast.error('This value already exists in this category');
      return;
    }
    
    if (editingItem) {
      // Update existing item
      const updates: Partial<ReferenceDataItem> = { 
        value: value.trim(), 
        isActive 
      };
      
      // Add abbreviation if category supports it (jobsite or department)
      if (selectedCategory.code === 'jobsite' || selectedCategory.code === 'department') {
        updates.abbreviation = abbreviation.trim() || undefined;
      }
      
      // Add description if category supports it (materialGroup or kbli)
      if (selectedCategory.code === 'materialGroup' || selectedCategory.code === 'kbli') {
        (updates as any).description = description.trim();
      }
      
      const updated = updateReferenceDataItem(selectedCategory.code, editingItem.id, updates);
      
      if (updated) {
        toast.success('Item updated successfully');
        loadItems(selectedCategory.code);
        setShowForm(false);
        resetForm();
      } else {
        toast.error('Failed to update item');
      }
    } else {
      // Create new item
      const newItem = createReferenceDataItem(selectedCategory.code, value.trim());
      
      if (newItem) {
        // Update with abbreviation if applicable
        if (selectedCategory.code === 'jobsite' || selectedCategory.code === 'department') {
          if (abbreviation.trim()) {
            updateReferenceDataItem(selectedCategory.code, newItem.id, { 
              abbreviation: abbreviation.trim() 
            });
          }
        }
        
        // Update with description if applicable (materialGroup or kbli)
        if (selectedCategory.code === 'materialGroup' || selectedCategory.code === 'kbli') {
          if (description.trim()) {
            updateReferenceDataItem(selectedCategory.code, newItem.id, { 
              description: description.trim() 
            } as any);
          }
        }
        
        toast.success('Item created successfully');
        loadItems(selectedCategory.code);
        setShowForm(false);
        resetForm();
      } else {
        toast.error('Failed to create item');
      }
    }
  };
  
  const resetForm = () => {
    setValue('');
    setAbbreviation('');
    setDescription('');
    setIsActive(true);
    setEditingItem(null);
  };
  
  const moveItemUp = (item: ReferenceDataItem) => {
    if (!selectedCategory) return;
    
    const sorted = [...items];
    const index = sorted.findIndex(i => i.id === item.id);
    
    if (index > 0) {
      [sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]];
      reorderReferenceDataItems(selectedCategory.code, sorted);
      loadItems(selectedCategory.code);
      toast.success('Order updated');
    }
  };
  
  const moveItemDown = (item: ReferenceDataItem) => {
    if (!selectedCategory) return;
    
    const sorted = [...items];
    const index = sorted.findIndex(i => i.id === item.id);
    
    if (index < sorted.length - 1) {
      [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
      reorderReferenceDataItems(selectedCategory.code, sorted);
      loadItems(selectedCategory.code);
      toast.success('Order updated');
    }
  };
  
  const toggleActive = (item: ReferenceDataItem) => {
    if (!selectedCategory) return;
    
    const updates = { isActive: !item.isActive };
    updateReferenceDataItem(selectedCategory.code, item.id, updates);
    loadItems(selectedCategory.code);
    toast.success(`Item ${item.isActive ? 'deactivated' : 'activated'}`);
  };
  
  const filteredItems = items.filter(item =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if user is admin
  if (user.roleName !== 'Administrator') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access Denied: Only administrators can manage system data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-2">System Data Management</h1>
        <p className="text-gray-600">
          Manage all validation lists and reference data used throughout the system.
        </p>
      </div>
      
      {/* Category Selection */}
      <div className="mb-6 bg-white border rounded-lg p-6">
        <Label htmlFor="category" className="mb-2 block">Select Data Category</Label>
        <div className="max-w-md">
          <Select 
            value={selectedCategory?.code || ''} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {referenceDataCategories.map((cat) => (
                <SelectItem key={cat.code} value={cat.code}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-gray-500">{cat.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCategory && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <Database className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900">
                <strong>{selectedCategory.name}</strong>: {selectedCategory.description}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Total items: {items.length} | Active: {items.filter(i => i.isActive).length}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {selectedCategory && (
        <>
          {/* Actions Bar */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <Input
                placeholder={`Search ${selectedCategory.name.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleNewItem} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add {selectedCategory.name}
            </Button>
          </div>
          
          {/* Items Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6F2FF]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-900 w-16">Order</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-900">{selectedCategory?.code === 'kbli' ? 'KBLI Code' : 'Value'}</th>
                    {(selectedCategory?.code === 'jobsite' || selectedCategory?.code === 'department') && (
                      <th className="px-4 py-3 text-left text-sm text-gray-900 w-32">Code</th>
                    )}
                    {(selectedCategory?.code === 'materialGroup' || selectedCategory?.code === 'kbli') && (
                      <th className="px-4 py-3 text-left text-sm text-gray-900">Description</th>
                    )}
                    <th className="px-4 py-3 text-center text-sm text-gray-900 w-24">Active</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-900 w-32">Last Updated</th>
                    <th className="px-4 py-3 text-center text-sm text-gray-900 w-48">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={
                        (selectedCategory?.code === 'jobsite' || selectedCategory?.code === 'department') ? 6 : 
                        (selectedCategory?.code === 'materialGroup' || selectedCategory?.code === 'kbli') ? 6 : 5
                      } className="px-4 py-8 text-center text-gray-500">
                        {searchTerm ? 'No items found matching your search.' : `No ${selectedCategory.name.toLowerCase()} items found.`}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index, array) => (
                      <tr key={item.id} className={`border-t hover:bg-gray-50 ${!item.isActive ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.order}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.value}
                          {!item.isActive && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">Inactive</span>
                          )}
                        </td>
                        {(selectedCategory?.code === 'jobsite' || selectedCategory?.code === 'department') && (
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.abbreviation ? (
                              <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{item.abbreviation}</code>
                            ) : (
                              <span className="text-gray-400 text-xs">No code</span>
                            )}
                          </td>
                        )}
                        {(selectedCategory?.code === 'materialGroup' || selectedCategory?.code === 'kbli') && (
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {(item as any).description || <span className="text-gray-400 text-xs">No description</span>}
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => toggleActive(item)}
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">
                          {item.updatedAt}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveItemUp(item)}
                              disabled={index === 0}
                              title="Move up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveItemDown(item)}
                              disabled={index === array.length - 1}
                              title="Move down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Info Box */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm text-amber-900 mb-2">⚠️ Important Notes</h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li><strong>Order</strong>: Items are displayed in forms according to their order (use arrows to reorder)</li>
                <li><strong>Active Status</strong>: Only active items appear in dropdown lists throughout the system</li>
                {(selectedCategory?.code === 'jobsite' || selectedCategory?.code === 'department') && (
                  <li><strong>Codes/Abbreviations</strong>: Used for auto-generating proposal numbers (format: 001/JobsiteCode/DeptCode/Month/Year)</li>
                )}
                <li><strong>Deactivate vs Delete</strong>: Deactivating preserves historical data; deleting removes completely</li>
                <li><strong>System Impact</strong>: Changes take effect immediately in all forms and dropdowns</li>
                <li><strong>User Roles</strong>: Modifying user roles may affect access permissions system-wide</li>
              </ul>
            </div>
          </div>
        </>
      )}
      
      {/* Item Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'New'} {selectedCategory?.name}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the item details below' : `Add a new ${selectedCategory?.name.toLowerCase()} to the system`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter ${selectedCategory?.name.toLowerCase()} name`}
                autoFocus
              />
            </div>
            
            {/* Abbreviation field - only for jobsite and department */}
            {(selectedCategory?.code === 'jobsite' || selectedCategory?.code === 'department') && (
              <div>
                <Label htmlFor="abbreviation">
                  {selectedCategory?.code === 'jobsite' ? 'Jobsite Code' : 'Department Code'}
                  {selectedCategory?.code === 'jobsite' && <span className="text-xs text-gray-500 ml-1">(for proposal number generation)</span>}
                </Label>
                <Input
                  id="abbreviation"
                  value={abbreviation}
                  onChange={(e) => setAbbreviation(e.target.value.toUpperCase())}
                  placeholder={selectedCategory?.code === 'jobsite' ? 'e.g., 40AB, 40AC' : 'e.g., PLANT, HR, GA'}
                  maxLength={selectedCategory?.code === 'jobsite' ? 4 : 10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCategory?.code === 'jobsite' 
                    ? 'This code will be used in auto-generated proposal numbers (e.g., 001/40AB/PLANT/XI/2025)'
                    : 'This code will be used in auto-generated proposal numbers (e.g., 001/40AB/PLANT/XI/2025)'}
                </p>
              </div>
            )}
            
            {/* Description field - for materialGroup and kbli */}
            {selectedCategory?.code === 'materialGroup' && (
              <div>
                <Label htmlFor="description">
                  Material Group Description *
                  <span className="text-xs text-gray-500 ml-1">(auto-fills in Annual Purchase Plan)</span>
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.toUpperCase())}
                  placeholder="e.g., HEAVY CONSTRUCTION MACHINERY AND EQ/HEAVY EQ COMPONENTS"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This description will auto-fill when Material Group is selected in Annual Purchase Plan
                </p>
              </div>
            )}
            
            {/* Description field - for KBLI */}
            {selectedCategory?.code === 'kbli' && (
              <div>
                <Label htmlFor="description">
                  KBLI Description *
                  <span className="text-xs text-gray-500 ml-1">(business activity description)</span>
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Perdagangan Besar Suku Cadang Kendaraan Bermotor"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Description of the business activity according to KBLI classification
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (available for use in dropdowns)
              </Label>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveItem}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
