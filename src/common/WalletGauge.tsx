import { useState, useCallback } from 'react';
import { ATTO, FEMTO, MICRO, MILLI, NANO, NONE, PICO, PrefixedNumber } from '@logion/node-api/dist/numbers';
import { Coin, SYMBOL, transferSubmittable } from '@logion/node-api/dist/Balances';
import { isValidAccountId } from '@logion/node-api/dist/Accounts';

import Gauge from './Gauge';
import Button from './Button';
import Icon from './Icon';

import './WalletGauge.css';
import Dialog from './Dialog';
import FormGroup from './FormGroup';
import { useCommonContext } from './CommonContext';
import { Form, Spinner, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { useLogionChain } from '../logion-chain';
import ExtrinsicSubmitter, { SignAndSubmit } from '../ExtrinsicSubmitter';
import Alert from './Alert';
import TransactionConfirmation, { Status } from "./TransactionConfirmation";
import { signAndSend } from 'src/logion-chain/Signature';

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
    const { colorTheme, accounts } = useCommonContext();
    const { api } = useLogionChain();
    const [ destination, setDestination ] = useState("");
    const [ amount, setAmount ] = useState("");
    const [ unit, setUnit ] = useState(NONE);
    const [ signAndSubmit, setSignAndSubmit ] = useState<SignAndSubmit>(null);
    const [ transferDialogParams, setTransferDialogParams ] = useState<TransferDialogParams>({title: "", destination: true});
    const { vaultAddress, sendButton } = props;
    const [ transferError, setTransferError ] = useState(false);

    const transferCallback = useCallback(() => {
        const signAndSubmit: SignAndSubmit = (setResult, setError) => signAndSend({
            signerId: accounts!.current!.address,
            callback: setResult,
            errorCallback: setError,
            submittable: transferSubmittable({
                api: api!,
                destination,
                amount: new PrefixedNumber(amount, unit),
            })
        });
        setSignAndSubmit(() => signAndSubmit);
    }, [ accounts, amount, api, destination, unit ]);

    const clearFormCallback = useCallback(() => {
        setDestination("");
        setAmount("");
        setSignAndSubmit(null);
    }, [ setDestination, setAmount, setSignAndSubmit ])

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
                                disabled: signAndSubmit !== null && !transferError
                            },
                            {
                                id: 'transfer',
                                buttonText: "Transfer",
                                buttonVariant: 'polkadot',
                                callback: transferCallback,
                                disabled: signAndSubmit !== null || !isValidAccountId(api!, destination) || isNaN(Number(amount)) || Number(amount) === 0 || destination === accounts!.current!.address
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
                                            isInvalid={ destination !== "" && (!isValidAccountId(api!, destination) || destination === accounts!.current!.address) }
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
                        <ExtrinsicSubmitter
                            id="transferLogs"
                            successMessage="Transfer successful."
                            signAndSubmit={ signAndSubmit }
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
