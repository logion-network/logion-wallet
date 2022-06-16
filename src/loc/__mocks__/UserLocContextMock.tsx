import { UserLocContext } from "../UserLocContext";

let locState: any;

export function setLocState(value: any) {
    locState = value;
}

export let refresh = jest.fn();

let requestSof = jest.fn();

export function setRequestSof(fn: jest.Mock) {
    requestSof = fn;
}

let requestSofOnCollection = jest.fn();

export function setRequestSofOnCollection(fn: jest.Mock) {
    requestSofOnCollection = fn;
}

export function useUserLocContext() {

    return {
        refresh,
        locState,
        requestSof,
        requestSofOnCollection
    }
}
