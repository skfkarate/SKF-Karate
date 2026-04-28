import React from 'react';
import './skeleton.css';

type SkeletonDimension = number | string

type SkeletonCommonProps = {
  className?: string
  style?: React.CSSProperties
}

// Single line of text — use width prop to match real text length
export const SkeletonLine = ({
  width = '100%',
  height = 14,
  className = '',
  style = {},
}: SkeletonCommonProps & { width?: SkeletonDimension; height?: SkeletonDimension }) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{ width, height, borderRadius: 4, ...style }}
    aria-hidden="true"
  />
);

// Circle — for avatars, icons, status dots
export const SkeletonCircle = ({
  size = 40,
  className = '',
  style = {},
}: SkeletonCommonProps & { size?: SkeletonDimension }) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{ width: size, height: size, borderRadius: '50%', ...style }}
    aria-hidden="true"
  />
);

// Rectangle block — for images, cards, banners, thumbnails
export const SkeletonBlock = ({
  width = '100%',
  height = 200,
  radius = 8,
  className = '',
  style = {},
}: SkeletonCommonProps & { width?: SkeletonDimension; height?: SkeletonDimension; radius?: SkeletonDimension }) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{ width, height, borderRadius: radius, ...style }}
    aria-hidden="true"
  />
);

// Button-shaped skeleton
export const SkeletonButton = ({
  width = 120,
  height = 38,
  className = '',
  style = {},
}: SkeletonCommonProps & { width?: SkeletonDimension; height?: SkeletonDimension }) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{ width, height, borderRadius: 8, ...style }}
    aria-hidden="true"
  />
);
