import React, { useState } from 'react';
import Banner from '../../components/Banner';
import Sidebar from '../../components/Sidebar';
import PageWrapper from '../../components/PageWrapper';
import PageBody from '../../components/PageBody';
import AnalyticsTable from './AnalyticsTable';
import { NewButton } from '../../components/user-input/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle } from '../../components/global';

export default () => {


    return (
        <>
            <PageWrapper>
                <Sidebar />
                <PageBody>
                    <Banner />
                    <HeaderBar>
                        <HeaderTitle>Analytics</HeaderTitle>
                    </HeaderBar>

                    <Content>
                        <AnalyticsTable />
                        <ControlPanel>
                            <NewButton text="Delete All" />
                        </ControlPanel>
                    </Content>        
                </PageBody>
            </PageWrapper>
        </>
    );
};