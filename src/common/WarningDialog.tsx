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
}

export default function WarningDialog(props: Props) {

    return (
        <Dialog
            show={ props.show }
            size={ props.size }
            actions={ props.actions }
            colors={ props.colors }
            modalTestId={ props.modalTestId }
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
