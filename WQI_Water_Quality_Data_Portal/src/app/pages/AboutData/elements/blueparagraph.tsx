import * as React from 'react';
import styled from 'styled-components';
import coverImg from 'images/homepage_cover.png';

export function BlueParagraph() {
  return (
    <Wrapper>
      <CoverTextWrapper>
        <TextTitle as="h1">Water Quality & Investigations</TextTitle>
        <Text as="p">
          An expert team delivering key water quality monitoring programs in
          Queensland, Australia.
        </Text>
      </CoverTextWrapper>
      <CoverImg src={coverImg} alt=""></CoverImg>
    </Wrapper>
  );
}

const CoverImg = styled.img`
  width: 528px;
  height: 464px;
  margin: 0 64px 0 0 !important;
`;
const CoverTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-right: 32px;
`;
const TextTitle = styled.h1`
  line-height: 3.25rem;
  word-spacing: normal;
  font-weight: 700;
  font-size: 2.5rem;
  font-family: 'Lato';
  color: white;
  margin-bottom: 24px;
`;
const Text = styled.p`
  line-height: 2rem;
  word-spacing: normal;
  font-weight: unset;
  font-family: 'Lato';
  font-size: 1.5rem;
  color: white;
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 464px;
  background: #05325f;
  margin: 0 0 64px 0;
  justify-content: space-between;

  > * {
    margin: 0 64px 0 64px;
  }
`;
