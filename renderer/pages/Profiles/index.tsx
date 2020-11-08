import React, { useState } from 'react';
import styled from 'styled-components';
import ReactDom from 'react-dom';
import Sidebar from '../../components/Sidebar';
import Banner from '../../components/Banner';
import PageBody from '../../components/PageBody';
import ProfileModal from './ProfileModal';
import ProfileTable from './ProfileTable';
import { NewButton as Button } from '../../components/user-input/Button';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, TextInput, Wrapper } from '../../components/global';
import { faTrash, faPlus, faFileImport, faFileExport } from '@fortawesome/free-solid-svg-icons';
//Put into global
const PageWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 24fr;
    grid-template-rows: 1fr;
    height: 100vh;
`;

export default () => {
    const [profileTotal, setProfileTotal] = useState("0");
    const [toggleModal, setToggleModal] = useState(false);

    return (
        <>
            <PageWrapper>
                <Sidebar />
                <PageBody>
                <Banner />
                <HeaderBar>
                    <HeaderTitle>Profiles {profileTotal === '0' ? '' : '(' + profileTotal + ')'}</HeaderTitle>
                    <HeaderOptions>
                        <Button icon={faPlus} secondary onClick={() => { setToggleModal(true); }} text="New Profile"/>
                        <Button icon={faFileImport} secondary onClick={() => { }} text="Import" />
                        <Button icon={faFileExport} secondary onClick={() => { }} text="Export" />
                    </HeaderOptions>
                </HeaderBar>
                <Content>

                    
                        <ProfileTable setTaskTotal={setProfileTotal} />

                    <ControlPanel>
                        <Button icon={faTrash} text="Delete All"/>
                    </ControlPanel>
                </Content>

                </PageBody>
                
                {toggleModal && <ProfileModal setToggleModal={setToggleModal} />}
            </PageWrapper>

        </>
    );
};