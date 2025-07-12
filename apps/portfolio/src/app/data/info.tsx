import { Icons } from "@/app/components/Icons";

export const DATA = {
  name: "Hamel Desai",
  initials: "HD",
  url: "https://hameldesai.com",
  location: "NJ",
  description: "Full time Engineer, Husband, and Dog Dad",
  avatarUrl: "/me.png",
  summary: `I'm a **Senior FullStack Software Engineer** based in New Jersey, currently at [Blaze AI](https://www.blaze.ai).

  I've worked across a range of companies, from startups to medium/large corporations, and enjoy solving complex problems while continuously improving my skills. I'm passionate about delivering high-quality software and exploring new challenges.

  ### Blaze AI:

  At **[Blaze AI](https://www.blaze.ai/)**, we are building an agentic virtual marketer capable of autonomously creating, scheduling, and publishing content across platforms like **Instagram**, **Facebook**, **LinkedIn**, **TikTok**, **YouTube**, **X (formerly Twitter)**, **Mailchimp**, **Shopify**, and **WordPress**. Our goal is to help creators and businesses scale their reach with minimal manual effort powered by smart automation, deep integrations, and intelligent brand understanding. Blaze can generate a complete **Brand Kit** from a user's website-extracting logos, colors, and tone-to create a tailored **Brand Profile** that drives consistent, on-brand content across every platform.

  ### Things I've done:

  I led engineering efforts across integrations and DevOps to enable Blaze’s AI to act as a fully autonomous marketer. I implemented secure and scalable **OAuth flows** in **React** (Redux + TanStack Query) and built robust **Ruby on Rails** services to support publishing actions like uploading YouTube Shorts, posting media-rich tweets, sending Mailchimp campaigns, and publishing blog posts. These systems allowed users to connect their accounts once and let Blaze handle the rest.

  Improved reliability across external APIs, I introduced **Sidekiq job workflows** backed by **Redis queues**, with custom retry logic and platform-specific **rate limiting**. This significantly reduced job failures and improved success rates across all supported platforms, making the system more dependable and resilient.

  On the infrastructure side, I provisioned a dedicated **QA environment** using **Terraform** and **AWS**, enabling engineers to test features in isolated environments without conflicts. I also containerized our full stack using **Docker** and created a production-like **docker-compose** setup, drastically improving local development and onboarding time.

  Beyond feature work, I collaborated with the design and mobile teams to ship mobile-optimized user flows for users without access to the iOS app-enhancing accessibility across devices. I continue to focus on developer experience, CI efficiency, and infrastructure scalability to ensure Blaze can grow without sacrificing speed or quality.

  ### Outside of tech:
  - Currently pursuing a **Master of Engineering** in Software Engineering / Engineering Management at **Stevens Institute of Technology**
  - I enjoy working out, golfing, hanging out with friends
  - At the moment building a cookbook application for my wife here is the repo: [Cookbook](https://github.com/hd719/nextjs-monorepo/blob/main/apps/cookbook/README.md) - **WIP**`,

  work: [
    {
      company: "Blaze AI",
      badges: [],
      href: "https://www.blaze.ai",
      location: "Remote",
      title: "Senior FullStack Software Engineer",
      logoUrl: "/blaze.png",
      start: "March 2025",
      end: "",
      description: "",
    },
    {
      company: "Axio",
      badges: [],
      href: "https://axio.com",
      location: "Remote",
      title: "Software Engineer",
      logoUrl: "/axio.svg",
      start: "October 2022",
      end: "March 2025",
      description:
        "At Axio, I contributed to our Axio360 CRQ platform, helping clients assess cyber risk using frameworks like C2M2 v2.1, CIS Controls, and NIST CSF. I helped build a new client-facing web app with Next.js, TypeScript, and TurboRepo in a unified monorepo, improving code consistency and onboarding. On the infrastructure side, I provisioned modular AWS/GCP environments with Terraform and automated CI/CD pipelines in Azure DevOps using Docker-based agents and Datadog for real-time monitoring—enabling faster, more reliable deployments across our Kubernetes clusters.",
    },
    {
      company: "Rightway Healthcare",
      href: "https://rightwayhealthcare.com",
      badges: [],
      location: "New York City, NY",
      title: "Software Engineer",
      logoUrl: "/rightway.jpg",
      start: "June 2020",
      end: "September 2022",
      description:
        "At Rightway, I led the redesign of the navigation web and mobile application using modern technologies like TypeScript, React, and GraphQL, enhancing user experience and interaction with healthcare navigators. I implemented an in-app chat messaging system and integrated deep linking to improve user engagement across platforms. Additionally, I developed a backend application for member management and created an admin dashboard to streamline customer success operations. I also played a key role in implementing agile methodologies, including maintaining the product backlog, prioritizing features with stakeholders, and leading various scrum processes to ensure efficient project delivery.",
    },
    {
      company: "The Tylt (Advance Local)",
      href: "https://thetylt.com/",
      badges: [],
      location: "New York City, NY",
      title: "Software Developer",
      logoUrl: "/tylt.jpg",
      start: "March 2018",
      end: "June 2020",
      description:
        "At TheTylt, I developed an isomorphic JavaScript application using React, Redux, and Express.js, implementing complex user interfaces and responsive web design techniques for improved performance across devices. I enhanced code quality through unit and integration testing with Jest and NightWatchJS, while also setting up analytics and A/B testing using Google Optimize to test out different UI. Additionally, I established staging environments with Jenkins for efficient testing and quality assurance, and collaborated with the product team using JIRA for effective project management and feature organization.",
    },
    {
      company: "Clause (Aquired by DocuSign)",
      href: "https://www.docusign.com/partner/clause",
      badges: [],
      location: "New York City, NY",
      title: "Software Engineer",
      logoUrl: "/clause.png",
      start: "January 2017",
      end: "March 2018",
      description:
        "At Clause, I developed a text editor using Facebook's DraftJS, enabling users to edit templates with real-time validation feedback. I integrated technologies like Redux-Form and React-Router to improve user input handling and navigation. I was involved in weekly deployments, managing package versions with Lerna and documenting releases using JIRA. Additionally, I implemented coding standards and type checking through SCSS/Styl/ESLint configurations and FlowTypes, enhancing code maintainability and readability across the team.",
    },
    {
      company: "Work Market",
      href: "https://www.workmarket.com/",
      badges: [],
      location: "New York City, NY",
      title: "Software Engineer",
      logoUrl: "/workmarket.jpg",
      start: "June 2016",
      end: "October 2017",
      description:
        "At WorkMarket, I developed a React component library using StorybookJS, enabling various teams to visualize UI components and their state changes for product features. I actively participated in agile development processes, attending team meetings and addressing both front-end and back-end issues through JIRA, which improved application performance. Additionally, I collaborated with the front-end team to convert JSP files into React components, contributing to a more efficient and responsive user interface.",
    },
  ],
  education: [
    {
      school: "Stevens Institute of Technology",
      href: "https://www.stevens.edu/",
      degree: "Master of Engineering",
      focus: "Software Engineering and Engineering Management",
      logoUrl: "/stevens.jpeg",
      start: "January 2025",
      end: "June 2026",
    },
    {
      school: "Rutgers University - Newark",
      href: "https://www.newark.rutgers.edu/",
      degree: "Bachelors of Arts",
      focus: "Information Technology and Computer Science",
      logoUrl: "/rutgers.jpg",
      start: "September 2011",
      end: "May 2015",
    },
  ],
  contact: {
    email: "hamel@hey.com",
    tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/hd719",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/hamel-d-650232122/",
        icon: Icons.linkedin,

        navbar: true,
      },
      // email: {
      //   name: "Send Email",
      //   url: "hamel@hey.com",
      //   icon: Icons.email,
      //   navbar: true,
      // },
    },
  },
} as const;
