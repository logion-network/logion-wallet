import { fromIsoString } from "@logion/client";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Child } from "./types/Helpers";

export interface Props {
    dateTime?: string | null;
    separator?: Child;
    dateOnly?: boolean;
}

export function format(isoString: string): { date: string, time: string } {
    const dateTime = fromIsoString(isoString);
    const date = dateTime.toLocaleString({}, { locale: "fr-FR" });
    const time = dateTime.toLocaleString({ hour: "numeric", minute: "numeric" }, { locale: "fr-FR" });
    return { date, time }
}

export default function InlineDateTime(props: Props) {
    let formattedDateTime;
    if(props.dateTime) {
        const {date, time} = format(props.dateTime);
        if(props.dateOnly) {
            formattedDateTime = date;
        } else {
            formattedDateTime = props.separator ? <>{ date }{ props.separator }{ time }</> : `${date} - ${time}`;
        }
    } else {
        formattedDateTime = "-";
    }
    return (
        <OverlayTrigger
            placement="bottom"
            delay={ 500 }
            overlay={
            <Tooltip id={ Math.random().toString() }>
                Universal Time Coordinated (UTC)
            </Tooltip>
            }
        >
            <span>{ formattedDateTime }</span>
        </OverlayTrigger>
    );
}
