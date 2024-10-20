import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export const AppWindow = ({ children }) => {

	const { activeContent } = useContext(AppContext);
	
  return (
    <div id="AppWindow" 
		className={`min-h-dvh max-w-[2000px] mx-auto ${
			activeContent ?  '' : 'overflow-hidden'
		}`}>
      {children}
    </div>
  );
};
