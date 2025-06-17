import React from 'react';
import styled from 'styled-components';
import { InformationSquare, Close, CloseFilled } from '@carbon/icons-react';

export default function InfoMessage({ setShowMessage }) {
  return (
    <MessageWrapper>
      <MessageContent>
        <span style={{ marginRight: '12px' }}>
          <InformationSquare size="20" />
        </span>
        <span style={{ marginRight: '16px' }}>
          If your search yielded no results or too many results, refine your
          criteria by applying additional filters for better results.
        </span>
        <span>
          <CloseWrapper onClick={setShowMessage}>
            <Close size="24" style={{ color: 'black' }} />
            <CloseFilled size="24" style={{ color: '#F5F5F5' }} />
          </CloseWrapper>
        </span>
      </MessageContent>
    </MessageWrapper>
  );
}

const CloseWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * {
    grid-row-start: 1;
    grid-column-start: 1;
  }
`;
const MessageContent = styled.div`
  display: flex;
  flex-direction: row;
  width: auto;
`;

const MessageWrapper = styled.div`
  background-color: #e5eef5;
  padding: 16px;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
`;
