import React, { FC, ReactNode } from "react";

interface SelectProps {
  children: ReactNode;
  className?: string;
}

export const Select: FC<SelectProps> = ({ children, className }) => {
  return <div className={`select ${className ?? ""}`}>{children}</div>;
};

interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

export const SelectContent: FC<SelectContentProps> = ({ children, className }) => {
  return <div className={`select-content ${className ?? ""}`}>{children}</div>;
};

interface SelectItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const SelectItem: FC<SelectItemProps> = ({ value, children, className }) => {
  return (
    <div className={`select-item ${className ?? ""}`} data-value={value}>
      {children}
    </div>
  );
};

interface SelectTriggerProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export const SelectTrigger: FC<SelectTriggerProps> = ({ onClick, children, className }) => {
  return (
    <button type="button" className={`select-trigger ${className ?? ""}`} onClick={onClick}>
      {children}
    </button>
  );
};

interface SelectValueProps {
  value?: string;
  placeholder?: string;
  className?: string;
}

export const SelectValue: FC<SelectValueProps> = ({ value, placeholder = "Select a value", className }) => {
  return <span className={`select-value ${className ?? ""}`}>{value || placeholder}</span>;
};
