import React from 'react';
import styled from 'styled-components';
import { Icon } from '.';
import { Link } from 'react-router-dom';
import { faListUl, faUserFriends, faGlobe, faSyncAlt, faChartBar, faCogs, faWindowMinimize, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import theme from './theme';


interface bannerProps {
    items: {
        route?: string
        icon?: string
    }[]
}

const Banner: React.FC<bannerProps> = (props: bannerProps) => {
    return (
        <BannerStyle>
            <NavBar>
                {props.items.map((item: any) => (
                    <NavItem to={item.route} replace>
                        <Icon icon={item.icon}/>Tasks
                    </NavItem>
                ))}
                {/* <NavItem to="index" replace>
                    <Icon icon={faListUl}/>Tasks
                </NavItem>
                <NavItem to="profiles" replace>
                    <Icon icon={faUserFriends}/>Profiles
                </NavItem>
                <NavItem to="proxies" replace>
                    <Icon icon={faGlobe}/>Proxies
                </NavItem>
                <NavItem to="harvesters" replace>
                    <Icon icon={faSyncAlt}/>Captcha
                </NavItem>
                <NavItem to="analytics" replace>
                    <Icon icon={faChartBar}/>Statistics
                </NavItem>
                <NavItem to="settings" replace>
                    <Icon icon={faCogs}/>Settings
                </NavItem> */}
            </NavBar>
            <Controls>
                <Icon icon={faWindowMinimize} />
                {props.isMaximizable && (<Icon icon={faSquare} />)}
                <Icon icon={faTimes} />
            </Controls>
        </BannerStyle>
    )
}

export default Banner;

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
    
`

const NavItem = styled(Link)`
    display: flex;
    flex: 1 1 0;
    justify-content: center;
    align-items: center;
    height: 100%;
    opacity: 0.75;
    font-family: sans-serif;
    color: white;
    text-decoration: none;
    &&:hover{
        opacity: 1;
        cursor: pointer;
    }
`
const Controls = styled(NavBar)`
    justify-content: flex-end;
    
`;