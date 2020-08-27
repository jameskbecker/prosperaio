import React from 'react';
import styled from 'styled-components';
import { InputBase, InputWrapper } from './Base';

interface SelectProps {
    secondary?: boolean | null;
    label: string;
    data: { value: string, label: string }[];
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default (props: SelectProps) => {
    return (
        <InputWrapper size={props.size?props.size:null}>
        
            <Label>{props.label}</Label>
            <Select secondary={props.secondary ? true : false} value={props.value} onChange={props.onChange}>{
                props.data && props.data.map((option: any) => (
                    <option key={option.value} value={option.value} label={option.label ? option.label : option.value}></option>
                ))
            }</Select>
        </InputWrapper>
    )
}


const Label = styled.label`
   font-size: 12px;
   color: white;
   padding: 0 5px;
`;
const Select = styled(styled.select`${InputBase}`)`
  
  max-width: 100%;
`;