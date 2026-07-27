export const mockMeals = [
  // Examples for July 2026
  { id: '1', date: '2026-07-20', type: 'Breakfast', status: 'Consumed', price: 50 },
  { id: '2', date: '2026-07-20', type: 'Lunch', status: 'Pending', price: 100 },
  { id: '3', date: '2026-07-20', type: 'Dinner', status: 'Consumed', price: 120 },
  { id: '4', date: '2026-07-21', type: 'Breakfast', status: 'Consumed', price: 50 },
  { id: '5', date: '2026-07-21', type: 'Dinner', status: 'Pending', price: 120 },
  { id: '6', date: '2026-07-22', type: 'Lunch', status: 'Consumed', price: 100 },
  { id: '7', date: '2026-07-22', type: 'Dinner', status: 'Consumed', price: 120 },
];

export const initialMockSubcharges = [
  { id: 'sc1', name: 'Service Tax', type: 'percentage', value: 5 }, // 5%
  { id: 'sc2', name: 'Cleaning Fee', type: 'fixed', value: 150 }, // Flat 150
];

export const mockBills = [
  {
    id: 'INV-2026-06',
    date: '2026-06-30',
    total: 3500,
    status: 'Paid',
    items: [
      { name: 'Base Meal Plan', amount: 3000 },
      { name: 'Extra Items', amount: 350 },
      { name: 'Service Tax', amount: 150 }
    ]
  },
  {
    id: 'INV-2026-05',
    date: '2026-05-31',
    total: 3400,
    status: 'Paid',
    items: [
      { name: 'Base Meal Plan', amount: 3000 },
      { name: 'Extra Items', amount: 250 },
      { name: 'Service Tax', amount: 150 }
    ]
  }
];
