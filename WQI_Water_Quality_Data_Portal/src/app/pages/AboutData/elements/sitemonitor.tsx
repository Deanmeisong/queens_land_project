import * as React from 'react';
import styled from 'styled-components';
import siteInst from 'images/site_monitor.png';

export function SiteMonitor() {
  return (
    <Wrapper>
      <ExpandableContentWrapper>
        <SectionAlignment>
          <TextWrapper>
            <TitleParagraph as="h2">Monitoring Stations</TitleParagraph>
            <TextParagraph as="p">
              The monitoring stations are designed and tailored to the specific
              requirements of the monitoring location. The sites include
              equipment for a range of purposes:
            </TextParagraph>

            <ListContainer>
              <ul>
                <li>The recording of river level and water velocity,</li>
                <li>
                  The collection of samples for sediments and nutrients and/or
                  pesticides, and
                </li>
                <li>
                  The systems required to support and maintain the monitoring
                  station remotely.
                </li>
              </ul>
            </ListContainer>
            <TextParagraph as="p">
              Water level and velocity data are required for the calculation of
              discharge (water volume flowing past the monitoring station). The
              collection of discrete water samples requires in-stream pumps and
              automatic refrigerated water samplers with either plastic (for
              sediments and nutrients) or glass (for pesticides) bottles. The
              support systems for each station include data loggers, telemetry
              modems, power supply systems and equipment control mechanisms.
            </TextParagraph>
          </TextWrapper>
          <ParagraphImg src={siteInst} alt=""></ParagraphImg>
        </SectionAlignment>
      </ExpandableContentWrapper>
    </Wrapper>
  );
}

const ListContainer = styled.div`
  font-family: 'Lato';
  font-size: 1.5rem;
  color: #414141;
  line-height: 2rem;
  ul {
    list-style-type: disc; /* Set the list style type to 'disc' for bullet points */
    margin-left: 35px; /* Adjust the left margin as needed */
  }
`;
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
