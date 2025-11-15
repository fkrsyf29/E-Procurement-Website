import { MaterialsManagement } from './MaterialsManagement';
import { User, Material } from '../types';

interface AnnualPurchasePlanProps {
  user: User;
  materials: Material[];
  onAddMaterial: (material: Omit<Material, 'id' | 'createdDate'>) => void;
  onUpdateMaterial: (id: string, updates: Partial<Material>) => void;
  onDeleteMaterial: (id: string) => void;
  onBulkUpload: (materials: Omit<Material, 'id' | 'createdDate'>[]) => void;
}

/**
 * Annual Purchase Plan Component
 * 
 * This is the MAIN material management component for the system.
 * It manages material master data for proposal creation and procurement planning.
 * 
 * Key Features:
 * - Centralized material database with multi-jobsite support
 * - Extended fields: Qty, Price, Contract Type, Vendor, Contract dates, Unique flag
 * - Access: Administrator and Creator roles
 * - Bidirectional sync with localStorage for data persistence
 * - Bulk upload capability for efficient data entry
 * - Integration with Budget Items and Proposal Form
 */
export function AnnualPurchasePlan(props: AnnualPurchasePlanProps) {
  // Use the exact same component as MaterialsManagement
  // This ensures 100% data synchronization
  return <MaterialsManagement {...props} isAnnualPurchasePlan={true} />;
}
