import { Children } from './types/Helpers';

import './Clickable.css';

export interface Props {
    children: Children,
}

export default function Clickable(props: Props) {
    return (
        <div className="Clickable">
            { props.children }
        </div>
    );
}
