import React from 'react';
import CreateTokenizationRequest from "./CreateTokenizationRequest";
import {shallowRender} from "../tests";
import {act, fireEvent, render} from '@testing-library/react';

test("renders", () => {
    const tree = shallowRender(<CreateTokenizationRequest onCancel={() => null} onSubmit={() => null}/>)
    expect(tree).toMatchSnapshot();
});

test("submit an empty form", () => {
    const cancelCallback = jest.fn();
    const submitCallback = jest.fn();
    const tree = render(<CreateTokenizationRequest onCancel={cancelCallback} onSubmit={submitCallback}/>)
    const button = tree.getByTestId("btnSubmit");
    act(() => { fireEvent.click(button) });
    expect(cancelCallback).not.toBeCalled();
    expect(submitCallback).not.toBeCalled();
});

/*
test("submit a valid form", () => {
    const cancelCallback = jest.fn();
    const submitCallback = jest.fn();
    const tree = render(<CreateTokenizationRequest onCancel={cancelCallback} onSubmit={submitCallback}/>)

    const tokeName = tree.getByTestId("tokenName");
    const bars = tree.getByTestId("bars");
    const button = tree.getByTestId("btnSubmit");
    act(() => {
        fireEvent.input(tokeName, {target: {
            value: 'DOT7'
            }})
        fireEvent.input(bars, {target: {
            value: '7'
            }})
        fireEvent.click(button);
    });
    expect(cancelCallback).not.toBeCalled();
    expect(submitCallback).toBeCalled();
    // TODO Fix this test - see https://www.react-hook-form.com/advanced-usage#TestingForm
});

 */

test("cancel", () => {
    const cancelCallback = jest.fn();
    const submitCallback = jest.fn();
    const tree = render(<CreateTokenizationRequest onCancel={cancelCallback} onSubmit={submitCallback}/>)
    const button = tree.getByTestId("btnCancel");
    act(() => { fireEvent.click(button) });
    expect(cancelCallback).toBeCalled();
    expect(submitCallback).not.toBeCalled();
});

