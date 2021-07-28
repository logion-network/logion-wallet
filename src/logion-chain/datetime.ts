import moment, { Moment } from 'moment';

export function toIsoString(moment: Moment): string {
    let signedOn = moment.toISOString(false);
    if(signedOn.endsWith('Z')) {
        return signedOn.substring(0, signedOn.length - 1);
    } else {
        return signedOn;
    }
}

export const ISO_DATETIME_PATTERN = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}/;

export function fromIsoString(isoString: string): Moment {
    if(isoString.endsWith('Z')) {
        return moment(isoString);
    } else {
        return moment(isoString.substring(0, isoString.length - 1));
    }
}
