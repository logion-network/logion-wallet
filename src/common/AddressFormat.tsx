import { OverlayTrigger, Tooltip } from "react-bootstrap";

import './AddressFormat.css';

export interface Props {
    address: string | undefined | null;
}

export default function AddressFormat(props: Props) {

    return (
        <span className="AddressFormat">
            <OverlayTrigger
                placement="bottom"
                delay={ 500 }
                overlay={
                <Tooltip id={`tooltip-${props.address}`}>
                    { props.address }
                </Tooltip>
                }
            >
                <span>{ props.address }</span>
            </OverlayTrigger>
        </span>
    );
}
