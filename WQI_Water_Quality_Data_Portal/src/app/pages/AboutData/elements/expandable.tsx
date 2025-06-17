import * as React from 'react';
import styled from 'styled-components';

export function Expandable3({ visibilitySwitch }) {
  return (
    <Wrapper2 className={visibilitySwitch ? 'showDiv' : 'hideDiv'}>
      <ExpContentHr></ExpContentHr>
      <Text2>
        The Water Quality & Investigations Quality Committee is responsible for
        developing and reviewing the quality management framework to provide
        auditable, transparent policy and procedures to govern all aspects of
        the Program.
        <br />
        <br />
        Quality assurance is also maintained using laboratories accredited by
        the National Association of Testing Authorities and the delivery of
        rigorous in-person training, to ensure that each water quality sampling
        process is performed using the same methods, skills and control in
        accordance with the Environmental Protection (Water) Policy 2009,
        Monitoring and Sampling Manual (DES 2018). WQI seek to improve our
        effectiveness and efficiency on a continuous basis to provide
        consistency and reliability of data.
      </Text2>
    </Wrapper2>
  );
}
export function Expandable2({ visibilitySwitch }) {
  return (
    <Wrapper2 className={visibilitySwitch ? 'showDiv' : 'hideDiv'}>
      <ExpContentHr></ExpContentHr>
      <Text2>
        Water level and velocity data are required for the calculation of
        discharge (water volume flowing past the monitoring station). The
        collection of discrete samples requires in-stream pumps and automatic
        refrigerated water samplers with either plastic (for sediments and
        nutrients) or glass (for pesticides) bottles.
        <br />
        <br />
        Real-time water quality probes are either installed in-stream or in an
        off-stream flow cell that is fed by an in-stream pump. The support
        systems for each station include data loggers, telemetry modems (CatM1
        or Satellite), power supply systems (typically batteries, solar panels,
        and solar charge regulators) and equipment control mechanisms.
        <br />
        <br />
        The design of these sites has been reviewed by an international expert
        panel, and is deemed to be equivalent to monitoring stations installed
        by the United States Geological Survey.
      </Text2>
    </Wrapper2>
  );
}
export function Expandable1({ visibilitySwitch }) {
  return (
    <Wrapper1 className={visibilitySwitch ? 'showDiv' : 'hideDiv'}>
      <ExpContentHr></ExpContentHr>
      <Text1>
        The number and location of sites changes regularly to meet the
        requirements of the Programs, as does the suite of parameters monitored.
        The WQI team collect water samples from waterways manually, while
        remotely operated pumps are used to collect water samples automatically.
        <br />
        <br />
        <span
          style={{
            color: '#09549F',
            fontSize: '17px',
            fontFamily: 'Lato',
            textDecoration: 'underline',
            alignSelf: 'flex-start',
          }}
        >
          Methodology
        </span>
      </Text1>
    </Wrapper1>
  );
}

const Text2 = styled.div`
  font-size: 17px;
  margin: 24px;
  line-height: 24px;
  word-spacing: normal;
  font-family: 'Lato';
`;
const Wrapper1 = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: row;
  background: #f5f5f5;
  font-weight: unset;
  font-family: 'Lato';
  line-height: normal;
  word-spacing: normal;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
`;

const Wrapper2 = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: row;
  background: #f5f5f5;
  font-weight: unset;
  font-family: 'Lato';
  line-height: normal;
  word-spacing: normal;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
`;

const Text1 = styled.div`
  font-size: 17px;
  margin: 24px;
  line-height: 24px;
  word-spacing: normal;
  font-family: 'Lato';
`;
const ExpContentHr = styled.hr`
  height: 100%;
  margin: 0;
  border: 2px solid #6bbe27;
`;
