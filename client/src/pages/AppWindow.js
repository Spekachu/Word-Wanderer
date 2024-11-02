import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { WordMapProvider } from '../contexts/WordMapContext';
import WordMap from '../components/WordMap';
import ContentWindow from '../components/ContentWindow';

export const AppWindow = ({ children }) => {

	const { activeContent } = useContext(AppContext);
	
  return (
    <div id="AppWindow" 
		className={`min-h-dvh max-w-[2000px] mx-auto ${
			activeContent ?  '' : 'overflow-hidden'
		}`}>
			<WordMapProvider>
				<WordMap />
				<ContentWindow />
			</WordMapProvider>
    </div>
  );
};
