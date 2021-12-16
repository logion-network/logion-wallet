import Button from "./Button";
import Icon from "./Icon";
import { copyToClipBoard } from "./Tools";

import './CopyPasteButton.css';
import { customClassName } from "./types/Helpers";

export interface Props {
    value: string;
    className?: string;
}

export default function CopyPasteButton(props: Props) {
    const className = customClassName("CopyPasteButton", props.className ? props.className : "big")
    return (
        <Button onClick={ () => copyToClipBoard(props.value) } className={ className }>
            <Icon icon={{id: "copy_paste"}} />
        </Button>
    );
}
