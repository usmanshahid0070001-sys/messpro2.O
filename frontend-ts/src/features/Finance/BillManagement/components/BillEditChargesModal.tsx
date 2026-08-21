import React, { useState, useEffect } from 'react'
import {
  Edit3,
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  Calculator,
} from 'lucide-react'
import type { Bill, CustomChargeItem } from '@/hooks/queries/useBillingQueries'

interface BillEditChargesModalProps {
  isOpen: boolean
  onClose: () => void
  bill: Bill | null
  onSaveCharges: (
    billId: string,
    customCharges: Array<{
      name: string
      chargeType?: string
      value?: number
      target?: string
      calculatedAmount: number
    }>
  ) => void
  isSaving: boolean
}

export default function BillEditChargesModal({
  isOpen,
  onClose,
  bill,
  onSaveCharges,
  isSaving,
}: BillEditChargesModalProps) {
  const [chargesList, setChargesList] = useState<CustomChargeItem[]>([])
  const [newChargeName, setNewChargeName] = useState('')
  const [newChargeAmount, setNewChargeAmount] = useState('')

  useEffect(() => {
    if (bill) {
      setChargesList(bill.customCharges || [])
      setNewChargeName('')
      setNewChargeAmount('')
    }
  }, [bill])

  if (!isOpen || !bill) return null

  const handleChargeAmountChange = (index: number, val: string) => {
    const num = Number(val) || 0
    setChargesList((prev) =>
      prev.map((c, i) => (i === index ? { ...c, calculatedAmount: Math.max(0, num) } : c))
    )
  }

  const handleRemoveCharge = (index: number) => {
    setChargesList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChargeName.trim()) return
    const amount = Number(newChargeAmount) || 0

    setChargesList((prev) => [
      ...prev,
      {
        name: newChargeName.trim(),
        chargeType: 'addition',
        value: amount,
        target: 'none',
        calculatedAmount: amount,
      },
    ])
    setNewChargeName('')
    setNewChargeAmount('')
  }

  // Recalculated values
  const totalCustomCharges = chargesList.reduce((sum, c) => sum + (c.calculatedAmount || 0), 0)
  const recalculatedTotal = bill.baseMessBill + bill.previousUnpaidArrears + totalCustomCharges
  const recalculatedRemaining = recalculatedTotal - bill.paidBill

  const handleSave = () => {
    onSaveCharges(
      bill._id,
      chargesList.map((c) => ({
        name: c.name,
        chargeType: c.chargeType || 'addition',
        value: c.value ?? c.calculatedAmount,
        target: c.target || 'none',
        calculatedAmount: c.calculatedAmount,
      }))
    )
  }

  const studentName = bill.studentId?.name || (bill.isGuest ? 'Dining Guest' : 'Resident')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-purple-500/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Adjust Custom Charges</h3>
              <p className="text-xs text-muted-foreground">{studentName} &bull; Roll: {bill.rollNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Base Unmodifiable Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl">
              <p className="text-[11px] font-semibold text-muted-foreground">Base Mess Bill</p>
              <p className="text-sm font-bold text-foreground mt-0.5 font-mono">
                Rs. {bill.baseMessBill.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-muted/40 border border-border/60 rounded-xl">
              <p className="text-[11px] font-semibold text-muted-foreground">Previous Arrears</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                Rs. {bill.previousUnpaidArrears.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charges List */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dynamic Custom Charges
            </label>

            {chargesList.length === 0 ? (
              <div className="text-center py-6 bg-muted/20 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                No custom charges applied to this bill.
              </div>
            ) : (
              <div className="space-y-2">
                {chargesList.map((charge, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-background border border-border rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{charge.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        Type: {charge.chargeType || 'Fixed'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                          Rs.
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={charge.calculatedAmount}
                          onChange={(e) => handleChargeAmountChange(idx, e.target.value)}
                          className="w-full pl-8 pr-2 py-1 text-xs font-bold bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCharge(idx)}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove Charge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Custom Charge Inline */}
          <div className="p-3.5 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Individual Fee / Fine</span>
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Charge name (e.g. Fine)"
                value={newChargeName}
                onChange={(e) => setNewChargeName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-foreground"
              />
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                  Rs.
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={newChargeAmount}
                  onChange={(e) => setNewChargeAmount(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCharge}
                disabled={!newChargeName.trim()}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Recalculated Summary */}
          <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Recalculated Grand Total:</span>
              <span className="font-bold text-foreground text-sm font-mono">
                Rs. {recalculatedTotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Already Paid:</span>
              <span className="font-bold text-emerald-600 font-mono">
                Rs. {bill.paidBill.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center text-sm font-bold">
              <span className="text-foreground">New Remaining Balance:</span>
              <span
                className={`font-mono text-base ${
                  recalculatedRemaining <= 0 ? 'text-emerald-600' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                Rs. {Math.max(0, recalculatedRemaining).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-card flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
