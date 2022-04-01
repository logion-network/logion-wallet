import { format } from "logion-api/dist/datetime";

export interface Props {
    dateTime?: string;
}

export default function InlineDateTime(props: Props) {
    let formattedDateTime;
    if(props.dateTime !== undefined) {
        const {date, time} = format(props.dateTime);
        formattedDateTime = `${date} / ${time}`;
    } else {
        formattedDateTime = "-";
    }
    return (
        <span>{ formattedDateTime }</span>
    );
}
