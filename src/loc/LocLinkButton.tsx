import { Dropdown } from "react-bootstrap";
import { useState, useCallback } from "react";
import { EditableRequest } from "@logion/client";

import LocLinkExistingDialog from "./LocLinkExistingLocDialog";
import LocCreationDialog from "./LocCreationDialog";
import { useLocContext } from "./LocContext";
import { addLink } from "src/legal-officer/client";
import { useLogionChain } from "src/logion-chain";
import { UUID } from "@logion/node-api";

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
    const { client } = useLogionChain();
    const { loc, mutateLocState } = useLocContext();

    const linkNewLoc = useCallback(async (target: UUID, nature: string) => {
        await mutateLocState(async current => {
            if(client && current instanceof EditableRequest) {
                return await addLink({
                    client,
                    locState: current,
                    target,
                    nature,
                });
            } else {
                return current;
            }
        });
    }, [ mutateLocState, client ]);

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
                onSuccess={ (newLocData, nature) => linkNewLoc(newLocData.id, nature!) }
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
