const fs = require('fs');
const path = require('path');

const datasetPath = fs.existsSync('js/dataset.js') ? 'js/dataset.js' : '';
const oldCode = datasetPath ? fs.readFileSync(datasetPath, 'utf8') : '';
const oldData = {};
if (oldCode) {
  eval(oldCode.replace('window.YOUTH_HUB_PORTAL_DATA', 'oldData.data'));
}

const trainingConducted = [
  {
    id: 'TC-01',
    title: 'Danexx Garment Production & Industrial Stitching',
    category: 'Industrial Manufacturing',
    block: 'Geedam',
    venue: 'Danexx Apparel Unit, Haram, Geedam',
    startDate: '2026-08-01',
    endDate: '2026-09-15',
    trainer: 'Danexx Master Trainers',
    enrolledCount: 65,
    completedCount: 62,
    placedCount: 58,
    status: 'Completed',
    partnerScheme: 'Bastar Livelihood Mission'
  },
  {
    id: 'TC-02',
    title: 'Computer Operator & Digital Office Assistant',
    category: 'IT & Digital Literacy',
    block: 'Dantewada',
    venue: 'District Livelihood College, Dantewada',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    trainer: 'Livelihood College Faculty',
    enrolledCount: 45,
    completedCount: 44,
    placedCount: 32,
    status: 'Completed',
    partnerScheme: 'MMKKY'
  },
  {
    id: 'TC-03',
    title: 'Solar Panel Installation & Maintenance',
    category: 'Green Energy / Technical',
    block: 'Kuakonda',
    venue: 'Govt ITI Kuakonda',
    startDate: '2026-09-10',
    endDate: '2026-10-25',
    trainer: 'CREDA Certified Master Technicians',
    enrolledCount: 30,
    completedCount: 28,
    placedCount: 22,
    status: 'Completed',
    partnerScheme: 'PM Surya Ghar'
  },
  {
    id: 'TC-04',
    title: 'Non-Timber Forest Produce (NTFP) Processing & Packaging',
    category: 'Agri-Business & Entrepreneurship',
    block: 'Katekalyan',
    venue: 'Van Dhan Vikas Kendra, Katekalyan',
    startDate: '2026-10-05',
    endDate: '2026-10-26',
    trainer: 'TRIFED Master Trainers',
    enrolledCount: 40,
    completedCount: 39,
    placedCount: 25,
    status: 'Completed',
    partnerScheme: 'PM Van Dhan Yojana'
  },
  {
    id: 'TC-05',
    title: 'Hospitality & Patient Care Attendant',
    category: 'Healthcare',
    block: 'Dantewada',
    venue: 'District Hospital Campus, Dantewada',
    startDate: '2026-10-15',
    endDate: '2026-11-30',
    trainer: 'District Health Society',
    enrolledCount: 35,
    completedCount: 0,
    placedCount: 0,
    status: 'Ongoing',
    partnerScheme: 'DDU-GKY'
  },
  {
    id: 'TC-06',
    title: 'Two-Wheeler & EV Repair Technician',
    category: 'Automotive & Technical',
    block: 'Geedam',
    venue: 'Polytechnic Campus, Geedam',
    startDate: '2026-10-20',
    endDate: '2026-12-05',
    trainer: 'Automotive Skills Council India',
    enrolledCount: 28,
    completedCount: 0,
    placedCount: 0,
    status: 'Ongoing',
    partnerScheme: 'Youth Hub Innovation'
  }
];

