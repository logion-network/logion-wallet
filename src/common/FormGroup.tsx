import Form from "react-bootstrap/Form";

import { Children, customClassName } from './types/Helpers';
import { BackgroundAndForegroundColors } from './ColorTheme';
import './FormGroup.css';

export interface Props {
    id: string,
    label?: string,
    control: Children,
    feedback?: string,
    colors: BackgroundAndForegroundColors,
    noFeedback?: boolean,
    className?: string,
    help?: string,
}

export default function FormGroup(props: Props) {

    const inlineCss = `
    .FormGroup .form-control,
    .FormGroup .form-control[readonly],
    .FormGroup .form-control[disabled],
    .FormGroup .input-group .btn-primary {
        color: ${props.colors.foreground};
        background-color: ${props.colors.background};
    }
    `;

    const className = customClassName("FormGroup", props.className);

    return (
        <div
            className={ className }
            style={{
                backgroundColor: props.colors.background
            }}
        >
            <style>
            { inlineCss }
            </style>
            <Form.Group controlId={ props.id } data-testid={ props.id + "Group" }>
                {
                    props.label !== undefined &&
                    <Form.Label>{ props.label }</Form.Label>
                }
                { props.control }
                {
                    props.help &&
                    <Form.Text id={ `${props.id}Help` } muted>
                        { props.help }
                    </Form.Text>
                }
                {
                    (props.noFeedback === undefined || !props.noFeedback) &&
                    <Form.Control.Feedback
                        id={ props.id + "Message" }
                        type="invalid"
                        data-testid={ props.id + "Message" }
                    >
                        { props.feedback }
                   </Form.Control.Feedback>
               }
            </Form.Group>
        </div>
    );
}
