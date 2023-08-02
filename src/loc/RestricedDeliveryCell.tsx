import { OpenLoc, ClosedCollectionLoc } from "@logion/client";
import { Hash } from "@logion/node-api";
import { useCallback, useMemo, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Dialog from "src/common/Dialog";
import { Cell } from "src/common/Table";
import Checkbox from "src/components/toggle/Checkbox";
import { useLocContext } from "./LocContext";
import "./RestrictedDeliveryCell.css";

export interface Props {
    hash: Hash;
}

export default function RestrictedDeliveryCell(props: Props) {
    const { mutateLocState, loc } = useLocContext();
    const [ disabled, setDisabled ] = useState(false);
    const [ showAuthorization, setShowAuthorization ] = useState(false);
    const [ showCancellation, setShowCancellation ] = useState(false);

    const confirmCallback = useCallback((restrictedDelivery: boolean) => {
        if(restrictedDelivery) {
            setShowAuthorization(true);
        } else {
            setShowCancellation(true);
        }
    }, []);

    const setRestrictedDeliveryCallback = useCallback(async (restrictedDelivery: boolean) => {
        setDisabled(true);
        try {
            return await mutateLocState(async current => {
                if(current instanceof OpenLoc || current instanceof ClosedCollectionLoc) {
                    return current.legalOfficer.setCollectionFileRestrictedDelivery({
                        hash: props.hash,
                        restrictedDelivery,
                    });
                } else {
                    return current;
                }
            });
        } finally {
            setDisabled(false);
        }
    }, [ mutateLocState, props.hash ]);

    const checked = useMemo(() => {
        const file = loc?.files.find(file => file.hash.equalTo(props.hash));
        return file?.restrictedDelivery || false;
    }, [ props.hash, loc ]);

    return (
        <Cell content={
            <div className="RestrictedDeliveryCell checkbox-container">
                <OverlayTrigger
                    placement="bottom"
                    delay={500}
                    overlay={
                        <Tooltip id={ `RestrictedDeliveryCell-tooltip-${props.hash.toHex()}` }>
                            When the restricted delivery is activated, Collection-related NFT owners will be able to download a copy of the document.
                        </Tooltip>
                    }
                >
                    <div>
                        <Checkbox
                            skin="Toggle black"
                            checked={checked}
                            setChecked={value => confirmCallback(value)}
                            disabled={disabled}
                        />
                    </div>
                </OverlayTrigger>
                {
                    showAuthorization &&
                    <Dialog
                        show={true}
                        actions={[
                            {
                                id: "cancel",
                                buttonText: "Cancel",
                                buttonVariant: "secondary",
                                callback: () => setShowAuthorization(false),
                            },
                            {
                                id: "confirm",
                                buttonText: "Confirm",
                                buttonVariant: "primary",
                                callback: () => { setShowAuthorization(false); setRestrictedDeliveryCallback(true) },
                            }
                        ]}
                        size="lg"
                    >
                        <h3>Restricted delivery authorization for this document?</h3>
                        <p>By clicking on the “Confirm” button below, you acknowledge the fact that this document will be accessible to all owners of NFTs - but only them - recorded in Collection Items under this Collection LOC.</p>
                        <p>All these NFT owners will be able to download a generated copy of this document (embedding their public address in the document metadata) after signing with the blockchain address that owns an NFT recorded in a Collection Item. A record of that download event will be kept.</p>
                    </Dialog>
                }
                {
                    showCancellation &&
                    <Dialog
                        show={true}
                        actions={[
                            {
                                id: "cancel",
                                buttonText: "Cancel",
                                buttonVariant: "secondary",
                                callback: () => setShowCancellation(false),
                            },
                            {
                                id: "confirm",
                                buttonText: "Confirm",
                                buttonVariant: "primary",
                                callback: () => { setShowCancellation(false); setRestrictedDeliveryCallback(false) },
                            }
                        ]}
                        size="lg"
                    >
                        <h3>Restricted delivery cancellation for this document?</h3>
                        <p>By clicking on the “Confirm” button below, you acknowledge the fact that this document will NOT be accessible anymore to all owners of NFTs recorded in Collection Items under this Collection LOC.</p>
                    </Dialog>
                }
            </div>
        }/>
    );
}
