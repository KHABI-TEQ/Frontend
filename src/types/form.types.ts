/** @format */

export interface FormikInstance<T = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>> | any;
  touched: Partial<Record<keyof T, boolean>> | any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setFieldValue: (field: keyof T | string, value: unknown) => void;
  setFieldError: (field: keyof T | string, message: string) => void;
  setFieldTouched: (field: keyof T | string, touched?: boolean) => void;
  resetForm: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  submitForm: () => void;
  [key: string]: any; // Allow additional properties from FormikProps
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormValidationSchema {
  [field: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | null;
  };
}

export type InputType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search' 
  | 'date' 
  | 'time' 
  | 'datetime-local' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'hidden';

export interface BaseInputProps {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  touched?: boolean;
  style?: React.CSSProperties;
}

export interface TextInputProps extends BaseInputProps {
  type: Extract<InputType, 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  spellCheck?: boolean;
}

export interface NumberInputProps extends BaseInputProps {
  type: 'number';
  value?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
}

export interface TextareaProps extends BaseInputProps {
  multiline: true;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface SelectInputProps extends BaseInputProps {
  forState?: boolean;
  forLGA?: boolean;
  forIdtype?: boolean;
  forRegion?: boolean;
  options?: SelectOption[];
  value?: SelectOption | null;
  onChange?: (option: SelectOption | null) => void;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  showDropdownIcon?: boolean;
}

export interface CheckboxInputProps extends BaseInputProps {
  type: 'checkbox';
  checked?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export interface RadioInputProps extends BaseInputProps {
  type: 'radio';
  checked?: boolean;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export interface FileInputProps extends BaseInputProps {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export type InputProps = 
  | TextInputProps 
  | NumberInputProps 
  | TextareaProps 
  | SelectInputProps 
  | CheckboxInputProps 
  | RadioInputProps 
  | FileInputProps;

export interface FormStepProps<T = Record<string, unknown>> {
  formik: FormikInstance<T>;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export interface MultiStepFormProps<T = Record<string, unknown>> {
  initialValues: T;
  validationSchema?: unknown;
  onSubmit: (values: T) => void | Promise<void>;
  steps: React.ComponentType<FormStepProps<T>>[];
  onStepChange?: (step: number) => void;
  allowStepNavigation?: boolean;
}

export interface FieldArrayHelpers {
  push: (obj: unknown) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  insert: (index: number, value: unknown) => void;
  unshift: (value: unknown) => number;
  remove: (index: number) => unknown;
  pop: () => unknown;
  replace: (index: number, value: unknown) => void;
}
