import React, { useContext } from 'react';
import { IoLocationSharp  } from "react-icons/io5";
import { AppContext } from '../contexts/AppContext';

const MapPin = () => {
  const { selectedWord, pinPosition } = useContext(AppContext);

  return (
    <div
      className="fixed text-5xl text-orange-500 origin-bottom drop-shadow-[1px_-1px_0_#fff] pointer-events-none"
      style={{
        top: pinPosition ? `${pinPosition.y}` : '0',
        left: pinPosition ? `${pinPosition.x}` : '0',
        transform: 'translate(-50%, -100%) rotateZ(15deg)',
        transition: `
          top 0.25s cubic-bezier(.5,2,.8,1),
          left 0.25s cubic-bezier(.4,0,.2,1),
					opacity 0.25s linear
        `,
				opacity: pinPosition ? '1' : '0',
      }}
    >
      <IoLocationSharp  />
    </div>
  );
};

export default MapPin;