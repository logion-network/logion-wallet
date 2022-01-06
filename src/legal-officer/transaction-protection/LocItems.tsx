import Table, { Cell, DateTimeCell, EmptyTableMessage, ActionCell } from "../../common/Table";
import StatusCell from "../../common/StatusCell";
import LegalOfficerName from "../../common/LegalOfficerNameCell";
import { useLocContext } from "./LocContext";
import ButtonGroup from "../../common/ButtonGroup";
import Button from "../../common/Button";
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
import LocLinkDetails from "./LocLinkDetails";
import LocPublishLinkButton from "./LocPublishLinkButton";

import './LocItems.css';
import Icon from "../../common/Icon";

export interface Props {
    matchedHash?: string;
}

export default function LocItems(props: Props) {

    const { locId, loc, locItems, deleteMetadata, deleteLink, deleteFile } = useLocContext();

    function renderDetails(locItem: LocItem): Child {
        return (
            <>
                { locItem.type === 'Data' && <LocPublicDataDetails item={ locItem } label={ locItem.name } /> }
                { locItem.type === 'Document' && <LocPrivateFileDetails item={ locItem } /> }
                { locItem.type === 'Linked LOC' && <LocLinkDetails item={ locItem } locType={ loc!.locType } /> }
            </>
        )
    }

    interface DeleteButtonProps {
        locItem:LocItem
        action: (locItem:LocItem) => void
    }

    function DeleteButton(props: DeleteButtonProps) {
        const { locItem, action } = props
        return (
            <Button
                variant="danger-flat"
                onClick={ () => action(locItem) }
                data-testid={ `remove-${ locItem.type }-${ locItem.name }` }
            >
                <Icon icon={{id: 'trash'}} />
            </Button>
        );
    }

    function renderActions(locItem: LocItem): Child {

        return (
            <ActionCell>
                { locItem.type === 'Data' && <ButtonGroup>
                    <LocPublishPublicDataButton locItem={ locItem } />
                    <DeleteButton locItem={ locItem } action={ deleteMetadata! } />
                </ButtonGroup> }
                { locItem.type === 'Linked LOC' && <ButtonGroup>
                    <LocPublishLinkButton locItem={ locItem } />
                    <DeleteButton locItem={ locItem } action={ deleteLink! } />
                </ButtonGroup> }
                { locItem.type === 'Document' && <ButtonGroup>
                    <LocPublishPrivateFileButton locItem={ locItem } />
                    <DeleteButton locItem={ locItem } action={ deleteFile! } />
                </ButtonGroup> }
            </ActionCell>)
    }

    if(locItems.length <= 0 && !loc?.closed) {
        return (
            <div className="LocItems empty-loc">
                <img alt="empty loc" src={ process.env.PUBLIC_URL + "/assets/empty-loc.svg" } />
                <p className="primary">This LOC is empty.</p>
                <p className="secondary">You can add public data and/or confidential documents.</p>
            </div>
        );
    } else {
        return (
            <div className="LocItems">
                <Table
                    data={ locItems }
                    columns={ [
                        {
                            header: "Name",
                            render: locItem => <Cell content={ locItem.name } />,
                            renderDetails: locItem => renderDetails(locItem),
                            detailsExpanded: locItem => locItem.newItem,
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
                            render: locItem => <Cell content={
                            <>
                                <span className="item-type">{ locItem.type }</span> {
                                    locItem.type === 'Document' &&
                                    <ViewFileButton
                                        nodeOwner={ locItem.submitter }
                                        fileName={ locItem.name }
                                        downloader={ (axios: AxiosInstance) => getFile(axios, {
                                            locId: locId.toString(),
                                            hash: locItem.value
                                        }) }
                                    />
                                }
                            </> } />,
                            width: "160px",
                            align: "left"
                        },
                        {
                            header: "Submitted by",
                            render: locItem => <LegalOfficerName address={ locItem.submitter } />
                        },
                        {
                            header: "",
                            render: locItem => {
                                if (locItem.status === 'DRAFT') {
                                    return renderActions(locItem)
                                } else {
                                    return (<StatusCell icon={{ id: 'published' }} text="Published" color={ POLKADOT } />)
                                }
                            }
                        }
                    ] }
                    renderEmpty={ () => <EmptyTableMessage>No public data nor private documents</EmptyTableMessage> }
                    rowStyle={ (item, index?) => (item.type === "Document" && item.value === props.matchedHash) ? "matched" : "" }
                />
            </div>
        );
    }
}
