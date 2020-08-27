import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import Table, { THead, TBody, THeadRow, THeadCell, TBodyRow, TBodyCell } from '../../Components/global/table';
import mockTasks from './mock-tasks';
import mockProfiles from '../Profiles/mock-profiles';


interface MT {
    [key: string]: any;
}

interface statusProps {
    [key: string]: any
}

ipcRenderer.on('task.setStatus', (event: Electron.IpcRendererEvent, id: string, message: string, type: string = 'default') => {
    const setStatus = statusCollection[id][1];
    setStatus({message, type});
});


const productCollection: statusProps = {};
    const sizeCollection: statusProps = {};
    const statusCollection: statusProps = {};


const TaskTable: React.FC<any> = (props: any) => {
    const tasks: MT = mockTasks;
    const profiles: any = mockProfiles;
    useEffect(() => {
        props.setTaskTotal(Object.keys(tasks).length.toString());
    }, [tasks])

    
 
   


    return (
        <Table>
            <THead>
                <THeadRow>
                    <THeadCell>Store</THeadCell>
                    <THeadCell>Mode</THeadCell>
                    <THeadCell>Profile</THeadCell>
                    <THeadCell flex="2 2 0">Product</THeadCell>
                    <THeadCell>Size</THeadCell>
                    <THeadCell>Proxy</THeadCell>
                    <THeadCell flex="2 2 0">Status</THeadCell>
                    {/* <THeadCell>Actions</THeadCell> */}
                </THeadRow>

            </THead>
            <TBody>{

                Object.keys(tasks).map((id: string) => {
                    const [ product ] = productCollection[id] = useState(tasks[id].products[0].searchInput);
                    const [ size ] = sizeCollection[id] = useState(tasks[id].products[0].size);
                    const [ status ] = statusCollection[id] = useState({message: 'Idle', type: 'default'});
                    
                    
                    return (
                        <TBodyRow key={id} onClick={() => { }}>
                            <TBodyCell>{tasks[id].site}</TBodyCell>
                            <TBodyCell>{tasks[id].setup.mode}</TBodyCell>
                            <TBodyCell>{profiles[tasks[id].setup.profile].profileName}</TBodyCell>
                            <TBodyCell flex="2 2 0">{product}</TBodyCell>
                            <TBodyCell>{size}</TBodyCell>
                            <TBodyCell>{tasks[id].additional.proxyList}</TBodyCell>
                            <TBodyCell color={status.type} flex="2 2 0">{status.message}</TBodyCell>

                        </TBodyRow>
                    )
                })
            }</TBody>
        </Table>
    )
}

export default TaskTable;