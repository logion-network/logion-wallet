import { CollectionItem } from "../logion-chain/Types";
import CertificateCell from "./CertificateCell";
import { Row } from "../common/Grid";

export interface Props {
    item: CollectionItem
}

export default function CollectionItemCellRow(props: Props) {
    const { id, description } = props.item
    return (
        <div className="CollectionItem">
            <Row>
                <p>This collection item identified hereafter with the
                    following data<br/>benefits from the present Collection LOC scope:</p>
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item identification:">
                    { id }
                </CertificateCell>
            </Row>
            <Row>
                <CertificateCell md={ 12 } label="Collection item description:">
                    <pre>{ description }</pre>
                </CertificateCell>
            </Row>
        </div>
    )
}
