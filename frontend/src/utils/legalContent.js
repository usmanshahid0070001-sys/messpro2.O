// src/utils/legalContent.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all MessPro legal agreement text.
// Consumed by: LegalPage.jsx (public /legal route) and LegalAgreementModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

export const LEGAL_META = {
  effectiveDate: 'August 6, 2026',
  lastReviewed: 'August 6, 2026',
  version: 'Beta v2.0',
};

export const ROLE_TABLE = [
  {
    role: 'SuperAdmin',
    authority: 'Platform Authority',
    responsibilities:
      'Creates, manages, and updates hostel subscription plans. Applies or modifies billing tiers for tenant hostels. Does not interfere in individual hostel operations or student data.',
  },
  {
    role: 'Hostel Admin (Tenant)',
    authority: 'Hostel Authority',
    responsibilities:
      'Owns and configures their hostel environment. Sets meal pricing, fine parameters, cutoff rules, and onboards managers and students.',
  },
  {
    role: 'Manager',
    authority: 'Operational Authority',
    responsibilities:
      'Performs daily tasks delegated by the Admin: recording attendance, managing meal sessions, and generating operational reports.',
  },
  {
    role: 'Student',
    authority: 'End-User',
    responsibilities:
      'Accesses their personal dashboard to view meal selections, attendance records, billing estimates, and hostel announcements.',
  },
];

