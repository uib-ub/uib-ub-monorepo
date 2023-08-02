type NavItemProps = {
  name: string;
  link: string;
};

export type NavProps = {
  site: {
    title: string;
    description: string;
  };
  mainNav: NavItemProps[];
  secondaryNav: NavItemProps[];
};

export const nav: NavProps = {
  "site": {
    "title": "My Site",
    "description": "This is my site"
  },
  "mainNav": [
    {
      "name": "Home",
      "link": "/"
    },
    {
      "name": "Search",
      "link": "/search"
    },
    {
      "name": "Samla arkiv",
      "link": "/samla-collections"
    },
    {
      "name": "Example item",
      "link": "/items/ubb-ms-0028"
    }
  ],
  "secondaryNav": [
    {
      "name": "Blog",
      "link": "/blog"
    },
    {
      "name": "Portfolio",
      "link": "/portfolio"
    },
    {
      "name": "Resume",
      "link": "/resume"
    }
  ]
}