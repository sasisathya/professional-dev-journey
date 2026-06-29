# Software Development Life Cycle (SDLC) - Professional Interview Guide

## Table of Contents
1. [SDLC Fundamentals](#sdlc-fundamentals)
2. [Development Methodologies](#development-methodologies)
3. [Agile & Scrum](#agile--scrum)
4. [DevOps & CI/CD](#devops--cicd)
5. [Testing Strategies](#testing-strategies)
6. [Version Control & Branching](#version-control--branching)
7. [Code Quality & Reviews](#code-quality--reviews)
8. [Best Practices](#best-practices)

---

## SDLC Fundamentals

### What is SDLC?
**Software Development Life Cycle** is a structured process for planning, creating, testing, and deploying software.

**Phases:**
1. **Planning:** Define scope, requirements, feasibility
2. **Analysis:** Gather detailed requirements, use cases
3. **Design:** System architecture, database schema, UI/UX
4. **Implementation:** Write code
5. **Testing:** Verify functionality, find bugs
6. **Deployment:** Release to production
7. **Maintenance:** Bug fixes, updates, enhancements

**Key takeaway:** Structured process. Planning → Coding → Testing → Deployment.

---

### SDLC Models
**1. Waterfall:**
- Sequential phases (complete one before next)
- Pros: Simple, well-documented
- Cons: Inflexible, late testing, high risk

**2. Agile:**
- Iterative, incremental
- Short sprints (1-4 weeks)
- Pros: Flexible, continuous feedback, early delivery
- Cons: Less documentation, requires client involvement

**3. Spiral:**
- Risk-driven, iterative
- Combines waterfall + prototyping
- Pros: Risk management, flexible
- Cons: Complex, expensive

**4. V-Model:**
- Verification and validation model
- Each dev phase has testing phase
- Pros: Early testing
- Cons: Rigid like waterfall

**Key takeaway:** Waterfall = sequential, Agile = iterative, Spiral = risk-driven.

---

## Development Methodologies

### Waterfall
**Definition:** Linear, sequential approach. Complete one phase before next.

**Phases:** Requirements → Design → Implementation → Testing → Deployment → Maintenance

**When to use:**
- Clear, fixed requirements
- Regulatory projects (heavy documentation)
- Small projects

**Limitations:**
- No changes once phase complete
- Late testing (bugs found late)
- High risk

**Key takeaway:** Sequential. Fixed requirements. High risk.

---

### Agile
**Definition:** Iterative development. Deliver working software in short cycles (sprints).

**Core principles (Agile Manifesto):**
- Individuals and interactions > processes and tools
- Working software > comprehensive documentation
- Customer collaboration > contract negotiation
- Responding to change > following a plan

**Benefits:**
- Adapt to changing requirements
- Continuous feedback
- Early and frequent delivery
- Reduced risk

**Challenges:**
- Less documentation
- Requires experienced team
- Client availability needed

**Key takeaway:** Iterative. Flexible. Customer collaboration.

---

### Scrum vs Kanban
**Scrum:**
- Fixed-length sprints (1-4 weeks)
- Roles: Product Owner, Scrum Master, Dev Team
- Ceremonies: Sprint Planning, Daily Standup, Review, Retrospective
- Commitment to sprint goals

**Kanban:**
- Continuous flow (no sprints)
- Visualize workflow (board with columns: To Do, In Progress, Done)
- Limit WIP (Work In Progress)
- Pull-based (pull tasks when capacity available)

**When to use:**
- Scrum: Feature development, clear sprint goals
- Kanban: Support/maintenance, continuous flow

**Key takeaway:** Scrum = sprints, Kanban = continuous flow.

---

## Agile & Scrum

### Scrum Roles
**Product Owner:**
- Defines product vision
- Manages product backlog (prioritize features)
- Represents stakeholders

**Scrum Master:**
- Facilitates Scrum process
- Removes blockers
- Coaches team on Agile practices

**Development Team:**
- Cross-functional (developers, testers, designers)
- Self-organizing
- Delivers potentially shippable increment

**Key takeaway:** PO = what to build, SM = how team works, Dev Team = builds.

---

### Scrum Ceremonies
**1. Sprint Planning (start of sprint):**
- Select user stories from backlog
- Define sprint goal
- Estimate tasks

**2. Daily Standup (15 min daily):**
- What did I do yesterday?
- What will I do today?
- Any blockers?

**3. Sprint Review (end of sprint):**
- Demo completed work to stakeholders
- Gather feedback

**4. Sprint Retrospective (after review):**
- What went well?
- What can improve?
- Action items for next sprint

**Key takeaway:** Planning → Daily → Review → Retrospective.

---

### User Stories & Acceptance Criteria
**User Story:** Feature from user perspective.

**Format:** "As a [role], I want [feature] so that [benefit]"

**Example:** "As a user, I want to reset my password so that I can regain access if I forget it."

**Acceptance Criteria:** Conditions for story to be complete.
- Given [context], When [action], Then [outcome]
- Example: "Given user clicks 'Forgot Password', When they enter email, Then they receive reset link."

**Key takeaway:** User story = user perspective. AC = definition of done.

---

### Estimation Techniques
**Story Points:**
- Relative effort (not time)
- Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)
- Larger numbers = more uncertainty

**Planning Poker:**
- Team members independently estimate
- Reveal simultaneously
- Discuss differences, re-estimate

**Velocity:**
- Story points completed per sprint
- Used to forecast future sprints

**Key takeaway:** Story points = relative effort. Velocity = historical completion rate.

---

## DevOps & CI/CD

### What is DevOps?
**DevOps:** Culture combining Development (Dev) and Operations (Ops). Goal: Shorten development cycles, increase deployment frequency.

**Key practices:**
- **Continuous Integration (CI):** Merge code frequently, auto-test
- **Continuous Delivery (CD):** Auto-deploy to staging
- **Continuous Deployment:** Auto-deploy to production
- **Infrastructure as Code (IaC):** Terraform, CloudFormation
- **Monitoring & Logging:** Prometheus, ELK stack

**Benefits:**
- Faster releases
- Reduced failures
- Faster recovery

**Key takeaway:** Dev + Ops. Automate build, test, deploy.

---

### CI/CD Pipeline
**Continuous Integration (CI):**
1. Developer commits code to Git
2. CI server (Jenkins, GitHub Actions) triggers build
3. Run automated tests (unit, integration)
4. If pass, create artifact (JAR, Docker image)
5. If fail, notify developer

**Continuous Delivery (CD):**
6. Deploy artifact to staging environment
7. Run smoke tests
8. Ready for manual deployment to production

**Continuous Deployment:**
9. Auto-deploy to production (no manual approval)

**Tools:**
- CI/CD: Jenkins, GitHub Actions, GitLab CI, CircleCI
- Artifact storage: Nexus, Artifactory, Docker Registry
- Deployment: Kubernetes, AWS ECS, Ansible

**Key takeaway:** Code → Build → Test → Deploy (auto).

---

### Infrastructure as Code (IaC)
**Definition:** Manage infrastructure with code (not manual clicks).

**Tools:**
- **Terraform:** Cloud-agnostic, declarative
- **CloudFormation:** AWS-specific
- **Ansible:** Configuration management
- **Pulumi:** Code in general-purpose languages

**Benefits:**
- Version control for infrastructure
- Reproducible environments
- Faster provisioning

**Example (Terraform):**
```hcl
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t3.micro"
}
```

**Key takeaway:** Infrastructure as code. Version controlled. Reproducible.

---

### Monitoring & Logging
**Monitoring:** Track system health, performance metrics.
- **Tools:** Prometheus, Grafana, Datadog, New Relic
- **Metrics:** CPU, memory, request rate, latency, error rate

**Logging:** Record application events.
- **Tools:** ELK Stack (Elasticsearch, Logstash, Kibana), Splunk
- **Centralized logging:** Aggregate logs from all services

**Alerting:** Notify on anomalies (PagerDuty, Opsgenie)

**Key takeaway:** Monitor metrics. Centralize logs. Alert on issues.

---

## Testing Strategies

### Testing Pyramid
**Levels (bottom to top):**
1. **Unit Tests (70%):**
   - Test individual functions/methods
   - Fast, isolated
   - JUnit, pytest, Jest

2. **Integration Tests (20%):**
   - Test module interactions
   - Database, external services
   - Spring Boot Test, Supertest

3. **End-to-End Tests (10%):**
   - Test entire workflow (UI to DB)
   - Slow, brittle
   - Selenium, Cypress, Playwright

**Key takeaway:** More unit tests, fewer E2E. Fast feedback.

---

### Test-Driven Development (TDD)
**Definition:** Write tests before code.

**Cycle:**
1. **Red:** Write failing test
2. **Green:** Write minimal code to pass
3. **Refactor:** Improve code, tests still pass

**Benefits:**
- Better design (testable code)
- Confidence in refactoring
- Living documentation

**Challenges:**
- Learning curve
- Initial slowdown

**Key takeaway:** Test first. Red → Green → Refactor.

---

### Testing Types
**Functional Testing:**
- Unit, Integration, E2E
- Verify features work correctly

**Non-Functional Testing:**
- **Performance:** Load, stress testing (JMeter, Gatling)
- **Security:** Penetration testing, vulnerability scans
- **Usability:** UI/UX testing

**Regression Testing:** Ensure new changes don't break existing features.

**Smoke Testing:** Basic checks after deployment.

**Key takeaway:** Functional = features, Non-functional = performance/security.

---

## Version Control & Branching

### Git Basics
**Key commands:**
```bash
git clone <repo>          # Clone repository
git add <file>            # Stage changes
git commit -m "message"   # Commit
git push                  # Push to remote
git pull                  # Fetch and merge
git branch <name>         # Create branch
git checkout <branch>     # Switch branch
git merge <branch>        # Merge branch
```

**Key takeaway:** Add → Commit → Push. Branch → Merge.

---

### Branching Strategies
**1. Git Flow:**
- **main:** Production-ready code
- **develop:** Integration branch
- **feature/*:** New features (from develop)
- **release/*:** Prepare release (from develop)
- **hotfix/*:** Urgent fixes (from main)

**Workflow:** feature → develop → release → main

**2. GitHub Flow (simpler):**
- **main:** Production
- **feature branches:** Branch from main, PR to main
- Continuous deployment

**3. Trunk-Based Development:**
- Everyone commits to main (trunk)
- Short-lived feature branches (< 1 day)
- Feature flags for incomplete features

**Key takeaway:** Git Flow = complex, GitHub Flow = simple, Trunk = very simple.

---

### Pull Requests (PR) / Merge Requests (MR)
**Definition:** Request to merge code from one branch to another.

**PR workflow:**
1. Create feature branch
2. Make changes, commit
3. Open PR (describe changes)
4. Code review (approve/request changes)
5. Merge (squash, rebase, or merge commit)

**Benefits:**
- Code review
- Discussion
- CI checks before merge

**Key takeaway:** PR = code review + discussion + CI checks.

---

## Code Quality & Reviews

### Code Review Best Practices
**For Reviewers:**
- Be constructive, not critical
- Focus on logic, not style (use linters)
- Ask questions, suggest improvements
- Approve promptly

**For Authors:**
- Small PRs (< 400 lines)
- Clear description
- Self-review first
- Respond to feedback

**What to check:**
- Correctness (does it work?)
- Design (is it maintainable?)
- Tests (adequate coverage?)
- Performance (any bottlenecks?)
- Security (vulnerabilities?)

**Key takeaway:** Small PRs. Constructive feedback. Focus on logic.

---

### Code Quality Tools
**Linters:** Enforce style, find bugs
- **ESLint (JavaScript)**, **Pylint (Python)**, **Checkstyle (Java)**

**Static Analysis:** Find bugs without running code
- **SonarQube**, **CodeClimate**, **PMD**

**Code Formatters:** Consistent style
- **Prettier (JavaScript)**, **Black (Python)**, **Google Java Format**

**Code Coverage:** Measure test coverage
- **JaCoCo (Java)**, **Istanbul (JavaScript)**, **Coverage.py (Python)**

**Key takeaway:** Linters, static analysis, formatters, coverage tools.

---

### Technical Debt
**Definition:** Shortcuts in code that save time now but cost more later.

**Causes:**
- Rushed deadlines
- Lack of knowledge
- Changing requirements

**Management:**
- Track in backlog
- Allocate time in sprints (e.g., 20% per sprint)
- Refactor continuously

**Key takeaway:** Short-term shortcuts. Pay back regularly.

---

## Best Practices

### Development Best Practices
1. **Write clean code:** Readable, simple, self-documenting
2. **Follow SOLID principles:** Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
3. **DRY (Don't Repeat Yourself):** Avoid duplication
4. **KISS (Keep It Simple, Stupid):** Simplest solution that works
5. **YAGNI (You Aren't Gonna Need It):** Don't add features "just in case"
6. **Write tests:** Unit, integration, E2E
7. **Code reviews:** Every PR reviewed
8. **Version control:** Commit often, meaningful messages

**Key takeaway:** Clean code, SOLID, DRY, KISS, YAGNI, tests, reviews.

---

### Documentation
**Types:**
1. **Code comments:** Why, not what (code shows what)
2. **README:** Project overview, setup, usage
3. **API documentation:** Swagger/OpenAPI, Postman
4. **Architecture diagrams:** System design, data flow
5. **Runbooks:** Operations guides (deployment, troubleshooting)

**Best practices:**
- Keep docs updated
- Write for future you (or new team member)
- Use diagrams (a picture = 1000 words)

**Key takeaway:** README, API docs, architecture diagrams. Keep updated.

---

### Security Best Practices
1. **Never commit secrets:** Use environment variables, secret managers
2. **Input validation:** Prevent SQL injection, XSS
3. **Authentication/Authorization:** Use proven libraries (OAuth, JWT)
4. **HTTPS:** Encrypt in transit
5. **Encrypt sensitive data:** At rest (database encryption)
6. **Dependency scanning:** Check for vulnerable libraries (Snyk, Dependabot)
7. **Principle of least privilege:** Minimal permissions
8. **Regular security audits**

**Key takeaway:** No secrets in code. Validate input. Encrypt. Scan dependencies.

---

### Deployment Best Practices
1. **Blue-Green Deployment:** Two environments (blue = old, green = new), switch traffic
2. **Canary Deployment:** Gradual rollout (5% → 50% → 100%)
3. **Feature Flags:** Enable/disable features without deployment
4. **Rollback plan:** Quick rollback if issues
5. **Health checks:** Verify service health
6. **Monitoring:** Track metrics, logs, alerts
7. **Database migrations:** Backward-compatible, test thoroughly

**Key takeaway:** Blue-green, canary, feature flags. Monitor. Rollback ready.

---

## Interview Tips

1. **Explain methodologies:** "Agile for flexible requirements, Waterfall for fixed regulatory projects."
2. **Discuss experience:** "Used Scrum in previous role: daily standups, 2-week sprints."
3. **CI/CD knowledge:** "Set up Jenkins pipeline: build → test → Docker image → deploy to K8s."
4. **Testing pyramid:** "70% unit tests for fast feedback, 10% E2E for critical flows."
5. **Code quality:** "Used SonarQube for static analysis, enforced 80% code coverage."

**Key concepts:** Agile/Scrum, CI/CD, testing strategies, Git branching, code reviews

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
