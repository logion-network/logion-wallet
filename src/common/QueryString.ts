import queryString from 'query-string';
import { Location } from 'react-router-dom';

export function getQueryParam(location: Location, name: string): string | undefined {
    const params = queryString.parse(location.search);
    if(name in params) {
        const value = params[name];
        if(typeof value === "string") {
            return value as string;
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}
