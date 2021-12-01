import Dialog, { ModalSize } from './Dialog';
import { Action } from './Button';

import { Children } from './types/Helpers';

import './DangerDialog.css';
import { DialogColors } from './ColorTheme';

export interface Props {
    show: boolean,
    modalTestId?: string,
    actions: Action[],
    size: ModalSize,
    children: Children,
    colors?: DialogColors,
}

export default function DangerDialog(props: Props) {

    return (
        <Dialog
            show={ props.show }
            size={ props.size }
            actions={ props.actions }
            data-testid={ props.modalTestId }
            className="DangerDialog"
            colors={ props.colors }
        >
            { props.children }
        </Dialog>
    );
}
