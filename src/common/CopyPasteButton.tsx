import Button from "./Button";
import Icon from "./Icon";
import { copyToClipBoard } from "./Tools";

import './CopyPasteButton.css';
import { customClassName } from "./types/Helpers";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export interface Props {
    value?: string | null;
    className?: string;
    tooltip?: string;
}

export default function CopyPasteButton(props: Props) {
    const value = props.value;
    if(value) {
        if(props.tooltip) {
            return (
                <OverlayTrigger
                    placement="bottom"
                    delay={ 500 }
                    overlay={
                        <Tooltip id={`copy-paste-${props.value}`}>
                            { props.tooltip }
                        </Tooltip>
                    }
                >
                    <span className="Button-container">
                        { renderButton(props) }
                    </span>
                </OverlayTrigger>
            );
        } else {
            return renderButton(props);
        }
    } else {
        return null;
    }
}

function renderButton(props: Props) {
    const className = customClassName("CopyPasteButton", props.className ? props.className : "big");
    return (
        <Button onClick={ () => copyToClipBoard(props.value || "") } className={ className }>
            <Icon icon={{id: "copy_paste"}} />
        </Button>
    );
}
