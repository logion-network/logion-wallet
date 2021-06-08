import React from 'react';
import { ButtonVariant } from 'react-bootstrap/types';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export interface NextStep {
    id: string,
    callback: () => void,
    mayProceed: boolean,
    buttonVariant: ButtonVariant,
    buttonText: string,
    buttonTestId?: string,
}

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
    nextSteps?: NextStep[],
}

export default function ProcessStep(props: Props) {

    if(!props.active) {
        return null;
    }

    const closable = props.closeCallback !== undefined;
    const hasNext = props.proceedCallback !== undefined;

    if(hasNext && props.nextSteps !== undefined) {
        throw new Error("Cannot define both proceedCallback and nextSteps attributes");
    }

    let nextSteps: NextStep[];
    if(props.nextSteps !== undefined) {
        nextSteps = props.nextSteps;
    } else {
        nextSteps = [];
        if(closable) {
            nextSteps.push({
                id: "close",
                callback: props.closeCallback!,
                mayProceed: true,
                buttonVariant: hasNext ? "secondary" : "primary",
                buttonText: "Close",
                buttonTestId: props.closeButtonTestId
            });
        }

        if(hasNext) {
            nextSteps.push({
                id: "proceed",
                callback: props.proceedCallback!,
                mayProceed: props.mayProceed ? props.mayProceed : false,
                buttonVariant: "primary",
                buttonText: "Proceed",
                buttonTestId: props.proceedButtonTestId
            });
        }
    }

    if(nextSteps.length === 0) {
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
                    nextSteps.map(nextStep => (
                        <Button
                            key={ nextStep.id }
                            variant={ nextStep.buttonVariant }
                            disabled={ !nextStep.mayProceed }
                            onClick={ nextStep.callback }
                            data-testid={ nextStep.buttonTestId }
                        >
                            { nextStep.buttonText }
                        </Button>
                    ))
                }
            </Modal.Footer>
        </Modal>
    );
}
