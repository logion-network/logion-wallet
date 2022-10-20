import { CollectionItem, UploadableItemFile, CheckCertifiedCopyResult, LocData, CheckHashResult } from "@logion/client";
import { AxiosInstance } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";

import Table, { Cell, EmptyTableMessage } from "src/common/Table";
import { getCollectionItemFileSource, ItemDeliveriesResponse } from "src/loc/FileModel";
import CellWithCopyPaste from "../table/CellWithCopyPaste";
import { Child } from 'src/common/types/Helpers';
import ItemFileDetails from "./ItemFileDetails";
import FrameTitle from "../frametitle/FrameTitle";

import "./ItemFiles.css";
import ViewFileButton from "src/common/ViewFileButton";

export interface Props {
    collectionLoc: LocData;
    item: CollectionItem;
    deliveries?: ItemDeliveriesResponse;
    checkCertifiedCopyResultResult?: CheckCertifiedCopyResult;
    checkHashResult?: CheckHashResult;
}

interface FileWithMatch extends UploadableItemFile {
    detailsExpanded: boolean;
}

export default function ItemFiles(props: Props) {
    const [ checkCertifiedCopyResultResult, setCheckCertifiedCopyResultResult ] = useState<CheckCertifiedCopyResult>();
    const [ checkHashResult, setCheckHashResult ] = useState<CheckHashResult>();
    const [ files, setFiles ] = useState<FileWithMatch[]>(props.item.files.map(file => ({ ...file, detailsExpanded: false })));

    let renderDetails: ((file: UploadableItemFile) => Child) | undefined;
    if(props.deliveries !== undefined) {
        const deliveries = props.deliveries;
        renderDetails = (file) => <ItemFileDetails file={ file } deliveries={ deliveries[file.hash] || [] } checkResult={ checkCertifiedCopyResultResult } />;
    }

    const onChecked = useCallback((result: CheckCertifiedCopyResult) => {
        setCheckCertifiedCopyResultResult(result);
        setFiles(props.item.files.map(file => ({
            ...file,
            detailsExpanded: file.hash === result.match?.originalFileHash
        })));
    }, [ props.item.files ]);

    useEffect(() => {
        if(checkCertifiedCopyResultResult !== props.checkCertifiedCopyResultResult && props.checkCertifiedCopyResultResult !== undefined) {
            onChecked(props.checkCertifiedCopyResultResult);
        }
    }, [ checkCertifiedCopyResultResult, props.checkCertifiedCopyResultResult, onChecked ]);

    useEffect(() => {
        if (checkHashResult !== props.checkHashResult && props.checkHashResult !== undefined) {
            setCheckHashResult(props.checkHashResult);
        }
    }, [ checkHashResult, props.checkHashResult ])

    return (
        <div className="ItemFiles">
            <Row>
                <Col>
                    <h3>
                        <FrameTitle
                            iconId="polkadot_check_asset"
                            text="List of Collection Item's file(s)"
                        />
                    </h3>
                </Col>
            </Row>
            <Table
                columns={[
                    {
                        header: "Name",
                        render: file => <Cell content={ file.name } />,
                        align: "left",
                    },
                    {
                        header: "Type",
                        render: file => <Cell content={ file.contentType } />,
                        align: "left",
                    },
                    {
                        header: "Size (bytes)",
                        render: file => <Cell content={ file.size.toString() } />,
                        align: "left",
                    },
                    {
                        header: "Source",
                        render: file => <Cell content={
                            <ViewFileButton
                                nodeOwner={ props.collectionLoc.ownerAddress }
                                fileName={ file.name }
                                downloader={ (axios: AxiosInstance) => getCollectionItemFileSource(axios, {
                                    locId: props.collectionLoc.id.toString(),
                                    collectionItemId: props.item.id,
                                    hash: file.hash,
                                }) }
                            />
                        } />,
                        align: "left",
                    },
                    {
                        header: "Hash",
                        render: file => <CellWithCopyPaste content={ file.hash } />,
                        width: "250px",
                        align: "left",
                    },
                    {
                        header: "# of claim(s)",
                        render: file => <Cell content={ numberOfClaims(file, props.deliveries) } />,
                        width: "150px",
                        renderDetails,
                        detailsExpanded: file => file.detailsExpanded
                    },
                ]}
                data={ files }
                rowStyle={ file => file.hash === checkHashResult?.collectionItemFile?.hash ? "matched" : "" }
                renderEmpty={ () => <EmptyTableMessage>No file associated with the item</EmptyTableMessage> }
            />
        </div>
    );
}

function numberOfClaims(file: UploadableItemFile, deliveries?: ItemDeliveriesResponse): string {
    if(deliveries !== undefined) {
        const fileDeliveries = deliveries[file.hash];
        if(fileDeliveries) {
            return fileDeliveries.length.toString();
        } else {
            return "0";
        }
    } else {
        return "-";
    }
}
