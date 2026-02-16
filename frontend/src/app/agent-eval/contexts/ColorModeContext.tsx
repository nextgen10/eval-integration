'use client';
import React from 'react';

export const ColorModeContext = React.createContext({
    toggleColorMode: () => { },
    mode: 'light' as 'light' | 'dark',
});

export const useColorMode = () => React.useContext(ColorModeContext);
