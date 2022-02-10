import { Form } from "react-bootstrap";
import { BackgroundAndForegroundColors } from "./ColorTheme";
import FormGroup from "./FormGroup";

import './CheckedControl.css';

export interface Props {
    baseId: string;
    checked: boolean;
    onChangeChecked: (value: boolean) => void;
    value: string;
    onChangeValue: (value: string) => void;
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
                control={
                    <Form.Control
                        type={ props.type }
                        value={ props.value }
                        onChange={ e => props.onChangeValue(e.target.value) }
                    />
                }
                colors={ props.colors }
            />
            {
                props.append !== undefined && props.append
            }
        </div>
    );
}
