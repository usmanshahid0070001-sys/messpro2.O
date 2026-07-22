import React from 'react';
import { FormInput } from './UserModal';

const capitalizeName = (str) => {
  if (!str) return str;
  // Split by space, capitalize first letter of each part, and join back
  return str.split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '').join(' ');
};

const formatCNIC = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
};

const DynamicFields = ({ customFields, formData, handleDynamicChange, errors }) => {
  if (!customFields || customFields.length === 0) return null;

  const onFieldChange = (fieldName, rawValue) => {
    let value = rawValue;
    const lowerName = fieldName.toLowerCase();
    
    if (lowerName.includes('name')) {
      value = capitalizeName(value);
    } else if (lowerName === 'cnic') {
      value = formatCNIC(value);
    } else if (lowerName.includes('phone') || lowerName.includes('contact')) {
      value = formatPhone(value);
    }
    
    handleDynamicChange(fieldName, value);
  };

  return (
    <div className="space-y-4 border-t border-[#f0f0f0] dark:border-[#1a1a1a] pt-6 mt-6">
      <h4 className="text-sm font-bold text-[#111111] dark:text-white">Additional Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {customFields.map((field) => (
          <FormInput
            key={field.name}
            label={field.name}
            name={field.name}
            required={field.isRequired}
            value={formData[field.name] || ''}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            error={errors[field.name]}
            placeholder={`Enter ${field.name}`}
            maxLength={
              field.name.toLowerCase() === 'cnic' ? 15 : 
              (field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('contact')) ? 12 : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicFields;
