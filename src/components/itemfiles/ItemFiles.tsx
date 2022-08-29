import { UploadableCollectionItem } from "@logion/client";
import { UploadableItemFile } from "@logion/client/dist/LocClient";
import { AxiosInstance } from 'axios';
import { useCallback, useState } from "react";
import { Row, Col } from "react-bootstrap";

import Icon from "src/common/Icon";
import Table, { Cell, EmptyTableMessage } from "src/common/Table";
import { ItemDeliveriesResponse } from "src/loc/FileModel";
import CellWithCopyPaste from "../table/CellWithCopyPaste";
import { Child } from 'src/common/types/Helpers';

import ItemFileDetails from "./ItemFileDetails";
import CheckDeliveredDialog from "../deliverycheck/CheckDeliveredDialog";
import { CheckResult } from "../deliverycheck/CheckDeliveredButton";

import "./ItemFiles.css";

export interface Props {
    locId: string;
    axiosFactory: () => AxiosInstance;
    item: UploadableCollectionItem;
    deliveries?: ItemDeliveriesResponse;
    withCheck: boolean;
}

interface FileWithMatch extends UploadableItemFile {
    detailsExpanded: boolean;
}

export default function ItemFiles(props: Props) {
    const [ checkResult, setCheckResult ] = useState<CheckResult>();
    const [ files, setFiles ] = useState<FileWithMatch[]>(props.item.files.map(file => ({ ...file, detailsExpanded: false })));

    let renderDetails: ((file: UploadableItemFile) => Child) | undefined;
    if(props.deliveries !== undefined) {
        const deliveries = props.deliveries;
        renderDetails = (file) => <ItemFileDetails file={ file } deliveries={ deliveries[file.hash] || [] } checkResult={ checkResult } />;
    }

    const onChecked = useCallback((result: CheckResult) => {
        setCheckResult(result);
        setFiles(props.item.files.map(file => ({
            ...file,
            detailsExpanded: file.hash === result.match?.originalFileHash
        })));
    }, [ props.item.files ]);

    return (
        <div className="ItemFiles">
            <Row>
                <Col xxl={ props.withCheck ? 4 : undefined }>
                    <h3><Icon icon={{id: "polkadot_check_asset"}} height="45px" /> <span className="title-text">List of Collection Item's file(s)</span></h3>
                </Col>
                {
                    props.withCheck &&
                    <Col xxl={ 8 }>
                        <CheckDeliveredDialog
                            axiosFactory={ props.axiosFactory }
                            locId={ props.locId }
                            itemId={ props.item.id }
                            onChecked={ onChecked  }
                        />
                    </Col>
                }
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
        return "0";
    }
}
