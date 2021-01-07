import React, { useState } from 'react';
import {  Text, Select } from '../../components/user-input'
import { HeaderTitle, HeaderOptions } from '../../components/global'
import { ModalBody, ModalContent, ModalWrapper, ModalHeader, ModalFooter, ModalFooterNav } from '../../components/Modal';
import { NewButton as Button } from '../../components/user-input/Button';
const cardTypes = [
    {
        label: 'Select Type',
        value: '',
        placeholder: '',
        spaces: [],
        length: 0
    },
    {
        label: 'Visa',
        value: 'visa',
        placeholder: '4242 4242 4242 4242',
        spaces: [4, 9, 14],
        length: 19
    },
    {
        label: 'Mastercard',
        value: 'master',
        placeholder: '5151 5151 5151 5151',
        spaces: [4, 9, 14],
        length: 19
    },
    {
        label: 'American Express',
        value: 'amex',
        placeholder: '3434 343434 34343',
        spaces: [4, 11],
        length: 17
    },
    {
        label: 'PayPal',
        value: 'paypal',
        placeholder: '',
        spaces: [],
        length: 0
    }
    // Supreme Only {
    //     label: '代金引換 (Cash on Delivery)',
    //     value: 'cod',
    //     placeholder: '',
    //     spaces: [],
    //     length: 0
    // }
]


interface ProfileModalProps {
    setToggleModal: Function;
}

