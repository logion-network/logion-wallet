import { useCallback } from "react";
import { Dropdown, DropdownButton, Form, InputGroup } from "react-bootstrap";
import { Numbers, Currency } from '@logion/node-api';

export interface Amount {
    value: string;
    unit: Numbers.UnitPrefix
}

export interface Props {
    isInvalid?: boolean;
    value?: Amount;
    onChange?: (value: Amount) => void;
    feedback?: string;
    placeholder?: string;
}

export function validateAmount(amount: Amount | undefined): string | undefined {
    if(amount !== undefined && amount !== null && (amount.value === "" || isNaN(Number(amount.value)))) {
        return "Invalid amount";
    } else {
        return undefined;
    }
}

export default function AmountControl(props: Props) {

    const onChangeValue = useCallback((value: string) => {
        if(props.onChange) {
            props.onChange({
                value,
                unit: props.value?.unit || Numbers.NONE,
            });
        }
    }, [ props ]);

    const onChangeUnit = useCallback((unit: Numbers.UnitPrefix) => {
        if(props.onChange) {
            props.onChange({
                value: props.value?.value || "0",
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
                title={ `${ props.value?.unit.symbol || Numbers.NONE.symbol }${ Currency.SYMBOL }` }
            >{
                [
                    Numbers.NONE,
                    Numbers.MILLI,
                    Numbers.MICRO,
                    Numbers.NANO,
                    Numbers.PICO,
                    Numbers.FEMTO,
                    Numbers.ATTO
                ].map(unit => <Dropdown.Item key={ unit.symbol } onClick={ () => onChangeUnit(unit) }>{ `${ unit.symbol }${ Currency.SYMBOL }` }</Dropdown.Item>)
            }</DropdownButton>
        </InputGroup>
    );
}
