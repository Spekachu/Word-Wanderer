import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center mt-48 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">Welcome, Word Wanderer</h1>
      <p className="text-xl mb-6">Go forth and explore</p>
      <Link to="/map" className="border border-white hover:bg-white text-white hover:text-slate-600 transition-colors font-bold py-2 px-4 rounded-lg">
        Go to Word Map
      </Link>
    </div>
  );
};

export default Home;