export function CreateWallet() {
    return (
        <>
            <h1>logion authentification system installation tutorial</h1>

            <p>To access logion legal protection services, you just have to create a Polkadot account.</p>

            <p>To do so, you need to install the Polkadot.js extension to your current browser (Firefox or Chrome are supported).</p>

            <p>This tutorial will help you to execute the installation of the authentification system used by logion.</p>

            <h2>Polkadot account creation</h2>

            <p>To create a Polkadot account, please :</p>

            <ul>
                <li>Click on the “Polkadot.js extension” orange logo</li>
                <li>Select “Pop up” in the “Notification" dropdown menu</li>
                <li>Select “open extension in new window” at the bottom of the extension: the extension will open itself in a new tab</li>
                <li>Click anywhere in the underlying tab, outside of the Polkadot extension popup to make it disappeared</li>
            </ul>

            <img src={`${process.env.PUBLIC_URL}/assets/landing/logion-step1.gif`} style={{maxWidth: "100%"}} alt="step 1 animation"/>

            <ul>
                <li>Click on the “+” button and then on “Create a new account”</li>
                <li>Copy the 12 words seed phrase in a secure way (we strongly advise using a password manager such as <a href="https://keepassxc.org/" target="_blank" rel="noreferrer">KeePassXC</a> by clicking on “Copy to clipboard</li>
                <li>Check the “I have saved my mnemonic seed safely” box</li>
                <li>Click on the “Next Step” orange button</li>
            </ul>

            <img src={`${process.env.PUBLIC_URL}/assets/landing/logion-step1-5.gif`} style={{maxWidth: "100%"}} alt="step 1.5 animation"/>

            <p>You are now ready to finalize the creation of your account by:</p>

            <ul>
                <li>Naming your account</li>
                <li>Set a password, you will use to sign all required actions with the logion application when required. We strongly recommend you save your password with a password manager such as <a href="https://keepassxc.org/" target="_blank" rel="noreferrer">KeePassXC</a></li>
                <li>Once done, click on the “Add the account with the generated seed “ orange button</li>
            </ul>

            <img src={`${process.env.PUBLIC_URL}/assets/landing/logion-step2.gif`} style={{maxWidth: "100%"}} alt="step 2 animation"/>

            <h2>D - logion application first access</h2>

            <p>Your account is now created, you are ready to use logion:</p>

            <ul>
                <li>Close the Polkadot extension tab</li>
                <li>Close the Firefox/Chrome extension store tab</li>
                <li>On the logion tab, you should now see the authentification screen (if not, just reload the page)</li>
                <li>Select the account you just created, click on “log in” blue button: the polkadot extension popup should appear</li>
                <li>Type your password, select the “Remember my password for the next 15 minutes” option and click on the “Sign the message” orange button</li>
            </ul>

            <p>You are ready to use the logion wallet and Decentralized Application (Dapp) !</p>

            <p>We strongly recommend setting your legal protection as advised by the related message.</p>

            <img src={`${process.env.PUBLIC_URL}/assets/landing/logion-step3.gif`} style={{maxWidth: "100%"}} alt="step 3 animation"/>
        </>
    );
}
