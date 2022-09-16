import InlineDateTime from "src/common/InlineDateTime";
import CertificateCell, { CertificateCellProps } from "./CertificateCell";

interface Props extends CertificateCellProps {
    dateTime?: string
}

export default function CertificateDateTimeCell(props: Props) {

    return (
        <CertificateCell { ...props }>
            <InlineDateTime dateTime={ props.dateTime } />
        </CertificateCell>
    )
}
