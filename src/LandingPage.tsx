import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { recommendedExtension } from './logion-chain/Keys';

import Button from './common/Button';
import Dialog from './common/Dialog';

import './LandingPage.css';

export interface Props {
    activeStep: Step,
}

export type Step = 'install' | 'create';

type DialogType = 'install' | 'create' | 'recover' | null;

export default function LandingPage(props: Props) {
    const [ showDialog, setShowDialog ] = useState<DialogType>(null);

    let stepsLeft;
    if(props.activeStep === 'install') {
        stepsLeft = 3;
    } else if(props.activeStep === 'create') {
        stepsLeft = 2;
    } else {
        stepsLeft = 1;
    }

    return (
        <div className="LandingPage">
            <Container fluid className="header-container">
                <Logo />
                <Container>
                    <header>
                        <div className="call">
                            <span className="first">You are only { stepsLeft } (simple) steps away</span>
                            <span className="second">from your logion legal protection</span>
                        </div>
                    </header>
                </Container>
            </Container>
            <Container>
                <Row noGutters>
                    <Col className={ "step one" + (props.activeStep === 'install' ? " active" : "") }>
                        <div className="step-container">
                            <div className="step-header">
                                <div className="number">01.</div>
                                <div className="description"><span className="action">Download</span> <span>the plugin</span></div>
                            </div>
                            <div className="step-content">
                                <img src={process.env.PUBLIC_URL + "/assets/landing/step1.svg"} alt="people carrying extension" />
                                {
                                    props.activeStep === 'install' &&
                                    <div className="button-container">
                                        <Button onClick={() => setShowDialog('install')}><span>Start &gt;</span></Button>
                                    </div>
                                }
                            </div>
                            <Dialog
                                actions={[
                                    {
                                        id: "close",
                                        buttonText: "Close",
                                        buttonVariant: "primary",
                                        callback: () => setShowDialog(null)
                                    }
                                ]}
                                show={ showDialog === 'install' }
                                size="lg"
                            >
                                <InstallExtension/>
                            </Dialog>
                        </div>
                    </Col>
                    <Col className={ "step two" + (props.activeStep === 'create' ? " active" : "") }>
                        <div className="step-container">
                            <div className="step-header">
                                <div className="number">02.</div>
                                <div className="description"><span className="action">Create</span> <span>your wallet</span></div>
                            </div>
                            <div className="step-content">
                                <img src={process.env.PUBLIC_URL + "/assets/landing/step2.svg"} alt="people carrying extension" />
                                {
                                    props.activeStep === 'create' &&
                                    <div className="button-container">
                                        <Button onClick={() => setShowDialog('create')}><span>Start &gt;</span></Button>
                                    </div>
                                }
                            </div>
                            <Dialog
                                actions={[
                                    {
                                        id: "close",
                                        buttonText: "Close",
                                        buttonVariant: "primary",
                                        callback: () => setShowDialog(null)
                                    }
                                ]}
                                show={ showDialog === 'create' }
                                size="lg"
                            >
                                <CreateWallet/>
                            </Dialog>
                        </div>
                    </Col>
                    <Col className="step three">
                        <div className="step-container">
                            <div className="step-header">
                                <div className="number">03.</div>
                                <div className="description"><span className="action">Access</span> <span>your dashboard</span></div>
                            </div>
                            <div className="step-content">
                                <img src={process.env.PUBLIC_URL + "/assets/landing/step3.svg"} alt="people carrying extension" />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row>
                    <Col className="what-section">
                        <h1>Logion offers</h1>
                        <p>
                            <strong>a blockchain network managed by legal officers</strong><br/>
                            that provides a decentralized and legal guarantee for all your digital assets and transactions
                        </p>
                    </Col>
                </Row>
            </Container>
            <div className="recovery-container">
                <Container>
                    <Row noGutters>
                        <Col md={3} className="lost-password-container">
                            <img className="lost-password" src={process.env.PUBLIC_URL + "/assets/landing/recovery1.svg"} alt="women lost password" />
                        </Col>
                        <Col md={6}>
                            <div className="recovery-process">
                                <p>
                                    Inaccessible wallet?&nbsp;
                                    <strong>recovery process</strong>
                                </p>
                                <Button onClick={ () => setShowDialog("recover") }>Start my recovery process</Button>
                                <Dialog
                                    actions={[
                                        {
                                            id: "close",
                                            buttonText: "Close",
                                            buttonVariant: "primary",
                                            callback: () => setShowDialog(null)
                                        }
                                    ]}
                                    show={ showDialog === 'recover' }
                                    size="lg"
                                >
                                    <ol>
                                        <li>Follow the steps at the top
                                        of the page (install the extension, then create a new account)</li>
                                        <li>Once you access your dashboard, start a recovery with your new account</li>
                                    </ol>
                                </Dialog>
                            </div>
                        </Col>
                        <Col md={3} className="recovered-password-container">
                            <img className="recovered-password" src={process.env.PUBLIC_URL + "/assets/landing/recovery2.svg"} alt="legal officer giving key" />
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="protection-container">
                <p className="foundation"><strong>The foundation of</strong> your protection</p>
                <div className="legal-officers">
                    <img className="protection-male" alt="male legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_male.svg"}/>
                    <img className="protection-female" alt="female legal officer" src={process.env.PUBLIC_URL + "/assets/landing/protection_female.svg"}/>
                </div>
                <div className="explanation">
                    <h1>Logion Legal Officers</h1>
                    <p>
                        In charge of a <strong>public office</strong>, Logion Legal Officers are <strong>identified</strong><br/>
                        legal experts such as Judicial Officers and Lawyers, who apply a<br/>
                        strict code of ethics and are <strong>legaly responsible</strong> for their actions<br/>
                        while securing your transactions and related contracts.
                    </p>
                </div>
            </div>
            <footer>
                <Container fluid>
                    <Container>
                        <Row>
                            <Col>
                                <Logo />
                            </Col>
                            <Col>
                                <div className="contact">
                                    <div className="social">
                                        <a href="https://twitter.com/logion_network" target="_blank" rel="noreferrer"><img alt="twitter icon" src={process.env.PUBLIC_URL + "/assets/landing/twitter.png"}/></a>
                                        <a href="https://www.linkedin.com/company/logion-network/" target="_blank" rel="noreferrer"><img alt="linkedin icon" src={process.env.PUBLIC_URL + "/assets/landing/linkedin.png"}/></a>
                                        <a href="https://discord.gg/FvnxrtCYr6" target="_blank" rel="noreferrer"><img alt="discord icon" src={process.env.PUBLIC_URL + "/assets/landing/discord.png"}/></a>
                                    </div>
                                    <a className="mail" href="mailto:info@logion.network">info@logion.network</a>
                                </div>
                            </Col>
                            <Col>
                                <div className="legal">
                                    <a href="https://logion.network/" target="_blank" rel="noreferrer">Privay policy</a>
                                    <a href="https://logion.network/" target="_blank" rel="noreferrer">Terms and conditions</a>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Container>
            </footer>
        </div>
    );
}

function Logo() {
    return (
        <div className="logo">
            <img src={process.env.PUBLIC_URL + "/logo.png"} alt="logo" height="70" />
            <p>One blockchain <br/>to trust them all</p>
        </div>
    );
}

function InstallExtension() {
    const extension = recommendedExtension();
    if(extension !== null) {
        return (
            <>
                <p>Please install <a href={extension.url}>this browser extension</a> in order to store
                your accounts in a secure way. Once done, authorize the Logion wallet to access it
                and create or import an account.</p>
            </>
        );
    } else {
        return (
            <>
                <p>Your browser is currently not supported, please try with
                <a href="https://www.google.com/chrome/">Chrome</a> or
                <a href="https://www.mozilla.org/firefox/">Firefox</a></p>
            </>
        );
    }
}

function CreateWallet() {
    return (
        <>
            <p>Add an account using the browser extension in order to access your dashboard.</p>
        </>
    );
}
