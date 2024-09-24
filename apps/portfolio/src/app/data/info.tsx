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
  The project followed a **monorepo** approach with **PNPM**, **TypeScript**, and **TurboRepo**, ensuring scalability and streamlined development.

  To support the project, I provisioned the entire infrastructure using **Terraform** on both **Google Cloud Platform** and **AWS**, fully embracing an **Infrastructure as Code (IaC)** approach. By modularizing resources like **VPCs**, **databases**, and **compute instances**, we made it easy to spin up new environments—such as **QA**, **Dev**, and **Staging** - for smoke testing new features and running isolated tests. This modular setup allowed us to quickly replicate environments, accelerating feature development and ensuring reliable deployment processes.

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
      description: "",
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
      description: "",
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
      description: "",
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
      description: "",
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
      email: {
        name: "Send Email",
        url: "hamel@hey.com",
        icon: Icons.email,
        navbar: true,
      },
    },
  },
} as const;
