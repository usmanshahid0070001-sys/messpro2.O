import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { RootState } from '@/store';
import {
  dismissSyncNotification,
  resetSyncState,
} from '@/store/slices/BiometricSyncSlice';
import { Button } from '@/components/ui/button';

export function BiometricSyncFloatingWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const syncState = useSelector((state: RootState) => state.biometricSync);

  const {
    isSyncing,
    isCompleted,
    isDismissed,
    error,
    fileName,
    totalRecords,
    processedRecords,
    currentChunkIndex,
    totalChunks,
    progressPct,
    aggregatedStats,
  } = syncState;

  // Do not render if dismissed or not active
  if (isDismissed || (!isSyncing && !isCompleted && !error)) {
    return null;
  }

  const isBiometricPage = location.pathname.includes('/attendance/biometric');

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-[95] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-2xl space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-xl border shrink-0 flex items-center justify-center ${
                error
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
              }`}
            >
              {error ? (
                <AlertCircle className="w-4 h-4" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">
                {error
                  ? 'Biometric Sync Failed'
                  : isCompleted
                  ? 'Biometric Attendance Synced'
                  : 'Uploading Biometric Logs...'}
              </h4>
              <p className="text-[11px] text-muted-foreground truncate font-mono">
                {fileName || 'biometric_data.xlsx'} &bull; {totalRecords} punches
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(dismissSyncNotification())}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar & Chunk Counter */}
        {isSyncing && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                Batch <strong>{currentChunkIndex}</strong> of <strong>{totalChunks}</strong>
              </span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                {processedRecords} / {totalRecords} ({progressPct}%)
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Breakdown */}
        {isCompleted && (
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{aggregatedStats.recordsCreated}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-muted-foreground">Updated:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {aggregatedStats.recordsUpdated}
              </span>
            </div>
            {aggregatedStats.guestsMarked > 0 && (
              <div className="flex items-center justify-between font-mono">
                <span className="text-muted-foreground">Guests:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {aggregatedStats.guestsMarked}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {!isBiometricPage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/attendance/biometric')}
              className="h-7 text-xs gap-1 cursor-pointer"
            >
              <span>View Logs Page</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}

          {isCompleted && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                dispatch(dismissSyncNotification());
                dispatch(resetSyncState());
              }}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white ml-auto cursor-pointer"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BiometricSyncFloatingWidget;
