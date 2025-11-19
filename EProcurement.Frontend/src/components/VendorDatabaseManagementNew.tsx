import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Star, Phone, Mail, MapPin, Award, X, Save, FileText, Building2, Calendar, Shield, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
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
import { toast } from 'sonner@2.0.3';
import { VendorRecord, vendorDatabase } from '../data/vendorDatabase_NEW';
import { categoryHierarchy, SubClassification } from '../data/categoryHierarchy';
import { getActiveExternalBrands, getActiveKBLICodes } from '../data/systemReferenceData';
import { User } from '../types';

interface VendorDatabaseManagementNewProps {
  user: User;
}

export function VendorDatabaseManagementNew({ user }: VendorDatabaseManagementNewProps) {
  const [vendors, setVendors] = useState<VendorRecord[]>(vendorDatabase);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);
  const [viewingVendor, setViewingVendor] = useState<VendorRecord | null>(null);
  
  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form fields - Basic Info
  const [vendorName, setVendorName] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  
  // Form fields - Capabilities
  const [selectedSubClasses, setSelectedSubClasses] = useState<SubClassification[]>([]);
  const [selectedKBLICodes, setSelectedKBLICodes] = useState<{ code: string; description: string }[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Form fields - Performance & Qualification
  const [rating, setRating] = useState<number>(0);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certificationInput, setCertificationInput] = useState('');
  
  // Form fields - Business Information
  const [companySize, setCompanySize] = useState<'Small' | 'Medium' | 'Large' | 'Enterprise'>('Medium');
  const [yearEstablished, setYearEstablished] = useState('');
  const [npwp, setNpwp] = useState('');
  const [siup, setSiup] = useState('');
  
  // Form fields - Financial
  const [creditLimit, setCreditLimit] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  
  // Form fields - Notes & Tags
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Form fields - Status
  const [isActive, setIsActive] = useState(true);
  const [isPreferred, setIsPreferred] = useState(false);
  
  // Multi-select helpers
  const [subClassSelectorOpen, setSubClassSelectorOpen] = useState(false);
  const [kbliSelectorOpen, setKbliSelectorOpen] = useState(false);
  const [brandSelectorOpen, setBrandSelectorOpen] = useState(false);
  
  // Get all sub-classifications from hierarchy
  const getAllSubClassifications = (): SubClassification[] => {
    const allSubClasses: SubClassification[] = [];
    categoryHierarchy.forEach(cat => {
      cat.classifications.forEach(cls => {
        cls.subClassifications.forEach(sub => {
          allSubClasses.push(sub);
        });
      });
    });
    return allSubClasses;
  };
  
  // Get available KBLI codes
  const availableKBLICodes = getActiveKBLICodes();
  
  // Get available brands
  const availableBrands = getActiveExternalBrands();
  
  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors;

    const term = searchTerm.toLowerCase();
    return vendors.filter(vendor =>
      vendor.vendorName.toLowerCase().includes(term) ||
      vendor.vendorCode.toLowerCase().includes(term) ||
      vendor.email?.toLowerCase().includes(term) ||
      vendor.contactPerson?.toLowerCase().includes(term)
    );
  }, [vendors, searchTerm]);

  const totalPages = Math.ceil(filteredVendors.length / pageSize);
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredVendors.slice(start, end);
  }, [filteredVendors, currentPage, pageSize]);

  // Reset ke halaman 1 ketika search atau pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);
  
  const handleNewVendor = () => {
    resetForm();
    setEditingVendor(null);
    setShowForm(true);
  };
  
  const handleEditVendor = (vendor: VendorRecord) => {
    setEditingVendor(vendor);
    
    // Populate form
    setVendorName(vendor.vendorName);
    setVendorCode(vendor.vendorCode);
    setContactPerson(vendor.contactPerson || '');
    setPhoneNumber(vendor.phoneNumber || '');
    setEmail(vendor.email || '');
    setAddress(vendor.address || '');
    setWebsite(vendor.website || '');
    
    // Capabilities
    const subClasses = vendor.capabilities.subClassifications.map(sc => {
      const allSubClasses = getAllSubClassifications();
      return allSubClasses.find(s => s.code === sc.subClassificationCode)!;
    }).filter(Boolean);
    setSelectedSubClasses(subClasses);
    setSelectedKBLICodes(vendor.capabilities.kbliCodes);
    setSelectedBrands(vendor.capabilities.brands);
    
    // Performance
    setRating(vendor.rating || 0);
    setCertifications(vendor.certifications || []);
    
    // Business
    setCompanySize(vendor.companySize || 'Medium');
    setYearEstablished(vendor.yearEstablished?.toString() || '');
    setNpwp(vendor.npwp || '');
    setSiup(vendor.siup || '');
    
    // Financial
    setCreditLimit(vendor.creditLimit?.toString() || '');
    setPaymentTerms(vendor.paymentTerms || '');
    
    // Notes & Tags
    setNotes(vendor.notes || '');
    setTags(vendor.tags || []);
    
    // Status
    setIsActive(vendor.isActive);
    setIsPreferred(vendor.isPreferred || false);
    
    setShowForm(true);
  };
  
  const handleViewVendor = (vendor: VendorRecord) => {
    setViewingVendor(vendor);
    setShowViewDialog(true);
  };
  
  const handleDeleteVendor = (vendor: VendorRecord) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.vendorName}?`)) {
      const newVendors = vendors.filter(v => v.id !== vendor.id);
      setVendors(newVendors);
      toast.success('Vendor deleted successfully');
    }
  };
  
  const handleSaveVendor = () => {
    // Validation
    if (!vendorName.trim()) {
      toast.error('Please enter vendor name');
      return;
    }
    if (!vendorCode.trim()) {
      toast.error('Please enter vendor code');
      return;
    }
    if (selectedSubClasses.length === 0) {
      toast.error('Please select at least one sub-classification');
      return;
    }
    
    const now = new Date().toISOString().split('T')[0];
        const savedVendor: VendorRecord = editingVendor
      ? {
          ...editingVendor,
          vendorName,
          vendorCode,
          contactPerson: contactPerson || undefined,
          phoneNumber: phoneNumber || undefined,
          email: email || undefined,
          address: address || undefined,
          website: website || undefined,
          capabilities: {
            subClassifications: selectedSubClasses.map(sc => ({
              categoryCode: sc.code.split('.')[0],
              categoryName: categoryHierarchy.find(c => c.code === sc.code.split('.')[0])?.name || '',
              classificationCode: `${sc.code.split('.')[0]}.${sc.code.split('.')[1]}`,
              classificationName: categoryHierarchy
                .find(c => c.code === sc.code.split('.')[0])
                ?.classifications.find(cl => cl.code === `${sc.code.split('.')[0]}.${sc.code.split('.')[1]}`)?.name || '',
              subClassificationCode: sc.code,
              subClassificationName: sc.name
            })),
            kbliCodes: selectedKBLICodes,
            brands: selectedBrands
          },
          rating: rating || undefined,
          certifications: certifications.length > 0 ? certifications : undefined,
          companySize,
          yearEstablished: yearEstablished ? parseInt(yearEstablished) : undefined,
          npwp: npwp || undefined,
          siup: siup || undefined,
          creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
          paymentTerms: paymentTerms || undefined,
          notes: notes || undefined,
          tags: tags.length > 0 ? tags : undefined,
          isActive,
          isPreferred,
          updatedDate: now,
          updatedBy: user.username
        }
      : {
          id: `VDB-${Date.now()}`,
          vendorName,
          vendorCode,
          contactPerson: contactPerson || undefined,
          phoneNumber: phoneNumber || undefined,
          email: email || undefined,
          address: address || undefined,
          website: website || undefined,
          capabilities: {
            subClassifications: selectedSubClasses.map(sc => ({
              categoryCode: sc.code.split('.')[0],
              categoryName: categoryHierarchy.find(c => c.code === sc.code.split('.')[0])?.name || '',
              classificationCode: `${sc.code.split('.')[0]}.${sc.code.split('.')[1]}`,
              classificationName: categoryHierarchy
                .find(c => c.code === sc.code.split('.')[0])
                ?.classifications.find(cl => cl.code === `${sc.code.split('.')[0]}.${sc.code.split('.')[1]}`)?.name || '',
              subClassificationCode: sc.code,
              subClassificationName: sc.name
            })),
            kbliCodes: selectedKBLICodes,
            brands: selectedBrands
          },
          rating: rating || undefined,
          certifications: certifications.length > 0 ? certifications : undefined,
          companySize,
          yearEstablished: yearEstablished ? parseInt(yearEstablished) : undefined,
          npwp: npwp || undefined,
          siup: siup || undefined,
          creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
          paymentTerms: paymentTerms || undefined,
          notes: notes || undefined,
          tags: tags.length > 0 ? tags : undefined,
          isActive,
          isPreferred,
          createdDate: now,
          updatedDate: now,
          createdBy: user.username,
          updatedBy: user.username
        };

    if (editingVendor) {
      setVendors(vendors.map(v => v.id === editingVendor.id ? savedVendor : v));
      toast.success('Vendor updated successfully');
    } else {
      setVendors([...vendors, savedVendor]);
      toast.success('Vendor created successfully');
    }
    
    setShowForm(false);
    resetForm();
    setCurrentPage(1);
  };
  
  const resetForm = () => {
    setVendorName('');
    setVendorCode('');
    setContactPerson('');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
    setWebsite('');
    setSelectedSubClasses([]);
    setSelectedKBLICodes([]);
    setSelectedBrands([]);
    setRating(0);
    setCertifications([]);
    setCertificationInput('');
    setCompanySize('Medium');
    setYearEstablished('');
    setNpwp('');
    setSiup('');
    setCreditLimit('');
    setPaymentTerms('');
    setNotes('');
    setTags([]);
    setTagInput('');
    setIsActive(true);
    setIsPreferred(false);
    setEditingVendor(null);
  };
  
  // Add certification
  const addCertification = () => {
    if (certificationInput.trim() && !certifications.includes(certificationInput.trim())) {
      setCertifications([...certifications, certificationInput.trim()]);
      setCertificationInput('');
    }
  };
  
  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Toggle sub-classification
  const toggleSubClass = (subClass: SubClassification) => {
    const exists = selectedSubClasses.find(sc => sc.code === subClass.code);
    if (exists) {
      setSelectedSubClasses(selectedSubClasses.filter(sc => sc.code !== subClass.code));
    } else {
      setSelectedSubClasses([...selectedSubClasses, subClass]);
    }
  };
  
  // Toggle KBLI
  const toggleKBLI = (kbli: { code: string; description: string }) => {
    const exists = selectedKBLICodes.find(k => k.code === kbli.code);
    if (exists) {
      setSelectedKBLICodes(selectedKBLICodes.filter(k => k.code !== kbli.code));
    } else {
      setSelectedKBLICodes([...selectedKBLICodes, kbli]);
    }
  };
  
  // Toggle brand
  const toggleBrand = (brand: string) => {
    const exists = selectedBrands.includes(brand);
    if (exists) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };
  
  // Check if user is admin
  if (user.roleName !== 'Administrator') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access Denied: Only administrators can manage vendor database.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-2">Vendor Database Management</h1>
        <p className="text-gray-600">
          Manage vendor information, capabilities (sub-classifications, KBLI, brands), and qualifications
        </p>
      </div>
      
      {/* Search and Actions Bar */}
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search vendors by name, code, email, or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleNewVendor} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>
      
      {/* Statistics */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Vendors</div>
          <div className="text-2xl text-gray-900 mt-1">{vendors.length}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Active Vendors</div>
          <div className="text-2xl text-green-600 mt-1">{vendors.filter(v => v.isActive).length}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Preferred Vendors</div>
          <div className="text-2xl text-blue-600 mt-1">{vendors.filter(v => v.isPreferred).length}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Inactive Vendors</div>
          <div className="text-2xl text-gray-400 mt-1">{vendors.filter(v => !v.isActive).length}</div>
        </div>
      </div>
      
      {/* Vendors Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#E6F2FF]">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Vendor Code</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sub-Classifications</TableHead>
                <TableHead>KBLI Codes</TableHead>
                <TableHead>Brands</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No vendors found matching your search.' : 'No vendors available. Click "Add Vendor" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVendors.map((vendor, index) => (
                  <TableRow key={vendor.id} className={!vendor.isActive ? 'opacity-50' : ''}>
                    <TableCell className="text-gray-600">{index + 1}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {vendor.vendorCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-gray-900">{vendor.vendorName}</div>
                        {vendor.isPreferred && (
                          <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                            ⭐ Preferred
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {vendor.contactPerson && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <FileText className="w-3 h-3" />
                            <span>{vendor.contactPerson}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs">{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phoneNumber && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{vendor.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.capabilities.subClassifications.slice(0, 2).map((sc, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {sc.subClassificationCode}
                          </Badge>
                        ))}
                        {vendor.capabilities.subClassifications.length > 2 && (
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            +{vendor.capabilities.subClassifications.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.capabilities.kbliCodes.slice(0, 2).map((kbli, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {kbli.code}
                          </Badge>
                        ))}
                        {vendor.capabilities.kbliCodes.length > 2 && (
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            +{vendor.capabilities.kbliCodes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.capabilities.brands.slice(0, 2).map((brand, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {brand}
                          </Badge>
                        ))}
                        {vendor.capabilities.brands.length > 2 && (
                          <Badge variant="outline" className="text-xs bg-gray-100">
                            +{vendor.capabilities.brands.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {vendor.rating ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{vendor.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No rating</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={vendor.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewVendor(vendor)}
                          className="h-8 px-2"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVendor(vendor)}
                          className="h-8 px-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor)}
                          className="h-8 px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      {/* Pagination Footer */}
        {filteredVendors.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredVendors.length)} of {filteredVendors.length} vendors
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Page Size */}
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSizeVendor" className="text-sm text-gray-700 whitespace-nowrap">
                  Rows per page:
                </Label>
                <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger id="pageSizeVendor" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  First
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>

                <span className="text-sm text-gray-700 px-2">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  Last
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Form Dialog - will continue in next part */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </DialogTitle>
            <DialogDescription>
              {editingVendor 
                ? 'Update vendor information, capabilities, and qualifications' 
                : 'Enter vendor information, select capabilities (sub-class, KBLI, brands), and qualifications'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Section 1: Basic Information */}
            <div className="border-b pb-4">
              <h3 className="text-sm mb-3 text-gray-700">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g., PT Kambing Guling"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorCode">Vendor Code *</Label>
                  <Input
                    id="vendorCode"
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value.toUpperCase())}
                    placeholder="e.g., VND-KG-001"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., +62 21 1234567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., sales@vendor.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g., www.vendor.com"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            {/* Section 2: Capabilities */}
            <div className="border-b pb-4">
              <h3 className="text-sm mb-3 text-gray-700">Vendor Capabilities *</h3>
              
              {/* Sub-Classifications */}
              <div className="mb-4">
                <Label>Sub-Classifications (Select multiple) *</Label>
                <div className="mt-2 border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {categoryHierarchy.map(cat => (
                    <div key={cat.code} className="mb-3">
                      <div className="text-xs mb-1 text-gray-500">{cat.name}</div>
                      {cat.classifications.map(cls => (
                        <div key={cls.code} className="ml-3 mb-2">
                          <div className="text-xs text-gray-600 mb-1">{cls.name}</div>
                          <div className="ml-3 space-y-1">
                            {cls.subClassifications.map(sub => {
                              const isSelected = selectedSubClasses.some(sc => sc.code === sub.code);
                              return (
                                <label key={sub.code} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSubClass(sub)}
                                    className="rounded"
                                  />
                                  <span className="text-xs text-gray-700">
                                    {sub.code} - {sub.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedSubClasses.map(sc => (
                    <Badge key={sc.code} className="bg-blue-100 text-blue-800 border-blue-300">
                      {sc.code}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => toggleSubClass(sc)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* KBLI Codes */}
              <div className="mb-4">
                <Label>KBLI Codes (Select multiple)</Label>
                <div className="mt-2 border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                  {availableKBLICodes.map(kbli => {
                    const isSelected = selectedKBLICodes.some(k => k.code === kbli.code);
                    return (
                      <label key={kbli.code} className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded mb-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleKBLI(kbli)}
                          className="rounded mt-0.5"
                        />
                        <span className="text-xs text-gray-700">
                          <strong>{kbli.code}</strong> - {kbli.description}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedKBLICodes.map(kbli => (
                    <Badge key={kbli.code} className="bg-green-100 text-green-800 border-green-300">
                      {kbli.code}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => toggleKBLI(kbli)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Brands */}
              <div>
                <Label>Brands (Select multiple)</Label>
                <div className="mt-2 border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                  <div className="grid grid-cols-3 gap-2">
                    {availableBrands.map(brand => {
                      const isSelected = selectedBrands.includes(brand);
                      return (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBrand(brand)}
                            className="rounded"
                          />
                          <span className="text-xs text-gray-700">{brand}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedBrands.map(brand => (
                    <Badge key={brand} className="bg-purple-100 text-purple-800 border-purple-300">
                      {brand}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => toggleBrand(brand)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Section 3: Performance & Qualification */}
            <div className="border-b pb-4">
              <h3 className="text-sm mb-3 text-gray-700">Performance & Qualification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 4.5"
                  />
                </div>
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={companySize} onValueChange={(v: any) => setCompanySize(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label>Certifications</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={certificationInput}
                    onChange={(e) => setCertificationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                    placeholder="e.g., ISO 9001"
                  />
                  <Button type="button" onClick={addCertification} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {certifications.map((cert, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-300">
                      <Award className="w-3 h-3 mr-1" />
                      {cert}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Section 4: Business Information */}
            <div className="border-b pb-4">
              <h3 className="text-sm mb-3 text-gray-700">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input
                    id="yearEstablished"
                    type="number"
                    value={yearEstablished}
                    onChange={(e) => setYearEstablished(e.target.value)}
                    placeholder="e.g., 2010"
                  />
                </div>
                <div>
                  <Label htmlFor="npwp">NPWP</Label>
                  <Input
                    id="npwp"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder="e.g., 01.234.567.8-901.000"
                  />
                </div>
                <div>
                  <Label htmlFor="siup">SIUP</Label>
                  <Input
                    id="siup"
                    value={siup}
                    onChange={(e) => setSiup(e.target.value)}
                    placeholder="e.g., 123/SIUP/2020"
                  />
                </div>
                <div>
                  <Label htmlFor="creditLimit">Credit Limit (IDR)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="e.g., 1000000000"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g., Net 30, Net 60, COD"
                  />
                </div>
              </div>
            </div>
            
            {/* Section 5: Notes & Tags */}
            <div className="border-b pb-4">
              <h3 className="text-sm mb-3 text-gray-700">Notes & Tags</h3>
              
              <div className="mb-4">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this vendor..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="e.g., Preferred, Strategic Partner"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.map((tag, idx) => (
                    <Badge key={idx} className="bg-gray-100 text-gray-800 border-gray-300">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Section 6: Status */}
            <div>
              <h3 className="text-sm mb-3 text-gray-700">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active (vendor can be recommended in proposals)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPreferred"
                    checked={isPreferred}
                    onCheckedChange={setIsPreferred}
                  />
                  <Label htmlFor="isPreferred" className="cursor-pointer">
                    Preferred Vendor (highlighted in recommendations)
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveVendor} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {editingVendor ? 'Update Vendor' : 'Create Vendor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      {viewingVendor && (
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingVendor.vendorName}</DialogTitle>
              <DialogDescription>
                Vendor Code: {viewingVendor.vendorCode}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm mb-2 text-gray-500">Basic Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {viewingVendor.contactPerson && (
                    <div>
                      <span className="text-gray-600">Contact Person:</span>
                      <div className="text-gray-900">{viewingVendor.contactPerson}</div>
                    </div>
                  )}
                  {viewingVendor.email && (
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <div className="text-gray-900">{viewingVendor.email}</div>
                    </div>
                  )}
                  {viewingVendor.phoneNumber && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <div className="text-gray-900">{viewingVendor.phoneNumber}</div>
                    </div>
                  )}
                  {viewingVendor.website && (
                    <div>
                      <span className="text-gray-600">Website:</span>
                      <div className="text-gray-900">{viewingVendor.website}</div>
                    </div>
                  )}
                  {viewingVendor.address && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Address:</span>
                      <div className="text-gray-900">{viewingVendor.address}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Capabilities */}
              <div className="border-t pt-4">
                <h3 className="text-sm mb-2 text-gray-500">Capabilities</h3>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-1">Sub-Classifications:</div>
                  <div className="flex flex-wrap gap-1">
                    {viewingVendor.capabilities.subClassifications.map((sc, idx) => (
                      <Badge key={idx} variant="outline">
                        {sc.subClassificationCode} - {sc.subClassificationName}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-1">KBLI Codes:</div>
                  <div className="flex flex-wrap gap-1">
                    {viewingVendor.capabilities.kbliCodes.map((kbli, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-50">
                        {kbli.code} - {kbli.description}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-600 mb-1">Brands:</div>
                  <div className="flex flex-wrap gap-1">
                    {viewingVendor.capabilities.brands.map((brand, idx) => (
                      <Badge key={idx} variant="outline" className="bg-purple-50">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Performance */}
              {(viewingVendor.rating || viewingVendor.certifications) && (
                <div className="border-t pt-4">
                  <h3 className="text-sm mb-2 text-gray-500">Performance & Qualification</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {viewingVendor.rating && (
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-900">{viewingVendor.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                    {viewingVendor.certifications && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Certifications:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {viewingVendor.certifications.map((cert, idx) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-300">
                              <Award className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {viewingVendor.tags && viewingVendor.tags.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm mb-2 text-gray-500">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {viewingVendor.tags.map((tag, idx) => (
                      <Badge key={idx} className="bg-gray-100 text-gray-800 border-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status */}
              <div className="border-t pt-4">
                <h3 className="text-sm mb-2 text-gray-500">Status</h3>
                <div className="flex gap-2">
                  <Badge className={viewingVendor.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'}>
                    {viewingVendor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {viewingVendor.isPreferred && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      ⭐ Preferred
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowViewDialog(false);
                handleEditVendor(viewingVendor);
              }} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Vendor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
