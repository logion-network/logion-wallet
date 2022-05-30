import { useState, useCallback } from 'react';
import { Form, Spinner, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { BalanceState } from '@logion/client/dist/Balance';
import { ATTO, FEMTO, MICRO, MILLI, NANO, NONE, PICO, PrefixedNumber } from '@logion/node-api/dist/numbers';
import { Coin, SYMBOL } from '@logion/node-api/dist/Balances';

import { useLogionChain } from '../logion-chain';
import ClientExtrinsicSubmitter, { Call, CallCallback } from '../ClientExtrinsicSubmitter';

import Gauge from './Gauge';
import Button from './Button';
import Icon from './Icon';
import Dialog from './Dialog';
import FormGroup from './FormGroup';
import { useCommonContext } from './CommonContext';
import Alert from './Alert';
import TransactionConfirmation, { Status } from "./TransactionConfirmation";

import './WalletGauge.css';

export interface Props {
    coin: Coin,
    balance: PrefixedNumber,
    level: number,
    type: 'arc' | 'linear',
    vaultAddress?: string,
    sendButton?: boolean
}

interface TransferDialogParams {
    title: string,
    destination: boolean
}

export default function WalletGauge(props: Props) {
    const { accounts, signer, client } = useLogionChain();
    const { colorTheme, mutateBalanceState } = useCommonContext();
    const [ destination, setDestination ] = useState("");
    const [ amount, setAmount ] = useState("");
    const [ unit, setUnit ] = useState(NONE);
    const [ signAndSubmit, setSignAndSubmit ] = useState<Call>();
    const [ transferDialogParams, setTransferDialogParams ] = useState<TransferDialogParams>({title: "", destination: true});
    const { vaultAddress, sendButton } = props;
    const [ transferError, setTransferError ] = useState(false);

    const transferCallback = useCallback(() => {
        const signAndSubmit: Call = async (callback: CallCallback) => {
            await mutateBalanceState(async (state: BalanceState) => {
                return await state.transfer({
                    amount: new PrefixedNumber(amount, unit),
                    destination,
                    callback,
                    signer: signer!
                });
            });
        };
        setSignAndSubmit(() => signAndSubmit);
    }, [ amount, destination, unit, mutateBalanceState, signer ]);

    const clearFormCallback = useCallback(() => {
        setDestination("");
        setAmount("");
        setSignAndSubmit(undefined);
    }, [ setDestination, setAmount, setSignAndSubmit ])

    if(!client) {
        return null;
    }

    return (
        <TransactionConfirmation
            clearFormCallback={ clearFormCallback }
            children={ (status, startTransferringCallback, cancelCallback, successCallback) => {
                return <div className={ "WalletGauge " + props.type }>
                    <Gauge
                        readingIntegerPart={ props.balance.coefficient.toInteger() }
                        readingDecimalPart={ props.balance.coefficient.toFixedPrecisionDecimals(2) }
                        unit={ props.balance.prefix.symbol + SYMBOL }
                        level={ props.level }
                        type={ props.type }
                    />
                    { (sendButton === undefined || sendButton) &&
                    <div className="actions">
                            <Button slim onClick={ () => {
                                setTransferDialogParams({
                                    title: `Transfer ${ SYMBOL }s`,
                                    destination: true
                                });
                                startTransferringCallback();
                            } }>
                                <Icon icon={ { id: 'send' } } /> Send
                            </Button>
                        { vaultAddress !== undefined &&
                            <Button slim onClick={ () => {
                                setDestination(vaultAddress);
                                setTransferDialogParams({
                                    title: `Transfer ${ SYMBOL }s to your logion Vault`,
                                    destination: false
                                });
                                startTransferringCallback();
                            } }>
                                <Icon icon={ { id: 'vault-in' } } /> Send to Vault
                            </Button>
                        }
                    </div>
                    }
                    <Dialog
                        show={ status !== Status.IDLE }
                        actions={ [
                            {
                                id: 'cancel',
                                buttonText: "Cancel",
                                buttonVariant: 'secondary-polkadot',
                                callback: cancelCallback,
                                disabled: signAndSubmit !== undefined && !transferError
                            },
                            {
                                id: 'transfer',
                                buttonText: "Transfer",
                                buttonVariant: 'polkadot',
                                callback: transferCallback,
                                disabled: signAndSubmit !== undefined || !client.isValidAddress(destination) || isNaN(Number(amount)) || Number(amount) === 0 || destination === accounts!.current!.address
                            }
                        ] }
                        size="lg"
                    >
                        <h3>{ transferDialogParams.title }</h3>
                        {
                            status === Status.TRANSFERRING &&
                            <>
                                { transferDialogParams.destination &&
                                    <FormGroup
                                        id="destination"
                                        label="Destination"
                                        control={ <Form.Control
                                            isInvalid={ destination !== "" && (!client.isValidAddress(destination) || destination === accounts!.current!.address) }
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
                                                title={ `${ unit.symbol }${ SYMBOL }` }
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
                                                ].map(unit => <Dropdown.Item key={ unit.symbol }
                                                                             onClick={ () => setUnit(unit) }>{ `${ unit.symbol }${ SYMBOL }` }</Dropdown.Item>)
                                            }</DropdownButton>
                                            <Form.Control.Feedback type="invalid">
                                                Please enter a valid amount.
                                            </Form.Control.Feedback>
                                        </InputGroup>
                                    }
                                    colors={ colorTheme.dialog }
                                />
                            </>
                        }
                        <ClientExtrinsicSubmitter
                            successMessage="Transfer successful."
                            call={ signAndSubmit }
                            onSuccess={ successCallback }
                            onError={ () => setTransferError(true) }
                        />
                        {
                            (status === Status.EXPECTING_NEW_TRANSACTION || status === Status.WAITING_FOR_NEW_TRANSACTION) &&
                            <Alert variant="info">
                                <Spinner animation="border" />
                                <p>Transfer successful, waiting for the transaction to be finalized.</p>
                                <p>Note that this may take up to 30 seconds. If you want to proceed, you can safely
                                    click on cancel but your transaction may not show up yet.</p>
                            </Alert>
                        }
                    </Dialog>
                </div>
            }}/>
    )
}
