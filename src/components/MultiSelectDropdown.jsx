import React, { useState, useRef, useEffect } from "react";

const MultiSelectDropdown = ({ label, options, selectedValues = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const normalizedSelectedValues = Array.isArray(selectedValues) ? selectedValues :
    (selectedValues ? [selectedValues] : ['Any']);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const sortedOptions = [...options].sort((a, b) => {
    const aSelected = normalizedSelectedValues.includes(a.value);
    const bSelected = normalizedSelectedValues.includes(b.value);
    return bSelected - aSelected;
  });
  
  const handleToggleOption = (value) => {
    let newSelectedValues;
    
    if (value === "Any") {
      newSelectedValues = ["Any"];
    } else if (normalizedSelectedValues.includes(value)) {
      newSelectedValues = normalizedSelectedValues.filter(val => val !== value && val !== "Any");
      if (newSelectedValues.length === 0) {
        newSelectedValues = ["Any"];
      }
    } else {
      newSelectedValues = [...normalizedSelectedValues.filter(val => val !== "Any"), value];
    }
    
    if (JSON.stringify(newSelectedValues) !== JSON.stringify(normalizedSelectedValues)) {
      onChange(newSelectedValues);
    }
  };
  
  const getDisplayText = () => {
    if (normalizedSelectedValues.includes("Any")) {
      return "Any";
    } else if (normalizedSelectedValues.length > 0) {
      return normalizedSelectedValues.length > 2
        ? `${normalizedSelectedValues.length} selected`
        : normalizedSelectedValues.map(value => {
            const option = options.find(opt => opt.value === value);
            return option ? option.label : value;
          }).join(", ");
    } else {
      return "Select options";
    }
  };
  
  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <label>{label}</label>
      <div
        className="dropdown-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        <span className="dropdown-text">{getDisplayText()}</span>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {sortedOptions.map((option, i) => (
            <div key={i} className="dropdown-option">
              <label style={{ cursor: 'pointer', display: 'block', padding: '5px' }}>
                <input
                  type="checkbox"
                  checked={normalizedSelectedValues.includes(option.value)}
                  onChange={() => handleToggleOption(option.value)}
                  style={{ marginRight: '8px' }}
                />
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
