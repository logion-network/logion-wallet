import { useState, useCallback, useMemo, useEffect } from 'react';
import { Form, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { BalanceState } from '@logion/client';
import { Numbers, Lgnt, ValidAccountId, Fees, TypesAccountData } from '@logion/node-api';

import { CallCallback, useLogionChain } from '../logion-chain';

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
import EstimatedFees from "../loc/fees/EstimatedFees";
import BalanceGauge from './BalanceGauge';

export interface Props {
    balance: TypesAccountData,
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
    const { colorTheme, mutateBalanceState, balanceState } = useCommonContext();
    const [ destination, setDestination ] = useState("");
    const [ amount, setAmount ] = useState("");
    const [ unit, setUnit ] = useState(Numbers.NONE);
    const [ transferDialogState, setTransferDialogState ] = useState<TransferDialogState>(HIDDEN_DIALOG);
    const { vaultAccount, sendButton } = props;
    const [ done, setDone ] = useState(false);
    const [ fees, setFees ] = useState<Fees>();

    const isValidTransfer = useCallback(() => {
        return client !== null
            && client.isValidAddress(destination)
            && !isNaN(Number(amount))
            && Number(amount) > 0
            && !accounts!.current!.accountId.equals({
                type: "Polkadot",
                address: destination,
            })
    }, [ accounts, amount, client, destination ]);

    useEffect(() => {
        if (isValidTransfer()) {
            balanceState?.estimateFeesTransfer({
                amount: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(amount, unit)),
                destination: ValidAccountId.polkadot(destination),
            }).then(setFees);
        } else {
            setFees(undefined);
        }
    }, [ amount, balanceState, destination, isValidTransfer, unit ]);

    const transfer = useMemo(() => {
        return async (callback: CallCallback) => {
            await mutateBalanceState(async (state: BalanceState) => {
                return await state.transfer({
                    payload: {
                        amount: Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(amount, unit)),
                        destination: ValidAccountId.polkadot(destination),
                    },
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
        setFees(undefined);
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
            <BalanceGauge
                balance={ props.balance }
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
                className="TransferDialog"
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
                        disabled: done || !extrinsicSubmissionState.canSubmit() || !isValidTransfer()
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
                            isInvalid={ destination !== "" && (!client.isValidAddress(destination) || accounts!.current!.accountId.equals({ type: "Polkadot", address: destination })) }
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
                <EstimatedFees fees={ fees }/>

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