const ProfileModal: React.FC<any> = (props: ProfileModalProps) => {
    const [page, setPage] = useState('shipping');

    const [ shippingFirst, setShippingFirst ] = useState('');
    const [ shippingLast, setShippingLast ] = useState('');
    const [ shippingEmail, setShippingEmail ] = useState('');
    const [ shippingPhone, setShippingPhone ] = useState('');
    const [ shippingAddress1, setShippingAddress1 ] = useState('');
    const [ shippingAddress2, setShippingAddress2 ] = useState('');
    const [ shippingZip, setShippingZip ] = useState('');
    const [ shippingCity, setShippingCity ] = useState('');
    const [ shippingCountry, setShippingCountry ] = useState('');
    const [ shippingState, setShippingState ] = useState('');

    const [ billingFirst, setBillingFirst ] = useState('');
    const [ billingLast, setBillingLast ] = useState('');
    const [ billingEmail, setBillingEmail ] = useState('');
    const [ billingPhone, setBillingPhone ] = useState('');
    const [ billingAddress1, setBillingAddress1 ] = useState('');
    const [ billingAddress2, setBillingAddress2 ] = useState('');
    const [ billingZip, setBillingZip ] = useState('');
    const [ billingCity, setBillingCity ] = useState('');
    const [ billingCountry, setBillingCountry ] = useState('');
    const [ billingState, setBillingState ] = useState('');

    const [ paymentType, setPaymentType ] = useState(cardTypes[0]);
    const [ paymentNumber, setPaymentNumber ] = useState('');
    const [ paymentMonth, setPaymentMonth ] = useState('');
    const [ paymentYear, setPaymentYear ] = useState('');
    const [ paymentHolder, setPaymentHolder ] = useState('');
    const [ paymentCvv, setPaymentCvv ] = useState('');

    return (
        <ModalWrapper onClick={() => { props.setToggleModal(false) }}>
            <ModalBody onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}>
                <ModalHeader>
                    <HeaderTitle>New Profile</HeaderTitle>
                    <HeaderOptions>
                        <Button secondary text="Save Profile"></Button>
                    </HeaderOptions>
                </ModalHeader>
                {
                    page === 'shipping' ? (
                        <>
                            <ModalContent>
                                <Text
                                    label="First Name"
                                    placeholder="John"
                                    size="1 1 30%"
                                    value={shippingFirst}
                                    onChange={(e: any) => { setShippingFirst(e.target.value) }}
                                />
                                <Text
                                    label="Last Name"
                                    placeholder="Doe"
                                    size="1 1 30%"
                                    value={shippingLast}
                                    onChange={(e: any) => { setShippingLast(e.target.value) }}
                                />
                                <Text
                                    label="Email"
                                    placeholder="johndoe@gmail.com"
                                    size="1 1 30%"
                                    value={shippingEmail}
                                    onChange={(e: any) => { setShippingEmail(e.target.value) }}
                                />
                                <Text
                                    label="Telephone"
                                    placeholder="123 456 7890"
                                    size="1 1 30%"
                                    value={shippingPhone}
                                    onChange={(e: any) => { setShippingPhone(e.target.value) }}
                                />
                                <Text
                                    label="Address 1"
                                    placeholder="123 East Str"
                                    size="1 1 30%"
                                    value={shippingAddress1}
                                    onChange={(e: any) => { setShippingAddress1(e.target.value) }}
                                />
                                <Text
                                    label="Address 2"
                                    placeholder="Block 3A"
                                    size="1 1 30%"
                                    value={shippingAddress2}
                                    onChange={(e: any) => { setShippingAddress2(e.target.value) }}
                                />
                                <Text
                                    label="Zip"
                                    placeholder="11111"
                                    size="1 1 30%"
                                    value={shippingZip}
                                    onChange={(e: any) => { setShippingZip(e.target.value) }}
                                />
                                <Text
                                    label="City"
                                    placeholder="New York"
                                    size="1 1 30%"
                                    value={shippingCity}
                                    onChange={(e: any) => { setShippingCity(e.target.value) }}
                                />
                                <Select
                                    label="Country"
                                    data={[]}
                                  
                                    value={shippingCountry}
                                    onChange={(e: any) => { setShippingCountry(e.target.value) }}
                                />
                                <Select
                                    label="State"
                                    data={[]}
                                    
                                    value={shippingState}
                                    onChange={(e: any) => { setShippingState(e.target.value) }}
                                />
                                {/* <Text
                                    label="Same Billing Info"
                                    type="checkbox"
                                    size="1 1 20%"
                                    value={shippingCity}
                                    onChange={(e: any) => { setShippingCity(e.target.value) }}
                                /> */}
                            </ModalContent>
                            <ModalFooter>
                                    <ModalFooterNav active>Shipping</ModalFooterNav>
                                    <ModalFooterNav onClick={() => { setPage('billing') }}>Billing</ModalFooterNav>
                                    <ModalFooterNav onClick={() => { setPage('payment') }}>Payment</ModalFooterNav>
                            </ModalFooter>
                        </>
                    ) :
                        page === 'billing' ? (
                            <>
                                <ModalContent>
                                    <Text
                                        label="First Name"
                                        placeholder="John"
                                        size="1 1 30%"
                                        value={billingFirst}
                                        onChange={(e: any) => { setBillingFirst(e.target.value) }}
                                    />
                                    <Text
                                        label="Last Name"
                                        placeholder="Doe"
                                        size="1 1 30%"
                                        value={billingLast}
                                        onChange={(e: any) => { setBillingLast(e.target.value) }}
                                    />
                                    <Text
                                        label="Email"
                                        placeholder="johndoe@gmail.com"
                                        size="1 1 30%"
                                        value={billingEmail}
                                        onChange={(e: any) => { setBillingEmail(e.target.value) }}
                                    />
                                    <Text
                                        label="Telephone"
                                        placeholder="123 456 7890"
                                        size="1 1 30%"
                                        value={billingPhone}
                                        onChange={(e: any) => { setBillingPhone(e.target.value) }}
                                    />
                                    <Text
                                        label="Address 1"
                                        placeholder="123 East Str"
                                        size="1 1 30%"
                                        value={billingAddress1}
                                        onChange={(e: any) => { setBillingAddress1(e.target.value) }}
                                    />
                                    <Text
                                        label="Address 2"
                                        placeholder="Block 3A"
                                        size="1 1 30%"
                                        value={billingAddress2}
                                        onChange={(e: any) => { setBillingAddress2(e.target.value) }}
                                    />
                                    <Text
                                        label="Zip"
                                        placeholder="11111"
                                        size="1 1 30%"
                                        value={billingZip}
                                        onChange={(e: any) => { setBillingZip(e.target.value) }}
                                    />
                                    <Text
                                        label="City"
                                        placeholder="New York"
                                        size="1 1 30%"
                                        value={billingCity}
                                        onChange={(e: any) => { setBillingCity(e.target.value) }}
                                    />
                                    <Select
                                        label="Country"
                                        data={[]}
                                        value={billingCountry}
                                        onChange={(e: any) => { setBillingCountry(e.target.value) }}
                                    />
                                    <Select
                                        label="State"
                                        data={[]}
                                        value={billingState}
                                        onChange={(e: any) => { setBillingState(e.target.value) }}
                                    />
                                </ModalContent>
                                <ModalFooter>
                                    <ModalFooterNav onClick={() => { setPage('shipping') }}>Shipping</ModalFooterNav>
                                    <ModalFooterNav active>Billing</ModalFooterNav>
                                    <ModalFooterNav onClick={() => { setPage('payment') }}>Payment</ModalFooterNav>
                                </ModalFooter>
                            </>
                        ) :

                        page === 'payment' && (
                            <>
                                <ModalContent>
                                    <Select
                                        label="Type"
                                        data={cardTypes}
                                        value={paymentType.value}
                                        onChange={(e:any)=>{
                                            setPaymentType(cardTypes.find(x => x.value == e.target.value))
                                            setPaymentNumber('');
                                        }}
                                    />
                                    { paymentType.length ? (
                                        <>
                                    <Text
                                        label="Card Number"
                                        data={[]}
                                        placeholder={paymentType.placeholder}
                                        value={paymentNumber}
                                        maxLength={paymentType.length}
                                        onChange={(e)=>{
                                            if (paymentType.spaces.includes(e.target.value.length)) {
                                                setPaymentNumber(e.target.value += ' ');
                                                return;
                                            }
                                            setPaymentNumber(e.target.value);
                                        }}
                                    />
                                    <Select
                                        label="Expiry Month"
                                        data={[]}
                                        size="1 1 40%"
                                        value={paymentMonth}
                                        onChange={()=>{}}
                                    />
                                    <Select
                                        label="Expiry Year"
                                        data={[]}
                                        size="1 1 40%"
                                        value={paymentYear}
                                        onChange={()=>{}}
                                    />
                                    <Text
                                        label="Card Holder"
                                        data={[]}
                                        placeholder="John Doe"
                                        size="3 3 70%"
                                        value={paymentHolder}
                                        onChange={()=>{}}
                                    />
                                    <Text
                                        label="CVV"
                                        size="1 1 20%"
                                        placeholder="123"
                                        value={paymentCvv}
                                        onChange={()=>{}}
                                    />
                                    </>
                                    ) : ( <></>) }
                                </ModalContent>
                                <ModalFooter>
                                    <ModalFooterNav onClick={() => { setPage('shipping') }}>Shipping</ModalFooterNav>
                                    <ModalFooterNav onClick={() => { setPage('billing') }}>Billing</ModalFooterNav>
                                    <ModalFooterNav active>Payment</ModalFooterNav>
                                </ModalFooter>
                            </>
                        )
                }



            </ModalBody>
        </ModalWrapper>
    )
}



export default ProfileModal;