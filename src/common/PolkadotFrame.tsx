import Frame from "./Frame";

import './PolkadotFrame.css';
import { Children } from "./types/Helpers";

export interface Props {
    children: Children;
    className?: string;
    title?: Children;
}

export default function PolkadotFrame(props: Props) {
    let className = "PolkadotFrame";
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
