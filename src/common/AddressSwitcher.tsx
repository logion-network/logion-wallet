import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import Addresses from './types/Addresses';

import './AddressSwitcher.css';
import AccountAddress from './AccountAddress';
import { useCommonContext } from './CommonContext';

export interface Props {
    addresses: Addresses | null,
    selectAddress: ((userAddress: string) => void) | null,
}

export default function AddressSwitcher(props: Props) {
    const { colorTheme } = useCommonContext();

    if(props.addresses === null || props.selectAddress === null) {
        return null;
    }

    return (
        <div
            className="AddressSwitcher"
            style={{
                color: colorTheme.accounts.foreground
            }}
        >
            <Dropdown>
                <Dropdown.Toggle id="address-switcher-toggle">
                    <div className="address-data">
                        <AccountAddress
                            hint="Click to select another address"
                            address={ props.addresses.currentAddress }
                        />
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {
                        props.addresses.addresses.map(address => (
                            <Dropdown.Item
                                key={ address.address }
                                onClick={ () => props.selectAddress!(address.address) }
                                style={{
                                    color: colorTheme.accounts.foreground,
                                    backgroundColor: colorTheme.accounts.background,
                                }}
                            >
                                <AccountAddress
                                    address={ address }
                                />
                            </Dropdown.Item>
                        ))
                    }
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}
