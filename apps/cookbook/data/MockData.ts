export const recipes: Recipe[] = [
  {
    image: "",
    title: "Spaghetti Carbonara",
    description:
      "A classic Italian pasta dish made with eggs, cheese, bacon, and black pepper.",
    createdBy: "Hamel",
    createdAt: "2021-09-01",
    tag: ["food"],
  },
  {
    image: "",
    title: "Chicken Alfredo",
    description:
      "A creamy pasta dish made with fettuccine, chicken, and Alfredo sauce.",
    createdBy: "Hamel",
    createdAt: "2021-09-01",
    tag: ["food"],
  },
  {
    image: "",
    title: "Chicken Parmesan",
    description:
      "A classic Italian-American dish made with breaded chicken, marinara sauce, and mozzarella cheese.",
    createdBy: "Hamel",
    createdAt: "2021-09-01",
    tag: ["food"],
  },
  {
    image: "",
    title: "Chicken Marsala",
    description:
      "A classic Italian-American dish made with chicken, mushrooms, and Marsala wine.",
    createdBy: "Hamel",
    createdAt: "2021-09-01",
    tag: ["food"],
  },
  {
    image: "",
    title: "Chicken Piccata",
    description:
      "A classic Italian-American dish made with chicken, capers, and lemon.",
    createdBy: "Hamel",
    createdAt: "2021-09-01",
    tag: ["food"],
  },
];

export type Recipe = {
  image: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  tag?: string[];
};
