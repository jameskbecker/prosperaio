import React, { useState } from 'react';
import Banner from '../../Components/global/Banner';
import Button from '../../Components/UserInput/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../Components/global';

export default () => {
    

    return (
        <>
        <Banner />
        <HeaderBar>
            <HeaderTitle>Settings</HeaderTitle>
        </HeaderBar>
        <Content>

            <Panel/>
        </Content>
        </>
    )
}