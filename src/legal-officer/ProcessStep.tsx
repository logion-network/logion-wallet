import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export interface Props {
    active: boolean,
    closeCallback?: () => void,
    title: string,
    children?: JSX.Element | JSX.Element[] | null,
    mayProceed?: boolean,
    proceedCallback?: () => void,
    stepTestId?: string,
    proceedButtonTestId?: string,
    closeButtonTestId?: string,
}

export default function ProcessStep(props: Props) {

    if(!props.active) {
        return null;
    }

    const closable = props.closeCallback !== undefined;
    const hasNext = props.proceedCallback !== undefined;

    if(!closable && !hasNext) {
        throw new Error("This process step is a trap");
    }

    return (
        <Modal
            show={ props.active }
            backdrop={ closable ? true : "static" }
            keyboard={ closable }
            size="lg"
            data-testid={ props.stepTestId }
            onHide={ props.closeCallback }
        >
            <Modal.Header closeButton={ closable }>
                <Modal.Title>{ props.title }</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { props.children }
            </Modal.Body>
            <Modal.Footer>
                {
                    closable &&
                    <Button
                        variant={ hasNext ? "secondary" : "primary" }
                        onClick={ props.closeCallback }
                        data-testid={ props.closeButtonTestId }
                    >
                        Close
                    </Button>
                }
                {
                    hasNext &&
                    <Button
                        variant="primary"
                        disabled={ !props.mayProceed }
                        onClick={ props.proceedCallback }
                        data-testid={ props.proceedButtonTestId }
                    >
                        Proceed
                    </Button>
                }
            </Modal.Footer>
        </Modal>
    );
}
