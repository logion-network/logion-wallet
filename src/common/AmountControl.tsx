import { useCallback } from "react";
import { Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { SYMBOL } from "@logion/node-api/dist/Balances";

import { ATTO, FEMTO, MICRO, MILLI, NANO, NONE, PICO, UnitPrefix } from '@logion/node-api/dist/numbers';

export interface Amount {
    value: string;
    unit: UnitPrefix
}

export interface Props {
    isInvalid?: boolean;
    value?: Amount;
    onChange?: (value: Amount) => void;
    feedback?: string;
    placeholder?: string;
}

export function validateAmount(amount: Amount): string | undefined {
    if(amount.value === "" || isNaN(Number(amount.value))) {
        return "Invalid amount";
    } else {
        return undefined;
    }
}

export default function AmountControl(props: Props) {

    const onChangeValue = useCallback((value: string) => {
        if(props.value && props.onChange) {
            props.onChange({
                value,
                unit: props.value.unit
            });
        }
    }, [ props ]);

    const onChangeUnit = useCallback((unit: UnitPrefix) => {
        if(props.value && props.onChange) {
            props.onChange({
                value: props.value.value,
                unit
            });
        }
    }, [ props ]);

    return (
        <InputGroup
            className={ props.isInvalid ? "is-invalid" : "" }
        >
            <Form.Control
                isInvalid={ props.isInvalid }
                type="text"
                placeholder={ props.placeholder }
                value={ props.value?.value }
                onChange={ event => onChangeValue(event.target.value) }
            />
            <DropdownButton
                title={ `${ props.value?.unit.symbol || NONE.symbol }${ SYMBOL }` }
            >{
                [
                    NONE,
                    MILLI,
                    MICRO,
                    NANO,
                    PICO,
                    FEMTO,
                    ATTO
                ].map(unit => <Dropdown.Item key={ unit.symbol } onClick={ () => onChangeUnit(unit) }>{ `${ unit.symbol }${ SYMBOL }` }</Dropdown.Item>)
            }</DropdownButton>
        </InputGroup>
    );
}
