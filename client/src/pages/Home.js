import React from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useContext } from 'react';

const Home = () => {
	const { set_partOfSpeech, set_cefrLevel } = useContext(AppContext);
	return (
		<div className="min-h-screen text-white p-4 py-24 flex flex-col justify-center">
			<div className="text-center">
				<h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8"><span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Welcome, <br></br></span> <span className="font-pacifico">Wanderer</span></h1>
			</div>
			<div className="text-center mb-8">
				<Link to="/map" className="inline-block border border-white hover:bg-white text-white hover:text-fuchsia-950 transition-colors font-bold py-2 px-4 rounded-lg text-lg">
					Explore the Word Map
				</Link>
			</div>
			<div className="text-center flex flex-wrap justify-center items-center gap-4 mb-4">
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-fuchsia-900 bg-fuchsia-50"
				onClick={() => { set_partOfSpeech("verb"); set_cefrLevel("a1"); }}>
					A1 Verbs
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-fuchsia-900 bg-fuchsia-50"
				onClick={() => { set_partOfSpeech("noun"); set_cefrLevel("a1"); }}>
					A1 Nouns
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-fuchsia-900 bg-fuchsia-50"
				onClick={() => { set_partOfSpeech("adjective"); set_cefrLevel("a1"); }}>
					A1 Adjectives
				</Link>
			</div>
			<div className="text-center flex flex-wrap justify-center items-center gap-4 mb-4">
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-fuchsia-900 bg-fuchsia-100"
				onClick={() => { set_partOfSpeech("verb"); set_cefrLevel("a2"); }}>
					A2 Verbs
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-fuchsia-900 bg-fuchsia-100"
				onClick={() => { set_partOfSpeech("noun"); set_cefrLevel("a2"); }}>
					A2 Nouns
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-fuchsia-900 bg-fuchsia-100"
				onClick={() => { set_partOfSpeech("adjective"); set_cefrLevel("a2"); }}>
					A2 Adjectives
				</Link>
			</div>
			<div className="flex justify-center items-center">
				<hr className="mb-4 max-w-80 w-full border-white" />
			</div>
			<div className="text-center flex flex-wrap justify-center items-center gap-4 mb-4">
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-orange-900 bg-orange-50"
				onClick={() => { set_partOfSpeech("verb"); set_cefrLevel("b1"); }}>
					B1 Verbs
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-orange-900 bg-orange-50"
				onClick={() => { set_partOfSpeech("noun"); set_cefrLevel("b1"); }}>
					B1 Nouns
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-orange-900 bg-orange-50"
				onClick={() => { set_partOfSpeech("adjective"); set_cefrLevel("b1"); }}>
					B1 Adjectives
				</Link>
			</div>
			<div className="text-center flex flex-wrap justify-center items-center gap-4 mb-4">
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-orange-900 bg-orange-100"
				onClick={() => { set_partOfSpeech("verb"); set_cefrLevel("b2"); }}>
					B2 Verbs
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-orange-900 bg-orange-100"
				onClick={() => { set_partOfSpeech("noun"); set_cefrLevel("b2"); }}>
					B2 Nouns
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-orange-900 bg-orange-100"
				onClick={() => { set_partOfSpeech("adjective"); set_cefrLevel("b2"); }}>
					B2 Adjectives
				</Link>
			</div>
			<div className="flex justify-center items-center">
				<hr className="mb-4 max-w-80 w-full border-white" />
			</div>
			<div className="text-center flex flex-wrap justify-center items-center gap-4 mb-4">
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-rose-900 bg-rose-50"
				onClick={() => { set_partOfSpeech("verb"); set_cefrLevel("c1"); }}>
					C1 Verbs
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-rose-900 bg-rose-50"
				onClick={() => { set_partOfSpeech("noun"); set_cefrLevel("c1"); }}>
					C1 Nouns
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-rose-900 bg-rose-50"
				onClick={() => { set_partOfSpeech("adjective"); set_cefrLevel("c1"); }}>
					C1 Adjectives
				</Link>
			</div>
			<div className="text-center flex flex-wrap justify-center items-center gap-4 mb-4">
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-rose-900 bg-rose-100"
				onClick={() => { set_partOfSpeech("verb"); set_cefrLevel("c2"); }}>
					C2 Verbs
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-rose-900 bg-rose-100"
				onClick={() => { set_partOfSpeech("noun"); set_cefrLevel("c2"); }}>
					C2 Nouns
				</Link>
				<Link to="/map" className="inline-block border border-white hover:bg-white transition-colors font-bold py-2 px-4 rounded-lg text-lg text-rose-900 bg-rose-100"
				onClick={() => { set_partOfSpeech("adjective"); set_cefrLevel("c2"); }}>
					C2 Adjectives
				</Link>
			</div>
		</div>
	);
};

export default Home;
