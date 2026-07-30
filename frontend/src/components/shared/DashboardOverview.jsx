import { motion } from "framer-motion";
import {
  ArrowRight,
  User,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Crown,
  Activity,
  Settings,
  AlertTriangle
} from "lucide-react";
import { useMyHostel } from "../../hooks/queries/useHostelQueries";
import toast from "react-hot-toast";

export default function DashboardOverview({ userRole, user, navItems = [], setActiveTab }) {
  const { data: hostelResponse, isLoading, isError } = useMyHostel();
  const hostelData = hostelResponse?.data;
  const isExpired = hostelData?.status === 'Expired';

  // Metadata mapping to enrich the dynamic links with descriptions and colors
  const FEATURE_METADATA = {
    users: { desc: 'Add, edit, or remove user records', color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
    rooms: { desc: 'Manage hostel rooms and allocations', color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
    services: { desc: 'Manage and track facility services', color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
    bills: { desc: 'Process and issue monthly mess bills', color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
    billSummary: { desc: 'View overarching financial reports', color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
    meal: { desc: 'Configure global meal parameters', color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
    weeklyMenu: { desc: 'Update the upcoming meal schedule', color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
    menu: { desc: 'Update the upcoming meal schedule', color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
    meals: { desc: 'Choose your meals for the upcoming week', color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
    history: { desc: 'Review your past consumption and bills', color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
    info: { desc: 'View and update your personal CV & Info', color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
    attendance: { desc: 'Monitor and log student attendance', color: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400' },
    mealControl: { desc: 'Manage meal access and restrictions', color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
    live: { desc: 'Real-time counts of today\'s meals', color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
  };

  const getQuickLinks = () => {
    // 1. Filter out the dashboard itself
    const featureLinks = navItems.filter(item => item.id !== 'dashboard');

    // 2. Map metadata to the items
    const enrichedLinks = featureLinks.map(item => ({
      ...item,
      desc: FEATURE_METADATA[item.id]?.desc || `Access the ${item.label} module`,
      color: FEATURE_METADATA[item.id]?.color || 'bg-zinc-500/10 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400'
    }));

    // 3. Slice to max limits (6 for admin/manager, 4 for student)
    const maxLinks = userRole === 'student' ? 4 : 6;
    return enrichedLinks.slice(0, maxLinks);
  };

  const quickLinks = getQuickLinks();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
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
        bg: 'bg-amber-600 dark:bg-amber-700',
        icon: 'text-amber-200',
        textSoft: 'text-amber-100'
      };
    }
    if (name.includes('pro') || name.includes('standard') || name.includes('silver')) {
      return {
        bg: 'bg-zinc-900 dark:bg-zinc-800',
        icon: 'text-zinc-300',
        textSoft: 'text-zinc-400'
      };
    }
    if (name.includes('basic') || name.includes('starter')) {
      return {
        bg: 'bg-emerald-700 dark:bg-emerald-800',
        icon: 'text-emerald-200',
        textSoft: 'text-emerald-100'
      };
    }
    // Default
    return {
      bg: 'bg-blue-700 dark:bg-blue-800',
      icon: 'text-blue-200',
      textSoft: 'text-blue-100'
    };
  };

  const planStyle = hostelData?.plan ? getPlanStyle(hostelData.plan.name) : getPlanStyle('');

  return (
    <div className="w-full h-full flex flex-col gap-8 lg:p-8 pb-4">
      {isExpired && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">Subscription Expired</h3>
              <p className="text-sm font-medium text-red-700 dark:text-red-400 mt-0.5 max-w-lg">
                {userRole === 'admin'
                  ? "Your subscription has expired. Please upgrade your plan to unlock all features."
                  : "Your hostel's subscription has expired. Please ask your admin to upgrade the plan."}
              </p>
            </div>
          </div>
          {userRole === 'admin' && (
            <button
              onClick={() => toast('Please contact the Superadmin to upgrade your plan.', { icon: '📧' })}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1.5 px-4 lg:px-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
          Here's what's happening at your hostel today.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 flex-1">
        {/* Left Column: Quick Navigation */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 px-4 lg:px-0">Quick Actions</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 lg:px-0"
          >
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.button
                  key={link.id}
                  variants={itemVariants}
                  onClick={() => setActiveTab(link.id)}
                  className="group relative flex flex-col items-start p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 text-left overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-zinc-100/20 h-full"
                >
                  <div className={`p-3 rounded-xl ${link.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2">
                    {link.desc}
                  </p>

                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    Go to {link.label} <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Right Column: Information Panels */}
        <div className="xl:col-span-5 flex flex-col gap-5 px-4 lg:px-0">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Details & Status</h2>

          <div className="flex flex-col gap-4">
            {/* User Info Card */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 truncate">
                    {user?.name || 'Loading...'}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize truncate font-medium">
                    {userRole} Account
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Email</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">ID / Roll No</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{user?.id || user?.rollNumber || 'N/A'}</span>
                </div>

                {userRole === 'student' && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Room Allocation</span>
                    <span className="text-sm font-medium flex items-center gap-2">
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
                  <div key={idx} className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest truncate">{info.key}</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading / Error states for Hostel */}
            {isLoading && (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-32 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-zinc-500">Loading hostel details...</span>
                </div>
              </div>
            )}

            {isError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-red-600 dark:text-red-400 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Failed to load hostel information.</span>
              </div>
            )}

            {/* Hostel Info Card */}
            {hostelData && (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between text-zinc-900 dark:text-zinc-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-zinc-400" />
                    <h3 className="font-semibold text-lg">Hostel Details</h3>
                  </div>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setActiveTab('weeklyMenu')}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                      title="Configure Hostel"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Name</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-right">{hostelData.name}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location</span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-right">{hostelData.location}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><Activity className="w-4 h-4" /> Status</span>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${hostelData.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : hostelData.status === 'Suspended' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}>
                      {hostelData.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Info Card (Admins / Managers only) */}
            {hostelData?.plan && (userRole === 'admin' || userRole === 'manager') && (
              <div className={`${planStyle.bg} rounded-2xl p-6 flex flex-col gap-5 text-white relative overflow-hidden shadow-sm`}>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Crown className={`w-5 h-5 ${planStyle.icon}`} />
                    <h3 className="font-semibold text-lg text-white">Plan & Subscription</h3>
                  </div>
                  {hostelData.isTrial && (
                    <span className="px-2.5 py-1 bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                      Trial
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="flex flex-col gap-1.5">
                    <span className={`text-[11px] uppercase tracking-widest font-bold ${planStyle.textSoft}`}>Plan Name</span>
                    <span className="text-lg font-bold">{hostelData.plan.name}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    <span className={`text-[11px] uppercase tracking-widest font-bold ${planStyle.textSoft}`}>Capacity</span>
                    <span className="text-sm font-semibold text-right">
                      {hostelData.plan.limits?.maxStudents} Students
                    </span>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-3.5 flex justify-between items-center relative z-10 mt-1 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-medium">
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
