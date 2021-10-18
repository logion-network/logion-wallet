import Table, { Cell, DateTimeCell, EmptyTableMessage, ActionCell } from "../../common/Table";
import StatusCell from "../../common/StatusCell";
import LegalOfficerName from "../../common/LegalOfficerNameCell";
import { useLocContext } from "./LocContext";
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
import React from "react";
import LocPublicDataDetails from "./LocPublicDataDetails";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { POLKADOT } from "../../common/ColorTheme";
import { Child } from "../../common/types/Helpers";
import LocPrivateFileDetails from "./LocPrivateFileDetails";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import ViewFileButton from "../../common/ViewFileButton";
import { AxiosInstance } from "axios";
import { getFile } from "../Model";
import { LocItem } from "./types";
import { UNKNOWN_NAME } from "./LocItemFactory";

export default function LocItems() {

    const { locId, locItems, removeItem } = useLocContext();

    if (removeItem === null) {
        return null;
    }

    function renderDetails(locItem: LocItem): Child {
        return (
            <>
                { locItem.type === 'Data' && <LocPublicDataDetails item={ locItem } label={ locItem.name } /> }
                { locItem.type === 'Document' && <LocPrivateFileDetails item={ locItem } /> }
                { locItem.type === 'Linked LOC' && <LocPublicDataDetails item={ locItem } label={ locItem.type } /> }
            </>
        )
    }

    function renderActions(locItem: LocItem): Child {
        return (
            <ActionCell>
                <ButtonGroup>
                    { locItem.type === 'Data' && <LocPublishPublicDataButton
                        locItem={ locItem }
                        action={ (locContext, locItem) => locContext.publishMetadata!(locItem) }
                    /> }
                    { locItem.type === 'Linked LOC' && <LocPublishPublicDataButton
                        locItem={ locItem }
                        action={ (locContext, locItem) => locContext.publishLocLink!(locItem) }
                    /> }
                    { locItem.type === 'Document' && <LocPublishPrivateFileButton locItem={ locItem } /> }
                    <Button
                        variant="danger"
                        onClick={ () => removeItem!(locItem) }
                        data-testid={ `remove-${ locItem.name }` }
                    >
                        X
                    </Button>
                </ButtonGroup>
            </ActionCell>)
    }

    function renderViewButton(locItem: LocItem): Child {
        if (locItem.type === 'Document') {
            return (
                <>
                    <ActionCell>
                        <ViewFileButton
                            fileName={ locItem.name === UNKNOWN_NAME ? locItem.value : locItem.name }
                            downloader={ (axios: AxiosInstance) => getFile(axios, {
                                locId: locId.toString(),
                                hash: locItem.value
                            }) } />
                    </ActionCell>
                </>
            )
        } else {
            return null
        }
    }

    return (
        <Table
            data={ locItems }
            columns={ [
                {
                    header: "Name",
                    render: locItem => <Cell content={ locItem.name } />,
                    renderDetails: locItem => renderDetails(locItem),
                    align: "left",
                    width: "250px"
                },
                {
                    header: "Timestamp",
                    render: locItem => <DateTimeCell
                        dateTime={ locItem.timestamp }
                        spinner={ locItem.status === 'PUBLISHED' } />,
                    width: "200px"
                },
                {
                    header: "Type",
                    render: locItem => <Cell content={ locItem.type } />,
                    width: "150px"
                },
                {
                    header: "Submitted by",
                    render: locItem => <LegalOfficerName address={ locItem.submitter } />
                },
                {
                    header: "",
                    render: locItem => renderViewButton(locItem),
                    width: "150px"
                },
                {
                    header: "",
                    render: locItem => {
                        if (locItem.status === 'DRAFT') {
                            return renderActions(locItem)
                        } else {
                            return (<StatusCell text={ locItem.status } color={ POLKADOT } />)
                        }
                    }
                }
            ] }
            renderEmpty={ () => <EmptyTableMessage>No public data nor private documents
                yet</EmptyTableMessage> } />
    )
}
