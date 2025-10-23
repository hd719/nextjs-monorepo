import { FC } from "react";

interface IPagination {
  recipesPerPage: number;
  totalRecipes: number;
  paginate: (_number: number) => void;
  currentPage: number;
}

export const Pagination: FC<IPagination> = ({
  recipesPerPage,
  totalRecipes,
  paginate,
  currentPage: _currentPage,
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalRecipes / recipesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-wrap justify-center py-10">
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className="transition-color mx-4 my-2 border-2 border-neutral-300 px-4 py-2 text-xl duration-300 focus-within:opacity-50 hover:bg-neutral-300 hover:text-neutral-800"
        >
          {number}
        </button>
      ))}
    </div>
  );
};
