import { Col } from "../../common/Grid";
import LocItemDetail from "./LocItemDetail";

export interface Props {
    item: LocItem
}

export default function LocItemDetails(props: Props) {

    return (
        <Col>
            <div>{ props.item.status === "DRAFT" ? "Data to be published" : "Published data" }</div>
            <LocItemDetail label="Submitter ID">{ props.item.submitter }</LocItemDetail>
            <LocItemDetail label={ props.item.name }>{ props.item.value }</LocItemDetail>
        </Col>
    )
}