const fieldVisits = [
  {
    id: 'VIS-2026-0001',
    date: '2026-10-12',
    officerName: 'Shri R.K. Kashyap, BDO',
    officerRole: 'Block Officer',
    block: 'Geedam',
    gramPanchayat: 'HIRANAR',
    locationName: 'Hiranar Rural Youth Enterprise Center',
    purpose: 'Verification of PMEGP Flour Mill and Livelihood Center',
    scheme: 'PMEGP',
    linkedYouthId: '1',
    linkedYouthName: 'Manisha Yadav',
    description: 'Visited the newly operational agro-processing and flour unit established with PMEGP bank subsidy. Beneficiary was present along with SHG members.',
    findings: 'Machinery installed, electricity 3-phase connected, initial production underway. Packaging material supply chain needs linkage with local Krishi Mandi.',
    issuesFaced: 'Need barcode registration for selling packaged flour to tribal hostels.',
    actionRequired: 'Provide DIC certification and facilitate supply tie-up with local schools/hostels.',
    followUpDate: '2026-11-05',
    status: 'Action in Progress',
    approvalStatus: 'Approved',
    isPublic: true,
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80',
        caption: 'Inspection of PMEGP processing machinery and grain storage',
        type: 'Inspection',
        uploadedBy: 'Shri R.K. Kashyap',
        timestamp: '2026-10-12 11:30'
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        caption: 'Beneficiary interaction regarding daily sales register',
        type: 'Interaction',
        uploadedBy: 'Shri R.K. Kashyap',
        timestamp: '2026-10-12 11:45'
      }
    ]
  },
  {
    id: 'VIS-2026-0002',
    date: '2026-10-16',
    officerName: 'Smt. Anita Mandavi, Field Coordinator',
    officerRole: 'Field Staff',
    block: 'Dantewada',
    gramPanchayat: 'KAMALOOR',
    locationName: 'Kamaloor Market Center',
    purpose: 'Mudra Loan Beneficiary Kirana & General Store Inspection',
    scheme: 'MUDRA LOAN',
    linkedYouthId: 'loan-1',
    linkedYouthName: 'Mohan Bhaskar',
    description: 'Routine verification of inventory expansion supported through Rs 50,000 Mudra Shishu loan.',
    findings: 'Stock increased substantially, monthly revenue increased by ~40%. Beneficiary has started UPI payments with soundbox.',
    issuesFaced: 'No issues reported. Repayment of installments is regular.',
    actionRequired: 'Recommend for Kishore stage loan upgrade in next financial quarter.',
    followUpDate: '2026-12-10',
    status: 'Resolved',
    approvalStatus: 'Approved',
    isPublic: true,
    photos: [
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
        caption: 'Expanded grocery counter and inventory verification',
        type: 'After',
        uploadedBy: 'Smt. Anita Mandavi',
        timestamp: '2026-10-16 14:15'
      }
    ]
  },
  {
    id: 'VIS-2026-0003',
    date: '2026-10-18',
    officerName: 'Dr. S. Beck, Assistant Director (Employment)',
    officerRole: 'District Admin',
    block: 'Geedam',
    gramPanchayat: 'HARAM',
    locationName: 'Danexx Garment Factory Unit 2',
    purpose: 'Quarterly review of newly placed trainees and workplace safety',
    scheme: 'Bastar Livelihood Mission',
    linkedYouthId: 'placed-2',
    linkedYouthName: 'Pallavi Nag',
    description: 'Conducted inspection of Danexx manufacturing line where 58 women trainees from recent batch were absorbed as industrial machine operators.',
    findings: 'Attendance rate is 94%. Working conditions excellent, crèche facility active, monthly wages paid directly into bank accounts.',
    issuesFaced: 'Bus transit from remote villages in Katekalyan needs additional morning route.',
    actionRequired: 'Coordinate with District Transport Officer for routing of CSR transit bus.',
    followUpDate: '2026-10-30',
    status: 'Follow-up Required',
    approvalStatus: 'Approved',
    isPublic: true,
    photos: [
      {
        id: 'p4',
        url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80',
        caption: 'Danexx stitching line inspection with newly trained women operators',
        type: 'Inspection',
        uploadedBy: 'Dr. S. Beck',
        timestamp: '2026-10-18 10:20'
      },
      {
        id: 'p5',
        url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
        caption: 'Group discussion with trainees regarding overtime policy and health checkups',
        type: 'Interaction',
        uploadedBy: 'Dr. S. Beck',
        timestamp: '2026-10-18 11:10'
      }
    ]
  },
  {
    id: 'VIS-2026-0004',
    date: '2026-10-21',
    officerName: 'Praveen Markam, Junior Engineer',
    officerRole: 'Field Staff',
    block: 'Katekalyan',
    gramPanchayat: 'BADE GUDRA',
    locationName: 'Tamarind Cake Processing Center',
    purpose: 'Review of drying and de-seeding unit before harvest season',
    scheme: 'PMFME',
    linkedYouthId: 'loan-2',
    linkedYouthName: 'Hurra Kunjam',
    description: 'Visited cooperative tamarind processing shed. Assessed storage waterproofing and solar drying racks.',
    findings: 'Two solar dryers need recalibration. Civil shed structure in good shape.',
    issuesFaced: 'Minor moisture seepage along north wall.',
    actionRequired: 'Panchayat secretary instructed to complete roof waterproofing before November rains.',
    followUpDate: '2026-11-02',
    status: 'Action in Progress',
    approvalStatus: 'Pending Approval',
    isPublic: false,
    photos: [
      {
        id: 'p6',
        url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
        caption: 'Solar drying yard inspection at Bade Gudra',
        type: 'Inspection',
        uploadedBy: 'Praveen Markam',
        timestamp: '2026-10-21 15:40'
      }
    ]
  },
  {
    id: 'VIS-2026-0005',
    date: '2026-10-24',
    officerName: 'Vikram Sahu, Youth Hub Coordinator',
    officerRole: 'Block Officer',
    block: 'Kuakonda',
    gramPanchayat: 'NERLI',
    locationName: 'Youth Hub Counseling Camp Nerli',
    purpose: 'Follow-up on Bastar Munne Shivir candidates mobilization',
    scheme: 'Youth Hub Dantewada',
    linkedYouthId: 'shivir-1',
    linkedYouthName: 'Ramesh Telam',
    description: 'Follow-up meeting with 18 tribal youth shortlisted during Bastar Munne Shivir for upcoming solar pump technician program.',
    findings: '16 out of 18 confirmed joining next week. Parents attended orientation.',
    issuesFaced: '2 candidates require hostel accommodation at Dantewada.',
    actionRequired: 'Issue hostel allotment slips in Livelihood College hostel.',
    followUpDate: '2026-10-29',
    status: 'Visit Completed',
    approvalStatus: 'Approved',
    isPublic: true,
    photos: [
      {
        id: 'p7',
        url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
        caption: 'Youth mobilization session at Nerli Panchayat hall',
        type: 'Interaction',
        uploadedBy: 'Vikram Sahu',
        timestamp: '2026-10-24 12:15'
      }
    ]
  }
];

