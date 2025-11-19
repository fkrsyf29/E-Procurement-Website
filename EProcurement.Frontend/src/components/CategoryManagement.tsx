import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Save, X, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';
import {
  Category,
  Classification,
  SubClassification,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createClassification,
  updateClassification,
  deleteClassification,
  createSubClassification,
  updateSubClassification,
  deleteSubClassification,
} from '../data/categoryHierarchy';

type EntityType = 'category' | 'classification' | 'subClassification';

interface FormData {
  code: string;
  name: string;
  categoryCode?: string;
  classificationCode?: string;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>(getAllCategories());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedClassifications, setExpandedClassifications] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [entityType, setEntityType] = useState<EntityType>('category');
  const [formData, setFormData] = useState<FormData>({ code: '', name: '' });
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: EntityType; data: FormData } | null>(null);

  const refreshData = () => {
    setCategories([...getAllCategories()]);
  };

  const toggleCategory = (code: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleClassification = (code: string) => {
    const newExpanded = new Set(expandedClassifications);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedClassifications(newExpanded);
  };

  // Create handlers
  const handleCreateCategory = () => {
    setDialogMode('create');
    setEntityType('category');
    setFormData({ code: '', name: '' });
    setEditingItem(null);
    setShowDialog(true);
  };

  const handleCreateClassification = (categoryCode: string) => {
    setDialogMode('create');
    setEntityType('classification');
    setFormData({ code: '', name: '', categoryCode });
    setEditingItem(null);
    setShowDialog(true);
  };

  const handleCreateSubClassification = (categoryCode: string, classificationCode: string) => {
    setDialogMode('create');
    setEntityType('subClassification');
    setFormData({ code: '', name: '', categoryCode, classificationCode });
    setEditingItem(null);
    setShowDialog(true);
  };

  // Edit handlers
  const handleEditCategory = (category: Category) => {
    setDialogMode('edit');
    setEntityType('category');
    setFormData({ code: category.code, name: category.name });
    setEditingItem(category);
    setShowDialog(true);
  };

  const handleEditClassification = (categoryCode: string, classification: Classification) => {
    setDialogMode('edit');
    setEntityType('classification');
    setFormData({ code: classification.code, name: classification.name, categoryCode });
    setEditingItem(classification);
    setShowDialog(true);
  };

  const handleEditSubClassification = (
    categoryCode: string,
    classificationCode: string,
    subClassification: SubClassification
  ) => {
    setDialogMode('edit');
    setEntityType('subClassification');
    setFormData({ 
      code: subClassification.code, 
      name: subClassification.name, 
      categoryCode,
      classificationCode 
    });
    setEditingItem(subClassification);
    setShowDialog(true);
  };

  // Delete handlers
  const handleDeleteCategory = (category: Category) => {
    setDeleteTarget({ type: 'category', data: { code: category.code, name: category.name } });
    setShowDeleteDialog(true);
  };

  const handleDeleteClassification = (categoryCode: string, classification: Classification) => {
    setDeleteTarget({ 
      type: 'classification', 
      data: { code: classification.code, name: classification.name, categoryCode } 
    });
    setShowDeleteDialog(true);
  };

  const handleDeleteSubClassification = (
    categoryCode: string,
    classificationCode: string,
    subClassification: SubClassification
  ) => {
    setDeleteTarget({ 
      type: 'subClassification', 
      data: { 
        code: subClassification.code, 
        name: subClassification.name, 
        categoryCode,
        classificationCode 
      } 
    });
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    let success = false;
    const { type, data } = deleteTarget;

    switch (type) {
      case 'category':
        success = deleteCategory(data.code);
        break;
      case 'classification':
        success = deleteClassification(data.categoryCode!, data.code);
        break;
      case 'subClassification':
        success = deleteSubClassification(data.categoryCode!, data.classificationCode!, data.code);
        break;
    }

    if (success) {
      toast.success(`${type} deleted successfully`);
      refreshData();
    } else {
      toast.error(`Failed to delete ${type}`);
    }

    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Code and name are required');
      return;
    }

    let success = false;

    if (dialogMode === 'create') {
      switch (entityType) {
        case 'category':
          const newCat = createCategory({ code: formData.code, name: formData.name });
          success = !!newCat;
          break;
        case 'classification':
          const newClass = createClassification(formData.categoryCode!, {
            code: formData.code,
            name: formData.name,
          });
          success = !!newClass;
          break;
        case 'subClassification':
          const newSub = createSubClassification(
            formData.categoryCode!,
            formData.classificationCode!,
            { code: formData.code, name: formData.name }
          );
          success = !!newSub;
          break;
      }

      if (success) {
        toast.success(`${entityType} created successfully`);
      } else {
        toast.error(`Failed to create ${entityType}`);
      }
    } else {
      // Edit mode
      const updates: any = {};
      if (formData.code !== editingItem?.code) updates.code = formData.code;
      if (formData.name !== editingItem?.name) updates.name = formData.name;

      switch (entityType) {
        case 'category':
          success = updateCategory(editingItem.code, updates);
          break;
        case 'classification':
          success = updateClassification(formData.categoryCode!, editingItem.code, updates);
          break;
        case 'subClassification':
          success = updateSubClassification(
            formData.categoryCode!,
            formData.classificationCode!,
            editingItem.code,
            updates
          );
          break;
      }

      if (success) {
        toast.success(`${entityType} updated successfully`);
      } else {
        toast.error(`Failed to update ${entityType}`);
      }
    }

    if (success) {
      refreshData();
      setShowDialog(false);
      setFormData({ code: '', name: '' });
      setEditingItem(null);
    }
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    return categories.map(cat => {
      const categoryMatch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cat.code.toLowerCase().includes(searchTerm.toLowerCase());

      const filteredClassifications = cat.classifications.map(cls => {
        const classificationMatch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   cls.code.toLowerCase().includes(searchTerm.toLowerCase());

        const filteredSubs = cls.subClassifications.filter(sub =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.code.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (classificationMatch || filteredSubs.length > 0) {
          return { ...cls, subClassifications: filteredSubs.length > 0 ? filteredSubs : cls.subClassifications };
        }
        return null;
      }).filter(Boolean) as Classification[];

      if (categoryMatch || filteredClassifications.length > 0) {
        return { ...cat, classifications: filteredClassifications.length > 0 ? filteredClassifications : cat.classifications };
      }
      return null;
    }).filter(Boolean) as Category[];
  }, [categories, searchTerm]);

  const getDialogTitle = () => {
    const action = dialogMode === 'create' ? 'Create' : 'Edit';
    const entity = entityType.replace(/([A-Z])/g, ' $1').trim();
    return `${action} ${entity.charAt(0).toUpperCase() + entity.slice(1)}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Category Management</h1>
          <p className="text-gray-600">Manage procurement categories, classifications, and sub-classifications</p>
        </div>
        <Button
          onClick={handleCreateCategory}
          style={{ backgroundColor: '#4DA3FF' }}
          className="text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search categories, classifications, or sub-classifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
            Total Categories
          </p>
          <p className="text-2xl" style={{ color: '#4DA3FF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {categories.length}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
            Total Classifications
          </p>
          <p className="text-2xl" style={{ color: '#4DA3FF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {categories.reduce((sum, cat) => sum + cat.classifications.length, 0)}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>
            Total Sub-Classifications
          </p>
          <p className="text-2xl" style={{ color: '#4DA3FF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {categories.reduce((sum, cat) => 
              sum + cat.classifications.reduce((s, cls) => s + cls.subClassifications.length, 0), 0
            )}
          </p>
        </div>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 space-y-2">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No matching categories found' : 'No categories yet'}
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.code} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Category Level */}
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                  style={{ backgroundColor: '#E8F4FF' }}
                  onClick={() => toggleCategory(category.code)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {expandedCategories.has(category.code) ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                    <div>
                      <span style={{ color: '#000000', fontWeight: '600' }}>{category.code}</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span style={{ color: '#000000' }}>{category.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateClassification(category.code)}
                      style={{ color: '#4DA3FF' }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Classifications */}
                {expandedCategories.has(category.code) && (
                  <div className="border-t border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
                    {category.classifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No classifications yet. Click + to add one.
                      </div>
                    ) : (
                      category.classifications.map((classification) => (
                        <div key={classification.code} className="border-b border-gray-100 last:border-b-0">
                          {/* Classification Level */}
                          <div
                            className="flex items-center justify-between p-3 pl-10 cursor-pointer hover:bg-gray-50"
                            style={{ backgroundColor: '#F8FBFF' }}
                            onClick={() => toggleClassification(classification.code)}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {expandedClassifications.has(classification.code) ? (
                                <ChevronDown className="w-3 h-3 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-600" />
                              )}
                              <div>
                                <span style={{ color: '#4DA3FF', fontWeight: '600', fontSize: '14px' }}>
                                  {classification.code}
                                </span>
                                <span className="mx-2 text-gray-400 text-sm">|</span>
                                <span style={{ color: '#000000', fontSize: '14px' }}>{classification.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateSubClassification(category.code, classification.code)}
                                style={{ color: '#4DA3FF' }}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClassification(category.code, classification)}
                              >
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClassification(category.code, classification)}
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          </div>

                          {/* Sub-Classifications */}
                          {expandedClassifications.has(classification.code) && (
                            <div className="bg-white">
                              {classification.subClassifications.length === 0 ? (
                                <div className="p-3 pl-16 text-center text-gray-500 text-sm">
                                  No sub-classifications yet. Click + to add one.
                                </div>
                              ) : (
                                classification.subClassifications.map((subClassification) => (
                                  <div
                                    key={subClassification.code}
                                    className="flex items-center justify-between p-3 pl-16 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                  >
                                    <div>
                                      <span style={{ color: '#6C757D', fontWeight: '600', fontSize: '13px' }}>
                                        {subClassification.code}
                                      </span>
                                      <span className="mx-2 text-gray-300 text-sm">|</span>
                                      <span style={{ color: '#000000', fontSize: '13px' }}>
                                        {subClassification.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleEditSubClassification(
                                            category.code,
                                            classification.code,
                                            subClassification
                                          )
                                        }
                                      >
                                        <Edit2 className="w-3 h-3 text-gray-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteSubClassification(
                                            category.code,
                                            classification.code,
                                            subClassification
                                          )
                                        }
                                      >
                                        <Trash2 className="w-3 h-3 text-red-600" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' 
                ? `Add a new ${entityType.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                : `Edit ${entityType.replace(/([A-Z])/g, ' $1').toLowerCase()} details`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm mb-2 block" style={{ color: '#000000', fontWeight: '600' }}>
                Code
              </label>
              <Input
                type="text"
                placeholder="Enter code (e.g., M, M.01, M.01.01)"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={dialogMode === 'edit'}
              />
            </div>

            <div>
              <label className="text-sm mb-2 block" style={{ color: '#000000', fontWeight: '600' }}>
                Name
              </label>
              <Input
                type="text"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: '#4DA3FF' }} className="text-white">
              <Save className="w-4 h-4 mr-2" />
              {dialogMode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.data.name}</strong>?
              {deleteTarget?.type === 'category' && (
                <span className="block mt-2 text-red-600">
                  This will also delete all classifications and sub-classifications under this category.
                </span>
              )}
              {deleteTarget?.type === 'classification' && (
                <span className="block mt-2 text-red-600">
                  This will also delete all sub-classifications under this classification.
                </span>
              )}
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              style={{ backgroundColor: '#DC3545' }}
              className="text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
