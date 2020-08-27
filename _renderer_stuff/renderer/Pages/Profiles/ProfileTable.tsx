import React, { useEffect } from 'react';
import Table, { THead, TBody, THeadRow, THeadCell, TBodyRow, TBodyCell } from '../../Components/global/table';


import mt from './mock-profiles';

interface MT {
    [key: string]: any;
}

const mockProfiles: MT = mt;

const ProfileTable: React.FC<any> = (props: any) => {
    useEffect(() => {
        props.setTaskTotal(Object.keys(mockProfiles).length.toString())
    }, []);

    return (
        <Table>
            <THead>
                <THeadRow>
                    <THeadCell>Profile Name</THeadCell>
                    <THeadCell flex="2 2 0">Billing Address</THeadCell>
                    <THeadCell flex="2 2 0">Shipping Address</THeadCell>
                    <THeadCell>Payment Method</THeadCell>
                </THeadRow>

            </THead>
            <TBody>{

                Object.keys(mockProfiles).map((id: string) => (
                    <TBodyRow key={id}>
                        <TBodyCell>{mockProfiles[id].profileName}</TBodyCell>
                        <TBodyCell flex="2 2 0">{
                           mockProfiles[id].billing.first + ' ' +
                           mockProfiles[id].billing.last + ' - ' +
                           mockProfiles[id].billing.address1 + ' ' +
                           mockProfiles[id].billing.address2 + ' - ' + 
                           mockProfiles[id].billing.state + ' ' +
                           mockProfiles[id].billing.country 
                        }</TBodyCell>
                        <TBodyCell flex="2 2 0">{
                           mockProfiles[id].billing.first + ' ' +
                           mockProfiles[id].billing.last + ' - ' +
                           mockProfiles[id].shipping.address1 + ' ' +
                           mockProfiles[id].shipping.address2+ ' - ' + 
                           mockProfiles[id].shipping.state + ' ' +
                           mockProfiles[id].shipping.country 
                        }</TBodyCell>
                        <TBodyCell>{
                            '**** **** **** '  + mockProfiles[id].payment.cardNumber.substr(-4)  
                        }</TBodyCell>

                    </TBodyRow>
                ))
            }</TBody>
        </Table>
    )
}

export default ProfileTable;