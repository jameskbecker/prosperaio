import React, { useEffect, useState } from 'react';
import {
    ModalWrapper,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalFooterNav,
} from '../../components/Modal';
import {
    Column,
    Container,
    HeaderBar,
    HeaderTitle,
    HeaderOptions,
} from '../../components/global';
import { Text, Select } from '../../components/user-input';
import { NewButton } from '../../components/user-input/Button';

interface TaskModalProps {
    setToggleModal: Function;
}

const TaskModal: React.FC<TaskModalProps> = (props: TaskModalProps) => {
    const [page, setPage] = useState('general');

    const [site, setSite] = useState('');
    const [profile, setProfile] = useState('');
    const [proxyList, setProxyList] = useState('');
    const [keywords, setKeywords] = useState('');
    const [size, setSize] = useState('');
    const [style, setStyle] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState(1);

    const [cartDelay, setCartDelay] = useState(0);
    const [checkoutDelay, setCheckoutDelay] = useState(0);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const data = [
        {
            label: 'Select Site',
            value: '',
        },
    ];

    return (
        <ModalWrapper
            onClick={() => {
                props.setToggleModal(false);
            }}
        >
            <ModalBody
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                }}
            >
                <ModalHeader>
                    <HeaderTitle>New Task</HeaderTitle>
                    <HeaderOptions>
                        <NewButton text="Save Task" />
                    </HeaderOptions>
                </ModalHeader>

                {page === 'general' ? (
                    <>
                        <ModalContent>
                            <Select
                                label="Site"
                                data={data}
                                value={site}
                                size="1 1 95%"
                                onChange={(e: any) => setSite(e.target.value)}
                            />
                            <Select
                                label="Profile"
                                data={[]}
                                value={profile}
                                onChange={(e: any) => setProfile(e.target.value)}
                            />
                            <Text
                                label="Product (Keywords / Url / SKU)"
                                placeholder=""
                                value={keywords}
                                size="1 1 95%"
                                onChange={(e: any) => setKeywords(e.target.value)}
                            />
                            <Select
                                label="Product Size"
                                data={[]}
                                value={size}
                                size="1 1 30%"
                                onChange={(e: any) => setSize(e.target.value)}
                            />

                            

                            <Select
                                label="Proxy List"
                                data={[ { label: "None", value: "" } ]}
                                value={proxyList}
                                size="1 1 30%"
                                onChange={(e: any) => setProxyList(e.target.value)}
                            />

                            <Text
                                label="Product Quantity"
                                type="number"
                                value={quantity.toString()}
                                size="1 1 25%"
                                onChange={(e: any) => setQuantity(e.target.value)}
                            />
                        </ModalContent>

                        <ModalFooter>
                            <ModalFooterNav active={true}>General</ModalFooterNav>
                            <ModalFooterNav
                                onClick={() => {
                                    setPage('advanced');
                                }}
                            >
                                Advanced
              </ModalFooterNav>
                        </ModalFooter>
                    </>
                ) : page === 'advanced' ? (
                    <>
                        <ModalContent>
                            {/* <Select
                                label="Task Mode"
                                data={[]}
                                value=""
                                onChange={() => { }}
                            />
                            <Select
                                label="Restock Mode"
                                data={[]}
                                value=""
                                onChange={() => { }}
                            />
                            <Text
                                label="Cart Delay"
                                type="number"
                                value={cartDelay}
                                onChange={(e: any) => setCartDelay(e.target.value)}
                            />
                            <Text
                                label="Checkout Delay"
                                type="number"
                                value={checkoutDelay}
                                onChange={(e: any) => setCheckoutDelay(e.target.value)}
                            /> */}

                            <Text
                                label="Min Price"
                                value={minPrice}
                                onChange={(e: any) => setMinPrice(e.target.value)}
                            />
                            <Text
                                label="Max Price"
                                value={maxPrice}
                                onChange={(e: any) => setMaxPrice(e.target.value)}
                            />
                            <Text
                                label="Start Date"
                                type="date"
                                value=""
                                onChange={(e: any) => setKeywords(e.target.value)}
                            />
                            <Text
                                label="Start Time"
                                type="time"
                                value=""
                                onChange={(e: any) => setKeywords(e.target.value)}
                            />
                        </ModalContent>
                        <ModalFooter>
                            <ModalFooterNav
                                onClick={() => {
                                    setPage('general');
                                }}
                            >
                                General
              </ModalFooterNav>
                            <ModalFooterNav active={true}>Advanced</ModalFooterNav>
                        </ModalFooter>
                    </>
                ) : null}
            </ModalBody>
        </ModalWrapper>
    );
};

export default TaskModal;


/* Modal Supreme Content

{site.includes('supreme') && (
    <>
        <Select
            label="Product Style"
            data={[]}
            value={style}
            onChange={(e: any) => setStyle(e.target.value)}
        />
        <Select
            label="Product Category"
            data={[]}
            value={category}
            onChange={(e: any) => setCategory(e.target.value)}
        />
    </>
)}
*/