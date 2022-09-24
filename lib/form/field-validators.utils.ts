import type { FieldValidatorErrorHandler, FieldValidatorOptions } from './form-validator.type';

/** Default error handlers for FieldValidator wrapper */
export const FieldValidatorsErrorHandlers: FieldValidatorsErrorHandlers = {
  basic:
    (name: string) =>
      ({ isValid, field }) =>
        isValid ? field.clearError(name) : field.setError(name),
};

/** Interface for default error handlers */
export interface FieldValidatorsErrorHandlers {
  basic: (name: string) => FieldValidatorErrorHandler<unknown, boolean>;
}

/** Interface for default validators */
export interface FieldValidators {
  required: <T>(key: keyof T) => FieldValidatorOptions<T, boolean>;
  nonEmpty: <T>(key: keyof T) => FieldValidatorOptions<T, boolean>;
  min: <T>(key: keyof T, min?: number) => FieldValidatorOptions<T, boolean>;
}

/** Default validators for FieldValidator wrapper */
export const FieldValidators: FieldValidators = {
  required: key => ({
    getter: ({ values }) => !!values?.[key],
    errorHandler: FieldValidatorsErrorHandlers.basic('required'),
  }),
  nonEmpty: key => ({
    getter: ({ values }) => {
      const _value = values?.[key];
      if (_value && typeof _value === 'string') return !!_value?.trim();
      return !!_value;
    },
    errorHandler: FieldValidatorsErrorHandlers.basic('nonEmpty'),
  }),
  min: (key, min = 0) => ({
    getter: ({ values }) => (values?.[key] ?? 0) > min,
    errorHandler: FieldValidatorsErrorHandlers.basic('min'),
  }),
};
