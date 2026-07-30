import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Globe, MapPin } from 'lucide-react';
import { useMyHostel } from '../../hooks/queries/useHostelQueries';
import { useUpdateMyHostelSettings } from '../../hooks/mutations/useHostelMutations';
import toast from 'react-hot-toast';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import useUIStore from '../../store/useUIStore';

export default function HostelConfiguration() {
  const { data: hostelResponse, isLoading } = useMyHostel();
  const updateSettingsMutation = useUpdateMyHostelSettings();
  
  const [subdomain, setSubdomain] = useState('');
  const [location, setLocation] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [features, setFeatures] = useState([]);
  const [autoVerification, setAutoVerification] = useState(false);
  
  const { hasUnsavedChanges, setHasUnsavedChanges, discardTrigger } = useUIStore();
  
  const loadFromServer = () => {
    if (hostelResponse?.data) {
      setSubdomain(hostelResponse.data.subdomain || '');
      setLocation(hostelResponse.data.location || '');
      setCustomFields(hostelResponse.data.customRegistrationFields || []);
      setFeatures(hostelResponse.data.plan?.features || []);
      setAutoVerification(hostelResponse.data.settings?.autoVerification || false);
    }
  };

  useEffect(() => {
    if (!hasUnsavedChanges) {
      loadFromServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostelResponse]);

  useEffect(() => {
    if (discardTrigger > 0) {
      loadFromServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discardTrigger]);

  useEffect(() => {
    if (!hostelResponse?.data) return;
    const isDirty = 
      subdomain !== (hostelResponse.data.subdomain || '') ||
      location !== (hostelResponse.data.location || '') ||
      JSON.stringify(customFields) !== JSON.stringify(hostelResponse.data.customRegistrationFields || []) ||
      JSON.stringify(features) !== JSON.stringify(hostelResponse.data.plan?.features || []) ||
      autoVerification !== (hostelResponse.data.settings?.autoVerification || false);
    
    setHasUnsavedChanges(isDirty);
    
    // Clean up when unmounting so we don't lock the app
    return () => setHasUnsavedChanges(false);
  }, [subdomain, location, customFields, features, autoVerification, hostelResponse, setHasUnsavedChanges]);

  const handleAddField = () => {
    if (customFields.length >= 5) {
      toast.error('Maximum 5 custom fields allowed');
      return;
    }
    setCustomFields([...customFields, { name: '', isRequired: false }]);
  };

  const handleRemoveField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, key, value) => {
    const newFields = [...customFields];
    newFields[index][key] = value;
    setCustomFields(newFields);
  };

  const handleFeatureToggle = (featureName) => {
    setFeatures(prev => 
      prev.map(f => f.name === featureName ? { ...f, isEnabled: !f.isEnabled } : f)
    );
  };

  const coreFeatureNames = ["User Management", "Bill Management", "Residence Management", "Hostel Configuration", "Bill Generation"];
  const attendanceFeatureNames = ["Manual Attendance", "QR Attendance", "Biometric Attendance"];
  
  const coreFeatures = features.filter(f => coreFeatureNames.includes(f.name));
  const attendanceFeatures = features.filter(f => attendanceFeatureNames.includes(f.name));
  const otherFeatures = features.filter(f => !coreFeatureNames.includes(f.name) && !attendanceFeatureNames.includes(f.name));

  const handleSave = () => {
    // Validate empty names
    if (customFields.some(f => !f.name.trim())) {
      toast.error('All custom fields must have a name');
      return;
    }
    
    updateSettingsMutation.mutate({
      subdomain,
      location,
      customRegistrationFields: customFields,
      "plan.features": features,
      "settings.autoVerification": autoVerification,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-[1600px] mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-64"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-96 max-w-full"></div>
          </div>
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full sm:w-40"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-32"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24"></div>
                  <div className="h-11 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24"></div>
                  <div className="h-11 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-64 max-w-full"></div>
                </div>
                <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-24"></div>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-[46px] bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Hostel Configuration</h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Manage hostel settings, location, and custom registration fields.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-start"
        >
          {updateSettingsMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-5">Hostel Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-zinc-400" /> Subdomain (Email domain)
                </label>
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="e.g., @student.uet.edu.pk"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900/50 border rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" /> Location (Timezone)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900/50 border rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-50 appearance-none cursor-pointer"
                >
                  <option value="">Select Timezone</option>
                  <option value="Asia/Karachi">Asia/Karachi (Pakistan)</option>
                  <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
                  <option value="Asia/Riyadh">Asia/Riyadh (Saudi Arabia)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Global Settings Section */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">General Settings</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure hostel-wide policies.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-xl">
                <div>
                  <span className="text-sm font-medium block text-zinc-900 dark:text-zinc-50">Auto Verification (QR)</span>
                  <span className="text-xs text-zinc-500 block mt-0.5">Bypass manager permission</span>
                </div>
                <ToggleSwitch 
                  checked={autoVerification} 
                  onChange={() => setAutoVerification(!autoVerification)} 
                />
              </div>
            </div>
          </div>

          {/* Features Configuration Section (Moved to left column) */}
          {features.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-8">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Plan Features</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure the features available in your current plan.</p>
              </div>

              {/* Core Features */}
              {coreFeatures.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Core Features (Default)</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {coreFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-50/80 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl opacity-90">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{feature.name}</span>
                        <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/50 px-2.5 py-1 rounded-md">DEFAULT</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance Features */}
              {attendanceFeatures.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Attendance Methods</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {attendanceFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl">
                        <span className="text-sm font-medium block text-zinc-900 dark:text-zinc-50">{feature.name}</span>
                        <ToggleSwitch 
                          checked={feature.isEnabled} 
                          onChange={() => handleFeatureToggle(feature.name)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Services */}
              {otherFeatures.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Other Services</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {otherFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-xl">
                        <span className="text-sm font-medium block text-zinc-900 dark:text-zinc-50">{feature.name}</span>
                        <ToggleSwitch 
                          checked={feature.isEnabled} 
                          onChange={() => handleFeatureToggle(feature.name)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Custom Registration Fields</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Add up to 5 custom fields that users must fill out during registration.</p>
              </div>
              <button
                onClick={handleAddField}
                disabled={customFields.length >= 5}
                className="flex items-center gap-2 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Add Field
              </button>
            </div>

            <div className="space-y-3">
              {customFields.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 rounded-xl text-zinc-500 text-sm">
                  No custom fields added. Click "Add Field" to begin.
                </div>
              ) : (
                customFields.map((field, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-xl group transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                      placeholder="Field Name (e.g., CNIC)"
                      className="flex-1 px-3.5 py-2.5 bg-white dark:bg-zinc-900/50 border rounded-lg text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition-all border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-50"
                    />
                    <div className="flex items-center justify-between sm:justify-start gap-4 sm:ml-2">
                      <label className="flex items-center gap-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => handleFieldChange(idx, 'isRequired', e.target.checked)}
                          className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-900 dark:focus:ring-zinc-100 bg-white dark:bg-zinc-900 w-4 h-4 cursor-pointer transition-colors"
                        />
                        Required
                      </label>
                      <button
                        onClick={() => handleRemoveField(idx)}
                        className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
