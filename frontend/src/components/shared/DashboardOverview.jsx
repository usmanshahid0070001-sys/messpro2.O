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
  LayoutDashboard,
  MapPin,
  CheckCircle2,
  Crown,
  Activity,
  Settings
} from "lucide-react";
import { useMyHostel } from "../../hooks/queries/useHostelQueries";

export default function DashboardOverview({ userRole, user, setActiveTab }) {
  const { data: hostelResponse, isLoading, isError } = useMyHostel();
  const hostelData = hostelResponse?.data;

  // Define quick links based on role
  const getQuickLinks = () => {
    switch (userRole) {
      case 'admin':
        return [
          { id: 'users', label: 'Manage Students', desc: 'Add, edit, or remove student records', icon: Users, color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
          { id: 'rooms', label: 'Residence Management', desc: 'Manage hostel rooms and allocations', icon: Building2, color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
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
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const calculateDaysLeft = (expiresAt) => {
    if (!expiresAt) return 0;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const getPlanStyle = (planName) => {
    const name = planName?.toLowerCase() || '';
    if (name.includes('premium') || name.includes('enterprise') || name.includes('gold')) {
      return {
        bg: 'from-amber-500 to-orange-600',
        icon: 'text-amber-200'
      };
    }
    if (name.includes('pro') || name.includes('standard') || name.includes('silver')) {
      return {
        bg: 'from-purple-600 to-fuchsia-700',
        icon: 'text-purple-200'
      };
    }
    if (name.includes('basic') || name.includes('starter')) {
      return {
        bg: 'from-emerald-600 to-teal-700',
        icon: 'text-emerald-200'
      };
    }
    // Default
    return {
      bg: 'from-blue-600 to-indigo-700',
      icon: 'text-blue-200'
    };
  };

  const planStyle = hostelData?.plan ? getPlanStyle(hostelData.plan.name) : getPlanStyle('');

  return (
    <div className="w-full h-full flex flex-col gap-6 lg:gap-8 lg:p-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1 px-4 lg:px-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111] dark:text-white">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-[#737373] dark:text-[#a0a0a0]">
          Here's what's happening at your hostel today.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 flex-1">
        {/* Left Column: Quick Navigation */}
        <div className="xl:col-span-7 flex flex-col gap-5">
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
                  className="group relative flex flex-col items-start p-5 bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 h-full"
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

                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Go to {link.label} <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: Information Panels */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          <h2 className="text-lg font-semibold tracking-tight text-[#111] dark:text-white">Details & Status</h2>

          <div className="flex flex-col gap-4">
            {/* User Info Card */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-[#111] dark:text-white truncate">
                    {user?.name || 'Loading...'}
                  </h3>
                  <p className="text-sm text-[#737373] dark:text-[#a0a0a0] capitalize truncate font-medium">
                    {userRole} Account
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[#737373] dark:text-[#a0a0a0] uppercase tracking-wider">Email</span>
                  <span className="text-sm text-[#111] dark:text-white truncate">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[#737373] dark:text-[#a0a0a0] uppercase tracking-wider">ID / Roll No</span>
                  <span className="text-sm text-[#111] dark:text-white truncate">{user?.id || user?.rollNumber || 'N/A'}</span>
                </div>

                {userRole === 'student' && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[#737373] dark:text-[#a0a0a0] uppercase tracking-wider">Room Allocation</span>
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      {user?.room ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Allotted</>
                      ) : (
                        <><Clock className="w-4 h-4 text-amber-500" /> Pending</>
                      )}
                    </span>
                  </div>
                )}

                {/* Additional Info */}
                {user?.additionalInfo?.map((info, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[#737373] dark:text-[#a0a0a0] uppercase tracking-wider truncate">{info.key}</span>
                    <span className="text-sm text-[#111] dark:text-white truncate">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading / Error states for Hostel */}
            {isLoading && (
              <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm h-32 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-[#737373]">Loading hostel details...</span>
                </div>
              </div>
            )}

            {isError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 shadow-sm text-red-600 dark:text-red-400 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Failed to load hostel information.</span>
              </div>
            )}

            {/* Hostel Info Card */}
            {hostelData && (
              <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between text-[#111] dark:text-white">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-lg">Hostel Details</h3>
                  </div>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setActiveTab('weeklyMenu')}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Configure Hostel"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-[#737373] dark:text-[#a0a0a0]">Name</span>
                    <span className="text-sm font-semibold text-[#111] dark:text-white text-right">{hostelData.name}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4 border-t border-black/5 dark:border-white/10 pt-4">
                    <span className="text-sm text-[#737373] dark:text-[#a0a0a0] flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location</span>
                    <span className="text-sm font-medium text-[#111] dark:text-white text-right">{hostelData.location}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4 border-t border-black/5 dark:border-white/10 pt-4">
                    <span className="text-sm text-[#737373] dark:text-[#a0a0a0] flex items-center gap-1.5"><Activity className="w-4 h-4" /> Status</span>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${hostelData.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : hostelData.status === 'Suspended' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                      {hostelData.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Info Card (Admins / Managers only) */}
            {hostelData?.plan && (userRole === 'admin' || userRole === 'manager') && (
              <div className={`bg-gradient-to-br ${planStyle.bg} rounded-2xl p-5 md:p-6 shadow-md flex flex-col gap-4 text-white relative overflow-hidden`}>
                {/* Decorative background element */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Crown className={`w-5 h-5 ${planStyle.icon}`} />
                    <h3 className="font-semibold text-lg text-white">Plan & Subscription</h3>
                  </div>
                  {hostelData.isTrial && (
                    <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                      Trial
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10 mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-blue-200 uppercase tracking-wider font-medium">Plan Name</span>
                    <span className="text-lg font-bold">{hostelData.plan.name}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs text-blue-200 uppercase tracking-wider font-medium">Capacity</span>
                    <span className="text-sm font-medium text-right">
                      {hostelData.plan.limits?.maxStudents} Students
                    </span>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 flex justify-between items-center relative z-10 mt-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className={`w-4 h-4 ${planStyle.icon}`} />
                    {hostelData.isTrial ? 'Trial ends in' : 'Subscription ends in'}
                  </div>
                  {hostelData.isTrial ? (
                    <div className="text-sm font-bold">
                      {calculateDaysLeft(hostelData.trialExpiresAt)} days
                    </div>
                  ) : (
                    <div className="text-sm font-bold">
                      {calculateDaysLeft(hostelData.subscriptionExpiresAt)} days
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
