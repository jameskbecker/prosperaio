import React from 'react';
import styled from 'styled-components';
import { InputBase, InputWrapper } from './Base';

interface TextProps {
    type?: string;
    label?: string;
    placeholder?: string;
    secondary?: boolean;
    value: string;
    maxLength?: number
    size?: string
    onChange: (event: any) => void;
}


export default (props: TextProps) => {
    return (
        <InputWrapper size={props.size ? props.size : null}>
            <Label>{props.label}</Label>
            <Input
                type={props.hasOwnProperty('type') ? props.type : "text"}
                placeholder={props.hasOwnProperty('placeholder') ? props.placeholder : ""} 
                secondary={props.hasOwnProperty('secondary') ? props.secondary : false} 
                maxLength={props.maxLength}
                value={props.value} 
                onChange={props.onChange} 
            />
        </InputWrapper>
    )
}


const Label = styled.label`
   font-size: 12px;
   color: white;
   margin: 0 5px;
`;
const Input = styled(styled.input`${InputBase}`)`
  
  max-width: 100%;
`;