const successStories = [
  {
    id: 'STORY-001',
    youthName: 'Pallavi Nag',
    village: 'Barsoor',
    block: 'Geedam',
    title: 'From Unemployed Graduate to Master Quality Checker at Danexx',
    category: 'Employment',
    scheme: 'Danexx Garments / Bastar Livelihood Mission',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    summary: 'After completing skill training in industrial garment tailoring at Livelihood College, Pallavi joined Danexx and was promoted to quality controller within one year, now earning Rs 14,000 monthly.',
    fullStory: 'Pallavi Nag from Barsoor had completed graduation in arts but faced severe lack of formal employment opportunities in the region. Through the Dantewada Youth Hub counseling camp in 2024, she enrolled in the Danexx industrial stitching course. Her attention to detail and work ethic stood out during training. Upon placement at Danexx Unit-1, she quickly mastered quality parameters for export garments. Today she supervises a line of 18 operators and is a role model for young tribal women across Dantewada.',
    achievementDate: '2026-06-15',
    linkedYouthId: 'placed-2',
    monthlyIncome: 'Rs 14,000 / month',
    status: 'Published',
    featured: true,
    author: 'District Media Cell Dantewada',
    quote: 'Youth Hub gave me more than a job — it gave me the dignity of financial independence and respect in my village.'
  },
  {
    id: 'STORY-002',
    youthName: 'Deepak Thakur',
    village: 'Kirandul',
    block: 'Dantewada',
    title: 'Flourishing Sweet & Namkeen Enterprise under PMFME Loan',
    category: 'Entrepreneurship',
    scheme: 'PMFME Scheme',
    photoUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    summary: 'Deepak secured a Rs 5 Lakh micro-food processing credit under PMFME to scale up his indigenous traditional confectionery unit, providing direct jobs to 4 local youth.',
    fullStory: 'With a traditional culinary background, Deepak dreamed of running a hygienic confectionery manufacturing workshop in Kirandul. Lack of capital was the primary bottleneck. The District Trade & Industries Centre (DTIC) Dantewada helped him prepare a detailed project report (DPR) under PMFME, securing a 35% capital subsidy. Today his brand distributes packaged sweets, chivda, and roasted snacks across NMDC township and Bacheli.',
    achievementDate: '2026-07-20',
    linkedYouthId: 'loan-3',
    monthlyIncome: 'Rs 45,000+ Net Profit',
    status: 'Published',
    featured: true,
    author: 'DTIC Dantewada',
    quote: 'With government subsidy and handholding from Youth Hub, small-town entrepreneurs can build sustainable manufacturing enterprises.'
  },
  {
    id: 'STORY-003',
    youthName: 'Mohan Thakur',
    village: 'Ronje',
    block: 'Geedam',
    title: 'Bridging Financial Inclusion as SBI Bank Mitra in Remote Panchayats',
    category: 'Employment',
    scheme: 'Livelihood College Financial Services Linkage',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    summary: 'Mohan serves over 2,200 villagers with doorstep banking, DBT payouts, and pension withdrawals, handling transactions worth Rs 18 Lakhs monthly.',
    fullStory: 'In the remote interior panchayat of Ronje, elders and MGNREGA workers previously walked 15 km to reach the nearest bank branch in Geedam. Mohan received financial literacy and BC (Business Correspondent) certification via Youth Hub Dantewada in convergence with State Bank of India. Equipped with a micro-ATM and biometric scanner, Mohan provides doorstep banking every single day.',
    achievementDate: '2026-05-10',
    linkedYouthId: 'placed-1',
    monthlyIncome: 'Rs 12,500 / month commission',
    status: 'Published',
    featured: true,
    author: 'Lead District Manager (LDM) Dantewada',
    quote: 'Serving my own village elders and ensuring their pension reaches on time is the greatest reward.'
  },
  {
    id: 'STORY-004',
    youthName: 'Aashish Markam',
    village: 'Pattarash',
    block: 'Dantewada',
    title: 'Tribal Youth Mastering Full-Stack Python Software Development',
    category: 'Education & Career',
    scheme: 'Navgurukul - Dantewada Digital Fellowship',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    summary: 'From a modest tribal family in Pattarash, Aashish enrolled in the residential Navgurukul campus in Dantewada and is now interning with a Bangalore software startup.',
    fullStory: 'Aashish was pursuing B.Com when he came across the district administration partnership with Navgurukul. Starting from zero coding background, within 14 months he mastered HTML, CSS, JavaScript, Python, and data structures. He recently cleared technical interviews for a remote tech fellowship paying Rs 25,000 monthly.',
    achievementDate: '2026-08-14',
    linkedYouthId: 'nav-1',
    monthlyIncome: 'Rs 25,000 / month fellowship',
    status: 'Published',
    featured: false,
    author: 'Navgurukul Dantewada Team',
    quote: 'Coding looked impossible initially, but the residential peer-learning environment changed my entire world.'
  },
  {
    id: 'STORY-005',
    youthName: 'Dikeshwar Thakur',
    village: 'Ronje',
    block: 'Geedam',
    title: 'Graduating to IIM Raipur Rural Enterprise Accelerator',
    category: 'Entrepreneurship',
    scheme: 'IIM Raipur - Youth Hub Cohort',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    summary: 'Selected among top performers in the IIM Raipur youth screening to develop an organic forest honey and mahua value-addition enterprise in Bastar.',
    fullStory: 'Dikeshwar Thakur, age 23 with a science degree, was screened through the IIM Raipur Youth Survey. He presented an innovative cold-filtration method for wild forest honey that preserves natural enzymes. He has received mentorship from IIM Raipur faculty and seed funding support from District Mineral Foundation (DMF).',
    achievementDate: '2026-09-05',
    linkedYouthId: 'iim-1',
    monthlyIncome: 'Enterprise Incubation',
    status: 'Published',
    featured: false,
    author: 'IIM Raipur Incubation Cell',
    quote: 'The world wants authentic Bastar products; we just needed the scientific packaging and management know-how.'
  }
];

