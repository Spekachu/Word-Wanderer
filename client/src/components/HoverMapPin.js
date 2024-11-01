import React, { useContext, useEffect } from 'react';
import { IoLocationSharp  } from "react-icons/io5";
import { AppContext } from '../contexts/AppContext';

const HoverMapPin = () => {
  const { pinPosition, hoverPinPosition } = useContext(AppContext);

  const arePositionsEqual = () => {
    if (!hoverPinPosition && !pinPosition) return true;
    if (!hoverPinPosition && pinPosition || !pinPosition && hoverPinPosition) return false;
		
    return hoverPinPosition.x === pinPosition.x && hoverPinPosition.y === pinPosition.y;
  };

  return (
    <div
      className="hidden md:block fixed text-5xl text-orange-500/50 origin-bottom drop-shadow-[1px_-1px_0_#fff] pointer-events-none animate-wobble will-change-transform"
      style={{
        top: hoverPinPosition ? `${hoverPinPosition.y}` : pinPosition ? `${pinPosition.y}` : '0%',
        left: hoverPinPosition ? `${hoverPinPosition.x}` : pinPosition ? `${pinPosition.x}` : '0%',
        transform: 'translate(-50%, -100%) rotateZ(15deg)',
        transition: hoverPinPosition && pinPosition ? `
          top 0.25s cubic-bezier(.5,2,.8,1),
          left 0.25s cubic-bezier(.4,0,.2,1),
					opacity 0.5s linear
        ` : `
          top 0.25s cubic-bezier(.5,2,.8,1),
          left 0.25s cubic-bezier(.4,0,.2,1),
					opacity 0.25s linear
        `,
				opacity: !arePositionsEqual() ? '1' : '0',
      }}
    >
      <IoLocationSharp />
    </div>
  );
};

export default HoverMapPin;
