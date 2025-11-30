import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Database, Loader2 } from 'lucide-react'; // ArrowUp/Down dihapus dari import
import {
  fetchSystemDataApi,
  createSystemDataItemApi,
  updateSystemDataItemApi,
  deleteSystemDataItemApi,
  // reorderSystemDataItemsApi // Tidak dipakai dulu
} from '../services/systemDataApi';
import { ReferenceDataItem, ReferenceDataCategory } from '../types/systemDataTypes';

interface SystemDataManagementProps {
  user: User;
}

export function SystemDataManagement({ user }: SystemDataManagementProps) {
  const [categories, setCategories] = useState<ReferenceDataCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ReferenceDataCategory | null>(null);
  const [items, setItems] = useState<ReferenceDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk UI
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferenceDataItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [value, setValue] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    loadAllData();
  }, []);
  
  const loadAllData = async (targetCategoryCode?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchSystemDataApi();
      setCategories(data);

      if (targetCategoryCode) {
        const updatedCat = data.find(c => c.code === targetCategoryCode);
        if (updatedCat) {
          setSelectedCategory(updatedCat);
          setItems(updatedCat.items);
        }
      } else if (!selectedCategory && data.length > 0) {
        setSelectedCategory(data[0]);
        setItems(data[0].items);
      } else if (selectedCategory) {
        const currentCat = data.find(c => c.code === selectedCategory.code);
        if (currentCat) {
          setSelectedCategory(currentCat);
          setItems(currentCat.items);
        }
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategoryChange = (categoryCode: string) => {
    const category = categories.find(cat => cat.code === categoryCode);
    if (category) {
      setSelectedCategory(category);
      setItems(category.items);
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
    setDescription((item as any).description || '');
    setIsActive(item.isActive);
    setShowForm(true);
  };
  
  const handleDeleteItem = async (item: ReferenceDataItem) => {
    if (!selectedCategory) return;
    
    if (window.confirm(`Are you sure you want to delete "${item.value}"?`)) {
      try {
        await deleteSystemDataItemApi(selectedCategory.code, item.id, user.username);
        toast.success('Item deleted successfully');
        await loadAllData(selectedCategory.code);
      } catch (error) {
        toast.error((error as Error).message || 'Failed to delete item');
      }
    }
  };
  
  const handleSaveItem = async () => {
    if (!selectedCategory) return;
    
    if (!value.trim()) {
      toast.error('Please enter a value');
      return;
    }
    
    const isDuplicate = items.some(
      item => item.value.toLowerCase() === value.trim().toLowerCase() && 
      (!editingItem || item.id !== editingItem.id)
    );
    
    if (isDuplicate) {
      toast.error('This value already exists in this category');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const payload = { 
          value: value.trim(), 
          isActive,
          abbreviation: (selectedCategory.code === 'jobsite' || selectedCategory.code === 'department') 
            ? abbreviation.trim() || undefined 
            : undefined,
          description: (selectedCategory.code === 'materialGroup' || selectedCategory.code === 'kbli') 
            ? description.trim() || undefined 
            : undefined,
            user: user.username
        };
        
        await updateSystemDataItemApi(selectedCategory.code, editingItem.id, payload);
        toast.success('Item updated successfully');

      } else {
        const payload = {
          value: value.trim(),
          abbreviation: (selectedCategory.code === 'jobsite' || selectedCategory.code === 'department') 
            ? abbreviation.trim() || undefined 
            : undefined,
          description: (selectedCategory.code === 'materialGroup' || selectedCategory.code === 'kbli') 
            ? description.trim() || undefined 
            : undefined,
          user: user.username,
          isActive
        };
        
        await createSystemDataItemApi(selectedCategory.code, payload);
        toast.success('Item created successfully');
      }

      await loadAllData(selectedCategory.code);
      setShowForm(false);
      resetForm();

    } catch (error) {
      toast.error((error as Error).message || 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetForm = () => {
    setValue('');
    setAbbreviation('');
    setDescription('');
    setIsActive(true);
    setEditingItem(null);
  };
  
  const toggleActive = async (item: ReferenceDataItem) => {
    if (!selectedCategory) return;

    // ✅ REVISI 1: Guard Clause
    // Jika kategori tidak boleh diedit (Read Only), hentikan fungsi.
    // Ini mencegah perubahan state meskipun toggle di-klik.
    if (!selectedCategory.canAddEditDelete) {
        // Opsional: Tampilkan toast info
        // toast.info("System data cannot be modified directly.");
        return;
    }
    
    // Optimistic toggle
    const updatedItems = items.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i);
    setItems(updatedItems);

    try {
      const payload = {
        value: item.value,
        isActive: !item.isActive,
        abbreviation: item.abbreviation,
        description: (item as any).description,
        user: user.username
      };
      
      await updateSystemDataItemApi(selectedCategory.code, item.id, payload);
      toast.success(`Item ${!item.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update status');
      setItems(items); // Revert
    }
  };
  
  const filteredItems = items.filter(item =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (user.roleName !== 'Administrator') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access Denied: Only administrators can manage system data.</p>
        </div>
      </div>
    );
  }

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Loading system data...</p>
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
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
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
              <div className="flex items-center gap-2">
                <p className="text-sm text-blue-900 font-bold">{selectedCategory.name}</p>
                {!selectedCategory.canAddEditDelete && (
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-semibold">
                    Read Only (System)
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-800">{selectedCategory.description}</p>
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
            
            {selectedCategory.canAddEditDelete && (
              <Button onClick={handleNewItem} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedCategory.name}
              </Button>
            )}
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
                    
                    {selectedCategory.canAddEditDelete && (
                      <th className="px-4 py-3 text-center text-sm text-gray-900 w-48">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={
                        (selectedCategory?.code === 'jobsite' || selectedCategory?.code === 'department' || selectedCategory?.code === 'materialGroup' || selectedCategory?.code === 'kbli') 
                        ? (selectedCategory.canAddEditDelete ? 6 : 5) 
                        : (selectedCategory.canAddEditDelete ? 5 : 4)
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
                            {item.abbreviation ? <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{item.abbreviation}</code> : <span className="text-gray-400 text-xs">No code</span>}
                          </td>
                        )}
                        {(selectedCategory?.code === 'materialGroup' || selectedCategory?.code === 'kbli') && (
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {(item as any).description || <span className="text-gray-400 text-xs">No description</span>}
                          </td>
                        )}

                        <td className="px-4 py-3 text-center">
                          {/* ✅ REVISI 2: Switch Tampilan
                             Property 'disabled' dihapus agar terlihat terang/aktif.
                             Logic 'toggleActive' di atas sudah memblokir perubahan jika Read Only.
                          */}
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => toggleActive(item)}
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">
                          {item.updatedAt}
                        </td>

                        {selectedCategory.canAddEditDelete && (
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              {/* ✅ REVISI 3: Tombol Up/Down Dihilangkan (Hidden) */}
                              
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
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Form Dialog */}
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
              </div>
            )}
            
            {(selectedCategory?.code === 'materialGroup' || selectedCategory?.code === 'kbli') && (
              <div>
                <Label htmlFor="description">
                  {selectedCategory?.code === 'kbli' ? 'KBLI Description' : 'Material Group Description'} *
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(selectedCategory?.code === 'materialGroup' ? e.target.value.toUpperCase() : e.target.value)}
                  placeholder={selectedCategory?.code === 'materialGroup' ? 'e.g., HEAVY CONSTRUCTION' : 'e.g., Description'}
                />
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