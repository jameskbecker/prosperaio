import styled, { css } from 'styled-components';
import theme from '../global/theme';

export const InputBase = css`
    flex: 0 0 4vh;

    
    overflow: hidden;

    max-width: 10vw;
    
    font-size: 12px;
    color: white; 
    text-indent: 0.5vw;

    margin: 10px 5px;
    background-color: ${(props: any) => props.secondary ? theme.grey_4 : theme.grey_5};
    
    border: 1px solid transparent;
    box-sizing:border-box;
    border-radius: 5px;
    opacity: 0.8;
    cursor: pointer;

  
    -webkit-appearance: none;
    ::-webkit-calendar-picker-indicator {
        filter: invert(1);
    }
    &&:hover {
        transition: 0.25s ease-in-out;
        box-shadow: 0 0 5px ${theme.primaryColor};
        opacity: 1;
    }

    &&:focus {
        outline: 0;

    }

`;

export const InputWrapper = styled.div`
    display: flex;

    flex-direction: column;
    overflow: hidden;
    flex: ${(props: any) => props.size ? props.size : "1 1 45%"};
    margin: 2.5px 10px;

   
`

export const Button = styled.button`${InputBase}`;