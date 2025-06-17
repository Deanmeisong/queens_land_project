import * as React from 'react';
import styled from 'styled-components';
import siteInst from 'images/site_installation.png';

export function SiteInstallation() {
  return (
    <Wrapper>
      <ExpandableContentWrapper>
        <SectionAlignment>
          <ParagraphImg src={siteInst} alt=""></ParagraphImg>
          <TextWrapper>
            <TitleParagraph as="h2">
              A range of water quality parameters monitored
            </TitleParagraph>
            <TextParagraph as="p">
              The sampling is focused mainly on total suspended solids
              (sediment), nitrogen and phosphorus compounds (i.e. nutrients),
              and pesticides to meet the requirements of the Programs. Some
              physical parameters such as pH, turbidity and conductivity are
              also monitored depending on project requirements or to provide
              context to the nutrient and pesticide data.
              <br />
              <br />
              Concentration values are used in conjunction with discharge
              measurements (water volume flowing past the monitoring station) to
              calculate annual and daily mass loads and yields (load per unit
              area of land) of pollutants. Pesticide risk, expressed as the
              Pesticide Risk Metric, is also calculated and reported as the
              annual wet season risk (percentage of aquatic species affected).
              Daily load, yield and daily pesticides risk are also calculated.
              <br />
              <br />
              The methods to calculate the loads and Pesticides Risk Metrics are
              available{' '}
              <a
                href="https://www.qld.gov.au/__data/assets/pdf_file/0024/414348/Data-Water-Portal_Methods.pdf"
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
            </TextParagraph>
          </TextWrapper>
        </SectionAlignment>
      </ExpandableContentWrapper>
    </Wrapper>
  );
}

const ParagraphImg = styled.img`
  width: 35rem;
  // height: 385px;
  margin: 64px 32px 64px 64px !important;
`;
const TextParagraph = styled.p`
  font-weight: unset;
  line-height: 2rem;
  word-spacing: normal;
  font-size: 1.5rem;
  font-family: 'Lato';
  color: #414141;
`;
const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin: 64px 32px 0 0 !important;
  & > * {
    margin-bottom: 64px;
  }
`;
const TitleParagraph = styled.h2`
  margin: 0 0 20px 0;
  line-height: 2.5rem;
  word-spacing: normal;
  font-weight: 700;
  font-size: 2rem;
  color: #03213f;
  font-family: 'Lato';
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 376px;
  background: #e8e8e8;
  margin: 64px 0 64px 0;

  > * {
    margin: 0 64px 0 0 !important;
  }
`;
const SectionAlignment = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const ExpandableContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 64px;
`;
