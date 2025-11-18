import { Proposal, User, VendorRecommendation } from '../types';

// Mock users for different roles - Updated to use roles from rolesData.ts
export const mockUsers: User[] = [
  // System & Leadership
  { 
    userID: '1', 
    username: 'admin', 
    password: 'admin123', 
    name: 'System Administrator', 
    roleName: 'Administrator', 
    email: 'admin@eproposal.com', 
    phone: '+62 812-1000-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '2', 
    username: 'presdir', 
    password: 'presdir123', 
    name: 'Budi Santoso', 
    roleName: 'President Director', 
    email: 'president@eproposal.com', 
    phone: '+62 812-1000-0002', 
    lastPasswordChange: '2025-11-07' 
  },

  // Plant Department - JAHO
  { 
    userID: '3', 
    username: 'creator.plant.jaho', 
    password: 'creator123', 
    name: 'Ahmad Fauzi', 
    roleName: 'Creator Plant Department JAHO', 
    jobsite: 'JAHO', 
    department: 'Plant', 
    email: 'ahmad.fauzi@eproposal.com', 
    phone: '+62 812-2001-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '4', 
    username: 'uh.plant.jaho', 
    password: 'unithead123', 
    name: 'Siti Nurhaliza', 
    roleName: 'Unit Head Plant Department JAHO', 
    jobsite: 'JAHO', 
    department: 'Plant', 
    email: 'siti.nurhaliza@eproposal.com', 
    phone: '+62 812-2001-0002', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '5', 
    username: 'sh.plant.jaho', 
    password: 'sectionhead123', 
    name: 'Budi Rahardjo', 
    roleName: 'Section Head Plant Department JAHO', 
    jobsite: 'JAHO', 
    department: 'Plant', 
    email: 'budi.rahardjo@eproposal.com', 
    phone: '+62 812-2001-0003', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '6', 
    username: 'dh.plant.jaho', 
    password: 'depthead123', 
    name: 'Dewi Kartika', 
    roleName: 'Department Head Plant Department JAHO', 
    jobsite: 'JAHO', 
    department: 'Plant', 
    email: 'dewi.kartika@eproposal.com', 
    phone: '+62 812-2001-0004', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '7', 
    username: 'mgr.plant.jaho', 
    password: 'manager123', 
    name: 'Eko Prasetyo', 
    roleName: 'Manager Plant Department JAHO', 
    jobsite: 'JAHO', 
    department: 'Plant', 
    email: 'eko.prasetyo@eproposal.com', 
    phone: '+62 812-2001-0005', 
    lastPasswordChange: '2025-11-07' 
  },

  // IT Department - SERA
  { 
    userID: '8', 
    username: 'creator.it.sera', 
    password: 'creator123', 
    name: 'Rizki Ramadhan', 
    roleName: 'Creator IT Department SERA', 
    jobsite: 'SERA', 
    department: 'IT', 
    email: 'rizki.ramadhan@eproposal.com', 
    phone: '+62 812-2002-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '9', 
    username: 'uh.it.sera', 
    password: 'unithead123', 
    name: 'Maya Sari', 
    roleName: 'Unit Head IT Department SERA', 
    jobsite: 'SERA', 
    department: 'IT', 
    email: 'maya.sari@eproposal.com', 
    phone: '+62 812-2002-0002', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '10', 
    username: 'sh.it.sera', 
    password: 'sectionhead123', 
    name: 'Agus Setiawan', 
    roleName: 'Section Head IT Department SERA', 
    jobsite: 'SERA', 
    department: 'IT', 
    email: 'agus.setiawan@eproposal.com', 
    phone: '+62 812-2002-0003', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '11', 
    username: 'dh.it.sera', 
    password: 'depthead123', 
    name: 'Dian Pramudya', 
    roleName: 'Department Head IT Department SERA', 
    jobsite: 'SERA', 
    department: 'IT', 
    email: 'dian.pramudya@eproposal.com', 
    phone: '+62 812-2002-0004', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '12', 
    username: 'mgr.it.sera', 
    password: 'manager123', 
    name: 'Fitri Handayani', 
    roleName: 'Manager IT Department SERA', 
    jobsite: 'SERA', 
    department: 'IT', 
    email: 'fitri.handayani@eproposal.com', 
    phone: '+62 812-2002-0005', 
    lastPasswordChange: '2025-11-07' 
  },

  // Finance Department - MACO HAULING
  { 
    userID: '13', 
    username: 'creator.finance.maco', 
    password: 'creator123', 
    name: 'Linda Wijaya', 
    roleName: 'Creator Finance Department MACO HAULING', 
    jobsite: 'MACO HAULING', 
    department: 'Finance', 
    email: 'linda.wijaya@eproposal.com', 
    phone: '+62 812-2003-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '14', 
    username: 'dh.finance.maco', 
    password: 'depthead123', 
    name: 'Hendra Kusuma', 
    roleName: 'Department Head Finance Department MACO HAULING', 
    jobsite: 'MACO HAULING', 
    department: 'Finance', 
    email: 'hendra.kusuma@eproposal.com', 
    phone: '+62 812-2003-0002', 
    lastPasswordChange: '2025-11-07' 
  },

  // Logistic Department - ADMO MINING
  { 
    userID: '15', 
    username: 'creator.logistic.admo', 
    password: 'creator123', 
    name: 'Yudi Hartono', 
    roleName: 'Creator Logistic Department ADMO MINING', 
    jobsite: 'ADMO MINING', 
    department: 'Logistic', 
    email: 'yudi.hartono@eproposal.com', 
    phone: '+62 812-2004-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '16', 
    username: 'mgr.logistic.admo', 
    password: 'manager123', 
    name: 'Ratna Sari', 
    roleName: 'Manager Logistic Department ADMO MINING', 
    jobsite: 'ADMO MINING', 
    department: 'Logistic', 
    email: 'ratna.sari@eproposal.com', 
    phone: '+62 812-2004-0002', 
    lastPasswordChange: '2025-11-07' 
  },

  // Additional Creators for Planner Testing
  // Plant Department - ADMO MINING
  { 
    userID: '40', 
    username: 'creator.plant.admo.mining', 
    password: 'creator123', 
    name: 'Wawan Setiawan', 
    roleName: 'Creator Plant Department ADMO MINING', 
    jobsite: 'ADMO MINING', 
    department: 'Plant', 
    email: 'wawan.setiawan@eproposal.com', 
    phone: '+62 812-2005-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Plant Department - ADMO HAULING
  { 
    userID: '41', 
    username: 'creator.plant.admo.hauling', 
    password: 'creator123', 
    name: 'Indah Permata', 
    roleName: 'Creator Plant Department ADMO HAULING', 
    jobsite: 'ADMO HAULING', 
    department: 'Plant', 
    email: 'indah.permata@eproposal.com', 
    phone: '+62 812-2006-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Plant Department - SERA
  { 
    userID: '42', 
    username: 'creator.plant.sera', 
    password: 'creator123', 
    name: 'Gunawan Santoso', 
    roleName: 'Creator Plant Department SERA', 
    jobsite: 'SERA', 
    department: 'Plant', 
    email: 'gunawan.santoso@eproposal.com', 
    phone: '+62 812-2007-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Plant Department - NARO
  { 
    userID: '43', 
    username: 'creator.plant.naro', 
    password: 'creator123', 
    name: 'Dewi Lestari', 
    roleName: 'Creator Plant Department NARO', 
    jobsite: 'NARO', 
    department: 'Plant', 
    email: 'dewi.lestari@eproposal.com', 
    phone: '+62 812-2008-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Plant Department - MACO MINING
  { 
    userID: '44', 
    username: 'creator.plant.maco.mining', 
    password: 'creator123', 
    name: 'Budi Cahyono', 
    roleName: 'Creator Plant Department MACO MINING', 
    jobsite: 'MACO MINING', 
    department: 'Plant', 
    email: 'budi.cahyono@eproposal.com', 
    phone: '+62 812-2009-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Plant Department - MACO HAULING
  { 
    userID: '45', 
    username: 'creator.plant.maco.hauling', 
    password: 'creator123', 
    name: 'Siti Rahayu', 
    roleName: 'Creator Plant Department MACO HAULING', 
    jobsite: 'MACO HAULING', 
    department: 'Plant', 
    email: 'siti.rahayu@eproposal.com', 
    phone: '+62 812-2010-0001', 
    lastPasswordChange: '2025-11-07' 
  },

  // Division Heads
  { 
    userID: '17', 
    username: 'divhead.plant', 
    password: 'divhead123', 
    name: 'Susanto Wibowo', 
    roleName: 'Plant Division Head', 
    department: 'Plant', 
    email: 'susanto.wibowo@eproposal.com', 
    phone: '+62 812-3001-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '18', 
    username: 'divhead.it', 
    password: 'divhead123', 
    name: 'Andri Wijaya', 
    roleName: 'IT Division Head', 
    department: 'IT', 
    email: 'andri.wijaya@eproposal.com', 
    phone: '+62 812-3001-0002', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '19', 
    username: 'divhead.finance', 
    password: 'divhead123', 
    name: 'Diana Kusuma', 
    roleName: 'Finance Division Head', 
    department: 'Finance', 
    email: 'diana.kusuma@eproposal.com', 
    phone: '+62 812-3001-0003', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '20', 
    username: 'divhead.logistic', 
    password: 'divhead123', 
    name: 'Hari Santoso', 
    roleName: 'Logistic Division Head', 
    department: 'Logistic', 
    email: 'hari.santoso@eproposal.com', 
    phone: '+62 812-3001-0004', 
    lastPasswordChange: '2025-11-07' 
  },

  // Directors
  { 
    userID: '21', 
    username: 'dir.plant', 
    password: 'director123', 
    name: 'Ir. Bambang Suryanto', 
    roleName: 'Plant Director', 
    department: 'Plant', 
    email: 'bambang.suryanto@eproposal.com', 
    phone: '+62 812-4001-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '22', 
    username: 'dir.finance', 
    password: 'director123', 
    name: 'Dra. Sri Mulyani', 
    roleName: 'Finance Director', 
    department: 'Finance', 
    email: 'sri.mulyani@eproposal.com', 
    phone: '+62 812-4001-0002', 
    lastPasswordChange: '2025-11-07' 
  },

  // Chief Operations
  { 
    userID: '23', 
    username: 'co.admo', 
    password: 'chiefop123', 
    name: 'Ir. Wijaya Kusuma', 
    roleName: 'Chief Operation ADMO', 
    email: 'wijaya.kusuma@eproposal.com', 
    phone: '+62 812-5001-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '24', 
    username: 'co.sera', 
    password: 'chiefop123', 
    name: 'Ir. Hadi Pranoto', 
    roleName: 'Chief Operation SERA', 
    email: 'hadi.pranoto@eproposal.com', 
    phone: '+62 812-5001-0002', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '25', 
    username: 'co.maco', 
    password: 'chiefop123', 
    name: 'Ir. Rudi Hermawan', 
    roleName: 'Chief Operation MACO', 
    email: 'rudi.hermawan@eproposal.com', 
    phone: '+62 812-5001-0003', 
    lastPasswordChange: '2025-11-07' 
  },

  // Sourcing Team - Planner (HO Only)
  { 
    userID: '28', 
    username: 'planner', 
    password: 'planner123', 
    name: 'Andi Saputra', 
    roleName: 'Planner', 
    jobsite: 'HO',
    department: 'Procurement',
    email: 'andi.saputra@eproposal.com', 
    phone: '+62 812-6001-0003', 
    lastPasswordChange: '2025-11-07' 
  },

  // Sourcing Team - Buyers by Jobsite
  // Buyer JAHO
  { 
    userID: '26', 
    username: 'buyer.jaho', 
    password: 'buyer123', 
    name: 'Tommy Wijaya', 
    roleName: 'Buyer', 
    jobsite: 'JAHO',
    department: 'Procurement',
    email: 'tommy.wijaya@eproposal.com', 
    phone: '+62 812-6001-0001', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Buyer SERA
  { 
    userID: '31', 
    username: 'buyer.sera', 
    password: 'buyer123', 
    name: 'Dedi Kurniawan', 
    roleName: 'Buyer', 
    jobsite: 'SERA',
    department: 'Procurement',
    email: 'dedi.kurniawan@eproposal.com', 
    phone: '+62 812-6001-0006', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Buyer ADMO MINING
  { 
    userID: '32', 
    username: 'buyer.admo.mining', 
    password: 'buyer123', 
    name: 'Sari Wulandari', 
    roleName: 'Buyer', 
    jobsite: 'ADMO MINING',
    department: 'Procurement',
    email: 'sari.wulandari@eproposal.com', 
    phone: '+62 812-6001-0007', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Buyer ADMO HAULING
  { 
    userID: '33', 
    username: 'buyer.admo.hauling', 
    password: 'buyer123', 
    name: 'Fandi Pratama', 
    roleName: 'Buyer', 
    jobsite: 'ADMO HAULING',
    department: 'Procurement',
    email: 'fandi.pratama@eproposal.com', 
    phone: '+62 812-6001-0008', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Buyer NARO
  { 
    userID: '34', 
    username: 'buyer.naro', 
    password: 'buyer123', 
    name: 'Rina Melati', 
    roleName: 'Buyer', 
    jobsite: 'NARO',
    department: 'Procurement',
    email: 'rina.melati@eproposal.com', 
    phone: '+62 812-6001-0009', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Buyer MACO MINING
  { 
    userID: '35', 
    username: 'buyer.maco.mining', 
    password: 'buyer123', 
    name: 'Bambang Sutejo', 
    roleName: 'Buyer', 
    jobsite: 'MACO MINING',
    department: 'Procurement',
    email: 'bambang.sutejo@eproposal.com', 
    phone: '+62 812-6001-0010', 
    lastPasswordChange: '2025-11-07' 
  },
  
  // Buyer MACO HAULING
  { 
    userID: '36', 
    username: 'buyer.maco.hauling', 
    password: 'buyer123', 
    name: 'Hendra Wijaya', 
    roleName: 'Buyer', 
    jobsite: 'MACO HAULING',
    department: 'Procurement',
    email: 'hendra.wijaya@eproposal.com', 
    phone: '+62 812-6001-0011', 
    lastPasswordChange: '2025-11-07' 
  },

  // Sourcing Team - Sourcing (JAHO Only)
  { 
    userID: '27', 
    username: 'sourcing.jaho', 
    password: 'sourcing123', 
    name: 'Emma Kusuma', 
    roleName: 'Sourcing', 
    jobsite: 'JAHO',
    department: 'Procurement',
    email: 'emma.kusuma@eproposal.com', 
    phone: '+62 812-6001-0002', 
    lastPasswordChange: '2025-11-07' 
  },

  // Sourcing Management
  { 
    userID: '29', 
    username: 'sourcing.depthead', 
    password: 'sourcingdh123', 
    name: 'Rini Susilowati', 
    roleName: 'Sourcing Department Head', 
    jobsite: 'JAHO',
    department: 'Procurement',
    email: 'rini.susilowati@eproposal.com', 
    phone: '+62 812-6001-0004', 
    lastPasswordChange: '2025-11-07' 
  },
  { 
    userID: '30', 
    username: 'procurement.divhead', 
    password: 'procdiv123', 
    name: 'Hendra Gunawan', 
    roleName: 'Procurement Division Head', 
    email: 'hendra.gunawan@eproposal.com', 
    phone: '+62 812-6001-0005', 
    lastPasswordChange: '2025-11-07' 
  },
];

export const mapApiUserToDefinition = (apiUser: any): User => ({
  userID: apiUser.userID,                                            
  username: apiUser.username,
  password: apiUser.password,
  name: apiUser.name,
  roleName: apiUser.roleName,
  jobsite: apiUser.jobsite ?? '',
  department: apiUser.department ?? '',
  email: apiUser.email ?? '',
  phone: apiUser.phone ?? '',
  lastPasswordChange: apiUser.lastPasswordChange
    ? apiUser.lastPasswordChange.split('T')[0]
    : undefined
});

export const FALLBACK_USERS = [
    { 
      userID: '1', 
      username: 'admin', 
      password: 'admin123', 
      name: 'System Administrator', 
      roleName: 'Administrator', 
      email: 'admin@eproposal.com', 
      phone: '+62 812-1000-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '2', 
      username: 'presdir', 
      password: 'presdir123', 
      name: 'Budi Santoso', 
      roleName: 'President Director', 
      email: 'president@eproposal.com', 
      phone: '+62 812-1000-0002', 
      lastPasswordChange: '2025-11-07' 
    },

    // Plant Department - JAHO
    { 
      userID: '3', 
      username: 'creator.plant.jaho', 
      password: 'creator123', 
      name: 'Ahmad Fauzi', 
      roleName: 'Creator Plant Department JAHO', 
      jobsite: 'JAHO', 
      department: 'Plant', 
      email: 'ahmad.fauzi@eproposal.com', 
      phone: '+62 812-2001-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '4', 
      username: 'uh.plant.jaho', 
      password: 'unithead123', 
      name: 'Siti Nurhaliza', 
      roleName: 'Unit Head Plant Department JAHO', 
      jobsite: 'JAHO', 
      department: 'Plant', 
      email: 'siti.nurhaliza@eproposal.com', 
      phone: '+62 812-2001-0002', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '5', 
      username: 'sh.plant.jaho', 
      password: 'sectionhead123', 
      name: 'Budi Rahardjo', 
      roleName: 'Section Head Plant Department JAHO', 
      jobsite: 'JAHO', 
      department: 'Plant', 
      email: 'budi.rahardjo@eproposal.com', 
      phone: '+62 812-2001-0003', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '6', 
      username: 'dh.plant.jaho', 
      password: 'depthead123', 
      name: 'Dewi Kartika', 
      roleName: 'Department Head Plant Department JAHO', 
      jobsite: 'JAHO', 
      department: 'Plant', 
      email: 'dewi.kartika@eproposal.com', 
      phone: '+62 812-2001-0004', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '7', 
      username: 'mgr.plant.jaho', 
      password: 'manager123', 
      name: 'Eko Prasetyo', 
      roleName: 'Manager Plant Department JAHO', 
      jobsite: 'JAHO', 
      department: 'Plant', 
      email: 'eko.prasetyo@eproposal.com', 
      phone: '+62 812-2001-0005', 
      lastPasswordChange: '2025-11-07' 
    },

    // IT Department - SERA
    { 
      userID: '8', 
      username: 'creator.it.sera', 
      password: 'creator123', 
      name: 'Rizki Ramadhan', 
      roleName: 'Creator IT Department SERA', 
      jobsite: 'SERA', 
      department: 'IT', 
      email: 'rizki.ramadhan@eproposal.com', 
      phone: '+62 812-2002-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '9', 
      username: 'uh.it.sera', 
      password: 'unithead123', 
      name: 'Maya Sari', 
      roleName: 'Unit Head IT Department SERA', 
      jobsite: 'SERA', 
      department: 'IT', 
      email: 'maya.sari@eproposal.com', 
      phone: '+62 812-2002-0002', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '10', 
      username: 'sh.it.sera', 
      password: 'sectionhead123', 
      name: 'Agus Setiawan', 
      roleName: 'Section Head IT Department SERA', 
      jobsite: 'SERA', 
      department: 'IT', 
      email: 'agus.setiawan@eproposal.com', 
      phone: '+62 812-2002-0003', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '11', 
      username: 'dh.it.sera', 
      password: 'depthead123', 
      name: 'Dian Pramudya', 
      roleName: 'Department Head IT Department SERA', 
      jobsite: 'SERA', 
      department: 'IT', 
      email: 'dian.pramudya@eproposal.com', 
      phone: '+62 812-2002-0004', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '12', 
      username: 'mgr.it.sera', 
      password: 'manager123', 
      name: 'Fitri Handayani', 
      roleName: 'Manager IT Department SERA', 
      jobsite: 'SERA', 
      department: 'IT', 
      email: 'fitri.handayani@eproposal.com', 
      phone: '+62 812-2002-0005', 
      lastPasswordChange: '2025-11-07' 
    },

    // Finance Department - MACO HAULING
    { 
      userID: '13', 
      username: 'creator.finance.maco', 
      password: 'creator123', 
      name: 'Linda Wijaya', 
      roleName: 'Creator Finance Department MACO HAULING', 
      jobsite: 'MACO HAULING', 
      department: 'Finance', 
      email: 'linda.wijaya@eproposal.com', 
      phone: '+62 812-2003-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '14', 
      username: 'dh.finance.maco', 
      password: 'depthead123', 
      name: 'Hendra Kusuma', 
      roleName: 'Department Head Finance Department MACO HAULING', 
      jobsite: 'MACO HAULING', 
      department: 'Finance', 
      email: 'hendra.kusuma@eproposal.com', 
      phone: '+62 812-2003-0002', 
      lastPasswordChange: '2025-11-07' 
    },

    // Logistic Department - ADMO MINING
    { 
      userID: '15', 
      username: 'creator.logistic.admo', 
      password: 'creator123', 
      name: 'Yudi Hartono', 
      roleName: 'Creator Logistic Department ADMO MINING', 
      jobsite: 'ADMO MINING', 
      department: 'Logistic', 
      email: 'yudi.hartono@eproposal.com', 
      phone: '+62 812-2004-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '16', 
      username: 'mgr.logistic.admo', 
      password: 'manager123', 
      name: 'Ratna Sari', 
      roleName: 'Manager Logistic Department ADMO MINING', 
      jobsite: 'ADMO MINING', 
      department: 'Logistic', 
      email: 'ratna.sari@eproposal.com', 
      phone: '+62 812-2004-0002', 
      lastPasswordChange: '2025-11-07' 
    },

    // Additional Creators for Planner Testing
    // Plant Department - ADMO MINING
    { 
      userID: '40', 
      username: 'creator.plant.admo.mining', 
      password: 'creator123', 
      name: 'Wawan Setiawan', 
      roleName: 'Creator Plant Department ADMO MINING', 
      jobsite: 'ADMO MINING', 
      department: 'Plant', 
      email: 'wawan.setiawan@eproposal.com', 
      phone: '+62 812-2005-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Plant Department - ADMO HAULING
    { 
      userID: '41', 
      username: 'creator.plant.admo.hauling', 
      password: 'creator123', 
      name: 'Indah Permata', 
      roleName: 'Creator Plant Department ADMO HAULING', 
      jobsite: 'ADMO HAULING', 
      department: 'Plant', 
      email: 'indah.permata@eproposal.com', 
      phone: '+62 812-2006-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Plant Department - SERA
    { 
      userID: '42', 
      username: 'creator.plant.sera', 
      password: 'creator123', 
      name: 'Gunawan Santoso', 
      roleName: 'Creator Plant Department SERA', 
      jobsite: 'SERA', 
      department: 'Plant', 
      email: 'gunawan.santoso@eproposal.com', 
      phone: '+62 812-2007-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Plant Department - NARO
    { 
      userID: '43', 
      username: 'creator.plant.naro', 
      password: 'creator123', 
      name: 'Dewi Lestari', 
      roleName: 'Creator Plant Department NARO', 
      jobsite: 'NARO', 
      department: 'Plant', 
      email: 'dewi.lestari@eproposal.com', 
      phone: '+62 812-2008-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Plant Department - MACO MINING
    { 
      userID: '44', 
      username: 'creator.plant.maco.mining', 
      password: 'creator123', 
      name: 'Budi Cahyono', 
      roleName: 'Creator Plant Department MACO MINING', 
      jobsite: 'MACO MINING', 
      department: 'Plant', 
      email: 'budi.cahyono@eproposal.com', 
      phone: '+62 812-2009-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Plant Department - MACO HAULING
    { 
      userID: '45', 
      username: 'creator.plant.maco.hauling', 
      password: 'creator123', 
      name: 'Siti Rahayu', 
      roleName: 'Creator Plant Department MACO HAULING', 
      jobsite: 'MACO HAULING', 
      department: 'Plant', 
      email: 'siti.rahayu@eproposal.com', 
      phone: '+62 812-2010-0001', 
      lastPasswordChange: '2025-11-07' 
    },

    // Division Heads
    { 
      userID: '17', 
      username: 'divhead.plant', 
      password: 'divhead123', 
      name: 'Susanto Wibowo', 
      roleName: 'Plant Division Head', 
      department: 'Plant', 
      email: 'susanto.wibowo@eproposal.com', 
      phone: '+62 812-3001-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '18', 
      username: 'divhead.it', 
      password: 'divhead123', 
      name: 'Andri Wijaya', 
      roleName: 'IT Division Head', 
      department: 'IT', 
      email: 'andri.wijaya@eproposal.com', 
      phone: '+62 812-3001-0002', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '19', 
      username: 'divhead.finance', 
      password: 'divhead123', 
      name: 'Diana Kusuma', 
      roleName: 'Finance Division Head', 
      department: 'Finance', 
      email: 'diana.kusuma@eproposal.com', 
      phone: '+62 812-3001-0003', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '20', 
      username: 'divhead.logistic', 
      password: 'divhead123', 
      name: 'Hari Santoso', 
      roleName: 'Logistic Division Head', 
      department: 'Logistic', 
      email: 'hari.santoso@eproposal.com', 
      phone: '+62 812-3001-0004', 
      lastPasswordChange: '2025-11-07' 
    },

    // Directors
    { 
      userID: '21', 
      username: 'dir.plant', 
      password: 'director123', 
      name: 'Ir. Bambang Suryanto', 
      roleName: 'Plant Director', 
      department: 'Plant', 
      email: 'bambang.suryanto@eproposal.com', 
      phone: '+62 812-4001-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '22', 
      username: 'dir.finance', 
      password: 'director123', 
      name: 'Dra. Sri Mulyani', 
      roleName: 'Finance Director', 
      department: 'Finance', 
      email: 'sri.mulyani@eproposal.com', 
      phone: '+62 812-4001-0002', 
      lastPasswordChange: '2025-11-07' 
    },

    // Chief Operations
    { 
      userID: '23', 
      username: 'co.admo', 
      password: 'chiefop123', 
      name: 'Ir. Wijaya Kusuma', 
      roleName: 'Chief Operation ADMO', 
      email: 'wijaya.kusuma@eproposal.com', 
      phone: '+62 812-5001-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '24', 
      username: 'co.sera', 
      password: 'chiefop123', 
      name: 'Ir. Hadi Pranoto', 
      roleName: 'Chief Operation SERA', 
      email: 'hadi.pranoto@eproposal.com', 
      phone: '+62 812-5001-0002', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '25', 
      username: 'co.maco', 
      password: 'chiefop123', 
      name: 'Ir. Rudi Hermawan', 
      roleName: 'Chief Operation MACO', 
      email: 'rudi.hermawan@eproposal.com', 
      phone: '+62 812-5001-0003', 
      lastPasswordChange: '2025-11-07' 
    },

    // Sourcing Team - Planner (HO Only)
    { 
      userID: '28', 
      username: 'planner', 
      password: 'planner123', 
      name: 'Andi Saputra', 
      roleName: 'Planner', 
      jobsite: 'HO',
      department: 'Procurement',
      email: 'andi.saputra@eproposal.com', 
      phone: '+62 812-6001-0003', 
      lastPasswordChange: '2025-11-07' 
    },

    // Sourcing Team - Buyers by Jobsite
    // Buyer JAHO
    { 
      userID: '26', 
      username: 'buyer.jaho', 
      password: 'buyer123', 
      name: 'Tommy Wijaya', 
      roleName: 'Buyer', 
      jobsite: 'JAHO',
      department: 'Procurement',
      email: 'tommy.wijaya@eproposal.com', 
      phone: '+62 812-6001-0001', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Buyer SERA
    { 
      userID: '31', 
      username: 'buyer.sera', 
      password: 'buyer123', 
      name: 'Dedi Kurniawan', 
      roleName: 'Buyer', 
      jobsite: 'SERA',
      department: 'Procurement',
      email: 'dedi.kurniawan@eproposal.com', 
      phone: '+62 812-6001-0006', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Buyer ADMO MINING
    { 
      userID: '32', 
      username: 'buyer.admo.mining', 
      password: 'buyer123', 
      name: 'Sari Wulandari', 
      roleName: 'Buyer', 
      jobsite: 'ADMO MINING',
      department: 'Procurement',
      email: 'sari.wulandari@eproposal.com', 
      phone: '+62 812-6001-0007', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Buyer ADMO HAULING
    { 
      userID: '33', 
      username: 'buyer.admo.hauling', 
      password: 'buyer123', 
      name: 'Fandi Pratama', 
      roleName: 'Buyer', 
      jobsite: 'ADMO HAULING',
      department: 'Procurement',
      email: 'fandi.pratama@eproposal.com', 
      phone: '+62 812-6001-0008', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Buyer NARO
    { 
      userID: '34', 
      username: 'buyer.naro', 
      password: 'buyer123', 
      name: 'Rina Melati', 
      roleName: 'Buyer', 
      jobsite: 'NARO',
      department: 'Procurement',
      email: 'rina.melati@eproposal.com', 
      phone: '+62 812-6001-0009', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Buyer MACO MINING
    { 
      userID: '35', 
      username: 'buyer.maco.mining', 
      password: 'buyer123', 
      name: 'Bambang Sutejo', 
      roleName: 'Buyer', 
      jobsite: 'MACO MINING',
      department: 'Procurement',
      email: 'bambang.sutejo@eproposal.com', 
      phone: '+62 812-6001-0010', 
      lastPasswordChange: '2025-11-07' 
    },
    
    // Buyer MACO HAULING
    { 
      userID: '36', 
      username: 'buyer.maco.hauling', 
      password: 'buyer123', 
      name: 'Hendra Wijaya', 
      roleName: 'Buyer', 
      jobsite: 'MACO HAULING',
      department: 'Procurement',
      email: 'hendra.wijaya@eproposal.com', 
      phone: '+62 812-6001-0011', 
      lastPasswordChange: '2025-11-07' 
    },

    // Sourcing Team - Sourcing (JAHO Only)
    { 
      userID: '27', 
      username: 'sourcing.jaho', 
      password: 'sourcing123', 
      name: 'Emma Kusuma', 
      roleName: 'Sourcing', 
      jobsite: 'JAHO',
      department: 'Procurement',
      email: 'emma.kusuma@eproposal.com', 
      phone: '+62 812-6001-0002', 
      lastPasswordChange: '2025-11-07' 
    },

    // Sourcing Management
    { 
      userID: '29', 
      username: 'sourcing.depthead', 
      password: 'sourcingdh123', 
      name: 'Rini Susilowati', 
      roleName: 'Sourcing Department Head', 
      jobsite: 'JAHO',
      department: 'Procurement',
      email: 'rini.susilowati@eproposal.com', 
      phone: '+62 812-6001-0004', 
      lastPasswordChange: '2025-11-07' 
    },
    { 
      userID: '30', 
      username: 'procurement.divhead', 
      password: 'procdiv123', 
      name: 'Hendra Gunawan', 
      roleName: 'Procurement Division Head', 
      email: 'hendra.gunawan@eproposal.com', 
      phone: '+62 812-6001-0005', 
      lastPasswordChange: '2025-11-07' 
    },
  ];

// Mock proposals - Complete Workflow Demo from Draft to Approved
export const mockProposals: Proposal[] = [
  // DEMO 1: Draft - Created by creator.plant.jaho
  {
    id: 'demo-1',
    proposalNo: 'PRO-2025-DEMO-001',
    title: 'DEMO: Excavator Spare Parts Procurement',
    description: 'Procurement of critical spare parts for Excavator CAT 390D including hydraulic cylinders, filters, and seals for preventive maintenance.',
    category: 'Goods',
    classification: 'Spare Parts',
    subClassification: 'Heavy Equipment',
    tor: 'Supply of genuine CAT spare parts for Excavator 390D with 6-month warranty and technical support',
    ter: 'Original manufacturer parts, ISO certified, delivery within 30 days',
    vendorList: ['PT Trakindo Utama', 'PT United Tractors', 'PT Hexindo Adiperkasa'],
    jobsite: 'JAHO',
    department: 'Plant',
    workLocation: 'Main Workshop Area',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    createdDate: new Date('2025-11-07T08:00:00').toISOString(),
    amount: 450000000,
    contractType: 'Single Vendor',
    contractualSubType: 'Sole Agency',
    status: 'Draft',
    history: [
      {
        date: new Date('2025-11-07T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Initial draft created for excavator spare parts',
        role: 'Creator Plant Department JAHO'
      }
    ]
  },

  // DEMO 2: Pending Unit Head Approval
  {
    id: 'demo-2',
    proposalNo: 'PRO-2025-DEMO-002',
    title: 'DEMO: IT Server Hardware Upgrade',
    description: 'Server hardware upgrade for data center including Dell PowerEdge R750 servers, storage arrays, and network switches to support growing data requirements.',
    category: 'Goods',
    classification: 'IT Equipment',
    subClassification: 'Server',
    tor: 'Supply and installation of enterprise-grade servers with 3-year warranty and 24/7 support',
    ter: 'Dell PowerEdge R750, 128GB RAM, dual Xeon processors, RAID configuration',
    vendorList: ['PT Dell Indonesia', 'PT Datascrip', 'PT Metrodata Electronics'],
    jobsite: 'SERA',
    department: 'IT',
    workLocation: 'Data Center Building',
    creator: 'Rizki Ramadhan',
    creatorId: '8',
    createdDate: new Date('2025-11-06T09:00:00').toISOString(),
    amount: 850000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    status: 'On Unit Head Approval',
    history: [
      {
        date: new Date('2025-11-06T09:00:00').toISOString(),
        action: 'Created',
        by: 'Rizki Ramadhan',
        comments: 'Proposal created for IT infrastructure upgrade',
        role: 'Creator IT Department SERA'
      },
      {
        date: new Date('2025-11-06T10:30:00').toISOString(),
        action: 'Submitted',
        by: 'Rizki Ramadhan',
        comments: 'Submitted for approval - Urgent upgrade needed for Q1 2025',
        role: 'Creator IT Department SERA'
      }
    ]
  },

  // DEMO 3: Pending Section Head Approval
  {
    id: 'demo-3',
    proposalNo: 'PRO-2025-DEMO-003',
    title: 'DEMO: Office Furniture Procurement',
    description: 'Procurement of ergonomic office furniture for new office building including desks, chairs, cabinets, and meeting room furniture.',
    category: 'Goods',
    classification: 'Furniture',
    subClassification: 'Office Furniture',
    tor: 'Supply of high-quality office furniture with ergonomic certification and 2-year warranty',
    ter: 'Ergonomic design, ISO 9001 certified, delivery and installation within 45 days',
    vendorList: ['PT Indo Furniture', 'PT Kana Furniture', 'PT Fuji Furniture'],
    jobsite: 'JAHO',
    department: 'Finance',
    workLocation: 'Head Office Building',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    createdDate: new Date('2025-11-05T08:00:00').toISOString(),
    amount: 280000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    status: 'On Section Head Approval',
    history: [
      {
        date: new Date('2025-11-05T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Proposal created for office furniture',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-05T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-05T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head - Proceed to Section Head',
        role: 'Unit Head Plant Department JAHO'
      }
    ]
  },

  // DEMO 4: Pending Department Head Approval
  {
    id: 'demo-4',
    proposalNo: 'PRO-2025-DEMO-004',
    title: 'DEMO: Safety Equipment & PPE Annual Supply',
    description: 'Annual supply contract for personal protective equipment including helmets, safety shoes, gloves, and safety vests for all mining operations.',
    category: 'Goods',
    classification: 'Safety Equipment',
    subClassification: 'PPE',
    tor: 'Supply of SNI-certified safety equipment with regular stock replenishment',
    ter: 'SNI and international standard compliance, monthly delivery schedule',
    vendorList: ['PT Safety First Indonesia', 'PT Blue Eagle', 'PT MSA Indonesia'],
    jobsite: 'ADMO MINING',
    department: 'Logistic',
    workLocation: 'All Mining Sites',
    creator: 'Yudi Hartono',
    creatorId: '15',
    createdDate: new Date('2025-11-04T08:00:00').toISOString(),
    amount: 650000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    status: 'On Department Head Approval',
    history: [
      {
        date: new Date('2025-11-04T08:00:00').toISOString(),
        action: 'Created',
        by: 'Yudi Hartono',
        comments: 'Annual PPE supply proposal',
        role: 'Creator Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-11-04T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Yudi Hartono',
        comments: 'Submitted for approval',
        role: 'Creator Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-11-04T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Unit Head Logistic (Auto)',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-11-04T15:00:00').toISOString(),
        action: 'Approved',
        by: 'Section Head Logistic (Auto)',
        comments: 'Approved by Section Head - Safety is priority',
        role: 'Section Head Logistic Department ADMO MINING'
      }
    ]
  },

  // DEMO 5: Pending Manager Approval
  {
    id: 'demo-5',
    proposalNo: 'PRO-2025-DEMO-005',
    title: 'DEMO: Heavy Equipment Maintenance Contract',
    description: 'Annual maintenance contract for all heavy equipment including excavators, dump trucks, and bulldozers with 24/7 emergency support.',
    category: 'Services',
    classification: 'Maintenance',
    subClassification: 'Heavy Equipment',
    tor: 'Comprehensive maintenance services with OEM-certified technicians and genuine spare parts',
    ter: 'ISO 9001:2015 certified, 4-hour emergency response time, monthly preventive maintenance schedule',
    vendorList: ['PT Trakindo Service', 'PT United Service', 'PT Hexindo Service'],
    jobsite: 'JAHO',
    department: 'Plant',
    workLocation: 'All Plant Sites',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    createdDate: new Date('2025-11-03T08:00:00').toISOString(),
    amount: 1200000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    status: 'On Manager Approval',
    history: [
      {
        date: new Date('2025-11-03T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Annual maintenance contract proposal',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T15:30:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved by Department Head - Critical for operations',
        role: 'Department Head Plant Department JAHO'
      }
    ]
  },

  // DEMO 6: Pending Division Head Approval
  {
    id: 'demo-6',
    proposalNo: 'PRO-2025-DEMO-006',
    title: 'DEMO: Network Infrastructure Upgrade Project',
    description: 'Complete network infrastructure upgrade including core switches, access points, and fiber optic cabling for all sites.',
    category: 'Goods',
    classification: 'IT Equipment',
    subClassification: 'Network Equipment',
    tor: 'Supply and installation of enterprise network equipment with 5-year warranty and managed services',
    ter: 'Cisco Catalyst series, WiFi 6 access points, single-mode fiber optic, CAT6A cabling',
    vendorList: ['PT Cisco Indonesia', 'PT HP Enterprise', 'PT Huawei Indonesia'],
    jobsite: 'SERA',
    department: 'IT',
    workLocation: 'All Office Buildings',
    creator: 'Rizki Ramadhan',
    creatorId: '8',
    createdDate: new Date('2025-11-02T08:00:00').toISOString(),
    amount: 1500000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    status: 'On Division Head Approval',
    history: [
      {
        date: new Date('2025-11-02T08:00:00').toISOString(),
        action: 'Created',
        by: 'Rizki Ramadhan',
        comments: 'Network infrastructure upgrade proposal',
        role: 'Creator IT Department SERA'
      },
      {
        date: new Date('2025-11-02T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Rizki Ramadhan',
        comments: 'Submitted for approval',
        role: 'Creator IT Department SERA'
      },
      {
        date: new Date('2025-11-02T10:30:00').toISOString(),
        action: 'Approved',
        by: 'Maya Sari',
        comments: 'Approved by Unit Head',
        role: 'Unit Head IT Department SERA'
      },
      {
        date: new Date('2025-11-02T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Agus Setiawan',
        comments: 'Approved by Section Head',
        role: 'Section Head IT Department SERA'
      },
      {
        date: new Date('2025-11-02T14:30:00').toISOString(),
        action: 'Approved',
        by: 'Dian Pramudya',
        comments: 'Approved by Department Head',
        role: 'Department Head IT Department SERA'
      },
      {
        date: new Date('2025-11-02T16:00:00').toISOString(),
        action: 'Approved',
        by: 'Fitri Handayani',
        comments: 'Approved by Manager - Strategic infrastructure investment',
        role: 'Manager IT Department SERA'
      }
    ]
  },

  // DEMO 7: Pending Director Approval
  {
    id: 'demo-7',
    proposalNo: 'PRO-2025-DEMO-007',
    title: 'DEMO: Mining Equipment Fleet Expansion',
    description: 'Procurement of new mining equipment fleet including 5 units excavators CAT 390D and 10 units dump trucks Caterpillar 777G.',
    category: 'Goods',
    classification: 'Heavy Equipment',
    subClassification: 'Mining Equipment',
    tor: 'Supply of new mining equipment with full warranty, training, and after-sales support',
    ter: 'CAT 390D excavators, CAT 777G dump trucks, genuine parts, OEM certified',
    vendorList: ['PT Trakindo Utama', 'PT United Tractors'],
    jobsite: 'ADMO MINING',
    department: 'Plant',
    workLocation: 'Main Mining Pit',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    createdDate: new Date('2025-11-01T08:00:00').toISOString(),
    amount: 45000000000,
    contractType: 'Single Vendor',
    contractualSubType: 'Sole Distributor',
    status: 'On Director Approval',
    history: [
      {
        date: new Date('2025-11-01T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Fleet expansion proposal for increased production capacity',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval - Critical for production target 2025',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved by Department Head',
        role: 'Department Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T14:30:00').toISOString(),
        action: 'Approved',
        by: 'Eko Prasetyo',
        comments: 'Approved by Manager',
        role: 'Manager Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T16:00:00').toISOString(),
        action: 'Approved',
        by: 'Susanto Wibowo',
        comments: 'Approved by Division Head - Strategic investment',
        role: 'Plant Division Head'
      }
    ]
  },

  // DEMO 8: Pending President Director Approval
  {
    id: 'demo-8',
    proposalNo: 'PRO-2025-DEMO-008',
    title: 'DEMO: New Mining Site Development Project',
    description: 'Complete development of new mining site including infrastructure, equipment, and support facilities for 10-year operation.',
    category: 'Services',
    classification: 'Construction',
    subClassification: 'Site Development',
    tor: 'Complete site development with infrastructure, equipment procurement, and commissioning',
    ter: 'EPC contractor with mining experience, ISO certified, proven track record',
    vendorList: ['PT Thiess Indonesia', 'PT Pamapersada Nusantara', 'PT Cipta Kridatama'],
    jobsite: 'NARO',
    department: 'Plant',
    workLocation: 'New Mining Concession Area',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    createdDate: new Date('2025-10-30T08:00:00').toISOString(),
    amount: 150000000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    status: 'On President Director Approval',
    history: [
      {
        date: new Date('2025-10-30T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'New mining site development proposal',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-10-30T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval - Strategic expansion project',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-10-30T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-10-30T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-10-30T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved by Department Head',
        role: 'Department Head Plant Department JAHO'
      },
      {
        date: new Date('2025-10-30T14:30:00').toISOString(),
        action: 'Approved',
        by: 'Eko Prasetyo',
        comments: 'Approved by Manager',
        role: 'Manager Plant Department JAHO'
      },
      {
        date: new Date('2025-10-30T15:30:00').toISOString(),
        action: 'Approved',
        by: 'Susanto Wibowo',
        comments: 'Approved by Division Head',
        role: 'Plant Division Head'
      },
      {
        date: new Date('2025-10-31T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Ir. Bambang Suryanto',
        comments: 'Approved by Director - Major strategic initiative',
        role: 'Plant Director'
      }
    ]
  },

  // DEMO 9: Fully Approved
  {
    id: 'demo-9',
    proposalNo: 'PRO-2025-DEMO-009',
    title: 'DEMO: Company Vehicles Procurement',
    description: 'Procurement of company vehicles for executive and operational use including 10 units Toyota Fortuner and 20 units Toyota Avanza.',
    category: 'Goods',
    classification: 'Vehicles',
    subClassification: 'Company Vehicles',
    tor: 'Supply of new vehicles with 3-year warranty and free service',
    ter: 'Toyota Fortuner VRZ 2025, Toyota Avanza Veloz 2025, complete accessories',
    vendorList: ['PT Toyota Astra Motor', 'PT Auto 2000'],
    jobsite: 'JAHO',
    department: 'Logistic',
    workLocation: 'Jakarta Office',
    creator: 'Yudi Hartono',
    creatorId: '15',
    createdDate: new Date('2025-10-25T08:00:00').toISOString(),
    amount: 8500000000,
    contractType: 'Single Vendor',
    contractualSubType: 'Sole Agency',
    status: 'Approved',
    history: [
      {
        date: new Date('2025-10-25T08:00:00').toISOString(),
        action: 'Created',
        by: 'Yudi Hartono',
        comments: 'Company vehicles procurement proposal',
        role: 'Creator Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-10-25T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Yudi Hartono',
        comments: 'Submitted for approval',
        role: 'Creator Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-10-25T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Unit Head Logistic (Auto)',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-10-25T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Section Head Logistic (Auto)',
        comments: 'Approved by Section Head',
        role: 'Section Head Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-10-25T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Department Head Logistic (Auto)',
        comments: 'Approved by Department Head',
        role: 'Department Head Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-10-25T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Ratna Sari',
        comments: 'Approved by Manager',
        role: 'Manager Logistic Department ADMO MINING'
      },
      {
        date: new Date('2025-10-25T15:00:00').toISOString(),
        action: 'Approved',
        by: 'Hari Santoso',
        comments: 'Approved by Division Head',
        role: 'Logistic Division Head'
      },
      {
        date: new Date('2025-10-26T09:00:00').toISOString(),
        action: 'Approved',
        by: 'Director Logistic (Auto)',
        comments: 'Approved by Director',
        role: 'Logistic Director'
      },
      {
        date: new Date('2025-10-26T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Santoso',
        comments: 'Approved by President Director - Final Approval',
        role: 'President Director'
      }
    ]
  },

  // DEMO 10: Rejected Example
  {
    id: 'demo-10',
    proposalNo: 'PRO-2025-DEMO-010',
    title: 'DEMO: Luxury Office Renovation (REJECTED)',
    description: 'Renovation of executive office with imported furniture and premium finishes.',
    category: 'Services',
    classification: 'Construction',
    subClassification: 'Renovation',
    tor: 'Complete office renovation with premium materials',
    ter: 'Imported furniture, marble flooring, designer lighting',
    vendorList: ['PT Luxury Interior', 'PT Premium Design'],
    jobsite: 'Head Office',
    department: 'Finance',
    workLocation: 'Executive Floor',
    creator: 'Linda Wijaya',
    creatorId: '13',
    createdDate: new Date('2025-10-20T08:00:00').toISOString(),
    amount: 2500000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    status: 'Rejected',
    history: [
      {
        date: new Date('2025-10-20T08:00:00').toISOString(),
        action: 'Created',
        by: 'Linda Wijaya',
        comments: 'Office renovation proposal',
        role: 'Creator Finance Department MACO HAULING'
      },
      {
        date: new Date('2025-10-20T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Linda Wijaya',
        comments: 'Submitted for approval',
        role: 'Creator Finance Department MACO HAULING'
      },
      {
        date: new Date('2025-10-20T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Unit Head Finance (Auto)',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Finance Department MACO HAULING'
      },
      {
        date: new Date('2025-10-20T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Section Head Finance (Auto)',
        comments: 'Approved by Section Head',
        role: 'Section Head Finance Department MACO HAULING'
      },
      {
        date: new Date('2025-10-20T13:00:00').toISOString(),
        action: 'Rejected',
        by: 'Hendra Kusuma',
        comments: 'REJECTED: Budget too high for non-essential renovation. Please revise with more cost-effective alternatives.',
        role: 'Department Head Finance Department MACO HAULING'
      }
    ]
  },

  // DEMO 11: Creator Jobsite Routing Demo - Creator from JAHO, Procurement for ADMO MINING
  // This demonstrates that approval follows JAHO matrix, not ADMO MINING matrix
  {
    id: 'demo-11',
    proposalNo: 'PRO-2025-DEMO-011',
    title: 'DEMO: Equipment Procurement for ADMO MINING (Creator: JAHO)',
    description: 'Procurement of heavy equipment spare parts for ADMO MINING site operations. Created by JAHO staff, approval routing follows JAHO matrix.',
    category: 'Goods',
    classification: 'Spare Parts',
    subClassification: 'Heavy Equipment',
    tor: 'Supply of genuine spare parts for heavy equipment at ADMO MINING with warranty and technical support',
    ter: 'Original manufacturer parts, ISO certified, delivery within 30 days to ADMO MINING site',
    vendorList: ['PT Trakindo Utama', 'PT United Tractors'],
    jobsite: 'ADMO MINING', // Procurement jobsite
    department: 'Plant',
    workLocation: 'ADMO MINING Workshop Area',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    creatorJobsite: 'JAHO', // Creator's jobsite - approval follows THIS
    creatorDepartment: 'Plant',
    createdDate: new Date('2025-11-08T08:00:00').toISOString(),
    amount: 125000000,
    contractType: 'Single Vendor',
    contractualSubType: 'Sole Agency',
    status: 'On Section Head Approval', // Following JAHO matrix
    history: [
      {
        date: new Date('2025-11-08T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Equipment procurement for ADMO MINING created by JAHO staff',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-08T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval - Note: Approval follows JAHO matrix',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-08T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head (JAHO)',
        role: 'Unit Head Plant Department JAHO'
      }
    ]
  },

  // DEMO 12: Another Creator Jobsite Routing Demo - Creator from SERA, Procurement for MACO MINING
  {
    id: 'demo-12',
    proposalNo: 'PRO-2025-DEMO-012',
    title: 'DEMO: IT Infrastructure for MACO MINING (Creator: SERA)',
    description: 'IT network infrastructure upgrade for MACO MINING site. Created by SERA IT staff, approval routing follows SERA matrix.',
    category: 'Goods',
    classification: 'IT Equipment',
    subClassification: 'Network Equipment',
    tor: 'Supply and installation of network equipment for MACO MINING site with warranty and support',
    ter: 'Enterprise-grade network switches, WiFi access points, cabling system',
    vendorList: ['PT Cisco Indonesia', 'PT HP Enterprise'],
    jobsite: 'MACO MINING', // Procurement jobsite
    department: 'IT',
    workLocation: 'MACO MINING Office Building',
    creator: 'Rizki Ramadhan',
    creatorId: '8',
    creatorJobsite: 'SERA', // Creator's jobsite - approval follows THIS
    creatorDepartment: 'IT',
    createdDate: new Date('2025-11-08T09:00:00').toISOString(),
    amount: 450000000,
    contractType: 'Tender',
    contractualSubType: 'Limited Tender',
    status: 'On Unit Head Approval', // Following SERA matrix
    history: [
      {
        date: new Date('2025-11-08T09:00:00').toISOString(),
        action: 'Created',
        by: 'Rizki Ramadhan',
        comments: 'IT infrastructure for MACO MINING created by SERA IT staff',
        role: 'Creator IT Department SERA'
      },
      {
        date: new Date('2025-11-08T09:30:00').toISOString(),
        action: 'Submitted',
        by: 'Rizki Ramadhan',
        comments: 'Submitted for approval - Note: Approval follows SERA matrix, not MACO',
        role: 'Creator IT Department SERA'
      }
    ]
  },

  // APPROVED PROPOSALS - For Planner & Buyer Sourcing Documents
  // Test 1: Approved Proposal from SERA IT Department
  {
    id: 'approved-1',
    proposalNo: 'PRO-2025-APP-001',
    title: 'Test 1: Enterprise Backup Solution',
    description: 'Procurement of enterprise-grade backup and disaster recovery solution for all IT infrastructure including hardware, software licenses, and implementation services.',
    category: 'Goods',
    classification: 'IT Equipment',
    subClassification: 'Storage',
    tor: 'Supply and installation of enterprise backup solution with 5-year warranty, includes hardware (backup servers, storage arrays), software licenses, and professional services for implementation and training.',
    ter: 'Dell EMC PowerProtect DD series or equivalent, minimum 100TB capacity, deduplication ratio 20:1, replication capability, certified by vendor for 24/7 support.',
    vendorList: ['PT Dell EMC Indonesia', 'PT IBM Indonesia', 'PT HP Enterprise'],
    jobsite: 'SERA',
    department: 'IT',
    workLocation: 'SERA Data Center',
    creator: 'Rizki Ramadhan',
    creatorId: '8',
    creatorJobsite: 'SERA',
    creatorDepartment: 'IT',
    createdDate: new Date('2025-10-15T08:00:00').toISOString(),
    amount: 2500000000,
    contractType: 'Tender',
    contractualSubType: 'Open Tender',
    contractPeriod: '12 months implementation + 60 months support',
    scopeOfWork: 'Complete enterprise backup solution including:\n- Backup server hardware (2 units for redundancy)\n- Storage arrays with deduplication\n- Backup software licenses for all servers\n- Implementation and configuration\n- User training (3 sessions)\n- Documentation and knowledge transfer',
    analysis: 'Current backup solution is aging (7 years old) and approaching end-of-life. New solution will:\n- Reduce backup window from 8 hours to 2 hours\n- Improve recovery time from 24 hours to 1 hour\n- Reduce storage costs by 60% through deduplication\n- Enable disaster recovery capability\n- Comply with ISO 27001 requirements',
    fundingBudget: true,
    fundingNonBudget: false,
    status: 'Approved',
    subClassifications: [
      { code: 'IT-STG-001', name: 'Enterprise Storage' },
      { code: 'IT-SW-002', name: 'Backup Software' }
    ],
    torItems: [
      {
        id: 'tor-1',
        label: 'Hardware Specifications',
        enabled: true,
        parameter: 'Backup Server & Storage',
        requirement: 'Dell EMC PowerProtect DD6400 or equivalent',
        description: 'Minimum 100TB usable capacity, 20:1 deduplication, dual controller, redundant power supply',
        remarks: 'Must include rack mounting kit and all necessary cables'
      },
      {
        id: 'tor-2',
        label: 'Software Licenses',
        enabled: true,
        parameter: 'Backup Software',
        requirement: 'Enterprise edition with unlimited capacity',
        description: 'Support for VMware, Windows, Linux, databases (Oracle, SQL Server, MySQL)',
        remarks: '5-year license included, renewal pricing to be discussed in year 4'
      },
      {
        id: 'tor-3',
        label: 'Implementation Services',
        enabled: true,
        parameter: 'Professional Services',
        requirement: 'Certified engineers with minimum 5 years experience',
        description: 'Site survey, installation, configuration, testing, training, documentation',
        remarks: 'Maximum 60 days implementation period'
      }
    ],
    terItems: [
      {
        id: 'ter-1',
        label: 'Technical Compliance',
        enabled: true,
        parameter: 'Certifications',
        requirement: 'ISO 9001, ISO 27001 certified vendor',
        description: 'Vendor must be authorized partner/distributor of proposed solution',
        remarks: 'Provide certification documents with proposal'
      },
      {
        id: 'ter-2',
        label: 'Warranty & Support',
        enabled: true,
        parameter: 'Support Level',
        requirement: '24/7 support with 4-hour response time',
        description: '5-year comprehensive warranty covering parts, labor, and software updates',
        remarks: 'Local support center in Jakarta required'
      }
    ],
    history: [
      {
        date: new Date('2025-10-15T08:00:00').toISOString(),
        action: 'Created',
        by: 'Rizki Ramadhan',
        comments: 'Enterprise backup solution proposal created',
        role: 'Creator IT Department SERA'
      },
      {
        date: new Date('2025-10-15T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Rizki Ramadhan',
        comments: 'Submitted for approval - Critical infrastructure upgrade',
        role: 'Creator IT Department SERA'
      },
      {
        date: new Date('2025-10-15T10:30:00').toISOString(),
        action: 'Approved',
        by: 'Maya Sari',
        comments: 'Approved by Unit Head - Essential for data protection',
        role: 'Unit Head IT Department SERA'
      },
      {
        date: new Date('2025-10-15T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Agus Setiawan',
        comments: 'Approved by Section Head - Aligns with IT roadmap',
        role: 'Section Head IT Department SERA'
      },
      {
        date: new Date('2025-10-15T14:30:00').toISOString(),
        action: 'Approved',
        by: 'Dian Pramudya',
        comments: 'Approved by Department Head - Budget confirmed',
        role: 'Department Head IT Department SERA'
      },
      {
        date: new Date('2025-10-15T16:00:00').toISOString(),
        action: 'Approved',
        by: 'Fitri Handayani',
        comments: 'Approved by Manager - Strategic investment',
        role: 'Manager IT Department SERA'
      },
      {
        date: new Date('2025-10-16T09:00:00').toISOString(),
        action: 'Approved',
        by: 'Andri Wijaya',
        comments: 'Approved by Division Head - Proceed with tender',
        role: 'IT Division Head'
      }
    ]
  },

  // Test 2: Approved Proposal from ADMO MINING Plant Department
  {
    id: 'approved-2',
    proposalNo: 'PRO-2025-APP-002',
    title: 'Test 2: Hydraulic Excavator Spare Parts Package',
    description: 'Annual supply contract for hydraulic excavator spare parts including hydraulic cylinders, seals, filters, hoses, and pumps for fleet maintenance.',
    category: 'Goods',
    classification: 'Spare Parts',
    subClassification: 'Heavy Equipment',
    tor: 'Supply of genuine OEM spare parts for Caterpillar and Komatsu excavators with warranty and regular stock replenishment schedule.',
    ter: 'Original manufacturer parts with serial numbers, ISO 9001 certified supplier, minimum 12-month warranty, delivery within 14 days for regular items and 30 days for special orders.',
    vendorList: ['PT Trakindo Utama', 'PT United Tractors', 'PT Hexindo Adiperkasa'],
    jobsite: 'ADMO MINING',
    department: 'Plant',
    workLocation: 'ADMO MINING Workshop',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    creatorJobsite: 'ADMO MINING',
    creatorDepartment: 'Plant',
    createdDate: new Date('2025-10-20T08:00:00').toISOString(),
    amount: 1850000000,
    contractType: 'Contractual',
    contractualSubType: 'Annual Supply Contract',
    contractPeriod: '12 months with option to extend',
    penalty: 'Delay penalty: 0.1% per day of order value, maximum 5% of total contract value',
    contractTermination: 'Either party may terminate with 30 days written notice. Early termination fee: 10% of remaining contract value.',
    scopeOfWork: 'Supply of excavator spare parts including:\n- Hydraulic cylinders (boom, arm, bucket)\n- Hydraulic seals and O-rings\n- Engine filters (oil, fuel, air)\n- Hydraulic hoses and fittings\n- Hydraulic pumps and motors\n- Undercarriage parts (track shoes, rollers)\n\nRegular monthly delivery schedule with emergency stock available.',
    analysis: 'Annual contract provides benefits:\n- Guaranteed parts availability reducing downtime\n- Fixed pricing protection against inflation\n- Priority delivery for emergency needs\n- Consolidated invoicing simplifies procurement\n- Volume discount estimated 15-20%\n- Improved cash flow planning',
    fundingBudget: true,
    fundingNonBudget: false,
    status: 'Approved',
    subClassifications: [
      { code: 'SP-HE-001', name: 'Excavator Parts' },
      { code: 'SP-HYD-002', name: 'Hydraulic Components' }
    ],
    history: [
      {
        date: new Date('2025-10-20T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Annual spare parts contract proposal',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-10-20T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-10-20T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Unit Head Plant (Auto)',
        comments: 'Approved - Critical for maintenance',
        role: 'Unit Head Plant Department ADMO MINING'
      },
      {
        date: new Date('2025-10-20T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Section Head Plant (Auto)',
        comments: 'Approved - Reduces equipment downtime',
        role: 'Section Head Plant Department ADMO MINING'
      },
      {
        date: new Date('2025-10-20T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Department Head Plant (Auto)',
        comments: 'Approved by Department Head',
        role: 'Department Head Plant Department ADMO MINING'
      },
      {
        date: new Date('2025-10-20T14:30:00').toISOString(),
        action: 'Approved',
        by: 'Manager Plant (Auto)',
        comments: 'Approved by Manager',
        role: 'Manager Plant Department ADMO MINING'
      },
      {
        date: new Date('2025-10-21T09:00:00').toISOString(),
        action: 'Approved',
        by: 'Susanto Wibowo',
        comments: 'Approved by Division Head - Final approval',
        role: 'Plant Division Head'
      }
    ]
  },

  // Test 3: Approved Proposal from JAHO Plant Department
  {
    id: 'approved-3',
    proposalNo: 'PRO-2025-APP-003',
    title: 'Test 3: Safety Equipment & PPE Annual Supply',
    description: 'Annual supply contract for comprehensive safety equipment and personal protective equipment for all mining operations including helmets, safety shoes, gloves, vests, and emergency equipment.',
    category: 'Goods',
    classification: 'Safety Equipment',
    subClassification: 'PPE',
    tor: 'Supply of SNI and international standard certified safety equipment with monthly delivery schedule and emergency stock availability.',
    ter: 'All items must have SNI certification or equivalent international standards (ANSI, EN, AS/NZS). Supplier must be certified safety equipment distributor with local warehouse and 24-hour emergency delivery capability.',
    vendorList: ['PT Safety First Indonesia', 'PT Blue Eagle', 'PT MSA Indonesia'],
    jobsite: 'JAHO',
    department: 'Plant',
    workLocation: 'All JAHO Mining Sites',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    creatorJobsite: 'JAHO',
    creatorDepartment: 'Plant',
    createdDate: new Date('2025-10-18T08:00:00').toISOString(),
    amount: 950000000,
    contractType: 'Contractual',
    contractualSubType: 'Annual Supply Contract',
    contractPeriod: '12 months',
    scopeOfWork: 'Monthly supply of PPE and safety equipment:\n- Safety helmets (200 units/month)\n- Safety shoes (300 pairs/month)\n- Work gloves (500 pairs/month)\n- Safety vests (250 units/month)\n- Safety glasses (300 units/month)\n- Ear plugs (1000 pairs/month)\n- Dust masks (500 units/month)\n- Emergency medical kits (50 kits/month)',
    analysis: 'Benefits of annual contract:\n- Ensure continuous availability of safety equipment\n- Compliance with mining safety regulations\n- Volume pricing saves approximately 20%\n- Standardization of safety equipment across sites\n- Simplified procurement and inventory management\n- Emergency stock always available',
    fundingBudget: true,
    fundingNonBudget: false,
    status: 'Approved',
    history: [
      {
        date: new Date('2025-10-18T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Annual PPE supply proposal',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-10-18T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-10-18T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head - Safety priority',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-10-18T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-10-18T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved by Department Head',
        role: 'Department Head Plant Department JAHO'
      },
      {
        date: new Date('2025-10-18T14:30:00').toISOString(),
        action: 'Approved',
        by: 'Eko Prasetyo',
        comments: 'Approved by Manager - Essential for operations',
        role: 'Manager Plant Department JAHO'
      },
      {
        date: new Date('2025-10-19T09:00:00').toISOString(),
        action: 'Approved',
        by: 'Susanto Wibowo',
        comments: 'Approved by Division Head - Final approval',
        role: 'Plant Division Head'
      }
    ]
  },

  // Test 4: Approved Proposal from MACO HAULING Finance Department
  {
    id: 'approved-4',
    proposalNo: 'PRO-2025-APP-004',
    title: 'Test 4: Financial Software Licensing & Support',
    description: 'Renewal of enterprise financial software licenses including ERP, accounting, budgeting, and reporting modules with annual support and maintenance.',
    category: 'Services',
    classification: 'IT Services',
    subClassification: 'Software Licensing',
    tor: 'Renewal of SAP S/4HANA licenses for 150 users including Finance, Controlling, Treasury modules with 24/7 support and quarterly updates.',
    ter: 'Official SAP license from authorized distributor, includes user training, system updates, and dedicated support engineer.',
    vendorList: ['PT SAP Indonesia', 'PT Soltius Indonesia', 'PT NCS Indonesia'],
    jobsite: 'MACO HAULING',
    department: 'Finance',
    workLocation: 'Finance Office',
    creator: 'Linda Wijaya',
    creatorId: '13',
    creatorJobsite: 'MACO HAULING',
    creatorDepartment: 'Finance',
    createdDate: new Date('2025-10-22T08:00:00').toISOString(),
    amount: 1250000000,
    contractType: 'Contractual',
    contractualSubType: 'Software Maintenance',
    contractPeriod: '12 months',
    scopeOfWork: 'Annual software licensing and support:\n- SAP S/4HANA user licenses (150 users)\n- Finance & Controlling modules\n- Treasury management module\n- Quarterly system updates\n- Monthly health checks\n- 24/7 helpdesk support\n- User training (2 sessions)',
    analysis: 'Annual renewal ensures:\n- Continuous system availability\n- Access to latest features and security patches\n- Compliance with software licensing\n- Technical support for critical issues\n- Knowledge transfer through training\n- System performance optimization',
    fundingBudget: true,
    fundingNonBudget: false,
    status: 'Approved',
    history: [
      {
        date: new Date('2025-10-22T08:00:00').toISOString(),
        action: 'Created',
        by: 'Linda Wijaya',
        comments: 'SAP license renewal proposal',
        role: 'Creator Finance Department MACO HAULING'
      },
      {
        date: new Date('2025-10-22T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Linda Wijaya',
        comments: 'Submitted for approval',
        role: 'Creator Finance Department MACO HAULING'
      },
      {
        date: new Date('2025-10-22T10:30:00').toISOString(),
        action: 'Approved',
        by: 'Hendra Kusuma',
        comments: 'Approved by Department Head - Critical for finance operations',
        role: 'Department Head Finance Department MACO HAULING'
      },
      {
        date: new Date('2025-10-22T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Diana Kusuma',
        comments: 'Approved by Division Head - Final approval',
        role: 'Finance Division Head'
      }
    ]
  }
];

// Monthly trend data
export const monthlyTrendData = [
  { month: 'Nov 24', count: 12 },
  { month: 'Dec 24', count: 15 },
  { month: 'Jan 25', count: 18 },
  { month: 'Feb 25', count: 22 },
  { month: 'Mar 25', count: 0 },
  { month: 'Apr 25', count: 0 },
  { month: 'May 25', count: 0 },
  { month: 'Jun 25', count: 0 },
  { month: 'Jul 25', count: 0 },
  { month: 'Aug 25', count: 0 },
  { month: 'Sep 25', count: 0 },
  { month: 'Oct 25', count: 0 },
];

// Vendor Recommendations (formerly Vendor Requests)
export const mockVendorRecommendations: VendorRecommendation[] = [
  // Demo 1: Pending - Just submitted
  {
    id: 'VR-001',
    proposalId: 'demo-9',
    proposalNo: 'PRO-2025-DEMO-009',
    proposalTitle: 'Company Vehicles Procurement',
    requestedBy: '26',
    requestedByName: 'Tommy Wijaya',
    requestedByRole: 'Buyer',
    requestDate: '2025-11-08T10:30:00',
    status: 'Pending',
    category: 'Goods',
    classification: 'Vehicles',
    subClassification: 'Company Vehicles',
    estimatedCost: 8500000000,
    jobsite: 'JAHO',
    department: 'Logistic',
    reason: 'Need additional vendors for better pricing comparison. Current system-recommended vendors only 2, need at least 3 vendors for proper tender process.',
  },
  
  // Demo 2: In Progress - Sourcing is working on it
  {
    id: 'VR-002',
    proposalId: 'demo-8',
    proposalNo: 'PRO-2025-DEMO-008',
    proposalTitle: 'Crusher Plant Machinery Procurement',
    requestedBy: '28',
    requestedByName: 'Andi Saputra',
    requestedByRole: 'Planner',
    requestDate: '2025-11-07T14:15:00',
    status: 'In Progress',
    category: 'Goods',
    classification: 'Heavy Equipment',
    subClassification: 'Crusher',
    estimatedCost: 15000000000,
    jobsite: 'JAHO',
    department: 'Plant',
    reason: 'Specialized equipment requires more vendor options. Need vendors with proven track record in mining industry.',
    assignedTo: '27',
    assignedToName: 'Emma Kusuma',
    startedDate: '2025-11-07T15:00:00',
    sourcingNotes: 'Contacted 2 potential vendors - PT Heavy Equipment Indonesia and PT Mining Solutions. Waiting for response.',
  },
  
  // Demo 3: Waiting Dept Head Approval
  {
    id: 'VR-003',
    proposalId: 'demo-2',
    proposalNo: 'PRO-2025-DEMO-002',
    proposalTitle: 'IT Server Hardware Upgrade',
    requestedBy: '26',
    requestedByName: 'Tommy Wijaya',
    requestedByRole: 'Buyer',
    requestDate: '2025-11-06T09:45:00',
    status: 'Waiting Dept Head Approval',
    category: 'Goods',
    classification: 'IT Equipment',
    subClassification: 'Server',
    estimatedCost: 850000000,
    jobsite: 'SERA',
    department: 'IT',
    reason: 'Need certified Dell partners with local support capabilities.',
    assignedTo: '27',
    assignedToName: 'Emma Kusuma',
    startedDate: '2025-11-06T10:00:00',
    addedVendors: ['PT Dell Teknologi Indonesia', 'PT Solusi Server Prima', 'PT Komputer Sejahtera'],
    sourcingNotes: 'Added 3 new certified Dell partners with local support. All vendors verified for certifications and track record.',
    submittedForApprovalDate: '2025-11-07T16:00:00',
  },
  
  // Demo 4: Waiting Division Head Approval (Dept Head already approved)
  {
    id: 'VR-004',
    proposalId: 'demo-3',
    proposalNo: 'PRO-2025-DEMO-003',
    proposalTitle: 'Office Furniture Procurement',
    requestedBy: '28',
    requestedByName: 'Andi Saputra',
    requestedByRole: 'Planner',
    requestDate: '2025-11-05T11:00:00',
    status: 'Waiting Division Head Approval',
    category: 'Goods',
    classification: 'Furniture',
    subClassification: 'Office Furniture',
    estimatedCost: 450000000,
    jobsite: 'JAHO',
    department: 'Finance',
    reason: 'Need more competitive pricing from ergonomic furniture specialists.',
    assignedTo: '27',
    assignedToName: 'Emma Kusuma',
    startedDate: '2025-11-05T13:00:00',
    addedVendors: ['PT Ergo Furniture Solutions', 'PT Modern Office Indonesia'],
    sourcingNotes: 'Added 2 specialized ergonomic furniture vendors with ISO certification.',
    submittedForApprovalDate: '2025-11-06T10:00:00',
    deptHeadApprovedBy: '29',
    deptHeadApprovedByName: 'Rini Susilowati',
    deptHeadApprovedDate: '2025-11-07T09:00:00',
    deptHeadComments: 'Vendors are qualified and meet requirements. Approved.',
  },
  
  // Demo 5: Under Planner Review
  {
    id: 'VR-005',
    proposalId: 'demo-4',
    proposalNo: 'PRO-2025-DEMO-004',
    proposalTitle: 'Safety Equipment Procurement',
    requestedBy: '28',
    requestedByName: 'Andi Saputra',
    requestedByRole: 'Planner',
    requestDate: '2025-11-04T08:00:00',
    status: 'Under Planner Review',
    category: 'Goods',
    classification: 'Safety Equipment',
    subClassification: 'PPE',
    estimatedCost: 350000000,
    jobsite: 'ADMO MINING',
    department: 'SHE',
    reason: 'Need vendors specializing in mining-grade safety equipment.',
    assignedTo: '27',
    assignedToName: 'Emma Kusuma',
    startedDate: '2025-11-04T09:00:00',
    addedVendors: ['PT Safety First Indonesia', 'PT Proteksi Mandiri', 'PT Guardian Safety'],
    sourcingNotes: 'Added 3 vendors specializing in mining-grade PPE with full certifications.',
    submittedForApprovalDate: '2025-11-05T14:00:00',
    deptHeadApprovedBy: '29',
    deptHeadApprovedByName: 'Rini Susilowati',
    deptHeadApprovedDate: '2025-11-06T10:00:00',
    deptHeadComments: 'All vendors meet safety standards. Approved.',
    divHeadApprovedBy: '30',
    divHeadApprovedByName: 'Hendra Gunawan',
    divHeadApprovedDate: '2025-11-07T11:00:00',
    divHeadComments: 'Vendor list approved. Please proceed with Planner review.',
  },
  
  // Demo 6: Under Buyer Review (Planner already approved)
  {
    id: 'VR-006',
    proposalId: 'demo-5',
    proposalNo: 'PRO-2025-DEMO-005',
    proposalTitle: 'Lubricants and Oil Procurement',
    requestedBy: '26',
    requestedByName: 'Tommy Wijaya',
    requestedByRole: 'Buyer',
    requestDate: '2025-11-03T10:00:00',
    status: 'Under Buyer Review',
    category: 'Goods',
    classification: 'Consumables',
    subClassification: 'Lubricants',
    estimatedCost: 280000000,
    jobsite: 'MACO MINING',
    department: 'Production',
    reason: 'Need authorized distributors for premium lubricant brands.',
    assignedTo: '27',
    assignedToName: 'Emma Kusuma',
    startedDate: '2025-11-03T11:00:00',
    addedVendors: ['PT Shell Indonesia', 'PT Pertamina Lubricants', 'PT Castrol Indonesia'],
    sourcingNotes: 'Added authorized distributors for Shell, Pertamina, and Castrol premium lubricants.',
    submittedForApprovalDate: '2025-11-04T15:00:00',
    deptHeadApprovedBy: '29',
    deptHeadApprovedByName: 'Rini Susilowati',
    deptHeadApprovedDate: '2025-11-05T09:00:00',
    deptHeadComments: 'Authorized distributors verified. Approved.',
    divHeadApprovedBy: '30',
    divHeadApprovedByName: 'Hendra Gunawan',
    divHeadApprovedDate: '2025-11-06T10:00:00',
    divHeadComments: 'Approved for Planner/Buyer review.',
    plannerReviewedBy: '28',
    plannerReviewedByName: 'Andi Saputra',
    plannerReviewDate: '2025-11-07T14:00:00',
    plannerDecision: 'Approved',
    plannerComments: 'Vendors meet all requirements. Approved.',
  },
  
  // Demo 7: Revision Required (Rejected by Planner)
  {
    id: 'VR-007',
    proposalId: 'demo-6',
    proposalNo: 'PRO-2025-DEMO-006',
    proposalTitle: 'Construction Materials Procurement',
    requestedBy: '28',
    requestedByName: 'Andi Saputra',
    requestedByRole: 'Planner',
    requestDate: '2025-11-02T09:00:00',
    status: 'Revision Required',
    category: 'Goods',
    classification: 'Construction Materials',
    subClassification: 'Cement',
    estimatedCost: 620000000,
    jobsite: 'SERA',
    department: 'Engineering',
    reason: 'Need bulk cement suppliers with delivery capability to remote sites.',
    assignedTo: '27',
    assignedToName: 'Emma Kusuma',
    startedDate: '2025-11-02T10:00:00',
    addedVendors: ['PT Semen Indonesia', 'PT Holcim Indonesia'],
    sourcingNotes: 'Added 2 major cement manufacturers with national distribution.',
    submittedForApprovalDate: '2025-11-03T16:00:00',
    deptHeadApprovedBy: '29',
    deptHeadApprovedByName: 'Rini Susilowati',
    deptHeadApprovedDate: '2025-11-04T09:00:00',
    deptHeadComments: 'Approved.',
    divHeadApprovedBy: '30',
    divHeadApprovedByName: 'Hendra Gunawan',
    divHeadApprovedDate: '2025-11-05T10:00:00',
    divHeadComments: 'Approved.',
    plannerReviewedBy: '28',
    plannerReviewedByName: 'Andi Saputra',
    plannerReviewDate: '2025-11-06T11:00:00',
    plannerDecision: 'Rejected',
    plannerComments: 'Need local distributors who can deliver to remote SERA site. Major manufacturers may not have direct delivery to our location.',
    revisionCount: 1,
    revisionHistory: [
      {
        revisionNumber: 1,
        requestedBy: '28',
        requestedByName: 'Andi Saputra',
        requestedDate: '2025-11-06T11:00:00',
        reason: 'Need local distributors who can deliver to remote SERA site.',
      },
    ],
  },
  
  // Demo 8: Completed (Both approved)
  {
    id: 'VR-008',
    proposalId: 'demo-7',
    proposalNo: 'PRO-2025-DEMO-007',
    proposalTitle: 'Electrical Components Procurement',
    requestedBy: '26',
    requestedByName: 'Tommy Wijaya',
    requestedByRole: 'Buyer',
    requestDate: '2025-11-01T08:00:00',
    status: 'Completed',
    category: 'Goods',
    classification: 'Electrical Components',
    subClassification: 'Cables',
    estimatedCost: 180000000,
    jobsite: 'NARO',
    department: 'Engineering',
    reason: 'Need certified electrical cable suppliers.',
    assignedTo: '27',
    assignedToName: 'Emma Kusuma',
    startedDate: '2025-11-01T09:00:00',
    addedVendors: ['PT Kabel Indonesia', 'PT Supreme Cable', 'PT Voksel Electric'],
    sourcingNotes: 'Added 3 certified electrical cable manufacturers with SNI certification.',
    submittedForApprovalDate: '2025-11-02T15:00:00',
    deptHeadApprovedBy: '29',
    deptHeadApprovedByName: 'Rini Susilowati',
    deptHeadApprovedDate: '2025-11-03T09:00:00',
    deptHeadComments: 'All vendors are SNI certified. Approved.',
    divHeadApprovedBy: '30',
    divHeadApprovedByName: 'Hendra Gunawan',
    divHeadApprovedDate: '2025-11-04T10:00:00',
    divHeadComments: 'Approved for review.',
    plannerReviewedBy: '28',
    plannerReviewedByName: 'Andi Saputra',
    plannerReviewDate: '2025-11-05T13:00:00',
    plannerDecision: 'Approved',
    plannerComments: 'All vendors meet technical requirements. Approved.',
    buyerReviewedBy: '26',
    buyerReviewedByName: 'Tommy Wijaya',
    buyerReviewDate: '2025-11-06T15:00:00',
    buyerDecision: 'Approved',
    buyerComments: 'Pricing competitive and delivery terms acceptable. Approved.',
    completedDate: '2025-11-06T15:00:00',
  },
];

// Legacy export for backward compatibility
export const mockVendorRequests = mockVendorRecommendations;
