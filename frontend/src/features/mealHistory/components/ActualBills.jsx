import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Download, FileText, ChevronRight, X, IndianRupee } from "lucide-react";
import { mockBills } from "../data/mockData";
import { motion, AnimatePresence } from "framer-motion";

export default function ActualBills() {
  const [selectedBill, setSelectedBill] = useState(null);

  const renderInvoiceModal = () => {
    if (!selectedBill) return null;
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/40 dark:bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-black/5 dark:border-white/10"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-black/5 dark:border-white/5">
            <h3 className="text-lg sm:text-xl font-semibold text-[#111111] dark:text-white">Invoice Details</h3>
            <button
              onClick={() => setSelectedBill(null)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#737373] dark:text-[#a0a0a0]" />
            </button>
          </div>

          {/* Modal Body - The actual invoice view */}
          <div className="p-4 sm:p-8 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 mb-8 sm:mb-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-white tracking-tight">INVOICE</h1>
                <p className="text-sm sm:text-base text-[#737373] dark:text-[#a0a0a0] mt-1">{selectedBill.id}</p>
              </div>
              <div className="sm:text-right">
                <div className="text-sm font-medium text-[#111111] dark:text-white">Issue Date</div>
                <div className="text-sm text-[#737373] dark:text-[#a0a0a0]">{format(parseISO(selectedBill.date), 'MMMM dd, yyyy')}</div>
                <div className="mt-3 sm:mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400">
                    {selectedBill.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-black/5 dark:border-white/10 rounded-lg mb-6 sm:mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10 text-[#404040] dark:text-[#d4d4d4] font-medium">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Description</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {selectedBill.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-[#111111] dark:text-white">{item.name}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[#737373] dark:text-[#a0a0a0]">₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end text-[#111111] dark:text-white">
              <div className="w-full sm:w-64">
                <div className="flex justify-between items-center py-3 border-b border-black/5 dark:border-white/10">
                  <span className="text-sm text-[#737373] dark:text-[#a0a0a0]">Subtotal</span>
                  <span className="font-medium">₹{selectedBill.items.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="font-semibold text-base sm:text-lg">Total Due</span>
                  <span className="text-lg sm:text-xl font-bold">₹{selectedBill.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="p-4 sm:p-6 bg-[#fafafa] dark:bg-[#111111] border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => setSelectedBill(null)}
              className="order-2 sm:order-1 w-full sm:w-auto px-4 py-2 text-sm font-medium text-[#111111] dark:text-white bg-white dark:bg-[#222] border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-[#333] transition-colors"
            >
              Close
            </button>
            <button className="order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#111111] dark:bg-white dark:text-black rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div>
      {mockBills.length === 0 ? (
        <div className="text-center py-10 sm:py-12 border border-dashed border-black/10 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5">
          <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#a3a3a3] dark:text-[#737373] mx-auto mb-3" />
          <h4 className="text-[#111111] dark:text-white font-medium text-sm sm:text-base">No bills yet</h4>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-[#a0a0a0] mt-1">Your generated invoices will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {mockBills.map((bill) => (
            <div
              key={bill.id}
              onClick={() => setSelectedBill(bill)}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 sm:gap-0 border border-black/5 dark:border-white/5 rounded-xl hover:bg-[#fafafa] dark:hover:bg-white/5 cursor-pointer transition-all bg-white dark:bg-transparent group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-lg group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#737373] dark:text-[#a0a0a0]" />
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-[#111111] dark:text-white">{format(parseISO(bill.date), 'MMMM yyyy')}</h4>
                  <p className="text-xs sm:text-sm text-[#737373] dark:text-[#a0a0a0] mt-0.5">{bill.id} · {format(parseISO(bill.date), 'MMM dd')}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 border-black/5 dark:border-white/5 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <div className="font-semibold text-sm sm:text-base text-[#111111] dark:text-white flex items-center justify-start sm:justify-end">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                    {bill.total.toFixed(2)}
                  </div>
                  <div className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400 mt-1 sm:mt-0.5 bg-green-50 dark:bg-green-500/10 inline-block px-2 py-0.5 rounded">
                    {bill.status}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#a3a3a3] dark:text-[#737373] group-hover:text-[#737373] dark:group-hover:text-[#a0a0a0] transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedBill && renderInvoiceModal()}
      </AnimatePresence>
    </div>
  );
}
