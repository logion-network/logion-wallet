import React from 'react';

import CommonSettings from '../Settings';

import { useUserContext } from './UserContext';

export default function Settings() {
    const { colorTheme } = useUserContext();

    return (
        <CommonSettings colors={ colorTheme }/>
    );
}