// appConfig.ts
import EsriDESConfigInterface from 'types/ESRIConfig';

// Load the appropriate configuration based on the environment
const loadConfig = (): EsriDESConfigInterface => {
  console.log(process.env.REACT_APP_ENV);
  if (process.env.REACT_APP_ENV === 'production') {
    return require('./esriconfig.prod').default;
  } else {
    return require('./esriconfig.dev').default;
  }
};

export default loadConfig();
