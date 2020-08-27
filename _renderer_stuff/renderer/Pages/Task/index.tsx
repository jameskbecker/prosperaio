import React, { useState } from 'react';
import Banner from '../../Components/global/Banner';
import TaskModal from './TaskModal';
import TaskTable from './TaskTable';
import { Container, Content, ControlPanel, HeaderBar, HeaderTitle, HeaderOptions, Panel, InputHeader } from '../../Components/global';
import { faPlayCircle, faStopCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import Input from '../../Components/UserInput/Text';
import Button from '../../Components/UserInput/Button';

export default () => {
    const [taskTotal, setTaskTotal] = useState("0")
    const [toggleModal, setToggleModal] = useState(false);

    return (
        <>
            <Banner />
            <HeaderBar>
                <HeaderTitle>Tasks {taskTotal === '0' ? '' : '(' + taskTotal + ' Total)'}</HeaderTitle>
                <HeaderOptions>
                    <Button secondary onClick={() => { }} text="Import" />
                    <Button secondary onClick={() => { }} text="Export" />
                    <Button secondary onClick={() => { setToggleModal(true) }} text="New Task" />
                </HeaderOptions>
            </HeaderBar>


            <Content>

                <Panel>
                    <TaskTable setTaskTotal={setTaskTotal} />
                </Panel>
                <ControlPanel>
                    <Button icon={faPlayCircle} text="Run All" />
                    <Button icon={faStopCircle} text="Stop All" />
                    <Button icon={faTrash} text="Delete All" />
                </ControlPanel>
            </Content>

            {toggleModal && (
                <TaskModal setToggleModal={setToggleModal} />

            )}
        </>
    )
}