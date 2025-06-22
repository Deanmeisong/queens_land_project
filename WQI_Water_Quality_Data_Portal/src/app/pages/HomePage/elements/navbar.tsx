import * as React from 'react';
import styled from 'styled-components';
import HomeIcon from 'calcite-ui-icons-react/HomeIcon';
import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <NavBar>
      <CustomNavLink to="/">
        <span>
          <HomeIcon></HomeIcon>
        </span>
      </CustomNavLink>
      <CustomNavLink to="/map">
        <span style={{ fontSize: '16px' }}>Explore data</span>
      </CustomNavLink>
      <CustomNavLink to="/about">
        <span style={{ fontSize: '16px' }}>About the data</span>
      </CustomNavLink>
      <CustomNavLink to="/analysis-download">
        <span style={{ fontSize: '16px' }}>Analysis Download</span>
      </CustomNavLink>
      <ChoicesStrip></ChoicesStrip>
    </NavBar>
  );
}

const ChoicesStrip = styled.div`
  background: #6bbe27;
  position: absolute;
  height: 8px !important;
  width: 100%;
  z-index: 1;
  bottom: 0;
`;

const NavBar = styled.div`
  display: flex;
  height: 60px;
  background: #f5f5f5;
  align-items: center;
  font-size: 16px;
  position: relative;
  z-index: 1;

  > :first-child {
    margin-left: 64px;
    position: relative;
  }
`;

const CustomNavLink = styled(NavLink)`
  color: #161616;
  text-decoration: none;
  min-width: 48px;
  height: 100%;
  padding: 0.625rem 1rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-content: center;
`;
