import React from 'react';
import ReactSelect, { ValueType, ActionMeta, StylesConfig, GroupTypeBase } from 'react-select';
import { SelectColors } from './ColorTheme';

import './Select.css';

export type OptionType = { label: string; value: string };

export interface Props {
    options: ReadonlyArray<OptionType>,
    dataTestId?: string,
    value: OptionType | null,
    onChange: (value: OptionType | null) => void,
    isInvalid?: boolean,
    colors: SelectColors,
}

function buildStyles(colors: SelectColors): StylesConfig<OptionType, false, GroupTypeBase<OptionType>> {
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
            backgroundColor: colors.background,
            color: colors.foreground,
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: colors.menuBackgroundColor,
        }),
        singleValue: (provided) => ({
            ...provided,
            color: colors.foreground,
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

    return (
        <ReactSelect
            className={ props.isInvalid ? "Select is-invalid" : "Select" }
            classNamePrefix="Select"
            options={ props.options }
            onChange={ onChange }
            value={ props.value }
            styles={ buildStyles(props.colors) }
        />
    );
}
