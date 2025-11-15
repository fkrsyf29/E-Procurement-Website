import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Star, Phone, Mail, MapPin, Award, X, Save, FileText, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { 
  VendorRecord, 
  vendorDatabase,
  searchVendors,
  addVendorRecord,
  updateVendorRecord,
  deleteVendorRecord,
  getAllVendors
} from '../data/vendorDatabase';
import { categoryHierarchy } from '../data/categoryHierarchy';

export const VendorDatabaseManagement: React.FC = () => {
  const [vendors, setVendors] = useState<VendorRecord[]>(getAllVendors());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorRecord | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    categoryCode: '',
    classification: '',
    classificationCode: '',
    subClassification: '',
    subClassificationCode: '',
    vendorName: '',
    vendorCode: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    address: '',
    rating: 0,
    certifications: [] as string[],
    notes: '',
  });
  
  const [certificationInput, setCertificationInput] = useState('');
  
  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Apply sorting to vendors
  const getSortedVendors = (vendorList: VendorRecord[]) => {
    if (!sortColumn) return vendorList;

    return [...vendorList].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof VendorRecord];
      let bValue: any = b[sortColumn as keyof VendorRecord];

      // Handle undefined/null values
      if (!aValue) aValue = '';
      if (!bValue) bValue = '';

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      const results = searchVendors(searchTerm);
      setVendors(getSortedVendors(results));
      toast.success(`Found ${results.length} vendor(s)`);
    } else {
      setVendors(getSortedVendors(getAllVendors()));
    }
  };
  
  // Handle filter
  const handleFilter = () => {
    let filtered = getAllVendors();
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(v => v.categoryCode === filterCategory);
    }
    
    if (filterClassification !== 'all') {
      filtered = filtered.filter(v => v.classificationCode === filterClassification);
    }
    
    setVendors(getSortedVendors(filtered));
    toast.success(`Filtered: ${filtered.length} vendor(s)`);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      category: '',
      categoryCode: '',
      classification: '',
      classificationCode: '',
      subClassification: '',
      subClassificationCode: '',
      vendorName: '',
      vendorCode: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      rating: 0,
      certifications: [],
      notes: '',
    });
    setCertificationInput('');
  };
  
  // Handle add vendor
  const handleAddVendor = () => {
    if (!formData.vendorName || !formData.subClassificationCode) {
      toast.error('Vendor name and sub-classification are required');
      return;
    }
    
    const newVendor = addVendorRecord({
      ...formData,
      isActive: true,
    });
    
    setVendors(getSortedVendors(getAllVendors()));
    setIsAddDialogOpen(false);
    resetForm();
    toast.success(`Vendor "${newVendor.vendorName}" added successfully!`);
  };
  
  // Handle edit vendor
  const handleEditVendor = () => {
    if (!selectedVendor) return;
    
    const updated = updateVendorRecord(selectedVendor.id, formData);
    if (updated) {
      setVendors(getSortedVendors(getAllVendors()));
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedVendor(null);
      toast.success(`Vendor "${updated.vendorName}" updated successfully!`);
    } else {
      toast.error('Failed to update vendor');
    }
  };
  
  // Handle delete vendor
  const handleDeleteVendor = (vendor: VendorRecord) => {
    if (confirm(`Are you sure you want to delete vendor "${vendor.vendorName}"?`)) {
      const success = deleteVendorRecord(vendor.id);
      if (success) {
        setVendors(getSortedVendors(getAllVendors()));
        toast.success(`Vendor "${vendor.vendorName}" deleted successfully!`);
      } else {
        toast.error('Failed to delete vendor');
      }
    }
  };
  
  // Open edit dialog
  const openEditDialog = (vendor: VendorRecord) => {
    setSelectedVendor(vendor);
    setFormData({
      category: vendor.category,
      categoryCode: vendor.categoryCode,
      classification: vendor.classification,
      classificationCode: vendor.classificationCode,
      subClassification: vendor.subClassification,
      subClassificationCode: vendor.subClassificationCode,
      vendorName: vendor.vendorName,
      vendorCode: vendor.vendorCode || '',
      contactPerson: vendor.contactPerson || '',
      phoneNumber: vendor.phoneNumber || '',
      email: vendor.email || '',
      address: vendor.address || '',
      rating: vendor.rating || 0,
      certifications: vendor.certifications || [],
      notes: vendor.notes || '',
    });
    setIsEditDialogOpen(true);
  };
  
  // Open view dialog
  const openViewDialog = (vendor: VendorRecord) => {
    setSelectedVendor(vendor);
    setIsViewDialogOpen(true);
  };
  
  // Handle category selection
  const handleCategorySelection = (categoryCode: string) => {
    const category = categoryHierarchy.find(c => c.code === categoryCode);
    if (category) {
      setFormData({
        ...formData,
        categoryCode: category.code,
        category: category.name,
        classificationCode: '',
        classification: '',
        subClassificationCode: '',
        subClassification: '',
      });
    }
  };
  
  // Handle classification selection
  const handleClassificationSelection = (classificationCode: string) => {
    const category = categoryHierarchy.find(c => c.code === formData.categoryCode);
    const classification = category?.classifications.find(cl => cl.code === classificationCode);
    if (classification) {
      setFormData({
        ...formData,
        classificationCode: classification.code,
        classification: classification.name,
        subClassificationCode: '',
        subClassification: '',
      });
    }
  };
  
  // Handle sub-classification selection
  const handleSubClassificationSelection = (subClassificationCode: string) => {
    const category = categoryHierarchy.find(c => c.code === formData.categoryCode);
    const classification = category?.classifications.find(cl => cl.code === formData.classificationCode);
    const subClassification = classification?.subClassifications.find(s => s.code === subClassificationCode);
    if (subClassification) {
      setFormData({
        ...formData,
        subClassificationCode: subClassification.code,
        subClassification: subClassification.name,
      });
    }
  };
  
  // Add certification
  const addCertification = () => {
    if (certificationInput.trim()) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, certificationInput.trim()],
      });
      setCertificationInput('');
    }
  };
  
  // Remove certification
  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };
  
  // Get available classifications for selected category
  const getAvailableClassifications = () => {
    const category = categoryHierarchy.find(c => c.code === formData.categoryCode);
    return category?.classifications || [];
  };
  
  // Get available sub-classifications for selected classification
  const getAvailableSubClassifications = () => {
    const category = categoryHierarchy.find(c => c.code === formData.categoryCode);
    const classification = category?.classifications.find(cl => cl.code === formData.classificationCode);
    return classification?.subClassifications || [];
  };
  
  // Render rating stars
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Vendor Database Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage vendor records linked to sub-classifications
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="Search by vendor name, category, classification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Filter by Category</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryHierarchy.map(cat => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.code} - {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label>Filter by Classification</Label>
            <Select value={filterClassification} onValueChange={setFilterClassification}>
              <SelectTrigger>
                <SelectValue placeholder="All classifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {categoryHierarchy.flatMap(cat => 
                  cat.classifications.map(cl => (
                    <SelectItem key={cl.code} value={cl.code}>
                      {cl.code} - {cl.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleFilter} variant="outline">
              Apply Filter
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total: {vendors.length} vendor(s)</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterClassification('all');
              setSortColumn('');
              setVendors(getAllVendors());
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>
      
      {/* Vendor Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('vendorName')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Vendor Name
                    {sortColumn === 'vendorName' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Category
                    {sortColumn === 'category' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('classification')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Classification
                    {sortColumn === 'classification' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('subClassification')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Sub-Classification
                    {sortColumn === 'subClassification' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('rating')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    Rating
                    {sortColumn === 'rating' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <div className="text-gray-900">{vendor.vendorName}</div>
                        {vendor.vendorCode && (
                          <div className="text-xs text-gray-500">{vendor.vendorCode}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="text-gray-500">{vendor.categoryCode}</div>
                        <div className="text-gray-900">{vendor.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="text-gray-500">{vendor.classificationCode}</div>
                        <div className="text-gray-900">{vendor.classification}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="text-gray-500">{vendor.subClassificationCode}</div>
                        <div className="text-gray-900">{vendor.subClassification}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {vendor.contactPerson && (
                          <div className="text-gray-900">{vendor.contactPerson}</div>
                        )}
                        {vendor.phoneNumber && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-3 h-3" />
                            {vendor.phoneNumber}
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="w-3 h-3" />
                            {vendor.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vendor.rating ? renderRating(vendor.rating) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(vendor)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(vendor)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor)}
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
        </div>
      </div>
      
      {/* Add/Edit Vendor Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
          setSelectedVendor(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? 'Add New Vendor' : 'Edit Vendor'}
            </DialogTitle>
            <DialogDescription>
              Fill in the vendor details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Category Hierarchy */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.categoryCode} onValueChange={handleCategorySelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryHierarchy.map(cat => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {cat.code} - {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Classification *</Label>
                <Select 
                  value={formData.classificationCode} 
                  onValueChange={handleClassificationSelection}
                  disabled={!formData.categoryCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableClassifications().map(cl => (
                      <SelectItem key={cl.code} value={cl.code}>
                        {cl.code} - {cl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Sub-Classification *</Label>
                <Select 
                  value={formData.subClassificationCode} 
                  onValueChange={handleSubClassificationSelection}
                  disabled={!formData.classificationCode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-class" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSubClassifications().map(sub => (
                      <SelectItem key={sub.code} value={sub.code}>
                        {sub.code} - {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Vendor Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vendor Name *</Label>
                <Input
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g. PT Kambing Guling"
                />
              </div>
              
              <div>
                <Label>Vendor Code</Label>
                <Input
                  value={formData.vendorCode}
                  onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                  placeholder="e.g. VND-KG-001"
                />
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g. +62 21 1234567"
                />
              </div>
            </div>
            
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. sales@vendor.com"
              />
            </div>
            
            <div>
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address..."
                rows={2}
              />
            </div>
            
            {/* Rating */}
            <div>
              <Label>Rating (0-5)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  className="w-24"
                />
                {renderRating(formData.rating)}
              </div>
            </div>
            
            {/* Certifications */}
            <div>
              <Label>Certifications</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={certificationInput}
                  onChange={(e) => setCertificationInput(e.target.value)}
                  placeholder="e.g. ISO 9001"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                />
                <Button type="button" onClick={addCertification} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {cert}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeCertification(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
              setSelectedVendor(null);
            }}>
              Cancel
            </Button>
            <Button onClick={isAddDialogOpen ? handleAddVendor : handleEditVendor}>
              <Save className="w-4 h-4 mr-2" />
              {isAddDialogOpen ? 'Add Vendor' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Vendor Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              View detailed information about this vendor
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Vendor Name</Label>
                  <div className="text-gray-900">{selectedVendor.vendorName}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Vendor Code</Label>
                  <div className="text-gray-900">{selectedVendor.vendorCode || '-'}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Category</Label>
                  <div className="text-xs">
                    <div className="text-gray-500">{selectedVendor.categoryCode}</div>
                    <div className="text-gray-900">{selectedVendor.category}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Classification</Label>
                  <div className="text-xs">
                    <div className="text-gray-500">{selectedVendor.classificationCode}</div>
                    <div className="text-gray-900">{selectedVendor.classification}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Sub-Classification</Label>
                  <div className="text-xs">
                    <div className="text-gray-500">{selectedVendor.subClassificationCode}</div>
                    <div className="text-gray-900">{selectedVendor.subClassification}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Contact Person</Label>
                  <div className="text-gray-900">{selectedVendor.contactPerson || '-'}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Phone Number</Label>
                  <div className="text-gray-900 flex items-center gap-1">
                    {selectedVendor.phoneNumber && <Phone className="w-3 h-3" />}
                    {selectedVendor.phoneNumber || '-'}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <div className="text-gray-900 flex items-center gap-1">
                  {selectedVendor.email && <Mail className="w-3 h-3" />}
                  {selectedVendor.email || '-'}
                </div>
              </div>
              
              {selectedVendor.address && (
                <div>
                  <Label className="text-xs text-gray-500">Address</Label>
                  <div className="text-gray-900 flex items-start gap-1">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    {selectedVendor.address}
                  </div>
                </div>
              )}
              
              {selectedVendor.rating && selectedVendor.rating > 0 && (
                <div>
                  <Label className="text-xs text-gray-500">Rating</Label>
                  <div>{renderRating(selectedVendor.rating)}</div>
                </div>
              )}
              
              {selectedVendor.certifications && selectedVendor.certifications.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500">Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVendor.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        <Award className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedVendor.notes && (
                <div>
                  <Label className="text-xs text-gray-500">Notes</Label>
                  <div className="text-gray-900 text-sm bg-gray-50 p-3 rounded border">
                    {selectedVendor.notes}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t">
                <div>
                  <span className="font-medium">Created:</span> {selectedVendor.createdDate}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {selectedVendor.updatedDate}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
