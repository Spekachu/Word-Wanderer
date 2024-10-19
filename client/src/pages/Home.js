import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
	return (
		<div className="min-h-screen text-white p-4 py-24 flex flex-col justify-center">
			<div class="flex flex-wrap justify-center items-center gap-4 mb-8">
				<div class="rounded-lg p-2 text-sm border border-white">Willkommen</div>
				<div class="rounded-lg p-2 text-lg border border-white">Bienvenido</div>
				<div class="rounded-lg p-2 text-2xl border border-white">Welcome</div>
				<div class="rounded-lg p-2 text-lg border border-white">Bienvenue</div>
				<div class="rounded-lg p-2 text-sm border border-white">Benvenuto</div>
			</div>
			<div className="text-center">
				<h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-8 font-pacifico">Word Wanderer</h1>
			</div>
			<div class="flex flex-wrap justify-center items-center gap-4 mb-8">
				<div class="rounded-lg p-2 text-sm border border-white">Välkommen</div>
				<div class="rounded-lg p-2 text-ld border border-white">Tervetuloa</div>
				<div class="rounded-lg p-2 text-2xl border border-white">Witamy</div>
				<div class="rounded-lg p-2 text-lg border border-white">Hoş geldiniz</div>
				<div class="rounded-lg p-2 text-sm border border-white">Добро пожаловать</div>
			</div>
			<div className="text-center">
				<Link to="/map" className="inline-block border border-white hover:bg-white text-white hover:text-slate-600 transition-colors font-bold py-2 px-4 rounded-lg text-lg">
					Explore the Word Map
				</Link>
			</div>
		</div>
	);
};

export default Home;
