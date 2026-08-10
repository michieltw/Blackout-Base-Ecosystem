import React from 'react';

interface HouseLeagueLogoProps {
  className?: string;
  size?: number; // width and height in px
}

export const HouseLeagueLogo: React.FC<HouseLeagueLogoProps> = ({ className = '', size = 120 }) => {
  return (
    <img
      src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/house_league.png?v=1783714846"
      alt="Groningen House League Logo"
      style={{ width: `${size}px`, height: 'auto' }}
      className={`object-contain select-none ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
