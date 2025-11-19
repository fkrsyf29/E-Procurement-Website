import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { User } from '../types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown, FileText, Cog } from 'lucide-react';
import {
  TORItemDefinition,
  TERItemDefinition,
  getAllTORDefinitions,
  getAllTERDefinitions,
  createTORDefinition,
  createTERDefinition,
  updateTORDefinition,
  updateTERDefinition,
  deleteTORDefinition,
  deleteTERDefinition,
  reorderTORDefinitions,
  reorderTERDefinitions,
} from '../data/torterItemDefinitions';

interface ItemDefinitionsManagementProps {
  user: User;
}

export function ItemDefinitionsManagement({ user }: ItemDefinitionsManagementProps) {
  const [activeTab, setActiveTab] = useState<'tor' | 'ter'>('tor');
  const [torDefinitions, setTorDefinitions] = useState<TORItemDefinition[]>([]);
  const [terDefinitions, setTERDefinitions] = useState<TERItemDefinition[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TORItemDefinition | TERItemDefinition | null>(null);
  
  // Form fields
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    loadDefinitions();
  }, []);
  
  const loadDefinitions = () => {
    setTorDefinitions(getAllTORDefinitions());
    setTERDefinitions(getAllTERDefinitions());
  };
  
  const handleNewItem = (category: 'tor' | 'ter') => {
    setActiveTab(category);
    setEditingItem(null);
    setCode('');
    setLabel('');
    setIsActive(true);
    setShowForm(true);
  };
  
  const handleEditItem = (item: TORItemDefinition | TERItemDefinition) => {
    setEditingItem(item);
    setActiveTab(item.category);
    setCode(item.code);
    setLabel(item.label);
    setIsActive(item.isActive);
    setShowForm(true);
  };
  
  const handleDeleteItem = (item: TORItemDefinition | TERItemDefinition) => {
    if (window.confirm(`Are you sure you want to delete "${item.label}"?`)) {
      let success = false;
      if (item.category === 'tor') {
        success = deleteTORDefinition(item.id);
      } else {
        success = deleteTERDefinition(item.id);
      }
      
      if (success) {
        toast.success('Item definition deleted successfully');
        loadDefinitions();
      } else {
        toast.error('Failed to delete item definition');
      }
    }
  };
  
  const handleSaveItem = () => {
    if (!code || !label) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate code format (alphanumeric, camelCase recommended)
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(code)) {
      toast.error('Code must be alphanumeric and start with a letter (e.g., performanceSpec)');
      return;
    }
    
    if (editingItem) {
      // Update existing item
      const updates = { code, label, isActive };
      let success = null;
      
      if (editingItem.category === 'tor') {
        success = updateTORDefinition(editingItem.id, updates);
      } else {
        success = updateTERDefinition(editingItem.id, updates);
      }
      
      if (success) {
        toast.success('Item definition updated successfully');
        loadDefinitions();
        setShowForm(false);
        resetForm();
      } else {
        toast.error('Failed to update item definition');
      }
    } else {
      // Create new item
      if (activeTab === 'tor') {
        createTORDefinition(code, label);
      } else {
        createTERDefinition(code, label);
      }
      
      toast.success('Item definition created successfully');
      loadDefinitions();
      setShowForm(false);
      resetForm();
    }
  };
  
  const resetForm = () => {
    setCode('');
    setLabel('');
    setIsActive(true);
    setEditingItem(null);
  };
  
  const moveItemUp = (item: TORItemDefinition | TERItemDefinition) => {
    if (item.category === 'tor') {
      const sorted = [...torDefinitions];
      const index = sorted.findIndex(d => d.id === item.id);
      if (index > 0) {
        [sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]];
        reorderTORDefinitions(sorted);
        loadDefinitions();
        toast.success('Order updated');
      }
    } else {
      const sorted = [...terDefinitions];
      const index = sorted.findIndex(d => d.id === item.id);
      if (index > 0) {
        [sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]];
        reorderTERDefinitions(sorted);
        loadDefinitions();
        toast.success('Order updated');
      }
    }
  };
  
  const moveItemDown = (item: TORItemDefinition | TERItemDefinition) => {
    if (item.category === 'tor') {
      const sorted = [...torDefinitions];
      const index = sorted.findIndex(d => d.id === item.id);
      if (index < sorted.length - 1) {
        [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
        reorderTORDefinitions(sorted);
        loadDefinitions();
        toast.success('Order updated');
      }
    } else {
      const sorted = [...terDefinitions];
      const index = sorted.findIndex(d => d.id === item.id);
      if (index < sorted.length - 1) {
        [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
        reorderTERDefinitions(sorted);
        loadDefinitions();
        toast.success('Order updated');
      }
    }
  };
  
  const toggleActive = (item: TORItemDefinition | TERItemDefinition) => {
    const updates = { isActive: !item.isActive };
    
    if (item.category === 'tor') {
      updateTORDefinition(item.id, updates);
    } else {
      updateTERDefinition(item.id, updates);
    }
    
    loadDefinitions();
    toast.success(`Item ${item.isActive ? 'deactivated' : 'activated'}`);
  };
  
  // Check if user is admin
  if (user.roleName !== 'Administrator') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access Denied: Only administrators can manage item definitions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-2">TOR/TER Item Definitions</h1>
        <p className="text-gray-600">
          Manage the available item types for Terms of Reference (TOR) and Technical Evaluation Requirements (TER).
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('tor')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'tor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          TOR Items ({torDefinitions.length})
        </button>
        <button
          onClick={() => setActiveTab('ter')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'ter'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Cog className="w-4 h-4 inline-block mr-2" />
          TER Items ({terDefinitions.length})
        </button>
      </div>
      
      {/* Add New Button */}
      <div className="mb-6">
        <Button
          onClick={() => handleNewItem(activeTab)}
          className={activeTab === 'tor' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === 'tor' ? 'TOR' : 'TER'} Item
        </Button>
      </div>
      
      {/* Items List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={activeTab === 'tor' ? 'bg-blue-50' : 'bg-green-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-900 w-16">Order</th>
                <th className="px-4 py-3 text-left text-sm text-gray-900">Code</th>
                <th className="px-4 py-3 text-left text-sm text-gray-900">Label</th>
                <th className="px-4 py-3 text-center text-sm text-gray-900 w-24">Active</th>
                <th className="px-4 py-3 text-center text-sm text-gray-900 w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'tor' ? torDefinitions : terDefinitions).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No {activeTab === 'tor' ? 'TOR' : 'TER'} item definitions found.
                  </td>
                </tr>
              ) : (
                (activeTab === 'tor' ? torDefinitions : terDefinitions).map((item, index, array) => (
                  <tr key={item.id} className={`border-t hover:bg-gray-50 ${!item.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.order}</td>
                    <td className="px-4 py-3 text-sm">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{item.code}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.label}</td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => toggleActive(item)}
                      />
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
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm text-blue-900 mb-2">ℹ️ About Item Definitions</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Code</strong>: Unique identifier in camelCase (e.g., performanceSpec, brandSpec)</li>
          <li><strong>Label</strong>: Display name shown to users in forms</li>
          <li><strong>Order</strong>: Display order in forms (use arrows to reorder)</li>
          <li><strong>Active</strong>: Only active items appear in the matrix management and proposal forms</li>
          <li>Deleting an item will remove it from all future proposals, but won't affect existing data</li>
        </ul>
      </div>
      
      {/* Item Definition Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'New'} {activeTab === 'tor' ? 'TOR' : 'TER'} Item Definition
            </DialogTitle>
            <DialogDescription>
              Define a new item type that will be available in the matrix configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Code (Unique Identifier) *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., performanceSpec, brandSpec"
                disabled={!!editingItem}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use camelCase, alphanumeric only. Cannot be changed after creation.
              </p>
            </div>
            
            <div>
              <Label htmlFor="label">Label (Display Name) *</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Performance Specification"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is what users will see in forms.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (available for use)
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
              className={activeTab === 'tor' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Item Definition
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
