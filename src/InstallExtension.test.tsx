jest.mock('./logion-chain');

import React from 'react';
import InstallExtension from './InstallExtension';
import { shallowRender } from './tests';
import { setRecommendedExtension } from './logion-chain';

test('Given unsupported browser, when rendering, then show message', () => {
    setRecommendedExtension(null);
    const tree = shallowRender(<InstallExtension />);
    expect(tree).toMatchSnapshot();
});

test('Given Firefox, when rendering, then show link', () => {
    setRecommendedExtension({
        browser: "firefox",
        url: "firefox url"
    });
    const tree = shallowRender(<InstallExtension />);
    expect(tree).toMatchSnapshot();
});

test('Given Chrome, when rendering, then show link', () => {
    setRecommendedExtension({
        browser: "chrome",
        url: "chrome url"
    });
    const tree = shallowRender(<InstallExtension />);
    expect(tree).toMatchSnapshot();
});
