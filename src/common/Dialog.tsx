import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import Button, { Action } from './Button';
import { Children, customClassName } from './types/Helpers';
import { useCommonContext } from './CommonContext';

import './Dialog.css';
import { DialogColors } from './ColorTheme';

export type ModalSize = 'sm' | 'lg' | 'xl';

export interface Props {
    show: boolean,
    children: Children,
    "data-testid"?: string,
    actions: Action[],
    size: ModalSize,
    onSubmit?: () => {},
    className?: string,
    colors?: DialogColors;
    contentVisible?: boolean;
}

export default function Dialog(props: Props) {
    const { colorTheme } = useCommonContext();

    if(props.actions.length === 0) {
        throw new Error("There is no way for this dialog to be closed");
    }

    const className = customClassName("Dialog", props.className, ((props.contentVisible !== undefined && !props.contentVisible) ? "content-hidden" : undefined));
    let colors = props.colors;
    if(colors === undefined) {
        colors = colorTheme.dialog;
    }

    return (
        <Modal
            show={ props.show }
            backdrop="static"
            keyboard={ false }
            size={ props.size }
            data-testid={ props["data-testid"] }
            className={ className }
            centered
        >
            <style>
                {
                `
                .Dialog .modal-dialog .modal-content {
                    box-shadow: 0 0 25px ${ colors };
                    color: ${ colors.foreground };
                    background-color: ${ colors.background };
                }
                `
                }
            </style>
            <Form onSubmit={ props.onSubmit }>
                <Modal.Body>
                    { props.children }
                </Modal.Body>
                <Modal.Footer>
                    {
                        props.actions.map(action => (
                            <Button
                                key={ action.id }
                                action={ action }
                            />
                        ))
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
