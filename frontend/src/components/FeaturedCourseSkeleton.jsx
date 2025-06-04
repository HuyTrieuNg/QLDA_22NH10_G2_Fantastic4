import React from "react";

const FeaturedCourseSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
    <div className="relative">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-600"></div>
      <div className="absolute top-2 right-2 bg-gray-400 dark:bg-gray-500 w-16 h-5 rounded"></div>
    </div>
    <div className="p-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
      <div className="flex items-center mb-4">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"
            ></div>
          ))}
        </div>
        <div className="ml-2 h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
        <div className="mx-2 h-4 bg-gray-300 dark:bg-gray-600 rounded w-1"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  </div>
);

export default FeaturedCourseSkeleton;
