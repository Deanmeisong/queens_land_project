import React, { ReactNode } from 'react';
import styled from 'styled-components/macro';
import logo from 'images/qld_logo.png';

interface MyProps {
  children?: ReactNode;
}

export default function Layout({ children }: MyProps) {
  return (
    <>
      <TopBlueStrip>
        <Text>
          Queensland Government websites
          {process.env.REACT_APP_ENV !== 'production'
            ? '  ---DEVELOPMENT MODE---'
            : ''}
        </Text>
      </TopBlueStrip>
      <LogoHeader>
        <QldLogo src={logo} alt="logo" />
        <div>
          <LogoHr />
        </div>
        <LogoTitle>Department of Environment, Science and Innovation</LogoTitle>
      </LogoHeader>
      <MainView>{children}</MainView>
    </>
  );
}

const Text = styled.span`
  margin-left: 64px;
`;

const LogoTitle = styled.span`
  font-family: 'MetaProBold';
  font-size: 24px;
  color: #022a50;
`;

const LogoHeader = styled.div`
  background: white;
  height: 120px;
  display: flex;
  flex-flow: column;
  padding-left: 64px;
  width: auto;
  flex-direction: row;
  align-content: center;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;

  > * {
    margin-right: 26px;
  }
`;

const TopBlueStrip = styled.div`
  color: white;
  font-family: 'Lato';
  font-size: 14px;
  background: #09549f;
  width: 100vw;
  height: 36px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
`;

const QldLogo = styled.img`
  width: 170px;
  height: 56px;
`;

const LogoHr = styled.hr`
  border: 1px solid #6bbe27;
  height: 56px;
`;

const MainView = styled.div`
  height: inherit;
  /* width: inherit; */
`;
