import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import Button, { Action, isAction } from './Button';
import { Children, customClassName } from './types/Helpers';
import { useCommonContext } from './CommonContext';

import './Dialog.css';
import { DialogColors } from './ColorTheme';

export type ModalSize = 'sm' | 'lg' | 'xl';

export interface Props {
    show: boolean,
    children: Children,
    "data-testid"?: string,
    actions: (Action | React.ReactNode)[],
    size: ModalSize,
    onSubmit?: () => void,
    className?: string,
    colors?: DialogColors;
    contentVisible?: boolean;
    onHide?: () => void;
}

export default function Dialog(props: Props) {
    const { colorTheme } = useCommonContext();

    const className = customClassName("Dialog", props.className, ((props.contentVisible !== undefined && !props.contentVisible) ? "content-hidden" : undefined));
    let colors = props.colors;
    if(colors === undefined) {
        colors = colorTheme.dialog;
    }

    const dismissable = props.onHide !== undefined;

    return (
        <Modal
            show={ props.show }
            backdrop={ dismissable ? true : "static" }
            keyboard={ dismissable }
            size={ props.size }
            data-testid={ props["data-testid"] }
            className={ className }
            centered
            onHide={ props.onHide }
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
                        props.actions.map(action => {
                            if(isAction(action)) {
                                return <Button
                                    key={ action.id }
                                    action={ action }
                                />
                            } else {
                                return action;
                            }
                        })
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
