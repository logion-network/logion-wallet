import { format } from "../common/DateTimeFormat";
import CertificateCell, { CertificateCellProps } from "./CertificateCell";

interface Props extends CertificateCellProps {
    dateTime?: string
}

export default function CertificateDateTimeCell(props: Props) {

    let value = "-";
    if (props.dateTime) {
        const dateTime = format(props.dateTime);
        value = `${ dateTime.date } - ${ dateTime.time }`;
    }
    return (
        <CertificateCell { ...props }>
            { value }
        </CertificateCell>
    )
}
