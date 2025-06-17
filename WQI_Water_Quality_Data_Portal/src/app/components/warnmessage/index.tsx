import React from 'react';
import styled from 'styled-components';
import { WarningAlt, Close, CloseFilled } from '@carbon/icons-react';
import EsriDESConfig from '../esri/appConfig';

export default function WarnMessage({ setShowMessage }) {
  return (
    <MessageWrapper>
      <MessageContent>
        <span style={{ marginRight: '12px' }}>
          <WarningAlt size="20" />
        </span>
        <span style={{ marginRight: '16px' }}>
          Reports with over {EsriDESConfig.DownloadLimit.toLocaleString()}{' '}
          records exceed the download limit. Please refine your search by
          applying additional filters to proceed with the download.
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
  background-color: #ffcc2c;
  padding: 16px;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
`;
