import React from 'react';
import styled from 'styled-components';

import theme from './global/theme';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './global/index';

const Select = styled.div`
    margin: 2.5px 15px;
    font-size: 12px;
    color: white;
    border: 2px solid ${theme.secondaryColor};
    background-color: ${(props: any) => props.secondary ? theme.grey_4 : theme.grey_2};
    border-radius: 5px;
    padding: 1vh 0.5vw;
    -webkit-appearance: none;
`;

export const Dropdown = (props: any) => {
    return (
        <Select>
            {
                props.data.map((o: any) => (
                    <option value={o.value} label={o.label}></option>
                ))
            }
            <Icon icon={faCaretDown}/>
        </Select>
    )
}