import React from "react";

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
  options = [],
}) => {
  const renderInput = () => {
    const baseClasses = `w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
      error ? "border-red-500 bg-red-50" : "border-gray-300"
    } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;

    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`${baseClasses} h-32`}
          />
        );

      case "select":
        return (
          <select
            id={name}
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={baseClasses}
          >
            <option value="">Chọn...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={!!value}
              onChange={onChange}
              disabled={disabled}
              required={required}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;
