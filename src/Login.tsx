import { useState, useCallback } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';

import Container from 'react-bootstrap/Container';

import { useCommonContext } from './common/CommonContext';
import { useLogionChain } from './logion-chain';
import Button from './common/Button';
import Checkbox from './common/Checkbox';

import AbsoluteLogo from './AbsoluteLogo';

import './Login.css';

export const LOGIN_PATH = "/login";

export interface LocationState {
    referrer?: string;
    selectedAddresses?: string[];
}

function getSelectedAddresses(location: Location): string[] {
    const state = location.state as any;
    if(state && state.selectedAddresses) {
        return state.selectedAddresses;
    } else {
        return [];
    }
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
    const { connectedNodeMetadata } = useLogionChain();
    const { accounts, axiosFactory, authenticate } = useCommonContext();
    const [ selectedAddresses, setSelectedAddresses ] = useState<string[]>(getSelectedAddresses(location));

    const startLogin = useCallback(async () => {
        await authenticate(selectedAddresses);
        navigate(referrer(location));
    }, [ selectedAddresses, navigate, location, authenticate ]);

    if(accounts === null || connectedNodeMetadata === null || axiosFactory === undefined) {
        return null;
    }

    function selectAddress(address: string, selected: boolean) {
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
                                <div className="account" key={ address.address }>
                                    <Checkbox
                                        checked={ selectedAddresses.includes(address.address) }
                                        setChecked={ selected => selectAddress(address.address, selected) }
                                    />
                                    <div
                                        className="icon"
                                    >
                                        { address.name.substring(0, 1).toUpperCase() }
                                    </div>
                                    <div
                                        className="name-address"
                                    >
                                        <div className="name">{ address.name }</div>
                                        <div className="address">{ address.address }</div>
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
