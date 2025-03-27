import React from 'react';
import useAuthRedirect from '../hooks/useAuthRedirect';
import NewsHero from '../components/NewsHero';
import NewsContent from '../components/NewsContent';

const News = () => {
  useAuthRedirect();

  return (
    <>
      <NewsHero/>
      <NewsContent/>
    </>
  )
}

export default News