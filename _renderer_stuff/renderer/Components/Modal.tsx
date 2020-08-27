import styled from 'styled-components';
import theme from './global/theme';
import { HeaderBar } from './global';

export const ModalWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: fixed;

    background-color: rgba(0, 0, 0, 0.5);
    height: 100vh;
    width: 100vw;
    transition: 1.5s ease-in;


`;  

export const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    width: 60%;
    height: 60%;
    opacity: 1;
    border-radius: 1vh;
    background-color: ${theme.grey_4};

`

export const ModalHeader = styled(HeaderBar)`
    flex: 3 3 0;
    width: 100%;
    background-color: ${theme.grey_3};
    border-radius: 1vh 1vh 0 0;
    order: 1;
    & > div {
        font-size: 24px;
    }
`

export const ModalContent = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    flex: 12 12 0;
    margin: 3vh 3vw;
    order: 3;
    overflow: hidden;
`

export const ModalFooter = styled(HeaderBar)`
    flex: 2 2 0;
    order: 2;
    width: 100%;
        border-top: 1px solid grey;
        box-sizing: border-box;
    background-color: ${theme.grey_3};
    justify-content: space-evenly;
`

export const ModalFooterNav = styled.div`
        font-size: 18px;
        font-weight: 600;
        color: white;
        cursor: pointer;
        opacity: ${(props:any) => props.active ? 0.6 : 0.3 };
        :hover {
            opacity: 0.5;

        }
`