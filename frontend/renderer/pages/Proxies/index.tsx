import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Banner from '../../components/Banner';
import Sidebar from '../../components/Sidebar';
import PageBody from '../../components/PageBody';
import ProxyTable from './ProxyTable';
import { NewButton } from '../../components/user-input/Button';
import { faVial, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel } from '../../components/global';
import mt from './mock-proxies';

//Put into global
const PageWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 24fr;
    grid-template-rows: 1fr;
    height: 100vh;
`;

interface MT {
    [key: string]: any;
}

const mockProxies: MT = mt;
export default () => {
    const [selectedList, setSelectedList] = useState([]);
    useEffect(() => {
        setSelectedList(mockProxies[Object.keys(mockProxies)[0]]);
    }, [selectedList]);
    return (
        <>
            <PageWrapper>
                <Sidebar />
                <PageBody>
                    <Banner />
                    <HeaderBar>
                        <HeaderTitle>Proxies</HeaderTitle>
                        <HeaderOptions>
                            <NewButton icon={faPlus} text="New Proxy List" />
                        </HeaderOptions>
                    </HeaderBar>
                    <Content>
                        <Panel>
                            <ProxyTable selectedList={selectedList} />
                        </Panel>

                        <ControlPanel>
                            <NewButton icon={faVial} text="Test All" />
                            <NewButton icon={faTrash} text="Delete All" />
                        </ControlPanel>
                    </Content>
                </PageBody>
            </PageWrapper>
        </>
    );
};