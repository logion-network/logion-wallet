import Frame from "./Frame";

import './DangerFrame.css';
import { Children } from "./types/Helpers";

export interface Props {
    children: Children;
    className?: string;
    title?: Children;
}

export default function DangerFrame(props: Props) {
    let className = "DangerFrame";
    if(props.className) {
        className = `${className} ${props.className}`;
    }
    return (
        <Frame
            className={ className }
            title={ props.title }
        >
            { props.children }
        </Frame>
    );
}
