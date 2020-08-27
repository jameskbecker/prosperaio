import React, { useState } from 'react';
import ReactDom from 'react-dom';
import Banner from '../../Components/global/Banner';
import ProfileTable from './HarvesterTable';
import Button from '../../Components/UserInput/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../Components/global';

export default () => {
    

    return (
        <>
        <Banner />
        <HeaderBar>
            <HeaderTitle>Harvesters</HeaderTitle>
            <HeaderOptions>
                <Button>New Harvester</Button>
            </HeaderOptions>
        </HeaderBar>
        <Content>

            <Panel>
                <ProfileTable />
            </Panel>
            <ControlPanel>
                {/* @ts-ignore */}
                <Button secondary>Delete All</Button>
            </ControlPanel>
        </Content>
        </>
    )
}