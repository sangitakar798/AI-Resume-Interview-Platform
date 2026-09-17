const resume = `
Alex Johnson
Bengaluru, India
alex.johnson@email.com
+91 98765 43210
LinkedIn: linkedin.com/in/alexjohnson
GitHub: github.com/alexjohnson

PROFESSIONAL SUMMARY

Backend-focused Software Developer with 3+ years of experience building scalable
REST APIs and distributed web applications using Node.js, Express.js, and MongoDB.
Experienced in authentication, database optimization, API integrations, and
performance improvement. Strong understanding of clean architecture and
production-ready backend development.

TECHNICAL SKILLS

Languages: JavaScript, TypeScript, Python
Backend: Node.js, Express.js, REST APIs
Frontend: React.js, Redux Toolkit, Tailwind CSS
Database: MongoDB, PostgreSQL, Redis
DevOps & Tools: Git, Docker, Postman, Linux, GitHub Actions
Concepts: JWT Authentication, MVC, Microservices, Caching, System Design

WORK EXPERIENCE

Backend Developer
TechNova Solutions | Jan 2023 – Present

- Designed and developed RESTful APIs serving 20,000+ monthly active users.
- Optimized MongoDB queries using indexing and aggregation pipelines, reducing
  average API response time by 35%.
- Implemented JWT-based authentication and role-based authorization.
- Integrated Redis caching to improve frequently accessed API performance.
- Developed reusable backend modules following clean architecture principles.
- Collaborated with frontend and DevOps teams to deploy production applications.
- Improved API reliability through validation, error handling, and logging.

Full Stack Developer
CodeWorks Pvt. Ltd. | July 2021 – Dec 2022

- Developed responsive web applications using React.js and Node.js.
- Built reusable React components and state management using Redux Toolkit.
- Integrated third-party REST APIs and payment gateway services.
- Improved frontend performance by reducing unnecessary API calls and bundle size.
- Designed MongoDB schemas and developed CRUD APIs using Express.js.
- Worked closely with UI/UX designers and QA engineers to deliver production-ready
  features.

PROJECTS

JobFit AI – AI Resume Builder

Technologies: React.js, Node.js, Express.js, MongoDB, Gemini API

- Built an AI-powered resume builder that generates job-specific resume content.
- Integrated Gemini API to analyze job descriptions and suggest relevant skills.
- Developed REST APIs for user authentication and resume management.
- Implemented JWT authentication and protected user-specific resources.
- Designed MongoDB collections for users, resumes, and job descriptions.

E-Commerce Analytics Dashboard

Technologies: React.js, Node.js, PostgreSQL, REST APIs

- Developed an analytics dashboard for monitoring sales and customer activity.
- Created APIs for sales, revenue, and product performance metrics.
- Implemented filtering, pagination, and optimized database queries.
- Built interactive charts and responsive dashboard components.

EDUCATION

Bachelor of Technology in Computer Science
Rajiv Gandhi Technical University | 2021

CERTIFICATIONS

- JavaScript Algorithms and Data Structures
- Node.js Backend Development
- MongoDB Developer Certification

ACHIEVEMENTS

- Reduced API response time by 35% through database optimization and caching.
- Successfully delivered 10+ production features across multiple projects.
- Mentored junior developers on REST API development and Git workflows.
`


const selfDescription = `
I am a backend-focused software developer with 3+ years of experience building
scalable applications using Node.js, Express.js, MongoDB, and PostgreSQL.

My core expertise includes REST API development, JWT authentication, database
optimization, caching, and backend architecture. I have also worked with React.js
and have experience developing full-stack applications.

I enjoy solving system design and performance-related problems. Recently, I have
been exploring AI integrations using Gemini APIs and building AI-powered
applications.

I am currently looking for backend developer opportunities where I can work on
scalable systems, improve application performance, and strengthen my expertise in
distributed backend architecture.
`


const jobDescription = `
Position: Backend Developer (Node.js)
Location: Remote / Bengaluru
We are looking for a Backend Developer with 3+ years of experience in Node.js,
Express.js, and database development to build scalable and high-performance APIs.
Responsibilities:
- Design and develop scalable RESTful APIs using Node.js and Express.js.
- Design and optimize databases using indexing and query optimization.
- Implement caching strategies using Redis.
- Develop authentication and authorization mechanisms.
- Write clean, maintainable, and testable code.
- Collaborate with frontend and DevOps teams.
- Participate in system design and architecture discussions.
- Monitor and improve application performance.
Required Skills:
- 3+ years of backend development experience.
- Strong knowledge of Node.js and asynchronous programming.
- Experience with Express.js and REST APIs.
- Strong understanding of MongoDB or PostgreSQL.
- Experience with Redis or similar caching technologies.
- Knowledge of JWT authentication and authorization.
- Familiarity with Git, Docker, and Linux.
- Good understanding of software architecture and design patterns.
Preferred Skills:
- Experience with microservices architecture.
- Knowledge of cloud platforms such as AWS.
- Experience with CI/CD pipelines.
- Understanding of distributed systems.
`

module.exports = {
    resume, selfDescription , jobDescription
}