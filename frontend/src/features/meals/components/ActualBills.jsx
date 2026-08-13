import { useState } from"react";
import { format, parseISO } from"date-fns";
import { Download, FileText, ChevronRight, X, IndianRupee, Loader2, Receipt } from"lucide-react";
import { motion, AnimatePresence } from"framer-motion";
import { useCurrentBills, useMonthlyBill } from"../../../hooks/queries/useStudentQueries";

export default function ActualBills() {
 const [selectedBill, setSelectedBill] = useState(null);
 const [view, setView] = useState("current"); //"current"|"history"
 const [historyMonth, setHistoryMonth] = useState(format(new Date(),"yyyy-MM"));

 const { data: currentBillsData, isLoading: loadingCurrent } = useCurrentBills();
 const { data: historyBillsData, isLoading: loadingHistory } = useMonthlyBill(historyMonth);

 const bills = view ==="current"? (currentBillsData?.data || []) : (historyBillsData?.data || []);
 const isLoading = view ==="current"? loadingCurrent : loadingHistory;

 const renderInvoiceModal = () => {
 if (!selectedBill) return null;
 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 dark:bg-black/60">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="bg-background rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border dark:border-white/10"
 >
 {/* Modal Header */}
 <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border dark:border-white/5">
 <h3 className="text-lg sm:text-xl font-semibold text-foreground">Invoice Details</h3>
 <button
 onClick={() => setSelectedBill(null)}
 className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
 >
 <X className="w-5 h-5 text-foreground dark:text-foreground"/>
 </button>
 </div>

 {/* Modal Body - The actual invoice view */}
 <div className="p-4 sm:p-10 overflow-y-auto">
 <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-0 mb-12 border-b border-black/10 dark:border-white/10 pb-8">
 <div>
 <h1 className="text-4xl font-medium tracking-tighter text-foreground uppercase">Invoice</h1>
 <p className="text-sm text-foreground dark:text-foreground mt-2 font-mono">{selectedBill._id}</p>
 </div>
 <div className="sm:text-right flex flex-col gap-1">
 <div className="text-sm font-medium text-foreground dark:text-foreground uppercase tracking-wider">Issue Date</div>
 <div className="text-base text-foreground font-medium">{format(parseISO(selectedBill.createdAt),'MMMM dd, yyyy')}</div>
 <div className="mt-4">
 <span className={`inline-flex items-center px-3 py-1 text-[10px] uppercase tracking-widest font-bold ${
 selectedBill.status.toLowerCase() ==='paid'
 ?"bg-background dark:bg-white text-white dark:text-black"
 :"bg-secondary text-foreground"
 }`}>
 {selectedBill.status}
 </span>
 </div>
 </div>
 </div>

 <div className="mb-12">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-black/10 dark:border-white/10 text-foreground dark:text-foreground text-xs uppercase tracking-widest">
 <th className="py-4 font-medium">Description</th>
 <th className="py-4 font-medium text-right">Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-black/5 dark:divide-white/5">
 <tr className="group">
 <td className="py-5 text-base text-foreground">Base Mess Bill</td>
 <td className="py-5 text-base text-right font-medium text-foreground tabular-nums">₹{selectedBill.baseMessBill.toFixed(2)}</td>
 </tr>
 <tr className="group">
 <td className="py-5 text-base text-foreground">Previous Unpaid Arrears</td>
 <td className="py-5 text-base text-right font-medium text-foreground tabular-nums">₹{selectedBill.previousUnpaidArrears.toFixed(2)}</td>
 </tr>
 {selectedBill.customCharges?.map((item, idx) => (
 <tr key={idx} className="group">
 <td className="py-5 text-base text-foreground">{item.name}</td>
 <td className="py-5 text-base text-right font-medium text-foreground tabular-nums">₹{item.calculatedAmount.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 <div className="flex justify-end text-foreground">
 <div className="w-full sm:w-72">
 <div className="flex justify-between items-center py-6 border-t-2 border-border dark:border-white mt-2">
 <span className="font-medium text-lg uppercase tracking-wider">Total Due</span>
 <span className="text-2xl font-semibold tabular-nums tracking-tight">₹{selectedBill.remainingBill.toFixed(2)}</span>
 </div>
 </div>
 </div>
 </div>
 
 {/* Modal Footer */}
 <div className="p-4 sm:p-6 bg-background dark:bg-background border-t border-border dark:border-white/5 flex flex-col sm:flex-row justify-end gap-3">
 <button
 onClick={() => setSelectedBill(null)}
 className="order-2 sm:order-1 w-full sm:w-auto px-4 py-2 text-sm font-medium text-foreground bg-white dark:bg-background border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-background transition-colors"
 >
 Close
 </button>
 <button className="order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-background dark:bg-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-sm">
 <Download className="w-4 h-4"/>
 Download PDF
 </button>
 </div>
 </motion.div>
 </div>
 );
 };

 return (
 <div className="flex flex-col gap-6">
 {/* Header and Toggle */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <h3 className="text-sm uppercase tracking-widest text-foreground dark:text-foreground font-medium flex items-center gap-2">
 <Receipt className="w-4 h-4"/>
 Actual Bills
 </h3>
 <div className="relative flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-border dark:border-white/5">
 <button
 onClick={() => setView("current")}
 className={`relative z-10 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
 view ==="current"
 ?"text-foreground"
 :"text-foreground dark:text-foreground hover:text-foreground dark:hover:text-white"
 }`}
 >
 {view ==="current"&& (
 <motion.div
 layoutId="activeTab"
 className="absolute inset-0 bg-white dark:bg-background rounded-lg shadow-sm"
 initial={false}
 transition={{ type:"spring", stiffness: 400, damping: 30 }}
 />
 )}
 <span className="relative z-20">Current Bills</span>
 </button>
 <button
 onClick={() => setView("history")}
 className={`relative z-10 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
 view ==="history"
 ?"text-foreground"
 :"text-foreground dark:text-foreground hover:text-foreground dark:hover:text-white"
 }`}
 >
 {view ==="history"&& (
 <motion.div
 layoutId="activeTab"
 className="absolute inset-0 bg-white dark:bg-background rounded-lg shadow-sm"
 initial={false}
 transition={{ type:"spring", stiffness: 400, damping: 30 }}
 />
 )}
 <span className="relative z-20">History</span>
 </button>
 </div>
 </div>

 <div className="bg-background p-4 sm:p-6 rounded-xl border border-border dark:border-white/5">
 {view ==="history"&& (
 <div className="flex justify-end mb-6">
 <input
 type="month"
 value={historyMonth}
 onChange={(e) => setHistoryMonth(e.target.value)}
 className="text-sm rounded-lg border border-black/10 dark:border-white/10 bg-background text-foreground px-4 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
 />
 </div>
 )}

 {isLoading ? (
 <div className="py-20 flex justify-center">
 <Loader2 className="w-6 h-6 animate-spin text-black/50 /50"/>
 </div>
 ) : bills.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
 <FileText className="w-5 h-5 text-foreground dark:text-foreground"/>
 </div>
 <h4 className="text-lg font-medium text-foreground mb-2">No finalized bills</h4>
 <p className="text-foreground dark:text-foreground max-w-sm">
 {view ==="current"
 ?"At the end of each billing cycle, your official invoice will appear here."
 :"No bills found for the selected month."}
 </p>
 </div>
 ) : (
 <div className="flex flex-col gap-6">
 {bills.map((bill) => (
 <div
 key={bill._id}
 onClick={() => setSelectedBill(bill)}
 className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 rounded-xl border border-border dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-white dark:hover:bg-background transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white outline-none"
 tabIndex={0}
 >
 <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
 <div className="text-sm font-medium text-foreground dark:text-foreground w-28">
 {format(parseISO(bill.createdAt),'MMM dd, yyyy')}
 </div>
 <div className="w-px h-10 bg-black/5 dark:bg-white/5 hidden sm:block"></div>
 <div>
 <h4 className="text-xl font-medium tracking-tight text-foreground group-hover:underline decoration-black/20 dark:decoration-white/20 underline-offset-4">
 {format(parseISO(bill.billingPeriod.endDate),'MMMM yyyy')} Invoice
 </h4>
 <p className="text-sm text-foreground dark:text-foreground mt-1 font-mono text-xs">{bill._id}</p>
 </div>
 </div>
 
 <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 mt-6 sm:mt-0 pt-6 sm:pt-0 border-t sm:border-0 border-border dark:border-white/5">
 <div className="text-left sm:text-right">
 <div className="font-medium text-2xl tracking-tight text-foreground tabular-nums">
 ₹{bill.total.toFixed(2)}
 </div>
 <div className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${
 bill.status.toLowerCase() ==='paid'
 ?"text-green-600 dark:text-green-400"
 : bill.status.toLowerCase() ==='unpaid'
 ?"text-red-600 dark:text-red-400"
 :"text-amber-600 dark:text-amber-400"
 }`}>
 {bill.status}
 </div>
 </div>
 <div className="w-12 h-12 rounded-full bg-card shadow-sm border border-border dark:border-white/5 flex items-center justify-center group-hover:scale-105 group-hover:bg-background group-hover:border-border dark:group-hover:bg-white dark:group-hover:border-white transition-all">
 <ChevronRight className="w-5 h-5 text-foreground group-hover:text-white dark:group-hover:text-black transition-colors"/>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <AnimatePresence>
 {selectedBill && renderInvoiceModal()}
 </AnimatePresence>
 </div>
 );
}
