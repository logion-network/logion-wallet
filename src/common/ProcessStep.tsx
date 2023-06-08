import { ButtonVariant } from 'react-bootstrap/types';

import Dialog from './Dialog';
import { Action } from './Button';
import { Choice } from './MultiChoiceButton';
import { Children } from './types/Helpers';

export interface NextStep {
    id: string,
    callback?: () => void,
    mayProceed: boolean,
    buttonVariant: ButtonVariant,
    buttonText: string,
    choices?: Choice[],
}

export interface Props {
    active: boolean,
    title?: string,
    children: Children,
    nextSteps?: NextStep[],
    hasSideEffect?: boolean,
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
        choices: nextStep.choices
    };
}

export default function ProcessStep(props: Props) {

    if(!props.active) {
        return null;
    }

    let nextSteps: NextStep[] = props.nextSteps || [];
    if(nextSteps.length === 0 && (props.hasSideEffect === undefined || !props.hasSideEffect)) {
        throw new Error("This process step is a trap");
    }

    return (
        <Dialog
            show={ props.active }
            size="lg"
            actions={ nextSteps.map(nextStep => toAction(nextStep)) }
        >
            <>
                { props.title && <h2>{ props.title }</h2> }
                { props.children }
            </>
        </Dialog>
    );
}
