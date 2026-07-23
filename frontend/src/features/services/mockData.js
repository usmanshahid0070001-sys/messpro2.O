export const mockComplaintsData = [
  {
    id: 'c1',
    roomId: '101',
    category: 'Plumbing',
    priority: 'High', // High, Medium, Low
    status: 'Open', // Open, Assigned, In Progress, Resolved
    raisedBy: 'John Doe',
    dateRaised: '2026-07-22T08:00:00Z',
    description: 'Leaking tap in the bathroom.',
    assignedStaff: null,
    resolutionNotes: '',
  },
  {
    id: 'c2',
    roomId: '102',
    category: 'Electrical',
    priority: 'Medium',
    status: 'Assigned',
    raisedBy: 'Jane Smith',
    dateRaised: '2026-07-21T10:30:00Z',
    description: 'Fan is making a weird noise.',
    assignedStaff: 'Electrician Bob',
    resolutionNotes: '',
  },
  {
    id: 'c3',
    roomId: '103',
    category: 'Cleaning',
    priority: 'Low',
    status: 'In Progress',
    raisedBy: 'Alice Johnson',
    dateRaised: '2026-07-20T14:15:00Z',
    description: 'Room needs deep cleaning.',
    assignedStaff: 'Cleaner Mary',
    resolutionNotes: 'Currently cleaning the room.',
  },
  {
    id: 'c4',
    roomId: '104',
    category: 'Carpentry',
    priority: 'Low',
    status: 'Resolved',
    raisedBy: 'Bob Williams',
    dateRaised: '2026-07-19T09:45:00Z',
    description: 'Broken chair leg.',
    assignedStaff: 'Carpenter Joe',
    resolutionNotes: 'Replaced the chair leg.',
  },
  {
    id: 'c5',
    roomId: '101', // Multiple complaints for 101
    category: 'Electrical',
    priority: 'Medium',
    status: 'Open',
    raisedBy: 'John Doe',
    dateRaised: '2026-07-22T10:00:00Z',
    description: 'Socket not working.',
    assignedStaff: null,
    resolutionNotes: '',
  }
];

export const mockCleaningData = [
  {
    id: 'cl1',
    roomId: '101',
    cleanedBy: 'Mary',
    cleanedAt: '2026-07-21T09:00:00Z',
    notes: 'Regular clean',
  },
  {
    id: 'cl2',
    roomId: '101',
    cleanedBy: 'Mary',
    cleanedAt: '2026-07-18T09:00:00Z',
    notes: 'Deep clean',
  },
  {
    id: 'cl3',
    roomId: '102',
    cleanedBy: 'Susan',
    cleanedAt: '2026-07-23T10:00:00Z',
    notes: 'Regular clean',
  },
  {
    id: 'cl4',
    roomId: '103',
    cleanedBy: 'Mary',
    cleanedAt: '2026-07-15T09:00:00Z', // Overdue
    notes: 'Regular clean',
  },
  {
    id: 'cl5',
    roomId: '104',
    cleanedBy: 'Susan',
    cleanedAt: '2026-07-22T11:00:00Z',
    notes: 'Regular clean',
  }
];

// Helper to generate a list of rooms for the grid
export const mockRooms = ['101', '102', '103', '104', '105', '106'];
