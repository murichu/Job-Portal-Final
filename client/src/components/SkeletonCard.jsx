import React from "react";

/**
 * Skeleton placeholder shown while job cards are loading.
 * Matches the exact shape of JobCard.
 */
const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 p-5 rounded-xl animate-pulse">
    {/* Company logo placeholder */}
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-gray-200" />
    </div>

    {/* Title */}
    <div className="h-4 bg-gray-200 rounded-md w-3/4 mt-1 mb-1" />
    {/* Company name */}
    <div className="h-3 bg-gray-100 rounded-md w-1/2 mb-3" />

    {/* Tags */}
    <div className="flex gap-2 mb-3">
      <div className="h-6 bg-gray-100 rounded-full w-24" />
      <div className="h-6 bg-gray-100 rounded-full w-20" />
    </div>

    {/* Description lines */}
    <div className="space-y-1.5 mb-4">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
    </div>

    {/* Buttons */}
    <div className="flex gap-2 mt-auto">
      <div className="h-9 bg-gray-200 rounded-lg flex-1" />
      <div className="h-9 bg-gray-100 rounded-lg w-20" />
    </div>
  </div>
);

/**
 * Renders a grid of N skeleton cards.
 */
export const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
