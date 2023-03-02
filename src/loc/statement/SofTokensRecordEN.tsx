import { SofTokensRecord } from "./SofParams.js";
import SofFilesAndDeliveriesEN from "./SofFilesAndDeliveriesEN";

export interface Props {
    tokensRecords: SofTokensRecord,
}

export default function SofTokensRecordEN(props: Props) {
    return (
        <>
            <div><strong>Description</strong>: { props.tokensRecords.description }</div>
            <div>Timestamp: { props.tokensRecords.addedOn }</div>
            <div>Issuer: { props.tokensRecords.issuer }</div>
            <SofFilesAndDeliveriesEN files={ props.tokensRecords.files } />
        </>
    )
}
