import { useCallback } from "react";
import Button from "./Button";
import Icon from "./Icon";
import { copyToClipBoard } from "./Tools";

import './CopyPasteButton.css';
import { customClassName } from "./types/Helpers";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useCommonContext } from "./CommonContext";

export interface Props {
    value?: string | null;
    className?: string;
    tooltip?: string;
}

export default function CopyPasteButton(props: Props) {
    const { setNotification } = useCommonContext();

    const copy = useCallback(() => {
        copyToClipBoard(props.value || "");
        setNotification("Value was copied to the clip board");
    }, [ props.value, setNotification ]);

    const value = props.value;
    const className = customClassName("CopyPasteButton", props.className ? props.className : "big");
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
                        <Button onClick={ copy } className={ className }>
                            <Icon icon={{id: "copy_paste"}} />
                        </Button>
                    </span>
                </OverlayTrigger>
            );
        } else {
            return (
                <Button onClick={ copy } className={ className }>
                    <Icon icon={{id: "copy_paste"}} />
                </Button>
            );
        }
    } else {
        return null;
    }
}
