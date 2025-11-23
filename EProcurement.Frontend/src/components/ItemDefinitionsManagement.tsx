// ItemDefinitionsManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { User } from '../types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown, FileText, Cog } from 'lucide-react';
import {
  fetchAllItemDefinitions,
  createItemDefinition,
  updateItemDefinition,
  deleteItemDefinition,
  reorderItemDefinitions,
  getItemDefinitionById
  // Tipe API data
} from '../services/itemDefinitionApi';
import { ItemCategory, ItemDefinition, ItemDefinitionApiData } from '../types/itemDefinitionTypes'


interface ItemDefinitionsManagementProps {
  user: User;
}

export function ItemDefinitionsManagement({ user }: ItemDefinitionsManagementProps) {
  const [activeTab, setActiveTab] = useState<'tor' | 'ter'>('tor');
  const [allDefinitions, setAllDefinitions] = useState<ItemDefinition[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Pisahkan definisi berdasarkan kategori untuk tampilan
  const torDefinitions = useMemo(() =>
    allDefinitions.filter(item => item.category === 'tor'),
    [allDefinitions]
  );
  const terDefinitions = useMemo(() =>
    allDefinitions.filter(item => item.category === 'ter'),
    [allDefinitions]
  );
  console.warn('allDefinitions -> ',allDefinitions );
  console.warn('torDefinitions -> ',torDefinitions );
  console.warn('terDefinitions -> ', terDefinitions);

  useEffect(() => {
    loadDefinitions();
  }, []);

  const loadDefinitions = async () => {
    setIsLoading(true);
    try {
        const definitions = await fetchAllItemDefinitions();
        setAllDefinitions(definitions);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load definitions.';
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleNewItem = (category: ItemCategory) => {
    setActiveTab(category);
    setEditingItem(null);
    setCode('');
    setLabel('');
    setIsActive(true);
    setShowForm(true);
  };

  const handleEditItem = (item: ItemDefinition) => {
    setEditingItem(item);
    setActiveTab(item.category);
    setCode(item.code);
    setLabel(item.label);
    setIsActive(item.isActive);
    setShowForm(true);
  };

  const handleDeleteItem = async (item: ItemDefinition) => {
    if (window.confirm(`Are you sure you want to permanently delete (audit trail preserved) "${item.label}"? This action will disable the item.`)) {
      
      try {
        const currentApiData: ItemDefinitionApiData = await getItemDefinitionById(item.id);

        const updates = { 
            isActive: false, 
        }; 
        
        await updateItemDefinition(item.id, updates, currentApiData, user.username,true);

        toast.success(`Item definition deleted (soft deleted) successfully.`);
        loadDefinitions();

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to execute permanent delete.';
        toast.error(errorMessage);
      }
    }
};
  
  const handleSaveItem = async () => {
    if (!code || !label) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(code)) {
      toast.error('Code must be alphanumeric and start with a letter (e.g., performanceSpec)');
      return;
    }
    
    try {
      if (editingItem) {
        // UPDATE
        const currentApiData: ItemDefinitionApiData = await getItemDefinitionById(editingItem.id);
        const updates = { 
            code, 
            label, 
            isActive, 
            // Note: validationSource tidak ada di form, jadi diabaikan di sini
        }; 
        await updateItemDefinition(editingItem.id, updates, currentApiData, user.username,false);

      } else {
        // CREATE
        const currentList = activeTab === 'tor' ? torDefinitions : terDefinitions;
        const maxOrder = currentList.reduce((max, d) => Math.max(max, d.order), 0);
        
        const newOrder = maxOrder + 1;

        const newDef = {
            code,
            label,
            category: activeTab,
            order: newOrder,
            validationSource: null, // Asumsi default null
        };
        await createItemDefinition(newDef, user.username);
      }
      
      loadDefinitions();
      setShowForm(false);
      resetForm();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during save.';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setCode('');
    setLabel('');
    setIsActive(true);
    setEditingItem(null);
  };

  const updateOrderInList = (list: ItemDefinition[], item: ItemDefinition, direction: 'up' | 'down'): ItemDefinition[] => {
    const sorted = [...list].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(d => d.id === item.id);
    
    if (index === -1) return list;

    let newIndex = index + (direction === 'up' ? -1 : 1);
    if (newIndex < 0 || newIndex >= sorted.length) return list;

    // Swap elements
    [sorted[index], sorted[newIndex]] = [sorted[newIndex], sorted[index]];

    return sorted;
};

  const moveItem = async (item: ItemDefinition, direction: 'up' | 'down') => {
    const currentList = item.category === 'tor' ? torDefinitions : terDefinitions;
    const newOrderList = updateOrderInList(currentList, item, direction);
    
    try {
        await reorderItemDefinitions(newOrderList, user.username);
        loadDefinitions(); // Muat ulang data setelah reorder
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to reorder items.';
        toast.error(errorMessage);
        loadDefinitions(); // Muat ulang data lama jika gagal
    }
  };
  
  const moveItemUp = (item: ItemDefinition) => moveItem(item, 'up');
  const moveItemDown = (item: ItemDefinition) => moveItem(item, 'down');

  const toggleActive = async (item: ItemDefinition) => {
    try {
        const currentApiData: ItemDefinitionApiData = await getItemDefinitionById(item.id);
        const updates = { isActive: !item.isActive };
        
        await updateItemDefinition(item.id, updates, currentApiData, user.username,false);
        
        loadDefinitions();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update status.';
        toast.error(errorMessage);
    }
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

  console.warn('activeTab -> ', activeTab);
  const currentDefinitions = activeTab === 'tor' ? torDefinitions : terDefinitions;
  console.warn('currentDefinitions -> ', currentDefinitions);

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
          className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'tor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          TOR Items ({torDefinitions.length})
        </button>
        <button
          onClick={() => setActiveTab('ter')}
          className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'ter'
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
              {currentDefinitions.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No {activeTab === 'tor' ? 'TOR' : 'TER'} item definitions found.
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading data...
                  </td>
                </tr>
              ) : (
                currentDefinitions.map((item, index, array) => (
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
