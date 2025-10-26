import React from "react";

const RecipeSkeletonLoader = () => {
  return (
    <section id="recipe-list">
      <div className="container">
        <div className="mb-8 grid grid-cols-2 gap-x-5 gap-y-8 lg:mb-16 lg:grid-cols-3 xl:gap-x-12 xl:gap-y-16">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-fit max-w-[370px] flex-1 rounded-lg border border-appGray-300 bg-appGray-100/50 bg-clip-padding p-6 backdrop-blur-lg backdrop-filter"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Image Skeleton */}
              <div className="relative flex h-[300px] max-w-[330px] items-center overflow-hidden rounded-lg">
                <div className="animate-shimmer h-full w-full animate-pulse bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
              </div>

              {/* Content Skeleton */}
              <div className="mt-4">
                <div className="animate-shimmer h-8 animate-pulse rounded bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
                <div className="animate-shimmer mt-2 h-5 w-3/4 animate-pulse rounded bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
                <div className="mt-2 flex gap-2">
                  <div className="animate-shimmer h-6 w-16 animate-pulse rounded-full bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
                  <div className="animate-shimmer h-6 w-20 animate-pulse rounded-full bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
                </div>
              </div>

              {/* Button Skeleton */}
              <div className="mt-4">
                <div className="animate-shimmer h-10 w-full animate-pulse rounded-lg bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
              </div>

              {/* Author Skeleton */}
              <div className="mt-4 flex flex-1 items-center justify-start gap-3">
                <div className="flex flex-col">
                  <div className="animate-shimmer h-5 w-16 animate-pulse rounded bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
                  <div className="animate-shimmer mt-1 h-4 w-20 animate-pulse rounded bg-gradient-to-r from-appGray-200 via-appGray-100 to-appGray-200 bg-[length:200%_100%]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
