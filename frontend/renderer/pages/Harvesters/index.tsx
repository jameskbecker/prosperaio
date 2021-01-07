import React, { useState } from 'react';
import Banner from '../../components/Banner';
import Sidebar from '../../components/Sidebar';
import PageWrapper from '../../components/PageWrapper';
import PageBody from '../../components/PageBody';
import HarvesterTable from './HarvesterTable';
import { NewButton as Button } from '../../components/user-input/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../components/global';

export default () => {


    return (
        <>
            <PageWrapper>
                <Sidebar />
                <PageBody>
                    <Banner />
                    <HeaderBar>
                        <HeaderTitle>Captcha Harvesters</HeaderTitle>
                        <HeaderOptions>
                            <Button text="New Harvester"/>
                        </HeaderOptions>
                    </HeaderBar>
                    <Content>

                        <Panel>
                            <HarvesterTable />
                        </Panel>
                        <ControlPanel>
                        <Button text="Delete All"/>
                        </ControlPanel>
                    </Content>
                </PageBody>
            </PageWrapper>
        </>
    );
};