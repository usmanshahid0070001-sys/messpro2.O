import React from 'react';
import { useSEO, type SEOProps } from '@/hooks/useSEO';

export const SEOHead: React.FC<SEOProps> = (props) => {
  useSEO(props);
  return null;
};

export default SEOHead;
