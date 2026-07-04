import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, Activity, Users, ShieldCheck, Terminal, Server, Mail, Globe, ExternalLink, Moon, Sun, Menu, CheckCircle2, Zap, Smartphone, Calculator, Check, Lock, Database } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

// ─── CONSTANTS & DATA ────────────────────────────────────────────────────────

const STATS = [
  {
    value: "300+",
    label: "Active Students",
    c: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "10k+",
    label: "Meals Tracked",
    c: "text-slate-800 dark:text-white",
  },
  { value: "0%", label: "Calc. Errors", c: "text-slate-800 dark:text-white" },
  {
    value: "24/7",
    label: "System Uptime",
    c: "text-emerald-600 dark:text-emerald-400",
  },
];

const TEAM = [
  {
    name: "Abdul Manan",
    role: "Tech Lead & Full-Stack Developer",
    bio: "Specializing in robust system architecture, complex state management, and MERN stack deployments. Led the frontend UI/UX overhaul and core application logic to ensure zero calculation errors.",
    icon: Terminal,
    accent: "#3b82f6",
    accentBg: "rgba(59,130,246,0.12)",
    socials: [
      {
        label: "LinkedIn",
        icon: Globe,
        href: "https://www.linkedin.com/in/abdul-manan-pg/",
      },
      {
        label: "Fiverr",
        icon: Globe,
        href: "https://fiverr.com/abdul_manan_001",
      },
      {
        label: "GitHub",
        icon: Globe,
        href: "https://github.com/abdul-manan-pg",
      },
    ],
  },
  {
    name: "Usman Shahid",
    role: "Backend & System Architect",
    bio: "Focused on low-level database ops, MongoDB bulk writes, and secure API infrastructure. Designed the immutable financial ledger ensuring data integrity across thousands of monthly transactions.",
    icon: Server,
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.12)",
    socials: [
      {
        label: "LinkedIn",
        icon: Globe,
        href: "https://www.linkedin.com/in/usman-shahid-661ba13ab",
      },
      { label: "Fiverr", icon: Globe, href: "https://fiverr.com/usmanshahid" },
      { label: "GitHub", icon: Globe, href: "https://github.com/UsmanDev35" },
    ],
  },
];

const ROLE_TABS = {
  admin: {
    title: "For Administrators",
    color: "blue",
    features: [
      {
        t: "Financial Analytics",
        d: "Bird's-eye view of revenue, expenditures, and per-person fuel impact.",
      },
      {
        t: "Global Fee Controls",
        d: "Adjust service charges, fines, or fuel allocations globally with instant recalculation.",
      },
      {
        t: "Automated Data Archiving",
        d: "Serverless Cron jobs clean and archive records older than 3 months automatically.",
      },
      {
        t: "Bulk Onboarding",
        d: "Upload a CSV to generate accounts. Background mailers send passwords securely.",
      },
    ],
  },
  manager: {
    title: "For Managers",
    color: "violet",
    features: [
      {
        t: "Real-Time Polling",
        d: "Live dashboards show exact daily headcounts for lunch and dinner instantly.",
      },
      {
        t: "Menu Broadcasting",
        d: "Easily update and broadcast the weekly food menu directly to student apps.",
      },
      {
        t: "Waivers & Arrears",
        d: "Manually adjust individual waivers or log bills as paid upon physical cash collection.",
      },
    ],
  },
  student: {
    title: "For Students",
    color: "emerald",
    features: [
      {
        t: "Installable PWA",
        d: "A native app-like experience available directly on iOS and Android home screens.",
      },
      {
        t: "Weekly Meal Selection",
        d: "Intuitive interface to opt-in or skip upcoming meals, reducing food waste.",
      },
      {
        t: "Live Billing Estimates",
        d: "Real-time tracking of current monthly dues, consumption, and extra charges.",
      },
    ],
  },
};

// ─── UTILITIES & SHARED ──────────────────────────────────────────────────────

const useScrollY = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollY;
};

