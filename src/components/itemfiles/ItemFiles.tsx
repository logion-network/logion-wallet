import { CheckCertifiedCopyResult, LocData, CheckHashResult } from "@logion/client";
import { AxiosInstance } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";

import Table, { Cell, EmptyTableMessage } from "src/common/Table";
import { ItemDeliveriesResponse, TypedFile } from "src/loc/FileModel";
import CellWithCopyPaste from "../table/CellWithCopyPaste";
import { Child } from 'src/common/types/Helpers';
import ItemFileDetails from "./ItemFileDetails";
import FrameTitle from "../frametitle/FrameTitle";

import "./ItemFiles.css";
import ViewFileButton from "src/common/ViewFileButton";

export interface DeliveredFile {
    name: string;
    contentType: string;
    hash: string;
    size: bigint;
}

export interface Props {
    collectionLoc: LocData;
    files: DeliveredFile[];
    deliveries?: ItemDeliveriesResponse;
    checkCertifiedCopyResultResult?: CheckCertifiedCopyResult;
    checkHashResult?: CheckHashResult;
    downloader: (axios: AxiosInstance, hash: string) => Promise<TypedFile>;
    defaultExpanded?: boolean;
    icon: string;
    title: string;
}

interface FileWithMatch extends DeliveredFile {
    detailsExpanded: boolean;
}

export default function ItemFiles(props: Props) {
    const [ checkCertifiedCopyResultResult, setCheckCertifiedCopyResultResult ] = useState<CheckCertifiedCopyResult>();
    const [ checkHashResult, setCheckHashResult ] = useState<CheckHashResult>();
    const [ files, setFiles ] = useState<FileWithMatch[]>(props.files.map(file => ({ ...file, detailsExpanded: props.defaultExpanded || false })));

    let renderDetails: ((file: FileWithMatch) => Child) | undefined;
    if(props.deliveries !== undefined) {
        const deliveries = props.deliveries;
        renderDetails = (file) => <ItemFileDetails deliveries={ deliveries[file.hash] || [] } checkResult={ checkCertifiedCopyResultResult } />;
    }

    const onChecked = useCallback((result: CheckCertifiedCopyResult) => {
        setCheckCertifiedCopyResultResult(result);
        setFiles(props.files.map(file => ({
            ...file,
            detailsExpanded: props.defaultExpanded || false || file.hash === result.match?.originalFileHash
        })));
    }, [ props.files, props.defaultExpanded ]);

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
                            iconId={props.icon}
                            text={props.title}
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
                        render: file => <Cell content={ file.size >= 0 ? file.size.toString() : "n/a" } />,
                        align: "left",
                    },
                    {
                        header: "Source",
                        render: file => <Cell content={
                            <ViewFileButton
                                nodeOwner={ props.collectionLoc.ownerAddress }
                                fileName={ file.name }
                                downloader={ (axios) => props.downloader(axios, file.hash) }
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
                        detailsExpanded: file => file.detailsExpanded,
                        hideExpand: () => true,
                    },
                ]}
                data={ files }
                rowStyle={ file => file.hash === checkHashResult?.collectionItemFile?.hash ? "matched" : "" }
                renderEmpty={ () => <EmptyTableMessage>No file associated with the item</EmptyTableMessage> }
            />
        </div>
    );
}

function numberOfClaims(file: DeliveredFile, deliveries?: ItemDeliveriesResponse): string {
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
