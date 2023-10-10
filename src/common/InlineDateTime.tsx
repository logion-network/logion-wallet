import { fromIsoString } from "@logion/client";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Child } from "./types/Helpers";
import { DateTime } from "luxon";

export interface Props {
    dateTime?: DateTime | string | null;
    separator?: Child;
    dateOnly?: boolean;
}

export function format(isoString: string | DateTime): { date: string, time: string } {
    if(typeof isoString === "string") {
        const dateTime = fromIsoString(isoString);
        return formatDateTime(dateTime);
    } else {
        return formatDateTime(isoString);
    }
}

export function formatDateTime(dateTime: DateTime): { date: string, time: string } {
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
