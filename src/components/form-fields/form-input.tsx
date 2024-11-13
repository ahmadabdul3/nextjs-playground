'use client'
import styles from "./form-input.module.css";


import React, { ReactNode } from 'react';

type formFieldProps = {
    label: string,
    field?: ReactNode,
    message: string,
    error: string,
    endContent?: ReactNode,
};

export function FormField({
    label,
    field,
    message,
    error,
    endContent,
}: formFieldProps) {

    return (
        <div className={styles.formFieldContainer}>
            { label && <FormFieldLabel>{ label }</FormFieldLabel>}
            <div className={styles.formFieldInputContainer}>
                {
                    endContent && (
                        <div className={styles.formFieldEndContent}>
                            { endContent }
                        </div>
                    )
                }
                { field }
            </div>
            { message && <FormFieldMessage>{ message }</FormFieldMessage>}
            { error && <FormFieldError>{ error }</FormFieldError>}
        </div>
    );
}

function FormFieldLabel({ children = '' }) {

    return (
        <label className={styles.formFieldLabel}>
            { children }
        </label>
    );
}

function FormFieldMessage({ children = '' }) {
    return (
        <p className={styles.formFieldMessage}>
            { children }
        </p>
    );
}

function FormFieldError({ children = '' }) {
    return (
        <p className={styles.formFieldMessage + ' ' + styles.formFieldError}>
            { children }
        </p>
    );
}


export type onChangeParams = {
    e: any,
    name: string,
    value: string,
};

function onChangeDefault(params: onChangeParams) {}


export function Input({ 
    type = 'text', 
    name = '', 
    value = '',
    error = '',
    uncontrolled = false,
    onChange = onChangeDefault,
    onBlur = onChangeDefault
}) {
    const _onChange = React.useCallback((e: any) => {
        onChange({ e, name, value: e.target.value });
    }, [onChange]);

    const _onBlur = React.useCallback((e: any) => {
        onBlur({ e, name, value: e.target.value });
    }, [onBlur]);

    let className = styles.basicInput;
    if (error) className += ' ' + styles.basicInputError;

    let val: string | undefined = value;
    if (uncontrolled) val = undefined;

    return (
        <input 
            className={className} 
            type={type} 
            name={name} 
            onChange={_onChange} 
            onBlur={_onBlur}
            value={val}
        />
    );
}

export function FormPasswordInput({ 
    label = 'Password', 
    message = '', 
    name = '',
    error = '',
    value = '',
    onChange = onChangeDefault,
    onBlur = onChangeDefault,
    uncontrolled = true,
}) {
    return (
        <FormField
            label={label}
            message={message}
            error={error}
            field={(
                <Input 
                    type='password'
                    error={error} 
                    onChange={onChange} 
                    onBlur={onBlur}
                    name={name} 
                    value={value} 
                    uncontrolled={uncontrolled}
                />
            )}
            endContent={<IconPlaceholder />}
        />
    );
}

function IconPlaceholder() {
    return <div className={styles.iconPlaceholder} />;
}

export function useFormInputState({
    onChange = onChangeDefault,
    onBlur = onChangeDefault,
    validate = ({ value = '' }) => ({ isValid: true }),
    isRequired = false,
}) {
    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');

    const resetMessages = () => {
        setError('');
        setMessage('');
    };

    const _validate = ({ value = '' } = {}) => {
        if (isRequired && !value) {
            setMessage('This field is required');
            setError('');
            return;
        }

        const { isValid = true } = validate({ value });
        if (!isValid) return;

        // - if we reach this point, the email is valid
        //   so we can clear errors
        setError('');
    };

    const _onChange = React.useCallback((props: onChangeParams) => {
        // console.log('*** on change', value);
        setValue(props.value);
        if (!error) resetMessages();
        else {
            // - if theres an error we want 
            //   to validate on each change
            //   to clear the error out when 
            //   a correct email is submitted
            setMessage('');
            _validate({ value: props.value });
        }
        onChange?.(props);
    }, [error, onChange]);

    const _onBlur = React.useCallback((props: onChangeParams) => {
        // console.log('*** on blur', value);
        resetMessages();
        _validate({ value: props.value });
        onBlur?.(props);
    }, [onBlur]);

    return {
        value, 
        error,
        message,
        setError,
        setMessage,
        onChange: _onChange,
        onBlur: _onBlur,
    };
}

