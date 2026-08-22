import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  Calendar,
  Utensils,
  Search,
  Save,
  UserPlus,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Users,
  Plus,
  Minus,
  Sparkles,
  Building2,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

import { useGetMealSchedule } from '@/hooks/queries/useMealQueries';
import { useGetUsers, type ManageableUser } from '@/hooks/queries/useUserQueries';
import {
  useGetAttendance,
  type AttendanceRecord,
} from '@/hooks/queries/useAttendanceQueries';
import { useSaveAttendance } from '@/hooks/mutations/useAttendanceMutations';
import { Skeleton } from '@/components/ui/skeleton';

interface LocalGuest {
  rollNumber: string;
  name: string;
  count: number;
}

export default function ManualAttendancePage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // ── Date & Meal Selection State ──────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const [selectedMealId, setSelectedMealId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── Draft & Changes State ────────────────────────────────────────────────
  // Key: rollNumber, Value: eaten count
  const [draftAttendance, setDraftAttendance] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // ── Guest Entry State ────────────────────────────────────────────────────
  const [guestRollNumber, setGuestRollNumber] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [guests, setGuests] = useState<LocalGuest[]>([]);
  const [isAddingGuest, setIsAddingGuest] = useState<boolean>(false);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: scheduleData, isLoading: mealsLoading } = useGetMealSchedule();
  const { data: allUsers = [], isLoading: usersLoading } = useGetUsers();

  // Compute weekday for selected date
  const todayName = useMemo(() => {
    if (!selectedDate) return 'Monday';
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' }) as
      | 'Monday'
      | 'Tuesday'
      | 'Wednesday'
      | 'Thursday'
      | 'Friday'
      | 'Saturday'
      | 'Sunday';
  }, [selectedDate]);

  // Derive today's available meals from schedule
  const todaysMeals = useMemo(() => {
    if (!scheduleData || !scheduleData.menu || !scheduleData.mealNames) return [];
    const dayMenu = scheduleData.menu[todayName] || [];

    return scheduleData.mealNames.map((mealName, index) => {
      const item = dayMenu[index];
      return {
        _id: index.toString(),
        type: mealName,
        name: item?.meal && item.meal !== 'none' ? item.meal : 'Standard Meal',
        price: item?.price ?? 0,
      };
    });
  }, [scheduleData, todayName]);

  // Auto-select first meal if not selected yet
  useEffect(() => {
    if (todaysMeals.length > 0 && !selectedMealId) {
      setSelectedMealId(todaysMeals[0]._id);
    }
  }, [todaysMeals, selectedMealId]);

  const selectedMeal = useMemo(() => {
    return todaysMeals.find((m) => m._id === selectedMealId);
  }, [todaysMeals, selectedMealId]);

  // ── Attendance Query ─────────────────────────────────────────────────────
  const {
    data: serverAttendance = [],
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
  } = useGetAttendance(user?.hostelId, selectedDate, selectedMeal?.type);

  const saveAttendanceMutation = useSaveAttendance();

  // Reset drafts on date or meal type change
  useEffect(() => {
    setGuests([]);
    setDraftAttendance({});
    setHasUnsavedChanges(false);
  }, [selectedDate, selectedMealId]);

  // Sync server data into draft
  const loadFromServer = () => {
    if (!serverAttendance) return;
    const newDraft: Record<string, number> = {};
    const newGuests: LocalGuest[] = [];

    const enrolledStudents = allUsers.filter((u) => u.role === 'student');

    serverAttendance.forEach((att: AttendanceRecord) => {
      newDraft[att.rollNumber] = att.attendance?.count ?? 0;
      if (att.isGuest) {
        const isEnrolled = enrolledStudents.some((s) => s.id === att.rollNumber);
        if (!isEnrolled) {
          newGuests.push({
            rollNumber: att.rollNumber,
            name: att.studentId?.name || 'External / Guest',
            count: att.attendance?.count ?? 0,
          });
        }
      }
    });

    setDraftAttendance(newDraft);
    setGuests(newGuests);
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    if (serverAttendance && !attendanceFetching) {
      if (hasUnsavedChanges) return; // protect active edits
      loadFromServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverAttendance, attendanceFetching, allUsers]);

  // ── Merged Students List ─────────────────────────────────────────────────
  const mergedStudentsList = useMemo(() => {
    const studentsOnly = allUsers.filter((u) => u.role === 'student');

    return studentsOnly.map((student: ManageableUser) => {
      const studentRoll = student.id || student._id;
      const serverAtt = serverAttendance.find((a) => a.rollNumber === studentRoll);

      const count =
        draftAttendance[studentRoll] !== undefined
          ? draftAttendance[studentRoll]
          : serverAtt?.attendance?.count ?? 0;

      const reservedCount = serverAtt?.selection?.count ?? 0;

      return {
        ...student,
        rollNumber: studentRoll,
        count,
        reservedCount,
      };
    });
  }, [allUsers, draftAttendance, serverAttendance]);

  // Search filtering
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return mergedStudentsList;

    return mergedStudentsList.filter((s) => {
      const nameMatch = s.name?.toLowerCase().includes(query);
      const rollMatch = s.rollNumber?.toLowerCase().includes(query);
      const roomMatch = s.room?.roomName?.toLowerCase().includes(query);
      return nameMatch || rollMatch || roomMatch;
    });
  }, [mergedStudentsList, searchQuery]);

  // Merged guests
  const mergedGuestsList = useMemo(() => {
    return guests.map((g) => ({
      ...g,
      count: draftAttendance[g.rollNumber] !== undefined ? draftAttendance[g.rollNumber] : g.count,
    }));
  }, [guests, draftAttendance]);

  // ── Metric Counters ──────────────────────────────────────────────────────
  const totalReserved = useMemo(() => {
    return mergedStudentsList.reduce((acc, s) => acc + (s.reservedCount || 0), 0);
  }, [mergedStudentsList]);

  const totalEaten = useMemo(() => {
    const studentEaten = mergedStudentsList.reduce((acc, s) => acc + (s.count || 0), 0);
    const guestEaten = mergedGuestsList.reduce((acc, g) => acc + (g.count || 0), 0);
    return studentEaten + guestEaten;
  }, [mergedStudentsList, mergedGuestsList]);

  const totalStudentsCount = mergedStudentsList.length;
  const servedStudentsCount = mergedStudentsList.filter((s) => s.count > 0).length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCountChange = (rollNumber: string, delta: number) => {
    setDraftAttendance((prev) => {
      const current = prev[rollNumber] !== undefined ? prev[rollNumber] : 0;
      const newCount = Math.max(0, current + delta);
      return { ...prev, [rollNumber]: newCount };
    });
    setHasUnsavedChanges(true);
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoll = guestRollNumber.trim();
    if (!cleanRoll) {
      toast.error('Please enter a valid Roll Number / Student ID');
      return;
    }

    const existingStudent = allUsers.find(
      (s) => s.id?.toLowerCase() === cleanRoll.toLowerCase()
    );

    if (existingStudent) {
      const roll = existingStudent.id || existingStudent._id;
      handleCountChange(roll, guestCount);
      toast.info(`Updated existing resident ${existingStudent.name}`);
    } else {
      setGuests((prev) => {
        if (prev.some((g) => g.rollNumber.toLowerCase() === cleanRoll.toLowerCase())) {
          return prev;
        }
        return [
          ...prev,
          { rollNumber: cleanRoll, name: 'Permitted Guest / Cross-Hostel', count: guestCount },
        ];
      });
      setDraftAttendance((prev) => ({ ...prev, [cleanRoll]: guestCount }));
      setHasUnsavedChanges(true);
      toast.success(`Guest ${cleanRoll} added to roster`);
    }

    setGuestRollNumber('');
    setGuestCount(1);
    setIsAddingGuest(false);
  };

  const handleFillAllReserved = () => {
    const newDraft = { ...draftAttendance };
    let changed = false;

    mergedStudentsList.forEach((s) => {
      if (s.reservedCount > 0) {
        newDraft[s.rollNumber] = s.reservedCount;
        changed = true;
      }
    });

    if (changed) {
      setDraftAttendance(newDraft);
      setHasUnsavedChanges(true);
      toast.success('Filled meal eaten count from all pre-reservations!');
    } else {
      toast.info('No students have pre-reserved meals for this slot.');
    }
  };

  const handleResetToSaved = () => {
    loadFromServer();
    setHasUnsavedChanges(false);
    toast.info('Discarded changes');
  };

  const handleSave = () => {
    if (!selectedMeal || !user?.hostelId) {
      toast.error('Please select a valid meal and ensure hostel is loaded');
      return;
    }

    const records = Object.entries(draftAttendance).map(([rollNumber, count]) => ({
      rollNumber,
      count,
    }));

    saveAttendanceMutation.mutate(
      {
        hostelId: user.hostelId,
        date: selectedDate,
        mealType: selectedMeal.type,
        mealInfo: {
          name: selectedMeal.name,
          price: selectedMeal.price,
        },
        records,
      },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
        },
      }
    );
  };

  const exportToExcel = () => {
    const dataToExport = [
      ...filteredStudents.map((s) => ({
        'Student Name': s.name,
        'Roll Number': s.rollNumber,
        Room: s.room?.roomName ? `Room ${s.room.roomName}` : 'Unassigned',
        'Pre-Reserved Plates': s.reservedCount,
        'Actual Meals Taken': s.count,
        'Meal Status': s.count > 0 ? 'Served' : s.reservedCount > 0 ? 'Absence/Reserved' : 'Not Taken',
      })),
      ...mergedGuestsList.map((g) => ({
        'Student Name': g.name,
        'Roll Number': g.rollNumber,
        Room: 'External / Guest',
        'Pre-Reserved Plates': 0,
        'Actual Meals Taken': g.count,
        'Meal Status': 'Guest Entry',
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const fileName = `Attendance_${selectedDate}_${selectedMeal?.type || 'Meal'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success(`Exported ${fileName}`);
  };

  // ── Loading Skeleton ─────────────────────────────────────────────────────
  if (mealsLoading || usersLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const isConfigured = Boolean(selectedDate && selectedMeal);

  return (
    <div className="space-y-6 pb-20">
      {/* ── Top Control & Action Bar ────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {/* Date Selector */}
          <div>
            <label className="block text-[13px] font-medium text-muted-foreground mb-1.5 ml-1">
              Attendance Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedMealId('');
                }}
                className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-foreground text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Meal Slot Selector */}
          <div>
            <label className="block text-[13px] font-medium text-muted-foreground mb-1.5 ml-1">
              Meal Slot & Menu Item
            </label>
            <div className="relative">
              <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={selectedMealId}
                onChange={(e) => setSelectedMealId(e.target.value)}
                className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-8 text-foreground text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                {todaysMeals.length === 0 ? (
                  <option value="" disabled>
                    No meals scheduled for this day
                  </option>
                ) : (
                  todaysMeals.map((meal) => (
                    <option key={meal._id} value={meal._id}>
                      {meal.type}: {meal.name} (Rs. {meal.price})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 lg:pt-0">
          {isConfigured && (
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors shadow-2xs cursor-pointer"
              title="Download Excel Spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          )}

          <button
            onClick={() => setIsAddingGuest(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!isConfigured || saveAttendanceMutation.isPending || (!hasUnsavedChanges && serverAttendance.length > 0)}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-2xs cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/30 active:scale-95'
                : 'bg-muted border border-border text-muted-foreground opacity-70 cursor-not-allowed'
            }`}
          >
            {saveAttendanceMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saveAttendanceMutation.isPending
                ? 'Saving...'
                : hasUnsavedChanges
                ? 'Save Changes'
                : 'Saved'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Guest Addition Drawer / Modal ────────────────────────────────────── */}
      {isAddingGuest && (
        <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                Log Permitted Guest / Cross-Hostel Student
              </h4>
            </div>
            <button
              onClick={() => setIsAddingGuest(false)}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                placeholder="e.g. CS-2024-089 or GUEST-1"
                value={guestRollNumber}
                onChange={(e) => setGuestRollNumber(e.target.value)}
                className="w-full bg-background border border-input rounded-xl py-2 px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Plate Count
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-input rounded-xl bg-background overflow-hidden flex-1">
                  <button
                    type="button"
                    onClick={() => setGuestCount((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center text-sm font-bold bg-transparent border-none focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setGuestCount((prev) => prev + 1)}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-xs"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Metric Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reserved */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-muted-foreground">Pre-Reserved</span>
            <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">{totalReserved}</div>
          <p className="text-[11px] font-normal text-muted-foreground/80 mt-1">
            Plates booked in advance
          </p>
        </div>

        {/* Total Eaten / Served */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-muted-foreground">Meals Served</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {totalEaten}
          </div>
          <p className="text-[11px] font-normal text-muted-foreground/80 mt-1">
            Total actual plates consumed
          </p>
        </div>

        {/* Headcount ratio */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-muted-foreground">Student Turnout</span>
            <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {servedStudentsCount}{' '}
            <span className="text-sm font-normal text-muted-foreground">/ {totalStudentsCount}</span>
          </div>
          <p className="text-[11px] font-normal text-muted-foreground/80 mt-1">
            {totalStudentsCount > 0
              ? `${Math.round((servedStudentsCount / totalStudentsCount) * 100)}% attendance rate`
              : 'No residents registered'}
          </p>
        </div>

        {/* Unsaved / Sync Status */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-muted-foreground">Sync Status</span>
            <span
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                hasUnsavedChanges
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}
            >
              {hasUnsavedChanges ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </span>
          </div>
          <div>
            <div
              className={`text-lg font-bold ${
                hasUnsavedChanges ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {hasUnsavedChanges ? 'Unsaved Draft' : 'Up to Date'}
            </div>
            <p className="text-[11px] font-normal text-muted-foreground/80 mt-0.5">
              {hasUnsavedChanges ? 'Pending manager save' : 'Synced with server'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Search Bar & Batch Actions ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search student by name, roll number, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {/* Quick Batch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFillAllReserved}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors shadow-2xs cursor-pointer"
            title="Auto-fill meal eaten count matching reservations"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mark Pre-Reserved</span>
          </button>

          {hasUnsavedChanges && (
            <button
              onClick={handleResetToSaved}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-muted-foreground border border-border transition-colors shadow-2xs cursor-pointer"
              title="Discard unsaved changes and reload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Edits</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Roster Table ───────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-card border border-border/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                <th className="px-5 py-3.5 w-[32%]">Student Profile</th>
                <th className="px-5 py-3.5 w-[20%]">Roll Number</th>
                <th className="px-5 py-3.5 w-[18%]">Room</th>
                <th className="px-5 py-3.5 text-center w-[15%]">Pre-Reserved</th>
                <th className="px-5 py-3.5 text-center w-[15%]">Meals Eaten</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.length === 0 && mergedGuestsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium text-sm">No matching students found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Try clearing search terms or check if students are assigned to this hostel.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isEaten = student.count > 0;
                  const isReserved = student.reservedCount > 0;

                  return (
                    <tr
                      key={student.rollNumber}
                      className={`transition-colors group ${
                        isEaten
                          ? 'bg-blue-500/5 hover:bg-blue-500/10'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isEaten
                                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold'
                                : 'bg-muted text-muted-foreground border border-border'
                            }`}
                          >
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-sm leading-tight">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground/80">
                              {student.email || 'Hostel Resident'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          {student.rollNumber}
                        </span>
                      </td>

                      {/* Room */}
                      <td className="px-5 py-3">
                        {student.room?.roomName ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
                            <span>Room {student.room.roomName}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Pre-Reserved Count */}
                      <td className="px-5 py-3 text-center">
                        {isReserved ? (
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {student.reservedCount}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50 font-medium">0</span>
                        )}
                      </td>

                      {/* Meals Eaten Stepper Counter */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2 bg-background rounded-lg p-1 border border-border w-[108px] mx-auto shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleCountChange(student.rollNumber, -1)}
                            disabled={student.count === 0}
                            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors cursor-pointer ${
                              student.count > 0
                                ? 'text-red-500 hover:bg-red-500/10 active:scale-95'
                                : 'text-muted-foreground/40 cursor-not-allowed'
                            }`}
                            aria-label="Decrease plate count"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span
                            className={`font-mono font-bold text-sm min-w-[1.25rem] text-center ${
                              student.count > 0
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {student.count}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCountChange(student.rollNumber, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-bold transition-colors cursor-pointer active:scale-95"
                            aria-label="Increase plate count"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* ── External / Permitted Guests Section ──────────────────────── */}
              {mergedGuestsList.length > 0 && (
                <>
                  <tr className="bg-muted/60">
                    <td
                      colSpan={5}
                      className="px-5 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest border-y border-border"
                    >
                      External Guests & Permitted Additions ({mergedGuestsList.length})
                    </td>
                  </tr>

                  {mergedGuestsList.map((guest) => {
                    const isEaten = guest.count > 0;
                    return (
                      <tr
                        key={guest.rollNumber}
                        className={`transition-colors ${
                          isEaten ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-muted/40'
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                              G
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-sm leading-tight">
                                {guest.name}
                              </div>
                              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                External / Guest Entry
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {guest.rollNumber}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          <span className="text-xs text-muted-foreground italic">Cross-Hostel</span>
                        </td>

                        <td className="px-5 py-3 text-center">
                          <span className="text-xs text-muted-foreground/50">0</span>
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-2 bg-background rounded-lg p-1 border border-border w-[108px] mx-auto shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleCountChange(guest.rollNumber, -1)}
                              disabled={guest.count === 0}
                              className={`w-7 h-7 flex items-center justify-center rounded-md font-bold transition-colors cursor-pointer ${
                                guest.count > 0
                                  ? 'text-red-500 hover:bg-red-500/10 active:scale-95'
                                  : 'text-muted-foreground/40 cursor-not-allowed'
                              }`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span
                              className={`font-mono font-bold text-sm min-w-[1.25rem] text-center ${
                                guest.count > 0
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {guest.count}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleCountChange(guest.rollNumber, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold transition-colors cursor-pointer active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sticky Floating Save Bar (When Unsaved Changes) ────────────────── */}
      {hasUnsavedChanges && isConfigured && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md p-3.5 rounded-2xl bg-card/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">Unsaved attendance changes</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToSaved}
              className="inline-flex items-center gap-1 h-8 px-3 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Discard</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveAttendanceMutation.isPending}
              className="inline-flex items-center gap-1.5 h-8 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              {saveAttendanceMutation.isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{saveAttendanceMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
