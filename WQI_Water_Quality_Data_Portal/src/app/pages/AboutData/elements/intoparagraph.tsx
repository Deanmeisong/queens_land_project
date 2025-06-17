import * as React from 'react';
import styled from 'styled-components';
import { CalciteButton } from '@esri/calcite-components-react';

export function IntroductionParagraph() {
  return (
    <Wrapper>
      <TextWrapperTop>
        <BoldParagraph as="h3">
          The Water Quality & Investigations (WQI) team includes highly
          specialised water quality scientists, statisticians, technical
          specialists, hydrographers, ecotoxicologists, Geographic Information
          System experts and developers.
        </BoldParagraph>
        <TopTextParagraph as="p">
          The team is actively involved in:
        </TopTextParagraph>
        <ListContainer>
          <ul>
            <li>
              pesticide risk assessments in the Great Barrier Reef Catchments
            </li>
            <li>environmental investigations</li>
            <li>assessments relating to pollution</li>
            <li>development of water quality Australian guidelines</li>
            <li>
              water quality and aquatic ecosystem health, particularly in
              relation to per- and poly-fluoroalkyl substances (PFAS) and other
              emerging contaminants
            </li>
          </ul>
        </ListContainer>
        <TopTextParagraph as="p">
          Data analysis and visualisation tools, reports and peer-reviewed
          publications are available{' '}
          <a
            href="https://storymaps.arcgis.com/collections/9a61cdb7ff1143bd9eec98eccbc3b50e"
            style={{
              color: '#09549F',
              fontSize: '1.5rem',
              fontFamily: 'Lato',
              textDecoration: 'underline',
              alignSelf: 'flex-start',
            }}
          >
            here
          </a>
          .
        </TopTextParagraph>
        <ButtonParagraph as="div">
          <ButtonLink
            appearance="transparent"
            kind="inverse"
            scale="l"
            onClick={() => (window.location.href = './map')}
          >
            Explore Data
          </ButtonLink>
        </ButtonParagraph>
      </TextWrapperTop>

      <BottomText as="p">
        The below does not apply to third party data.
      </BottomText>
    </Wrapper>
  );
}

const ListContainer = styled.div`
  font-family: 'Lato';
  font-size: 1.5rem;
  color: #414141;
  line-height: 2rem;
  letter-spacing: 0.25px;
  ul {
    list-style-type: disc; /* Set the list style type to 'disc' for bullet points */
    margin-left: 35px; /* Adjust the left margin as needed */
  }
`;

const TextWrapperTop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  margin-right: 32px;
  & > * {
    margin-bottom: 24px;
  }
`;
const BoldParagraph = styled.h3`
  font-weight: 700;
  font-family: 'Lato';
  line-height: normal;
  font-size: 1.5rem;
  line-height: 2rem;
  letter-spacing: 0.25px;
  color: #03213f;
`;
const TopTextParagraph = styled.p`
  font-weight: unset;
  font-family: 'Lato';
  line-height: normal;
  word-spacing: normal;
  line-height: 2rem;
  letter-spacing: 0.25px;
  font-size: 1.5rem;
  color: #414141;
`;
const ButtonParagraph = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 135px;
`;
const ButtonLink = styled(CalciteButton)`
  width: 11.125rem;
  justify-content: center;
  height: 3rem;
  border-radius: 0.25rem;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
    0px 4px 8px 3px rgba(0, 0, 0, 0.1);

  background-color: #09549f;
`;
const BottomText = styled.p`
  font-size: 1.5rem;
  font-family: 'Lato';
  background: white;
  margin: 64px 0 64px 0;

  > * {
    margin: 0 64px 0 64px;
  }
`;
const Wrapper = styled.div`
  min-height: 224px;
  background: white;
  margin: 64px 0 64px 0;

  > * {
    margin: 0 64px 0 64px;
  }
`;
