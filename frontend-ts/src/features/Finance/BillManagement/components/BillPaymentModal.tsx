import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { Bill } from '@/hooks/queries/useBillingQueries'

interface BillPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill | null
  onProcessPayment: (billId: string, amount: number) => void
  isProcessing: boolean
}

export default function BillPaymentModal({
  isOpen,
  onClose,
  bill,
  onProcessPayment,
  isProcessing,
}: BillPaymentModalProps) {
  const [amountInput, setAmountInput] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Initialize with remaining balance whenever a bill is opened
  useEffect(() => {
    if (bill) {
      setAmountInput(String(bill.remainingBill))
      setError(null)
    }
  }, [bill])

  if (!isOpen || !bill) return null

  const parsedAmount = Number(amountInput) || 0
  const remaining = bill.remainingBill
  const isValid = parsedAmount > 0 && parsedAmount <= remaining

  const handleAmountChange = (val: string) => {
    setAmountInput(val)
    const num = Number(val)
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive payment amount.')
    } else if (num > remaining) {
      setError(`Amount cannot exceed the remaining balance of Rs. ${remaining.toLocaleString()}.`)
    } else {
      setError(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onProcessPayment(bill._id, parsedAmount)
  }

  const studentName = bill.studentId?.name || (bill.isGuest ? 'Dining Guest' : 'Resident')
  const rollNumber = bill.rollNumber || bill.studentId?.id || 'N/A'
  const newRemaining = Math.max(0, remaining - parsedAmount)
  const isSettlingFull = parsedAmount === remaining

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-purple-500/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Record Payment</h3>
              <p className="text-xs text-muted-foreground">Post student dues to hostel ledger</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Student Banner */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Resident Details</p>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                {studentName}
                {bill.isGuest && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    GUEST
                  </span>
                )}
              </h4>
              <p className="text-xs text-muted-foreground font-mono">{rollNumber}</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-muted-foreground">Remaining Dues</p>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                Rs. {remaining.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAmountChange(String(remaining))}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-purple-500/30 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
              >
                Full (Rs. {remaining})
              </button>
              <button
                type="button"
                onClick={() => handleAmountChange(String(Math.round(remaining / 2)))}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors"
              >
                50% (Rs. {Math.round(remaining / 2)})
              </button>
              <button
                type="button"
                onClick={() => handleAmountChange('')}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Payment Amount Input */}
          <div className="space-y-1.5">
            <label htmlFor="pay-amount" className="text-xs font-semibold text-foreground">
              Payment Amount (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                Rs.
              </span>
              <input
                id="pay-amount"
                type="number"
                min="1"
                max={remaining}
                step="any"
                value={amountInput}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={`1 - ${remaining}`}
                className="w-full pl-10 pr-3 py-2 text-sm font-bold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground shadow-2xs"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Impact Preview */}
          <div className="p-3 bg-muted/30 border border-border/60 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Current Paid:</span>
              <span className="font-semibold text-foreground">Rs. {bill.paidBill.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>This Payment:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                + Rs. {parsedAmount.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-border pt-1.5 flex justify-between items-center font-bold">
              <span className="text-foreground">New Remaining Balance:</span>
              <span className={newRemaining === 0 ? 'text-emerald-600' : 'text-amber-600'}>
                Rs. {newRemaining.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-0.5">
              <span>Status after save:</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                {isSettlingFull ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 font-bold">Fully Settled</span>
                  </>
                ) : (
                  <span>Partial Balance</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || isProcessing}
              className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Rs. {parsedAmount.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
