// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

import { ESRIDataState } from 'app/components/esri/slice/types';

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
export interface RootState {
  esriData?: ESRIDataState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}
