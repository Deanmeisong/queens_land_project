import React from 'react';
import styled from 'styled-components';

export default function LocationSelector() {
  return (
    <div style={{ margin: '24px 0 0 0' }}>
      <LocationTitle>Location</LocationTitle>
    </div>
  );
}

const LocationTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;
