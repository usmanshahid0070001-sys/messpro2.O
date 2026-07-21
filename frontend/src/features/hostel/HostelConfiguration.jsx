import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Globe, MapPin } from 'lucide-react';
import { useMyHostel } from '../../hooks/queries/useHostelQueries';
import { useUpdateMyHostelSettings } from '../../hooks/mutations/useHostelMutations';
import toast from 'react-hot-toast';

export default function HostelConfiguration() {
  const { data: hostelResponse, isLoading } = useMyHostel();
  const updateSettingsMutation = useUpdateMyHostelSettings();
  
  const [subdomain, setSubdomain] = useState('');
  const [location, setLocation] = useState('');
  const [customFields, setCustomFields] = useState([]);
  
  useEffect(() => {
    if (hostelResponse?.data) {
      setSubdomain(hostelResponse.data.subdomain || '');
      setLocation(hostelResponse.data.location || '');
      setCustomFields(hostelResponse.data.customRegistrationFields || []);
    }
  }, [hostelResponse]);

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

  const handleSave = () => {
    // Validate empty names
    if (customFields.some(f => !f.name.trim())) {
      toast.error('All custom fields must have a name');
      return;
    }
    
    updateSettingsMutation.mutate({
      subdomain,
      location,
      customRegistrationFields: customFields
    });
  };

  if (isLoading) {
    return <div className="animate-pulse p-8 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl h-64 m-4 lg:m-8"></div>;
  }

  return (
    <div className="space-y-6 lg:p-8 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between px-4 lg:px-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111111] dark:text-white">Hostel Configuration</h1>
          <p className="mt-1 text-sm font-medium text-[#737373] dark:text-[#a0a0a0]">
            Manage hostel settings, location, and custom registration fields.
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-0 space-y-6 max-w-4xl pb-10">
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111] dark:text-white mb-4">Hostel Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Subdomain (Email domain)
              </label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="e.g., @student.uet.edu.pk"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Location (Timezone)
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-1 transition-all border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white appearance-none cursor-pointer"
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

        <div className="bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#111] dark:text-white">Custom Registration Fields</h2>
              <p className="text-sm text-[#737373] dark:text-[#a0a0a0]">Add up to 5 custom fields that users must fill out during registration.</p>
            </div>
            <button
              onClick={handleAddField}
              disabled={customFields.length >= 5}
              className="flex items-center gap-2 bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 rounded-lg px-4 py-2 text-sm font-bold hover:bg-blue-600/20 dark:hover:bg-blue-600/30 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Field
            </button>
          </div>

          <div className="space-y-3">
            {customFields.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-[#e5e5e5] dark:border-[#333333] rounded-xl text-[#737373]">
                No custom fields added.
              </div>
            ) : (
              customFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                    placeholder="Field Name (e.g., CNIC)"
                    className="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#111111] border rounded-xl text-sm text-[#111111] dark:text-white placeholder:text-[#c4c4c4] dark:placeholder:text-[#444444] focus:outline-none focus:ring-1 transition-all border-[#e5e5e5] dark:border-[#222222] focus:border-[#111111] focus:ring-[#111111] dark:focus:border-white dark:focus:ring-white"
                  />
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#111111] dark:text-white ml-2">
                    <input
                      type="checkbox"
                      checked={field.isRequired}
                      onChange={(e) => handleFieldChange(idx, 'isRequired', e.target.checked)}
                      className="rounded border-[#e5e5e5] dark:border-[#444] text-[#111] dark:text-white focus:ring-[#111] dark:focus:ring-white bg-white dark:bg-[#222] w-4 h-4 cursor-pointer transition-colors"
                    />
                    Required
                  </label>
                  <button
                    onClick={() => handleRemoveField(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {updateSettingsMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4" /> Save Configuration</>}
          </button>
        </div>
      </div>
    </div>
  );
}
