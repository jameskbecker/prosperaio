import React, { useEffect, useState } from 'react';
import { ipcRenderer } from '../../../../backend/main/node_modules/electron';
import Table, {
    THead,
    TBody,
    THeadRow,
    THeadCell,
    TBodyRow,
    TBodyCell,
} from '../../components/global/table';
import { Panel } from '../../components/global'
import { Icon } from '../../components/global/index';
import { faPlay, faStop, faTrash, faEdit, faClone, faSquare } from '@fortawesome/free-solid-svg-icons';
import theme from '../../Components/global/theme';

import mockTasks from './mock-tasks';
import mockProfiles from '../Profiles/mock-profiles';

interface MT {
    [key: string]: any;
}

interface statusProps {
    [key: string]: any;
}

ipcRenderer.on('task.setStatus', ( e: Electron.IpcRendererEvent, id: string, message: string, type: string = 'default' ) => {
    const setStatus = statusCollection[id][1];
    setStatus({ message, type });
});

const productCollection: statusProps = {};
const sizeCollection: statusProps = {};
const statusCollection: statusProps = {};

const TaskTable: React.FC<any> = (props: any) => {
    const tasks: MT = mockTasks;
    const profiles: any = mockProfiles;
    useEffect(() => {
        props.setTaskTotal(Object.keys(tasks).length.toString());
    }, [tasks]);

    return (
        <Panel>
        <Table>
            <THead>
                <THeadRow>
                    {/* <THeadCell flex="0 0 4%">
                        <Icon icon={faSquare}/>
                    </THeadCell> */}
                    <THeadCell>Store</THeadCell>
                    <THeadCell>Profile</THeadCell>
                    <THeadCell flex="2 2 0">Product</THeadCell>
                    <THeadCell flex="0.75 0.75 0">Size</THeadCell>
                    <THeadCell>Proxy</THeadCell>
                    <THeadCell flex="2 2 0">Status</THeadCell>
                    <THeadCell>Actions</THeadCell>
                </THeadRow>
            </THead>
            <TBody>
                {Object.keys(tasks).map((id: string) => {
                    const [product] = (productCollection[id] = useState(
                        tasks[id].products[0].searchInput
                    ));
                    const [size] = (sizeCollection[id] = useState(
                        tasks[id].products[0].size
                    ));
                    const [status] = (statusCollection[id] = useState({
                        message: 'Successfully Checked Out.',
                        type: 'SUCCESS',
                    }));

                    return (
                        <TBodyRow key={id}>
                            {/* <TBodyCell flex="0 0 4%">
                                <Icon icon={faSquare}/>
                            </TBodyCell> */}
                            <TBodyCell>{tasks[id].site}</TBodyCell>
                            <TBodyCell>{profiles[tasks[id].setup.profile].profileName}</TBodyCell>
                            <TBodyCell flex="2 2 0">{product}</TBodyCell>
                            <TBodyCell flex="0.75 0.75 0">{size}</TBodyCell>
                            <TBodyCell>{tasks[id].additional.proxyList}</TBodyCell>
                            <TBodyCell flex="2 2 0" color={status.type}>{status.message}</TBodyCell>
                            <TBodyCell>
                                <Icon icon={faPlay} color={theme.primaryColor} />
                                <Icon icon={faStop} color={theme.primaryColor} />
                                <Icon icon={faEdit} color={theme.primaryColor} />
                                <Icon icon={faClone} color={theme.primaryColor} />
                                <Icon icon={faTrash} color={theme.primaryColor} />
                            </TBodyCell>
                        </TBodyRow>
                    );
                })}
            </TBody>
        </Table>
        </Panel>
    );
};

export default TaskTable;
