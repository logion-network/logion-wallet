import { SofTokensRecord } from "./SofParams.js";
import SofFilesAndDeliveriesFR from "./SofFilesAndDeliveriesFR";

export interface Props {
    tokensRecords: SofTokensRecord,
}

export default function SofTokensRecordFR(props: Props) {
    return (
        <>
            <div><strong>Description</strong>: { props.tokensRecords.description }</div>
            <div>Timestamp: { props.tokensRecords.addedOn }</div>
            <div>Emetteur/Emettrice: { props.tokensRecords.issuer }</div>
            <SofFilesAndDeliveriesFR files={ props.tokensRecords.files } />
        </>
    )
}
