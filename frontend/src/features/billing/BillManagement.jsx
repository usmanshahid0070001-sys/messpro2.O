import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Check,
  X,
  CreditCard,
  DollarSign,
  PieChart,
  Activity,
  Download,
  FileText,
  Edit2,
  Save
} from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { useAdminBillSummary, usePayBill, useUpdateBill } from '../../hooks/queries/useAdminQueries';

const BillManagement = () => {
  // Controls
  const [viewMode, setViewMode] = useState("current"); // "current" | "monthly"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from API
  const { data: billsResponse, isLoading } = useAdminBillSummary(
    viewMode === 'monthly' ? selectedMonth : null,
    null
  );
  const rawBills = billsResponse?.data || [];

  const payBillMutation = usePayBill();
  const updateBillMutation = useUpdateBill();

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, bill: null, amount: 0 });

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Filter bills
  const filteredBills = useMemo(() => {
    return rawBills.filter(b => {
      const matchesMode = true; // The backend now handles the correct month for both 'current' and 'monthly' modes

      const name = b.studentId?.name || "Guest";
      const roll = b.rollNumber || b.studentId?.id || "";

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roll.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesMode && matchesSearch;
    });
  }, [rawBills, viewMode, searchQuery]);

  // Summaries
  const summaries = useMemo(() => {
    return filteredBills.reduce((acc, curr) => {
      acc.totalRevenue += curr.total;
      acc.totalPaid += curr.paidBill;
      acc.totalRemaining += curr.remainingBill;
      return acc;
    }, { totalRevenue: 0, totalPaid: 0, totalRemaining: 0 });
  }, [filteredBills]);

  // Dynamic columns from real data
  const dynamicColumns = useMemo(() => {
    const names = new Set();
    rawBills.forEach(b => {
      b.customCharges?.forEach(c => names.add(c.name));
    });
    return Array.from(names).map(name => ({ key: name, label: name }));
  }, [rawBills]);

  // Actions
  const openPaymentModal = (bill) => {
    setPaymentModal({ isOpen: true, bill, amount: bill.remainingBill });
  };

  const handleProcessPayment = () => {
    const { bill, amount } = paymentModal;
    const paymentAmount = Number(amount);

    if (paymentAmount <= 0 || paymentAmount > bill.remainingBill) {
      toast.error('Enter a valid amount up to the remaining balance');
      return;
    }

    payBillMutation.mutate({ billId: bill._id, amount: paymentAmount }, {
      onSuccess: () => {
        toast.success(`Payment of Rs. ${paymentAmount} processed!`);
        setPaymentModal({ isOpen: false, bill: null, amount: 0 });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to process payment');
      }
    });
  };

  const exportToExcel = () => {
    const dataToExport = filteredBills.map(b => {
      const row = {
        'Name': b.studentId?.name || 'Guest',
        'Roll Number': b.rollNumber,
        'Base Mess Bill': b.baseMessBill,
        'Previous Arrears': b.previousUnpaidArrears,
      };

      dynamicColumns.forEach(col => {
        row[col.label] = b.customCharges?.find(c => c.name === col.key)?.calculatedAmount || 0;
      });

      row['Total Bill'] = b.total;
      row['Paid'] = b.paidBill;
      row['Remaining'] = b.remainingBill;
      row['Status'] = b.status;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bills');
    XLSX.writeFile(workbook, `Bills_Export_${viewMode === 'monthly' ? selectedMonth : 'Current'}.xlsx`);
  };

  const startEditing = (bill) => {
    setEditingId(bill._id);
    const initialValues = {};
    dynamicColumns.forEach(col => {
      const charge = bill.customCharges?.find(c => c.name === col.key);
      initialValues[col.key] = charge ? charge.calculatedAmount : 0;
    });
    setEditValues(initialValues);
  };

  const handleEditChange = (key, value) => {
    setEditValues(prev => ({ ...prev, [key]: Number(value) }));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = (bill) => {
    const updatedCustomCharges = dynamicColumns.map(col => {
      const existingCharge = bill.customCharges?.find(c => c.name === col.key);
      return {
        name: col.key,
        chargeType: existingCharge?.chargeType || 'addition',
        target: existingCharge?.target || 'mess_bill',
        calculatedAmount: editValues[col.key] || 0
      };
    });

    updateBillMutation.mutate({ billId: bill._id, customCharges: updatedCustomCharges }, {
      onSuccess: () => {
        setEditingId(null);
        setEditValues({});
      }
    });
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
            Manage, review, and collect payments for generated bills.
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
              Monthly Archive
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

      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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

                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Mess Bill</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Prev Arrears</th>

                    {dynamicColumns.map(col => (
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
                      <td colSpan={dynamicColumns.length + 8} className="py-12 text-center text-zinc-500">No bills found for the selected criteria.</td>
                    </tr>
                  ) : filteredBills.map(bill => {
                    const name = bill.studentId?.name || "Guest";
                    const roll = bill.rollNumber;
                    return (
                      <tr key={bill._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4 sticky left-0 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[1px_0_0_0_rgba(39,39,42,1)] z-10">
                          <div className="font-bold text-zinc-900 dark:text-zinc-50 whitespace-nowrap flex items-center gap-2">
                            {name} {bill.isGuest && <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] text-zinc-500">GUEST</span>}
                          </div>
                          <div className="text-xs text-zinc-500">{roll}</div>
                        </td>

                        <td className="py-3 px-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">{bill.baseMessBill}</td>
                        <td className="py-3 px-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">{bill.previousUnpaidArrears}</td>

                        {dynamicColumns.map(col => {
                          const charge = bill.customCharges?.find(c => c.name === col.key);
                          const isEditing = editingId === bill._id;
                          return (
                            <td key={col.key} className="py-3 px-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editValues[col.key] || 0}
                                  onChange={(e) => handleEditChange(col.key, e.target.value)}
                                  className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              ) : (
                                charge ? charge.calculatedAmount : 0
                              )}
                            </td>
                          );
                        })}

                        {(() => {
                          const isEditing = editingId === bill._id;
                          let currentTotal = bill.total;
                          let currentRemaining = bill.remainingBill;

                          if (isEditing) {
                            const newTotalCustomCharges = dynamicColumns.reduce((sum, col) => sum + (editValues[col.key] || 0), 0);
                            currentTotal = bill.baseMessBill + bill.previousUnpaidArrears + newTotalCustomCharges;
                            currentRemaining = currentTotal - bill.paidBill;
                          }

                          return (
                            <>
                              <td className="py-3 px-4 text-sm font-bold text-zinc-900 dark:text-zinc-50 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                                {currentTotal}
                              </td>
                              <td className="py-3 px-4 text-sm text-emerald-600 dark:text-emerald-500 font-bold bg-zinc-50/50 dark:bg-zinc-900/20">
                                {bill.paidBill}
                              </td>
                              <td className="py-3 px-4 text-sm font-bold text-amber-600 dark:text-amber-500 bg-zinc-50/50 dark:bg-zinc-900/20">
                                {currentRemaining}
                              </td>
                            </>
                          );
                        })()}

                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                              'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                            }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right sticky right-0 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 shadow-[-1px_0_0_0_rgba(228,228,231,1)] dark:shadow-[-1px_0_0_0_rgba(39,39,42,1)] z-10">
                          {editingId === bill._id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => saveEdit(bill)}
                                disabled={updateBillMutation.isPending}
                                className="p-1.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                              >
                                {updateBillMutation.isPending ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={updateBillMutation.isPending}
                                className="p-1.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEditing(bill)}
                                className="p-1.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openPaymentModal(bill)}
                                disabled={bill.remainingBill === 0 || payBillMutation.isPending}
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
            ) : filteredBills.map(bill => {
              const name = bill.studentId?.name || "Guest";
              const roll = bill.rollNumber;
              return (
                <div key={bill._id} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-lg flex items-center gap-2">
                        {name} {bill.isGuest && <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] text-zinc-500">GUEST</span>}
                      </h4>
                      <p className="text-zinc-500 text-sm">{roll}</p>
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
                      <p className="font-bold text-zinc-900 dark:text-zinc-50">Rs. {bill.total}</p>
                    </div>

                    <button
                      onClick={() => openPaymentModal(bill)}
                      disabled={bill.remainingBill === 0 || payBillMutation.isPending}
                      className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-sm font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2 active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Payment Modal */}
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
                For {paymentModal.bill.studentId?.name || "Guest"} ({paymentModal.bill.rollNumber})
              </p>

              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6 flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium text-sm">Remaining Balance</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-500">Rs. {paymentModal.bill.remainingBill}</span>
              </div>

              <div className="space-y-4 mb-8">
                <label className="block">
                  <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Payment Amount (Rs.)</span>
                  <input
                    type="number"
                    value={paymentModal.amount}
                    onChange={(e) => setPaymentModal(prev => ({ ...prev, amount: e.target.value }))}
                    max={paymentModal.bill.remainingBill}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium transition-all"
                  />
                </label>
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={payBillMutation.isPending}
                className="w-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold py-4 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {payBillMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-5 h-5" />
                )}
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
