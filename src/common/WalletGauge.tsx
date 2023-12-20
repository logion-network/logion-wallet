import { useState, useCallback, useMemo, useEffect } from 'react';
import { Form, Spinner, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { BalanceState } from '@logion/client';
import { Numbers, CoinBalance, Lgnt } from '@logion/node-api';

import { CallCallback, useLogionChain } from '../logion-chain';

import Gauge from './Gauge';
import Button from './Button';
import Icon from './Icon';
import Dialog from './Dialog';
import FormGroup from './FormGroup';
import { ExpectNewTransactionStatus, useCommonContext } from './CommonContext';
import Alert from './Alert';

import './WalletGauge.css';
import BalanceDetails from './BalanceDetails';
import ExtrinsicSubmissionStateView from 'src/ExtrinsicSubmissionStateView';

export interface Props {
    balance: CoinBalance,
    type: 'arc' | 'linear',
    vaultAddress?: string,
    sendButton?: boolean
}

interface TransferDialogState {
    title: string;
    destination: boolean;
    show: boolean;
}

const HIDDEN_DIALOG: TransferDialogState = {
    title: "",
    destination: true,
    show: false,
};

export default function WalletGauge(props: Props) {
    const { accounts, signer, client, submitCall, extrinsicSubmissionState, clearSubmissionState } = useLogionChain();
    const { colorTheme, mutateBalanceState, expectNewTransaction, expectNewTransactionState, stopExpectNewTransaction } = useCommonContext();
    const [ destination, setDestination ] = useState("");
    const [ amount, setAmount ] = useState("");
    const [ unit, setUnit ] = useState(Numbers.NONE);
    const [ transferDialogState, setTransferDialogState ] = useState<TransferDialogState>(HIDDEN_DIALOG);
    const { vaultAddress, sendButton } = props;

    const transfer = useMemo(() => {
        return async (callback: CallCallback) => {
            await mutateBalanceState(async (state: BalanceState) => {
                return await state.transfer({
                    amount: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(amount, unit)),
                    destination,
                    callback,
                    signer: signer!
                });
            });
            expectNewTransaction();
        };
    }, [ amount, destination, unit, mutateBalanceState, signer, expectNewTransaction ]);

    const transferCallback = useCallback(async () => {
        try {
            await submitCall(transfer);
        } catch(e) {}
    }, [ transfer, submitCall ]);

    const clearFormCallback = useCallback(() => {
        setDestination("");
        setAmount("");
        setTransferDialogState(HIDDEN_DIALOG);
    }, [ setDestination, setAmount ]);

    const cancelCallback = useCallback(() => {
        clearFormCallback();
        stopExpectNewTransaction();
        clearSubmissionState();
    }, [ clearFormCallback, stopExpectNewTransaction, clearSubmissionState ]);

    useEffect(() => {
        if(expectNewTransactionState.status === ExpectNewTransactionStatus.DONE) {
            cancelCallback();
        }
    }, [ expectNewTransactionState, cancelCallback ]);

    if(!client) {
        return null;
    }

    return (
        <div className={ "WalletGauge " + props.type }>
            <Gauge
                readingIntegerPart={ props.balance.available.coefficient.toInteger() }
                readingDecimalPart={ props.balance.available.coefficient.toFixedPrecisionDecimals(2) }
                unit={ props.balance.available.prefix.symbol + Lgnt.CODE }
                level={ props.balance.level }
                type={ props.type }
            />
            <BalanceDetails
                balance={ props.balance }
                type={ props.type }
            />
            { (sendButton === undefined || sendButton) &&
            <div className="actions">
                    <Button slim onClick={ () => {
                        setTransferDialogState({
                            title: `Transfer ${ Lgnt.CODE }s`,
                            destination: true,
                            show: true,
                        });
                    } }>
                        <Icon icon={ { id: 'send' } } /> Send
                    </Button>
                { vaultAddress !== undefined &&
                    <Button slim onClick={ () => {
                        setDestination(vaultAddress);
                        setTransferDialogState({
                            title: `Transfer ${ Lgnt.CODE }s to your logion Vault`,
                            destination: false,
                            show: true,
                        });
                    } }>
                        <Icon icon={ { id: 'vault-in' } } /> Send to Vault
                    </Button>
                }
            </div>
            }
            <Dialog
                show={ transferDialogState.show }
                actions={ [
                    {
                        id: 'cancel',
                        buttonText: "Cancel",
                        buttonVariant: 'secondary-polkadot',
                        callback: cancelCallback,
                        disabled: extrinsicSubmissionState.inProgress,
                    },
                    {
                        id: 'transfer',
                        buttonText: "Transfer",
                        buttonVariant: 'polkadot',
                        callback: transferCallback,
                        disabled: !extrinsicSubmissionState.canSubmit() || !client.isValidAddress(destination) || isNaN(Number(amount)) || Number(amount) === 0 || destination === accounts!.current!.accountId.address
                    }
                ] }
                size="lg"
            >
                <h3>{ transferDialogState.title }</h3>
                {
                    expectNewTransactionState.status === ExpectNewTransactionStatus.IDLE &&
                    <>
                        { transferDialogState.destination &&
                            <FormGroup
                                id="destination"
                                label="Destination"
                                control={ <Form.Control
                                    isInvalid={ destination !== "" && (!client.isValidAddress(destination) || destination === accounts!.current!.accountId.address) }
                                    type="text"
                                    placeholder="The beneficiary's SS58 address"
                                    value={ destination }
                                    onChange={ value => setDestination(value.target.value) }
                                /> }
                                colors={ colorTheme.dialog }
                            />
                        }
                        <FormGroup
                            id="amount"
                            label="Amount"
                            noFeedback={ true }
                            control={
                                <InputGroup hasValidation>
                                    <Form.Control
                                        isInvalid={ amount !== "" && isNaN(Number(amount)) }
                                        type="text"
                                        placeholder="The amount to transfer"
                                        value={ amount }
                                        onChange={ value => setAmount(value.target.value) }
                                    />
                                    <DropdownButton
                                        title={ `${ unit.symbol }${ Lgnt.CODE }` }
                                        id="input-group-dropdown-1"
                                    >{
                                        [
                                            Numbers.NONE,
                                            Numbers.MILLI,
                                            Numbers.MICRO,
                                            Numbers.NANO,
                                            Numbers.PICO,
                                            Numbers.FEMTO,
                                            Numbers.ATTO
                                        ].map(unit => <Dropdown.Item key={ unit.symbol }
                                                                        onClick={ () => setUnit(unit) }>{ `${ unit.symbol }${ Lgnt.CODE }` }</Dropdown.Item>)
                                    }</DropdownButton>
                                    <Form.Control.Feedback type="invalid">
                                        Please enter a valid amount.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            }
                            colors={ colorTheme.dialog }
                        />
                        <ExtrinsicSubmissionStateView
                            successMessage="Transfer successful."
                        />
                    </>
                }
                {
                    expectNewTransactionState.status === ExpectNewTransactionStatus.WAITING_NEW_TRANSACTION &&
                    <Alert variant="info">
                        <Spinner animation="border" />
                        <p>Transfer successful, waiting for the transaction to be finalized.</p>
                        <p>Note that this may take up to 30 seconds. If you want to proceed, you can safely
                            click on cancel but your transaction may not show up yet.</p>
                    </Alert>
                }
            </Dialog>
        </div>
    );
}
