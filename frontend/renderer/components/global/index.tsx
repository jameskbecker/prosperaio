import React from 'react';
import styled, {css} from "styled-components";
import theme from './theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Wrapper = styled.div`
    display: grid;
    width: 100vw;
    height: 100vh;
    grid-template-rows: 1fr 2.5fr 15fr;
    grid-gap: 0;
    font-family: sans-serif; 
    overflow: hidden;
    -webkit-user-select: none;
	-webkit-user-drag: none;
	-webkit-app-region: no-drag;
`

export const HeaderBar = styled.div`
    overflow: hidden;
    display: flex;
    align-items: center;
    background-color: ${theme.grey_5};
`

export const HeaderTitle = styled.div`
    flex: 2 1 0;
    font-size: 36px;
    font-weight: 800;
    color: white;
    text-indent: 15px;
`;

export const HeaderOptions = styled.div`
    display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: center;
    flex: 3 1 0;
	height: 100%;
	padding: 2.5px 0;
    
`;

export const Content = styled.div`
    display: flex;
    background-color: ${theme.grey_4};
    flex-direction: column;
    
`

export const Panel = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 10px 0;
    border-radius: 7.5px;
    flex: 8 2 0;
    background-color: ${theme.grey_4};
`

export const ControlPanel = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    background-color: ${theme.grey_4};
    border-radius: 7.5px;
    margin: 0 0 10px 0;
`

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
	flex: 1 1 0;
	margin: 0.25vmax 0.5vmax;
	overflow: hidden;
	color: var(--text-grey);
	font-size: 13px;
	background-color: transparent;
`;

export const InputHeader = styled.label`
	font-size: 0.8vmax;
	height: 1.2vmax;
	text-align: left;
	color: ${theme.textGrey};
	align-content: center;
	justify-content: flex-start;
`;

export const Input = styled.input`
    text-indent: 0.1%;
    color: white;
    background-color: ${theme.grey_4};
    border: 1px solid transparent;
    font-size: 12px;
    border-radius: 1vh;
    padding: 0.75vh 1vw;
    max-width: 10vw;
    box-sizing: border-box;
    opacity: 0.8;
    margin: 10px;
    &&:hover{
        opacity: 1;
    }
`;

interface TextInputProps {
    header: string;
    placeholder?: string;
    getter: string;
    setter: Function;
    secondary: any;
};

export const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => {
    return (
        <>
            <InputHeader>{props.header}</InputHeader>
            <Input value={props.getter} onChange={(e: any) => { props.setter(e.target.value)}} placeholder={props.placeholder ? props.placeholder : ''}></Input>
        </>
    )
}

export const Column = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex: 5 5 0;
    margin: 0.25vmax 0.5vmax;
	overflow: hidden;
`

export const Icon = styled(FontAwesomeIcon)`
    padding: 0 2.5%;
    cursor: pointer;
`