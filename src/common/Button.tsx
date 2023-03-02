import { CSSProperties, Key } from 'react';
import { ButtonVariant } from 'react-bootstrap/types';
import BootstrapButton from 'react-bootstrap/Button';
import { ButtonType } from '@restart/ui/esm/Button';

import { Children, customClassName } from './types/Helpers';
import { useCommonContext } from './CommonContext';
import { POLKADOT } from './ColorTheme';
import MultiChoiceButton, { Choice } from './MultiChoiceButton';

import './Button.css';

export type LogionButtonVariant = ButtonVariant | "polkadot" | "secondary-polkadot";

export interface Action {
    id: string,
    callback?: () => void,
    disabled?: boolean,
    buttonVariant: LogionButtonVariant,
    buttonText: Children,
    buttonTestId?: string,
    type?: ButtonType,
    choices?: Choice[],
}

export function isAction(action: any): action is Action {
    return "id" in action
        && "buttonVariant" in action
        && "buttonText" in action;
}

export interface Props {
    key?: Key | null | undefined;
    action?: Action,
    type?: ButtonType,
    variant?: LogionButtonVariant,
    disabled?: boolean,
    children?: Children,
    onClick?: (e?: any) => void,
    id?: string,
    "data-testid"?: string,
    slim?: boolean,
    narrow?: boolean,
    choices?: Choice[],
    className?: string,
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
    let type: ButtonType | undefined;
    let choices;
    if(props.action !== undefined) {
        key = props.action.id;
        variant = props.action.buttonVariant;
        disabled = props.action.disabled;
        onClick = props.action.callback;
        testId = props.action.buttonTestId;
        children = props.action.buttonText;
        type = props.action.type;
        choices = props.action.choices;
    } else {
        key = props.key;
        variant = props.variant;
        disabled = props.disabled;
        onClick = props.onClick;
        testId = props['data-testid'];
        children = props.children;
        id = props.id;
        type = props.type;
        choices = props.choices;
    }

    if(!type) {
        type = "button";
    }

    let style: CSSProperties = {};
    if(variant === 'secondary') {
        style.background = colorTheme.buttons.secondary.background;
        style.color = colorTheme.buttons.secondary.foreground;
    } else if(variant === 'polkadot') {
        style.backgroundColor = POLKADOT;
        style.color = "white";
    } else if(variant === 'secondary-polkadot') {
        style.backgroundColor = colorTheme.buttons.secondary.background;
        style.color = colorTheme.buttons.secondary.foreground;
        style.border = `1px solid ${POLKADOT}`;
    } else if(variant === 'link') {
        style.color = colorTheme.dashboard.foreground;
    }

    const otherClassNames = [
        (props.slim !== undefined && props.slim) ? "slim" : undefined,
        (props.narrow !== undefined && props.narrow) ? "narrow" : undefined,
        props.className
    ];
    let className = customClassName("Button", ...otherClassNames);

    if(choices === undefined) {
        return (
            <BootstrapButton
                id={ id }
                key={ key }
                variant={ variant }
                disabled={ disabled }
                onClick={ onClick }
                data-testid={ testId }
                className={ className }
                style={ style }
                type={ type }
            >
                { children }
            </BootstrapButton>
        );
    } else {
        return (
            <MultiChoiceButton
                key={ key }
                text={ children || "" }
                choices={ choices }
            />
        );
    }
}
