import React, { CSSProperties } from 'react';
import Modal from 'react-bootstrap/Modal';

import Button, { Action } from './Button';
import { Children } from './types/Helpers';
import { ColorTheme } from './ColorTheme';

import './Dialog.css';

export type ModalSize = 'sm' | 'lg' | 'xl';

export interface Props {
    show: boolean,
    children: Children,
    modalTestId?: string,
    actions: Action[],
    size: ModalSize,
    colors: ColorTheme,
    spaceAbove?: string,
}

export default function Dialog(props: Props) {

    if(props.actions.length === 0) {
        throw new Error("There is no way for this dialog to be closed");
    }

    let customStyle: CSSProperties = {};
    if(props.spaceAbove !== undefined) {
        customStyle['paddingTop'] = props.spaceAbove;
    }

    return (
        <Modal
            show={ props.show }
            backdrop="static"
            keyboard={ false }
            size={ props.size }
            data-testid={ props.modalTestId }
            style={ customStyle }
            className="Dialog"
        >
            <style>
                {
                `
                .Dialog .modal-dialog {
                    background-color: white;
                }
                .Dialog .modal-dialog .modal-content {
                    box-shadow: 0 0 25px ${props.colors.shadowColor};
                    border-color: ${props.colors.dialog.borderColor};
                    color: ${props.colors.dialog.foreground};
                    background-color: ${props.colors.dialog.background};
                }
                `
                }
            </style>
            <Modal.Body>
                { props.children }
            </Modal.Body>
            <Modal.Footer>
                {
                    props.actions.map(action => (
                        <Button
                            key={ action.id }
                            action={ action }
                            colors={ props.colors.buttons }
                        />
                    ))
                }
            </Modal.Footer>
        </Modal>
    );
}
