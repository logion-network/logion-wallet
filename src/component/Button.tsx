import React from 'react';
import { ButtonVariant } from 'react-bootstrap/types';
import BootstrapButton from 'react-bootstrap/Button';

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
    action: Action,
    backgroundColor: string,
}

export default function Button(props: Props) {

    let type = undefined;
    if(props.action.callback === undefined) {
        type = "submit";
    }

    return (
        <BootstrapButton
            key={ props.action.id }
            variant={ props.action.buttonVariant }
            disabled={ props.action.disabled }
            onClick={ props.action.callback }
            data-testid={ props.action.buttonTestId }
            className="Button"
            style={{
                backgroundColor: props.backgroundColor
            }}
            type={ type }
        >
            { props.action.buttonText }
        </BootstrapButton>
    );
}
