import React, { useState } from 'react';
import Banner from '../../components/Banner';
import Sidebar from '../../components/Sidebar';
import PageWrapper from '../../components/PageWrapper';
import PageBody from '../../components/PageBody';
import Button from '../../components/user-input/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../components/global';

export default () => {


    return (
        <>
            <PageWrapper>
                <Sidebar />
                <PageBody>
                    <Banner />
                    <HeaderBar>
                        <HeaderTitle>Settings</HeaderTitle>
                    </HeaderBar>
                    <Content>

                        <Panel />
                    </Content>
                </PageBody>
            </PageWrapper>
        </>
    );
};