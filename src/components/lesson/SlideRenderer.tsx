'use client';

import { SlideRegistry } from '@/components/slides';
import type { Slide } from '@/lessons/types';

export default function SlideRenderer({ slide }: { slide: Slide | null }) {
  if (!slide) return null;

  const SlideComponent = SlideRegistry[slide.type] as
    | ((props: Slide['props']) => JSX.Element)
    | undefined;

  if (!SlideComponent) {
    return <p>Slide not found.</p>;
  }

  return <SlideComponent {...(slide.props as Slide['props'])} />;
}
