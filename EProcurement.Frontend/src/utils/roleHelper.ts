// Helper functions for extracting information from role names

import { Department, Jobsite } from '../types';

/**
 * Extract department from role name
 * e.g., "Creator Plant Department JAHO" -> "Plant"
 * e.g., "Unit Head HR Department ADMO MINING" -> "HR"
 */
export function extractDepartmentFromRole(roleName: string): Department | null {
  // List of all departments
  const departments: Department[] = [
    'Plant',
    'Logistic',
    'HR',
    'GA',
    'SHE',
    'Finance',
    'Production',
    'Engineering',
    'IT',
  ];

  // Find department in role name
  for (const dept of departments) {
    if (roleName.includes(`${dept} Department`)) {
      return dept;
    }
  }

  return null;
}

/**
 * Extract jobsite from role name
 * e.g., "Creator Plant Department JAHO" -> "JAHO"
 * e.g., "Unit Head HR Department ADMO MINING" -> "ADMO MINING"
 */
export function extractJobsiteFromRole(roleName: string): Jobsite | null {
  // List of all jobsites (order matters - check longer names first)
  const jobsites: Jobsite[] = [
    'ADMO MINING',
    'ADMO HAULING',
    'MACO MINING',
    'MACO HAULING',
    'SERA',
    'JAHO',
    'NARO',
  ];

  // Find jobsite in role name (check longer names first to avoid partial matches)
  for (const jobsite of jobsites) {
    if (roleName.includes(jobsite)) {
      return jobsite;
    }
  }

  return null;
}

/**
 * Check if user is a Creator role
 */
export function isCreatorRole(roleName: string): boolean {
  return roleName.startsWith('Creator ');
}

/**
 * Check if user can create proposal for specific department
 * Rule: Creator can only create for their own department
 */
export function canCreateForDepartment(
  userRole: string,
  targetDepartment: Department
): boolean {
  // Admin can create for all departments
  if (userRole === 'Administrator') {
    return true;
  }

  // If not a creator, check if it's a special role
  if (!isCreatorRole(userRole)) {
    return true; // Non-creator roles might have different permissions
  }

  // Extract user's department from role
  const userDepartment = extractDepartmentFromRole(userRole);
  
  // Creator can only create for their own department
  return userDepartment === targetDepartment;
}

/**
 * Check if user can create proposal for specific jobsite
 * Rule: 
 * - JAHO creators can create for all jobsites
 * - Other jobsite creators can only create for their own jobsite
 */
export function canCreateForJobsite(
  userRole: string,
  targetJobsite: Jobsite
): boolean {
  // Admin can create for all jobsites
  if (userRole === 'Administrator') {
    return true;
  }

  // If not a creator, check if it's a special role
  if (!isCreatorRole(userRole)) {
    return true; // Non-creator roles might have different permissions
  }

  // Extract user's jobsite from role
  const userJobsite = extractJobsiteFromRole(userRole);
  
  // JAHO creators can create for all jobsites
  if (userJobsite === 'JAHO') {
    return true;
  }

  // Other creators can only create for their own jobsite
  return userJobsite === targetJobsite;
}

/**
 * Get allowed departments for user
 */
export function getAllowedDepartments(
  userRole: string,
  allDepartments: Department[]
): Department[] {
  // Admin can access all departments
  if (userRole === 'Administrator') {
    return allDepartments;
  }

  // If not a creator, return all departments
  if (!isCreatorRole(userRole)) {
    return allDepartments;
  }

  // Creator can only see their own department
  const userDepartment = extractDepartmentFromRole(userRole);
  
  if (userDepartment) {
    return [userDepartment];
  }

  return allDepartments;
}

/**
 * Get allowed jobsites for user
 */
export function getAllowedJobsites(
  userRole: string,
  allJobsites: Jobsite[]
): Jobsite[] {
  // Admin can access all jobsites
  if (userRole === 'Administrator') {
    return allJobsites;
  }

  // If not a creator, return all jobsites
  if (!isCreatorRole(userRole)) {
    return allJobsites;
  }

  // Extract user's jobsite from role
  const userJobsite = extractJobsiteFromRole(userRole);
  
  // JAHO creators can access all jobsites
  if (userJobsite === 'JAHO') {
    return allJobsites;
  }

  // Other creators can only see their own jobsite
  if (userJobsite) {
    return [userJobsite];
  }

  return allJobsites;
}
