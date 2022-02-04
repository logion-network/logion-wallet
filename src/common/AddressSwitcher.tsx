import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import './AddressSwitcher.css';
import AccountAddress from './AccountAddress';
import { useCommonContext } from './CommonContext';
import Button from './Button';
import Dialog from './Dialog';
import { useNavigate } from "react-router";
import { Account } from "./types/Accounts";
import { LEGAL_OFFICER_PATH, USER_PATH } from "../RootPaths";

export interface Props {
    selectAddress: ((userAddress: string) => void) | null,
}

export default function AddressSwitcher(props: Props) {
    const { colorTheme, logout, accounts, authenticate } = useCommonContext();
    const [ confirm, setConfirm ] = useState<boolean>(false);
    const navigate = useNavigate();

    if(accounts === null || props.selectAddress === null || accounts.current === undefined) {
        return null;
    }

    function selectAddress(address: Account) {
        if (address.token !== undefined) {
            props.selectAddress!(address.address)
            if (address.isLegalOfficer) {
                navigate(LEGAL_OFFICER_PATH)
            } else {
                navigate(USER_PATH)
            }
        }
    }

    return (
        <div
            className={ "AddressSwitcher " + colorTheme.type }
            style={{
                color: colorTheme.accounts.foreground
            }}
        >
            <Dropdown>
                <Dropdown.Toggle id="address-switcher-toggle">
                    <div className="address-data">
                        <AccountAddress
                            hint="Click to select another address"
                            address={ accounts.current }
                            disabled={ accounts.current.token === undefined }
                        />
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu
                    style={{
                        color: colorTheme.accounts.foreground,
                        backgroundColor: colorTheme.accounts.background,
                        boxShadow: `0 0 25px ${colorTheme.shadowColor}`,
                    }}
                >
                    {
                        accounts.all
                            .filter(address => address.address !== accounts!.current!.address)
                            .map(address => (
                            <Dropdown.Item
                                key={ address.address }
                                onClick={ () => selectAddress(address) }
                            >
                                <AccountAddress
                                    address={ address }
                                    disabled={ address.token === undefined }
                                    login={ () => authenticate([ address.address ]) }
                                />
                            </Dropdown.Item>
                        ))
                    }
                    <Dropdown.Item
                        key="logout"
                        onClick={ () => setConfirm(true) }
                        style={{
                            borderTop: `1px solid ${colorTheme.accounts.foreground}`,
                        }}
                        className="logout"
                    >
                        <Button variant='salmon'>Log Out</Button>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <Dialog
                show={ confirm }
                actions={[
                    {
                        id: "confirm",
                        buttonText: "Confirm",
                        buttonVariant: "primary",
                        callback: logout
                    },
                    {
                        id: "cancel",
                        buttonText: "Cancel",
                        buttonVariant: "secondary",
                        callback: () => setConfirm(false)
                    }
                ]}
                size="lg"
            >
                <p>This action will log you off from <strong>all</strong> current connected accounts, do you confirm ?</p>
            </Dialog>
        </div>
    );
}
