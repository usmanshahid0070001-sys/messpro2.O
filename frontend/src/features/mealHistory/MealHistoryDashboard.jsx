import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Calculator, Receipt, Clock, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import MealCalendar from "./components/MealCalendar";
import MobileMealCalendar from "./components/MobileMealCalendar";
import BillEstimator from "./components/BillEstimator";
import ActualBills from "./components/ActualBills";
import { useStudentMonthlyRecords } from "../../hooks/queries/useStudentQueries";

export default function MealHistoryDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEstimator, setShowEstimator] = useState(false);
  const monthString = format(currentDate, "yyyy-MM");

  const { data: recordsData, isLoading } = useStudentMonthlyRecords(monthString);
  const records = recordsData?.data || [];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="w-full space-y-8 md:space-y-12 pb-16 md:pb-24 max-w-[1500px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
          <Clock className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
          Meal History
        </h1>
        <p className="mt-2 text-sm md:text-base font-medium text-zinc-500 dark:text-zinc-400 max-w-[60ch]">
          Track your daily meal consumption, estimate your upcoming bill, and view finalized invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Meal Calendar
              </h3>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowEstimator(true)}
                  className="mr-auto sm:mr-4 flex items-center gap-2 px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-xl text-sm font-medium hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-sm active:scale-95"
                >
                  <Calculator className="w-4 h-4" />
                  Estimate Bill
                </button>

                <div className="text-base font-medium text-[#111111] dark:text-white hidden sm:block">
                  {format(currentDate, 'MMM yyyy')}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={prevMonth}
                    className="p-2 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#111111] dark:text-white" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
                    aria-label="Next Month"
                  >
                    <ChevronRight className="w-4 h-4 text-[#111111] dark:text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-full relative min-h-[400px]">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#111111] dark:text-white animate-spin" />
                </div>
              ) : (
                <>
                  <div className="hidden sm:block">
                    <MealCalendar currentDate={currentDate} records={records} />
                  </div>
                  <div className="block sm:hidden">
                    <MobileMealCalendar currentDate={currentDate} records={records} />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Actual Bills */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8">
          <h3 className="text-sm uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-medium flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Actual Bills
          </h3>
          <div className="bg-[#fafafa] dark:bg-[#0a0a0a] p-4 sm:p-6 rounded-xl border border-black/5 dark:border-white/5">
            <ActualBills />
          </div>
        </div>
      </div>

      {/* Estimator Modal */}
      {showEstimator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 overflow-y-auto">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl shadow-xl w-full max-w-xl border border-black/5 dark:border-white/10 my-8 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5 shrink-0">
              <h3 className="text-lg font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Bill Estimator
              </h3>
              <button 
                onClick={() => setShowEstimator(false)} 
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#737373] dark:text-[#a0a0a0]" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-black/50 dark:text-white/50" />
                </div>
              ) : (
                <BillEstimator records={records} month={format(currentDate, 'MMM yyyy')} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
