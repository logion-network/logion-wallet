import { format } from "@logion/node-api/dist/datetime";

export default function DateTimeFormat(props: { dateTime: string | undefined }) {

    if(props.dateTime) {
        const { date, time } = format(props.dateTime);
        return <span>{ date } { time }</span>;
    } else {
        return <span>-</span>;
    }
}
