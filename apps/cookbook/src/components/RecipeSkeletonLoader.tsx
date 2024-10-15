import React from "react";

const RecipeSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col rounded-lg border border-gray-300 bg-white/20 p-6 backdrop-blur-lg backdrop-filter"
        >
          <div className="h-[300px] rounded-lg bg-gray-200"></div>
          <div className="mt-4">
            <div className="h-8 rounded bg-gray-200"></div>
            <div className="mb-4 mt-2 h-5 w-3/4 rounded bg-gray-200"></div>
            <div className="mt-2 h-5 w-1/2 rounded bg-gray-200"></div>
          </div>
          <div className="mt-4 flex items-center justify-start gap-3">
            <div className="flex flex-col">
              <div className="h-6 w-2/3 rounded bg-gray-200"></div>
              <div className="mt-1 h-4 w-1/3 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="flex-center mt-5 gap-4 border-t border-gray-100 pt-3">
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            <div className="h-4 w-1/3 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipeSkeletonLoader;

// Notes: whats going on here...

// We have our outer container
// div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 xl:grid-cols-3">
// grid: This class enables CSS Grid layout.
// grid-cols-1: Sets the default number of columns to 1 (for small screens).
// gap-6: Sets the spacing between grid items.
// py-4: Adds vertical padding.
// md:grid-cols-2: At medium screen sizes, the layout changes to 2 columns.
// xl:grid-cols-3: At extra-large screen sizes, it changes to 3 columns

// flex animate-pulse flex-col rounded-lg border border-gray-300 bg-white/20 p-6 backdrop-blur-lg backdrop-filter
// flex flex-col: Uses Flexbox to arrange child elements in a column.
// rounded-lg: Adds rounded corners.
// border border-gray-300: Adds a border with a light gray color.
// bg-white/20: Sets a semi-transparent white background.
// p-6: Adds padding inside the card.
// animate-pulse: Adds a pulsing animation to create a loading effect.
// backdrop-blur-lg backdrop-filter: Applies a blur effect to the background, enhancing the visual quality.

// <div className="h-[300px] bg-gray-200 rounded-lg"></div>
// h-[300px]: Sets a fixed height for the placeholder.
// bg-gray-200: Gives it a light gray color to indicate that it is a placeholder.
// rounded-lg: Applies rounded corners.
