import { ValidAccountId } from "@logion/node-api";
import { useCallback, useMemo, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import AccountAddress from './AccountAddress';
import { useCommonContext } from './CommonContext';
import Button from './Button';
import Dialog from './Dialog';
import { useLogionChain } from '../logion-chain';
import './AddressSwitcher.css';
import { useNavigate } from "react-router-dom";

export default function AddressSwitcher() {
    const { logout, accounts, authenticate, selectAddress } = useLogionChain();
    const { colorTheme, balanceState, accountsBalances } = useCommonContext();
    const [ confirm, setConfirm ] = useState<boolean>(false);
    const navigate = useNavigate();

    const selectAddressCallback = useCallback(async (address: ValidAccountId) => {
        selectAddress!(address);
        navigate("/");
    }, [ selectAddress, navigate ]);

    const authenticateCallback = useCallback(async (address: ValidAccountId) => {
        await authenticate([ address ]);
        selectAddressCallback(address);
    }, [ authenticate, selectAddressCallback ]);

    const balance = useMemo(() => balanceState?.balance || null, [ balanceState ]);

    if(accounts === null || selectAddress === null || accounts.current === undefined) {
        return null;
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
                            balance={ balance }
                            account={ accounts.current }
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
                            .filter(account => account.accountId !== accounts!.current!.accountId)
                            .map(account => (
                            <Dropdown.Item
                                key={ account.accountId.toKey() }
                                onClick={ () => account.token ? selectAddressCallback(account.accountId) : undefined }
                            >
                                <AccountAddress
                                    balance={ accountsBalances[account.accountId.address] }
                                    account={ account }
                                    disabled={ account.token === undefined }
                                    login={ () => authenticateCallback(account.accountId) }
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
