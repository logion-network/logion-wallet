import InlineDateTime from "src/common/InlineDateTime";
import CertificateCell, { CertificateCellProps } from "./CertificateCell";
import { DateTime } from "luxon";

interface Props extends CertificateCellProps {
    dateTime?: string | DateTime
}

export default function CertificateDateTimeCell(props: Props) {

    return (
        <CertificateCell { ...props }>
            <InlineDateTime dateTime={ props.dateTime } />
        </CertificateCell>
    )
}
