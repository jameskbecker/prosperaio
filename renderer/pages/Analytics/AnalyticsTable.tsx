import React from 'react';
import Table, { THead, TBody, THeadRow, THeadCell, TBodyRow, TBodyCell } from '../../components/global/table';
import {  Panel } from '../../components/global';
const TaskTable: React.FC<any> = (props: any) => {

    return (
        <Panel>
            <Table>
            <THead>
                <THeadRow>
                    <THeadCell>Date</THeadCell>
                    <THeadCell>Store</THeadCell>
                    <THeadCell>Product</THeadCell>
                    <THeadCell>Price</THeadCell>
                    <THeadCell>Order Number</THeadCell>
                    <THeadCell>Actions</THeadCell>
                </THeadRow>
            </THead>
            
            <TBody>
                
            </TBody>
        </Table>
        </Panel>
        
    )
}

export default TaskTable;