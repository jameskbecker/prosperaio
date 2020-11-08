import React from 'react';
import Table, { THead, TBody, THeadRow, THeadCell, TBodyRow, TBodyCell } from '../../components/global/table';
import mt from './mock-proxies';
import theme from '../../Components/global/theme';
import { Icon } from '../../components/global/index';
import { faVial, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
interface MT {
    [key: string]: any;
}

const mockProxies: MT = mt;
const ProxyTable: React.FC<any> = (props: any) => {

    return (
        <Table>
            <THead>
                <THeadRow>
                    <THeadCell flex="2 2 0">IP Address</THeadCell>
                    <THeadCell flex="0.5 0.5 0">Port</THeadCell>
                    <THeadCell flex="3 3 0">Username</THeadCell>
                    <THeadCell flex="2.5 2.5 0">Password</THeadCell>
                    <THeadCell flex="1.5 1.5 0">Status</THeadCell>
                    <THeadCell>Actions</THeadCell>
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
                            <TBodyCell flex="2 2 0">{ip}</TBodyCell>
                            <TBodyCell flex="0.5 0.5 0">{port}</TBodyCell>
                            <TBodyCell flex="3 3 0">{user}</TBodyCell>
                            <TBodyCell flex="2.5 2.5 0">{pass}</TBodyCell>
                            <TBodyCell flex="1.5 1.5 0">Idle</TBodyCell>
                            <TBodyCell>
                                <Icon icon={faVial} color={theme.primaryColor}/>
                                <Icon icon={faEdit} color={theme.primaryColor}/>
                                <Icon icon={faTrash} color={theme.primaryColor}/>
                            </TBodyCell>
                        </TBodyRow>
                    )
                })
            }</TBody>
        </Table>
    )
}

export default ProxyTable;