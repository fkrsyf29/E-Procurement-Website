import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { User } from '../types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Settings, ChevronRight, ChevronDown } from 'lucide-react';

// --- API SERVICES ---
import {
  fetchCategoryHierarchy,
  createCategoryApi, updateCategoryApi, deleteCategoryApi, // Asumsi deleteCategoryApi ada (soft delete)
  createClassificationApi, updateClassificationApi, deleteClassificationApi,
  createSubClassificationApi, updateSubClassificationApi, deleteSubClassificationApi
} from '../services/categoryApi';

import { fetchAllItemDefinitions } from '../services/itemDefinitionApi';
import { fetchMatrixBySubId, saveMatrixApi } from '../services/torTerMatrixApi';

// --- TYPES ---
import { CategoryDto, ClassificationDto, SubClassificationDto } from '../types/categoryTypes';
import { ItemDefinition } from '../types/itemDefinitionTypes';

interface MatrixManagementProps {
  user: User;
  onNavigateToItemDefinitions?: () => void;
}

type HierarchyLevel = 'category' | 'classification' | 'subclassification';

interface FormState {
  open: boolean;
  mode: 'add' | 'edit';
  level: HierarchyLevel;
  parentCategoryID?: number;       // Changed to ID
  parentClassificationID?: number; // Changed to ID
  data?: any; // Holds the full DTO object being edited
}

