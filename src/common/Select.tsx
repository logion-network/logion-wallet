import ReactSelect, { OnChangeValue, ActionMeta, StylesConfig, GroupBase } from 'react-select';
import { SelectColors, BLUE, RED } from './ColorTheme';
import { useCommonContext } from './CommonContext';

import './Select.css';

export interface OptionType<T> {
    label: string;
    value: T
};

export interface Props<T> {
    options: ReadonlyArray<OptionType<T>>,
    dataTestId?: string,
    value: T | null,
    onChange: (value: T | null) => void,
    isInvalid?: boolean,
    disabled?: boolean,
    statusColor?: string,
    name?: string | undefined;
    placeholder?: string;
}

function buildStyles<T>(colors: SelectColors, statusColor?: string, isInvalid?: boolean): StylesConfig<OptionType<T>, false, GroupBase<OptionType<T>>> {
    return {
        option: (provided, state) => {
            let backgroundColor = undefined;
            let fontWeight = undefined;
            if(state.isSelected) {
                backgroundColor = colors.selectedOptionBackgroundColor;
                fontWeight = 700;
            }
            return {
                ...provided,
                backgroundColor,
                fontWeight,
            };
        },
        control: (provided) => ({
            ...provided,
            boxShadow: undefined,
            backgroundColor: controlBackgroundColor(colors, statusColor, isInvalid),
            color: colors.foreground,
            borderColor: statusColor !== undefined ? statusColor : "#3b6cf4",
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: colors.menuBackgroundColor,
        }),
        singleValue: (provided) => ({
            ...provided,
            color: statusColor === undefined ? colors.foreground : statusColor,
            fontWeight: 700,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: colors.foreground,
            opacity: 0.8,
        }),
    };
}

function controlBackgroundColor(colors: SelectColors, statusColor?: string, isInvalid?: boolean): string {
    if(statusColor !== undefined) {
        return statusColor + "33";
    } else if(isInvalid !== undefined && isInvalid) {
        return RED + "33";
    } else {
        return colors.background;
    }
}

export default function Select<T>(props: Props<T>) {
    const { colorTheme } = useCommonContext();

    const onChange = (value: OnChangeValue<OptionType<T>, false>, _: ActionMeta<OptionType<T>>) => {
        props.onChange(value !== null ? value.value : null);
    };

    const color = props.statusColor === undefined ? BLUE : props.statusColor;
    const caretVisibility = props.disabled !== undefined && props.disabled ? "hidden" : "visible";
    const customCss = `
    .Select .Select__indicator,
    .Select .Select__indicator:hover {
        color: ${color};
        visibility: ${caretVisibility};
    }
    `;

    function toOptionType(value: T | null): OptionType<T> | null {
        if(value === null) {
            return null;
        } else {
            return findOptionTypeByValue(value);
        }
    }

    function findOptionTypeByValue(value: T): OptionType<T> | null {
        for(const option of props.options) {
            if(option.value === value) {
                return option;
            }
        }
        return null;
    }

    return (
        <>
            <style>
            { customCss }
            </style>
            <ReactSelect
                className={ props.isInvalid ? "Select is-invalid" : "Select" }
                classNamePrefix="Select"
                options={ props.options }
                onChange={ onChange }
                value={ toOptionType(props.value) }
                styles={ buildStyles<T>(colorTheme.select, props.statusColor, props.isInvalid) }
                isDisabled={ props.disabled }
                name={ props.name }
                placeholder={ props.placeholder }
            />
        </>
    );
}
