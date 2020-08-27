import React, { useState } from 'react';
import ReactDom from 'react-dom';
import Banner from '../../Components/global/Banner';
import ProfileModal from './ProfileModal';
import ProfileTable from './ProfileTable';
import Button from '../../Components/UserInput/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../Components/global';

export default () => {
    const [taskTotal, setTaskTotal] = useState("0")
    const [toggleModal, setToggleModal] = useState(false);
    
    return (


        <>
        <Banner />
        <HeaderBar>
            <HeaderTitle>Profiles {taskTotal === '0' ? '' : '(' + taskTotal + ' Total)'}</HeaderTitle>
            <HeaderOptions>
                    <Button secondary onClick={() => { }} text="Import" />
                    <Button secondary onClick={() => { }} text="Export" />
                <Button secondary onClick={() => { setToggleModal(true)}} text="New Profile"></Button>
            </HeaderOptions>
        </HeaderBar>
        <Content>

            <Panel>
                <ProfileTable setTaskTotal={setTaskTotal} />
            </Panel>
            <ControlPanel>
                {/* @ts-ignore */}
                <Button secondary>Delete All</Button>
            </ControlPanel>
        </Content>

        {toggleModal && (
                <ProfileModal setToggleModal={setToggleModal}/>

            )}
        </>
    )
}