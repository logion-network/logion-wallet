import { ReactNode } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from 'src/common/Icon';

export interface Props {
    id: string;
    help: ReactNode;
}

export default function HelpTooltip(props: Props) {
    return (
        <OverlayTrigger
            placement="auto"
            delay={ 500 }
            overlay={
                <Tooltip id={ props.id }>
                    { props.help }
                </Tooltip>
            }
        >
            <span><Icon icon={{ id: "question" }}/></span>
        </OverlayTrigger>
    );
}