const auditLogs = [
  {
    id: 'LOG-1001',
    timestamp: '2026-10-27 09:30:15',
    userId: 'super.admin',
    userName: 'Chief Administrative Officer',
    userRole: 'Super Admin',
    action: 'SYSTEM_INIT',
    module: 'System',
    target: 'Dantewada Youth Portal Database',
    details: 'Initial database verified with 12 module sheets and 302 youth profiles.'
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-10-26 15:45:20',
    userId: 'district.admin',
    userName: 'Dr. S. Beck, AD Employment',
    userRole: 'District Admin',
    action: 'APPROVAL',
    module: 'Success Gallery',
    target: 'STORY-001 (Pallavi Nag)',
    details: 'Approved success story for public web display after field verification.'
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-10-24 16:10:05',
    userId: 'block.geedam',
    userName: 'Shri R.K. Kashyap, BDO',
    userRole: 'Block Officer',
    action: 'VISIT_CREATE',
    module: 'Field Visits',
    target: 'VIS-2026-0001 (Hiranar PMEGP Inspection)',
    details: 'Logged field visit with 2 attached inspection photographs.'
  }
];

// Clean and standardize youth records:
const youthClean = (oldData.data.youth || []).map((y, idx) => {
  return {
    id: String(y.id || idx + 1),
    name: y.fullName || `${y.firstName || ''} ${y.lastName || ''}`.trim() || 'Youth ' + (idx + 1),
    fatherHusband: y.fatherHusband || '',
    mobile: y.mobile || '9800000000',
    village: y.gramPanchayat || 'Dantewada',
    gramPanchayat: y.gramPanchayat || 'Dantewada',
    block: y.block || 'Dantewada',
    gender: y.gender || 'Male',
    category: y.category || 'ST',
    qualification: y.qualification || '12th Pass',
    employmentStatus: y.occupation || 'Unemployed',
    aspiredCareer: y.aspiredCareer || 'Skill Training',
    scheme: 'Youth Hub Dantewada',
    loanDetails: '',
    status: 'Active',
    remarks: 'Registered via Dantewada Employment Survey',
    followUpDate: '2026-11-15',
    registeredDate: '2026-08-10'
  };
});

const mergedData = {
  youth: youthClean,
  placed: oldData.data.placed || [],
  skills: oldData.data.skills || [],
  navgurukul: oldData.data.navgurukul || [],
  loans: oldData.data.loans || [],
  iimRaipur: oldData.data.iimRaipur || [],
  iimSurvey: oldData.data.iimSurvey || [],
  myBharat: oldData.data.myBharat || [],
  youthHubTrainings: oldData.data.youthHubTrainings || [],
  bastarShivir: oldData.data.bastarShivir || [],
  trainingConducted: trainingConducted,
  fieldVisits: fieldVisits,
  successStories: successStories,
  auditLogs: auditLogs,
  metadata: {
    district: 'Dantewada (South Bastar)',
    state: 'Chhattisgarh',
    blocks: ['Dantewada', 'Geedam', 'Katekalyan', 'Kuakonda'],
    version: '2.0.0',
    lastUpdated: '2026-10-27'
  }
};

const output = 'window.DANTEWADA_SEED_DATA = ' + JSON.stringify(mergedData, null, 2) + ';\n';
fs.writeFileSync('js/seed-data.js', output, 'utf8');
console.log('Successfully written js/seed-data.js! Size:', output.length);
