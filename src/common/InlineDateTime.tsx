import { format } from "../logion-chain/datetime";

export interface Props {
    dateTime?: string;
}

export default function InlineDateTime(props: Props) {
    let voidedOn;
    if(props.dateTime !== undefined) {
        const {date, time} = format(props.dateTime);
        voidedOn = `${date} / ${time}`;
    } else {
        voidedOn = "-";
    }
    return (
        <span>{ voidedOn }</span>
    );
}