export function MatrixManagement({ user, onNavigateToItemDefinitions }: MatrixManagementProps) {
  // Data State
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [itemDefinitions, setItemDefinitions] = useState<ItemDefinition[]>([]);

  // UI State
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set()); // Changed to number (ID)
  const [expandedClassifications, setExpandedClassifications] = useState<Set<number>>(new Set()); // Changed to number (ID)
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
  const [description, setDescription] = useState(''); // Optional, API might not save this in SubClass table, but in Matrix
  const [showInTOR, setShowInTOR] = useState(false);
  const [showInTER, setShowInTER] = useState(false);

  // Dynamic item states for sub-classification TOR/TER mapping
  const [torItemStates, setTorItemStates] = useState<Record<string, boolean>>({});
  const [terItemStates, setTerItemStates] = useState<Record<string, boolean>>({});
  const [matrixFormDefaults, setMatrixFormDefaults] = useState<Record<string, { param: string, req: string, desc: string }>>({});

  const userId = user?.username ?? 'SYSTEM';

  // Get dynamic definitions from state
  const torDefinitions = itemDefinitions.filter(i => i.category === 'tor' && i.isActive);
  const terDefinitions = itemDefinitions.filter(i => i.category === 'ter' && i.isActive);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cats, items] = await Promise.all([
        fetchCategoryHierarchy(),
        fetchAllItemDefinitions()
      ]);
      setCategories(cats);
      setItemDefinitions(items);
      initializeItemStates(items);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  const initializeItemStates = (items: ItemDefinition[]) => {
    const torStates: Record<string, boolean> = {};
    const terStates: Record<string, boolean> = {};

    items.filter(i => i.category === 'tor').forEach(def => {
      torStates[def.code] = false;
    });

    items.filter(i => i.category === 'ter').forEach(def => {
      terStates[def.code] = false;
    });

    setTorItemStates(torStates);
    setTerItemStates(terStates);
  };

  const toggleCategory = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedCategories(newExpanded);
  };

  const toggleClassification = (id: number) => {
    const newExpanded = new Set(expandedClassifications);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedClassifications(newExpanded);
  };

  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setShowInTOR(false);
    setShowInTER(false);
    setMatrixFormDefaults({}); // Reset defaults
    initializeItemStates(itemDefinitions);
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

  const handleAddClassification = (categoryID: number) => {
    resetForm();
    setFormState({
      open: true,
      mode: 'add',
      level: 'classification',
      parentCategoryID: categoryID,
    });
  };

  const handleAddSubClassification = (categoryID: number, classificationID: number) => {
    resetForm();
    setFormState({
      open: true,
      mode: 'add',
      level: 'subclassification',
      parentCategoryID: categoryID,
      parentClassificationID: classificationID,
    });
  };

  // Edit handlers
  const handleEditCategory = (category: CategoryDto) => {
    setCode(category.code);
    setName(category.name);
    setFormState({
      open: true,
      mode: 'edit',
      level: 'category',
      data: category,
    });
  };

  const handleEditClassification = (categoryID: number, classification: ClassificationDto) => {
    setCode(classification.code);
    setName(classification.name);
    setFormState({
      open: true,
      mode: 'edit',
      level: 'classification',
      parentCategoryID: categoryID,
      data: classification,
    });
  };

  const handleEditSubClassification = async (categoryID: number, classificationID: number, subClassification: SubClassificationDto) => {
    setCode(subClassification.code);
    setName(subClassification.name);

    // --- LOAD MATRIX DATA FROM API ---
    try {
      const matrixData = await fetchMatrixBySubId(subClassification.subClassificationID);

      // Reset states
      const newTorStates: Record<string, boolean> = {};
      const newTerStates: Record<string, boolean> = {};
      const newDefaults: Record<string, any> = {};

      // Init all to false first
      itemDefinitions.forEach(def => {
        if (def.category === 'tor') newTorStates[def.code] = false;
        if (def.category === 'ter') newTerStates[def.code] = false;
      });

      // Map API data to form state
      let hasTor = false;
      let hasTer = false;

      matrixData.forEach(entry => {
        // Checkbox State
        if (entry.itemCategory.toLowerCase() === 'tor') {
          newTorStates[entry.itemCode] = true;
          hasTor = true;
        }
        if (entry.itemCategory.toLowerCase() === 'ter') {
          newTerStates[entry.itemCode] = true;
          hasTer = true;
        }

        // Default Values (Description/Reqs)
        // Note: Logic asli FE menyimpan deskripsi umum sub-class di 'description'
        // Tapi struktur DB baru menyimpan per-item. 
        // Kita ambil salah satu deskripsi item sebagai deskripsi umum jika perlu, 
        // atau biarkan kosong jika kolom Description di SubClassification tidak ada di DB.
        // Untuk form defaults:
        // Kita tidak menyimpan default text di state FE asli Anda (hanya boolean), 
        // tapi jika Anda ingin extend, datanya ada di `entry.defaultParameter`, dll.
      });

      setTorItemStates(newTorStates);
      setTerItemStates(newTerStates);
      setShowInTOR(hasTor);
      setShowInTER(hasTer);

    } catch (error) {
      console.error("Failed to fetch matrix", error);
      toast.error("Failed to load matrix configuration");
    }

    setFormState({
      open: true,
      mode: 'edit',
      level: 'subclassification',
      parentCategoryID: categoryID,
      parentClassificationID: classificationID,
      data: subClassification,
    });
  };

  // Delete handlers (Using Soft Delete API logic internally)
  const handleDeleteCategory = async (category: CategoryDto) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"? This will delete all its classifications and sub-classifications.`)) {
      // Simulasi delete via Update API (Soft Delete)
      // Di real implementation, gunakan endpoint DELETE atau PUT dengan isDeleted=true
      // Anggap deleteCategoryApi melakukan soft delete di BE
      try {
        // await deleteCategoryApi(category.categoryID); // Jika endpoint delete ada
        // ATAU update status
        await updateCategoryApi(category.categoryID, { ...category, isActive: false, isDeleted: true, deletedBy: userId });
        toast.success('Category deleted successfully');
        loadInitialData();
      } catch (e) { toast.error('Failed to delete category'); }
    }
  };

  const handleDeleteClassification = async (categoryID: number, classification: ClassificationDto) => {
    if (window.confirm(`Are you sure you want to delete classification "${classification.name}"?`)) {
      try {
        await updateClassificationApi(classification.classificationID, {
          ...classification, categoryID, isActive: false, isDeleted: true, deletedBy: userId
        });
        toast.success('Classification deleted successfully');
        loadInitialData();
      } catch (e) { toast.error('Failed to delete classification'); }
    }
  };

  const handleDeleteSubClassification = async (categoryID: number, classificationID: number, subClassification: SubClassificationDto) => {
    if (window.confirm(`Are you sure you want to delete sub-classification "${subClassification.name}"?`)) {
      try {
        await updateSubClassificationApi(subClassification.subClassificationID, {
          ...subClassification, classificationID, isActive: false, isDeleted: true, deletedBy: userId
        });
        toast.success('Sub-classification deleted successfully');
        loadInitialData();
      } catch (e) { toast.error('Failed to delete sub-classification'); }
    }
  };

  // Save handler
  const handleSave = async () => {
    if (!code || !name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { mode, level, parentCategoryID, parentClassificationID, data } = formState;

    try {
      if (level === 'category') {
        if (mode === 'add') {
          await createCategoryApi({ code, name, user: userId });
          toast.success('Category created successfully');
        } else {
          await updateCategoryApi(data.categoryID, { code, name, user: userId });
          toast.success('Category updated successfully');
        }
      } else if (level === 'classification') {
        if (mode === 'add') {
          await createClassificationApi({ categoryID: parentCategoryID!, code, name, user: userId });
          toast.success('Classification created successfully');
        } else {
          await updateClassificationApi(data.classificationID, { categoryID: parentCategoryID, code, name, user: userId });
          toast.success('Classification updated successfully');
        }
      } else if (level === 'subclassification') {

        let subClassId = data?.subClassificationID;

        // 1. Save Sub-Classification Metadata
        if (mode === 'add') {
          const res = await createSubClassificationApi({ classificationID: parentClassificationID!, code, name, user: userId });
          subClassId = res.id; // Asumsi API return { id: ... }
          toast.success('Sub-classification created successfully');
        } else {
          await updateSubClassificationApi(subClassId, { classificationID: parentClassificationID, code, name, user: userId });
          toast.success('Sub-classification updated successfully');
        }

        // 2. Save Matrix Configuration (Bulk Save)
        if (subClassId) {
          const itemsToSave = [];

          // Collect TOR items
          for (const [itemCode, isChecked] of Object.entries(torItemStates)) {
            if (isChecked) {
              const def = itemDefinitions.find(d => d.code === itemCode && d.category === 'tor');
              if (def) {
                itemsToSave.push({
                  itemDefinitionID: parseInt(def.id),
                  defaultParameter: null, // Bisa diambil dari state form tambahan jika ada
                  defaultRequirement: null,
                  defaultDescription: null
                });
              }
            }
          }

          // Collect TER items
          for (const [itemCode, isChecked] of Object.entries(terItemStates)) {
            if (isChecked) {
              const def = itemDefinitions.find(d => d.code === itemCode && d.category === 'ter');
              if (def) {
                itemsToSave.push({
                  itemDefinitionID: parseInt(def.id),
                  defaultParameter: null,
                  defaultRequirement: null,
                  defaultDescription: null
                });
              }
            }
          }

          // Call Save Matrix API
          await saveMatrixApi({
            subClassificationID: subClassId,
            items: itemsToSave,
            createdBy: userId
          });
        }
      }

      loadInitialData();
      setFormState({ ...formState, open: false });
      resetForm();
    } catch (error) {
      toast.error('An error occurred while saving');
      console.error(error);
    }
  };

  // Filter function
  const filterHierarchy = (cats: CategoryDto[]): CategoryDto[] => {
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
      }).filter(Boolean) as ClassificationDto[];

      if (categoryMatch || filteredClassifications.length > 0) {
        return {
          ...cat,
          classifications: categoryMatch ? cat.classifications : filteredClassifications,
        };
      }
      return null;
    }).filter(Boolean) as CategoryDto[];
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
                  <React.Fragment key={category.categoryID}>
                    {/* Category Row */}
                    <tr className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {category.classifications.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category.categoryID)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {expandedCategories.has(category.categoryID) ? (
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
                            onClick={() => handleAddClassification(category.categoryID)}
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
                    {expandedCategories.has(category.categoryID) && category.classifications.map((classification) => (
                      <React.Fragment key={classification.classificationID}>
                        <tr className="border-t hover:bg-blue-50 bg-blue-25">
                          <td className="px-4 py-3 pl-12">
                            {classification.subClassifications.length > 0 && (
                              <button
                                onClick={() => toggleClassification(classification.classificationID)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {expandedClassifications.has(classification.classificationID) ? (
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
                                onClick={() => handleAddSubClassification(category.categoryID, classification.classificationID)}
                                title="Add Sub-classification"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClassification(category.categoryID, classification)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClassification(category.categoryID, classification)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Sub-classification Rows */}
                        {expandedClassifications.has(classification.classificationID) && classification.subClassifications.map((subClassification) => {
                          // Kita tidak memanggil getMatrixEntry disini untuk menghindari N+1 Query
                          // Status TOR/TER di tabel dibiarkan "-" atau bisa diimplementasikan later

                          return (
                            <tr key={subClassification.subClassificationID} className="border-t hover:bg-green-50 bg-green-25">
                              <td className="px-4 py-3 pl-20"></td>
                              <td className="px-4 py-3 text-sm text-gray-900">{subClassification.code}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{subClassification.name}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                  Sub-classification
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {subClassification.hasTor ? (
                                  <span className="inline-block w-5 h-5 bg-green-500 rounded text-white text-xs leading-5 flex items-center justify-center mx-auto">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="inline-block w-5 h-5 bg-gray-300 rounded text-gray-500 text-xs leading-5">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {subClassification.hasTer ? (
                                  <span className="inline-block w-5 h-5 bg-green-500 rounded text-white text-xs leading-5 flex items-center justify-center mx-auto">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="inline-block w-5 h-5 bg-gray-300 rounded text-gray-500 text-xs leading-5">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditSubClassification(category.categoryID, classification.classificationID, subClassification)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSubClassification(category.categoryID, classification.classificationID, subClassification)}
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