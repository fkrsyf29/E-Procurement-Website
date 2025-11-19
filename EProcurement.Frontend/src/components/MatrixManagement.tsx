import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { User } from '../types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Settings, ChevronRight, ChevronDown } from 'lucide-react';
import { MatrixEntry, getAllMatrixEntries, createMatrixEntry, updateMatrixEntry, deleteMatrixEntry } from '../data/torterMatrix';
import { getActiveTORDefinitions, getActiveTERDefinitions } from '../data/torterItemDefinitions';
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

interface MatrixManagementProps {
  user: User;
  onNavigateToItemDefinitions?: () => void;
}

type HierarchyLevel = 'category' | 'classification' | 'subclassification';

interface FormState {
  open: boolean;
  mode: 'add' | 'edit';
  level: HierarchyLevel;
  parentCategory?: string;
  parentClassification?: string;
  data?: any;
}

export function MatrixManagement({ user, onNavigateToItemDefinitions }: MatrixManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedClassifications, setExpandedClassifications] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formState, setFormState] = useState<FormState>({
    open: false,
    mode: 'add',
    level: 'category',
  });
  
  // Form fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showInTOR, setShowInTOR] = useState(false);
  const [showInTER, setShowInTER] = useState(false);
  
  // Dynamic item states for sub-classification TOR/TER mapping
  const [torItemStates, setTorItemStates] = useState<Record<string, boolean>>({});
  const [terItemStates, setTerItemStates] = useState<Record<string, boolean>>({});
  
  // Get dynamic definitions
  const torDefinitions = getActiveTORDefinitions();
  const terDefinitions = getActiveTERDefinitions();
  
  useEffect(() => {
    loadCategories();
    initializeItemStates();
  }, []);
  
  const initializeItemStates = () => {
    const torStates: Record<string, boolean> = {};
    const terStates: Record<string, boolean> = {};
    
    torDefinitions.forEach(def => {
      torStates[def.code] = false;
    });
    
    terDefinitions.forEach(def => {
      terStates[def.code] = false;
    });
    
    setTorItemStates(torStates);
    setTerItemStates(terStates);
  };
  
  const loadCategories = () => {
    const cats = getAllCategories();
    setCategories(cats);
  };
  
  const toggleCategory = (categoryCode: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryCode)) {
      newExpanded.delete(categoryCode);
    } else {
      newExpanded.add(categoryCode);
    }
    setExpandedCategories(newExpanded);
  };
  
  const toggleClassification = (classificationCode: string) => {
    const newExpanded = new Set(expandedClassifications);
    if (newExpanded.has(classificationCode)) {
      newExpanded.delete(classificationCode);
    } else {
      newExpanded.add(classificationCode);
    }
    setExpandedClassifications(newExpanded);
  };
  
  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setShowInTOR(false);
    setShowInTER(false);
    initializeItemStates();
  };
  
  // Add handlers
  const handleAddCategory = () => {
    resetForm();
    setFormState({
      open: true,
      mode: 'add',
      level: 'category',
    });
  };
  
  const handleAddClassification = (categoryCode: string) => {
    resetForm();
    setFormState({
      open: true,
      mode: 'add',
      level: 'classification',
      parentCategory: categoryCode,
    });
  };
  
  const handleAddSubClassification = (categoryCode: string, classificationCode: string) => {
    resetForm();
    setFormState({
      open: true,
      mode: 'add',
      level: 'subclassification',
      parentCategory: categoryCode,
      parentClassification: classificationCode,
    });
  };
  
  // Edit handlers
  const handleEditCategory = (category: Category) => {
    setCode(category.code);
    setName(category.name);
    setFormState({
      open: true,
      mode: 'edit',
      level: 'category',
      data: category,
    });
  };
  
  const handleEditClassification = (categoryCode: string, classification: Classification) => {
    setCode(classification.code);
    setName(classification.name);
    setFormState({
      open: true,
      mode: 'edit',
      level: 'classification',
      parentCategory: categoryCode,
      data: classification,
    });
  };
  
  const handleEditSubClassification = (categoryCode: string, classificationCode: string, subClassification: SubClassification) => {
    setCode(subClassification.code);
    setName(subClassification.name);
    
    // Load TOR/TER data from matrix entries
    const matrixEntries = getAllMatrixEntries();
    const matrixEntry = matrixEntries.find(e => e.subClassificationCode === subClassification.code);
    
    if (matrixEntry) {
      setDescription(matrixEntry.description);
      setShowInTOR(matrixEntry.showInTOR);
      setShowInTER(matrixEntry.showInTER);
      
      // Load TOR item states
      const newTorStates: Record<string, boolean> = {};
      torDefinitions.forEach(def => {
        const value = matrixEntry.torItems?.[def.code as keyof typeof matrixEntry.torItems];
        newTorStates[def.code] = value || false;
      });
      setTorItemStates(newTorStates);
      
      // Load TER item states
      const newTerStates: Record<string, boolean> = {};
      terDefinitions.forEach(def => {
        const value = matrixEntry.terItems?.[def.code as keyof typeof matrixEntry.terItems];
        newTerStates[def.code] = value || false;
      });
      setTerItemStates(newTerStates);
    }
    
    setFormState({
      open: true,
      mode: 'edit',
      level: 'subclassification',
      parentCategory: categoryCode,
      parentClassification: classificationCode,
      data: subClassification,
    });
  };
  
  // Delete handlers
  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"? This will delete all its classifications and sub-classifications.`)) {
      const success = deleteCategory(category.code);
      if (success) {
        toast.success('Category deleted successfully');
        loadCategories();
      } else {
        toast.error('Failed to delete category');
      }
    }
  };
  
  const handleDeleteClassification = (categoryCode: string, classification: Classification) => {
    if (window.confirm(`Are you sure you want to delete classification "${classification.name}"? This will delete all its sub-classifications.`)) {
      const success = deleteClassification(categoryCode, classification.code);
      if (success) {
        toast.success('Classification deleted successfully');
        loadCategories();
      } else {
        toast.error('Failed to delete classification');
      }
    }
  };
  
  const handleDeleteSubClassification = (categoryCode: string, classificationCode: string, subClassification: SubClassification) => {
    if (window.confirm(`Are you sure you want to delete sub-classification "${subClassification.name}"?`)) {
      const success = deleteSubClassification(categoryCode, classificationCode, subClassification.code);
      if (success) {
        // Also delete matrix entry if exists
        const matrixEntries = getAllMatrixEntries();
        const matrixEntry = matrixEntries.find(e => e.subClassificationCode === subClassification.code);
        if (matrixEntry) {
          deleteMatrixEntry(matrixEntry.id);
        }
        
        toast.success('Sub-classification deleted successfully');
        loadCategories();
      } else {
        toast.error('Failed to delete sub-classification');
      }
    }
  };
  
  // Save handler
  const handleSave = () => {
    if (!code || !name) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const { mode, level, parentCategory, parentClassification, data } = formState;
    
    try {
      if (level === 'category') {
        if (mode === 'add') {
          createCategory({ code, name });
          toast.success('Category created successfully');
        } else {
          updateCategory(data.code, { code, name });
          toast.success('Category updated successfully');
        }
      } else if (level === 'classification') {
        if (mode === 'add') {
          createClassification(parentCategory!, { code, name });
          toast.success('Classification created successfully');
        } else {
          updateClassification(parentCategory!, data.code, { code, name });
          toast.success('Classification updated successfully');
        }
      } else if (level === 'subclassification') {
        if (!description) {
          toast.error('Description is required for sub-classifications');
          return;
        }
        
        if (mode === 'add') {
          createSubClassification(parentCategory!, parentClassification!, { code, name });
          
          // Create matrix entry
          const torItems: any = {};
          const terItems: any = {};
          
          Object.keys(torItemStates).forEach(itemCode => {
            torItems[itemCode] = torItemStates[itemCode];
          });
          
          Object.keys(terItemStates).forEach(itemCode => {
            terItems[itemCode] = terItemStates[itemCode];
          });
          
          createMatrixEntry({
            subClassificationCode: code,
            subClassificationName: name,
            description,
            showInTOR,
            showInTER,
            torItems,
            terItems,
          });
          
          toast.success('Sub-classification created successfully');
        } else {
          updateSubClassification(parentCategory!, parentClassification!, data.code, { code, name });
          
          // Update matrix entry
          const matrixEntries = getAllMatrixEntries();
          const matrixEntry = matrixEntries.find(e => e.subClassificationCode === data.code);
          
          const torItems: any = {};
          const terItems: any = {};
          
          Object.keys(torItemStates).forEach(itemCode => {
            torItems[itemCode] = torItemStates[itemCode];
          });
          
          Object.keys(terItemStates).forEach(itemCode => {
            terItems[itemCode] = terItemStates[itemCode];
          });
          
          if (matrixEntry) {
            updateMatrixEntry(matrixEntry.id, {
              subClassificationCode: code,
              subClassificationName: name,
              description,
              showInTOR,
              showInTER,
              torItems,
              terItems,
            });
          } else {
            createMatrixEntry({
              subClassificationCode: code,
              subClassificationName: name,
              description,
              showInTOR,
              showInTER,
              torItems,
              terItems,
            });
          }
          
          toast.success('Sub-classification updated successfully');
        }
      }
      
      loadCategories();
      setFormState({ ...formState, open: false });
      resetForm();
    } catch (error) {
      toast.error('An error occurred while saving');
      console.error(error);
    }
  };
  
  // Get matrix entry for sub-classification
  const getMatrixEntry = (subClassificationCode: string): MatrixEntry | undefined => {
    const matrixEntries = getAllMatrixEntries();
    return matrixEntries.find(e => e.subClassificationCode === subClassificationCode);
  };
  
  // Filter function
  const filterHierarchy = (cats: Category[]): Category[] => {
    if (!searchTerm) return cats;
    
    const term = searchTerm.toLowerCase();
    
    return cats.map(cat => {
      const categoryMatch = cat.code.toLowerCase().includes(term) || cat.name.toLowerCase().includes(term);
      
      const filteredClassifications = cat.classifications.map(cls => {
        const classificationMatch = cls.code.toLowerCase().includes(term) || cls.name.toLowerCase().includes(term);
        
        const filteredSubClassifications = cls.subClassifications.filter(sub =>
          sub.code.toLowerCase().includes(term) || sub.name.toLowerCase().includes(term)
        );
        
        if (classificationMatch || filteredSubClassifications.length > 0) {
          return {
            ...cls,
            subClassifications: classificationMatch ? cls.subClassifications : filteredSubClassifications,
          };
        }
        return null;
      }).filter(Boolean) as Classification[];
      
      if (categoryMatch || filteredClassifications.length > 0) {
        return {
          ...cat,
          classifications: categoryMatch ? cat.classifications : filteredClassifications,
        };
      }
      return null;
    }).filter(Boolean) as Category[];
  };
  
  const filteredCategories = filterHierarchy(categories);
  
  // Check if user is admin
  if (user.roleName !== 'Administrator') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access Denied: Only administrators can manage the TOR/TER matrix.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl text-gray-900 mb-2">TOR/TER Matrix Management</h1>
            <p className="text-gray-600">
              Manage the complete hierarchy: Categories, Classifications, Sub-classifications, and their TOR/TER mappings.
            </p>
          </div>
          {onNavigateToItemDefinitions && (
            <Button
              onClick={onNavigateToItemDefinitions}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Item Definitions
            </Button>
          )}
        </div>
      </div>
      
      {/* Actions Bar */}
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      {/* Hierarchical Matrix Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#E6F2FF]">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-gray-900 w-12"></th>
                <th className="px-4 py-3 text-left text-sm text-gray-900">Code</th>
                <th className="px-4 py-3 text-left text-sm text-gray-900">Name</th>
                <th className="px-4 py-3 text-left text-sm text-gray-900">Level</th>
                <th className="px-4 py-3 text-center text-sm text-gray-900">TOR</th>
                <th className="px-4 py-3 text-center text-sm text-gray-900">TER</th>
                <th className="px-4 py-3 text-center text-sm text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No data found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <React.Fragment key={category.code}>
                    {/* Category Row */}
                    <tr className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {category.classifications.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category.code)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {expandedCategories.has(category.code) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{category.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{category.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          Category
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400">-</td>
                      <td className="px-4 py-3 text-center text-gray-400">-</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddClassification(category.code)}
                            title="Add Classification"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Classification Rows */}
                    {expandedCategories.has(category.code) && category.classifications.map((classification) => (
                      <React.Fragment key={classification.code}>
                        <tr className="border-t hover:bg-blue-50 bg-blue-25">
                          <td className="px-4 py-3 pl-12">
                            {classification.subClassifications.length > 0 && (
                              <button
                                onClick={() => toggleClassification(classification.code)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {expandedClassifications.has(classification.code) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{classification.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{classification.name}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Classification
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">-</td>
                          <td className="px-4 py-3 text-center text-gray-400">-</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddSubClassification(category.code, classification.code)}
                                title="Add Sub-classification"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClassification(category.code, classification)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClassification(category.code, classification)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Sub-classification Rows */}
                        {expandedClassifications.has(classification.code) && classification.subClassifications.map((subClassification) => {
                          const matrixEntry = getMatrixEntry(subClassification.code);
                          
                          return (
                            <tr key={subClassification.code} className="border-t hover:bg-green-50 bg-green-25">
                              <td className="px-4 py-3 pl-20"></td>
                              <td className="px-4 py-3 text-sm text-gray-900">{subClassification.code}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{subClassification.name}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                  Sub-classification
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {matrixEntry?.showInTOR ? (
                                  <span className="inline-block w-5 h-5 bg-green-500 rounded text-white text-xs leading-5">✓</span>
                                ) : (
                                  <span className="inline-block w-5 h-5 bg-gray-300 rounded text-white text-xs leading-5">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {matrixEntry?.showInTER ? (
                                  <span className="inline-block w-5 h-5 bg-green-500 rounded text-white text-xs leading-5">✓</span>
                                ) : (
                                  <span className="inline-block w-5 h-5 bg-gray-300 rounded text-white text-xs leading-5">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditSubClassification(category.code, classification.code, subClassification)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSubClassification(category.code, classification.code, subClassification)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Form Dialog */}
      <Dialog open={formState.open} onOpenChange={(open) => setFormState({ ...formState, open })}>
        <DialogContent className={formState.level === 'subclassification' ? 'max-w-[90vw] w-[1000px] max-h-[90vh] overflow-y-auto' : ''}>
          <DialogHeader>
            <DialogTitle>
              {formState.mode === 'add' ? 'Add' : 'Edit'} {formState.level === 'category' ? 'Category' : formState.level === 'classification' ? 'Classification' : 'Sub-classification'}
            </DialogTitle>
            <DialogDescription>
              {formState.mode === 'add' ? 'Create a new' : 'Update'} {formState.level} entry
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={
                  formState.level === 'category' ? 'e.g., M' :
                  formState.level === 'classification' ? 'e.g., M.01' :
                  'e.g., M.01.01'
                }
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  formState.level === 'category' ? 'e.g., M. Material - Goods' :
                  formState.level === 'classification' ? 'e.g., M.01 Spareparts' :
                  'e.g., M.01.01 Bearing'
                }
              />
            </div>
            
            {/* Sub-classification specific fields */}
            {formState.level === 'subclassification' && (
              <>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed description..."
                    rows={3}
                  />
                </div>
                
                {/* Display Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-gray-900">TOR/TER Settings</h3>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showInTOR"
                        checked={showInTOR}
                        onCheckedChange={(checked: boolean) => setShowInTOR(checked as boolean)}
                      />
                      <label htmlFor="showInTOR" className="cursor-pointer">
                        Show in TOR (Terms of Reference)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showInTER"
                        checked={showInTER}
                        onCheckedChange={(checked: boolean) => setShowInTER(checked as boolean)}
                      />
                      <label htmlFor="showInTER" className="cursor-pointer">
                        Show in TER (Technical Evaluation Requirements)
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* TOR Items - Dynamic */}
                {showInTOR && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-gray-900 border-b border-blue-200 pb-2">TOR Items to Enable</h3>
                    {torDefinitions.length === 0 ? (
                      <p className="text-sm text-gray-600">
                        No TOR item definitions available. Please add item definitions first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {torDefinitions.map((def) => (
                          <div key={def.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tor-${def.code}`}
                              checked={torItemStates[def.code] || false}
                              onCheckedChange={(checked: boolean) => {
                                setTorItemStates({
                                  ...torItemStates,
                                  [def.code]: checked as boolean,
                                });
                              }}
                            />
                            <label htmlFor={`tor-${def.code}`} className="text-sm cursor-pointer">
                              {def.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* TER Items - Dynamic */}
                {showInTER && (
                  <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                    <h3 className="text-gray-900 border-b border-green-200 pb-2">TER Items to Enable</h3>
                    {terDefinitions.length === 0 ? (
                      <p className="text-sm text-gray-600">
                        No TER item definitions available. Please add item definitions first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {terDefinitions.map((def) => (
                          <div key={def.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ter-${def.code}`}
                              checked={terItemStates[def.code] || false}
                              onCheckedChange={(checked: boolean) => {
                                setTerItemStates({
                                  ...terItemStates,
                                  [def.code]: checked as boolean,
                                });
                              }}
                            />
                            <label htmlFor={`ter-${def.code}`} className="text-sm cursor-pointer">
                              {def.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setFormState({ ...formState, open: false });
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
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
