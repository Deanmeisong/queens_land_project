import * as React from 'react';
import styled from 'styled-components';
import { Phone, Email } from '@carbon/icons-react';
import QLD_SVG_LOGO from 'images/qld_logo.svg';

export function Footer() {
  return (
    <Wrapper>
      <StyledHr></StyledHr>
      <FooterContent>
        <FooterRows>
          <FooterTitle>Water Quality & Investigations</FooterTitle>
          <FooterColumns>
            <LeftFooter>
              <FooterLinks>
                <FooterLinksSide>
                  <FooterSubTitle>Contact us</FooterSubTitle>
                  <span style={{ width: '90%', marginBottom: '16px' }}>
                    Get in touch for enquiries, feedback, complaints and
                    compliments.
                  </span>
                  <ContactDetails>
                    <Email color="#FFE500" size="20" />
                    <span style={{ fontWeight: '400' }}>Email:</span>{' '}
                    <a href="mailto:wqi@qld.gov.au">wqi@qld.gov.au</a>
                  </ContactDetails>
                </FooterLinksSide>
                <FooterLinksSide>
                  <Link
                    target="_blank"
                    href="https://www.des.qld.gov.au/our-department/about"
                  >
                    About us
                  </Link>
                  <Link
                    target="_blank"
                    href="https://www.des.qld.gov.au/help/legal/disclaimer"
                  >
                    Using our website
                  </Link>
                  <Link
                    target="_blank"
                    href="https://www.des.qld.gov.au/help/legal/copyright"
                  >
                    Copyright
                  </Link>
                  <Link
                    target="_blank"
                    href="https://www.des.qld.gov.au/help/legal/privacy"
                  >
                    Privacy
                  </Link>
                  <Link
                    target="_blank"
                    href="https://www.des.qld.gov.au/our-department/accessing-information/rti"
                  >
                    Right to information
                  </Link>
                  <Link
                    target="_blank"
                    href="https://www.qld.gov.au/help/accessibility"
                  >
                    Accessibility
                  </Link>
                  <Link
                    target="_blank"
                    href="https://smartjobs.qld.gov.au/jobtools/jncustomsearch.jobsearch?in_organid=14904"
                  >
                    Jobs
                  </Link>
                  <Link
                    target="_blank"
                    href="https://www.qld.gov.au/help/languages"
                  >
                    Other languages
                  </Link>
                </FooterLinksSide>
              </FooterLinks>
            </LeftFooter>
            <SectionHr />
            <RightFooter>
              <img
                alt="QLD Logo"
                src={QLD_SVG_LOGO}
                width="251.5"
                height="44"
              />
              <br />
              <br />
              Queensland Government acknowledges the Traditional Owners of the
              land and pays respect to Elders past, present and future.
              <br />
              <br />
              © The State of Queensland (Department of Environment and Science)
              2017-2023
              <br />
              <br />
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '17px',
                  textDecoration: 'underline',
                }}
              >
                <a
                  target="_blank"
                  href="https://www.qld.gov.au/"
                  rel="noreferrer"
                >
                  Queensland Government
                </a>
              </span>
            </RightFooter>
          </FooterColumns>
        </FooterRows>
      </FooterContent>
    </Wrapper>
  );
}

const ContactDetails = styled.span`
  margin-bottom: 20px !important;
  & > * {
    margin-right: 10px;
  }
`;

const Link = styled.a`
  font-size: 14px;
  font-family: 'Lato';
  text-decoration: underline;
  margin-left: 100px;
`;
const FooterColumns = styled.div`
  display: flex;
  flex-direction: row;
`;
const FooterRows = styled.div`
  display: flex;
  flex-direction: column;
`;
const FooterLinksSide = styled.div`
  max-width: 270px;
  display: flex;
  flex-direction: column;
  width: 270px;
  margin: 0 32px 20px 0;

  & > * {
    margin-bottom: 12px;
  }
`;
const FooterLinks = styled.div`
  display: flex;
  flex-direction: row;
`;
const FooterTitle = styled.div`
  font-family: 'Lato';
  margin-bottom: 32px;
  font-size: 20px;
  font-weight: bold;
  line-height: normal;
  word-spacing: normal;
`;
const FooterSubTitle = styled.div`
  font-family: 'Lato';
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
  word-spacing: normal;
`;
const Wrapper = styled.div`
  min-height: 440px;
  background: #09549f;
`;
const LeftFooter = styled.div`
  height: auto;
`;
const RightFooter = styled.div`
  font-size: 14px;
  font-family: 'Lato';
  margin: 0 64px 0 32px;
`;
const SectionHr = styled.hr`
  top: -12px !important;
  position: relative;
  height: auto;
  width: inherit;
  border: 1px solid #2573c1;
  margin-bottom: 20px !important;
`;
const FooterContent = styled.div`
  display: flex;
  width: fit-content;
  color: white;
  margin: 64px 0 0 64px;
`;
const StyledHr = styled.hr`
  width: inherit;
  border: 2px solid #6bbe27;
`;
