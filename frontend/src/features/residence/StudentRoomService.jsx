import React, { useMemo } from 'react';
import {
    Home,
    Users,
    Sparkles,
    AlertCircle,
    BedDouble,
    CalendarCheck,
    CalendarDays,
    CheckCircle2,
    Loader2,
    UserRound,
} from 'lucide-react';
import { motion } from 'framer-motion';
import SectionCard from '../../features/ui/SectionCard';
import { useMyRoom } from '../../hooks/queries/useResidenceQueries';
import { useMarkRoomCleaning } from '../../hooks/mutations/useResidenceMutations';
import { useMyHostel } from '../../hooks/queries/useHostelQueries';

// Shared entrance animation — one orchestrated stagger instead of scattered effects.
const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
};

function relativeDayLabel(dateStr) {
    const date = new Date(dateStr);
    const startOf = (d) => {
        const c = new Date(d);
        c.setHours(0, 0, 0, 0);
        return c.getTime();
    };
    const today = startOf(new Date());
    const day = startOf(date);
    const diffDays = Math.round((today - day) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function StudentRoomService() {
    const { data: response, isLoading, isError } = useMyRoom();
    const markCleaningMutation = useMarkRoomCleaning();

    const { data: hostelResponse } = useMyHostel();
    const enabledFeatures = hostelResponse?.data?.plan?.features || [];

    const hasServiceManagement = enabledFeatures.some(
        (f) => (f.name === 'Service Management' || f.name === 'Room Service') && f.isEnabled
    );

    const room = response?.data;

    // Check if cleaned today
    const alreadyMarkedToday = useMemo(() => {
        if (!room?.cleaningDates?.length) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return room.cleaningDates.some((dateString) => {
            const markDate = new Date(dateString);
            markDate.setHours(0, 0, 0, 0);
            return markDate.getTime() === today.getTime();
        });
    }, [room?.cleaningDates]);

    // A quiet streak count gives the cleaning card something to be proud of,
    // beyond a flat list of dates.
    const cleaningStreak = useMemo(() => {
        if (!room?.cleaningDates?.length) return 0;
        const days = new Set(
            room.cleaningDates.map((d) => {
                const c = new Date(d);
                c.setHours(0, 0, 0, 0);
                return c.getTime();
            })
        );
        let streak = 0;
        const cursor = new Date();
        cursor.setHours(0, 0, 0, 0);
        // If today isn't marked yet, streak counts from yesterday backward.
        if (!days.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 1);
        while (days.has(cursor.getTime())) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }
        return streak;
    }, [room?.cleaningDates]);

    if (isLoading) {
        return (
            <div className="space-y-6 w-full">
                <div className="h-8 w-56 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[0, 1].map((i) => (
                        <SectionCard key={i}>
                            <div className="p-6 space-y-4">
                                <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                                <div className="h-24 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl animate-pulse" />
                                <div className="h-24 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl animate-pulse" />
                            </div>
                        </SectionCard>
                    ))}
                </div>
            </div>
        );
    }

    // Handle 404 (Not allotted)
    if (isError || !room) {
        return (
            <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.3 }}>
                <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl shrink-0">
                        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-orange-900 dark:text-orange-300">No room assigned yet</h3>
                        <p className="text-sm text-orange-700 dark:text-orange-400/80 mt-1.5 leading-relaxed">
                            You'll see your room, roommates, and services here as soon as one is assigned. Contact your
                            hostel admin or warden if you're expecting a room and don't have one yet.
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const roommates = room.roommates || [];
    const occupancyRatio = room.capacity ? Math.min(room.occupants / room.capacity, 1) : 0;

    return (
        <motion.div
            className="space-y-6 flex flex-col w-full"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
            {/* Header */}
            <motion.div variants={fadeUp} transition={{ duration: 0.3 }}>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                    <Home className="w-6 h-6 text-indigo-500" aria-hidden="true" />
                    My Room
                </h1>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                    {room.roomName} · your roommates and room services, in one place.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Room Info Card */}
                <motion.div variants={fadeUp} transition={{ duration: 0.3 }}>
                    <SectionCard>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                                    <BedDouble className="w-5 h-5" aria-hidden="true" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Room information</h2>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
                                    <span className="text-sm font-medium text-zinc-500">Room name</span>
                                    <span className="text-base font-black text-zinc-900 dark:text-zinc-50">{room.roomName}</span>
                                </div>

                                <div className="pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-zinc-500">Occupancy</span>
                                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                            {room.occupants} of {room.capacity} beds
                                        </span>
                                    </div>
                                    <div
                                        className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden"
                                        role="progressbar"
                                        aria-valuenow={room.occupants}
                                        aria-valuemin={0}
                                        aria-valuemax={room.capacity}
                                        aria-label="Room occupancy"
                                    >
                                        <motion.div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${occupancyRatio * 100}%` }}
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-500">Status</span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">
                                        {room.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </motion.div>

                {/* Roommates Card */}
                <motion.div variants={fadeUp} transition={{ duration: 0.3 }}>
                    <SectionCard>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <Users className="w-5 h-5" aria-hidden="true" />
                                </div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                    Roommates <span className="text-zinc-400 font-semibold">({roommates.length})</span>
                                </h2>
                            </div>

                            <div className="space-y-2">
                                {roommates.map((rm, idx) => (
                                    <div
                                        key={rm._id || idx}
                                        className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl transition-colors hover:border-zinc-200 dark:hover:border-zinc-700"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                                            {rm.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none truncate">
                                                {rm.name}
                                            </p>
                                            <p className="text-[12px] font-medium text-zinc-500 mt-1">{rm.id || 'No ID on file'}</p>
                                        </div>
                                    </div>
                                ))}

                                {roommates.length === 0 && (
                                    <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                        <UserRound className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" aria-hidden="true" />
                                        <p className="text-sm text-zinc-500">No roommates yet — this room is all yours for now.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SectionCard>
                </motion.div>

                {/* Cleaning/Services Card (Only if feature enabled) */}
                {hasServiceManagement && (
                    <motion.div variants={fadeUp} transition={{ duration: 0.3 }} className="lg:col-span-2">
                        <SectionCard>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400">
                                            <Sparkles className="w-5 h-5" aria-hidden="true" />
                                        </div>
                                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Room cleaning</h2>
                                    </div>
                                    {cleaningStreak > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                            {cleaningStreak}-day streak
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Mark cleaning section */}
                                    <div className="flex-1">
                                        <div
                                            className={`rounded-2xl p-6 text-center border transition-colors ${
                                                alreadyMarkedToday
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                                                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                                            }`}
                                        >
                                            {alreadyMarkedToday ? (
                                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
                                            ) : (
                                                <CalendarCheck className="w-12 h-12 text-zinc-400 mx-auto mb-4" aria-hidden="true" />
                                            )}
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                                {alreadyMarkedToday ? "Marked for today" : "Mark today's cleaning"}
                                            </h3>
                                            <p className="text-sm text-zinc-500 mb-6">
                                                {alreadyMarkedToday
                                                    ? "Thanks — today's cleaning is on record. Come back tomorrow to mark it again."
                                                    : 'Did the cleaning staff clean your room today? Mark it so there\'s a record.'}
                                            </p>
                                            <button
                                                onClick={() => markCleaningMutation.mutate()}
                                                disabled={alreadyMarkedToday || markCleaningMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                                            >
                                                {markCleaningMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                                        Marking…
                                                    </>
                                                ) : alreadyMarkedToday ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                                        Marked as cleaned
                                                    </>
                                                ) : (
                                                    'Mark as cleaned'
                                                )}
                                            </button>
                                            {markCleaningMutation.isError && (
                                                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-3">
                                                    Couldn't save that — check your connection and try again.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent cleanings list */}
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4 uppercase tracking-wider">
                                            Recent cleanings
                                        </h3>
                                        {room.cleaningDates && room.cleaningDates.length > 0 ? (
                                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                                {[...room.cleaningDates]
                                                    .reverse()
                                                    .slice(0, 15)
                                                    .map((dateStr, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg"
                                                        >
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                                {relativeDayLabel(dateStr)}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                                                                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                                Cleaned
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                                                <CalendarDays className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" aria-hidden="true" />
                                                <p className="text-sm text-zinc-500">
                                                    No cleanings marked yet. Once you mark one, it'll show up here.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}