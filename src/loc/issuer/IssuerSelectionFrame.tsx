import { useLocContext } from "../LocContext";
import { useState, useEffect } from "react";
import { OpenLoc, ClosedCollectionLoc, VerifiedIssuerWithSelect } from "@logion/client";
import Table, { EmptyTableMessage, Cell, ActionCell } from "../../common/Table";
import ButtonGroup from "../../common/ButtonGroup";
import Frame from "../../common/Frame";
import './IssuerSelectionFrame.css';
import IssuerSelectionCheckbox from "./IssuerSelectionCheckbox";
import Button from "../../common/Button";
import { identityLocDetailsPath } from "../../legal-officer/LegalOfficerPaths";
import { useCommonContext } from "../../common/CommonContext";

export default function IssuerSelectionFrame() {

    const { locState } = useLocContext();
    const [ issuerSelections, setIssuerSelections ] = useState<VerifiedIssuerWithSelect[]>([]);
    const { colorTheme } = useCommonContext();

    useEffect(() => {
        if (locState !== null && (locState instanceof OpenLoc || locState instanceof ClosedCollectionLoc)) {
            (async function() {
                const issuers = await locState.legalOfficer.getVerifiedIssuers();
                setIssuerSelections(issuers);
            })();
        }
    }, [ locState ]);

    return (
        <Frame
            className="IssuerSelectionFrame"
            title="Verified Issuer management for this LOC"
            titleIcon={ {
                icon: {
                    id: 'issuer-icon'
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
        >
            <Table
                columns={ [
                    {
                        header: "First Name",
                        render: issuer => <Cell content={ issuer.firstName } />,
                        align: 'left'
                    },
                    {
                        header: "Last Name",
                        render: issuer => <Cell content={ issuer.lastName } />,
                        align: 'left'
                    },
                    {
                        header: "Identity LOC",
                        render: issuer =>
                            <ActionCell>
                                <ButtonGroup>
                                    <Button
                                        onClick={ () => window.open(identityLocDetailsPath(issuer.identityLocId), "_blank") }>
                                        View
                                    </Button>
                                </ButtonGroup>
                            </ActionCell>
                    },
                    {
                        header: "Selected ?",
                        render: issuer =>
                            <ActionCell>
                                <ButtonGroup>
                                    <IssuerSelectionCheckbox issuerSelection={ issuer } />
                                </ButtonGroup>
                            </ActionCell>
                    },
                ] }
                data={ issuerSelections }
                renderEmpty={ () => <EmptyTableMessage>No Verified Issuers</EmptyTableMessage> }
            />
        </Frame>
    )
}
