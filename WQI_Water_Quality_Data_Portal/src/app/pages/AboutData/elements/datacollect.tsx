import * as React from 'react';
import styled from 'styled-components';
import dataColl from 'images/data_collection.png';

export function DataCollect() {
  return (
    <Wrapper>
      <ExpandableContentWrapper>
        <SectionAlignment>
          <TextWrapper>
            <TitleParagraph as="h2">
              Water Quality Sample Collection
            </TitleParagraph>
            <TextParagraph as="p">
              The team has been collecting water quality samples in Queensland
              since 2005. Annually, the team monitors over one hundred sites
              covering more than two-thirds of the basins that flow to the Great
              Barrier Reef lagoon, as well as over a dozen sites across basins
              in South East Queensland.
              <br />
              <br />
              Manual and automated sampling techniques are used to collect water
              samples that are analysed for various parameters related to
              sediment, nutrients, and pesticides.
              <br />
              <br />
              Monitoring is more frequent during rain events to facilitate the
              calculation of a Pesticide Risk Metric and the total mass (load)
              of nutrients and sediments delivered to the Great Barrier Reef
              lagoon and Moreton Bay.
              <br />
              <br />
              The number and location of sites changes regularly to meet the
              requirements of the Programs, as does the suite of parameters
              monitored. The WQI team collect water samples from waterways
              manually, while remotely operated pumps are used to collect water
              samples automatically.
            </TextParagraph>
          </TextWrapper>
          <ParagraphImg src={dataColl} alt=""></ParagraphImg>
        </SectionAlignment>
      </ExpandableContentWrapper>
    </Wrapper>
  );
}

const ParagraphImg = styled.img`
  width: 35rem;
  // height: 385px;
  margin: 20px 32px 64px 64px !important;
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
  margin: 0 32px 0 0 !important;
  & > * {
    margin-bottom: 32px;
  }
`;
const TitleParagraph = styled.h2`
  margin: 0 0 20px 0;
  line-height: 2.5rem;
  word-spacing: normal;
  font-weight: bold;
  font-size: 2rem;
  color: #03213f;
  font-family: 'Lato';
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 376px;
  background: white;
  margin: 64px 6px 64px 64px;

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
