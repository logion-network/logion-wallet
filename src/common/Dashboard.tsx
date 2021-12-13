import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children } from './types/Helpers';
import Logo from './Logo';
import AddressSwitcher from './AddressSwitcher';
import { MenuIcon as MenuIconType } from './ColorTheme';
import Menu from './Menu';
import { MenuItemData } from './MenuItem';
import MainMenu from './MainMenu';
import MenuIcon from './MenuIcon';
import Clickable from './Clickable';
import Icon from './Icon';
import { useCommonContext } from './CommonContext';

import './Dashboard.css';

interface TopAreaProps {
    children: Children,
}

function TopArea(props: TopAreaProps) {

    return (
        <Row>
            <Col
                key="top-area"
                className="top-area-col"
            >
                <div className="TopArea">
                    { props.children }
                </div>
            </Col>
        </Row>
    );
}

interface PrimaryAreaProps {
    children: Children,
    width: number,
}

function PrimaryArea(props: PrimaryAreaProps) {

    return (
        <Col
            key="primary-area"
            md={ props.width }
            className="primary-area-col"
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
    topAreaChildren?: Children,
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
    onBack?: () => void
}

function Titles(props: TitlesProps) {

    return (
        <div className="TitlesArea">
            <h1>
                <MenuIcon
                    { ...props.titleIcon }
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
                        <Icon icon={{id:"back", hasVariants: true}} /> Back
                    </Clickable>
                </div>
            }
        </div>
    );
}

export interface BasePaneProps extends TitlesProps {
    children: Children,
    className?: string,
    topAreaChildren?: Children,
}

function BasePane(props: BasePaneProps) {
    const { selectAddress } = useCommonContext();

    let contentAreaClass = "ContentArea";
    if(props.className !== undefined) {
        contentAreaClass = contentAreaClass + " " + props.className;
    }

    return (
        <Col md={ FULL_WIDTH - SIDEBAR_WIDTH } className="BasePane">
            <Row>
                <Col md={ 8 }>
                    <Titles {...props} />
                </Col>
                <Col md={ 4 }>
                    <div className="AddressSwitcherArea">
                        <AddressSwitcher
                            selectAddress={ selectAddress }
                        />
                    </div>
                </Col>
            </Row>
            {
                props.topAreaChildren &&
                <TopArea>
                    { props.topAreaChildren }
                </TopArea>
            }
            <Row className={ contentAreaClass }>
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
            onBack={ props.onBack }
            topAreaChildren={ props.topAreaChildren }
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
            onBack={ props.onBack }
            topAreaChildren={ props.topAreaChildren }
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
}

export default function Dashboard(props: Props) {
    const { colorTheme } = useCommonContext();

    const inlineCss = `
    .Dashboard .PrimaryArea .table {
        color: ${colorTheme.dashboard.foreground};
    }

    .Dashboard .SecondaryArea .table {
        color: ${colorTheme.dashboard.foreground};
    }

    .Dashboard a {
        color: ${colorTheme.dashboard.foreground};
    }

    .Dashboard .Sidebar .MenuItem.active {
        background-color: ${colorTheme.sidebar.activeItemBackground};
    }
    `;

    return (
        <Container
            className="Dashboard"
            fluid
            style={{
                backgroundColor: colorTheme.dashboard.background,
                color: colorTheme.dashboard.foreground,
            }}
        >
            <style>
            { inlineCss }
            </style>
            <Row>
                <Col md={ SIDEBAR_WIDTH }>
                    <div className="Sidebar"
                        style={{
                            backgroundColor: colorTheme.sidebar.background,
                            color: colorTheme.sidebar.foreground,
                            boxShadow: `0 0 25px ${colorTheme.shadowColor}`,
                        }}
                    >
                        <Logo
                            shadowColor={ colorTheme.shadowColor }
                        />
                        <div
                            className="MenuArea"
                        >
                            <Menu
                                items={ props.menuTop }
                            />
                            <MainMenu
                                items={ props.menuMiddle }
                            />
                            <Menu
                                items={ props.menuBottom }
                            />
                        </div>
                    </div>
                </Col>
                { props.children }
            </Row>
        </Container>
    );
}
