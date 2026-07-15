import { motion } from "framer-motion";
import { 
  ArrowRight, 
  User, 
  Mail, 
  Hash, 
  Building2, 
  Calendar,
  Users,
  FileText,
  Calculator,
  Clock,
  ShieldCheck,
  Utensils,
  CreditCard,
  LayoutDashboard
} from "lucide-react";

export default function DashboardOverview({ userRole, user, setActiveTab }) {
  
  // Define quick links based on role
  const getQuickLinks = () => {
    switch(userRole) {
      case 'admin':
        return [
          { id: 'users', label: 'Manage Students', desc: 'Add, edit, or remove student records', icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
          { id: 'bills', label: 'Generate Bills', desc: 'Process and issue monthly mess bills', icon: Calculator, color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
          { id: 'billSummary', label: 'Bill Summary', desc: 'View overarching financial reports', icon: FileText, color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
          { id: 'settings', label: 'Meal Timings', desc: 'Configure global meal parameters', icon: Clock, color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
        ];
      case 'manager':
        return [
          { id: 'overview', label: 'Live Counts', desc: 'Monitor real-time meal attendance', icon: LayoutDashboard, color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
          { id: 'menu', label: 'Weekly Menu', desc: 'Update the upcoming meal schedule', icon: Utensils, color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
          { id: 'bills', label: 'Bill Management', desc: 'Handle student payments and dues', icon: CreditCard, color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
        ];
      case 'student':
        return [
          { id: 'meals', label: 'Meal Selection', desc: 'Choose your meals for the upcoming week', icon: Utensils, color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
          { id: 'history', label: 'Meal History', desc: 'Review your past consumption and bills', icon: Clock, color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
        ];
      default:
        return [];
    }
  };

  const quickLinks = getQuickLinks();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 lg:gap-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111] dark:text-white">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-[#737373] dark:text-[#a0a0a0]">
          Here's what's happening at your hostel today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Quick Navigation */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <h2 className="text-lg font-semibold tracking-tight text-[#111] dark:text-white">Quick Actions</h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.button
                  key={link.id}
                  variants={itemVariants}
                  onClick={() => setActiveTab(link.id)}
                  className="group relative flex flex-col items-start p-5 bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20"
                >
                  <div className={`p-3 rounded-xl ${link.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-[#111] dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-sm text-[#737373] dark:text-[#a0a0a0] mb-6 line-clamp-2">
                    {link.desc}
                  </p>
                  
                  <div className="mt-auto flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Go to {link.label} <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: Information Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <h2 className="text-lg font-semibold tracking-tight text-[#111] dark:text-white">Profile Details</h2>
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            
            {/* User Info Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-[#737373] dark:text-[#a0a0a0]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#111] dark:text-white truncate">
                    {user?.name || 'Loading...'}
                  </h3>
                  <p className="text-sm text-[#737373] dark:text-[#a0a0a0] capitalize truncate">
                    {userRole} Account
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-[#737373] dark:text-[#a0a0a0] shrink-0" />
                  <span className="text-[#111] dark:text-white truncate">{user?.email || 'N/A'}</span>
                </div>
                {(userRole === 'student' || user?.rollNumber) && (
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="w-4 h-4 text-[#737373] dark:text-[#a0a0a0] shrink-0" />
                    <span className="text-[#111] dark:text-white truncate">
                      {user?.rollNumber || 'No Roll Number'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hostel Info Section */}
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="font-medium text-sm text-[#737373] dark:text-[#a0a0a0] flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Hostel Information
              </h4>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#737373] dark:text-[#a0a0a0]">Name</span>
                  <span className="font-medium text-[#111] dark:text-white truncate max-w-[140px]">
                    {user?.hostelName || 'Not Assigned'}
                  </span>
                </div>
                {(userRole === 'admin' || userRole === 'manager') && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#737373] dark:text-[#a0a0a0]">Subscription</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-[#737373] dark:text-[#a0a0a0] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Since
                  </span>
                  <span className="font-medium text-[#111] dark:text-white">
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
