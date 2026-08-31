// Scalable assessment definitions, question pools, and matching engine.

export type SkillCategory = "Technical" | "Soft skills" | "Other skills";

export interface QuizQuestion {
  id: string;
  category: SkillCategory;
  prompt: string;
  options: string[];
  correct: number;
  tags: string[];
  explanation: string;
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  provider: string;
  duration: string; // e.g. "18 min"
  durationMinutes: number;
  format: string;
  note: string;
  skills: string[];
  questionPool: QuizQuestion[];
}

export interface AssessmentSnapshot {
  assessmentId: string;
  submittedAt: string;
  categoryScores: Record<SkillCategory, number>;
  overall: number;
  answers: Record<string, number>;
  questions: QuizQuestion[];
  durationMinutes?: number;
  timeSpentSeconds?: number;
}

export const quizCategories: SkillCategory[] = ["Technical", "Soft skills", "Other skills"];

export const assessmentCatalog: AssessmentDefinition[] = [
  {
    id: "industry-readiness",
    title: "Industry readiness questionnaire",
    provider: "Industry Council · Version 2.1",
    duration: "18 min",
    durationMinutes: 18,
    format: "Technical + soft skills",
    note: "Maps your current evidence to general entry-level industry requirements.",
    skills: ["Python", "Data analysis", "SQL", "Communication", "Collaboration", "Git", "Problem solving"],
    questionPool: [
      // Technical
      {
        id: "ir-tech-1",
        category: "Technical",
        prompt: "A dataset includes customer name, monthly spend, and signup date. Which first step best supports a trustworthy analysis?",
        options: [
          "Start visualising every column immediately",
          "Check data types, missing values, and duplicate records",
          "Remove every incomplete record without review",
          "Write conclusions from the first ten rows",
        ],
        correct: 1,
        tags: ["Data analysis", "Data quality"],
        explanation: "Validating schema, null values, and duplicates ensures downstream analyses and models operate on sanitized, reliable data.",
      },
      {
        id: "ir-tech-2",
        category: "Technical",
        prompt: "Which SQL clause is used to group rows before applying an aggregate function such as COUNT, AVG, or SUM?",
        options: ["ORDER BY", "GROUP BY", "WHERE", "JOIN"],
        correct: 1,
        tags: ["SQL", "Data analysis"],
        explanation: "GROUP BY partitions data into summary rows based on identical column values before aggregation functions are evaluated.",
      },
      {
        id: "ir-tech-3",
        category: "Technical",
        prompt: "In Python, which built-in data structure is most suitable for storing key-value pairs such as a role title and its required skills?",
        options: ["A dictionary", "A plain string", "A tuple without names", "A print statement"],
        correct: 0,
        tags: ["Python", "Structured data"],
        explanation: "Dictionaries (dict) in Python provide associative key-value mapping with O(1) average lookup performance.",
      },
      {
        id: "ir-tech-4",
        category: "Technical",
        prompt: "When collaborating with Git, what is the best practice before merging a feature branch into the main development branch?",
        options: [
          "Force push directly to main without review",
          "Create a Pull Request, run automated tests, and conduct a code review",
          "Delete the git history to keep repository size small",
          "Send the code as a zip file in an email",
        ],
        correct: 1,
        tags: ["Git", "Collaboration"],
        explanation: "Pull Requests paired with continuous integration tests and peer reviews catch regressions and preserve auditability.",
      },
      {
        id: "ir-tech-5",
        category: "Technical",
        prompt: "What is the primary difference between a relational database (SQL) and a NoSQL document database?",
        options: [
          "SQL databases do not support primary keys",
          "SQL enforces structured schemas with tables, while NoSQL documents store semi-structured JSON-like records",
          "NoSQL databases cannot be accessed over a network",
          "SQL cannot execute queries with filters",
        ],
        correct: 1,
        tags: ["SQL", "Data analysis"],
        explanation: "Relational databases use predefined schema tables with ACID compliance, whereas document stores offer flexible, schema-on-read JSON structures.",
      },
      // Soft skills
      {
        id: "ir-soft-1",
        category: "Soft skills",
        prompt: "A stakeholder asks for a concise explanation of a complex technical analysis. What is the strongest response strategy?",
        options: [
          "Send the raw unformatted code repository only",
          "State the key result, supporting evidence, practical limitations, and recommended next step",
          "Use as much unexplained jargon as possible to demonstrate expertise",
          "Avoid answering until they schedule a formal workshop",
        ],
        correct: 1,
        tags: ["Communication", "Research writing"],
        explanation: "Executive communication should synthesize conclusions, evidence, limitations, and actionable decisions clearly without unnecessary jargon.",
      },
      {
        id: "ir-soft-2",
        category: "Soft skills",
        prompt: "A teammate strongly disagrees with your proposed architecture. What should you do first?",
        options: [
          "Dismiss their concern because the sprint deadline is tight",
          "Compare requirements, technical tradeoffs, and evidence together constructively",
          "Escalate immediately to senior leadership without talking to the teammate",
          "Proceed silently with your approach without documenting anything",
        ],
        correct: 1,
        tags: ["Collaboration", "Problem solving"],
        explanation: "Constructive collaboration starts with evaluating shared evidence, architectural tradeoffs, and project objectives together.",
      },
      {
        id: "ir-soft-3",
        category: "Soft skills",
        prompt: "How should you respond to constructive peer feedback identifying a logical flaw in your code or analysis?",
        options: [
          "Take it personally and contest every point immediately",
          "Clarify the specific edge case, address the flaw, and document the improvements",
          "Ignore the feedback if the code compiles without crashing",
          "Delete the entire project and restart from scratch",
        ],
        correct: 1,
        tags: ["Communication", "Problem solving"],
        explanation: "Professional growth relies on receptive inquiry into feedback, verifying edge cases, and documenting the resolved solution.",
      },
      {
        id: "ir-soft-4",
        category: "Soft skills",
        prompt: "During a cross-functional demo, an unexpected bug surfaces. What is the best professional course of action?",
        options: [
          "Blame another team member who worked on the module",
          "Acknowledge the issue calmly, take note of the failure condition, and commit to following up with a fix",
          "Pretend the bug is a feature and dismiss the user concern",
          "Abruptly end the meeting without explanation",
        ],
        correct: 1,
        tags: ["Communication", "Collaboration"],
        explanation: "Owning defects transparently with composure and a clear remediation plan builds stakeholder trust.",
      },
      // Other skills
      {
        id: "ir-other-1",
        category: "Other skills",
        prompt: "Two tasks are due today: one resolves a live user authentication issue and one cleans up internal CSS variable naming. What is the most defensible action?",
        options: [
          "Work on CSS naming because it takes less time",
          "Prioritise the live user authentication issue due to direct customer impact and security priority",
          "Randomly pick one to avoid decision paralysis",
          "Postpone both tasks until tomorrow",
        ],
        correct: 1,
        tags: ["Problem solving", "Prioritisation"],
        explanation: "Impact-driven prioritisation dictates addressing high-severity production user blockers before cosmetic or non-critical refactoring.",
      },
      {
        id: "ir-other-2",
        category: "Other skills",
        prompt: "You notice that an empirical dataset referenced in your report contains outdated statistics. What is the proper ethical action?",
        options: [
          "Leave it unaltered because it supports the initial hypothesis",
          "Update to recent verified data, cite the source accurately, and document any changed conclusions",
          "Falsify the dates to make the data appear recent",
          "Remove all numbers from the document entirely",
        ],
        correct: 1,
        tags: ["Ethics", "Research writing"],
        explanation: "Research integrity demands honest disclosure, verified references, and updating conclusions when data constraints evolve.",
      },
      {
        id: "ir-other-3",
        category: "Other skills",
        prompt: "A project requirement shifts halfway through development. What reflects strong adaptive planning?",
        options: [
          "Continue building the old specifications without notifying anyone",
          "Re-evaluate scope, confirm dependencies with stakeholders, and adjust milestones iteratively",
          "Abandon all completed code and refuse to continue",
          "Hide the change from your team members",
        ],
        correct: 1,
        tags: ["Problem solving", "Agile planning"],
        explanation: "Adaptive agility involves transparently realigning requirements, assessing delta impact, and replanning delivery sprints.",
      },
    ],
  },
  {
    id: "analytical-aptitude",
    title: "Analytical aptitude check",
    provider: "Northstar Systems · Version 1.4",
    duration: "22 min",
    durationMinutes: 22,
    format: "Aptitude",
    note: "Measures structured reasoning, data interpretation, and task prioritisation.",
    skills: ["Data analysis", "Critical thinking", "SQL", "Statistics", "Problem solving", "Logic"],
    questionPool: [
      // Technical
      {
        id: "aa-tech-1",
        category: "Technical",
        prompt: "If a query uses `WHERE` versus `HAVING`, what is the key distinction in analytical SQL execution?",
        options: [
          "`WHERE` filters records before aggregation; `HAVING` filters aggregated groupings",
          "`HAVING` can only be used on string columns",
          "`WHERE` and `HAVING` are interchangeable in modern ANSI SQL",
          "`WHERE` requires an explicit `GROUP BY` clause",
        ],
        correct: 0,
        tags: ["SQL", "Data analysis"],
        explanation: "`WHERE` conditions filter individual rows before grouping, while `HAVING` applies filtering predicates to aggregated groups.",
      },
      {
        id: "aa-tech-2",
        category: "Technical",
        prompt: "When evaluating a dataset with significant extreme outliers, which measure of central tendency provides the most robust summary?",
        options: ["Mean (Arithmetic average)", "Median", "Standard deviation", "Variance"],
        correct: 1,
        tags: ["Statistics", "Data analysis"],
        explanation: "The median is non-parametric and resistant to skewness caused by extreme outliers, unlike the arithmetic mean.",
      },
      {
        id: "aa-tech-3",
        category: "Technical",
        prompt: "A query joins two tables of 1,000 and 2,000 rows without an ON clause. What is the cardinality of the resulting Cartesian product?",
        options: ["3,000 rows", "1,000 rows", "2,000,000 rows", "500 rows"],
        correct: 2,
        tags: ["SQL", "Critical thinking"],
        explanation: "A CROSS JOIN or missing join predicate combines every row of the left table with every row of the right table (1,000 × 2,000 = 2,000,000).",
      },
      {
        id: "aa-tech-4",
        category: "Technical",
        prompt: "In statistical hypothesis testing, what does a p-value less than alpha (e.g. p < 0.05) indicate?",
        options: [
          "The null hypothesis is definitely true",
          "There is statistically significant evidence to reject the null hypothesis",
          "The experiment had zero measurement error",
          "The sample size was too small",
        ],
        correct: 1,
        tags: ["Statistics", "Data analysis"],
        explanation: "A p-value below the significance threshold indicates the observed result is unlikely under the null hypothesis, supporting its rejection.",
      },
      // Soft skills
      {
        id: "aa-soft-1",
        category: "Soft skills",
        prompt: "When presenting statistical findings to non-technical business managers, what is the best visualisation practice?",
        options: [
          "Display raw unaggregated data matrices with 50 columns",
          "Use clean charts with clear labels, focal callouts, and brief takeaway bullets",
          "Avoid charts entirely and read numerical tables aloud",
          "Use complex 3D charts with multiple dual axes without legends",
        ],
        correct: 1,
        tags: ["Communication", "Critical thinking"],
        explanation: "Clarity in data storytelling comes from decluttering visualisations, highlighting key metrics, and providing actionable narrative context.",
      },
      {
        id: "aa-soft-2",
        category: "Soft skills",
        prompt: "Two analytical models produce conflicting conclusions for a key business metric. How should you present this to stakeholders?",
        options: [
          "Hide the conflicting model and pretend there is complete consensus",
          "Explain the differing assumptions, sample boundaries, and provide a sensitivity analysis",
          "Flip a coin and pick one without documenting the discrepancy",
          "Tell stakeholders that data cannot help them",
        ],
        correct: 1,
        tags: ["Communication", "Problem solving"],
        explanation: "Transparency regarding model assumptions, variance, and confidence intervals enables robust risk-weighted executive decisions.",
      },
      // Other skills
      {
        id: "aa-other-1",
        category: "Other skills",
        prompt: "A factory produces 500 units per day with a 2% defect rate. If production increases by 20% while defect rate remains the same, how many defects occur per day?",
        options: ["10 defects", "12 defects", "15 defects", "20 defects"],
        correct: 1,
        tags: ["Logic", "Critical thinking"],
        explanation: "New daily production = 500 × 1.20 = 600 units. 2% of 600 = 12 defective units per day.",
      },
      {
        id: "aa-other-2",
        category: "Other skills",
        prompt: "You notice a sudden 40% drop in user conversion rate on Tuesday. What is the most rigorous troubleshooting sequence?",
        options: [
          "Rewrite the whole checkout codebase immediately",
          "Check for tracking/logging errors, recent deployments, and segment by browser/device to isolate root cause",
          "Assume users lost interest and do nothing",
          "Delete the conversion database table",
        ],
        correct: 1,
        tags: ["Problem solving", "Logic"],
        explanation: "Systematic root cause analysis involves verifying telemetry health, auditing release changes, and segmenting data along dimensions.",
      },
      {
        id: "aa-other-3",
        category: "Other skills",
        prompt: "If all developers write code, and some developers are system architects, which statement is logically sound?",
        options: [
          "All system architects are developers",
          "Some people who write code are system architects",
          "No developers can be system architects",
          "Only architects write code",
        ],
        correct: 1,
        tags: ["Logic", "Critical thinking"],
        explanation: "Since all developers write code, and a subset of developers are system architects, that subset of system architects write code.",
      },
    ],
  },
  {
    id: "research-evidence",
    title: "Research evidence self-assessment",
    provider: "Mosaic Health Labs · Version 1.0",
    duration: "12 min",
    durationMinutes: 12,
    format: "Technical + communication",
    note: "Reviews evidence handling, documentation quality, and research communication.",
    skills: ["Research writing", "Communication", "Documentation", "Data analysis", "Python", "Scientific method"],
    questionPool: [
      // Technical
      {
        id: "re-tech-1",
        category: "Technical",
        prompt: "What is essential for computational reproducibility in a scientific research repository?",
        options: [
          "Storing only compiled binaries without source code",
          "Providing code, environment dependencies (e.g. requirements.txt / lockfiles), and seeds for random number generators",
          "Hardcoding local absolute file paths",
          "Keeping datasets private on a local USB drive",
        ],
        correct: 1,
        tags: ["Python", "Documentation"],
        explanation: "Reproducible research requires versioned code, pinned dependency environments, deterministic seeds, and reproducible data pipelines.",
      },
      {
        id: "re-tech-2",
        category: "Technical",
        prompt: "In Python data pipelines, why is method chaining or structured vectorization in Pandas preferred over mutating global variables in loops?",
        options: [
          "It minimizes side-effects, improves performance, and clarifies data transformations",
          "Loops in Python are illegal in production code",
          "Global variables use less memory than functions",
          "Vectorization causes random data mutations",
        ],
        correct: 0,
        tags: ["Python", "Data analysis"],
        explanation: "Declarative vectorization avoids stateful mutation bugs, utilizes optimized C backend routines, and improves pipeline read clarity.",
      },
      {
        id: "re-tech-3",
        category: "Technical",
        prompt: "When publishing a technical research report, what is the best practice for documenting limitations?",
        options: [
          "Omit limitations so the paper looks more impressive",
          "Explicitly detail sample constraints, assumptions, threat to validity, and potential confounders",
          "Put limitations in encrypted comments",
          "Claim the findings apply universally to every domain",
        ],
        correct: 1,
        tags: ["Documentation", "Research writing"],
        explanation: "High-integrity scientific work highlights boundary conditions and threats to validity so readers understand appropriate application scope.",
      },
      // Soft skills
      {
        id: "re-soft-1",
        category: "Soft skills",
        prompt: "How should research evidence be communicated when presenting to an audience of varied domain expertise?",
        options: [
          "Use complex theoretical proofs only",
          "Structure the presentation with an intuitive executive summary, practical implications, and accessible appendix for deep technical evidence",
          "Speak as fast as possible without taking questions",
          "Skip the problem statement and show only final charts",
        ],
        correct: 1,
        tags: ["Communication", "Research writing"],
        explanation: "Layered communication provides top-level clarity for leadership while maintaining traceable depth for technical peer review.",
      },
      {
        id: "re-soft-2",
        category: "Soft skills",
        prompt: "A reviewer criticizes your study methodology. What is the most productive scholarly response?",
        options: [
          "Reject the review without reading it",
          "Thank the reviewer, address each methodological concern point-by-point with evidence, and update the manuscript accordingly",
          "Accuse the reviewer of bias in a public forum",
          "Retract the entire research project immediately",
        ],
        correct: 1,
        tags: ["Communication", "Scientific method"],
        explanation: "Constructive peer review engagement requires point-by-point evidence rebuttal or incorporating revisions with empirical substantiation.",
      },
      // Other skills
      {
        id: "re-other-1",
        category: "Other skills",
        prompt: "Which practice protects against confirmation bias when evaluating experimental results?",
        options: [
          "Pre-registering hypotheses and evaluation metrics prior to analyzing data",
          "Searching for data slices that only support the desired conclusion",
          "Discarding trials that fail to support expectations",
          "Changing the metric definitions after viewing results",
        ],
        correct: 0,
        tags: ["Scientific method", "Ethics"],
        explanation: "Pre-registration of hypotheses and evaluation metrics prevents p-hacking and post-hoc rationalization of experimental findings.",
      },
      {
        id: "re-other-2",
        category: "Other skills",
        prompt: "When utilizing third-party research datasets containing human subject records, what ethical step is mandatory?",
        options: [
          "Share the raw un-anonymized data publicly",
          "Verify informed consent, ensure data anonymization/PII removal, and comply with data privacy policies",
          "Assume any dataset found on the internet has no privacy constraints",
          "Sell the dataset to commercial vendors",
        ],
        correct: 1,
        tags: ["Ethics", "Documentation"],
        explanation: "Ethical research requires strict adherence to privacy governance, informed consent protocols, and complete de-identification of PII.",
      },
    ],
  },
  {
    id: "software-engineering",
    title: "Software engineering & core systems",
    provider: "Open Source Tech Alliance · Version 3.0",
    duration: "20 min",
    durationMinutes: 20,
    format: "Technical + system design",
    note: "Evaluates modern software development practices, asynchronous programming, and clean architecture.",
    skills: ["Python", "JavaScript", "React", "Data Structures", "System Design", "Git", "Algorithms"],
    questionPool: [
      // Technical
      {
        id: "se-tech-1",
        category: "Technical",
        prompt: "In React, what is the key advantage of using the `useEffect` cleanup return function?",
        options: [
          "It accelerates DOM rendering speed by 10x",
          "It cancels subscriptions, clears timers, or removes event listeners to prevent memory leaks when the component unmounts",
          "It automatically saves component state to the database",
          "It replaces all CSS stylesheets",
        ],
        correct: 1,
        tags: ["React", "JavaScript"],
        explanation: "Cleanup functions in useEffect guarantee teardown of asynchronous subscriptions, socket connections, and intervals to eliminate memory leaks.",
      },
      {
        id: "se-tech-2",
        category: "Technical",
        prompt: "What is the average time complexity for key lookups in a well-distributed Hash Table?",
        options: ["O(N)", "O(log N)", "O(1)", "O(N^2)"],
        correct: 2,
        tags: ["Data Structures", "Algorithms"],
        explanation: "Hash tables compute array index offsets directly from hash values, achieving O(1) constant average lookup time.",
      },
      {
        id: "se-tech-3",
        category: "Technical",
        prompt: "In JavaScript, what does `Promise.all([p1, p2, p3])` do if `p2` rejects with an error?",
        options: [
          "It ignores p2 and returns an array with p1 and p3",
          "It immediately rejects with the error from p2 (fail-fast behavior)",
          "It retries p2 indefinitely until it succeeds",
          "It converts the error into null and resolves normally",
        ],
        correct: 1,
        tags: ["JavaScript", "Algorithms"],
        explanation: "`Promise.all` adopts a fail-fast strategy: as soon as any promise in the iterable rejects, the whole returned promise immediately rejects.",
      },
      {
        id: "se-tech-4",
        category: "Technical",
        prompt: "Which design principle recommends that software entities should be open for extension but closed for modification?",
        options: [
          "Single Responsibility Principle",
          "Open-Closed Principle (OCP)",
          "Interface Segregation Principle",
          "Dependency Inversion Principle",
        ],
        correct: 1,
        tags: ["System Design", "Software Engineering"],
        explanation: "The Open-Closed Principle (the 'O' in SOLID) encourages building extensible architectures through interfaces and polymorphism without altering verified existing code.",
      },
      // Soft skills
      {
        id: "se-soft-1",
        category: "Soft skills",
        prompt: "When writing a code review comment on a junior developer's pull request, what is the best approach?",
        options: [
          "Write 'This is bad code, rewrite it.'",
          "Explain the specific performance or security implication, cite documentation or examples, and suggest a clear alternative kindly",
          "Approve it without reading to be nice",
          "Take over their branch and write the code yourself without explaining why",
        ],
        correct: 1,
        tags: ["Collaboration", "Communication"],
        explanation: "Effective code reviews are educational and empathetic, explaining the 'why' behind architectural suggestions and fostering engineer growth.",
      },
      // Other skills
      {
        id: "se-other-1",
        category: "Other skills",
        prompt: "When planning technical debt reduction alongside new feature delivery, what strategy balances engineering hygiene with business velocity?",
        options: [
          "Never pay down technical debt until the entire system crashes",
          "Allocate a sustainable portion of sprint capacity (e.g. 15-20%) regularly for refactoring and test coverage",
          "Halt all product feature development for 6 months without stakeholder alignment",
          "Ignore automated test failures in CI",
        ],
        correct: 1,
        tags: ["Prioritisation", "Agile planning"],
        explanation: "Continuous incremental debt allocation preserves system reliability while maintaining steady feature momentum.",
      },
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps foundations",
    provider: "Cloud Native Foundation · Version 2.0",
    duration: "15 min",
    durationMinutes: 15,
    format: "Technical + operational",
    note: "Covers containerization, CI/CD automation, infrastructure fundamentals, and cloud reliability.",
    skills: ["Docker", "CI/CD", "Linux", "Cloud Computing", "SQL", "Kubernetes"],
    questionPool: [
      // Technical
      {
        id: "cd-tech-1",
        category: "Technical",
        prompt: "In Docker, what is the main benefit of multi-stage builds in a `Dockerfile`?",
        options: [
          "They enable multiple operating systems to run inside a single container simultaneously",
          "They separate build-time dependencies from runtime artifacts, producing minimal and secure production images",
          "They bypass Linux kernel security limits",
          "They eliminate the need for container registries",
        ],
        correct: 1,
        tags: ["Docker", "Cloud Computing"],
        explanation: "Multi-stage builds leave heavy compilers and SDKs in intermediate build stages, shipping only lightweight binaries in the final production layer.",
      },
      {
        id: "cd-tech-2",
        category: "Technical",
        prompt: "In Linux system administration, which command allows you to inspect real-time running processes and CPU/memory usage?",
        options: ["ls -la", "htop or top", "chmod 777", "ping localhost"],
        correct: 1,
        tags: ["Linux", "Cloud Computing"],
        explanation: "`top` and `htop` render interactive process tables showing thread activity, memory allocation, and CPU load averages.",
      },
      {
        id: "cd-tech-3",
        category: "Technical",
        prompt: "What is the primary role of a Continuous Integration (CI) pipeline?",
        options: [
          "Manually approve user signups",
          "Automatically build, lint, and execute unit/integration test suites on every code commit",
          "Shut down database servers during off-hours",
          "Format user emails",
        ],
        correct: 1,
        tags: ["CI/CD", "DevOps"],
        explanation: "CI pipelines validate developer changes continuously, discovering regressions and test breakages early in the lifecycle.",
      },
      // Soft skills
      {
        id: "cd-soft-1",
        category: "Soft skills",
        prompt: "A production outage occurs due to an infrastructure deployment error. During the post-mortem, what culture should be maintained?",
        options: [
          "A blameless post-mortem focused on systemic failure points, timeline analysis, and preventative guardrails",
          "Publicly reprimanding the engineer who triggered the deploy command",
          "Hiding the incident from status dashboards",
          "Banning all deployments for the rest of the year",
        ],
        correct: 0,
        tags: ["Collaboration", "Communication"],
        explanation: "Blameless post-mortems focus on root architectural safeguards and process improvements rather than assigning personal blame.",
      },
      // Other skills
      {
        id: "cd-other-1",
        category: "Other skills",
        prompt: "What is the Principle of Least Privilege in cloud access management (IAM)?",
        options: [
          "Granting full administrator access to all employees to avoid permission tickets",
          "Granting users and services only the minimum permissions necessary to perform their specific duties",
          "Disabling authentication passwords",
          "Allowing unrestricted public read-write access to S3 storage buckets",
        ],
        correct: 1,
        tags: ["Ethics", "Cloud Computing"],
        explanation: "Least privilege minimizes the blast radius of compromised credentials by restricting permissions strictly to required resources.",
      },
    ],
  },
  {
    id: "applied-ai-ml",
    title: "Applied AI & Machine Learning Readiness",
    provider: "Applied AI Capability Studio · Version 2.4",
    duration: "25 min",
    durationMinutes: 25,
    format: "Technical + AI evaluation",
    note: "Evaluates machine learning workflows, model evaluation metrics, data preprocessing, and ethical AI safeguards.",
    skills: ["Machine learning", "Python", "Data analysis", "Statistics", "Deep Learning", "TensorFlow"],
    questionPool: [
      // Technical
      {
        id: "ml-tech-1",
        category: "Technical",
        prompt: "When evaluating a classification model on an imbalanced dataset (e.g. 99% negative, 1% positive), why is Accuracy a misleading metric?",
        options: [
          "Accuracy cannot be calculated on binary numbers",
          "A naive model predicting 'negative' for every sample gets 99% accuracy while detecting zero actual positives",
          "Accuracy only works for regression problems",
          "Precision and Recall are always equal to Accuracy",
        ],
        correct: 1,
        tags: ["Machine learning", "Statistics"],
        explanation: "On skewed class distributions, accuracy masks total failure on minority classes; Precision, Recall, PR-AUC, and F1-score are necessary.",
      },
      {
        id: "ml-tech-2",
        category: "Technical",
        prompt: "What technique helps prevent overfitting in machine learning models during training?",
        options: [
          "Training until training loss reaches exactly zero on memorized data",
          "Applying regularization (L1/L2), cross-validation, dropout, and early stopping",
          "Removing all validation sets",
          "Multiplying all features by 1,000",
        ],
        correct: 1,
        tags: ["Machine learning", "Python"],
        explanation: "Regularization penalizes complex model weights, while cross-validation and early stopping prevent models from memorizing training noise.",
      },
      {
        id: "ml-tech-3",
        category: "Technical",
        prompt: "What is data leakage in a machine learning training pipeline?",
        options: [
          "When data is stored in uncompressed CSV format",
          "When information from the test/validation dataset inadvertently influences the training phase (e.g. fitting scalers on all data before splitting)",
          "When a hard drive runs out of disk space",
          "When data is transmitted over HTTPS",
        ],
        correct: 1,
        tags: ["Machine learning", "Data analysis"],
        explanation: "Data leakage creates unrealistically optimistic validation metrics that collapse when deployed on real unseen production data.",
      },
      // Soft skills
      {
        id: "ml-soft-1",
        category: "Soft skills",
        prompt: "A commercial AI client asks for an 'explainability audit' for loan approval predictions. How should you address this?",
        options: [
          "Tell them AI is a black box and impossible to explain",
          "Provide feature importance insights (e.g., SHAP / LIME values), decision boundary summaries, and audit records of protected attributes",
          "Show them the raw weight tensors of the neural network",
          "Delete the model weights",
        ],
        correct: 1,
        tags: ["Communication", "Machine learning"],
        explanation: "Responsible AI engineering communicates interpretability through attribution techniques (SHAP/LIME) and bias audit metrics.",
      },
      // Other skills
      {
        id: "ml-other-1",
        category: "Other skills",
        prompt: "What is an essential safeguard against algorithmic bias in deployed machine learning systems?",
        options: [
          "Testing models exclusively on homogeneous demographic test slices",
          "Auditing datasets for representational parity, conducting fairness metrics checks across demographic subgroups, and continuous monitoring",
          "Hiding demographic attributes and assuming bias cannot exist",
          "Only deploying models without testing",
        ],
        correct: 1,
        tags: ["Ethics", "Scientific method"],
        explanation: "Unbiased AI requires proactive subgroup auditing, disparate impact analysis, and continuous monitoring against real-world drift.",
      },
    ],
  },
];

// Helper: read declared skills from localStorage or default
export function getDeclaredSkills(): string[] {
  try {
    const raw = localStorage.getItem("sih-connect-declared-skills");
    if (!raw) return ["Python", "Data analysis", "Research writing", "Communication"];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((s: string) => String(s).trim()).filter(Boolean);
      }
      if (typeof parsed === "string") {
        return parsed.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  } catch {
    return ["Python", "Data analysis", "Research writing", "Communication"];
  }
  return ["Python", "Data analysis", "Research writing", "Communication"];
}

export function saveDeclaredSkills(skills: string[]): void {
  try {
    const cleanSkills = Array.from(
      new Set(skills.map((s) => s.trim()).filter(Boolean))
    );
    localStorage.setItem("sih-connect-declared-skills", JSON.stringify(cleanSkills));
  } catch (err) {
    console.error("Failed to save declared skills:", err);
  }
}

// Helper: check if a specific skill name matches any user declared skill
export function isSkillMatched(skillName: string, userSkills: string[]): boolean {
  if (!skillName || !userSkills || userSkills.length === 0) return false;
  const target = skillName.toLowerCase().trim();
  return userSkills.some((userSkill) => {
    const candidate = userSkill.toLowerCase().trim();
    if (!candidate) return false;
    // Exact match, word boundary match, or substring match
    return (
      target === candidate ||
      target.includes(candidate) ||
      candidate.includes(target)
    );
  });
}

// Helper: get matching skills for an assessment
export function getAssessmentSkillMatches(assessmentSkills: string[], userSkills: string[]): string[] {
  return assessmentSkills.filter((skill) => isSkillMatched(skill, userSkills));
}

// Helper: sample randomized balanced questions from an assessment's pool
export function sampleRandomQuestionsForAssessment(assessmentId: string, sampleSize = 8): QuizQuestion[] {
  const assessment = assessmentCatalog.find((a) => a.id === assessmentId) ?? assessmentCatalog[0];
  const pool = assessment.questionPool;

  if (pool.length <= sampleSize) {
    return [...pool].sort(() => Math.random() - 0.5);
  }

  // Sample across Technical, Soft skills, and Other skills
  const grouped: Record<SkillCategory, QuizQuestion[]> = {
    Technical: pool.filter((q) => q.category === "Technical").sort(() => Math.random() - 0.5),
    "Soft skills": pool.filter((q) => q.category === "Soft skills").sort(() => Math.random() - 0.5),
    "Other skills": pool.filter((q) => q.category === "Other skills").sort(() => Math.random() - 0.5),
  };

  const selected: QuizQuestion[] = [];

  // Take at least 2 or 3 from Technical, 2 from Soft, 2 from Other if available
  const techCount = Math.min(grouped.Technical.length, Math.ceil(sampleSize * 0.45));
  const softCount = Math.min(grouped["Soft skills"].length, Math.ceil(sampleSize * 0.3));
  const otherCount = Math.min(grouped["Other skills"].length, sampleSize - techCount - softCount);

  selected.push(...grouped.Technical.slice(0, techCount));
  selected.push(...grouped["Soft skills"].slice(0, softCount));
  selected.push(...grouped["Other skills"].slice(0, otherCount));

  // Fill up if still less than sampleSize
  if (selected.length < sampleSize) {
    const remaining = pool.filter((q) => !selected.some((s) => s.id === q.id)).sort(() => Math.random() - 0.5);
    selected.push(...remaining.slice(0, sampleSize - selected.length));
  }

  return selected.sort(() => Math.random() - 0.5);
}

// Helper: calculate quiz results safely
export function calculateQuizResult(
  assessmentId: string,
  answers: Record<string, number>,
  questions: QuizQuestion[],
  timeSpentSeconds = 0
): AssessmentSnapshot {
  const categoryScores: Record<SkillCategory, number> = {
    Technical: 0,
    "Soft skills": 0,
    "Other skills": 0,
  };

  quizCategories.forEach((category) => {
    const categoryQuestions = questions.filter((q) => q.category === category);
    if (categoryQuestions.length === 0) {
      categoryScores[category] = 100;
      return;
    }
    const correctCount = categoryQuestions.filter((q) => answers[q.id] === q.correct).length;
    categoryScores[category] = Math.round((correctCount / categoryQuestions.length) * 100);
  });

  const totalCorrect = questions.filter((q) => answers[q.id] === q.correct).length;
  const overall = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  return {
    assessmentId,
    submittedAt: new Date().toISOString(),
    categoryScores,
    overall,
    answers,
    questions,
    timeSpentSeconds,
  };
}

export interface AssessmentHistoryRecord {
  assessmentId: string;
  attemptsCount: number;
  bestScore: number;
  bestResult: AssessmentSnapshot;
  latestResult: AssessmentSnapshot;
  lastAttemptAt: string;
}

export function getAssessmentHistories(): Record<string, AssessmentHistoryRecord> {
  try {
    const raw = localStorage.getItem("sih-connect-assessment-histories");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function getAssessmentHistory(assessmentId: string): AssessmentHistoryRecord | null {
  const histories = getAssessmentHistories();
  if (histories[assessmentId]) return histories[assessmentId];

  // Fallback: check if there's a stored result for this assessment
  const stored = loadAssessmentResult(assessmentId);
  if (stored && stored.assessmentId === assessmentId) {
    return {
      assessmentId,
      attemptsCount: 1,
      bestScore: stored.overall,
      bestResult: stored,
      latestResult: stored,
      lastAttemptAt: stored.submittedAt,
    };
  }
  return null;
}

export function saveAssessmentAttempt(result: AssessmentSnapshot) {
  try {
    localStorage.setItem("sih-connect-assessment-result", JSON.stringify(result));
    localStorage.setItem(`sih-connect-assessment-result-${result.assessmentId}`, JSON.stringify(result));

    const histories = getAssessmentHistories();
    const existing = histories[result.assessmentId];

    let bestResult = result;
    let bestScore = result.overall;
    let attemptsCount = 1;

    if (existing) {
      attemptsCount = (existing.attemptsCount || 1) + 1;
      if (existing.bestScore >= result.overall) {
        bestScore = existing.bestScore;
        bestResult = existing.bestResult;
      }
    }

    histories[result.assessmentId] = {
      assessmentId: result.assessmentId,
      attemptsCount,
      bestScore,
      bestResult,
      latestResult: result,
      lastAttemptAt: result.submittedAt,
    };

    localStorage.setItem("sih-connect-assessment-histories", JSON.stringify(histories));
    localStorage.setItem(`sih-connect-assessment-best-${result.assessmentId}`, JSON.stringify(bestResult));
  } catch {}
}

export function loadBestAssessmentResult(assessmentId: string): AssessmentSnapshot | null {
  try {
    const specific = localStorage.getItem(`sih-connect-assessment-best-${assessmentId}`);
    if (specific) return JSON.parse(specific) as AssessmentSnapshot;
    const history = getAssessmentHistory(assessmentId);
    if (history?.bestResult) return history.bestResult;
  } catch {}
  return loadAssessmentResult(assessmentId);
}

// Helper: load stored result
export function loadAssessmentResult(assessmentId?: string): AssessmentSnapshot | null {
  try {
    if (assessmentId) {
      const specific = localStorage.getItem(`sih-connect-assessment-result-${assessmentId}`);
      if (specific) return JSON.parse(specific) as AssessmentSnapshot;
    }
    const stored = localStorage.getItem("sih-connect-assessment-result");
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AssessmentSnapshot;
    if (assessmentId && parsed.assessmentId !== assessmentId) {
      const specific = localStorage.getItem(`sih-connect-assessment-result-${assessmentId}`);
      return specific ? (JSON.parse(specific) as AssessmentSnapshot) : null;
    }
    return parsed;
  } catch {
    return null;
  }
}

