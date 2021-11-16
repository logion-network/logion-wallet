import { Dropdown } from "react-bootstrap";
import { useState, useCallback } from "react";
import LocLinkExistingDialog from "./LocLinkExistingLocDialog";
import LocCreationDialog from "./LocCreationDialog";
import { useLocContext } from "./LocContext";
import { UUID } from "../../logion-chain/UUID";
import { LocRequest } from "../../common/types/ModelTypes";

export const enum Visible {
    NONE,
    LINK_EXISTING,
    LINK_NEW_IDENTITY,
    LINK_NEW_TRANSACTION
}

export interface Props {
    visible?: Visible
}

export default function LocLinkButton(props: Props) {
    const [ visible, setVisible ] = useState<Visible>(props.visible ? props.visible : Visible.NONE);
    const { linkLoc, locRequest } = useLocContext();

    const linkNewLoc = useCallback((newLocRequest: LocRequest, nature: string) => {
        if (linkLoc !== null) {
            linkLoc(new UUID(newLocRequest.id), newLocRequest.description, nature)
        }
    }, [ linkLoc ])

    return (
        <>
            <Dropdown>
                <Dropdown.Toggle className="Button">Link this LOC to another LOC</Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_EXISTING) }>
                        Link to an existing LOC
                    </Dropdown.Item>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_NEW_IDENTITY) }>
                        Link to a new Identity LOC
                    </Dropdown.Item>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_NEW_TRANSACTION) }>
                        Link to a new Transaction LOC
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <LocLinkExistingDialog
                show={ visible === Visible.LINK_EXISTING }
                exit={ () => setVisible(Visible.NONE) }
            />
            <LocCreationDialog
                show={ visible === Visible.LINK_NEW_IDENTITY || visible === Visible.LINK_NEW_TRANSACTION }
                exit={ () => setVisible(Visible.NONE) }
                onSuccess={ (newLocRequest, nature) => linkNewLoc(newLocRequest, nature!) }
                locRequest={{
                    requesterAddress: locRequest!.requesterAddress,
                    userIdentity: locRequest!.userIdentity,
                    locType: visible === Visible.LINK_NEW_IDENTITY ? 'Identity' : 'Transaction'
                }}
                hasLinkNature={ true }
            />
        </>
    )
}
