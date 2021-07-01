import React from 'react';
import { ButtonVariant } from 'react-bootstrap/types';
import BootstrapButton, { ButtonType } from 'react-bootstrap/Button';

import { Children } from './types/Helpers';

import './Button.css';

export interface Action {
    id: string,
    callback?: () => void,
    disabled?: boolean,
    buttonVariant: ButtonVariant,
    buttonText: Children,
    buttonTestId?: string,
}

export interface Props {
    action?: Action,
    backgroundColor: string,
    type?: ButtonType,
    key?: string,
    variant?: ButtonVariant,
    disabled?: boolean,
    dataTestid?: string,
    children?: Children,
    onClick?: () => void,
    id?: string,
}

export default function Button(props: Props) {

    let key;
    let variant;
    let disabled;
    let onClick;
    let testId;
    let children;
    let id;
    if(props.action !== undefined) {
        key = props.action.id;
        variant = props.action.buttonVariant;
        disabled = props.action.disabled;
        onClick = props.action.callback;
        testId = props.action.buttonTestId;
        children = props.action.buttonText;
    } else {
        key = props.key;
        variant = props.variant;
        disabled = props.disabled;
        onClick = props.onClick;
        testId = props.dataTestid;
        children = props.children;
        id = props.id;
    }

    return (
        <BootstrapButton
            id={ id }
            key={ key }
            variant={ variant }
            disabled={ disabled }
            onClick={ onClick }
            data-testid={ testId }
            className="Button"
            style={{
                backgroundColor: props.backgroundColor
            }}
            type={ props.type }
        >
            { children }
        </BootstrapButton>
    );
}
