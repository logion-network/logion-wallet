import { ValidAccountId } from "@logion/node-api";
import { useState, useCallback } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';

import Container from 'react-bootstrap/Container';

import { useLogionChain } from './logion-chain';
import Button from './common/Button';
import Checkbox from './components/toggle/Checkbox';

import AbsoluteLogo from './AbsoluteLogo';

import './Login.css';
import Icon from "./common/Icon";
import Alert from "./common/Alert";

export const LOGIN_PATH = "/login";

export interface LocationState {
    referrer?: string;
}

function referrer(location: Location): string {
    const state = location.state as any;
    if(state && state.referrer) {
        return state.referrer;
    } else {
        return "/";
    }
}

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const { connectedNodeMetadata, accounts, authenticate, tryEnableMetaMask, metaMaskAccounts } = useLogionChain();
    const [ selectedAddresses, setSelectedAddresses ] = useState<ValidAccountId[]>([]);
    const [ error, setError ] = useState<string>();

    const startLogin = useCallback(async () => {
        setError(undefined);
        try {
            await authenticate(selectedAddresses);
            navigate(referrer(location));
        } catch(e) {
            console.error(e);
            setError((e as Error).message);
        }
    }, [ selectedAddresses, navigate, location, authenticate ]);

    if(accounts === null || connectedNodeMetadata === null) {
        return null;
    }

    function selectAddress(address: ValidAccountId, selected: boolean) {
        let newSet;
        if(selected) {
            newSet = [ ...selectedAddresses ];
            newSet.push(address);
        } else {
            newSet = selectedAddresses.filter(item => item !== address);
        }
        setSelectedAddresses(newSet);
    }

    return (
        <div className="Login">
            <AbsoluteLogo />
            <Container className="column">
                <h1>
                    Please authenticate yourself by selecting<br />
                    one or several accounts below
                </h1>

                <div className="chooser">
                    <h2>The following accounts have been detected:</h2>

                    <div className="accounts-container">
                        {
                            accounts.all
                            .filter(address => address.token === undefined)
                            .map(address => (
                                <div className="account" key={ address.accountId.toKey() }>
                                    <Checkbox
                                        checked={ selectedAddresses.includes(address.accountId) }
                                        setChecked={ selected => selectAddress(address.accountId, selected) }
                                    />
                                    <div
                                        className="icon"
                                    >
                                        <Icon icon={{ id: address.accountId.type === "Ethereum" ? "metamask" : "polkadot-account" }} width="40px" />
                                    </div>
                                    <div
                                        className="name-address"
                                    >
                                        <div className="name">{ address.name }</div>
                                        <div className="address">{ address.accountId.address }</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    <Button
                        disabled={ selectedAddresses.length === 0 }
                        onClick={ startLogin }
                    >
                        Log in
                    </Button>

                    {
                        error !== undefined &&
                        <Alert
                            variant="warning_color"
                        >
                            { error }
                        </Alert>
                    }
                </div>

                <div className="extensions-container">
                    <h2>You do not see your account?</h2>

                    <Button
                        className="metamask"
                        disabled={ metaMaskAccounts !== null }
                        onClick={ tryEnableMetaMask }
                    >
                       <Icon icon={{ id: "metamask" }} height="30px" /> Try with MetaMask
                    </Button>
                </div>

                <div className="node-info">
                    <p className="name">You are currently connected to the following logion node:</p>
                    <p className="peer-id">
                        <img src={process.env.PUBLIC_URL + "/assets/node.svg"} alt="node icon" />
                        Peer ID: {connectedNodeMetadata.peerId}
                    </p>
                </div>
            </Container>
            <div className="left-character">
                <img src={process.env.PUBLIC_URL + "/assets/login-left-character.svg"} alt="men pointing at box" />
            </div>
            <div className="right-character">
                <img src={process.env.PUBLIC_URL + "/assets/login-right-character.svg"} alt="women holding a loc" />
            </div>
        </div>
    );
}
