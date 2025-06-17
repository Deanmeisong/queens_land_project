import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`

@font-face {
  font-family: 'MetaProBold';
  src: local("MetaProBold"), url('fonts/MetaProBold.ttf') format('truetype');
}

  html,
  body, a {
    height: 100%;
    /* width: 100%; */
    overflow-x: hidden;
    font-family: 'Lato';
    font-size: 14px;
    word-spacing: 0.25px;
    line-height: 20px;
  }

  a{
    color: white;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    width: auto;
  }

  #root {
    min-height: 100%;
    height: calc(100vh - 120px - 36px - 60px);
    width: fit-content;
    --calcite-code-family: 'Lato';
    --calcite-sans-family: 'Lato';
    --calcite-ui-blue-1: red;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }

  input, select {
    font-family: inherit;
    font-size: inherit;
  }

  .esri-view .esri-view-surface--touch-none:focus::after {
    outline: none !important;
  }

  .custom-switch {
        --calcite-ui-brand: #6BBE27;
        --calcite-ui-brand-hover: #6BBE27;
        --calcite-ui-brand-press: #6BBE27;
    }

  .SectionTitle {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    margin: 24px 0 0 0;
    flex-direction: row;
  }

  .showAlert{
    opacity: 1 !important;
    -webkit-transition: opacity 0.3s ease-in-out;
    -moz-transition: opacity 0.3s ease-in-out;
    -o-transition: opacity 0.3s ease-in-out;
    transition: opacity 0.3s ease-in-out;
  }
  /* display: initial; */
  .showDiv{
    opacity : 1;
    visibility: visible;
    // height: 100%;
    -webkit-transition: opacity 0.3s ease-in-out;
    -moz-transition: opacity 0.3s ease-in-out;
    -o-transition: opacity 0.3s ease-in-out;
    transition: opacity 0.3s ease-in-out;
    position: relative;
  }
  /* display: none; */
  .hideDiv{
    opacity : 0;
    visibility: hidden;
    height: 0px;
    -webkit-transition: opacity 0.3s ease-in-out;
    -moz-transition: opacity 0.3s ease-in-out;
    -o-transition: opacity 0.3s ease-in-out;
    transition: opacity 0.3s ease-in-out;
    position: absolute;
}

.custom-date-picker input, .cds--dropdown, .cds--list-box {
  border: 1px solid gray;
  width: auto;
  font-family: 'Lato' !important;
}
.cds--dropdown span, .cds--list-box span{
  font-family: 'Lato' !important;
  font-size: 14px;
}
.cds--date-picker{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}
.cds--date-picker svg, .cds--list-box svg{
  fill: #008635;
}
.cds--list-box__field--wrapper {
  border-bottom: 2px solid lightgray;
}

.cds--multi-select__wrapper {
  position: sticky;
}

.yearsRange {
  display: grid;
  z-index: 5;
}

.flatpickr-calendar > * {
  background-color: white;
}

.hide-resize-observer {
  display: none !important;
}
.collapseButton {
  /* left: 0px !important; */
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
}
.cds--loading__stroke {
  stroke: var(--cds-interactive,#00619b);
  stroke-dashoffset: 52.527552;
}
.active{
  background: #f5f5f5;
  z-index: 999;
  bottom: 0;
  font-weight: bold;
  padding: 0.625rem 0.75rem;
  color: #03213F;
}
`;
