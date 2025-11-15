// Matrix Contract Evaluation Conditions - Dynamic & Manageable by Administrator

export interface MatrixContractCondition {
  id: string;
  code: string;
  label: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdDate: string;
  updatedDate?: string;
}

// Initial matrix contract conditions
// Note: Transaction Value > USD 200,000 and Duration > 6 months are auto-checked in the form
const initialConditions: MatrixContractCondition[] = [
  {
    id: 'mc-003',
    code: 'CONTINUOUS_LONG_TERM_SUPPLY',
    label: 'Continuous/long term supply',
    description: 'Ongoing or long-term supply arrangement (not one-time purchase)',
    isActive: true,
    order: 1,
    createdDate: '2025-11-10',
  },
  {
    id: 'mc-005',
    code: 'RISK_ABOVE_1_5B',
    label: 'Risk value (SHE, Legal, Financial, External, Operation) > IDR 1.5 Billion',
    description: 'Combined risk value exceeds IDR 1.5 Billion threshold',
    isActive: true,
    order: 2,
    createdDate: '2025-11-10',
  },
];

// In-memory storage for matrix conditions
let matrixContractConditions: MatrixContractCondition[] = [...initialConditions];

// Get all active matrix contract conditions (sorted by order)
export function getActiveMatrixConditions(): MatrixContractCondition[] {
  return matrixContractConditions
    .filter(condition => condition.isActive)
    .sort((a, b) => a.order - b.order);
}

// Get all matrix contract conditions (for admin management)
export function getAllMatrixConditions(): MatrixContractCondition[] {
  return [...matrixContractConditions].sort((a, b) => a.order - b.order);
}

// Get matrix condition by ID
export function getMatrixConditionById(id: string): MatrixContractCondition | undefined {
  return matrixContractConditions.find(condition => condition.id === id);
}

// Get matrix condition by code
export function getMatrixConditionByCode(code: string): MatrixContractCondition | undefined {
  return matrixContractConditions.find(condition => condition.code === code);
}

// Add new matrix contract condition
export function addMatrixCondition(condition: Omit<MatrixContractCondition, 'id' | 'createdDate'>): MatrixContractCondition {
  const newCondition: MatrixContractCondition = {
    ...condition,
    id: `mc-${Date.now()}`,
    createdDate: new Date().toISOString().split('T')[0],
  };
  
  matrixContractConditions.push(newCondition);
  return newCondition;
}

// Update matrix contract condition
export function updateMatrixCondition(id: string, updates: Partial<MatrixContractCondition>): boolean {
  const index = matrixContractConditions.findIndex(condition => condition.id === id);
  
  if (index === -1) {
    return false;
  }
  
  matrixContractConditions[index] = {
    ...matrixContractConditions[index],
    ...updates,
    updatedDate: new Date().toISOString().split('T')[0],
  };
  
  return true;
}

// Delete matrix contract condition (soft delete - set isActive to false)
export function deleteMatrixCondition(id: string): boolean {
  const index = matrixContractConditions.findIndex(condition => condition.id === id);
  
  if (index === -1) {
    return false;
  }
  
  matrixContractConditions[index].isActive = false;
  matrixContractConditions[index].updatedDate = new Date().toISOString().split('T')[0];
  
  return true;
}

// Hard delete matrix contract condition (permanent removal)
export function hardDeleteMatrixCondition(id: string): boolean {
  const index = matrixContractConditions.findIndex(condition => condition.id === id);
  
  if (index === -1) {
    return false;
  }
  
  matrixContractConditions.splice(index, 1);
  return true;
}

// Reorder matrix conditions
export function reorderMatrixConditions(conditionIds: string[]): boolean {
  conditionIds.forEach((id, index) => {
    const condition = matrixContractConditions.find(c => c.id === id);
    if (condition) {
      condition.order = index + 1;
      condition.updatedDate = new Date().toISOString().split('T')[0];
    }
  });
  
  return true;
}

// Reset to initial conditions
export function resetMatrixConditions(): void {
  matrixContractConditions = [...initialConditions];
}

// Check if code already exists (for validation)
export function isMatrixConditionCodeUnique(code: string, excludeId?: string): boolean {
  return !matrixContractConditions.some(
    condition => condition.code === code && condition.id !== excludeId
  );
}
