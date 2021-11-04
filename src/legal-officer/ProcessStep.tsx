import React from 'react';
import { ButtonVariant } from 'react-bootstrap/types';

import Dialog from '../common/Dialog';
import { Action } from '../common/Button';
import { Choice } from '../common/MultiChoiceButton';

export interface NextStep {
    id: string,
    callback?: () => void,
    mayProceed: boolean,
    buttonVariant: ButtonVariant,
    buttonText: string,
    buttonTestId?: string,
    choices?: Choice[],
}

export interface Props {
    active: boolean,
    closeCallback?: () => void,
    title: string,
    children: JSX.Element | JSX.Element[] | null,
    mayProceed?: boolean,
    proceedCallback?: () => void,
    stepTestId?: string,
    proceedButtonTestId?: string,
    closeButtonTestId?: string,
    nextSteps?: NextStep[],
}

function toAction(nextStep: NextStep): Action {
    if(nextStep.callback === undefined && (nextStep.choices === undefined || nextStep.choices.length === 0)) {
        throw new Error("The step does nothing");
    }
    return {
        id: nextStep.id,
        callback: nextStep.callback,
        disabled: !nextStep.mayProceed,
        buttonVariant: nextStep.buttonVariant,
        buttonText: nextStep.buttonText,
        buttonTestId: nextStep.buttonTestId,
        choices: nextStep.choices
    };
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
        <Dialog
            show={ props.active }
            size="lg"
            data-testid={ props.stepTestId }
            actions={ nextSteps.map(nextStep => toAction(nextStep)) }
        >
            <>
                <h2>{ props.title }</h2>
                { props.children }
            </>
        </Dialog>
    );
}
