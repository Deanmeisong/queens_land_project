import * as React from 'react';
import styled from 'styled-components';
import HomeIcon from 'calcite-ui-icons-react/HomeIcon';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();

  function handleExploreClick() {
    navigate('/Map');
  }

  function handleAboutUsClick() {
    navigate('/AboutUs'); // Navigate to the AboutUs page
  }

  return (
    <NavBar>
      <LinkStyle>
        <span>
          <HomeIcon></HomeIcon>
        </span>
      </LinkStyle>
      <LinkStyle onClick={handleExploreClick} style={{ cursor: 'pointer' }}>
        <span>Explore data</span>
      </LinkStyle>
      <LinkStyle onClick={handleAboutUsClick} style={{ cursor: 'pointer' }}>
        <span>About Us</span>
        <ActiveChoice></ActiveChoice>
      </LinkStyle>
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

const ActiveChoice = styled.div`
  // background: #f5f5f5;
  background: #ffffff;
  position: absolute;
  height: 8px !important;
  width: 100%;
  z-index: 999;
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

const LinkStyle = styled.span`
  min-width: 48px;
  height: 100%;
  margin: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  align-content: center;
`;
