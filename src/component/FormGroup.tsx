import React from 'react';
import Form from "react-bootstrap/Form";

import { Children } from './types/Helpers';
import { BackgroundAndForegroundColors } from './ColorTheme';
import './FormGroup.css';

export interface Props {
    id: string,
    label?: string,
    control: Children,
    feedback?: string,
    colors: BackgroundAndForegroundColors,
    noFeedback?: boolean,
}

export default function FormGroup(props: Props) {

    const inlineCss = `
    .FormGroup .form-control,
    .FormGroup .form-control[readonly] {
        background-color: ${props.colors.background};
        color: ${props.colors.foreground};
    }
    `;

    return (
        <div className="FormGroup">
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
                    (props.noFeedback === undefined || !props.noFeedback) &&
                    <Form.Control.Feedback
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
