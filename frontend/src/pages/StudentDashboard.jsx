import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WeeklyMealSelection from '../features/student/WeeklyMealSelection';
import StudentMealHistory from '../features/student/StudentMealHistory';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'history'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Sleek Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-slate-200/50 dark:bg-[#111111] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('menu')}
          className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${
            activeTab === 'menu' 
              ? 'text-slate-900 dark:text-white' 
              : 'text-slate-500 hover:text-slate-700 dark:text-[#888888] dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'menu' && (
            <motion.div
              layoutId="student-tab-pill"
              className="absolute inset-0 bg-white dark:bg-[#222222] rounded-xl shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">Weekly Menu</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${
            activeTab === 'history' 
              ? 'text-slate-900 dark:text-white' 
              : 'text-slate-500 hover:text-slate-700 dark:text-[#888888] dark:hover:text-slate-300'
          }`}
        >
          {activeTab === 'history' && (
            <motion.div
              layoutId="student-tab-pill"
              className="absolute inset-0 bg-white dark:bg-[#222222] rounded-xl shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">Meal History & Billing</span>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'menu' ? <WeeklyMealSelection /> : <StudentMealHistory />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
