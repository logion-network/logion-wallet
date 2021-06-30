import React from 'react';

import Dialog, { ModalSize } from './Dialog';
import { Action } from './Button';
import Icon from './Icon';

import { Children } from './types/Helpers';
import { ColorTheme } from './ColorTheme';

import './WarningDialog.css';

export interface Props {
    show: boolean,
    modalTestId?: string,
    actions: Action[],
    size: ModalSize,
    colors: ColorTheme,
    children: Children,
    spaceAbove?: string,
}

export default function WarningDialog(props: Props) {

    return (
        <Dialog
            show={ props.show }
            size={ props.size }
            actions={ props.actions }
            colors={ props.colors }
            modalTestId={ props.modalTestId }
            spaceAbove={ props.spaceAbove }
        >
            <Icon
                colorThemeType={ props.colors.type }
                icon={{
                    id: "warning"
                }}
            />
            <p className="dialog-text">
                { props.children }
            </p>
        </Dialog>
    );
}
