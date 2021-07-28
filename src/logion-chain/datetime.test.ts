import moment from 'moment';
import { toIsoString, ISO_DATETIME_PATTERN, fromIsoString } from './datetime';

test("toIsoString produces date with valid pattern", () => {
    const dateTime = moment();
    const isoString = toIsoString(dateTime);
    expect(isoString).toMatch(ISO_DATETIME_PATTERN);
});

test("ISO_DATETIME_PATTERN matches valid date", () => {
    const validDateTime = "2021-06-01T12:13:34.678";
    expect(validDateTime).toMatch(ISO_DATETIME_PATTERN);
});

test("Valid moment from ISO string without Z", () => {
    const dateTime = fromIsoString("2021-07-27T11:34:00.000");
    expect(dateTime.isValid()).toBe(true);
});

test("Valid moment from ISO string with Z", () => {
    const dateTime = fromIsoString("2021-07-27T11:34:00.000Z");
    expect(dateTime.isValid()).toBe(true);
});
