import { COLOR_THEME, threeLegalOfficers } from '../TestData';
import { CommonContext, Viewer } from "../CommonContext";
import { BalanceState } from "@logion/client/dist/Balance.js";

export let setColorTheme = jest.fn();

export let refresh = jest.fn();

export let balanceState: BalanceState | undefined = {
    balances: [],
} as unknown as BalanceState;

export function setBalanceState(value: BalanceState | undefined) {
    balanceState = value;
}

let viewer: Viewer = "User";

export function setViewer(_viewer: Viewer) {
    viewer = _viewer;
}

export enum ExpectNewTransactionStatus {
    IDLE,
    WAITING_NEW_TRANSACTION,
    DONE
}

export function useCommonContext() {
    const commonContext:Partial<CommonContext> = {
        balanceState,
        accountsBalances: {},
        colorTheme: COLOR_THEME,
        setColorTheme,
        refresh,
        nodesUp: [],
        nodesDown: [],
        availableLegalOfficers: threeLegalOfficers,
        viewer,
        backendConfig: () => ({ features:{ iDenfy: false, vote: false }}),
        expectNewTransactionState: { status: ExpectNewTransactionStatus.IDLE, refreshCount: 0 },
    };
    return commonContext;
}