export function useFormTextInput({
    label = '', 
    name = '',
    error = '',
    value = '',
    message = '', 
    onChange = onChangeDefault,
    uncontrolled = false,
    isRequired = false,
} = {}) {
    const state = useFormInputState({
        onChange,
        isRequired,
    });

    return {
        value: state.value,
        error: state.error,
        textInput: (
            <FormTextInput
                label={label}
                message={message || state.message}
                name={name}
                error={error || state.error}
                value={value || state.value}
                onChange={state.onChange}
                onBlur={state.onBlur}
                uncontrolled={uncontrolled}
            />
        ),
    };
}

export function FormTextInput({ 
    label = '', 
    message = '', 
    name = '',
    error = '',
    value = '',
    onChange = onChangeDefault,
    onBlur = onChangeDefault,
    uncontrolled = true,
}) {
    return (
        <FormField
            label={label}
            message={message}
            error={error}
            field={(
                <Input 
                    error={error} 
                    onChange={onChange} 
                    onBlur={onBlur}
                    name={name} 
                    value={value} 
                    uncontrolled={uncontrolled}
                />
            )}
        />
    );
}

export function useFormEmailInput({
    onChange = onChangeDefault,
    onBlur = onChangeDefault,
    label = 'Email', 
    name = '',
    isRequired = true,
} = {}) {
    const {
        value: _val,
        error,
        message,
        onChange: _onChange,
        onBlur: _onBlur,
        setError,
    } = useFormInputState({
        onChange,
        onBlur,
        isRequired,
        validate
    });

    function validate ({ value = '' } = {}) {
        const parts = value.split('@');

        let invalidFormat = false;

        // - if length is 1, that means there was no @ symbol
        //   and a true split didnt happen
        if (parts.length === 1) invalidFormat = true;
        // - part before @ is empty (x@y.c) <- missing 'x'
        else if (!parts[0]) invalidFormat = true;
        // - part after @ is empty (x@y.c) <- missing 'y.c'
        else if (!parts[1]) invalidFormat = true;

        const invalidEmailError = 'Invalid format (ex@email.co)';

        if (invalidFormat) {
            setError(invalidEmailError);
            return { isValid: false };
        }

        const partsAfterAt = parts[1].split('.');

        // - if length is 1, then there was no '.'
        //   and a true split didnt happen
        if (partsAfterAt.length === 1) invalidFormat = true;
        // - part before . is empty (x@y.c) <- missing 'y'
        else if (!partsAfterAt[0]) invalidFormat = true;
        // - part after . is empty (x@y.c) <- missing 'c'
        else if (!partsAfterAt[1]) invalidFormat = true;

        if (invalidFormat) {
            setError(invalidEmailError);
            return { isValid: false }
        }

        return { isValid: true };
    }


    return {
        value: _val,
        error,
        emailInput: (
            <FormEmailInput 
                onChange={_onChange} 
                onBlur={_onBlur} 
                label={label}
                message={message}
                name={name}
                error={error}
                value={_val}
                uncontrolled={false}
            />
        ),
    }
}

export function FormEmailInput({ 
    label = 'Email', 
    message = '', 
    name = '',
    error='',
    value = '',
    uncontrolled = true,
    onChange = onChangeDefault,
    onBlur = onChangeDefault,
}) {
    return (
        <FormField
            label={label}
            message={message}
            error={error}
            field={(
                <Input 
                    onChange={onChange} 
                    error={error} 
                    name={name} 
                    onBlur={onBlur} 
                    value={value} 
                    uncontrolled={uncontrolled}
                />
            )}
        />
    );
}

