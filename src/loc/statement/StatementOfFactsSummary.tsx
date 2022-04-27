import React, { ReactChild } from "react";
import { Col, Row } from "react-bootstrap";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { LocFile } from "../../common/types/ModelTypes";
import { DownloadFilesButton, FileInfo } from "../../common/ViewFileButton";
import { UUID } from "../../logion-chain/UUID";
import { AxiosInstance } from "axios";
import { getFile } from "../Model";
import './StatementOfFactsSummary.css';

export interface Props {
    locId: UUID,
    nodeOwner: string,
    previewPath: string;
    files: LocFile[];
}

export default function StatementOfFactsSummary(props: Props) {

    interface NewTabForwardProps {
        path: string;
        children: ReactChild;
    }

    const NewTabForward = React.forwardRef<HTMLAnchorElement, NewTabForwardProps>((props, ref) => {
        const { path, children } = props;
        return (
            <a
                href={ path }
                target="_blank"
                rel="noreferrer"
                ref={ ref }
                className="StatementOfFactsButtonDropdownItem"
            >
                { children }
            </a>
        );
    });

    function fileInfo(file: LocFile): FileInfo {
        return {
            fileName: file.name,
            downloader: (axios: AxiosInstance) => getFile(axios, {
                locId: props.locId.toString(),
                hash: file.hash
            })
        }
    }

    return (
        <div className="StatementOfFactsSummary">
            <h3>Statement of Facts generator</h3>
            <p>Your statement of Facts is ready, you can view it by clicking on the related icon, hereafter.</p>
            <p>
                <strong>As a mandatory step, you must submit the signed Statement of Fact PDF in the related
                    LOC: </strong>
                You can access the related LOC by clicking on the link, hereafter. Do not forget to upload the
                <strong> signed version of your Statement of Facts</strong> before closing the related LOC. DO NOT put
                the signed version of this Statement of Facts in another LOC, otherwise, the LOC URL mentioned in the
                Statement of Facts will not be valid.
            </p>
            <p>
                For your convenience, all files mentioned in the Statement of Facts are also ready to be downloaded by
                clicking the related icon hereafter.
            </p>
            <div className="PreviewAndDownload">
                <Row className="Preview">
                    <Col md={ 6 } className="PreviewAndDownloadCell">Statements of Facts</Col>
                    <Col md={ 6 } className="PreviewAndDownloadCell">
                        <NewTabForward path={ props.previewPath }>
                            <Button slim>
                                <Icon icon={ { id: 'preview' } } />
                                Preview
                            </Button>
                        </NewTabForward>
                    </Col>
                </Row>
                <Row className="Download">
                    <Col className="PreviewAndDownloadCell">
                        <ul>
                            { props.files.map(file => <li>{ file.name }</li>) }
                        </ul>
                    </Col>
                    <Col className="PreviewAndDownloadCell">
                        <DownloadFilesButton files={ props.files.map(fileInfo) } nodeOwner={ props.nodeOwner }>
                            <Icon icon={ { id: 'download' } } />
                            Download all LOC files
                        </DownloadFilesButton>
                    </Col>
                </Row>
            </div>
        </div>
    )
}
