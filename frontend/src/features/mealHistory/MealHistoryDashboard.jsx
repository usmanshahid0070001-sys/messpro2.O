import { Calendar as CalendarIcon, Calculator, Receipt } from "lucide-react";
import MealCalendar from "./components/MealCalendar";
import BillEstimator from "./components/BillEstimator";
import ActualBills from "./components/ActualBills";

export default function MealHistoryDashboard() {
  return (
    <div className="w-full space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-8">
      {/* Header */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[#111111] dark:text-white">Meal History & Billing</h2>
        <p className="text-xs sm:text-sm text-[#737373] dark:text-[#a0a0a0] mt-1">Track your daily meals, estimate costs, and view finalized invoices.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Calendar & Actual Bills */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8 min-w-0">
          <section className="card p-3 sm:p-6 flex flex-col">
            <h3 className="text-base sm:text-lg font-medium text-[#111111] dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#737373] dark:text-[#a0a0a0]" />
              Meal Calendar
            </h3>
            <div className="w-full">
              <MealCalendar />
            </div>
          </section>

          <section className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-[#111111] dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#737373] dark:text-[#a0a0a0]" />
              Actual Bills
            </h3>
            <ActualBills />
          </section>
        </div>

        {/* Right Column: Bill Estimator */}
        <div className="xl:col-span-1 sticky top-6">
          <section className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-[#111111] dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#737373] dark:text-[#a0a0a0]" />
              Bill Estimator
            </h3>
            <BillEstimator />
          </section>
        </div>
      </div>
    </div>
  );
}

