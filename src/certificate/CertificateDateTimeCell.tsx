import CertificateCell, { CertificateCellProps } from "./CertificateCell";
import { format } from "@logion/node-api/dist/datetime";

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
