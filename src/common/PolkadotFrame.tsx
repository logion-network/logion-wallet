import Frame from "./Frame";

import './PolkadotFrame.css';
import { Children } from "./types/Helpers";
import { ColorTheme } from "./ColorTheme";

export interface Props {
    children: Children;
    className?: string;
    title?: Children;
    colorTheme?: ColorTheme
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
            colorTheme={ props.colorTheme }
        >
            { props.children }
        </Frame>
    );
}
