import React, { CSSProperties } from 'react';
import { ButtonVariant } from 'react-bootstrap/types';
import BootstrapButton, { ButtonType } from 'react-bootstrap/Button';

import { Children } from './types/Helpers';
import { useCommonContext } from './CommonContext';

import './Button.css';

export interface Action {
    id: string,
    callback?: () => void,
    disabled?: boolean,
    buttonVariant: ButtonVariant,
    buttonText: Children,
    buttonTestId?: string,
    type?: ButtonType,
}

export interface Props {
    action?: Action,
    type?: ButtonType,
    key?: string,
    variant?: ButtonVariant,
    disabled?: boolean,
    children?: Children,
    onClick?: (e?: any) => void,
    id?: string,
    "data-testid"?: string,
    slim?: boolean,
}

export default function Button(props: Props) {
    const { colorTheme } = useCommonContext();

    let key;
    let variant;
    let disabled;
    let onClick;
    let testId;
    let children;
    let id;
    let type;
    if(props.action !== undefined) {
        key = props.action.id;
        variant = props.action.buttonVariant;
        disabled = props.action.disabled;
        onClick = props.action.callback;
        testId = props.action.buttonTestId;
        children = props.action.buttonText;
        type = props.action.type;
    } else {
        key = props.key;
        variant = props.variant;
        disabled = props.disabled;
        onClick = props.onClick;
        testId = props['data-testid'];
        children = props.children;
        id = props.id;
        type = props.type;
    }

    let style: CSSProperties = {};
    if(variant === 'secondary') {
        style.backgroundColor = colorTheme.buttons.secondary.background;
        style.color = colorTheme.buttons.secondary.foreground;
    }

    return (
        <BootstrapButton
            id={ id }
            key={ key }
            variant={ variant }
            disabled={ disabled }
            onClick={ onClick }
            data-testid={ testId }
            className={ "Button" + ((props.slim !== undefined && props.slim) ? " slim" : "") }
            style={ style }
            type={ type }
        >
            { children }
        </BootstrapButton>
    );
}
