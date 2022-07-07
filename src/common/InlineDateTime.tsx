import { format } from "@logion/node-api/dist/datetime";

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

export function formatDateTime(dateTime?: string): string {
    if(dateTime !== undefined) {
        const {date, time} = format(dateTime);
        return `${date} / ${time}`;
    } else {
        return "-";
    }
}
