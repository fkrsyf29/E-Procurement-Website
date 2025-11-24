import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Search, Save, X } from 'lucide-react';
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
import { User } from '../types';
import { CategoryDto, ClassificationDto, SubClassificationDto } from '../types/categoryTypes';
import {
    fetchCategoryHierarchy,
    createCategoryApi, updateCategoryApi,
    createClassificationApi, updateClassificationApi,
    createSubClassificationApi, updateSubClassificationApi
} from '../services/categoryApi';

type EntityType = 'category' | 'classification' | 'subClassification';

interface FormData {
  id?: number; // ID item yang sedang diedit
  code: string;
  name: string;
  categoryID?: number; // Parent ID untuk Classification
  classificationID?: number; // Parent ID untuk SubClassification
}

interface CategoryManagementProps {
  currentUser: User | null;
}

export function CategoryManagement({ 
  currentUser: propCurrentUser
}: CategoryManagementProps) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandedClassifications, setExpandedClassifications] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const userId = propCurrentUser?.username ?? 'SYSTEM';
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [entityType, setEntityType] = useState<EntityType>('category');
  const [formData, setFormData] = useState<FormData>({ code: '', name: '' });
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: EntityType; id: number; name: string; parentID?: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
        const data = await fetchCategoryHierarchy();
        setCategories(data);
    } catch (error) {
        toast.error('Failed to load categories');
    } finally {
        setIsLoading(false);
    }
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

  // --- HANDLERS: CREATE ---
  const handleCreateCategory = () => {
    setDialogMode('create');
    setEntityType('category');
    setFormData({ code: '', name: '' });
    setShowDialog(true);
  };

  const handleCreateClassification = (categoryID: number) => {
    setDialogMode('create');
    setEntityType('classification');
    setFormData({ code: '', name: '', categoryID });
    setShowDialog(true);
  };

  const handleCreateSubClassification = (classificationID: number) => {
    setDialogMode('create');
    setEntityType('subClassification');
    setFormData({ code: '', name: '', classificationID });
    setShowDialog(true);
  };

  // --- HANDLERS: EDIT ---
  const handleEditCategory = (cat: CategoryDto) => {
    setDialogMode('edit');
    setEntityType('category');
    setFormData({ id: cat.categoryID, code: cat.code, name: cat.name });
    setShowDialog(true);
  };

  const handleEditClassification = (cls: ClassificationDto) => {
    setDialogMode('edit');
    setEntityType('classification');
    setFormData({ id: cls.classificationID, code: cls.code, name: cls.name, categoryID: cls.categoryID });
    setShowDialog(true);
  };

  const handleEditSubClassification = (sub: SubClassificationDto) => {
    setDialogMode('edit');
    setEntityType('subClassification');
    setFormData({ id: sub.subClassificationID, code: sub.code, name: sub.name, classificationID: sub.classificationID });
    setShowDialog(true);
  };

  // --- HANDLERS: DELETE ---
  const handleDeleteCategory = (cat: CategoryDto) => {
    setDeleteTarget({ type: 'category', id: cat.categoryID, name: cat.name });
    setShowDeleteDialog(true);
  };

  const handleDeleteClassification = (cls: ClassificationDto) => {
    setDeleteTarget({ type: 'classification', id: cls.classificationID, name: cls.name, parentID: cls.categoryID });
    setShowDeleteDialog(true);
  };

  const handleDeleteSubClassification = (sub: SubClassificationDto) => {
    setDeleteTarget({ type: 'subClassification', id: sub.subClassificationID, name: sub.name, parentID: sub.classificationID });
    setShowDeleteDialog(true);
  };

  // --- EXECUTE SAVE ---
  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Code and name are required');
      return;
    }

    try {
        if (dialogMode === 'create') {
            if (entityType === 'category') {
                await createCategoryApi({ code: formData.code, name: formData.name, user: userId });
            } else if (entityType === 'classification') {
                await createClassificationApi({ categoryID: formData.categoryID!, code: formData.code, name: formData.name, user: userId });
            } else if (entityType === 'subClassification') {
                await createSubClassificationApi({ classificationID: formData.classificationID!, code: formData.code, name: formData.name, user: userId });
            }
            toast.success(`${entityType} created successfully`);
        } else {
            // Update Logic
            const baseUpdate = { code: formData.code, name: formData.name, user: userId, isActive: true };
            
            if (entityType === 'category') {
                await updateCategoryApi(formData.id!, baseUpdate);
            } else if (entityType === 'classification') {
                await updateClassificationApi(formData.id!, { ...baseUpdate, categoryID: formData.categoryID });
            } else if (entityType === 'subClassification') {
                await updateSubClassificationApi(formData.id!, { ...baseUpdate, classificationID: formData.classificationID });
            }
            toast.success(`${entityType} updated successfully`);
        }
        
        setShowDialog(false);
        loadData(); // Refresh Tree
    } catch (error) {
        toast.error(`Failed to save ${entityType}`);
    }
  };

  // --- EXECUTE DELETE (SOFT DELETE) ---
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;

    try {
        // Payload Soft Delete standard
        const deletePayload = { 
            isActive: false, 
            user: userId,
            isDeleted: true, 
            deletedBy: userId 
        };

        // Untuk delete, kita mengirim payload ke endpoint Update tapi dengan isDeleted=true
        if (type === 'category') {
            // Kita perlu mengirim field wajib lain (Code/Name) untuk update, 
            // idealnya kita fetch dulu atau backend ignore jika null saat delete.
            // Di sini kita asumsikan backend butuh data minimal atau kita ambil dari existing state.
            // Simplifikasi: Kirim minimal data jika backend handle nulls, atau fetch current data.
            // Untuk amannya, karena kita punya datanya di state:
            const item = categories.find(c => c.categoryID === id);
            if(item) await updateCategoryApi(id, { ...item, ...deletePayload });
        } else if (type === 'classification') {
             // Cari item di tree (sedikit ribet, tapi doable)
             let item: ClassificationDto | undefined;
             categories.forEach(c => {
                 const found = c.classifications.find(cl => cl.classificationID === id);
                 if(found) item = found;
             });
             if(item) await updateClassificationApi(id, { ...item, ...deletePayload });
        } else if (type === 'subClassification') {
             let item: SubClassificationDto | undefined;
             categories.forEach(c => c.classifications.forEach(cl => {
                 const found = cl.subClassifications.find(s => s.subClassificationID === id);
                 if(found) item = found;
             }));
             if(item) await updateSubClassificationApi(id, { ...item, ...deletePayload });
        }

        toast.success(`${type} deleted successfully`);
        loadData();
    } catch (error) {
        toast.error(`Failed to delete ${type}`);
    } finally {
        setShowDeleteDialog(false);
        setDeleteTarget(null);
    }
  };

  // Filter logic (useMemo) tetap mirip, hanya sesuaikan properti (categoryID, dll)
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const lowerSearch = searchTerm.toLowerCase();

    return categories.map(cat => {
      const categoryMatch = cat.name.toLowerCase().includes(lowerSearch) || cat.code.toLowerCase().includes(lowerSearch);

      const filteredClassifications = cat.classifications.map(cls => {
        const classificationMatch = cls.name.toLowerCase().includes(lowerSearch) || cls.code.toLowerCase().includes(lowerSearch);

        const filteredSubs = cls.subClassifications.filter(sub =>
          sub.name.toLowerCase().includes(lowerSearch) || sub.code.toLowerCase().includes(lowerSearch)
        );

        if (classificationMatch || filteredSubs.length > 0) {
          return { ...cls, subClassifications: filteredSubs.length > 0 ? filteredSubs : cls.subClassifications };
        }
        return null;
      }).filter(Boolean) as ClassificationDto[];

      if (categoryMatch || filteredClassifications.length > 0) {
        return { ...cat, classifications: filteredClassifications.length > 0 ? filteredClassifications : cat.classifications };
      }
      return null;
    }).filter(Boolean) as CategoryDto[];
  }, [categories, searchTerm]);

  const getDialogTitle = () => {
    const action = dialogMode === 'create' ? 'Create' : 'Edit';
    const entity = entityType.replace(/([A-Z])/g, ' $1').trim();
    return `${action} ${entity.charAt(0).toUpperCase() + entity.slice(1)}`;
  };

  return (
    <div className="space-y-4 p-8">
      {/* ... (Header, Search, Stats UI sama, sesuaikan variabel categories.length) ... */}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 text-2xl font-semibold">Category Management</h1>
          <p className="text-gray-600">Manage procurement categories, classifications, and sub-classifications</p>
        </div>
        <Button onClick={handleCreateCategory} className="bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tree Rendering */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 space-y-2">
          {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading hierarchy...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No matching categories found' : 'No categories yet'}
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.categoryID} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Category Row */}
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 bg-blue-50"
                  onClick={() => toggleCategory(category.categoryID)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {expandedCategories.has(category.categoryID) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <span className="font-semibold">{category.code}</span> | <span>{category.name}</span>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => handleCreateClassification(category.categoryID)}><Plus className="w-4 h-4 text-blue-500" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>

                {/* Classifications */}
                {expandedCategories.has(category.categoryID) && (
                  <div className="bg-white border-t border-gray-200">
                    {category.classifications.map((cls) => (
                      <div key={cls.classificationID} className="border-b border-gray-100 last:border-0">
                        <div 
                            className="flex items-center justify-between p-3 pl-10 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleClassification(cls.classificationID)}
                        >
                           <div className="flex items-center gap-2 flex-1">
                             {expandedClassifications.has(cls.classificationID) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                             <span className="font-semibold text-blue-600">{cls.code}</span> | <span>{cls.name}</span>
                           </div>
                           <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                             <Button variant="ghost" size="sm" onClick={() => handleCreateSubClassification(cls.classificationID)}><Plus className="w-3 h-3 text-blue-500" /></Button>
                             <Button variant="ghost" size="sm" onClick={() => handleEditClassification(cls)}><Edit2 className="w-3 h-3" /></Button>
                             <Button variant="ghost" size="sm" onClick={() => handleDeleteClassification(cls)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                           </div>
                        </div>

                        {/* SubClassifications */}
                        {expandedClassifications.has(cls.classificationID) && (
                            <div className="bg-gray-50">
                                {cls.subClassifications.map((sub) => (
                                    <div key={sub.subClassificationID} className="flex items-center justify-between p-3 pl-16 border-b border-gray-100 last:border-0 hover:bg-gray-100">
                                        <div>
                                            <span className="font-semibold text-gray-500">{sub.code}</span> | <span>{sub.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditSubClassification(sub)}><Edit2 className="w-3 h-3" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSubClassification(sub)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ... (Dialog Create/Edit sama, pastikan value input menggunakan formData) ... */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{getDialogTitle()}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <label className="text-sm font-semibold mb-1 block">Code</label>
                    <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="e.g. M.01" />
                </div>
                <div>
                    <label className="text-sm font-semibold mb-1 block">Name</label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Category Name" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-blue-600 text-white">Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ... (Alert Dialog Delete sama) ... */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to delete {deleteTarget?.name}?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}