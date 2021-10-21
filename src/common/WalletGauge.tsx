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
    interval?: number;
}

enum Status {
    IDLE,
    TRANSFERRING,
    EXPECTING_NEW_TRANSACTION,
    WAITING_FOR_NEW_TRANSACTION
}

export default function WalletGauge(props: Props) {
    const { colorTheme, accounts, refresh, transactions } = useCommonContext();
    const { api } = useLogionChain();
    const [ destination, setDestination ] = useState("");
    const [ amount, setAmount ] = useState("");
    const [ unit, setUnit ] = useState(NONE);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ state, setState ] = useState<State>({status: Status.IDLE});

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

    const successCallback = useCallback(() => {
        setDestination("");
        setAmount("");
        setSignAndSubmit(null);

        setState({
            status: Status.EXPECTING_NEW_TRANSACTION,
            minExpectedTransactions: transactions!.length + 1
        });
    }, [ transactions, setState ]);

    const cancelCallback = useCallback(() => {
        if(state.status === Status.WAITING_FOR_NEW_TRANSACTION) {
            window.clearInterval(state.interval);
        }
        setState({ status: Status.IDLE });
    }, [ state, setState ]);

    useEffect(() => {
        if(state.status === Status.EXPECTING_NEW_TRANSACTION) {
            const interval = window.setInterval(() => {
                refresh(false);
            }, 3000);

            setState({
                ...state,
                status: Status.WAITING_FOR_NEW_TRANSACTION,
                interval
            });
        }
    }, [ state, setState, refresh ]);

    useEffect(() => {
        if(state.status === Status.WAITING_FOR_NEW_TRANSACTION
                && transactions !== undefined
                && transactions!.length >= state.minExpectedTransactions!) {
            window.clearInterval(state.interval);
            setState({status: Status.IDLE});
        }
    }, [ state, setState, transactions ]);

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
                                as={InputGroup.Append}
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
                                Please choose a username.
                            </Form.Control.Feedback>
                        </InputGroup>
                    }
                    colors={colorTheme.dialog}
                />
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
                    </Alert>
                }
            </Dialog>
        </div>
    );
}
