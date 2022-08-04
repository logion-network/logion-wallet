import { fromIsoString } from "@logion/client";

export default function DateTimeFormat(props: { dateTime: string | undefined }) {

    if(props.dateTime) {
        const { date, time } = format(props.dateTime);
        return <span>{ date } { time }</span>;
    } else {
        return <span>-</span>;
    }
}

export function format(isoString: string): { date: string, time: string } {
    const dateTime = fromIsoString(isoString);
    const date = dateTime.toLocaleString({}, { locale: "fr-FR" });
    const time = dateTime.toLocaleString({ hour: "numeric", minute: "numeric" }, { locale: "fr-FR" });
    return { date, time }
}
