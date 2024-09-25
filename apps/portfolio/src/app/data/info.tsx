import { Icons } from "@/app/components/Icons";

export const DATA = {
  name: "Hamel Desai",
  initials: "HD",
  url: "https://hameldesai.com",
  location: "NJ",
  description:
    "Full time Engineer 🖥️, Mortgage Broker 🏠, Husband, and Dog Dad",
  avatarUrl: "/me.png",
  summary: `I'm a **Software Engineer** based in New Jersey, currently at [Axio](https://axio.com).

  I've worked across a range of companies, from startups to medium/large corporations, and enjoy solving complex problems while continuously improving my skills. I'm passionate about delivering high-quality software and exploring new challenges.

  ### Axio:

  At **Axio**, we empower clients to assess cyber risks using our **Cyber Risk Quantification (CRQ)** methods, built on frameworks like **C2M2 v2.1**, **CIS Controls**, and **NIST CSF**. Our platform, **Axio360**, serves as a decision-making engine for comprehensive cyber risk management, offering cybersecurity assessments, risk quantification, risk transfer, and cyber insurance analysis.

  ### Things I've done:
  I worked with a team of **5 engineers** to bring to life Axio's new client-facing web application, built on **NextJS (v14)**. \n
  The project followed a **monorepo** approach with **PNPM**, **TypeScript**, and **TurboRepo** and after great effort my team and I migrated all of our TS/React/GQL applications under this monorepo, ensuring all applications were using the same TS version, ESlint, and Prettier configurations. This helped us maintaining a consistent codebase and allowed us to share code between applications and easy to onboard new developers.

  To support the project, I provisioned the entire infrastructure using **Terraform** on both **Google Cloud Platform** and **AWS**, fully embracing an **Infrastructure as Code (IaC)** approach. By modularizing AWS and GCP resources like **VPCs**, **databases**, **iam**, **kubernetes engine**, **service accounts** and other necessary components. I made it easy to spin up new environments—such as **QA**, **Dev**, and **Staging** - for smoke testing new features and running isolated tests. This modular setup allowed us to quickly replicate environments, accelerating feature development and ensuring reliable deployment processes.

  Additionally, I used **Terraform** to automatically create **virtual machine instances** that served as build agents for **CI/CD pipelines** on **Azure DevOps**. These agents spun up **Docker environments**, allowing us to run **Cypress tests** against our codebase in isolated containers. This ensured that each new build was thoroughly tested, with no previous features breaking in the process. With **Datadog** integrated into the pipeline, we monitored the infrastructure in real-time, identifying bottlenecks and improving system reliability across our **Kubernetes clusters**. The combination of **CI/CD automation** and **Terraform-based infrastructure** significantly streamlined the deployment workflow, enabling faster iteration cycles and more reliable feature releases.

  ### Outside of tech:
  - I enjoy working out, golfing, and hanging out with friends
  - At the moment building a cookbook application for my wife here is the repo: [Cookbook](https://www.github.com/hd719) - which is a **WIP**`,
  work: [
    {
      company: "Axio",
      badges: [],
      href: "https://axio.com",
      location: "Remote",
      title: "Software Engineer",
      logoUrl: "/axio.svg",
      start: "October 2022",
      end: "",
      description: "",
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
      school: "Rutgers University - Newark",
      href: "https://www.newark.rutgers.edu/",
      degree: "Bachelors of Arts",
      logoUrl: "/rutgers.jpg",
      start: "2011",
      end: "2015",
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
