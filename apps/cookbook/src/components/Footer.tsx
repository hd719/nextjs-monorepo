import React from "react";

import Link from "next/link";

interface FooterNavColumn {
  title: string;
  items: {
    text: string;
    link: string;
  }[];
}

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  const navigationColumns: FooterNavColumn[] = [
    {
      title: "Recipes",
      items: [
        { text: "Browse All Recipes", link: "/recipes" },
        { text: "Popular Recipes", link: "/recipes?popular=true" },
        { text: "Recent Recipes", link: "/recipes?sort=recent" },
      ],
    },
    {
      title: "Categories",
      items: [
        { text: "Breakfast", link: "/recipes?category=breakfast" },
        { text: "Lunch", link: "/recipes?category=lunch" },
        { text: "Dinner", link: "/recipes?category=dinner" },
        { text: "Desserts", link: "/recipes?category=dessert" },
      ],
    },
    {
      title: "About",
      items: [
        { text: "About", link: "/about" },
        { text: "Contact", link: "#contact" },
        { text: "Privacy Policy", link: "/privacy" },
      ],
    },
  ];

  return (
    <footer
      className={`bg-appGray-100 pb-[35px] pt-6 md:pb-8 lg:pt-14 ${className}`}
    >
      <div className="container">
        <div className="mb-12 grid grid-cols-1 gap-8 lg:mb-24 lg:grid-cols-[auto,1fr]">
          {/* Logo and Description Section */}
          <div className="lg:max-w-[320px]">
            <div className="mb-3 lg:mb-4">
              <h3 className="text-2xl font-bold tracking-[-0.41px] text-appAccent lg:text-3xl">
                Payal&apos;s Cookbook
              </h3>
            </div>
            <p className="text-xs font-medium leading-normal tracking-[-0.41px] text-appGray-500 lg:text-base">
              Discover the art of cooking with authentic recipes, cooking tips,
              and culinary inspiration. From traditional family recipes to
              modern twists on classic dishes, find your next favorite meal
              here.
            </p>
          </div>

          {/* Navigation Columns */}
          <nav className="flex flex-wrap gap-x-12 gap-y-10 lg:justify-end lg:gap-x-10 xl:gap-x-[72px]">
            {navigationColumns.map((column, index) => (
              <div key={index}>
                <div className="mb-4 text-xs font-medium leading-none tracking-[-0.41px] text-appGray-500 lg:mb-5 lg:text-[17px] lg:text-base lg:leading-none">
                  {column.title}
                </div>
                <div className="grid grid-cols-1 gap-[14px] lg:gap-4">
                  {column.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.link}
                      className="flex text-sm font-medium leading-none tracking-[-0.41px] text-appAccent transition-all duration-300 hover:translate-x-1 hover:underline focus-visible:translate-x-1 focus-visible:underline lg:text-[17px] lg:leading-none"
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Copyright Section */}
        <div className="font-medium leading-none tracking-[-0.41px] text-[#898C8A] md:flex md:items-center md:justify-between">
          <div className="flex items-center text-sm max-md:mb-3 lg:text-base lg:leading-none">
            <span>Built with ❤️</span>
          </div>
          <div className="text-xs lg:text-base lg:leading-none">
            &copy; {currentYear} Payal&apos;s Cookbook. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
