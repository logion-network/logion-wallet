import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children } from './types/Helpers';
import Logo from './Logo';
import AddressSwitcher from './AddressSwitcher';
import { ColorTheme, MenuIcon as MenuIconType } from './ColorTheme';
import Menu from './Menu';
import { MenuItemData } from './MenuItem';
import MainMenu from './MainMenu';
import MenuIcon from './MenuIcon';
import Clickable from './Clickable';
import Icon from './Icon';
import { useRootContext } from '../RootContext';

import './Dashboard.css';

interface PrimaryAreaProps {
    children: Children,
    width: number,
}

function PrimaryArea(props: PrimaryAreaProps) {

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

interface SecondaryAreaProps {
    children?: Children,
    width: number,
}

function SecondaryArea(props: SecondaryAreaProps) {

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

export interface ContentPaneProps extends TitlesProps {
    primaryAreaChildren: Children,
    secondaryAreaChildren: Children,
    primaryPaneWidth?: number,
}

const FULL_WIDTH = 12;
const SIDEBAR_WIDTH = 2;

interface TitlesProps {
    mainTitle: string,
    subTitle?: string,
    titleIcon: MenuIconType,
    colors: ColorTheme,
    onBack?: () => void
}

function Titles(props: TitlesProps) {

    return (
        <div className="TitlesArea">
            <h1>
                <MenuIcon
                    { ...props.titleIcon }
                    colorThemeType={ props.colors.type }
                />
                { props.mainTitle }
            </h1>
            {
                props.subTitle !== undefined &&
                <h2>{ props.subTitle }</h2>
            }
            {
                props.onBack !== undefined &&
                <div className="back-button">
                    <Clickable onClick={ props.onBack }>
                        <Icon icon={{id:"back", hasVariants: true}} colorThemeType={ props.colors.type } /> Back
                    </Clickable>
                </div>
            }
        </div>
    );
}

export interface BasePaneProps extends TitlesProps {
    children: Children,
    className?: string,
    colors: ColorTheme,
}

function BasePane(props: BasePaneProps) {
    const { selectAddress, addresses } = useRootContext();

    let contentAreaClass = "ContentArea";
    if(props.className !== undefined) {
        contentAreaClass = contentAreaClass + " " + props.className;
    }

    return (
        <Col md={ FULL_WIDTH - SIDEBAR_WIDTH }>
            <Row noGutters>
                <Col md={ 8 }>
                    <Titles {...props} />
                </Col>
                <Col md={ 4 }>
                    <div className="AddressSwitcherArea">
                        <AddressSwitcher
                            addresses={ addresses }
                            colors={ props.colors.accounts }
                            selectAddress={ selectAddress }
                            colorThemeType={ props.colors.type }
                        />
                    </div>
                </Col>
            </Row>
            <Row noGutters className={ contentAreaClass }>
                { props.children }
            </Row>
        </Col>
    );
}

export function ContentPane(props: ContentPaneProps) {

    let primaryPaneWidth: number = 6;
    if(props.primaryPaneWidth !== undefined) {
        primaryPaneWidth = props.primaryPaneWidth;
    }

    return (
        <BasePane
            mainTitle={ props.mainTitle }
            subTitle={ props.subTitle }
            titleIcon={ props.titleIcon }
            colors={ props.colors }
            onBack={ props.onBack }
        >
                <PrimaryArea
                    width={ primaryPaneWidth }
                >
                    { props.primaryAreaChildren }
                </PrimaryArea>
                <SecondaryArea
                    width={ FULL_WIDTH - primaryPaneWidth }
                >
                    { props.secondaryAreaChildren }
                </SecondaryArea>
        </BasePane>
    );
}

export interface FullWidthPaneProps extends BasePaneProps {
    children: Children,
    className?: string,
}

export function FullWidthPane(props: FullWidthPaneProps) {

    return (
        <BasePane
            className={ props.className }
            mainTitle={ props.mainTitle }
            subTitle={ props.subTitle }
            titleIcon={ props.titleIcon }
            colors={ props.colors }
            onBack={ props.onBack }
        >
            <PrimaryArea width={ FULL_WIDTH }>
                { props.children }
            </PrimaryArea>
        </BasePane>
    );
}

export interface Props {
    children: Children,
    menuTop: MenuItemData[],
    menuMiddle: MenuItemData[],
    menuBottom: MenuItemData[],
    colors: ColorTheme,
}

export default function Dashboard(props: Props) {

    const inlineCss = `
    .Dashboard .PrimaryArea .table {
        color: ${props.colors.dashboard.foreground};
    }

    .Dashboard .SecondaryArea .table {
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
            <Row noGutters>
                <Col md={ SIDEBAR_WIDTH }>
                    <div className="Sidebar"
                        style={{
                            backgroundColor: props.colors.sidebar.background,
                            color: props.colors.sidebar.foreground,
                            boxShadow: `0 0 25px ${props.colors.shadowColor}`,
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
                            <MainMenu
                                items={ props.menuMiddle }
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
            </Row>
        </Container>
    );
}
