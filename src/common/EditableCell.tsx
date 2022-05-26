import { Form } from "react-bootstrap";
import { Cell } from "./Table";

export interface Props {
    value: string;
    onChange: (value: string) => void;
}

export default function EditableCell(props: Props) {

    return (
        <Cell content={
            <Form.Control
                type="text"
                value={ props.value }
                onChange={ e => props.onChange(e.target.value) }
            />
        } />
    );
}
