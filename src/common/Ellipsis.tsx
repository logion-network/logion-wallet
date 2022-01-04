import { Children } from "./types/Helpers";

import './Ellipsis.css';

export interface Props {
    children: Children;
    maxWidth: string;
}

export default function Ellipsis(props: Props) {
    return (
        <span className="Ellipsis" style={{maxWidth: props.maxWidth}}>
            { props.children }
        </span>
    );
}
