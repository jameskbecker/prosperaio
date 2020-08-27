import React from 'react';
import styled from 'styled-components';
import { Button, InputWrapper } from './Base';
import { Icon } from '../global';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';

interface ButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    secondary?: boolean | null;
    text: string;
    icon?: IconDefinition
}

const ButtonWrapper = styled(InputWrapper)`

    & > Button:disabled {
        opacity: 0.3;
        cursor: not-allowed;

        :hover {
        opacity: 0.3 !important;
        border-color: transparent !important;
        };
    };

    
    
`;

export default (props: ButtonProps) => {
    return (
        <ButtonWrapper size={props.size ? props.size : null}>
            
            <Button secondary={props.secondary} disabled={props.disabled ? true : false} onClick={props.onClick}>{props.text}</Button>
        </ButtonWrapper>
    )
}
const Label = styled.label`
   font-size: 12px;
   color: white;
   margin: 0 5px;
`;