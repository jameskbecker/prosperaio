import React from 'react';
import Table, { THead, TBody, THeadRow, THeadCell, TBodyRow, TBodyCell } from '../../Components/global/table';

const TaskTable: React.FC<any> = (props: any) => {

    return (
        <Table>
            <THead>
                <THeadRow>
                    <THeadCell>Date</THeadCell>
                    <THeadCell>Store</THeadCell>
                    <THeadCell>Product</THeadCell>
                    <THeadCell>Order Number</THeadCell>
                    <THeadCell>Actions</THeadCell>
                </THeadRow>
            </THead>
            
            <TBody></TBody>
        </Table>
    )
}

export default TaskTable;