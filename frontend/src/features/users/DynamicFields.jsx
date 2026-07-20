import React from 'react';
import { FormInput } from './UserModal';

const DynamicFields = ({ customFields, formData, handleDynamicChange, errors }) => {
  if (!customFields || customFields.length === 0) return null;

  return (
    <div className="space-y-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] pt-6 mt-6">
      <h4 className="text-sm font-bold text-[#111111] dark:text-white">Additional Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {customFields.map((field) => (
          <FormInput
            key={field.name}
            label={field.name}
            name={field.name}
            required={field.isRequired}
            value={formData[field.name] || ''}
            onChange={(e) => handleDynamicChange(field.name, e.target.value)}
            error={errors[field.name]}
            placeholder={`Enter ${field.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicFields;
