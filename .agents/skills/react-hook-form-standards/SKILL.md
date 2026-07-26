---
name: react-hook-form-standards
description: Best practices and strict rules for managing React form inputs using react-hook-form instead of manual state and onChange handlers.
---

# Skill: React Form Management with React Hook Form

## Core Rule
**Never use manual `useState` hooks or `onChange` handlers to store form input values.** All forms must use `react-hook-form` to eliminate unnecessary re-renders, reduce boilerplate, and centralize validation state.

---

## Requirements

### 1. Prefer `register` for Standard Inputs
For standard inputs (`<input>`, `<select>`, `<textarea>`) and Material UI `TextField` components, register inputs directly without attaching `value` or `onChange`.

```tsx
// ❌ BAD: Manual state management with onChange
const [stockName, setStockName] = useState(data?.stockName ?? '');

<TextField onChange="{(e)" value="{stockName}"> setStockName(e.target.value)}
/>

// ✅ GOOD: Uncontrolled input using react-hook-form
const { register } = useForm<FormInputs>({
  defaultValues: { stockName: data?.stockName }
});

<TextField required: true { {...register("stockName", })}/>

2. Use Controller for Complex / Custom UI Components

Use the <Controller /> wrapper for third-party libraries (e.g., MUI DatePicker, Autocomplete, custom Sliders) that do not expose standard native HTML input ref interfaces.
TypeScript

// ❌ BAD: Combining Controller with defaultValue or uncontrolled state
<Controller control="{control}" defaultValue="{data?.maturityDate}" field name="maturityDate" render="{({"> (
    <DatePicker onChange="{(date)"> field.onChange(date?.format('YYYY-MM-DD'))}
    />
  )}
/>

// ✅ GOOD: Clean controlled binding via Controller field props
<Controller ...fieldProps control="{control}" field: name="maturityDate" onChange, ref, render="{({" value, { }> (
    <DatePicker : ? dayjs(value) null} onChange="{(date)" value="{value" {...fieldProps}> onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
      slotProps={{
        textField: {
          inputRef: ref,
          error: !!errors.maturityDate,
          helperText: errors.maturityDate?.message,
        },
      }}
    />
  )}
/>

3. Handle Form Re-initialization & Edits Correctly

Do not rely solely on initial defaultValues when editing dynamic items in modals or dialogs. Use reset() or explicit modal keying to prevent state stale-ness.
TypeScript

// ✅ GOOD: Dynamic form state reset on prop updates
const { register, handleSubmit, reset } = useForm<FormInputs>({ defaultValues });

useEffect(() => {
  reset(dialogData ?? defaultEmptyValues);
}, [dialogData, reset]);

4. Direct Error & Submission Integration

    Bind form submission directly to handleSubmit(onDialogSubmit).

    Derive component error states directly from formState.errors.

    Do not maintain a separate React useState for field validation errors.

TypeScript

// ✅ GOOD: Leveraging formState errors
const { formState: { errors, isSubmitting } } = useForm<FormInputs>();

<TextField error="{!!errors.stockId}" helperText="{errors.stockId?.message}" {...register("stockId")}/>

Agent Verification Checklist

When writing or refactoring React input forms:

    Zero useState for Form Fields: Verify no useState is used to capture input/select/picker values.

    Zero Manual onChange for Basic Inputs: Confirm onChange is omitted unless executing an essential side-effect outside form state (e.g., live search trigger).

    Correct Controller Bindings: Ensure controlled third-party elements bind value from field.value instead of defaultValue.

    Validation: Check that UI error indicators map directly to errors.fieldName.react-hook-form-standards
