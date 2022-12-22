import { COLOR_THEME, legalOfficers } from '../TestData';
import { CommonContext, Viewer } from "../CommonContext";
import { BalanceState } from "@logion/client/dist/Balance.js";

export let setColorTheme = jest.fn();

export let refresh = jest.fn();

export let balanceState: BalanceState | undefined = {} as BalanceState;

export function setBalanceState(value: BalanceState | undefined) {
    balanceState = value;
}

let viewer: Viewer = "User";

export function setViewer(_viewer: Viewer) {
    viewer = _viewer;
}

export function useCommonContext() {
    const commonContext:Partial<CommonContext> = {
        balanceState,
        colorTheme: COLOR_THEME,
        setColorTheme,
        refresh,
        nodesUp: [],
        nodesDown: [],
        availableLegalOfficers: legalOfficers,
        viewer,
        backendConfig: () => ({ features:{ iDenfy: false, vote: false }}),
    };
    return commonContext;
}

