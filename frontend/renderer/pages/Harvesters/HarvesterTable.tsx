import React from 'react';
import Table, { THead, TBody, THeadRow, THeadCell, TBodyRow, TBodyCell } from '../../components/global/table';

const TaskTable: React.FC<any> = (props: any) => {

    return (
        <Table>
            <THead>
                <THeadRow>
                    <THeadCell>Name</THeadCell>
                    <THeadCell>Site</THeadCell>
                    <THeadCell>Actions</THeadCell>
                </THeadRow>
            </THead>
            
            <TBody></TBody>
        </Table>
    )
}

export default TaskTable;