import { Calendar as CalendarIcon, Calculator, Receipt, Clock } from "lucide-react";
import MealCalendar from "./components/MealCalendar";
import BillEstimator from "./components/BillEstimator";
import ActualBills from "./components/ActualBills";

export default function MealHistoryDashboard() {
  return (
    <div className="w-full space-y-8 md:space-y-16 pb-16 md:pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
          <Clock className="w-6 h-6 md:w-8 md:h-8 text-zinc-500 dark:text-zinc-400" />
          Meal History
        </h1>
        <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-[60ch]">
          Track your daily meal consumption, estimate your upcoming bill, and view finalized invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Left Column: Calendar & Actual Bills */}
        <div className="lg:col-span-8 flex flex-col gap-16 md:gap-24">
          <section className="flex flex-col gap-6">
            <h3 className="text-sm uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Meal Calendar
            </h3>
            <div className="w-full">
              <MealCalendar />
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-sm uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-medium flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Actual Bills
            </h3>
            <ActualBills />
          </section>
        </div>

        {/* Right Column: Bill Estimator */}
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <section className="flex flex-col gap-6 p-6 rounded-2xl bg-[#fafafa] dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10">
            <h3 className="text-sm uppercase tracking-widest text-[#737373] dark:text-[#a0a0a0] font-medium flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Bill Estimator
            </h3>
            <BillEstimator />
          </section>
        </div>
      </div>
    </div>
  );
}

