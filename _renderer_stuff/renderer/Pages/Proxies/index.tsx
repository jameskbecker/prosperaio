import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import Banner from '../../Components/global/Banner';
import ProxyTable from './ProxyTable';
import Button from '../../Components/UserInput/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../Components/global';
import mt from './mock-proxies';

interface MT {
    [key: string]: any;
}

const mockProxies: MT = mt;
export default () => {
    const [ selectedList, setSelectedList ] = useState([]);
    useEffect(() => {
        setSelectedList(mockProxies[Object.keys(mockProxies)[0]]);
    }, [selectedList] )
    return (
        <>
            <Banner />
            <HeaderBar>
                <HeaderTitle>Proxies</HeaderTitle>
                <HeaderOptions>
                    <Button>New Proxy List</Button>
                </HeaderOptions>
            </HeaderBar>
            <Content>

                <Panel>
                    <ProxyTable selectedList={selectedList}/>
                </Panel>
                <ControlPanel>
                    {/* @ts-ignore */}
                    <Button secondary>Test All</Button>
                    {/* @ts-ignore */}
                    <Button secondary>Delete All</Button>
                </ControlPanel>
            </Content>
        </>
    )
}