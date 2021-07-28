import { Children } from './types/Helpers';

import './Clickable.css';

export interface Props {
    children: Children,
    onClick?: () => void,
}

export default function Clickable(props: Props) {
    return (
        <div className="Clickable" onClick={ props.onClick }>
            { props.children }
        </div>
    );
}
