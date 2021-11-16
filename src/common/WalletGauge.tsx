import { useState, useCallback, useEffect } from 'react';
import { ATTO, FEMTO, MICRO, MILLI, NANO, NONE, PICO, PrefixedNumber } from '../logion-chain/numbers';
import { Coin, transfer } from '../logion-chain/Balances';

import Gauge from './Gauge';
import Button from './Button';
import Icon from './Icon';

import './WalletGauge.css';
import Dialog from './Dialog';
import FormGroup from './FormGroup';
import { useCommonContext } from './CommonContext';
import { Form, Spinner, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { useLogionChain } from '../logion-chain';
import { isValidAccountId } from '../logion-chain/Accounts';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';
import Alert from './Alert';

export interface Props {
    coin: Coin,
    balance: PrefixedNumber,
    level: number,
    type: 'arc' | 'linear',
}

interface State {
    status: Status;
    minExpectedTransactions?: number;
}

enum Status {
    IDLE,
    TRANSFERRING,
    EXPECTING_NEW_TRANSACTION,
    WAITING_FOR_NEW_TRANSACTION
}

const MAX_REFRESH_COUNT = 12;
const REFRESH_PERIOD_MS = 3000;

export default function WalletGauge(props: Props) {
    const { colorTheme, accounts, refresh, transactions } = useCommonContext();
    const { api } = useLogionChain();
    const [ destination, setDestination ] = useState("");
    const [ amount, setAmount ] = useState("");
    const [ unit, setUnit ] = useState(NONE);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ state, setState ] = useState<State>({status: Status.IDLE});

    const [ refreshCount, setRefreshCount ] = useState(0);
    const [ refreshScheduled, setRefreshScheduled ] = useState(false);

    const transferCallback = useCallback(() => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => transfer({
            api: api!,
            signerId: accounts!.current!.address,
            callback: setResult,
            errorCallback: setError,
            destination,
            amount: new PrefixedNumber(amount, unit),
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ accounts, amount, api, destination, unit ]);

    const clearFormCallback = useCallback(() => {
        setDestination("");
        setAmount("");
        setSignAndSubmit(null);
    }, [ setDestination, setAmount, setSignAndSubmit ]);

    const successCallback = useCallback(() => {
        clearFormCallback();
        setState({
            status: Status.EXPECTING_NEW_TRANSACTION,
            minExpectedTransactions: transactions!.length + 1
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
            if(transactions !== undefined
                    && (transactions!.length >= state.minExpectedTransactions!
                        || refreshCount >= MAX_REFRESH_COUNT)) {
                console.log(`Stopped polling after ${refreshCount} retries  (${transactions!.length} >= ${state.minExpectedTransactions!})`);
                setState({status: Status.IDLE});
            } else {
                console.log(`Scheduling retry #${refreshCount} (${transactions!.length} < ${state.minExpectedTransactions!})...`);
                scheduleRetryIfNoneInProgress(refreshCount);
            }
        }
    }, [ state, setState, transactions, refreshCount, scheduleRetryIfNoneInProgress ]);

    return (
        <div className={ "WalletGauge " + props.type }>
            <Gauge
                readingIntegerPart={ props.balance.coefficient.toInteger() }
                readingDecimalPart={ props.balance.coefficient.toFixedPrecisionDecimals(2) }
                unit={ props.balance.prefix.symbol + "LOG" }
                level={ props.level }
                type={ props.type }
            />
            <div className="actions">
                <Button slim onClick={() => setState({status: Status.TRANSFERRING})}><Icon icon={{id:'send'}} /> Send</Button>
            </div>
            <Dialog
                show={ state.status !== Status.IDLE }
                actions={[
                    {
                        id: 'cancel',
                        buttonText: "Cancel",
                        buttonVariant: 'secondary',
                        callback: cancelCallback
                    },
                    {
                        id: 'transfer',
                        buttonText: "Transfer",
                        buttonVariant: 'primary',
                        callback: transferCallback,
                        disabled: state.status !== Status.TRANSFERRING || !isValidAccountId(api!, destination) || isNaN(Number(amount)) || destination === accounts!.current!.address
                    }
                ]}
                size="lg"
            >
                <h3>Transfer LOGs</h3>
                {
                    state.status === Status.TRANSFERRING &&
                    <>
                        <FormGroup
                            id="destination"
                            label="Destination"
                            control={<Form.Control
                                isInvalid={destination !== "" && (!isValidAccountId(api!, destination) || destination === accounts!.current!.address)}
                                type="text"
                                placeholder="The beneficiary's SS58 address"
                                value={destination}
                                onChange={value => setDestination(value.target.value)}
                            />}
                            colors={colorTheme.dialog}
                        />
                        <FormGroup
                            id="amout"
                            label="Amount"
                            noFeedback={true}
                            control={
                                <InputGroup hasValidation>
                                    <Form.Control
                                        isInvalid={amount !== "" && isNaN(Number(amount))}
                                        type="text"
                                        placeholder="The amount to transfer"
                                        value={amount}
                                        onChange={value => setAmount(value.target.value)}
                                    />
                                    <DropdownButton
                                        title={ `${unit.symbol}LOG` }
                                        id="input-group-dropdown-1"
                                    >{
                                        [
                                            NONE,
                                            MILLI,
                                            MICRO,
                                            NANO,
                                            PICO,
                                            FEMTO,
                                            ATTO
                                        ].map(unit => <Dropdown.Item key={ unit.symbol } onClick={() => setUnit(unit)}>{ `${unit.symbol}LOG` }</Dropdown.Item>)
                                    }</DropdownButton>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a valid amount.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            }
                            colors={colorTheme.dialog}
                        />
                    </>
                }
                <ExtrinsicSubmitter
                    id="transferLogs"
                    successMessage="Transfer successful."
                    signAndSubmit={ signAndSubmit }
                    onSuccess={ successCallback }
                    onError={ () => {} }
                />
                {
                    (state.status === Status.EXPECTING_NEW_TRANSACTION || state.status === Status.WAITING_FOR_NEW_TRANSACTION) &&
                    <Alert variant="info">
                        <Spinner animation="border"/>
                        <p>Transfer successful, waiting for the transaction to be finalized.</p>
                        <p>Note that this may take up to 30 seconds. If you want to proceed, you can safely click on cancel but your transaction may not show up yet.</p>
                    </Alert>
                }
            </Dialog>
        </div>
    );
}
