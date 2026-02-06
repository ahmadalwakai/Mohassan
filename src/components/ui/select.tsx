/**
 * Select Component
 * Consistent, accessible select/dropdown UI
 */

import type { ReactNode, SelectHTMLAttributes, ChangeEvent } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{
    value: string;
    label: ReactNode;
  }>;
  isRequired?: boolean;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export function Select({
  label,
  options,
  isRequired,
  onChange,
  mb,
  ...props
}: SelectProps & { mb?: number | string }) {
  const marginBottom = mb
    ? typeof mb === 'number'
      ? `${mb * 4}px`
      : mb
    : undefined;

  return (
    <div style={{ marginBottom }}>
      {label && (
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
          {label}
          {isRequired && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      <select
        onChange={onChange}
        required={isRequired}
        style={{
          width: '100%',
          backgroundColor: '#1a202c',
          border: '1px solid #4a5568',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem',
          cursor: 'pointer',
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
