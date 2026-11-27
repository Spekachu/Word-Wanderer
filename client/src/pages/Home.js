import React from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {

	const { isLoggedIn, isDemoMode } = useAuth();
	const { t } = useTranslation();
	const { set_partOfSpeech, set_cefrLevel } = useContext(AppContext);

	const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
	const partsOfSpeech = ['verb', 'noun', 'adjective'];

	return (
		<div className="max-w-screen-lg mx-auto min-h-screen text-white pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] sm:pl-[calc(2rem+env(safe-area-inset-left)] sm:pr-[calc(2rem+env(safe-area-inset-right)] pt-20 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col justify-center">
				<header className="text-center">
					<h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8">
						<span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">{t('welcome')}, <br></br></span>
						<span className="font-pacifico">Wanderer</span>
					</h1>
					<p className="mt-2 text-lg text-balance">Your interactive, personalized language-learning app</p>
    
				</header>
				<div className="text-center mt-4">
					<Link to="/map" className="bg-white/10 shadow-lg inline-block border border-white hover:bg-white text-white hover:text-rose-900 transition-colors font-bold py-2 px-4 rounded-lg text-lg">
						{t('home.exploreTheWordMap')}
					</Link>
					{isDemoMode ? (
						<p className="mt-4 max-w-xl mx-auto text-sm bg-white/10 border border-white/25 rounded-lg px-4 py-2 text-orange-100">
							Running in <span className="font-semibold text-orange-300">Demo Mode</span> — no account needed. Your discovered words, emoji stickers, and highlights are saved locally in your browser.
						</p>
					) : (!isLoggedIn && (
					<div className='mt-4 gap-2 flex justify-center'>
						<Link to="/login" className="bg-white/10 shadow-lg inline-block border border-white hover:bg-white text-white hover:text-rose-900 transition-colors font-bold py-2 px-4 rounded-lg text-lg">
							{t('menu.login')}
						</Link>
						<Link to="/register" className="bg-white/10 shadow-lg inline-block border border-white hover:bg-white text-white hover:text-rose-900 transition-colors font-bold py-2 px-4 rounded-lg text-lg">
							{t('menu.register')}
						</Link>
					</div>
					))}
				</div>
				<main className="py-12">
					<section className="text-center max-w-3xl mx-auto mb-12">
						<h2 className="text-3xl font-semibold text-orange-300">Start Your Language Journey</h2>
						<p className="mt-4 text-lg text-balance">Create a profile to explore words across a beautifully interactive word map.</p>
					</section>

					<section className="grid md:grid-cols-2 gap-8">
						<div className="bg-white/10 p-6 shadow-lg rounded-lg">
							<h3 className="text-2xl font-semibold text-orange-300">Discover New Words</h3>
							<p className="mt-2 text-pretty">Explore vocabulary at your own pace, finding new words that match your learning level and interests using the list filters (language, level, and part of speech).</p>
							<img className='mt-2 rounded-lg' src="/media/filters.png" alt="Screenshot of the list filters" />
						</div>

						<div className="bg-white/10 p-6 shadow-lg rounded-lg">
							<h3 className="text-2xl font-semibold text-orange-300"><span className='bg-yellow-100 p-1 text-orange-500'>Personalize</span> Your Words</h3>
							<p className="mt-2 text-pretty">Make each word your own by adding sticker emojis and highlights that stand out and make them easier to remember.</p>
							<img className='mt-2 rounded-lg' src="/media/emoji-picker.png" alt="Screenshot of the emoji picker" />
						</div>
					</section>

					<section>
						<p className='text-lg text-center my-8 text-pretty'>Fill out your word map and make it your own!</p>
						<img className='w-full sm:hidden' src="/media/demo-usecase-mobile.png" alt="Screenshot of a filled out word map" />
						<img className='w-full hidden sm:block' src="/media/demo-usecase.png" alt="Screenshot of a filled out word map" />
					</section>

					<section className="my-12 text-center">
						<h2 className="text-3xl font-semibold text-orange-300">Why Choose Word Wanderer?</h2>
						<p className="mt-4 text-lg text-balance">With Word Wanderer, learning vocabulary becomes a visual, memorable experience. Each interaction helps reinforce words, making them easier to recall in real-world settings.</p>
					</section>

					<p className='my-6 text-center text-lg text-pretty'>Take a shortcut with one of the links below:</p>
					{levels.map((level, index) => (
						<React.Fragment key={level}>
							<div className="text-center flex flex-wrap justify-center items-center gap-1 sm:gap-2 md:gap-4 mb-4">
								{partsOfSpeech.map(pos => (
									<Link
										key={`${level}-${pos}`}
										to="/map"
										className={`shadow-lg inline-block border border-white hover:border-rose-900 hover:bg-white transition-colors font-bold py-2 px-2 md:px-4 rounded-lg text-lg ${
											index < 2 ? 'text-fuchsia-950 bg-fuchsia-300' :
											index < 4 ? 'text-orange-950 bg-orange-300' :
											'text-rose-950 bg-rose-300'
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

				</main>

				<footer className="bg-white/10 shadow-lg rounded-lg py-6 text-center text-pretty">
					<p>&copy; 2024 Word Wanderer. All rights reserved.</p>
				</footer>
			</div>
		);
	};

	export default Home;
