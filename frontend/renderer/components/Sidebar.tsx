import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import theme from './global/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from "@fortawesome/fontawesome-svg-core";

import {
    faListUl,
    faUserFriends,
    faGlobe,
    faSyncAlt,
    faChartBar,
    faCogs,
    faWindowMinimize,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

library.add(faListUl);
library.add(faUserFriends);
library.add(faGlobe);
library.add(faSyncAlt);
library.add(faChartBar);
library.add(faCogs);

const NavItem = styled(Link)`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-self: center;
    opacity: 0.5;
    width: 90%;

    &&:hover {
        transition: 0.25s ease-in;
        opacity: 0.9;
    }
`;

const Icon = styled(FontAwesomeIcon)`
    margin: 20px 0;
    color: white;
    font-size: 14px;

`;

const SidebarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${theme.grey_3};
`;

const LogoWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    justify-items: center;
    margin: 8px;
    flex: 0 0 4.5%;
`;

const Logo = styled.div`
    flex: 1 1 0;
    background-repeat: no-repeat;
    background-size: 100%;
    align-self: center;
    justify-self: center;
    justify-content: center;
    justify-items: center;
    height: 100%;
    background-image: url("https://i.imgur.com/4aoiqZV.png");

`;

const Description = styled.p`
    color: ${theme.textGrey};
    font-size: 8px;
    text-align: center;
    
`;


const Line = styled.hr`
    width: 75%;
    height: 0.25px;
    background-color: ${theme.grey_2};
    border: none;
`;

export default function () {
    return (
        <>
            <SidebarWrapper>
                <LogoWrapper> <Logo/> </LogoWrapper>
                <Line />
                <NavItem to="index">
                    <Icon icon={["fas", "list-ul"]}></Icon>
                </NavItem>

                <NavItem to="profiles">
                    <Icon icon={["fas", "user-friends"]}></Icon>
                </NavItem>

                <NavItem to="proxies">
                    <Icon icon={["fas", "globe"]}></Icon>
                </NavItem>

                <NavItem to="harvesters">
                    <Icon icon={["fas", "sync-alt"]}></Icon>
                </NavItem>

                <NavItem to="analytics">
                    <Icon icon={["fas", "chart-bar"]}></Icon>
                </NavItem>

                <NavItem to="settings">
                    <Icon icon={["fas", "cogs"]}></Icon>
                </NavItem>
                <Line />
                <Description>ProsperAIO</Description>
                <Description>V4.0.0</Description>
            </SidebarWrapper>
        </>
    );
}