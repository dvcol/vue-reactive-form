import { computed, ComputedRef, reactive } from 'vue';

import { FieldValidator } from './field-validator.model';

import type {
  FieldsValidators,
  FieldsValidity,
  FieldValidity,
  FormValidatorErrors,
  FormValidity,
} from './form-validator.type';

const keysWithTypes = <T>(object: T): (keyof typeof object)[] => Object.keys(object) as (keyof typeof object)[];

const reduceWithTypes = <I, O>(
  input: I,
  reducer: (
    previousValue: O,
    currentValue: keyof typeof input,
    currentIndex: number,
    array: (keyof typeof input)[],
  ) => O,
  initialValue = {} as O,
): O => keysWithTypes(input).reduce<O>(reducer, initialValue);

/**
 * Simple vue wrapper for reactive form validation
 */
export class FormValidator<T> implements FieldValidity<ComputedRef<boolean>> {
  readonly dirty: ComputedRef<boolean>;
  readonly valid: ComputedRef<boolean>;
  readonly fields: FieldsValidity<T>;
  readonly values: Partial<T>;
  readonly errors: ComputedRef<FormValidatorErrors<T>>;

  private _hasErrors: ComputedRef<boolean>;

  constructor(
    private form: Partial<T>,
    private validators?: FieldsValidators<T>,
    private formValidator?: FormValidity,
  ) {
    // set reactive form
    this.values = reactive<Partial<T>>(form) as Partial<T>;
    // if validator, set fields
    this.fields = reduceWithTypes<FieldsValidators<T>, FieldsValidity<T>>(validators ?? {}, (c, v) => {
      c[v] = new FieldValidator(this.values, validators?.[v]);
      return c;
    });
    // errors accessors
    this.errors = computed(() =>
      reduceWithTypes<FieldsValidity<T>, FormValidatorErrors<T>>(this.fields, (c, v) => {
        c[v] = this.fields[v]?.errors.value;
        return c;
      }),
    );
    this._hasErrors = computed<boolean>(() => keysWithTypes(this.fields).some(k => !!this.fields[k]?.hasErrors));
    // set form validator
    this.dirty =
      formValidator?.dirty ??
      computed<boolean>(() =>
        reduceWithTypes<FieldsValidity<T>, boolean>(this.fields, (c, v) => c && !!this.fields[v]?.dirty.value, false),
      );
    this.valid =
      formValidator?.dirty ??
      computed<boolean>(() =>
        reduceWithTypes<FieldsValidity<T>, boolean>(this.fields, (c, v) => c && !!this.fields[v]?.valid.value, true),
      );
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

  markAsDirty() {
    keysWithTypes(this.fields).forEach(k => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know that value exist since we loop over keys
      this.fields[k]!.dirty.value = true;
    });
  }

  markAsPristine() {
    keysWithTypes(this.fields).forEach(k => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know that value exist since we loop over keys
      this.fields[k]!.dirty.value = false;
    });
  }

  clearForm(markAsPristine = true) {
    keysWithTypes(this.values).forEach(key => {
      this.values[key] = undefined;
      this.fields[key as keyof T]?.clearErrors();
    });
    if (markAsPristine) this.markAsPristine();
  }
}
