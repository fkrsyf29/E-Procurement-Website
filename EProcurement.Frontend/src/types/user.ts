export interface apiUser {
  userID: number;
  username: string;
  password: string;
  name: string;
  roleName: string;
  jobsite: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  lastPasswordChange: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}