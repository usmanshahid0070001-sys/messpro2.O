import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileSpreadsheet,
  TrendingDown,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Calculator,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { RoiMetrics } from '../types';

// Custom Count-Up Animated Number Component
const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string; isCurrency?: boolean }> = ({
  value,
  prefix = '',
  suffix = '',
  isCurrency = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const duration = 600; // ms
    const startTime = performance.now();

    let animationFrameId: number;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startValue + (endValue - startValue) * easeOut);
      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        prevValue.current = endValue;
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return (
    <span>
      {prefix}
      {isCurrency ? displayValue.toLocaleString() : displayValue}
      {suffix}
    </span>
  );
};

// 3D Tilt Card with Cursor Follow Glow
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const rX = ((y - 50) / 50) * -4; // max 4 deg
    const rY = ((x - 50) / 50) * 4;
    setCoords({ x, y });
    setTilt({ rotateX: rX, rotateY: rY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Ambient cursor follow spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(400px circle at ${coords.x}% ${coords.y}%, rgba(225, 29, 72, 0.08), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
};

export const ProblemSection: React.FC = () => {
  const [studentCapacity, setStudentCapacity] = useState<number>(200);
  const [avgDailyMealCost, setAvgDailyMealCost] = useState<number>(350);

  const rawMetrics = useMemo(() => {
    const monthlyFoodSpend = studentCapacity * avgDailyMealCost * 30;
    const foodSavings = Math.round(monthlyFoodSpend * 0.16);
    const hours = Math.round((studentCapacity / 100) * 24);
    const disputes = Math.round((studentCapacity / 100) * 38);
    const wasteKg = Math.round((studentCapacity / 100) * 140);

    return {
      monthlySavingsVal: foodSavings,
      hoursSavedVal: hours,
      disputesPreventedVal: disputes,
      wasteReductionKgVal: wasteKg,
    };
  }, [studentCapacity, avgDailyMealCost]);

  const PAIN_POINTS = [
    {
      title: 'The Paper Register Trap',
      subtitle: 'Illegible signatures & ghost proxy meals',
      desc: 'Physical paper registers get torn, lost, and filled with fake proxy signatures. When month-end arrives, students claim they never ate those meals and refuse to pay.',
      icon: <FileSpreadsheet className="w-5 h-5 text-rose-500" />,
      tag: 'Disputed Bills',
    },
    {
      title: 'The 3-Day Calculator Nightmare',
      subtitle: 'Manual math on variable rates, fines & taxes',
      desc: 'Wardens spend sleepless weekends with calculators tallying individual diets, calculating variable daily meat/veg prices, calculating late fines, and handwriting slips.',
      icon: <Clock className="w-5 h-5 text-rose-500" />,
      tag: '100+ Hours Lost',
    },
    {
      title: 'Meal Wastage vs. Food Shortages',
      subtitle: 'Cooking blind without headcount forecasts',
      desc: 'Kitchen staff cook for 300 when only 190 show up, throwing thousands worth of groceries into the trash — or cooking too little and running out of food during peak rush.',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      tag: '15-20% Budget Burn',
    },
    {
      title: 'Room & Maintenance Blindspots',
      subtitle: 'Misplaced bed allocations & forgotten repairs',
      desc: 'No real-time visibility into which room bed is vacant, cleaning statuses are unrecorded, and student complaints on broken taps or lights get lost in paper notebooks.',
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      tag: 'Hostel Chaos',
    },
  ];

  return (
    <section id="problem" className="py-20 sm:py-28 lg:py-32 relative bg-muted/20 dark:bg-neutral-950/40 border-y border-border/60 dark:border-white/10 overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-rose-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide glass-bevel">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>The Reality of Manual Operations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            What paper registers are actually costing your hostel
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Managing hundreds of resident meals, room keys, and monthly calculations on notebooks leads to unrecoverable financial leaks, staff exhaustion, and constant student disputes.
          </p>
        </div>

        {/* 4 Friction 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAIN_POINTS.map((pain, index) => (
            <TiltCard
              key={index}
              className="p-7 sm:p-8 rounded-3xl bg-card/60 dark:bg-neutral-900/60 border border-border/70 dark:border-white/10 hover:border-rose-500/40 backdrop-blur-xl transition-colors duration-300 shadow-sm flex flex-col justify-between group glass-bevel"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    {pain.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                    {pain.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {pain.title}
                  </h3>
                  <span className="text-xs font-semibold text-muted-foreground block mt-1">
                    {pain.subtitle}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
                  {pain.desc}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* Interactive ROI & Waste Savings Calculator with Animated Count-Up */}
        <div className="rounded-3xl border border-amber-500/30 dark:border-amber-500/20 bg-card/80 dark:bg-neutral-900/80 p-7 sm:p-10 shadow-2xl backdrop-blur-2xl glass-bevel">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Calculator Inputs (Left) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  <Calculator className="w-4 h-4" />
                  <span>Savings Estimator</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Calculate what MessPro saves you every month
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjust your hostel capacity to see instant financial recovery and time reclaimed.
                </p>
              </div>

              {/* Slider 1: Capacity */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Total Hostelites / Students:</span>
                  <span className="text-primary font-black px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    {studentCapacity} Residents
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="800"
                  step="10"
                  value={studentCapacity}
                  onChange={(e) => setStudentCapacity(Number(e.target.value))}
                  className="w-full h-2.5 bg-muted/80 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>30 Students</span>
                  <span>400 Students</span>
                  <span>800+ Students</span>
                </div>
              </div>

              {/* Slider 2: Daily Meal Expense */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Average Daily Meal Spend / Resident:</span>
                  <span className="text-primary font-black px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    {avgDailyMealCost} PKR/day
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="900"
                  step="25"
                  value={avgDailyMealCost}
                  onChange={(e) => setAvgDailyMealCost(Number(e.target.value))}
                  className="w-full h-2.5 bg-muted/80 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                  <span>150 PKR</span>
                  <span>500 PKR</span>
                  <span>900 PKR</span>
                </div>
              </div>
            </div>

            {/* Calculator Results (Right) with Count-Up Animations */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              
              {/* Metric 1 */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-1.5 glass-bevel">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
                  Monthly Food Savings
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                  <AnimatedNumber value={rawMetrics.monthlySavingsVal} prefix="PKR " isCurrency />
                </span>
                <span className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 leading-tight block">
                  from waste prevention & exact portion forecasts
                </span>
              </div>

              {/* Metric 2 */}
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-left space-y-1.5 glass-bevel">
                <span className="text-[11px] font-bold text-primary block">
                  Staff Hours Saved
                </span>
                <span className="text-xl sm:text-2xl font-black text-primary tracking-tight block">
                  <AnimatedNumber value={rawMetrics.hoursSavedVal} prefix="~" suffix=" hrs/mo" />
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight block">
                  zero manual ledger book calculations
                </span>
              </div>

              {/* Metric 3 */}
              <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-left space-y-1.5 glass-bevel">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">
                  Disputes Eliminated
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight block">
                  <AnimatedNumber value={rawMetrics.disputesPreventedVal} suffix=" disputes" />
                </span>
                <span className="text-[10px] text-blue-800/80 dark:text-blue-300/80 leading-tight block">
                  verified timestamp on every meal pass
                </span>
              </div>

              {/* Metric 4 */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1.5 glass-bevel">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block">
                  Food Waste Prevented
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight block">
                  <AnimatedNumber value={rawMetrics.wasteReductionKgVal} suffix=" kg" />
                </span>
                <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-tight block">
                  saved from kitchen trash every month
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
