import React from 'react';

const DynamicFields = ({ customFields, formData, handleDynamicChange, errors }) => {
  if (!customFields || customFields.length === 0) return null;

  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-[#222] pt-6 mt-6">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Additional Information</h4>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {customFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.name} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="mt-1">
              <input
                type="text"
                name={field.name}
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleDynamicChange(field.name, e.target.value)}
                required={field.isRequired}
                className={`block w-full rounded-lg bg-white dark:bg-[#111] text-gray-900 dark:text-white shadow-sm sm:text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-shadow duration-150 border-gray-300 dark:border-[#333] ${
                  errors[field.name] ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder={`Enter ${field.name}`}
              />
            </div>
            {errors[field.name] && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFields;
