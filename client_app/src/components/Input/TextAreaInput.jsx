import { useState } from "react";
import { Formik, Form, useField } from 'formik';
function TextAreaInput({
    label,
    icons,
    hasTextareaHeight,
    labelColor,
    labelFor,
    itemClass,
    placeholder,
    isRequired,
    ...props
}) {
    // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
    // which we can spread on <input>. We can use field meta to show an error
    // message if the field is invalid and it has been touched (i.e. visited)
    const [field, meta] = useField(props);

    let controlClassName = [
        'h-24 px-3 py-2 max-w-full border-gray-700 rounded w-full dark:placeholder-gray-400',
        meta.touched && meta.error
            ? 'px-3 py-2 max-w-full border-2 border-red-600 rounded w-full dark:placeholder-red-600'
            : '',
        'focus:ring focus:ring-blue-600 focus:border-blue-600 focus:outline-none',
        props.hasTextareaHeight ? 'h-24' : 'h-12',
        props.isBorderless ? 'border-0' : 'border',
        props.isTransparent ? 'bg-transparent' : 'bg-white dark:bg-slate-800',

        'rounded-lg',
        '',

    ].join(' ');
    return (
        <div className="mb-6 last:mb-0">
            {label && <label className={`mt-2 font-bold text-neutral-600  block mb-2 ${labelColor}`}>
                {label} {isRequired ? '*' : ''} </label>
            }        <div className="relative">
                <textarea

                    className={controlClassName}
                    placeholder={placeholder || ""}
                    {...field}
                    {...props}
                />
            </div>
            {meta.touched && meta.error ? (
                <div className="text-xs text-left text-red-500 dark:text-red-400 mt-1">
                    {meta.error}
                </div>
            ) : null}
        </div>
    );
}

export default TextAreaInput;
