import Button from "./Button";
import Icon from "./Icon";
import { copyToClipBoard } from "./Tools";

import './CopyPasteButton.css';
import { customClassName } from "./types/Helpers";

export interface Props {
    value?: string | null;
    className?: string;
}

export default function CopyPasteButton(props: Props) {
    const value = props.value;
    if(value) {
        const className = customClassName("CopyPasteButton", props.className ? props.className : "big");
        return (
            <Button onClick={ () => copyToClipBoard(value) } className={ className }>
                <Icon icon={{id: "copy_paste"}} />
            </Button>
        );
    } else {
        return null;
    }
}
