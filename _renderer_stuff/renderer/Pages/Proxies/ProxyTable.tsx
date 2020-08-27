import React from 'react';
import Table, { THead, TBody, THeadRow, THeadCell, TBodyRow, TBodyCell } from '../../Components/global/table';
import mt from './mock-proxies';

interface MT {
    [key: string]: any;
}

const mockProxies: MT = mt;
const ProxyTable: React.FC<any> = (props: any) => {

    return (
        <Table>
            <THead>
                <THeadRow>
                    <THeadCell>IP Address</THeadCell>
                    <THeadCell>Port</THeadCell>
                    <THeadCell flex="2 2 0">Username</THeadCell>
                    <THeadCell flex="2 2 0">Password</THeadCell>
                    <THeadCell>Status</THeadCell>
         
                </THeadRow>

            </THead>
            <TBody>{

                Object.keys(props.selectedList).map((id: string) => {
                    const splitString = props.selectedList[id].split(':');
                    let user = '';
                    let pass = '';
                    let ip = '';
                    let port = '';

                    if (splitString.length > 1) {
                        ip = splitString[0];
                        port = splitString[1];
                    }
                    if (splitString.length > 3) {
                        user = splitString[2];
                        pass = splitString[3];
                    }
                
                    return (
                        <TBodyRow key={id}>
                            <TBodyCell>{ip}</TBodyCell>
                            <TBodyCell>{port}</TBodyCell>
                            <TBodyCell flex="2 2 0">{user}</TBodyCell>
                            <TBodyCell flex="2 2 0">{pass}</TBodyCell>
                            <TBodyCell>Idle</TBodyCell>
                  
                        </TBodyRow>
                    )
                })
            }</TBody>
        </Table>
    )
}

export default ProxyTable;