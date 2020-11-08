import React from 'react';
import styled from 'styled-components';
import { Button, InputWrapper } from './Base';

// import { IconProp } from '@fortawesome/react-fontawesome';
import theme from '../global/theme'
import { Icon } from '../global/index';
interface ButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    secondary?: boolean | null;
    text: string;
    icon?: any
}

const ButtonWrapper = styled(InputWrapper)`
    & > Button {
        border: 1.5px solid ${theme.primaryColor};
    }
    & > Button:disabled {
        opacity: 0.3;
        cursor: not-allowed;

        /* :hover {
        opacity: 0.3 !important;
        border-color: transparent !important;
        }; */
    };

    
    
`;

// export default (props: ButtonProps) => {
//     return (
//         <ButtonWrapper size={props.size ? props.size : null}>
//             {props.icon && (
//                 <Icon icon={props.icon}/>
//             )}
//             <Button secondary={props.secondary} disabled={props.disabled ? true : false} onClick={props.onClick}>{props.text}</Button>
//         </ButtonWrapper>
//     )
// }

const BWrap = styled.button`
    margin: 2.5px 15px;
    font-size: 12px;
    border-radius: 5px;
    border: 2px solid ${theme.secondaryColor};
    color: white;
    background-color: ${(props: any) => props.secondary ? theme.grey_4 : theme.grey_2};
    -webkit-appearance: none;
    overflow: hidden;
    cursor: pointer;
    opacity: 0.8;
    padding: 1vh 0.5vw;
    flex: 0 0 125px;

    &&:hover {
        transition: 0.25s ease-in;
        opacity: 1;
        background-color: ${theme.primaryColor};
    }
`;

export const NewButton = (props: any) => {
    return (
    <BWrap onClick={props.onClick ? props.onClick : null}>
        {props.icon && ( <Icon icon={props.icon}/>)}
        {props.text && (props.text)}
    </BWrap>
    )
}

const Label = styled.label`
   font-size: 12px;
   color: white;
   margin: 0 5px;
`;