import ReactSelect, { ValueType, ActionMeta, StylesConfig, GroupTypeBase } from 'react-select';
import { SelectColors, BLUE, RED } from './ColorTheme';
import { useCommonContext } from './CommonContext';

import './Select.css';

export type OptionType = { label: string; value: string };

export interface Props {
    options: ReadonlyArray<OptionType>,
    dataTestId?: string,
    value: string | null,
    onChange: (value: string | null) => void,
    isInvalid?: boolean,
    disabled?: boolean,
    statusColor?: string,
    name?: string | undefined;
}

function buildStyles(colors: SelectColors, statusColor?: string, isInvalid?: boolean): StylesConfig<OptionType, false, GroupTypeBase<OptionType>> {
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

export default function Select(props: Props) {
    const { colorTheme } = useCommonContext();

    const onChange = (value: ValueType<OptionType, false>, _: ActionMeta<OptionType>) => {
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

    function toOptionType(value: string | null): OptionType | null {
        if(value === null) {
            return null;
        } else {
            return findOptionTypeByValue(value);
        }
    }

    function findOptionTypeByValue(value: string): OptionType | null {
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
                styles={ buildStyles(colorTheme.select, props.statusColor, props.isInvalid) }
                isDisabled={ props.disabled }
                name={ props.name }
            />
        </>
    );
}
