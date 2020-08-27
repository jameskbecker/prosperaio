import React, { useState } from 'react';
import Banner from '../../Components/global/Banner';
import AnalyticsTable from './AnalyticsTable';
import Button from '../../Components/UserInput/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../Components/global';

export default () => {
    

    return (
        <>
        <Banner />
        <HeaderBar>
            <HeaderTitle>Analytics</HeaderTitle>
        </HeaderBar>
        <Content>

            <Panel>
                <AnalyticsTable />
            </Panel>
            <ControlPanel>
                {/* @ts-ignore */}
                <Button secondary>Delete All</Button>
            </ControlPanel>
        </Content>
        </>
    )
}