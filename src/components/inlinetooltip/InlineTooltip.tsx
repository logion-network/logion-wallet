import { ReactNode } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export interface Props {
    id: string;
    text: ReactNode;
    inline: ReactNode;
}

export default function InlineTooltip(props: Props) {
    return (
        <OverlayTrigger
            placement="auto"
            delay={ 500 }
            overlay={
                <Tooltip id={ props.id }>
                    { props.text }
                </Tooltip>
            }
        >
            <span>{ props.inline }</span>
        </OverlayTrigger>
    );
}
