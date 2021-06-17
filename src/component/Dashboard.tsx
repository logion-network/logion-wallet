import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children } from './types/Helpers';
import Addresses from './types/Addresses';
import Logo from './Logo';
import AddressSwitcher from './AddressSwitcher';
import {
    ColorTheme,
    AccountAddressColors,
    ColorThemeType
} from './ColorTheme';
import Menu from './Menu';
import { MenuItemData } from './MenuItem';
import Shield from './Shield';

import './Dashboard.css';

export interface PrimaryAreaProps {
    children: Children,
    width: number,
}

export function PrimaryArea(props: PrimaryAreaProps) {

    return (
        <Col
            key="primary-area"
            md={ props.width }
        >
            <div className="PrimaryArea">
                { props.children }
            </div>
        </Col>
    );
}

export interface SecondaryAreaProps {
    children?: Children,
    addresses: Addresses,
    accountColors: AccountAddressColors,
    selectAddress: (userAddress: string) => void,
    colorThemeType: ColorThemeType,
    width: number,
}

export function SecondaryArea(props: SecondaryAreaProps) {

    return (
        <Col
            key="secondary-area"
            md={ props.width }
        >
            <div className="SecondaryArea">
                { props.children }
            </div>
        </Col>
    );
}

export interface ContentPaneProps {
    addresses: Addresses,
    selectAddress: (userAddress: string) => void,
    primaryAreaChildren: Children,
    secondaryAreaChildren?: Children,
    colors: ColorTheme,
    primaryPaneWidth?: number,
}

const SIDEBAR_WIDTH = 2;

export function ContentPane(props: ContentPaneProps) {

    let primaryPaneWidth: number = 6;
    if(props.primaryPaneWidth !== undefined) {
        primaryPaneWidth = props.primaryPaneWidth;
    }

    return (
        <>
            <PrimaryArea
                width={ primaryPaneWidth }
            >
                { props.primaryAreaChildren }
            </PrimaryArea>
            <SecondaryArea
                addresses={ props.addresses }
                accountColors={ props.colors.accounts }
                selectAddress={ props.selectAddress }
                colorThemeType={ props.colors.type }
                width={ 12 - SIDEBAR_WIDTH - primaryPaneWidth }
            >
                { props.secondaryAreaChildren }
            </SecondaryArea>
        </>
    );
}

export interface FullWidthPaneProps {
    addresses: Addresses,
    selectAddress: (userAddress: string) => void,
    children: Children,
}

export function FullWidthPane(props: FullWidthPaneProps) {

    return (
        <>
            <PrimaryArea
                width={ 12 - SIDEBAR_WIDTH }
            >
                { props.children }
            </PrimaryArea>
        </>
    );
}

export interface Props {
    children: Children,
    colors: ColorTheme,
    addresses: Addresses,
    selectAddress: (userAddress: string) => void,
    menuTop: MenuItemData[],
    menuBottom: MenuItemData[],
    shieldItem: MenuItemData,
}

export default function Dashboard(props: Props) {

    const inlineCss = `
    .Dashboard .PrimaryArea .table {
        color: ${props.colors.dashboard.foreground};
    }

    .Dashboard .SecondaryArea .table {
        color: ${props.colors.dashboard.foreground};
    }

    .modal-dialog {
        background-color: white;
    }

    .modal-content {
        color: ${props.colors.dashboard.foreground};
        background-color: ${props.colors.dashboard.background};
    }

    .form-control,
    .form-control[readonly] {
        background-color: ${props.colors.dashboard.background};
        color: ${props.colors.dashboard.foreground};
    }

    .Dashboard a {
        color: ${props.colors.dashboard.foreground};
    }

    .Dashboard .Sidebar .MenuItem.active {
        background-color: ${props.colors.sidebar.activeItemBackground};
    }
    `;

    return (
        <Container
            className="Dashboard"
            fluid
            style={{
                backgroundColor: props.colors.dashboard.background,
                color: props.colors.dashboard.foreground,
            }}
        >
            <style>
            { inlineCss }
            </style>
            <Row>
                <Col md={ SIDEBAR_WIDTH }>
                    <div className="Sidebar"
                        style={{
                            backgroundColor: props.colors.sidebar.background,
                            color: props.colors.sidebar.foreground,
                            boxShadow: `5px 0 25px ${props.colors.shadowColor}`,
                        }}
                    >
                        <Logo
                            shadowColor={ props.colors.shadowColor }
                            colorThemeType={ props.colors.type }
                        />
                        <div
                            className="MenuArea"
                        >
                            <Menu
                                items={ props.menuTop }
                                colorThemeType={ props.colors.type }
                            />
                            <Shield
                                item={ props.shieldItem }
                                colorThemeType={ props.colors.type }
                            />
                            <Menu
                                items={ props.menuBottom }
                                colorThemeType={ props.colors.type }
                            />
                        </div>
                    </div>
                </Col>
                { props.children }
                <div className="AddressSwitcherArea">
                    <AddressSwitcher
                        addresses={ props.addresses }
                        colors={ props.colors.accounts }
                        selectAddress={ props.selectAddress }
                        colorThemeType={ props.colors.type }
                    />
                </div>
            </Row>
        </Container>
    );
}
