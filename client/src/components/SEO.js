import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = "arenaofchampions - Compete. Win. Dominate. | BGMI & Free Fire Tournaments",
  description = "Join arenaofchampions - India's premier gaming tournament platform. Compete in BGMI and Free Fire tournaments, win massive cash prizes, and dominate the leaderboards.",
  keywords = "aoc, harshvardhan, bgmi aoc, arenaofchampions, BGMI tournaments, Free Fire tournaments, gaming tournaments, esports, battle royale, mobile gaming, tournament platform",
  image = "https://arenaofchampions.in/og-image.jpg",
  url = "https://arenaofchampions.in",
  type = "website",
  noindex = false
}) => {
  const fullTitle = title.includes('arenaofchampions') ? title : `${title} | arenaofchampions`;
  const fullUrl = url.startsWith('http') ? url : `https://arenaofchampions.in${url}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:site_name" content="arenaofchampions" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;

