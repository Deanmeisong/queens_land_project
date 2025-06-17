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
          On the Water Quality Data Portal, you can find:
        </TopTextParagraph>
        <ListContainer>
          <ul>
            <li>
              Concentration data for various water quality parameters,
              predominantly sediment, nutrients, and pesticides
            </li>
            <li>
              Calculated annual and daily Total Suspended Solids and nutrients
              loads, annual Total Suspended Solids and nutrients yields
            </li>
            <li>Calculated Pesticide Risk Metric</li>
          </ul>
        </ListContainer>
        <TopTextParagraph as="p">
          Data are available for monitoring locations across the Great Barrier
          Reef Catchments and South East Queensland for the water quality
          monitoring programs:
        </TopTextParagraph>
        <ListContainer>
          <ul>
            <li>
              The{' '}
              <a
                href="https://www.reefplan.qld.gov.au/tracking-progress/paddock-to-reef"
                style={{
                  color: '#09549F',
                  fontSize: '1.5rem',
                  fontFamily: 'Lato',
                  textDecoration: 'underline',
                  alignSelf: 'flex-start',
                }}
              >
                Great Barrier Reef Catchment Loads Monitoring Program
              </a>
            </li>
            <li>
              The South East Queensland Catchment Loads Monitoring Program
            </li>
          </ul>
        </ListContainer>
        <TopTextParagraph as="p">
          Both Programs support the monitoring and reporting roles of the
          Department as part of{' '}
          <a
            href="https://www.reefplan.qld.gov.au/"
            style={{
              color: '#09549F',
              fontSize: '1.5rem',
              fontFamily: 'Lato',
              textDecoration: 'underline',
              alignSelf: 'flex-start',
            }}
          >
            Reef 2050 Water Quality Improvement Plan{' '}
          </a>{' '}
          and South East Queensland Healthy Waterways initiatives.
        </TopTextParagraph>
        <TopTextParagraph as="p">
          By using the Water Quality Data Portal, you acknowledge the following
          the{' '}
          <a
            href="https://www.qld.gov.au/__data/assets/pdf_file/0025/414349/Terms-of-Use.pdf"
            style={{
              color: '#09549F',
              fontSize: '1.5rem',
              fontFamily: 'Lato',
              textDecoration: 'underline',
              alignSelf: 'flex-start',
            }}
          >
            Terms and conditions
          </a>
          .
        </TopTextParagraph>
        <TopTextParagraph as="p">
          *Tahbil means water (fresh) in Turrbal, an Aboriginal Australian language of the Turrbal people of the Brisbane area of Queensland.
        </TopTextParagraph>

        <ButtonParagraph as="div">
          <ButtonLink
            appearance="transparent"
            kind="inverse"
            scale="l"
            onClick={() => (window.location.href = '/water-data-portal/map')}
          >
            Explore Data
          </ButtonLink>
          <ButtonLink
            appearance="transparent"
            kind="inverse"
            scale="l"
            onClick={() =>
              (window.location.href =
                'https://www.qld.gov.au/__data/assets/pdf_file/0024/414348/Data-Water-Portal_Methods.pdf')
            }
          >
            Methods
          </ButtonLink>
          <ButtonLink
            appearance="transparent"
            kind="inverse"
            scale="l"
            onClick={() =>
              (window.location.href =
                'https://storymaps.arcgis.com/collections/9a61cdb7ff1143bd9eec98eccbc3b50e')
            }
          >
            Publications & Resources
          </ButtonLink>
        </ButtonParagraph>
      </TextWrapperTop>
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
  padding-top: 1rem;
`;
const ButtonLink = styled(CalciteButton)`
  width: -webkit-fill-available;
  justify-content: center;
  width: auto;
  justify-content: center;
  padding: 0 2.5rem;
  height: 3rem;
  border-radius: 0.25rem;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2),
    0px 4px 8px 3px rgba(0, 0, 0, 0.1);
  background-color: #09549f;
`;
const Wrapper = styled.div`
  min-height: 224px;
  background: white;
  margin: 64px 0 64px 0;

  > * {
    margin: 0 64px 0 64px;
  }
`;
