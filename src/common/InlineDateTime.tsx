import { format } from "./DateTimeFormat";

export interface Props {
    dateTime?: string;
    separator?: string;
}

export default function InlineDateTime(props: Props) {
    let formattedDateTime;
    if(props.dateTime !== undefined) {
        const {date, time} = format(props.dateTime);
        formattedDateTime = props.separator ? `${date}${props.separator}${time}` : `${date} / ${time}`;
    } else {
        formattedDateTime = "-";
    }
    return (
        <span>{ formattedDateTime }</span>
    );
}
