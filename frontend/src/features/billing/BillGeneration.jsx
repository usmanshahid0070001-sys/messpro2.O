import { useState, useCallback } from "react";
import { Plus, Trash2, Calculator, Save, Send, Link as LinkIcon, Settings2 } from "lucide-react";
import MealPriceSettings from "./components/MealPriceSettings";

export default function BillGeneration() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [fromDate, setFromDate] = useState(formatDate(firstDay));
  const [toDate, setToDate] = useState(formatDate(lastDay));
  
  const [messTotals, setMessTotals] = useState({ grandTotal: 0, totalAttendance: 0 });
  const [billFields, setBillFields] = useState([
    { id: 'default-mess', name: 'Mess Bill', type: 'meal_attendance', value: null, linkedFieldId: null, included: true },
    { id: 'default-unpaid', name: 'Previous Unpaid Balance', type: 'previous_unpaid', value: null, linkedFieldId: null, included: true },
    { id: 'default-rent', name: 'Room Rent', type: 'static', value: 5000, linkedFieldId: null, included: true }
  ]);

  const handleTotalsChange = useCallback((totals) => {
    setMessTotals(totals);
  }, []);

  const addField = () => {
    if (billFields.length >= 10) return;
    setBillFields([
      ...billFields,
      { id: Date.now().toString(), name: 'New Field', type: 'static', value: 0, linkedFieldId: null, included: true }
    ]);
  };

  const updateField = (id, key, value) => {
    setBillFields(fields => fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    setBillFields(fields => fields.filter(f => f.id !== id));
  };

  const calculateFieldValue = (field) => {
    if (field.included === false) return 0;
    if (field.type === 'meal_attendance') {
      return messTotals.grandTotal;
    }
    if (field.type === 'static') {
      return Number(field.value) || 0;
    }
    if (field.type === 'percentage') {
      const linkedField = billFields.find(f => f.id === field.linkedFieldId);
      if (!linkedField) return 0;
      const baseValue = calculateFieldValue(linkedField);
      return (baseValue * (Number(field.value) || 0)) / 100;
    }
    if (field.type === 'multiplier') {
      const linkedField = billFields.find(f => f.id === field.linkedFieldId);
      if (!linkedField) return 0;
      const baseValue = calculateFieldValue(linkedField);
      return baseValue * (Number(field.value) || 0);
    }
    return 0;
  };

  const totalBillAmount = billFields.reduce((sum, field) => sum + calculateFieldValue(field), 0);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Bill Generation
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Define dynamic billing methods and generate monthly bills for all students.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center w-full sm:w-auto bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200/80 dark:border-zinc-700/80">
            <div className="flex-1 sm:flex-none flex items-center">
              <input
                type="date"
                value={fromDate}
                title="From Date"
                onChange={(e) => setFromDate(e.target.value)}
                className="px-4 py-2 h-[42px] w-full sm:w-[150px] bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none rounded-l-xl focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
              />
            </div>
            <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1 sm:flex-none flex items-center">
              <input
                type="date"
                value={toDate}
                title="To Date"
                onChange={(e) => setToDate(e.target.value)}
                className="px-4 py-2 h-[42px] w-full sm:w-[150px] bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none rounded-r-xl focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
              />
            </div>
          </div>
          
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="h-[42px] w-full sm:w-auto px-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]">
              <Save className="w-4 h-4" />
              <span className="hidden xl:inline">Save Settings</span>
              <span className="xl:hidden">Save</span>
            </button>
            <button className="h-[42px] w-full sm:w-auto px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]">
              <Send className="w-4 h-4" />
              <span>Generate Bills</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bill Method Settings UI */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Settings2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
              Bill Methods
            </h2>
          </div>
          
          {billFields.length < 10 && (
            <button 
              onClick={addField}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Field
            </button>
          )}
        </div>

        <div className="p-5">
          <div className="space-y-3">
            {billFields.map((field, index) => {
              const calculatedValue = calculateFieldValue(field);
              return (
                <div key={field.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors group ${field.included === false ? 'bg-zinc-100/50 dark:bg-zinc-900/10 opacity-70' : 'bg-zinc-50/30 dark:bg-zinc-900/20 hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
                  
                  {/* Serial Number, Checkbox & Name */}
                  <div className="flex items-center gap-3 w-full sm:w-1/4 min-w-[200px]">
                    <div className="flex items-center justify-center shrink-0 w-6">
                      <input 
                        type="checkbox"
                        checked={field.included !== false}
                        onChange={(e) => updateField(field.id, 'included', e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Include field in bill"
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5 shrink-0">
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(field.id, 'name', e.target.value)}
                      placeholder="Field Name"
                      disabled={field.type === 'meal_attendance' || field.type === 'previous_unpaid'}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm disabled:opacity-70"
                    />
                  </div>

                  {/* Type Selector */}
                  <div className="w-full sm:w-[160px] shrink-0">
                    <select
                      value={field.type}
                      onChange={(e) => {
                        updateField(field.id, 'type', e.target.value);
                        if (e.target.value !== 'percentage' && e.target.value !== 'multiplier') {
                          updateField(field.id, 'linkedFieldId', null);
                        }
                      }}
                      disabled={field.type === 'meal_attendance' || field.type === 'previous_unpaid'}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {field.type === 'meal_attendance' && <option value="meal_attendance">Meal Settings Link</option>}
                      {field.type === 'previous_unpaid' && <option value="previous_unpaid">Previous Unpaid Bill</option>}
                      {field.type !== 'meal_attendance' && field.type !== 'previous_unpaid' && (
                        <>
                          <option value="static">Static Value</option>
                          <option value="percentage">Percentage (%)</option>
                          <option value="multiplier">Multiplier (x)</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Dynamic Value Input Area */}
                  <div className="flex-1 flex items-center gap-3 min-w-[200px]">
                    {field.type === 'static' && (
                      <div className="relative w-full max-w-[140px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium select-none">Rs.</span>
                        <input
                          type="number"
                          value={field.value}
                          onChange={(e) => updateField(field.id, 'value', e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
                          placeholder="0"
                        />
                      </div>
                    )}
                    
                    {(field.type === 'percentage' || field.type === 'multiplier') && (
                      <div className="flex items-center gap-2 w-full">
                        <div className="relative w-[100px] shrink-0">
                          <input
                            type="number"
                            value={field.value}
                            onChange={(e) => updateField(field.id, 'value', e.target.value)}
                            className={`w-full py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right ${field.type === 'percentage' ? 'pl-3 pr-8' : 'px-3 text-center'}`}
                            placeholder="0"
                          />
                          {field.type === 'percentage' && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium select-none">%</span>
                          )}
                        </div>
                        <span className="text-sm font-black text-zinc-500 px-1">{field.type === 'multiplier' ? '×' : 'of'}</span>
                        <select
                          value={field.linkedFieldId || ''}
                          onChange={(e) => updateField(field.id, 'linkedFieldId', e.target.value)}
                          className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-sm cursor-pointer"
                        >
                          <option value="" disabled>Select field...</option>
                          {billFields
                            .filter(f => f.id !== field.id) // Cannot link to itself
                            .map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {field.type === 'meal_attendance' && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg text-blue-700 dark:text-blue-400 text-sm font-medium w-full">
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Auto-linked to Meal Price Settings</span>
                      </div>
                    )}

                    {field.type === 'previous_unpaid' && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-sm font-medium w-full">
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Auto-linked per student</span>
                      </div>
                    )}
                  </div>

                  {/* Calculated Result & Delete */}
                  <div className="flex items-center justify-end gap-4 sm:w-[140px] shrink-0">
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-0.5">
                        Amount
                      </span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {field.type === 'previous_unpaid' ? 'Dynamic' : `Rs. ${Math.round(calculatedValue).toLocaleString('en-PK')}`}
                      </span>
                    </div>
                    
                    {field.type !== 'meal_attendance' && field.type !== 'previous_unpaid' ? (
                      <button 
                        onClick={() => removeField(field.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                        title="Remove Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-8 h-8 shrink-0"></div>
                    )}
                  </div>

                </div>
              );
            })}

            {billFields.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
                <Calculator className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-3" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No Bill Methods Defined</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Add dynamic fields like Room Rent or Tax to define how student bills are calculated.
                </p>
                <button 
                  onClick={addField}
                  className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add First Field
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Total Summary Footer */}
        {billFields.length > 0 && (
          <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Estimated Total Bill Profile
            </span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              Rs. {Math.round(totalBillAmount).toLocaleString('en-PK')}
            </span>
          </div>
        )}
      </div>

      {/* Existing Settings */}
      <MealPriceSettings onTotalsChange={handleTotalsChange} fromDate={fromDate} toDate={toDate} />

    </div>
  );
}
