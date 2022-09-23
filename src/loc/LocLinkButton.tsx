import { Dropdown } from "react-bootstrap";
import { useState, useCallback } from "react";
import LocLinkExistingDialog from "./LocLinkExistingLocDialog";
import LocCreationDialog from "./LocCreationDialog";
import { LinkTarget, useLocContext } from "./LocContext";

export const enum Visible {
    NONE,
    LINK_EXISTING,
    LINK_NEW_IDENTITY,
    LINK_NEW_TRANSACTION
}

export interface Props {
    excludeNewIdentity: boolean
    visible?: Visible
}

export default function LocLinkButton(props: Props) {
    const [ visible, setVisible ] = useState<Visible>(props.visible ? props.visible : Visible.NONE);
    const { addLink, loc } = useLocContext();

    const linkNewLoc = useCallback((newLocData: LinkTarget, nature: string) => {
        if (addLink !== null) {
            addLink(newLocData, nature)
        }
    }, [ addLink ])

    return (
        <>
            <Dropdown>
                <Dropdown.Toggle className="Button" id="LocLinkButton-dropdown-toggle">Link this LOC to another LOC</Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={ () => setVisible(Visible.LINK_EXISTING) }>
                        Link to an existing LOC
                    </Dropdown.Item>
                    { !props.excludeNewIdentity &&
                        <Dropdown.Item onClick={ () => setVisible(Visible.LINK_NEW_IDENTITY) }>
                            Link to a new Identity LOC
                        </Dropdown.Item>
                    }
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
                onSuccess={ (newLocData, nature) => linkNewLoc(newLocData, nature!) }
                locRequest={{
                    requesterAddress: loc!.requesterAddress,
                    requesterIdentityLoc: loc!.requesterLocId?.toString(),
                    userIdentity: loc!.userIdentity,
                    locType: visible === Visible.LINK_NEW_IDENTITY ? 'Identity' : 'Transaction'
                }}
                hasLinkNature={ true }
            />
        </>
    )
}
