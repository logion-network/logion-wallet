import { detect } from 'detect-browser';

type Browser = 'chrome' | 'firefox';

const availableExtensions: Record<Browser, string> = {
  chrome: 'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/'
};

export interface Extension {
    browser: Browser,
    url: string
}

export function recommendedExtension(): Extension | null {
    const browserInfo = detect();
    const browserName: Browser | null = (browserInfo && (browserInfo.name as Browser)) || null;
    if(browserName === null) {
        return null;
    } else {
        return {
            browser: browserName,
            url: availableExtensions[browserName],
        };
    }
}
