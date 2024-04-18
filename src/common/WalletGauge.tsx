import { useState, useCallback, useMemo } from 'react';
import { Form, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { BalanceState } from '@logion/client';
import { Numbers, CoinBalance, Lgnt, ValidAccountId } from '@logion/node-api';

import { CallCallback, useLogionChain } from '../logion-chain';

import Gauge from './Gauge';
import Button from './Button';
import Icon from './Icon';
import Dialog from './Dialog';
import FormGroup from './FormGroup';
import { useCommonContext } from './CommonContext';
import Alert from './Alert';

import './WalletGauge.css';
import BalanceDetails from './BalanceDetails';
import ExtrinsicSubmissionStateView from 'src/ExtrinsicSubmissionStateView';
import VaultOutRequest from 'src/vault/VaultOutRequest';

export interface Props {
    balance: CoinBalance,
    vaultAccount?: ValidAccountId,
    sendButton: boolean,
    sendToVault: boolean,
    withdrawFromVault: boolean,
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
    const { colorTheme, mutateBalanceState } = useCommonContext();
    const [ destination, setDestination ] = useState("");
    const [ amount, setAmount ] = useState("");
    const [ unit, setUnit ] = useState(Numbers.NONE);
    const [ transferDialogState, setTransferDialogState ] = useState<TransferDialogState>(HIDDEN_DIALOG);
    const { vaultAccount, sendButton } = props;
    const [ done, setDone ] = useState(false);

    const transfer = useMemo(() => {
        return async (callback: CallCallback) => {
            await mutateBalanceState(async (state: BalanceState) => {
                return await state.transfer({
                    amount: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(amount, unit)),
                    destination: ValidAccountId.polkadot(destination),
                    callback,
                    signer: signer!
                });
            });
            setDone(true);
        };
    }, [ amount, destination, unit, mutateBalanceState, signer ]);

    const sendCallback = useCallback(async () => {
        try {
            await submitCall(transfer);
        } catch(e) {}
    }, [ transfer, submitCall ]);

    const clearFormCallback = useCallback(() => {
        setDestination("");
        setAmount("");
        setTransferDialogState(HIDDEN_DIALOG);
    }, [ setDestination, setAmount ]);

    const closeCallback = useCallback(() => {
        clearFormCallback();
        clearSubmissionState();
        setDone(false);
    }, [ clearFormCallback, clearSubmissionState ]);

    if(!client) {
        return null;
    }

    return (
        <div className="WalletGauge">
            <Gauge
                readingIntegerPart={ props.balance.available.coefficient.toInteger() }
                readingDecimalPart={ props.balance.available.coefficient.toFixedPrecisionDecimals(2) }
                unit={ props.balance.available.prefix.symbol + Lgnt.CODE }
                level={ props.balance.level }
            />
            <BalanceDetails
                balance={ props.balance }
            />
            { (sendButton || props.sendToVault || props.withdrawFromVault) &&
            <div className="actions">
                {
                    sendButton &&
                    <Button slim onClick={ () => {
                        setTransferDialogState({
                            title: `Send ${ Lgnt.CODE }s`,
                            destination: true,
                            show: true,
                        });
                    } }>
                        <Icon icon={ { id: 'send' } } /> Send
                    </Button>
                }
                {
                    props.sendToVault && vaultAccount !== undefined &&
                    <Button slim onClick={ () => {
                        setDestination(vaultAccount.address);
                        setTransferDialogState({
                            title: `Send ${ Lgnt.CODE }s to your logion Vault`,
                            destination: false,
                            show: true,
                        });
                    } }>
                        <Icon icon={ { id: 'vault-in' } } /> Send to Vault
                    </Button>
                }
                {
                    props.withdrawFromVault &&
                    <VaultOutRequest/>
                }
            </div>
            }
            <Dialog
                show={ transferDialogState.show }
                actions={ [
                    {
                        id: 'close',
                        buttonText: "Close",
                        buttonVariant: 'secondary',
                        callback: closeCallback,
                        disabled: extrinsicSubmissionState.inProgress,
                    },
                    {
                        id: 'send',
                        buttonText: "Send",
                        buttonVariant: 'polkadot',
                        callback: sendCallback,
                        disabled: done || !extrinsicSubmissionState.canSubmit() || !client.isValidAddress(destination) || isNaN(Number(amount)) || Number(amount) === 0 || destination === accounts!.current!.accountId.address
                    }
                ] }
                size="lg"
            >
                <h3>{ transferDialogState.title }</h3>
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
                {
                    done &&
                    <Alert
                        variant='info'
                    >
                        It may take some time (up to 1 minute) before the transaction actually shows up
                        in your history.
                    </Alert>
                }
            </Dialog>
        </div>
    );
}
