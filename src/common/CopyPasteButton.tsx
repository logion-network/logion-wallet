import Button from "./Button";
import Icon from "./Icon";
import { copyToClipBoard } from "./Tools";

import './CopyPasteButton.css';

export interface Props {
    value: string;
}

export default function CopyPasteButton(props: Props) {
    return (
        <Button onClick={ () => copyToClipBoard(props.value) } className="CopyPasteButton">
            <Icon icon={{id: "copy_paste"}} />
        </Button>
    );
}
