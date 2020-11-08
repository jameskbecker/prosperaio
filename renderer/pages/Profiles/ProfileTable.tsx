import React, { useEffect } from 'react';
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
import {
    faTrash,
    faEdit,
    faClone, faSquare
} from '@fortawesome/free-solid-svg-icons';
import { faCcVisa, faCcAmex, faCcMastercard, faPaypal, faCcPaypal } from '@fortawesome/free-brands-svg-icons'
import theme from '../../Components/global/theme';
import mt from './mock-profiles';

interface MT {
    [key: string]: any;
}

const mockProfiles: MT = mt;

function getCcIcon(type: string) {
    switch(type) {
        case "visa":
            return faCcVisa;
        case "amex":
            return faCcAmex;
        case "master":
            return faCcMastercard;
        case "paypal":
            return faCcPaypal;
        default: 
            return null
    }
}

const ProfileTable: React.FC<any> = (props: any) => {
    useEffect(() => {
        const profileIds = Object.keys(mockProfiles);
        props.setTaskTotal(profileIds.length.toString());
    }, []);

    return (
        <Panel>
        <Table>
            <THead>
                <THeadRow>
                    {/* <THeadCell flex="0 0 4%">
                        <Icon icon={faSquare}/>
                    </THeadCell> */}
                    <THeadCell>Profile Name</THeadCell>
                    <THeadCell flex="2 2 0">Billing Address</THeadCell>
                    <THeadCell flex="2 2 0">Shipping Address</THeadCell>
                    <THeadCell>Payment Method</THeadCell>
                    <THeadCell flex="0.5 0.5 0">Actions</THeadCell>
                </THeadRow>
            </THead>
            <TBody>
                {Object.keys(mockProfiles).map((id: string) => {
                    const billing = mockProfiles[id].billing;
                    const shipping = mockProfiles[id].shipping;
                    const payment = mockProfiles[id].payment;
                    return (
                        <TBodyRow key={id}>
                            {/* <TBodyCell flex="0 0 4%">
                                <Icon icon={faSquare}/>
                            </TBodyCell> */}
                            <TBodyCell>{mockProfiles[id].profileName}</TBodyCell>
                            <TBodyCell flex="2 2 0">
                                { `${billing.first} ${billing.last}` } <br/>
                                { billing.address1 } <br/> 
                                { billing.address2 } <br/>
                                { `${billing.country} ${billing.state}` }
                            </TBodyCell>
                            <TBodyCell flex="2 2 0">
                            { `${shipping.first} ${shipping.last}` } <br/>
                                { shipping.address1 } <br/> 
                                { shipping.address2 } <br/>
                                { `${shipping.country} ${shipping.state}` }
                            </TBodyCell>
                            <TBodyCell>
                                {
                                    
                                    getCcIcon(payment.type) && (
                                        <Icon icon={getCcIcon(payment.type)}/>
                                    )
                                }
                                { ` Ending in ${payment.cardNumber.substr(-4)}` }
                            </TBodyCell>
                            <TBodyCell flex="0.5 0.5 0">
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

export default ProfileTable;
