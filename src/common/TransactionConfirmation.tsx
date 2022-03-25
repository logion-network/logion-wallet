import { useState, useCallback, useEffect } from "react";
import { Children, customClassName } from "./types/Helpers";
import { useCommonContext } from "./CommonContext";

import './TransactionConfirmation.css';

export enum Status {
    IDLE,
    TRANSFERRING,
    EXPECTING_NEW_TRANSACTION,
    WAITING_FOR_NEW_TRANSACTION
}

interface State {
    status: Status;
    minExpectedTransactions?: number;
}

const MAX_REFRESH_COUNT = 12;
const REFRESH_PERIOD_MS = 3000;

export interface Props {
    children: (status: Status, startTransferringCallback: () => void, cancelCallback: () => void, successCallback: () => void) => Children;
    clearFormCallback: () => void;
    initialStatus?: Status;
    vaultFirst?: boolean;
}

export default function TransactionConfirmation(props: Props) {

    const { clearFormCallback, initialStatus } = props
    const { refresh, transactions } = useCommonContext();
    const [ state, setState ] = useState<State>({ status: initialStatus ? initialStatus : Status.IDLE });
    const [ refreshCount, setRefreshCount ] = useState(0);
    const [ refreshScheduled, setRefreshScheduled ] = useState(false);

    const startTransferringCallback = useCallback(() => {
        setState({ status: Status.TRANSFERRING })
    }, [ setState ]);

    const successCallback = useCallback(() => {
        clearFormCallback();
        setState({
            status: Status.EXPECTING_NEW_TRANSACTION,
            minExpectedTransactions: transactions ? transactions!.length + 1 : 1
        });
    }, [ clearFormCallback, transactions, setState ]);

    const cancelCallback = useCallback(() => {
        clearFormCallback();
        if(state.status === Status.WAITING_FOR_NEW_TRANSACTION) {
            console.log("Cancelling polling");
            setRefreshCount(MAX_REFRESH_COUNT);
        }
        setState({ status: Status.IDLE });
    }, [ state, setState, clearFormCallback, setRefreshCount ]);

    const scheduleRetryIfNoneInProgress = useCallback((refreshCount: number) => {
        if(!refreshScheduled) {
            setRefreshScheduled(true);
            window.setTimeout(() => {
                console.log(`Try #${refreshCount}...`);
                setRefreshCount(refreshCount + 1);
                setRefreshScheduled(false);
                refresh(false);
            }, REFRESH_PERIOD_MS);
        }
    }, [ refreshScheduled, setRefreshScheduled, setRefreshCount, refresh ]);

    useEffect(() => {
        if(state.status === Status.EXPECTING_NEW_TRANSACTION) {
            setRefreshCount(0);
            scheduleRetryIfNoneInProgress(0);
            setState({
                ...state,
                status: Status.WAITING_FOR_NEW_TRANSACTION,
            });
        }
    }, [ state, setState, refresh, refreshCount, setRefreshCount, scheduleRetryIfNoneInProgress ]);

    useEffect(() => {
        if(state.status === Status.WAITING_FOR_NEW_TRANSACTION) {
            if(transactions
                && (transactions.length >= state.minExpectedTransactions!
                    || refreshCount >= MAX_REFRESH_COUNT)) {
                console.log(`Stopped polling after ${refreshCount} retries  (${transactions!.length} >= ${state.minExpectedTransactions!})`);
                setState({status: Status.IDLE});
            } else {
                console.log(`Scheduling retry #${refreshCount} (${transactions?.length} < ${state.minExpectedTransactions!})...`);
                scheduleRetryIfNoneInProgress(refreshCount);
            }
        }
    }, [ state, setState, transactions, refreshCount, scheduleRetryIfNoneInProgress ]);

    const className = customClassName("TransactionConfirmation", props.vaultFirst ? "vault-first" : undefined);
    return (
        <div className={ className }>
            { props.children(state.status, startTransferringCallback, cancelCallback, successCallback) }
        </div>
    )
}
