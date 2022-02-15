import { Form } from "react-bootstrap";

import { BackgroundAndForegroundColors } from "./ColorTheme";
import FormGroup from "./FormGroup";
import { Children } from "./types/Helpers";

import './CheckedControl.css';

export interface Props {
    baseId: string;
    checked: boolean;
    onChangeChecked: (value: boolean) => void;
    valueControl: Children,
    label: string;
    type: string;
    colors: BackgroundAndForegroundColors;
    append?: React.ReactNode;
}

export default function CheckedControl(props: Props) {
    return (
        <div className="CheckedControl">
            <FormGroup
                id={`${props.baseId}Check`}
                control={
                    <Form.Check
                        type="checkbox"
                        checked={ props.checked }
                        onChange={ () => props.onChangeChecked(!props.checked) }
                    />
                }
                colors={ props.colors }
            />
            <FormGroup
                id={`${props.baseId}Value`}
                className="value-group"
                label={ props.label }
                control={ props.valueControl }
                colors={ props.colors }
            />
            {
                props.append !== undefined && props.append
            }
        </div>
    );
}
