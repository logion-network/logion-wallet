import React from 'react';
import ReactSelect, { ValueType, ActionMeta, StylesConfig, GroupTypeBase } from 'react-select';
import { SelectColors, BLUE } from './ColorTheme';

import './Select.css';

export type OptionType = { label: string; value: string };

export interface Props {
    options: ReadonlyArray<OptionType>,
    dataTestId?: string,
    value: OptionType | null,
    onChange: (value: OptionType | null) => void,
    isInvalid?: boolean,
    colors: SelectColors,
    disabled?: boolean,
    statusColor?: string,
}

function buildStyles(colors: SelectColors, statusColor?: string): StylesConfig<OptionType, false, GroupTypeBase<OptionType>> {
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
            backgroundColor: statusColor !== undefined ? statusColor + "33" : colors.background,
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

export default function Select(props: Props) {
    const onChange = (value: ValueType<OptionType, false>, _: ActionMeta<OptionType>) => {
        props.onChange(value);
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
                value={ props.value }
                styles={ buildStyles(props.colors, props.statusColor) }
                isDisabled={ props.disabled }
            />
        </>
    );
}