const GlowOrb = ({
  className,
  color = "#3b82f6",
  size = 600,
  opacity = 0.15,
}) => (
  <div
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")} 0%, transparent 70%)`,
      filter: "blur(40px)",
    }}
  />
);

const FadeIn = ({ children, delay = 0, y = 30, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── MODULAR SECTIONS ────────────────────────────────────────────────────────

const LandingNavbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollY();
  const navBlur = scrollY > 20;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        navBlur
          ? "bg-white/90 dark:bg-[#060812]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/pwa-512x512.png"
            alt="MessPro Logo"
            className="w-10 h-10 object-contain drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          />
          <span className="text-2xl font-black tracking-tight font-display text-slate-900 dark:text-white">
            MessPro<span className="text-blue-500">.</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Platform", "Roles", "Tech", "Pricing"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
          </button>

          {user ? (
            <button
              onClick={() => navigate(`/${user.role}-dashboard`)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("pricing")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 transition-all"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-slate-600 dark:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100vh" }}
            exit={{ height: 0 }}
            className="md:hidden fixed inset-0 top-20 bg-white/95 dark:bg-[#060812]/95 backdrop-blur-xl overflow-hidden z-40"
          >
            <div className="p-6 flex flex-col gap-6 items-center pt-10">
              {["Platform", "Roles", "Tech", "Pricing"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-bold text-slate-800 dark:text-slate-200"
                >
                  {l}
                </a>
              ))}
              <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-2" />
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-4 h-4" /> Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-yellow-400" /> Light Mode
                  </>
                )}
              </button>

              {user ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/${user.role}-dashboard`);
                  }}
                  className="w-full py-4 bg-emerald-600 rounded-xl font-bold uppercase tracking-widest text-white shadow-lg"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold uppercase tracking-widest text-slate-800 dark:text-white"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden"
    >
      {/* Removed GlowOrbs for cleaner background */}

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto mt-10 md:mt-0"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">
            Cloud-Native SaaS
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] md:leading-[0.95] mb-6 text-slate-900 dark:text-white"
        >
          Modernizing{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-400">
            Hostel Dining
          </span>{" "}
          Management.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 font-medium px-4 leading-relaxed"
        >
          Eliminate the chaos of manual paper ledgers, token systems, and
          billing errors. Streamlined operations for institutions, transparent
          digital experiences for students.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {user ? (
            <button
              onClick={() => navigate(`/${user.role}-dashboard`)}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-black/10 dark:shadow-white/10 transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() =>
                  document
                    .getElementById("platform")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-black/10 dark:shadow-white/10 transition-all flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                Start a free trial <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                Login to your account
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

const SocialProofSection = () => (
  <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0d1c] py-12">
    <div className="max-w-6xl mx-auto px-6">
      <FadeIn>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-8">
          Trusted by Institutions Managing
        </p>
      </FadeIn>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 divide-x-0 md:divide-x divide-slate-200 dark:divide-slate-800">
        {STATS.map((stat, i) => (
          <FadeIn
            key={stat.label}
            delay={i * 0.1}
            className="text-center md:px-8"
          >
            <div
              className={`text-4xl md:text-5xl font-display font-black mb-2 ${stat.c}`}
            >
              {stat.value}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {stat.label}
            </p>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const ValuePropsSection = () => (
  <section id="platform" className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <FadeIn className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Why upgrade to MessPro?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          A modern SaaS engineered to fix the exact bottlenecks that slow down
          university hostel administration.
        </p>
      </FadeIn>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            i: Calculator,
            t: "0% Calculation Errors",
            d: "Immutable billing engine handles daily rates, surcharges, and partial payments flawlessly.",
          },
          {
            i: Smartphone,
            t: "Radical Transparency",
            d: "Live digital receipts and transparent meal histories prevent disputes with administration.",
          },
          {
            i: Activity,
            t: "Instant Scalability",
            d: "Cloud-native infrastructure handles thousands of daily transactions effortlessly.",
          },
          {
            i: Users,
            t: "Plug & Play Onboarding",
            d: "Bulk CSV uploads with automated credential generation and secure email dispatch.",
          },
        ].map((v, i) => (
          <FadeIn
            key={v.t}
            delay={i * 0.1}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:-translate-y-1 transition-transform"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <v.i className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 font-display">
              {v.t}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {v.d}
            </p>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const RoleTabsSection = () => {
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <section
      id="roles"
      className="py-24 px-6 bg-slate-50 dark:bg-[#0a0d1c] border-y border-slate-200 dark:border-slate-800"
    >
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Feature Breakdown by Role
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Strict Role-Based Access Control isolates privileges and dashboards.
          </p>
        </FadeIn>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Object.keys(ROLE_TABS).map((k) => (
            <button
              key={k}
              onClick={() => setActiveTab(k)}
              className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${activeTab === k ? `bg-${ROLE_TABS[k].color}-600 text-white shadow-lg` : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
            >
              {ROLE_TABS[k].title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {ROLE_TABS[activeTab].features.map((f, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4"
              >
                <CheckCircle2
                  className={`w-6 h-6 shrink-0 mt-0.5 text-${ROLE_TABS[activeTab].color}-500`}
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    {f.t}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.d}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

const TechStackSection = () => (
  <section id="tech" className="py-24 px-6 overflow-hidden relative">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
      <FadeIn className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-4">
          Enterprise Infrastructure
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
          Uncompromising Security.
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          You don't need to worry about servers or databases. MessPro is a fully
          managed, cloud-native platform designed to keep your institutional
          data heavily encrypted, backed up daily, and accessible with zero
          downtime.
        </p>
        <div className="space-y-5">
          {[
            {
              icon: Zap,
              color: "text-yellow-500",
              t: "Lightning Fast",
              d: "Instant data synchronization across all campus devices without lagging.",
            },
            {
              icon: ShieldCheck,
              color: "text-emerald-500",
              t: "Bank-Level Security",
              d: "Strict role-based access ensures students, managers, and admins only see what they should.",
            },
            {
              icon: Users,
              color: "text-blue-500",
              t: "Infinitely Scalable",
              d: "Designed to effortlessly grow from a single hostel to a massive multi-campus deployment.",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                className={`mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${item.color}`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-200 font-bold text-sm mb-1">
                  {item.t}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {item.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn className="flex-1 w-full relative group">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-colors pointer-events-none" />
        <div className="relative bg-white dark:bg-[#0d1117] rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-8 overflow-hidden">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Core Systems
                </h4>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Live Status
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Operational
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Guaranteed Uptime",
                value: "99.99%",
                icon: Activity,
                color: "text-blue-500",
              },
              {
                label: "Data Encryption",
                value: "AES-256",
                icon: Lock,
                color: "text-violet-500",
              },
              {
                label: "Automated Backups",
                value: "Hourly",
                icon: Database,
                color: "text-emerald-500",
              },
              {
                label: "Server Response",
                value: "< 50ms",
                icon: Zap,
                color: "text-yellow-500",
              },
            ].map((metric, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center text-center group-hover:-translate-y-1 transition-transform duration-300"
              >
                <metric.icon
                  className={`w-5 h-5 mx-auto mb-2 opacity-80 ${metric.color}`}
                />
                <p className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  {metric.value}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  </section>
);

const PricingSection = () => (
  <section
    id="pricing"
    className="py-24 px-6 bg-slate-50 dark:bg-[#0a0d1c] border-y border-slate-200 dark:border-slate-800"
  >
    <div className="max-w-7xl mx-auto">
      <FadeIn className="text-center mb-16">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-4">
          SaaS Subscription Model
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
          Transparent Pricing.
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-4">
          Start for free, then scale effortlessly as your hostel expands. No
          hidden fees.
        </p>
      </FadeIn>

      <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
        <FadeIn
          delay={0.1}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
        >
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            Free Trial
          </h3>
          <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
            Risk-free environment to test the platform and mock billing cycles.
          </p>
          <div className="text-4xl font-black text-slate-900 dark:text-white mb-6">
            $0
            <span className="text-lg text-slate-500 font-medium">/14-days</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {[
              "1 Admin Panel",
              "1 Manager Panel",
              "Up to 5 Students (For Testing)",
              "Basic Community Support",
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              document
                .getElementById("contact")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Start Free Trial
          </button>
        </FadeIn>

        <FadeIn
          delay={0.2}
          className="bg-slate-900 dark:bg-[#0d1117] border-2 border-blue-500 rounded-3xl p-8 flex flex-col relative transform lg:-translate-y-4 shadow-2xl shadow-blue-500/20 hover:-translate-y-6 transition-all duration-300"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
            Most Popular
          </div>
          <h3 className="text-xl font-black text-white mb-2">Professional</h3>
          <p className="text-sm text-slate-400 mb-6 min-h-[40px]">
            The perfect sweet spot for standard university hostels.
          </p>
          <div className="text-4xl font-black text-white mb-6">
            $100<span className="text-lg text-slate-500 font-medium">/mo</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {[
              "1 Admin Panel",
              "Multiple Manager Panels",
              "Up to 300 Students",
              "Full Analytics & Live Dashboards",
              "Standard Technical Support",
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <Check className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              document
                .getElementById("contact")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
          >
            Choose Professional
          </button>
        </FadeIn>

        <FadeIn
          delay={0.3}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
        >
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            Enterprise
          </h3>
          <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
            For massive multi-campus deployments requiring custom features.
          </p>
          <div className="text-4xl font-black text-slate-900 dark:text-white mb-6">
            Custom
            <span className="text-lg text-slate-500 font-medium">/scale</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {[
              "Unlimited Admins & Managers",
              "Scalable Student Capacity (300+)",
              "Custom Feature Development",
              "Priority 24/7 Support",
              "Dedicated Server Resources",
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              document
                .getElementById("contact")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Contact Sales
          </button>
        </FadeIn>
      </div>
    </div>
  </section>
);

const ArchitectsSection = () => (
  <section className="py-24 px-6 relative">
    <div className="max-w-5xl mx-auto">
      <FadeIn className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          Meet the Architects
        </h2>
      </FadeIn>
      <div className="grid md:grid-cols-2 gap-6">
        {TEAM.map((t, i) => (
          <FadeIn key={t.name} delay={i * 0.1}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl h-full shadow-sm hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: t.accentBg, color: t.accent }}
                >
                  <t.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-slate-900 dark:text-white">
                    {t.name}
                  </h3>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: t.accent }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {t.bio}
              </p>
              <div className="flex gap-3">
                {t.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    style={{ background: t.accentBg, color: t.accent }}
                  >
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const ContactAndFooter = () => (
  <>
    <section
      id="contact"
      className="py-24 px-6 border-t border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-900/30"
    >
      <div className="max-w-xl mx-auto text-center">
        <FadeIn>
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Request Sandbox Access
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-10">
            Contact our deployment team to set up your dedicated trial database
            and admin accounts.
          </p>
          <a
            href="mailto:messpro@university.edu"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all w-full sm:w-auto"
          >
            Email Deployment Team <ArrowRight className="w-4 h-4" />
          </a>
        </FadeIn>
      </div>
    </section>

    <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-6 bg-white dark:bg-[#060812]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <img
            src="/pwa-512x512.png"
            alt="Logo"
            className="w-6 h-6 rounded object-contain dark:drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]"
          />
          <span className="font-display font-black text-slate-900 dark:text-white">
            MessPro.
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500">
          &copy; {new Date().getFullYear()} MessPro SaaS. Developed by Abdul
          Manan & Usman Shahid.
        </p>
      </div>
    </footer>
  </>
);

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060812] text-slate-900 dark:text-white overflow-x-hidden selection:bg-blue-500/30 transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, .font-display { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        
        .noise-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025; mix-blend-mode: overlay;
        }
      `}</style>

      <div className="noise-overlay" />

      <LandingNavbar />
      <HeroSection />
      <SocialProofSection />
      <ValuePropsSection />
      <RoleTabsSection />
      <TechStackSection />
      <PricingSection />
      <ArchitectsSection />
      <ContactAndFooter />
    </div>
  );
}
