import { ComputedRef, Ref } from 'vue';

import { FieldValidator } from './field-validator.model';

/**
 * Interface for generic validity state
 */
export interface FieldValidity<D extends Ref<boolean> = Ref<boolean>, V extends Ref<boolean> = ComputedRef<boolean>> {
  readonly dirty: D;
  readonly valid: V;
  isDirty: boolean;
  isValid: boolean;
  markAsDirty: () => void;
  markAsPristine: () => void;
}

export type ValidatorError<E = string | boolean> = Record<string, E>;
export type FieldValidatorError<E> = Ref<ValidatorError<E>>;
export type FieldValidatorContext<V, E> = {
  values: Partial<V>;
  errors: FieldValidatorError<E>;
  dirty: Ref<boolean>;
  field: FieldValidator<V, E>;
};

export type FieldValidatorGetter<V, E = string | boolean> = (ctx: FieldValidatorContext<V, E>) => boolean;
export type FieldValidatorErrorHandlerContext<V, E = string | boolean> = FieldValidatorContext<V, E> & {
  isValid: boolean;
};
export type FieldValidatorErrorHandler<V, E = string | boolean> = (
  ctx: FieldValidatorErrorHandlerContext<V, E>,
) => void;

export type FieldValidatorOptions<V, E = string | boolean> = {
  getter: FieldValidatorGetter<V, E>;
  errorHandler?: FieldValidatorErrorHandler<V, E>;
};

export type FieldsValidity<T> = Partial<Record<keyof T, FieldValidator<T>>>;
export type FieldsValidators<T> = Partial<Record<keyof T, FieldValidatorGetter<T> | FieldValidatorOptions<T>>>;
export type FormValidity = FieldValidity<ComputedRef<boolean>>;
export type FormValidatorErrors<T> = Partial<Record<keyof T, ValidatorError>>;
