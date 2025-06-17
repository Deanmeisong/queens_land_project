import * as React from 'react';
import styled from 'styled-components';
import dataCttrl from 'images/data_control.png';

export function DataControl() {
  return (
    <Wrapper>
      <ExpandableContentWrapper>
        <SectionAlignment>
          <ParagraphImg src={dataCttrl} alt=""></ParagraphImg>
          <TextWrapper>
            <TitleParagraph as="h2">
              Quality Assurance and Quality Control
            </TitleParagraph>
            <TextParagraph as="p">
              All Programs are underpinned by a comprehensive quality management
              framework that meets appropriate Queensland, Australian and
              International Standards. The framework ensures high standards in
              the collection, management, and delivery of water quality data,
              data interpretation, advice, and research.
              <br />
              <br />
              A Quality Committee composed of Program managers and quality
              assurance specialists develop and review the quality management
              framework regularly to provide auditable, transparent policy and
              procedures.
              <br />
              <br />
              Quality assurance is facilitated by using laboratories accredited
              by the National Association of Testing Authorities (Australia) and
              rigorous in-person training which ensures that each sampling
              process is performed using the same methods, skills, and control
              in accordance with the Queensland Environmental Protection (Water)
              Policy 2009 and Monitoring and Sampling Manual (DES 2018).
              <br />
              <br />
              The team seeks to improve its effectiveness and efficiency on a
              continuous basis to provide consistency and reliability of data.
            </TextParagraph>
          </TextWrapper>
        </SectionAlignment>
      </ExpandableContentWrapper>
    </Wrapper>
  );
}

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
const ParagraphImg = styled.img`
  width: 35rem;
  // height: 385px;
  margin: 64px 32px 64px 64px !important;
  align-items: center;
  justify-content: center;
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
