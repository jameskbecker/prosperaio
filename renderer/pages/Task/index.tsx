import React, { useState } from 'react';
import styled from 'styled-components';

import Banner from '../../components/Banner';
import Sidebar from '../../components/Sidebar';
import PageBody from '../../components/PageBody';
import TaskModal from './TaskModal';
import TaskTable from './TaskTable';
import { NewButton as Button } from '../../components/user-input/Button';
import { Dropdown } from '../../components/Input';
import _Select from 'react-select';
import theme from '../../components/global/theme';
import { Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions } from '../../components/global';
import { faPlayCircle, faStopCircle, faTrash, faPlusCircle, faFileImport, faFileExport } from '@fortawesome/free-solid-svg-icons';

//Put into global
const PageWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 24fr;
    grid-template-rows: 1fr;
    height: 100vh;
`;

const Select = styled(_Select)`
font-size: 12px;
        color: white;
        flex: 0 0 150px;

        padding: 1vh 0.5vw;
    & > div {
        margin: 2.5px 15px;
        
        border: 2px solid ${theme.secondaryColor};
        background-color: ${(props: any) => props.secondary ? theme.grey_4 : theme.grey_2};
        border-radius: 5px;
        
        -webkit-appearance: none;
    }
`;

const TaskPage = () => {
    const [taskTotal, setTaskTotal] = useState("0");
    const [toggleModal, setToggleModal] = useState(false);

    const ddata = [
        { value: "", label: "Default"}
    ];


    return (
        <>
            <PageWrapper>
                <Sidebar />
                <PageBody>
                    <Banner />
                    <HeaderBar>
                        <HeaderTitle>Tasks ({taskTotal})</HeaderTitle>
                        <HeaderOptions>
                            {/* <Select options={ddata}/> */}
                            <Button icon={faPlusCircle} text="New Task" onClick={ () => setToggleModal(true) } />
                            <Button icon={faFileImport} text="Import Tasks" onClick={() => { }} />
                            <Button icon={faFileExport} text="Export Tasks" onClick={() => { }} />
                        </HeaderOptions>
                    </HeaderBar>

                    <Content>
                        <TaskTable setTaskTotal={setTaskTotal} />
                        <ControlPanel>
                            <Button icon={faPlayCircle} text="Run All" />
                            <Button icon={faStopCircle} text="Stop All" />
                            <Button icon={faTrash} text="Delete All" />
                        </ControlPanel>
                    </Content>

                </PageBody>


                {toggleModal && (
                    <TaskModal setToggleModal={setToggleModal} />
                )}

            </PageWrapper>
        </>
    );
};

export default TaskPage;