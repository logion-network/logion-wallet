import { Dropdown } from "react-bootstrap";
import { useState, useCallback } from "react";
import LocLinkExistingDialog from "./LocLinkExistingLocDialog";
import LocCreationDialog from "./LocCreationDialog";
import { locDetailsPath } from "../LegalOfficerPaths";
import { useHistory } from "react-router-dom";
import { useLocContext } from "./LocContext";
import { UUID } from "../../logion-chain/UUID";

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
    const history = useHistory();
    const { locId } = useLocContext();

    const goToNewLoc = useCallback((newLocId: UUID) => {
        history.push(locDetailsPath(newLocId.toString(), locId.toString()))
        history.go(0)
    }, [ history, locId ])

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
            <LocLinkExistingDialog
                show={ visible === Visible.LINK_EXISTING }
                exit={ () => setVisible(Visible.NONE) }
            />
            <LocCreationDialog
                show={ visible === Visible.LINK_NEW }
                exit={ () => setVisible(Visible.NONE) }
                onSuccess={ goToNewLoc }
            />
        </>
    )
}
