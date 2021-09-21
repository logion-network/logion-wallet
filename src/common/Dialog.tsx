import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import Button, { Action } from './Button';
import { Children } from './types/Helpers';
import { useCommonContext } from './CommonContext';

import './Dialog.css';

export type ModalSize = 'sm' | 'lg' | 'xl';

export interface Props {
    show: boolean,
    children: Children,
    "data-testid"?: string,
    actions: Action[],
    size: ModalSize,
    onSubmit?: () => {},
}

export default function Dialog(props: Props) {
    const { colorTheme } = useCommonContext();

    if(props.actions.length === 0) {
        throw new Error("There is no way for this dialog to be closed");
    }

    return (
        <Modal
            show={ props.show }
            backdrop="static"
            keyboard={ false }
            size={ props.size }
            data-testid={ props["data-testid"] }
            className="Dialog"
            centered
        >
            <style>
                {
                `
                .Dialog .modal-dialog .modal-content {
                    box-shadow: 0 0 25px ${colorTheme.shadowColor};
                    border-color: ${colorTheme.dialog.borderColor};
                    color: ${colorTheme.dialog.foreground};
                    background-color: ${colorTheme.dialog.background};
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
