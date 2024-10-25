import React from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
	const { t } = useTranslation();
	const { set_partOfSpeech, set_cefrLevel } = useContext(AppContext);

	const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
	const partsOfSpeech = ['verb', 'noun', 'adjective'];

	return (
		<div className="min-h-screen text-white p-3 sm:p-4 py-24 flex flex-col justify-center">
				<div className="text-center">
					<h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8">
						<span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">{t('welcome')}, <br></br></span>
						<span className="font-pacifico">Wanderer</span>
					</h1>
				</div>
				<div className="text-center mb-8">
					<Link to="/map" className="inline-block border border-white hover:bg-white text-white hover:text-fuchsia-900 transition-colors font-bold py-2 px-4 rounded-lg text-lg">
						{t('home.exploreTheWordMap')}
					</Link>
				</div>
				{levels.map((level, index) => (
					<React.Fragment key={level}>
						<div className="text-center flex flex-wrap justify-center items-center gap-1 sm:gap-2 md:gap-4 mb-4">
							{partsOfSpeech.map(pos => (
								<Link
									key={`${level}-${pos}`}
									to="/map"
									className={`inline-block border border-white hover:border-fuchsia-900 hover:bg-white transition-colors font-bold py-2 px-2 md:px-4 rounded-lg text-lg ${
										index < 2 ? 'text-fuchsia-900 bg-fuchsia-50' :
										index < 4 ? 'text-orange-900 bg-orange-50' :
										'text-rose-900 bg-rose-50'
									}`}
									onClick={() => { set_partOfSpeech(pos); set_cefrLevel(level); }}
								>
									{level.toUpperCase()} {t(`partOfSpeech.${pos}_other`)}
								</Link>
							))}
						</div>
						{(index === 1 || index === 3) && (
							<div className="flex justify-center items-center">
								<hr className="mb-4 max-w-80 w-full border-white" />
							</div>
						)}
					</React.Fragment>
				))}
			</div>
		);
	};

	export default Home;
