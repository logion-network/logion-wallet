import { Dropdown } from "react-bootstrap";
import { useState } from "react";
import LocLinkExistingDialog from "./LocLinkExistingLocDialog";

export const enum Visible {
    NONE,
    LINK_EXISTING,
    LINK_NEW
}

export interface Props {
    visible?: Visible
}

export default function LocLinkButton(props: Props) {
    const [ visible, setVisible ] = useState<Visible>(props.visible ? props.visible : Visible.NONE);

    return (
        <>
            <Dropdown>
                <Dropdown.Toggle className="Button">Link this LOC to another LOC</Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_EXISTING) }>
                        Link to an existing LOC
                    </Dropdown.Item>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_NEW) }>
                        Link to a new LOC
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <LocLinkExistingDialog show={ visible === Visible.LINK_EXISTING } exit={ () => setVisible(Visible.NONE) } />
        </>
    )
}
