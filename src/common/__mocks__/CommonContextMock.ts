import { COLOR_THEME, legalOfficers } from '../TestData';
import { CommonContext } from "../CommonContext";
import { BalanceState } from "@logion/client/dist/Balance";

export let setColorTheme = jest.fn();

export let refresh = jest.fn();

export let balanceState: BalanceState | undefined = {} as BalanceState;

export function setBalanceState(value: BalanceState | undefined) {
    balanceState = value;
}

export function useCommonContext() {
    const commonContext:Partial<CommonContext> = {
        balanceState,
        colorTheme: COLOR_THEME,
        setColorTheme,
        refresh,
        nodesUp: [],
        nodesDown: [],
        availableLegalOfficers: legalOfficers
    };
    return commonContext;
}

