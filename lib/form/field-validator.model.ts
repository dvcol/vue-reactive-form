import { computed, ComputedRef, ref, Ref } from 'vue';

import type {
  FieldValidatorContext,
  FieldValidatorError,
  FieldValidatorGetter,
  FieldValidatorOptions,
  FieldValidity,
  ValidatorError,
} from './form-validator.type';

/**
 * Class for FormValidator's field validators
 * @see FormValidator
 */
export class FieldValidator<V, E = string | boolean> implements FieldValidity {
  readonly dirty: Ref<boolean>;
  readonly valid: ComputedRef<boolean>;
  readonly errors: FieldValidatorError<E>;

  private _values?: Partial<V>;
  private _hasErrors: ComputedRef<boolean>;

  constructor(values: Partial<V>, getterOrOption?: FieldValidatorGetter<V, E> | FieldValidatorOptions<V, E>) {
    this.errors = ref({});
    this.dirty = ref<boolean>(false);

    this._values = values;
    this._hasErrors = computed<boolean>(() => Object.keys(this.errors.value).some(k => !!this.errors.value[k]));

    this.valid = computed<boolean>(() => {
      const _context: FieldValidatorContext<V, E> = { values, errors: this.errors, dirty: this.dirty, field: this };
      let isValid = true;
      if (getterOrOption) {
        const _getter = 'getter' in getterOrOption ? getterOrOption.getter : getterOrOption;
        isValid = _getter(_context);
        if ('errorHandler' in getterOrOption) getterOrOption.errorHandler?.({ ..._context, isValid });
      }
      return !this._hasErrors.value && isValid;
    });
  }

  get isDirty(): boolean {
    return this.dirty.value;
  }

  get isValid(): boolean {
    return this.valid.value;
  }

  get hasErrors(): boolean {
    return this._hasErrors.value;
  }

  markAsDirty(): void {
    this.dirty.value = true;
  }

  markAsPristine(): void {
    this.dirty.value = false;
  }

  setError(key: string, value?: E): ValidatorError<E> {
    const _value = (value ?? true) as E;
    if (key in this.errors.value && this.errors.value[key] === _value) return this.errors.value;
    this.errors.value = { ...this.errors.value, [key]: _value };
    return this.errors.value;
  }

  clearError(key: string): ValidatorError<E> {
    if (!(key in this.errors.value)) return this.errors.value;
    const _errors = { ...this.errors.value };
    delete _errors[key];
    this.errors.value = _errors;
    return this.errors.value;
  }

  clearErrors(): void {
    this.errors.value = {};
  }
}
