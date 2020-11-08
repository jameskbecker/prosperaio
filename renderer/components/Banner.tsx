import React from 'react';
import styled from 'styled-components';
import { Icon } from './global';
import { faWindowMinimize, faTimes } from '@fortawesome/free-solid-svg-icons';
import theme from './global/theme';

const BannerStyle = styled.div`
    display: grid;
    grid-template-columns: 7fr 3fr;
    background-color: ${theme.grey_1};
    color: grey;
    font-size: 12px;
    font-weight: 800;
    width: 100%;
    -webkit-app-region: drag;
`;

const NavBar = styled.div`
    display: flex;
    align-items: center;
    height: 100%;
    
`;

const Controls = styled(NavBar)`
    justify-content: flex-end;
`;

const Banner: React.FC = () => {
    return (
        <BannerStyle>
            <NavBar/>
            <Controls>
                <Icon icon={faWindowMinimize} />
                <Icon icon={faTimes}/>
            </Controls>
        </BannerStyle>
    )
}

export default Banner;









// const NavItem = styled(Link)`
//     display: flex;
//     flex: 1 1 0;
//     justify-content: center;
//     align-items: center;
//     height: 100%;
//     opacity: 0.75;
//     font-family: sans-serif;
//     color: white;
//     text-decoration: none;
//     &&:hover{
//         opacity: 1;
//         cursor: pointer;
//     }
// `