export const LEGAL_SECTIONS = [
  {
    id: 'overview',
    number: '1',
    title: 'Platform Overview & Scope',
    badge: 'All Users',
    subsections: [
      {
        title: 'What MessPro Is',
        content:
          'MessPro is a cloud-based, multi-tenant Software as a Service (SaaS) platform designed to modernize hostel and dining management operations. The platform provides tools for meal scheduling, attendance tracking (QR code, manual, and third-party biometric hardware integrations), billing calculation, student roster management, and operational analytics.',
      },
      {
        title: 'What MessPro Is Not',
        isList: true,
        items: [
          'A food service provider, caterer, or restaurant.',
          'A financial institution, payment processor, or debt collector.',
          'A physical property manager, hostel landlord, or facility operator.',
          'A guarantor of any financial obligations between students and hostel management.',
          'A legal enforcer of any local hostel bylaws, university regulations, or government directives.',
        ],
      },
      {
        title: null,
        content:
          'All disputes regarding food quality, physical premises, actual financial collection, room assignments, or disciplinary action are matters strictly between the Student and the Hostel Administration. MessPro provides data to inform these decisions but bears no responsibility for their outcomes.',
      },
    ],
  },
  {
    id: 'roles',
    number: '2',
    title: 'Role Definitions & Authority Hierarchy',
    badge: 'All Users',
    isTable: true,
    subsections: [
      {
        title: null,
        content:
          'The MessPro platform operates on a strict four-tier authority model. The SuperAdmin governs platform and plan management. The Hostel Admin governs their hostel environment. The Manager handles daily operations. Students are end-users of the system.',
      },
    ],
  },
  {
    id: 'tos',
    number: '3',
    title: 'Terms of Service',
    badge: 'All Users',
    subsections: [
      {
        title: '3.1 — Acceptance of Terms',
        content:
          'By creating an account, logging in, or otherwise accessing the MessPro platform, you ("User") confirm that you have read, understood, and agree to be legally bound by these Terms of Service, our Privacy Policy, and any role-specific agreements applicable to you. If you do not agree, you must immediately discontinue use of the platform.',
      },
      {
        title: '3.2 — Eligibility',
        content:
          'You must be at least 13 years of age to use MessPro. If you are under 18, your use must be authorized and supervised by a legal guardian or your Hostel Administration.',
      },
      {
        title: '3.3 — Account Security & Credential Responsibility',
        isList: true,
        items: [
          'Each user account is personal and non-transferable.',
          'You are solely responsible for maintaining the confidentiality of your login credentials.',
          'You must not share your account access with any third party.',
          'You agree to notify your Hostel Admin or MessPro immediately upon discovering any unauthorized use of your account.',
          'MessPro will not be liable for any loss arising from unauthorized access resulting from your failure to safeguard your credentials.',
        ],
      },
      {
        title: '3.4 — Acceptable Use Policy',
        content: 'All users of MessPro agree NOT to:',
        isList: true,
        items: [
          'Attempt to gain unauthorized access to any other user\'s account, any hostel\'s data partition, or MessPro\'s server infrastructure.',
          'Reverse-engineer, decompile, or otherwise attempt to derive the source code of the platform.',
          'Use automated bots, scrapers, or scripts to interact with the platform in unintended ways.',
          'Submit false, misleading, or fraudulent data — including falsifying attendance or impersonating another user.',
          'Use the platform for any purpose that violates applicable local, national, or international law.',
          'Engage in any conduct that disrupts or negatively impacts other users or the platform.',
        ],
      },
      {
        title: '3.5 — Intellectual Property',
        content:
          'All content, design, workflows, logic, trademarks, and software comprising MessPro are the exclusive intellectual property of the MessPro development team. You are granted a limited, non-exclusive, non-transferable license to use the platform strictly for its intended purpose.',
      },
      {
        title: '3.6 — Beta Disclaimer',
        content:
          'MessPro is currently in a public beta phase. Features may change, be deprecated, or behave unexpectedly. The platform may experience downtime, data processing delays, or feature instability. MessPro will communicate significant changes via in-platform notifications or email.',
      },
    ],
  },
  {
    id: 'admin-agreement',
    number: '4',
    title: 'Hostel Admin Subscription Agreement',
    badge: 'Admins Only',
    subsections: [
      {
        title: '4.1 — Tenant Status & Authority',
        content:
          'As a Hostel Admin, you represent that you are a duly authorized representative of your hostel or institution with the legal authority to bind your institution to these terms, onboard students onto MessPro on their behalf, and configure operational parameters that govern your students\' records.',
      },
      {
        title: '4.2 — Configuration Responsibilities',
        content:
          'You accept full responsibility for the configuration of your hostel\'s operational settings within MessPro, including meal pricing, fine parameters, attendance cutoff rules, and student roster management. MessPro-generated bills are a direct mathematical output of the parameters you configure.',
      },
      {
        title: '4.3 — Student Consent & Onboarding Authority',
        content:
          'By onboarding students onto MessPro, you warrant that your students have been informed that a digital management system is in use, your institution\'s policies permit digital collection of student operational data, and you have the authority to manage student accounts on this platform.',
      },
      {
        title: '4.4 — SuperAdmin Plan Governance',
        content:
          'The SuperAdmin has the authority to create, modify, or discontinue subscription plans, and to apply or update the plan assigned to your hostel. The SuperAdmin does not have authority to alter your hostel\'s internal operational data except in cases of a platform-wide security emergency, legal obligation, or abuse investigation.',
      },
      {
        title: '4.5 — Subscription, Trial & Termination',
        content:
          'During the beta phase, access is provided at no cost. Upon general availability, hostels will be eligible for a 14-day free trial. Account suspension may occur for non-payment, verified misuse, or legal obligation. Student data will be anonymized per the Data Retention Policy upon subscription termination.',
      },
      {
        title: '4.6 — Manager Delegation & Oversight',
        content:
          'You are responsible for all actions taken by Managers you authorize. You agree to only grant Manager access to legitimately authorized individuals, revoke access promptly when authorization ends, and periodically review Manager actions for accuracy. Inaccurate data entered by a Manager will affect student bills, and MessPro cannot be held liable for such discrepancies.',
      },
    ],
  },
  {
    id: 'manager-agreement',
    number: '5',
    title: 'Manager Role Agreement',
    badge: 'Managers Only',
    subsections: [
      {
        title: '5.1 — Delegated Authority',
        content:
          'Your access to MessPro is granted entirely at the discretion of your Hostel Admin. You do not have an independent subscription relationship with MessPro. The Hostel Admin can modify or revoke your access at any time.',
      },
      {
        title: '5.2 — Manager Responsibilities',
        content: 'As a Manager, you are authorized and expected to:',
        isList: true,
        items: [
          'Record student meal attendance via QR code scanning, manual entry, or syncing with connected biometric hardware.',
          'Manage meal sessions: open and close them as configured by your Admin.',
          'Access and download operational reports as permitted by your Admin.',
          'Perform manual attendance entry in cases of system issues — and accept full responsibility for the accuracy of all manual entries.',
        ],
      },
      {
        title: '5.3 — Prohibited Manager Actions',
        content: 'As a Manager, you are strictly prohibited from:',
        isList: true,
        items: [
          'Modifying student billing configurations, fine parameters, or meal pricing (Admin-only functions).',
          'Accessing or exporting student data outside the scope of your assigned operational tasks.',
          'Sharing your Manager login credentials with any other person.',
          'Manually marking attendance for students who were not physically present, or failing to mark present students.',
          'Using your system access to intimidate, coerce, or discriminate against any student.',
        ],
      },
      {
        title: '5.4 — Data Accuracy Accountability',
        content:
          'The data you enter forms the basis of student billing calculations. You commit to entering data accurately and honestly. Intentional falsification of operational data constitutes a serious breach of this agreement and may have legal and employment consequences.',
      },
    ],
  },
  {
    id: 'student-agreement',
    number: '6',
    title: 'Student Onboarding & Usage Agreement',
    badge: 'Students Only',
    subsections: [
      {
        title: '6.1 — How You Access MessPro',
        content:
          'Your MessPro account is created and managed by your Hostel Admin. Your access is contingent on your active enrollment in the hostel that has subscribed to MessPro. If your hostel terminates its subscription or you leave the hostel, your access will be revoked.',
      },
      {
        title: '6.2 — Meal Selection & Cutoff Rules',
        content:
          'You may opt in or out of specific meals within the platform, subject to cutoff times configured by your Hostel Admin. Once a meal selection cutoff has passed, your choice is locked and binding. Fines or charges associated with a locked meal selection are governed by your hostel\'s policy, not by MessPro.',
      },
      {
        title: '6.3 — Bill Transparency & Disputes',
        content:
          'MessPro generates an estimated billing statement for transparency only. MessPro does not issue final invoices, collect payments, or enforce debt. If you believe your bill contains an error, raise the concern directly with your Manager or Admin first. If the error is verified, the Admin can correct the record in MessPro.',
      },
      {
        title: '6.4 — Your Data & Privacy Rights',
        content:
          'You have the right to view your own attendance records, meal selections, and billing history in your student dashboard. You do not have the right to access any other student\'s data. If you wish to have your data corrected or deleted, submit a request to your Hostel Admin.',
      },
      {
        title: '6.5 — Prohibited Student Actions',
        isList: true,
        items: [
          'Attempting to manipulate your attendance records, meal selections, or billing data through any technical means.',
          'Sharing QR codes, access tokens, or credentials with other students to falsify attendance.',
          'Accessing any part of the platform designated for Admin or Manager roles.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    number: '7',
    title: 'Privacy Policy',
    badge: 'All Users',
    subsections: [
      {
        title: '7.1 — Data Controller vs. Data Processor',
        content:
          'Your Hostel Admin is the Data Controller — they control what student data is collected and for what institutional purposes. MessPro is the Data Processor — we process student data strictly on Admin instructions. The SuperAdmin may access only aggregated, anonymized platform analytics and has no routine access to individual student records.',
      },
      {
        title: '7.2 — Information We Collect',
        content:
          'From Admins and Managers: account details, hostel configuration data, and operational logs. From Students: Personal Identifiable Information (name, roll number, email, room assignment), operational data (meal selections, attendance records, billing history), and device & usage data (browser type, IP address, session duration) for security and platform optimization.',
      },
      {
        title: '7.3 — Biometric Data Disclaimer',
        content:
          'MessPro does not extract, store, or process raw biometric data of any kind. If your hostel uses third-party biometric hardware (e.g., ZKTeco scanners), MessPro only receives the output log generated by that hardware (e.g., "Roll No. 2024-CS-45 verified at 07:58 AM"). The actual biometric template never leaves the hardware device and never enters MessPro\'s systems.',
      },
      {
        title: '7.4 — How We Use Your Data',
        content: 'We use your data strictly for:',
        isList: true,
        items: [
          'Authenticating logins and securing sessions via JWT (All Users).',
          'Calculating monthly meal bills and attendance-based fines (Students).',
          'Providing Admins with operational analytics — meal consumption rates, attendance trends (Admins, Managers).',
          'Monitoring platform health, detecting abuse, and ensuring security (All Users).',
          'Generating anonymized, aggregate platform-wide analytics for product improvement (All Users).',
          'Responding to support requests (All Users).',
        ],
      },
      {
        title: '7.5 — Third-Party Infrastructure Partners',
        content:
          'MessPro relies on: MongoDB Atlas (cloud database storage), Supabase / Firebase (encrypted authentication and session management), and Vercel (application hosting and serverless functions). We do not share your data with any other third party unless required by law or a valid legal order.',
      },
      {
        title: '7.6 — Security Measures',
        isList: true,
        items: [
          'JWT Sessions: All sessions are authenticated and authorized via signed, time-limited tokens.',
          'Multi-Tenant Isolation: One hostel\'s data is completely isolated from any other hostel.',
          'Encrypted Authentication: Passwords are hashed using industry-standard algorithms and never stored in plain text.',
          'Role-Based Access Control (RBAC): Each role can only access endpoints and data relevant to their function.',
          'HTTPS Enforcement: All data in transit is encrypted via TLS/SSL.',
        ],
      },
    ],
  },
  {
    id: 'data-retention',
    number: '8',
    title: 'Data Retention & Deletion Policy',
    badge: 'All Users',
    subsections: [
      {
        title: '8.1 — Active Accounts',
        content:
          'Data is retained for as long as the associated hostel maintains an active MessPro subscription and the student remains enrolled.',
      },
      {
        title: '8.2 — Student Departure or De-enrollment',
        content:
          'When a student is removed from a hostel\'s roster, their PII (name, roll number, email, room assignment) is anonymized within 30 days. Anonymized operational records are retained as aggregate, non-identifiable data for platform analytics.',
      },
      {
        title: '8.3 — Hostel Subscription Termination',
        content:
          'If a Hostel Admin terminates their MessPro subscription, operational data for that hostel partition is anonymized within 30 days of the subscription end date. Identifiable PII is deleted from active databases. Admins are encouraged to export required records before terminating, as data recovery post-anonymization is not possible.',
      },
      {
        title: '8.4 — Student Data Deletion Request',
        content:
          'A student who wishes to have their data removed must contact their Hostel Admin with a deletion request. The Admin can execute this via the MessPro Admin dashboard. PII will be deleted and records anonymized within 30 days. If the Admin is unresponsive, the student may escalate to MessPro Support.',
      },
      {
        title: '8.5 — Platform-Initiated Deletion',
        content:
          'MessPro reserves the right to delete inactive hostel accounts (no login activity for 12 consecutive months and no active subscription) after reasonable prior notice. Data associated with such accounts will be anonymized before deletion.',
      },
    ],
  },
  {
    id: 'liability',
    number: '9',
    title: 'Limitation of Liability & Disclaimers',
    badge: 'All Users',
    subsections: [
      {
        title: '9.1 — Service Availability',
        content:
          'MessPro does not guarantee uninterrupted, error-free, or perfectly timely delivery of the Service. The platform may experience planned or unplanned downtime. We are not liable for losses resulting from service unavailability.',
      },
      {
        title: '9.2 — Data Accuracy',
        content:
          'MessPro\'s outputs are only as accurate as the data inputs provided by Hostel Admins, Managers, and third-party hardware. MessPro is not liable for bills from incorrectly configured parameters, attendance discrepancies from hardware failures, or losses from a student\'s failure to submit meal selections before cutoff.',
      },
      {
        title: '9.3 — Financial Non-Involvement',
        content:
          'MessPro does not handle, process, hold, or transfer real money. All billing outputs are informational estimates. MessPro has no involvement in the collection, enforcement, or legal adjudication of any financial obligations between students and their hostel.',
      },
      {
        title: '9.4 — Maximum Liability Cap',
        content:
          'To the maximum extent permitted by applicable law, MessPro\'s total aggregate liability shall not exceed the total subscription fees paid by that hostel in the 3-month period immediately preceding the event giving rise to the claim. For users on a free/beta plan, this cap is zero.',
      },
      {
        title: '9.5 — Consequential Damages Exclusion',
        content: 'MessPro shall not be liable for any indirect, incidental, or consequential damages, including:',
        isList: true,
        items: [
          'Loss of revenue, profits, or business for a hostel.',
          'Reputational harm arising from billing disputes.',
          'Student academic or institutional consequences from billing or attendance data.',
          'Loss of data due to hardware failures or third-party infrastructure outages.',
        ],
      },
    ],
  },
  {
    id: 'payments',
    number: '10',
    title: 'No Payment Gateway & Offline-Only Financial Policy',
    badge: 'All Users',
    subsections: [
      {
        title: '10.1 — No Online Payment Processing',
        content:
          'MessPro does not integrate, operate, or connect to any payment gateway, payment processor, digital wallet, or online banking system of any kind — including but not limited to Stripe, PayPal, Razorpay, JazzCash, EasyPaisa, bank transfer APIs, or any cryptocurrency payment network. By using MessPro, you acknowledge and agree that:',
        isList: true,
        items: [
          'No real money is ever transmitted, processed, held, or transferred through the MessPro platform.',
          'No credit card, debit card, bank account, or digital wallet information is ever collected, stored, or processed by MessPro.',
          'MessPro does not act as a payment intermediary, escrow agent, or financial service provider of any kind.',
        ],
      },
      {
        title: '10.2 — Subscription Fees — Offline Collection Only',
        content:
          'During the current beta phase, MessPro is offered at no charge. Upon general availability, subscription fees payable by Hostel Admins will be communicated directly by the MessPro team and settled through offline, mutually agreed-upon methods (e.g., bank transfer, in-person payment). MessPro will never request subscription payment through the platform itself.',
      },
      {
        title: '10.3 — Student Bill Payments — Offline Only',
        content:
          'All student meal bills calculated by MessPro are informational estimates only. The actual payment of these bills by students to their hostel is conducted entirely offline through your hostel\'s established payment channels (e.g., cash payment to the hostel office, bank deposit, or any method your Hostel Admin designates). MessPro has no visibility into, responsibility for, or involvement in whether a student has paid their bill, the method or completion of any offline payment, or any disputes arising from offline payment transactions.',
      },
      {
        title: '10.4 — No Financial Liability',
        content: 'Because MessPro is strictly a data management and billing calculation tool with no involvement in actual financial transactions, MessPro bears zero financial liability in relation to:',
        isList: true,
        items: [
          'Unpaid student bills.',
          'Incorrect bill amounts arising from Admin configuration errors.',
          'Late, disputed, or failed offline payments.',
          'Any financial loss incurred by a student, hostel, or third party as a result of relying on MessPro\'s bill estimates.',
        ],
      },
    ],
  },
  {
    id: 'amendments',
    number: '11',
    title: 'Amendments & Contact',
    badge: 'All Users',
    subsections: [
      {
        title: '11.1 — Right to Amend',
        content:
          'MessPro reserves the right to modify, update, or replace these agreements at any time. Significant changes will be communicated to Hostel Admins via in-platform notification banners and email to the registered Admin address. Continued use after the effective date of an amendment constitutes acceptance of the revised terms.',
      },
      {
        title: '11.2 — Governing Principles',
        content:
          'These terms are intended to be fair, transparent, and consistent with internationally recognized principles of data protection, consumer protection, and software service agreements. In the event of a legal dispute, parties agree to first attempt resolution through good-faith negotiation.',
      },
      {
        title: '11.3 — Severability',
        content:
          'If any provision of these agreements is found to be unenforceable or invalid under applicable law, that provision will be modified to the minimum extent necessary to make it enforceable. All other provisions will remain in full force and effect.',
      },
      {
        title: '11.4 — Contact',
        content:
          'For questions, concerns, data requests, or legal notices related to these agreements, please contact the MessPro team through the official support channel available on the platform.',
      },
    ],
  },
];
