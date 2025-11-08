'use client';

import React from 'react';
import type { Slide } from '@/lessons/types';
type SlideRendererProps = {
  slide: Slide;
};

export default function SlideRenderer({ slide }: SlideRendererProps) {
  if (!slide) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="max-w-3xl text-center px-6 py-8">
        {slide.title && (
          <h2 className="text-3xl font-semibold mb-4">{slide.title}</h2>
        )}
        {slide.subtitle && (
          <p className="text-lg text-gray-600 mb-4">{slide.subtitle}</p>
        )}
        {slide.content && (
          <p className="text-base leading-relaxed">{slide.content}</p>
        )}
      </div>
    </div>
  );
}
