import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Edit2,
  Check,
  X,
  CreditCard,
  DollarSign,
  PieChart,
  Activity,
  Download,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { mockMonthlyBills } from './data/mockBillManagementData';

// This configuration would ideally come from the backend, allowing fully dynamic billing structures.
const DYNAMIC_COLUMNS = [
  { key: "balance", label: "Balance", editable: true },
  { key: "messBill", label: "Mess Bill", editable: false },
  { key: "factor", label: "Factor (10%)", editable: true },
  { key: "lateFine", label: "Late Fine", editable: true },
  { key: "roomRent", label: "Room Rent", editable: true },
  { key: "serviceCharges", label: "Service Chg", editable: true },
  { key: "fuelCharges", label: "Fuel Chg", editable: true },
  { key: "fine", label: "Other Fine", editable: true },
];

const BillManagement = () => {
  // State for mock data to allow inline edits
  const [bills, setBills] = useState(mockMonthlyBills);
  
  // Controls
  const [viewMode, setViewMode] = useState("current"); // "current" | "monthly"
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, bill: null, amount: 0 });

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const matchesMonth = viewMode === "current"
        ? b.status === "Unpaid"
        : b.month === selectedMonth;

      const matchesSearch =
        b.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.student.rollNumber.includes(searchQuery);

      return matchesMonth && matchesSearch;
    });
  }, [bills, viewMode, selectedMonth, searchQuery]);

  // Summaries
  const summaries = useMemo(() => {
    return filteredBills.reduce((acc, curr) => {
      acc.totalRevenue += curr.totalBill;
      acc.totalPaid += curr.paid;
      acc.totalRemaining += curr.remaining;
      return acc;
    }, { totalRevenue: 0, totalPaid: 0, totalRemaining: 0 });
  }, [filteredBills]);

  // Actions
  const handleEditClick = (bill) => {
    setEditingId(bill.id);
    const initialValues = {};
    DYNAMIC_COLUMNS.forEach(col => {
      if (col.editable) {
        initialValues[col.key] = bill[col.key] || 0;
      }
    });
    setEditValues(initialValues);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSaveEdit = (billId) => {
    setBills(prev => prev.map(b => {
      if (b.id !== billId) return b;

      const newValues = {};
      let dynamicSum = 0;

      DYNAMIC_COLUMNS.forEach(col => {
        if (col.editable) {
          const val = Number(editValues[col.key]) || 0;
          newValues[col.key] = val;
          dynamicSum += val;
        } else {
          dynamicSum += (b[col.key] || 0);
        }
      });

      const newTotal = dynamicSum;
      const newRemaining = Math.max(0, newTotal - b.paid);
      const newStatus = (newRemaining === 0 && newTotal > 0) || newTotal === 0 ? "Paid" : "Unpaid";

      return {
        ...b,
        ...newValues,
        totalBill: newTotal,
        remaining: newRemaining,
        status: newStatus
      };
    }));

    setEditingId(null);
    toast.success('Bill updated successfully');
  };

  const openPaymentModal = (bill) => {
    setPaymentModal({ isOpen: true, bill, amount: bill.remaining });
  };

  const handleProcessPayment = () => {
    const { bill, amount } = paymentModal;
    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setBills(prev => prev.map(b => {
      if (b.id !== bill.id) return b;

      const newPaid = b.paid + paymentAmount;
      const newRemaining = Math.max(0, b.totalBill - newPaid);

      const newStatus = newRemaining === 0 ? "Paid" : "Unpaid";

      return {
        ...b,
        paid: Math.min(newPaid, b.totalBill),
        remaining: newRemaining,
        status: newStatus
      };
    }));

    toast.success(`Payment of Rs. ${paymentAmount} processed!`);
    setPaymentModal({ isOpen: false, bill: null, amount: 0 });
  };

  const exportToExcel = () => {
    const dataToExport = filteredBills.map(b => {
      const row = {
        'Name': b.student.name,
        'Roll Number': b.student.rollNumber,
      };

      DYNAMIC_COLUMNS.forEach(col => {
        row[col.label] = b[col.key] || 0;
      });

      row['Total Bill'] = b.totalBill;
      row['Paid'] = b.paid;
      row['Remaining'] = b.remaining;
      row['Status'] = b.status;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills');
    XLSX.writeFile(workbook, `Bills_Export_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6 relative pb-12">

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <FileText className="w-7 h-7 text-zinc-900 dark:text-zinc-50" />
            Bill Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage, edit, and collect payments for student bills.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode("current")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                viewMode === "current" 
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                viewMode === "monthly" 
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Month Selector (Only visible in monthly view) */}
          {viewMode === "monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto bg-white dark:bg-zinc-950 p-2 pl-4 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-w-[140px]"
            />
          )}

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm"
            />
          </div>

          <button
            onClick={exportToExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Expected Revenue</p>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Rs. {summaries.totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Paid</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">Rs. {summaries.totalPaid.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Remaining Amount</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-500 tracking-tight">Rs. {summaries.totalRemaining.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center">
            <PieChart className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sticky left-0 bg-zinc-50 dark:bg-zinc-900 z-10 shadow-[1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[1px_0_0_0_rgba(39,39,42,1)]">Student Info</th>

                {DYNAMIC_COLUMNS.map(col => (
                  <th key={col.key} className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}

                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-800">Total</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Paid</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Remaining</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right sticky right-0 bg-zinc-50 dark:bg-zinc-900 z-10 shadow-[-1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[-1px_0_0_0_rgba(39,39,42,1)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={DYNAMIC_COLUMNS.length + 5} className="py-12 text-center text-zinc-500">No bills found.</td>
                </tr>
              ) : filteredBills.map(bill => {
                const isEditing = editingId === bill.id;

                // Real-time recalculation preview for edit mode
                let previewTotal = 0;
                DYNAMIC_COLUMNS.forEach(col => {
                  previewTotal += (isEditing && col.editable) ? Number(editValues[col.key] || 0) : (bill[col.key] || 0);
                });

                const previewRemaining = Math.max(0, previewTotal - bill.paid);

                const InputField = ({ fieldKey, width = "w-20" }) => (
                  <input
                    type="number"
                    value={editValues[fieldKey]}
                    onChange={e => setEditValues(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                    className={`${width} px-2 py-1 bg-white dark:bg-zinc-900 border border-blue-500 rounded text-sm outline-none text-right font-medium`}
                  />
                );

                return (
                  <tr key={bill.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 sticky left-0 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[1px_0_0_0_rgba(39,39,42,1)] z-10">
                      <div className="font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap">{bill.student.name}</div>
                      <div className="text-xs text-zinc-500">{bill.student.rollNumber}</div>
                    </td>

                    {DYNAMIC_COLUMNS.map(col => (
                      <td key={col.key} className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {isEditing && col.editable ? (
                          <InputField fieldKey={col.key} />
                        ) : (
                          <span className={!col.editable ? "font-medium" : ""}>
                            {bill[col.key] || 0}
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="py-3 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                      {previewTotal}
                    </td>
                    <td className="py-3 px-4 text-sm text-emerald-600 dark:text-emerald-500 font-medium bg-zinc-50/50 dark:bg-zinc-900/20">
                      {bill.paid}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-amber-600 dark:text-amber-500 bg-zinc-50/50 dark:bg-zinc-900/20">
                      {previewRemaining}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right sticky right-0 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[-1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[-1px_0_0_0_rgba(39,39,42,1)] z-10">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSaveEdit(bill.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(bill)}
                            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 rounded-lg transition-colors"
                            title="Edit Bill Attributes"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPaymentModal(bill)}
                            disabled={bill.remaining === 0}
                            className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredBills.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            No bills found.
          </div>
        ) : filteredBills.map(bill => (
          <div key={bill.id} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg">{bill.student.name}</h4>
                <p className="text-zinc-500 text-sm">{bill.student.rollNumber}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                }`}>
                {bill.status}
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-zinc-100 dark:border-zinc-900 pt-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Bill</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-50">Rs. {bill.totalBill}</p>
              </div>

              <button
                onClick={() => openPaymentModal(bill)}
                disabled={bill.remaining === 0}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                Pay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal (Drawer on Mobile, Dialog on Desktop) */}
      <AnimatePresence>
        {paymentModal.isOpen && paymentModal.bill && (
          <div className="fixed inset-0 z-[100] bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-2xl w-full max-w-md shadow-2xl relative"
            >
              <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-6 mx-auto sm:hidden" />

              <button
                onClick={() => setPaymentModal({ isOpen: false, bill: null, amount: 0 })}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors hidden sm:block"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-1 tracking-tight">Process Payment</h2>
              <p className="text-zinc-500 mb-8 text-sm">
                For {paymentModal.bill.student.name} ({paymentModal.bill.student.rollNumber})
              </p>

              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">Remaining Balance</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-500">Rs. {paymentModal.bill.remaining}</span>
              </div>

              <div className="space-y-4 mb-8">
                <label className="block">
                  <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Payment Amount (Rs.)</span>
                  <input
                    type="number"
                    value={paymentModal.amount}
                    onChange={(e) => setPaymentModal(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium transition-all"
                  />
                </label>
              </div>

              <button
                onClick={handleProcessPayment}
                className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold py-4 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirm Payment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BillManagement;
