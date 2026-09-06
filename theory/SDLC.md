# Software Delivery Lifecycle - Professional Interview Guide

> This is not the textbook SDLC. This is how software actually gets built, reviewed,
> shipped, broken, and repaired inside real engineering organisations. Every section
> answers: **what it is, why it exists, how it works, when to use it, when NOT to use
> it, and what it costs you.**

## Table of Contents
1. [The Real Delivery Loop](#the-real-delivery-loop)
2. [Methodologies: The Honest Take](#methodologies-the-honest-take)
3. [Where Scrum Actually Goes Wrong](#where-scrum-actually-goes-wrong)
4. [Requirements: Where Projects Actually Fail](#requirements-where-projects-actually-fail)
5. [Estimation and the Communication of Uncertainty](#estimation-and-the-communication-of-uncertainty)
6. [Design Docs, RFCs and ADRs](#design-docs-rfcs-and-adrs)
7. [Branching Strategy and Git at Scale](#branching-strategy-and-git-at-scale)
8. [Code Review as a Craft](#code-review-as-a-craft)
9. [Testing Strategy](#testing-strategy)
10. [CI/CD: The Real Pipeline](#cicd-the-real-pipeline)
11. [Deployment Strategies and Rollback Characteristics](#deployment-strategies-and-rollback-characteristics)
12. [Zero-Downtime Database Migrations](#zero-downtime-database-migrations)
13. [Release Engineering: Flags, Dark Launches, Kill Switches](#release-engineering-flags-dark-launches-kill-switches)
14. [Incident Management](#incident-management)
15. [Technical Debt as an Engineering Decision](#technical-debt-as-an-engineering-decision)
16. [Observability and DORA Metrics](#observability-and-dora-metrics)
17. [Production War Stories](#production-war-stories)
18. [Common Pitfalls](#common-pitfalls)
19. [Junior vs Senior](#junior-vs-senior)
20. [Interview Questions](#interview-questions)

---

## The Real Delivery Loop

### WHAT it is

The textbook draws SDLC as a line: Requirements → Design → Implementation → Testing →
Deployment → Maintenance. That line describes a document workflow, not a software
organisation. What actually exists is a **loop with multiple nested feedback cycles of
wildly different speeds**, and the entire discipline of modern software delivery is the
art of making the inner loops fast and the outer loops honest.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        THE FOUR NESTED FEEDBACK LOOPS                        │
└──────────────────────────────────────────────────────────────────────────────┘

  LOOP 1 - THE EDIT LOOP                              target: < 1 second
  ┌────────────────────────────────────────────────┐
  │  type → save → typecheck/HMR → see result      │
  └────────────────────────────────────────────────┘
                       ↓ (dozens per hour)
  LOOP 2 - THE COMMIT LOOP                            target: < 10 minutes
  ┌────────────────────────────────────────────────┐
  │  commit → push → CI (lint/type/test/build)     │
  │         → review → merge to trunk              │
  └────────────────────────────────────────────────┘
                       ↓ (1-5 per day per engineer)
  LOOP 3 - THE RELEASE LOOP                           target: < 1 hour
  ┌────────────────────────────────────────────────┐
  │  merge → deploy to prod (dark) → canary        │
  │        → progressive rollout → 100%            │
  └────────────────────────────────────────────────┘
                       ↓ (continuously)
  LOOP 4 - THE LEARNING LOOP                          target: < 1 quarter
  ┌────────────────────────────────────────────────┐
  │  usage data → did it move the metric?          │
  │  incidents → postmortems → systemic fixes      │
  │  → reprioritise → next bet                     │
  └────────────────────────────────────────────────┘

  KEY PROPERTY: the cost of a mistake is proportional to which loop catches it.
  Loop 1 catches it for free. Loop 4 catches it after you burned a quarter.
```

### WHY it exists in this shape

Because **information about whether you built the right thing only exists after users
touch it**, and information about whether you built the thing right only exists after
the code runs. Every methodology argument in the industry — Waterfall vs Agile, big
design up front vs emergent design — is fundamentally an argument about *how much you
are willing to bet before the feedback arrives*.

Waterfall bets a whole project. Scrum bets two weeks. Continuous delivery with feature
flags bets one merge. Shape Up bets six weeks with an explicit stop-loss.

### HOW a senior actually uses this model

When something goes wrong, a senior engineer's first question is not "who broke it" but
**"which loop should have caught this, and why didn't it?"**

| Failure | Loop that should have caught it | Systemic fix |
|---|---|---|
| Type error in production | Loop 1 (editor) | Enable strict mode; the type existed but wasn't checked |
| Broken API contract | Loop 2 (CI) | Add contract tests |
| Performance regression under real traffic | Loop 3 (canary) | Canary with latency gates |
| Feature nobody uses | Loop 4 (learning) | Instrument before building; ship a dark launch first |

If you keep fixing incidents at Loop 4 that should have been caught at Loop 2, you do
not have a people problem. You have a pipeline problem.

### WHEN NOT to optimise the loop

Not every product needs a one-hour release loop. Firmware for a medical device,
a satellite payload, a game shipped on a physical cartridge, a bank's core ledger under
regulatory change control — these have genuinely expensive or impossible rollback. There
the correct move is to **push verification left** (formal specs, simulation, extensive
staging, hardware-in-the-loop testing), because you cannot rely on production feedback.

The trap is teams that have cheap rollback and *behave* as if they don't: quarterly
release trains, three-week manual QA cycles, change advisory boards for a CSS fix. They
are paying Waterfall costs for SaaS risk.

### TRADE-OFFS

- Fast loops require investment in automation that produces zero customer value directly.
  You are trading present feature velocity for future feature velocity. The payback
  period on CI investment is usually 2-3 months for a team of 5+.
- Fast loops without observability are just fast ways to break things. Deployment
  frequency without change-failure-rate tracking is a vanity metric.

---

## Methodologies: The Honest Take

### The comparison that actually matters

| | Waterfall | Scrum | Kanban | Shape Up | Trunk-based CD |
|---|---|---|---|---|---|
| Unit of commitment | Project | Sprint (1-4 wk) | Single work item | Cycle (6 wk) | Single change |
| What's fixed | Scope | Time | Nothing | Time + appetite | Nothing |
| What flexes | Time + cost | Scope | Priority order | Scope | Scope |
| Planning horizon | Months | Weeks | Days | 6 weeks + 2 cooldown | Continuous |
| Best for | Fixed regulated scope | Teams needing rhythm | Interrupt-driven work | Product teams w/ trust | Mature infra teams |
| Fails when | Requirements change | Velocity becomes a target | No WIP limits enforced | Team lacks autonomy | No feature flags |
| Real failure mode | Integration hell at the end | Ceremony theatre | Board becomes a graveyard | Scope creep past appetite | Untested trunk |

### Waterfall — WHY it exists and when it is correct

**WHAT:** Sequential phases with formal sign-off gates between them.

**WHY it exists:** It came from construction and manufacturing, where the cost of change
after a phase completes is genuinely enormous. Ironically, Winston Royce's 1970 paper
that is credited with inventing Waterfall actually described the pure sequential model as
*risky* and argued for iteration. The industry cited the diagram and ignored the text.

**WHEN it is genuinely correct:**
- Regulatory submissions where the artifact *is* the documentation (FDA 510(k), DO-178C
  avionics, EN 50128 rail signalling). The traceability matrix is a deliverable.
- Fixed-price contracts with an external client where scope change is a commercial event.
- Hardware co-design where the software must be finished before a tape-out or tooling run.

**WHEN NOT:** Anything where you learn about requirements by shipping. Which is most
product software.

**TRADE-OFF:** Waterfall's real cost is not rigidity, it's that **all integration risk is
deferred to the end**. You find out that the three teams' modules don't fit together in
month 9 of a 10-month project. Modern regulated teams solve this by doing continuous
integration internally and Waterfall-shaped *documentation* externally.

### Agile — what the manifesto actually said

The 2001 manifesto is four value statements, each of the form "A over B", where **B is
still valuable**. This is the most-misquoted document in software.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Individuals and interactions  OVER  processes and tools               │
│  Working software              OVER  comprehensive documentation       │
│  Customer collaboration        OVER  contract negotiation              │
│  Responding to change          OVER  following a plan                  │
│                                                                        │
│  "That is, while there is value in the items on the right,             │
│   we value the items on the left more."   ← the sentence               │
│                                              everyone drops            │
└────────────────────────────────────────────────────────────────────────┘
```

"Working software over comprehensive documentation" was never "don't write design docs."
It was written in an era when teams produced 200-page specifications that no one read
before writing any code. A three-page RFC that saves the team from a bad database choice
is *not* what the manifesto was arguing against.

### Kanban — WHAT, and the one rule that matters

**WHAT:** Visualise the workflow, limit work in progress, manage flow, make policies
explicit, improve collaboratively.

**The one rule that actually delivers value: WIP limits.** Everything else is a board.
Without WIP limits, Kanban is just a Trello board with extra vocabulary.

**WHY WIP limits work — Little's Law:**

```
        Average Cycle Time  =  Work In Progress  ÷  Throughput

  Team of 5, throughput ~5 items/week:
  ┌──────────────────────────────────────────────────────────────┐
  │  WIP = 5   →  cycle time = 5/5  = 1.0 weeks                  │
  │  WIP = 15  →  cycle time = 15/5 = 3.0 weeks                  │
  │  WIP = 30  →  cycle time = 30/5 = 6.0 weeks                  │
  └──────────────────────────────────────────────────────────────┘

  Throughput did NOT improve when WIP tripled. Only cycle time got worse,
  because context switching and coordination overhead grew.
  Starting more work does not finish more work.
```

This is the single most useful piece of maths in delivery management, and the reason a
senior engineer pushes back on "can you also pick up this ticket" when three are already
in flight.

**WHEN Kanban beats Scrum:** Support teams, platform/infra teams, anything with
unpredictable arrival of work. You cannot sprint-plan around a pager.

**WHEN NOT:** Teams that need a forcing function to finish things. Without the sprint
boundary, some teams let items linger indefinitely. Kanban demands more discipline, not
less.

### Shape Up — the underrated option

**WHAT:** Basecamp's method. Work is "shaped" at a rough-but-solved level of fidelity by
a small senior group, given a fixed **appetite** (2 weeks or 6 weeks), and handed to a
team with full autonomy over implementation. Six-week cycles, then a two-week cooldown.
No backlog — unbuilt ideas simply expire.

**WHY it exists:** It attacks two specific failures of Scrum: (1) estimation theatre —
instead of "how long will this take", you ask "what is this worth", and design to fit;
(2) the infinite backlog of stale tickets that nobody will ever do but everyone feels
guilty about.

**The mechanism that makes it work — the circuit breaker:** if the work isn't done at
the end of the cycle, it does **not** automatically get an extension. It stops. To
continue, it must be re-pitched and win against everything else. This is a genuine
stop-loss on sunk cost.

**WHEN NOT:** Teams without senior people who can shape well; agencies with fixed
external scope; teams with heavy interrupt load. Shape Up requires trust and a protected
team.

---

## Where Scrum Actually Goes Wrong

Scrum is a reasonable framework. What ships in most companies under the name "Scrum" is
a specific set of degradations, and a senior engineer needs to be able to name them
precisely, because "our process is bad" is not actionable feedback.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    HOW EACH CEREMONY DEGRADES IN PRACTICE                     │
└──────────────────────────────────────────────────────────────────────────────┘

  CEREMONY          INTENDED PURPOSE              DEGRADED FORM
  ─────────────────────────────────────────────────────────────────────────────
  Daily standup     Team syncs, surfaces          Status report to a manager.
                    blockers, self-organises      Everyone talks to one person,
                                                  nobody talks to each other.
                                    ↓
                    FIX: ask "what is blocked and who can unblock it?"
                    Walk the board right-to-left, not person-by-person.
  ─────────────────────────────────────────────────────────────────────────────
  Sprint planning   Team pulls work it            Manager pushes a pre-decided
                    believes it can finish        scope; "commitment" is
                                                  extracted, not offered.
                                    ↓
                    FIX: capacity is stated by the team, not negotiated down.
  ─────────────────────────────────────────────────────────────────────────────
  Estimation        Shared understanding,         Points→days conversion table
                    surfaces disagreement         published; points become
                                                  deadlines with a costume on.
                                    ↓
                    FIX: never publish a point→hours ratio. Ever.
  ─────────────────────────────────────────────────────────────────────────────
  Velocity          Team's own forecasting        Cross-team comparison metric
                    input                         in a management dashboard.
                                    ↓
                    FIX: velocity is a capacity input, never a performance output.
  ─────────────────────────────────────────────────────────────────────────────
  Retrospective     Team changes its own          Ritual complaining with no
                    system                        owned action items; same
                                                  issues raised for 9 months.
                                    ↓
                    FIX: max 2 actions, each with a named owner and a due sprint.
                    Start the next retro by reviewing them.
  ─────────────────────────────────────────────────────────────────────────────
  Sprint review     Stakeholders see working      Slide deck about work that
                    software and react            is "90% done".
                                    ↓
                    FIX: demo from production or a real environment. No slides.
```

### Failure mode 1: velocity becomes a management metric

**The mechanism (Goodhart's Law):** *When a measure becomes a target, it ceases to be a
good measure.*

Velocity is the team's own empirical measure of how much it completes per sprint. It has
exactly one legitimate use: the team's own forecasting. The moment velocity appears in a
dashboard comparing Team A to Team B, points inflate. Nobody decides to cheat; the
estimate for the same work simply drifts upward, because there is no downside to a
higher number and a large downside to a lower one.

```
  ❌ WRONG
  ─────────────────────────────────────────────────────────────
  Director: "Team A did 42 points, Team B did 28. Why is B slow?"

  What actually happens next:
    Sprint 1: Team B estimates honestly.       28 points.
    Sprint 2: Team B "recalibrates".           35 points, same work.
    Sprint 3: Points are now meaningless.      50 points, same work.
    Sprint 6: Nobody trusts any estimate,
              including the team itself.
  Cost: you have destroyed your own planning instrument.

  ✅ CORRECT
  ─────────────────────────────────────────────────────────────
  Director: "What's our lead time from merge to production, and
             what's our change failure rate? Where's the queue?"

  These are flow metrics. They are hard to game without actually
  improving, because gaming them means shipping faster and safer.
```

### Failure mode 2: story points become deadlines

Story points exist to be **relative, not absolute**, precisely so they can't be converted
to a commitment. The moment someone writes "1 point = 4 hours" on a wiki, you have
reinvented hour estimates with an extra translation layer and lost the one property that
made them useful.

**How a senior handles the "so how many days is 8 points?" question:**

> "Points aren't a time unit — they're a complexity comparison against work we've done
> before. What I can give you is a forecast from our actuals: over the last ten sprints
> we've completed between 24 and 38 points, median 31. This epic is 60 points. So the
> honest answer is two sprints if things go well, three if we hit the integration issues
> I'm worried about, and I'll know which by the end of next week when the spike lands.
> If you need a date for a commitment, I'd communicate the three-sprint number."

That answer gives a range, names the uncertainty, names when the uncertainty resolves,
and recommends which number to externalise. That is the senior deliverable.

### Failure mode 3: "Agile" as a synonym for "no planning"

The most expensive misreading in the industry. "We're Agile, we don't do design docs"
usually means "we discover the architecture through three rewrites."

Agile said *responding to change over following a plan*. Eisenhower's line is the honest
version: **"Plans are worthless, but planning is indispensable."** The artifact ages
badly; the act of thinking it through does not. A senior writes the design doc precisely
because they expect it to change — the doc is where the change gets reasoned about.

### Failure mode 4: the Scrum Master as a project manager

The role is defined as a servant-leader removing impediments and coaching. In practice it
frequently becomes a Jira administrator who chases status. The tell: the Scrum Master
assigns tickets to individuals during planning. In real Scrum the team pulls work; nobody
assigns it.

### Failure mode 5: "commitment" language

The 2011 Scrum Guide deliberately replaced "commitment" with "forecast" for sprint
backlogs. Most companies never got the memo. A forecast that is treated as a commitment
converts every sprint into a small deadline, which produces the exact behaviour Agile was
meant to remove: cutting tests and skipping review to "make the sprint."

### What actually good looks like

- The team decides how much it takes on. Nobody outside the team edits that number.
- Estimates are used for forecasting, never for evaluation.
- The board reflects reality within an hour, because updating it takes 5 seconds.
- Retros produce at most two owned changes, and the next retro checks them.
- Interruptions are visible on the board, not absorbed silently — otherwise capacity
  looks mysteriously low and nobody knows why.
- If a ceremony has not changed a decision in three months, delete it.

---

## Requirements: Where Projects Actually Fail

### The uncomfortable statistic

Across decades of post-project analysis, the dominant causes of failure are consistently
requirements-side, not engineering-side: incomplete requirements, changing requirements,
lack of user involvement, and unrealistic expectations. **Almost nothing is on the list
because the code was bad.** Teams are far better at building things than at deciding what
to build.

This is why "the senior engineer who asks the annoying question in refinement" is worth
more than the one who types fastest.

### User stories — WHAT and WHY

**WHAT:** `As a <role>, I want <capability>, so that <benefit>.`

**WHY the format exists:** Not as a template to fill in. Its purpose is to force three
things that get skipped: *who* is this for, *what* can they now do, and *why does anyone
care*. The third clause is the one that gets left blank, and it's the only one that lets
you cut scope intelligently later.

A user story is a **placeholder for a conversation**, not a specification. If your stories
are written in a document and thrown over a wall, you've built Waterfall with story
syntax.

```
❌ WRONG — a task wearing a story costume
  "As a user, I want a dropdown on the settings page so that I can use a dropdown."

  Problems: the benefit restates the capability (no actual why); it specifies
  the UI control, removing the engineer's ability to solve it better; you
  cannot tell whether shipping it succeeded or failed.

✅ CORRECT
  "As an account admin managing 50+ users, I want to change several users'
   roles at once, so that onboarding a new department doesn't take 50 separate
   edits."

  Now: the role is specific (admin, not 'user'), the pain is measurable
  (50 edits), the solution is open (bulk select? CSV import? role templates?),
  and success is observable (time-to-onboard a department).
```

### Acceptance criteria — the actual contract

The story is the conversation; **the acceptance criteria are the contract.** Two useful
formats, and knowing when to use each is a seniority signal:

**Given/When/Then (Gherkin)** — for behavioural, testable flows:

```gherkin
Scenario: Bulk role change succeeds
  Given I am signed in as an account admin
  And 3 users are selected in the user list
  When I choose "Set role → Editor" and confirm
  Then all 3 users have the role "Editor"
  And an audit log entry is written for each change
  And the list reflects the new roles without a page reload

Scenario: Partial failure is not silent
  Given 3 users are selected
  And one of them is the last remaining Owner
  When I choose "Set role → Editor" and confirm
  Then no roles are changed
  And I see an error naming the user that blocked the change
```

**Checklist format** — for non-behavioural criteria that Gherkin makes awkward:

```
- [ ] Bulk operation is limited to 100 users per request
- [ ] p95 latency for a 100-user bulk change is under 2s
- [ ] Feature is behind flag `bulk-role-edit`, default off
- [ ] Audit events emit to the existing `account.audit` stream
- [ ] Screen reader announces the result of the bulk action
- [ ] Rollback: disabling the flag hides the UI and the endpoint 404s
```

Notice that the second list contains the things that actually get forgotten: limits,
performance budgets, the flag, auditing, accessibility, and the rollback path. **A senior
engineer's contribution in refinement is mostly adding this second list.**

### INVEST — the sharpening tool

| Letter | Means | The question a senior actually asks |
|---|---|---|
| **I**ndependent | Can be built in any order | "If we ship only this one, does anything break?" |
| **N**egotiable | Not a rigid spec | "Is the *what* fixed but the *how* still ours?" |
| **V**aluable | Delivers user/business value | "Who notices if we ship this? What would they say?" |
| **E**stimable | Team can size it | "Do we know enough to size it, or do we need a spike?" |
| **S**mall | Fits in a sprint, ideally days | "Can one person finish this in under a week?" |
| **T**estable | Has a pass/fail condition | "What exactly would I assert in a test?" |

The two that catch the most problems: **Estimable** (if you can't estimate it, the answer
is a timeboxed spike, not a bigger number) and **Testable** (if nobody can state the
assertion, the requirement isn't understood yet).

### Definition of Ready vs Definition of Done

These are the two gates that prevent the two most common wastes: starting work that isn't
understood, and "finishing" work that isn't shippable.

```
┌────────────────────────────┐          ┌────────────────────────────┐
│    DEFINITION OF READY     │          │     DEFINITION OF DONE     │
│  (gate INTO the sprint)    │          │   (gate OUT of the story)  │
├────────────────────────────┤          ├────────────────────────────┤
│ • Problem + user stated    │          │ • Merged to trunk          │
│ • Acceptance criteria       │          │ • Code reviewed + approved │
│   written and reviewed      │          │ • Tests at the right level │
│ • Dependencies identified   │          │   written and passing      │
│   and unblocked             │          │ • Behind a flag if risky   │
│ • Design/UX attached where  │          │ • Observability: logs,     │
│   the UI is non-obvious     │          │   metric, alert if needed  │
│ • Team can size it          │          │ • Docs/runbook updated     │
│ • Non-functional needs      │          │ • Deployed to production   │
│   named (perf, security)    │          │ • Verified in production   │
│ • Rollback approach known   │          │ • Flag cleanup ticket filed│
└────────────────────────────┘          └────────────────────────────┘
        ↓ if not met                             ↓ if not met
   Do NOT pull it in.                     It is NOT done. "Done except
   Refine it or spike it.                 for tests" is not a state.
```

**The single most valuable line in a Definition of Done: "deployed to production and
verified."** Teams whose DoD stops at "merged" accumulate an invisible queue of unshipped
work, and they discover its bugs in a giant batch at release time.

**WHEN NOT to use a heavy DoR:** on a small trusted team doing exploratory work, a
formal readiness gate can be pure ceremony. The lightweight version is a single question
asked out loud in planning: *"Does everyone agree what 'done' means for this, and do we
know how we'd turn it off?"*

### Why the requirements phase actually fails

1. **The requester describes a solution, not a problem.** "Add an export button" hides
   "I reconcile these numbers in a spreadsheet every Monday." The second framing might be
   solved by a scheduled email, or by fixing the report they don't trust.
2. **Nobody talks to the actual user.** The stakeholder in the room is often a proxy.
3. **The unhappy paths are never specified.** 80% of the code and 95% of the bugs live in
   error, empty, partial-failure, concurrent-edit and permission-denied states, and
   almost no story mentions them.
4. **Non-functional requirements are assumed.** Nobody writes "must handle 10k rows"
   until it doesn't.
5. **"Obvious" is undefined.** Every unwritten assumption is a defect waiting to be born.

**The senior's four questions in every refinement:**
- What happens when this fails halfway through?
- What's the largest realistic input, and what happens at 10x that?
- Who is allowed to do this, and what does someone unauthorised see?
- How do we turn it off if it's wrong in production?

---

## Estimation and the Communication of Uncertainty

### WHY estimates are wrong — and it isn't laziness

Estimates are not wrong because engineers are optimistic (though they are). They are
wrong for structural reasons:

1. **You are estimating an unknown quantity of unknown work.** The estimate covers what
   you've thought of. Every project contains work you have not yet imagined.
2. **The distribution is not symmetric.** Work can finish at most a little early — you
   can't go below the actual work required. It can overrun without bound. The
   distribution has a hard floor and a long right tail, so the *mean* is always greater
   than the *mode*. Your gut produces the mode: "how long if it goes normally."
3. **Estimates are of coding time; delivery includes review, CI, environments, QA,
   deploy windows, and the three interruptions per day.**
4. **Estimates get anchored.** "Could this be done by Friday?" has already destroyed the
   estimate before anyone thought about it.

```
     PROBABILITY
        │
        │        ╭─╮   ← the mode: "if nothing goes wrong"  (what you say)
        │       ╱   ╲
        │      ╱     ╲___
        │     ╱          ╲────────                ← long right tail:
        │    ╱                    ╲──────────       unknown unknowns,
        │   ╱                            ╲──────    dependencies, an
        │  ╱                                  ╲───  incident, a rewrite
        └─┴──────┴────────────────────────────────────────────→  TIME
          3d    5d          ↑                      3 weeks
                          mean ≈ 9d
                     (what actually happens on average)

  You cannot fix this with pressure. You can only fix it by
  communicating a distribution instead of a point.
```

### The cone of uncertainty

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          THE CONE OF UNCERTAINTY                             │
└──────────────────────────────────────────────────────────────────────────────┘

  EFFORT
  ESTIMATE
  MULTIPLIER
     4.0x ┤╲
          │ ╲
     2.0x ┤  ╲──╲
          │      ╲───╲
     1.5x ┤           ╲────╲
     1.0x ┼────────────────────────────────────────●  actual
     0.7x ┤           ╱────╱
          │      ╱───╱
     0.5x ┤  ╱──╱
     0.25x┤╱
          └────────┴─────────┴──────────┴──────────┴────────────→
       initial   after     after      after      code
       concept   reqs      design     spike      complete

  At "initial concept", a 4-week estimate honestly means
  "somewhere between 1 week and 16 weeks."

  ┌──────────────────────────────────────────────────────────────┐
  │ THE CRITICAL INSIGHT:                                        │
  │ The cone narrows because you DID WORK, not because time      │
  │ passed. An estimate does not improve while you stare at it.  │
  │ If someone needs a tighter number, the answer is a spike.    │
  └──────────────────────────────────────────────────────────────┘
```

### Story points vs time — what each is actually for

| | Story points | Ideal days / hours |
|---|---|---|
| Measures | Relative size: complexity + effort + uncertainty | Absolute duration |
| Comparable across teams? | **No.** Never. | Slightly, and misleadingly |
| Immune to "who does it"? | Mostly | No |
| Converts to a date | Only via measured velocity, as a range | Directly, which is the trap |
| Fails when | Published as a time conversion | Treated as a commitment |

The genuine argument for points: they let a team forecast without ever producing a number
that a stakeholder can hold you to as a promise. The genuine argument against: they
require organisational maturity that many companies don't have, and if the organisation
is going to convert them to dates anyway, you have added ceremony for nothing. Some very
strong teams estimate in nothing but "S / M / L / too big — split it" and forecast from
throughput. That is a legitimate senior position.

### Planning poker — what it is actually for

**Everyone estimates simultaneously, reveals at once, and the outliers explain
themselves.**

The point is **not** the number. The point is the moment when one person says 2 and
another says 13, because that gap always means one of them knows something the other
doesn't. That discovered information — "there's a legacy code path in there", "we have to
migrate the old records too" — is the entire value of the exercise. The estimate is a
by-product.

Simultaneous reveal exists purely to prevent anchoring on the loudest or most senior
voice. If your team goes around the table one at a time, you are not doing planning
poker; you are doing sequential anchoring.

### Reference-class forecasting — the technique that actually works

**WHAT:** Instead of estimating this task from first principles (the "inside view"),
find the class of similar past work and use its actual distribution (the "outside view").

**WHY it works:** Your inside view is systematically optimistic because it can only model
the work you've thought of. Your history contains all the work you didn't think of, in
aggregate, automatically.

```
  ❌ INSIDE VIEW (what everyone does by default)
  ───────────────────────────────────────────────────────────────
  "The integration needs an auth handler, a mapper, and a webhook
   receiver. That's about 5 days."
  → Estimates only the imagined work. Missing: their sandbox is
    broken for a week, their pagination is undocumented, legal
    review of the data-sharing terms, retry semantics.

  ✅ OUTSIDE VIEW
  ───────────────────────────────────────────────────────────────
  "We've integrated four third-party APIs in the past two years:
      Stripe        11 days
      Twilio         8 days
      Salesforce    31 days   ← their sandbox + their support SLA
      Segment        9 days
   Median 10, worst 31. This one resembles Salesforce (enterprise
   vendor, ticket-based support, unclear docs).
   Forecast: 10 days if it's a normal one, 30 if it's a Salesforce.
   I'll know which within 3 days of touching their sandbox."
```

This is more accurate than any amount of task breakdown, and it takes ten minutes. The
prerequisite is that someone tracked how long past work actually took — which is the
strongest practical argument for keeping cycle-time data.

### How a senior communicates uncertainty

The failure mode of juniors is a single number. The failure mode of over-corrected
seniors is refusing to give a number at all, which reads as evasion and gets you excluded
from planning conversations.

```
❌ WRONG (junior, point estimate)
  "Two weeks."
  → Heard as a promise. Repeated in a roadmap. Becomes a deadline.
    When it takes four, you have "missed" something you never agreed to.

❌ ALSO WRONG (evasive)
  "You can't estimate software, it depends on too many things."
  → True and useless. You will now be estimated *for*.

✅ CORRECT
  "Base case is two weeks. The risk is the payments provider's
   sandbox — if their test environment behaves like it did on the
   last integration, add a week. So: 2 weeks likely, 3 weeks if
   that risk lands, and I'd plan externally on 3.
   I'll know which by Wednesday. If you need it faster, we can cut
   the reconciliation report and ship it in 8 days — that's a real
   trade, not a compression."
```

This does four things simultaneously: gives a usable number, names the *specific* risk
(not "unknowns"), states when the uncertainty resolves, and offers a scope lever. That
last part is what turns you from an estimator into a partner in the decision.

**Padding vs honesty.** Silently multiplying by 2 is a lie that works until someone
notices, and it teaches stakeholders to divide your numbers by 2. Naming the risk
explicitly — "3 weeks, of which 1 is buffer for the vendor integration risk" — is
defensible, auditable, and survives scrutiny.

### WHEN NOT to estimate at all

- **Bug investigations.** You cannot estimate a search. Timebox it: "4 hours, then we
  report what we know and decide."
- **Spikes.** By definition the output is information, not a feature. Timebox and define
  the question to be answered.
- **Sub-day tasks.** The estimation overhead exceeds the work. Use #NoEstimates-style
  throughput counting: count items, don't size them. For a stream of similar small work,
  "we finish 9±3 items per week" forecasts as well as points do, at zero cost.

---

## Design Docs, RFCs and ADRs

This is the actual senior deliverable. Junior engineers are measured on code; senior
engineers are measured on **decisions that survive contact with reality, and on whether
anyone can understand those decisions two years later.**

### The three artifacts and how they differ

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  DESIGN DOC / RFC                     │  ADR                                 │
├───────────────────────────────────────┼──────────────────────────────────────┤
│  Purpose: get alignment BEFORE        │  Purpose: record WHY a decision was  │
│  building something substantial       │  made, for future readers            │
│  Length: 2-8 pages                    │  Length: 1 page, always              │
│  Lifespan: weeks (then stale)         │  Lifespan: forever (immutable)       │
│  Audience: reviewers, now             │  Audience: whoever is confused in    │
│                                       │  18 months (often you)               │
│  Written: before implementation       │  Written: at the moment of decision  │
│  Updated: during review               │  NEVER updated — superseded instead  │
│  Lives: wiki / doc tool               │  Lives: in the repo, in git          │
└───────────────────────────────────────┴──────────────────────────────────────┘

  A design doc can contain several decisions. Each significant, hard-to-reverse
  one gets its own ADR extracted from it.
```

### WHEN to write a design doc

Write one when **any** of these is true:
- The work will take more than ~2 weeks.
- It changes a public interface, a data model, or a contract another team depends on.
- It is expensive to reverse (data migration, a new datastore, a new external dependency).
- Two or more people disagree about the approach.
- It has security, privacy, or compliance implications.
- You are choosing between named alternatives and the choice is not obvious.

**WHEN NOT:** A bug fix. A CRUD endpoint that matches twelve existing ones. Anything
where writing the doc costs more than writing the code and throwing it away. Design docs
have a real cost — reviewer attention is the scarcest resource in an engineering org.
Requiring one for everything means nobody reads any of them carefully.

### A real design doc template

```markdown
# Design: <short, specific title>

| | |
|---|---|
| Author        | @you |
| Reviewers     | @staff-eng, @security, @owning-team |
| Status        | Draft / In Review / Approved / Superseded by <link> |
| Created       | 2026-08-30 |
| Target        | Q4 |

## 1. Summary
Three sentences, maximum. What are we building and why. If a reviewer reads
only this, they should be able to decide whether they need to read the rest.

## 2. Problem
What is broken or missing today? Quantify it. Not "search is slow" but "p95
search latency is 4.2s; support gets ~30 tickets/month about it; the funnel
drops 18% between search and result-click."
Include: who is affected, how often, what it costs.

## 3. Goals and Non-Goals
### Goals
- p95 search latency < 500ms for the top 3 query shapes
- No change to the public search API contract

### Non-Goals  ← the most valuable section in the document
- Not adding semantic/vector search (separate proposal)
- Not changing the ranking algorithm
- Not supporting multi-tenant search isolation in v1

Non-goals prevent scope creep during review, when a reviewer says
"while you're in there, could you also..."

## 4. Current State
How it works today. Include a diagram. Reviewers cannot evaluate a change
if they don't share your model of the starting point.

## 5. Proposed Design
The actual design. Include:
- Architecture diagram (boxes and arrows)
- Data model changes, with the exact DDL
- API changes, with request/response examples
- The sequence for the important flow
- What happens on failure of each dependency

## 6. Alternatives Considered   ← the section that proves you thought
### Alternative A: <name>
  Pros: ...
  Cons: ...
  Why not chosen: ...
### Alternative B: Do nothing
  Always include this one. Sometimes it wins.

A design doc without real alternatives is a proposal, not a design. If the
alternatives are strawmen, reviewers will notice and trust the whole doc less.

## 7. Cross-Cutting Concerns
- **Security / privacy:** what data, what classification, who can read it,
  what's in the audit log, does this need a privacy review?
- **Performance:** expected load, the budget, what happens at 10x
- **Cost:** infra delta per month
- **Failure modes:** for each dependency — what if it's slow? down? wrong?
- **Backwards compatibility:** who breaks, and what's the deprecation path?

## 8. Rollout Plan
- Flag name and default
- Phases: internal → 1% → 10% → 50% → 100%
- The metric watched at each gate, and the abort threshold
- Rollback procedure, and how long it takes
- Data migration plan (see expand-contract)

## 9. Testing Strategy
What is tested at which level, and specifically what you are choosing NOT
to test and why.

## 10. Observability
The dashboards, metrics, and alerts that will exist before this ships.
"How will we know this is broken at 3am?"

## 11. Open Questions
List them honestly. A doc with no open questions is usually hiding them.

## 12. Timeline / Milestones
Milestones that are independently valuable, not phases of one big bang.
```

**How to run the review:** send it with a *deadline* ("comments by Thursday, decision
Friday"), tag specific people with specific asks ("@security — section 7 only"), and if
comments exceed ~20 threads, stop and hold a 30-minute meeting instead. Async review has
a fan-out limit; past it, it becomes slower than a meeting, not faster.

### A real ADR template

Architecture Decision Records were proposed by Michael Nygard. The whole point is that
they are **short, immutable, numbered, and live in the repository next to the code.**

```markdown
# ADR-0017: Use Postgres advisory locks for job deduplication

- **Status:** Accepted
- **Date:** 2026-08-30
- **Deciders:** @you, @platform-lead
- **Supersedes:** —
- **Superseded by:** —

## Context
The scheduler runs on 6 replicas. All 6 fire the same cron trigger, so a
nightly job currently executes 6 times. We need exactly-once execution per
schedule window.

Constraints:
- We already run Postgres 15 with a connection pool per replica.
- We do NOT currently run Redis in this environment; adding it means a new
  dependency, new on-call surface, and ~$180/mo.
- The job is idempotent-ish but not free: it sends emails.
- Expected trigger volume: ~200/day. Not a high-throughput problem.

## Decision
Use Postgres `pg_try_advisory_lock(hashtext(job_key))` held for the duration
of the job execution, inside the existing transaction-less session, released
explicitly in a finally block.

## Consequences
### Positive
- No new infrastructure, no new on-call surface.
- Lock is automatically released if the replica dies (session ends).
- Testable locally with the existing docker-compose Postgres.

### Negative
- Ties job scheduling to the primary database. If we later shard or move to
  a read-replica-heavy setup, this must be revisited.
- Advisory locks are invisible to most DB monitoring; we must add a query on
  pg_locks to the dashboard, or a stuck lock will be very hard to diagnose.
- Long-running jobs hold a connection from the pool for their whole duration.
  Pool size raised from 10 to 14 per replica to compensate.

### Neutral
- If throughput exceeds ~50 locks/sec we should re-evaluate; we are at ~0.002/sec.

## Alternatives considered
- **Redis SETNX with TTL** — the standard answer. Rejected only because of the
  new-dependency cost at our current scale; genuinely better above ~1k/sec.
- **Leader election via k8s Lease** — correct but couples app logic to the
  orchestrator and is harder to test locally.
- **A `job_runs` table with a unique constraint on (job_key, window)** — works,
  but leaves rows to garbage-collect and needs a separate stale-run reaper.
```

**Why ADRs beat wiki pages:** they are versioned with the code, they are reviewed in the
same PR as the change, and they are *immutable*. When the decision changes you write
ADR-0042 that says "Supersedes ADR-0017", and ADR-0017 gets a "Superseded by ADR-0042"
line. You now have the history of your architecture's reasoning, not just its current
state. The question an ADR answers is the one that costs teams the most:
**"why on earth is it like this?"**

**Common failure:** writing ADRs for everything, including "we use camelCase." That's a
style guide, not an architecture decision. Rule of thumb: write an ADR if the decision is
**expensive to reverse** or if a reasonable engineer would arrive at a different answer.

---
## Branching Strategy and Git at Scale

### The core insight

Every branching strategy is an answer to one question: **how long is code allowed to
live outside the integration point?** Everything else — naming conventions, release
branches, hotfix procedures — is downstream of that answer.

The cost of divergence is not linear. Two branches that have both changed the same
region of code for three weeks don't produce twice the conflicts of one week; they
produce a merge nobody understands, reviewed by someone who has lost context, tested
against an integration state that has never existed before.

### GitFlow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                  GITFLOW                                     │
└──────────────────────────────────────────────────────────────────────────────┘

  main      ──●──────────────────────●──────────────────●────────────●──→
              │ v1.0                 │ v1.1             │ v1.1.1     │ v1.2
              │                      ↑                  ↑            ↑
              │                 ┌────┘             ┌────┘       ┌────┘
              │           release/1.1           hotfix/     release/1.2
              │                 ↑                 crash          ↑
              │                 │                   ↑            │
  develop   ──●──●────●────●────●───●────●──────────●────●───●───●──→
                 ↑    ↑         ↑        ↑               ↑
                 │    │         │        │               │
  feature/a   ───┘    │         │        │               │
  feature/b     ──────┘         │        │               │
  feature/c        ─────────────┘        │               │
  feature/d              ────────────────┘               │
  feature/e                   ───────────────────────────┘

  Branch types: main, develop, feature/*, release/*, hotfix/*
```

**WHAT:** Five branch types. `main` is production. `develop` is the integration branch.
Features branch from and merge to `develop`. A `release/*` branch stabilises a version,
then merges to both `main` and `develop`. `hotfix/*` branches from `main`.

**WHY it existed:** Vincent Driessen published it in 2010, for software with **versioned
releases that customers install** — desktop apps, on-prem enterprise software, mobile
apps before fast review cycles, anything where multiple versions are supported
simultaneously. In that world you genuinely need a stabilisation branch and the ability
to patch v1.1 while v1.2 is in development.

**The author's own 2020 note on the original post says, in effect: if you are building
continuously delivered web software, this is not for you.** That is worth quoting in an
interview.

**WHEN it is correct:** Multiple supported versions in the field. Regulated release
sign-off. On-prem or shrink-wrapped software. Mobile with slow store review and long-tail
version support.

**WHEN NOT:** A web service with one version in production. Which is most of the industry.

**TRADE-OFFS:** Feature branches live for days or weeks. `develop` and `main` drift.
Every merge is a mini-integration project. The double-merge back from a release branch is
routinely botched, and hotfixes silently get lost from `develop`.

### GitHub Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                GITHUB FLOW                                   │
└──────────────────────────────────────────────────────────────────────────────┘

  main  ──●────●─────●──────●────●─────●────●──→   (always deployable)
           ↑    ↑     ↑      ↑    ↑     ↑    ↑
           │    │     │      │    │     │    │
           │  feat/b  │   feat/d  │  fix/f   │
        feat/a      feat/c      feat/e     feat/g

  Rules: 1. main is always deployable
         2. branch from main, descriptive name
         3. commit, push, open PR early
         4. review + CI must pass
         5. merge to main → deploy
```

**WHAT:** One long-lived branch (`main`). Short-lived feature branches. PR, review, merge,
deploy.

**WHY:** It removes the entire `develop`/`release` apparatus for teams that have exactly
one version in production. Simple enough that new team members get it immediately.

**WHEN:** Default choice for web services and most SaaS. The pragmatic middle ground.

**WHEN NOT:** When "short-lived" isn't enforced. GitHub Flow degrades into GitFlow's worst
properties the moment a branch lives for three weeks. The strategy has no mechanism to
prevent that — it relies on discipline and small stories.

### Trunk-based development

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        TRUNK-BASED DEVELOPMENT                               │
└──────────────────────────────────────────────────────────────────────────────┘

  trunk ──●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●─●──→
          │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
          └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─ branches
             live < 24h each, often < 2h

  INCOMPLETE WORK IS SHIPPED, BUT DARK:

    if (flags.newCheckout) {   ← merged to trunk on day 1, off in prod
       renderNewCheckout();       for the next 3 weeks while it's built
    } else {
       renderOldCheckout();
    }

  Release branches, if any, are cut FROM trunk and never merged back.
  Fixes go to trunk first, then cherry-pick to the release branch.

          release/24.08  ●──●        ← cut, cherry-picks only
                        ↗
  trunk ──●──●──●──●──●──●──●──●──→
```

**WHAT:** Everyone integrates to trunk at least daily. Branches, if used, live hours not
days. Incomplete features are hidden behind flags rather than hidden on branches.

**WHY it wins at scale — the honest argument:**

1. **Merge conflict cost is superlinear in branch age.** Ten engineers integrating daily
   have a bounded, small conflict surface. Ten engineers integrating every three weeks
   have a combinatorial problem, and it lands on whoever merges last.
2. **CI on a branch tests a state that will never exist in production.** You test
   `feature/x + trunk-as-of-3-weeks-ago`. Production will run `feature/x + feature/y +
   feature/z + trunk-now`. Trunk-based development is the only strategy where CI tests
   something close to reality.
3. **Review size is forced down.** A 24-hour branch physically cannot be a 2,000-line PR,
   and review quality collapses above ~400 lines (see the next section).
4. **It decouples deploy from release.** Deployment becomes a boring, frequent, low-risk
   engineering event; release becomes a flag flip that product controls and can undo in
   seconds. This is the actual prize.
5. **The DORA research consistently finds trunk-based development — specifically fewer
   than three active branches, branches living less than a day, and no code freezes —
   correlates with elite delivery performance.**

**WHEN NOT — and this is the part candidates skip:**
- **Open-source with untrusted contributors.** You cannot give push access to the world;
  fork-and-PR is mandatory.
- **No feature-flag infrastructure.** Trunk-based without flags means shipping
  half-finished features to users. The flag system is a *prerequisite*, not an optional
  extra.
- **Weak test automation.** Trunk-based development pushes all the safety onto CI. If your
  test suite doesn't actually catch regressions, you've removed the branch that was
  hiding that fact.
- **Long-running incompatible refactors** (framework migrations) still need branch-by-
  abstraction or parallel implementations, not a three-month branch.

**TRADE-OFFS:** Flags are debt. Every flag doubles the code paths, and a codebase with
200 stale flags is genuinely harder to reason about than one with a few long branches.
Flags need a removal process with an owner and an expiry date, and that process must
actually run.

### Merge vs rebase

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  MERGE COMMIT              REBASE                    SQUASH                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  main  ─●───────●─M        main  ─●───●───●─●─●      main  ─●───●───●        │
│          ╲     ╱                       ↑ ↑ ↑                     ↑           │
│           ●─●─●                    replayed commits          one commit      │
│                                                                              │
│  History: true, messy      History: linear, edited   History: linear, lossy  │
│  Bisect: awkward           Bisect: clean             Bisect: clean, coarse   │
│  Context: full             Context: full             Context: PR description │
│  Rewrites hashes: no       Rewrites hashes: YES      Rewrites hashes: YES    │
│                                                                              │
│  Use for: merging a        Use for: updating YOUR    Use for: merging a      │
│  long-lived branch where   branch with latest main   feature PR into trunk   │
│  the branch topology       before merge              (the common default)    │
│  is real information                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

**The golden rule of rebase: never rebase a branch that someone else has based work on,
and never rebase a shared branch.** Rebase rewrites commit hashes. Anyone who pulled the
old commits now has a divergent history and will "fix" it with a merge that duplicates
every commit.

```
❌ WRONG
  git checkout main
  git rebase feature/x        # rewriting the shared trunk. catastrophic.
  git push --force            # now everyone's clone is broken

❌ ALSO WRONG
  git push --force origin feature/shared-with-teammate
  # your teammate's next pull creates a mess they will spend an hour on

✅ CORRECT
  git checkout feature/mine
  git fetch origin
  git rebase origin/main      # replay MY commits on latest main
  git push --force-with-lease # refuses if someone else pushed meanwhile
```

`--force-with-lease` instead of `--force` is a small thing that a reviewer will notice.
It checks that the remote is where you last saw it, so you cannot silently clobber a
colleague's push.

**The pragmatic team policy that most good teams land on:**
- Rebase your own feature branch onto `main` to keep it current (linear, no merge noise).
- **Squash-merge** the PR into `main`, using the PR title as the commit message. Trunk
  history becomes one commit per reviewed change, which makes `git bisect` and revert
  trivial. `git revert <sha>` undoes an entire feature in one command.
- Never rebase `main`.

**When squash is wrong:** when the PR genuinely contains several independently meaningful
commits — e.g. "1. pure refactor, no behaviour change; 2. the actual fix". Squashing that
destroys the ability to revert only the fix, and destroys the reviewable separation. In
that case, rebase-merge to preserve the individual commits.

### Conventional commits

**WHAT:** A commit message format: `<type>(<scope>): <description>`.

```
feat(auth): add SSO login via SAML

Users on enterprise plans can now sign in through their IdP.
Adds the /auth/saml/callback endpoint and the IdP config model.

Closes #1841

---

fix(api): prevent duplicate charges on retry

The idempotency key was generated per-attempt rather than per-request,
so a client retry after a timeout created a second charge.

BREAKING CHANGE: idempotency keys must now be supplied by the client
on POST /charges; requests without one are rejected with 400.
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`,
`chore`, `revert`.

**WHY it exists:** It makes commit history *machine-readable*, which enables automated
CHANGELOG generation and — importantly — automated semantic version bumps. `fix:` → patch,
`feat:` → minor, `BREAKING CHANGE:` in the footer or `!` after the type → major.

**WHEN:** Libraries and packages with external consumers, where the changelog and version
number are a product. Monorepos where you need to determine which packages changed.

**WHEN NOT:** A small internal app with no consumers and no changelog. The convention has
a real compliance cost (people will fight about whether a change is `refactor` or
`chore`), and if nothing downstream consumes the structure, you're paying for nothing.

**The part that actually matters regardless of format: the commit body should explain
WHY, not WHAT.** The diff already shows what changed. Nobody has ever run `git blame`,
found the commit "update user service", and been helped by it.

```
❌ WRONG
  "fix bug"
  "updates"
  "address PR comments"          ← after squash, this is your permanent history
  "refactor UserService"

✅ CORRECT
  "fix(billing): charge in cents, not dollars, for JPY accounts

   Stripe expects the smallest currency unit. JPY has no minor unit, so
   our generic *100 conversion overcharged Japanese customers by 100x.
   Adds a currency-aware minor-unit table.

   Refs INC-2291"
```

### Semantic versioning

`MAJOR.MINOR.PATCH`

| Bump | When | Consumer impact |
|---|---|---|
| MAJOR | Incompatible API change | Must read the migration guide |
| MINOR | Backwards-compatible new functionality | Safe to upgrade |
| PATCH | Backwards-compatible bug fix | Safe, should upgrade |

**The honest caveats a senior knows:**

1. **`0.x.y` means nothing is guaranteed.** Anything may break in any release. A huge
   fraction of the ecosystem sits permanently at 0.x precisely to avoid the commitment.
2. **"Backwards compatible" is defined by observed behaviour, not by your intent.** Hyrum's
   Law: *with a sufficient number of users, every observable behaviour of your system will
   be depended on by somebody.* Fixing a bug can break a consumer who worked around it.
   That is technically a MAJOR change and everyone ships it as a PATCH.
3. **SemVer describes the API, not the risk.** A MAJOR bump that renames one function is
   trivial to adopt. A PATCH that changes a caching default can take down production.
   Read the changelog; don't trust the number.
4. **Range operators are where the real risk is.** `^4.18.0` means `>=4.18.0 <5.0.0` —
   you are trusting every future minor release of that package and its transitive
   dependencies. **This is why a lockfile is non-negotiable** and why `npm ci` (installs
   exactly the lockfile) belongs in CI rather than `npm install` (may update it).

---

## Code Review as a Craft

### WHY code review exists — and it's not "finding bugs"

Reviews do find defects, but that is not the highest-value output. In descending order of
actual value:

1. **Knowledge distribution.** After review, at least two people understand this code. This
   is the single largest factor in whether your team survives someone leaving.
2. **Design feedback while change is still cheap.** The comment "this should be a queue,
   not a synchronous call" is worth a hundred style nits — but only if it arrives before
   the thing is built on top of.
3. **Shared standards without a rulebook.** Conventions propagate through review far more
   effectively than through a wiki nobody reads.
4. **Defect detection.** Real, but the empirical numbers are humbling: review catches
   somewhere around 20-40% of defects, and much less as the diff gets bigger.
5. **An audit trail.** In regulated environments, the reviewed PR *is* the change control
   record.

### The 400-line rule

```
┌──────────────────────────────────────────────────────────────────────────────┐
│              DEFECT DETECTION vs REVIEW SIZE  (SmartBear/Cisco study)         │
└──────────────────────────────────────────────────────────────────────────────┘

  DEFECTS
  FOUND
  PER kLOC
     ▲
 ~80 ┤ ███
     │ ███ ███
 ~60 ┤ ███ ███ ███
     │ ███ ███ ███ ███
 ~40 ┤ ███ ███ ███ ███ ███
     │ ███ ███ ███ ███ ███ ███
 ~20 ┤ ███ ███ ███ ███ ███ ███ ███ ███
     │ ███ ███ ███ ███ ███ ███ ███ ███ ███ ███ ███
   0 └──────────────────────────────────────────────────────→  LINES IN REVIEW
      100 200 300 400 500 600 800 1k  1.5k 2k  4k

                        ↑
              ~400 LOC: the cliff.
              Beyond this, reviewers stop reading and start scrolling.
              A 2,000-line PR does not get 5x the review of a 400-line PR.
              It gets LESS total review, because attention collapses.

  Also empirical: review effectiveness drops sharply after ~60 minutes.
  Nobody does good review for two hours straight.
```

**The practical consequences a senior enforces:**
- Target 200-400 lines of *reviewable* change per PR. Generated files, lockfiles and
  snapshots don't count — mark them in `.gitattributes` as `linguist-generated` so the
  diff collapses them.
- Separate refactors from behaviour changes into **different PRs**. A PR that moves 40
  files and also changes logic is unreviewable; the logic change is invisible in the
  noise. "PR 1: pure move, no behaviour change. PR 2: the three-line fix." Reviewers can
  actually verify both.
- Stacked PRs for large work: each builds on the last, each individually reviewable.
- If the PR is genuinely large and cannot be split, **walk the reviewer through it live**
  for 20 minutes, then let them review. Don't pretend async review works at that size.

### What a good review comment looks like

```
❌ BAD: "This is wrong."
   No information. No path forward. Reads as an attack on the person.

❌ BAD: "Why did you do it this way?"
   Reads as an accusation even when curiosity is genuine. Written text
   loses all the tone that would have made this fine out loud.

❌ BAD: "Use a map here."
   A command with no reasoning. The author either complies without
   learning, or has to litigate to disagree.

❌ BAD: nine comments about naming and formatting on a PR that has a
   concurrency bug in it.
   You spent your reviewer credibility on the cheapest possible feedback
   and missed the thing that will page someone.

✅ GOOD: "This does a DB query inside the loop, so it's N+1 — with the
   ~200 orders we see on enterprise accounts that's 200 round trips.
   Could we fetch the line items in one query keyed by order_id and
   group in memory? Happy to pair on it if the ORM makes that awkward."

   Why it works:
     - names the specific problem (N+1)
     - quantifies the real-world impact (200 round trips, enterprise)
     - proposes a concrete direction
     - offers help, which removes the status sting

✅ GOOD: "nit: `usr` → `user`. Non-blocking, take it or leave it."
   Explicitly labelled as trivial and explicitly non-blocking, so the
   author knows they can ignore it without consequence.

✅ GOOD: "question (non-blocking): what happens if `parseWebhook` throws
   here? Looks like we'd 500 and Stripe would retry, which I think is
   actually what we want — just checking that's deliberate so we can
   note it in the runbook."

   Asks about a real failure mode, states the reviewer's own hypothesis
   (so the author can just confirm), and explains why the answer matters.

✅ GOOD: "blocking: this logs the full request body, which includes
   `password` on the signup path. That'll land in Datadog and we have a
   90-day retention. Needs redaction before merge."
   Explicitly blocking, with the specific reason it must be fixed now.
```

### Comment prefixes: making severity explicit

The single highest-leverage convention in code review. Without it, every comment reads as
equally mandatory, and authors waste time on trivia while blocking issues get lost.

| Prefix | Meaning | Author must act? |
|---|---|---|
| `blocking:` | Must be resolved before merge | Yes |
| `question:` | I need to understand before approving | Answer, then maybe |
| `suggestion:` | I think this is better; your call | No, but respond |
| `nit:` | Trivial, preference-level | No |
| `praise:` | This is genuinely good | No — and do this more |
| `fyi:` / `note:` | Context for the future, no action | No |

`praise:` is not soft-skills decoration. Reviews that only ever contain criticism train
people to dread them, and a reviewer who never notes anything good has no calibration
when they say something is bad.

### What to review, in priority order

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  1. CORRECTNESS      Does it do what the PR says? Edge cases? Failure paths? │
│  2. SECURITY         Injection, authz on every path, secrets, PII in logs    │
│  3. DATA             Migrations reversible? Any destructive change? Locks?   │
│  4. DESIGN           Right abstraction? Right layer? Will this scale in code?│
│  5. TESTS            Do they test behaviour or implementation? Would they    │
│                      actually fail if the code were wrong?                   │
│  6. OBSERVABILITY    If this breaks at 3am, is there enough to diagnose it?  │
│  7. READABILITY      Will someone understand this in a year?                 │
│  8. STYLE            ← automate this. Prettier/ESLint/gofmt. Never discuss.  │
└──────────────────────────────────────────────────────────────────────────────┘

  If your review comments are mostly #8, the fix is a linter, not a reviewer.
  Style debates in review are pure waste — pick a formatter, run it in CI,
  and never have the conversation again.
```

**A test worth applying to every test you review:** *would this test fail if the
implementation were wrong?* An enormous quantity of test code asserts that mocks were
called, which is a tautology. Ask it out loud in review.

### How to disagree in a review

```
❌ WRONG (author, defensive)
  "That's how we've always done it."
  "It works, so what's the problem?"
  "This is out of scope for this PR."   ← sometimes true, often a dodge

❌ WRONG (reviewer, escalating)
  Re-requesting changes four times on the same thread with progressively
  terser comments.

✅ CORRECT (author, disagreeing)
  "I looked at the map approach — the problem is we need insertion order
   preserved for the export, and I'd have to keep a parallel array. I
   think the current version is actually simpler to read even though it's
   O(n²) on a list that's capped at 50. Happy to change it if you still
   disagree — want to grab 10 minutes?"

  States the reason, acknowledges the reviewer's point was reasonable,
  quantifies why the concern doesn't bite, offers a synchronous exit.

✅ CORRECT (reviewer, holding a line)
  "I hear you on scope, and I agree this doesn't need solving in this PR.
   But shipping it as-is means every enterprise account gets 200 queries
   on page load, and I don't want to find that in an incident. Two
   options: fix it here, or merge with a TODO and a ticket you own for
   next sprint. Either is fine with me — not fine with neither."

  Names the constraint, offers real alternatives, states the actual
  boundary clearly.
```

**The escalation rule: two round trips, then talk.** If a thread has gone back and forth
twice without converging, a text thread is the wrong medium. Get on a call, decide, and
post the outcome back on the thread so the decision is recorded.

**Who wins a disagreement?** Not the more senior person. The default should be: the
author decides, unless the reviewer's concern is correctness, security, or data integrity
— then the reviewer blocks. Codify this, because otherwise it's decided by social
dynamics, and the quietest person on the team loses every time.

### How to receive a review

- **Assume good intent about tone.** Written review comments are systematically colder
  than the author meant. Nobody writes "why is this here?" to be cruel; they wrote it
  between meetings.
- **Reply to every comment**, even if only with a thumbs-up or "done in abc123". Silence
  reads as ignoring.
- **The comment is about the code.** This sounds trite and it is the single most useful
  reframing available. Your identity is not in the diff.
- **If you get the same comment three times across three PRs, it's a pattern.** Fix the
  pattern, not the instance.
- **Self-review first.** Open your own PR diff and read it. You will catch the debug log,
  the commented-out block, and the file you didn't mean to commit. This costs 3 minutes
  and buys reviewer goodwill you'll need later.

### Review SLA

Review latency is a queue, and queues are where delivery time goes to die. A PR waiting
20 hours for review has a real cost: the author context-switches, the branch ages, the
conflicts grow.

A workable team norm: **first response within 4 working hours; if you can't, say so and
name someone who can.** Not "approve within 4 hours" — respond. "Looking at this after
standup" is a valid response and unblocks the author's planning.

---

## Testing Strategy

### The pyramid vs the trophy

```
┌────────────────────────────────┐        ┌────────────────────────────────┐
│        THE TEST PYRAMID        │        │       THE TESTING TROPHY       │
│         (Mike Cohn)            │        │       (Kent C. Dodds)          │
├────────────────────────────────┤        ├────────────────────────────────┤
│                                │        │                                │
│            ╱╲                  │        │          ╭────╮                │
│           ╱E2E╲   ~10%         │        │          │ E2E│    ~10%        │
│          ╱──────╲              │        │      ╭───┴────┴───╮            │
│         ╱ INTEG. ╲  ~20%       │        │      │ INTEGRATION│   ~50%     │
│        ╱──────────╲            │        │      │            │            │
│       ╱    UNIT    ╲  ~70%     │        │      ╰───┬────┬───╯            │
│      ╱──────────────╲          │        │          │UNIT│    ~30%        │
│                                │        │          ├────┤                │
│                                │        │          │STATIC│  ~10%        │
│                                │        │          ╰────╯                │
├────────────────────────────────┤        ├────────────────────────────────┤
│ Assumes: integration tests are │        │ Assumes: types + linters are    │
│ slow, flaky, expensive.        │        │ nearly free and catch a whole   │
│ True in 2009. Often false now. │        │ defect class; containers make   │
│                                │        │ integration tests cheap.        │
└────────────────────────────────┘        └────────────────────────────────┘

  The real question isn't which shape. It's:
  ┌────────────────────────────────────────────────────────────────────┐
  │  For each defect class, what is the CHEAPEST test that catches it,  │
  │  and how much confidence does each test buy per second of runtime?  │
  └────────────────────────────────────────────────────────────────────┘

  CONFIDENCE                                          ● E2E
      ▲                                            ╱     (high confidence,
      │                                     ╱                60s each,
      │                         ● Integration                flaky)
      │                    ╱      (good confidence,
      │               ╱            ~1s each)
      │         ● Unit
      │    ╱      (narrow confidence, 1ms each)
      │  ● Types/lint (free, but only catches shape errors)
      └──────────────────────────────────────────────────→  COST PER TEST
```

The honest 2026 position: **the pyramid's ratios were a proxy for cost, and the costs
changed.** Testcontainers, in-memory Postgres, MSW, and fast CI runners made integration
tests dramatically cheaper than they were when the pyramid was drawn. Meanwhile static
typing eliminated an entire tier of tests that used to be written by hand ("throws if
passed a string"). Adjust the shape to your actual costs; don't cargo-cult either diagram.

### The levels, and what each is actually for

| Level | Scope | Speed | What it catches | What it misses |
|---|---|---|---|---|
| Static (types, lint) | File | ms | Shape errors, nulls, typos, unused code | Any logic error |
| Unit | Function/class, no I/O | <10ms | Algorithmic and branch logic | Wiring, config, contracts |
| Integration | Several modules + real DB/queue | 100ms-2s | SQL, serialisation, transactions, wiring | UI, cross-service contracts |
| Contract | Between two services | fast | Provider/consumer API drift | Behaviour inside either service |
| E2E | Whole system, real browser | 10-60s | "Does the product work at all" | Almost everything, slowly |
| Load | System under traffic | minutes | Capacity limits, N+1, pool exhaustion | Correctness |

### Contract tests — the one most people can't explain

**WHAT:** Consumer-driven contract testing (Pact and similar). The consumer writes a test
that says "when I call `GET /users/1`, I need a response with `id` (number) and `email`
(string)". That expectation is published as a *contract*. The provider's CI runs every
published contract against itself and fails if it would break any consumer.

**WHY it exists:** In a microservice system, the alternative is deploying all services
together into a shared environment and running E2E tests — which reintroduces the exact
lockstep coupling microservices were meant to remove.

```
  ❌ WITHOUT CONTRACT TESTS
  ┌─────────┐  mock (hand-written, ages silently)  ┌─────────┐
  │Consumer │ ─────────────────────────────────────│Provider │
  └─────────┘                                      └─────────┘
       ↑                                                 ↑
   tests pass                                     tests pass
       └──────────  and yet production is broken ────────┘
              because the provider renamed a field
              and the consumer's mock still has the old one

  ✅ WITH CONTRACT TESTS
  ┌─────────┐    publishes expectations    ┌────────┐   verified against
  │Consumer │ ───────────────────────────→ │ Broker │ ←──── Provider CI
  └─────────┘                              └────────┘
                                                │
                Provider CI FAILS before merge if the rename
                would break a real, live consumer contract.
```

**WHEN:** More than ~3 services owned by more than one team, deployed independently.

**WHEN NOT:** A monolith (the compiler is your contract test). Two services owned by the
same team that always deploy together (just run an integration test). The Pact broker is
real operational overhead; don't buy it for a two-service system.

### Mocking vs stubbing vs faking

Interviewers ask this to see whether you have opinions or vocabulary.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  STUB    Returns canned answers. Provides state.                             │
│          "getUser() returns {id:1}. I don't care how many times you call it."│
│          → Verifies STATE. Low coupling to implementation.                    │
├──────────────────────────────────────────────────────────────────────────────┤
│  MOCK    Records and asserts interactions. Provides behaviour verification.  │
│          "assert sendEmail() was called exactly once with these args."       │
│          → Verifies BEHAVIOUR. HIGH coupling to implementation.               │
├──────────────────────────────────────────────────────────────────────────────┤
│  FAKE    A real, working, simplified implementation.                          │
│          In-memory repository. SQLite instead of Postgres. MSW HTTP layer.   │
│          → Verifies STATE against real semantics. Low coupling, high fidelity│
├──────────────────────────────────────────────────────────────────────────────┤
│  SPY     A real object with recording wrapped around it.                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  DUMMY   Passed to satisfy a signature, never used.                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

```js
// ❌ WRONG: over-mocked. Tests the implementation, not the behaviour.
test('createOrder', async () => {
  const repo   = { save: jest.fn().mockResolvedValue({ id: 1 }) };
  const mailer = { send: jest.fn() };
  const audit  = { log:  jest.fn() };
  const svc = new OrderService(repo, mailer, audit);

  await svc.create({ items: [1, 2] });

  expect(repo.save).toHaveBeenCalledTimes(1);
  expect(mailer.send).toHaveBeenCalledWith('order-created', expect.anything());
  expect(audit.log).toHaveBeenCalled();
});
// This test passes if the order total is calculated wrong.
// It passes if the order is saved with no items.
// It FAILS if you rename an internal method or reorder two calls.
// It is coupled to structure and blind to correctness: the worst combination.
// It actively resists refactoring, which is the one thing tests should enable.

// ✅ CORRECT: fake the boundary, assert the outcome.
test('createOrder totals the line items and notifies the customer', async () => {
  const repo   = new InMemoryOrderRepo();      // a real, simple implementation
  const mailer = new InMemoryMailer();         // records what a user would receive
  const svc = new OrderService(repo, mailer, new NoopAudit());

  const order = await svc.create({
    items: [{ sku: 'A', qty: 2, unitCents: 500 },
            { sku: 'B', qty: 1, unitCents: 250 }],
  });

  expect(order.totalCents).toBe(1250);                    // the actual logic
  expect(await repo.findById(order.id)).toMatchObject({ totalCents: 1250 });
  expect(mailer.sentTo('customer@example.com')).toHaveLength(1);
});
// Fails if the total is wrong. Fails if it isn't persisted.
// Survives any internal refactor that keeps the behaviour.
```

**Rule of thumb:** mock only what you cannot control and cannot fake — third-party
network calls, the clock, randomness, the payment provider. Fake everything you own.
Assert on outcomes, not on call counts.

### What NOT to test

An under-discussed senior skill. Every test has an ongoing maintenance cost; a test that
never fails for a real reason is a pure liability.

- **Third-party library internals.** You are not testing that `lodash.groupBy` groups.
- **Framework behaviour.** Don't test that React re-renders when state changes.
- **Getters, setters, trivial pass-throughs.** No branches, no test.
- **Private methods.** Test them through the public surface. If that's impossible, the
  private thing wants to be its own unit with its own public surface.
- **Exact strings of user-facing copy.** Marketing will change it and your test will fail
  for a non-reason. Test that *something* renders, or use a test id.
- **Implementation details in general:** CSS class names, DOM structure, internal state
  shape, call ordering. These change constantly without behaviour changing.
- **Generated code and mappings** with no logic in them.

**The heuristic:** if a test fails, does that failure tell me a user-visible thing broke?
If no, delete it.

### Flaky tests are worse than no tests

**WHY, precisely:** a flaky test destroys the *signal value* of your entire suite. Once a
team learns that red can mean nothing, red always means nothing, and a real failure gets
retried straight through to production. One flaky test in a suite of 3,000 is enough to
create the habit.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     THE FLAKY TEST DEATH SPIRAL                              │
└──────────────────────────────────────────────────────────────────────────────┘

  One test fails intermittently
            ↓
  Someone re-runs CI. It passes. Merged.
            ↓
  "Just hit re-run, that one's flaky" enters team vocabulary
            ↓
  Re-running becomes reflexive — nobody reads the failure any more
            ↓
  A REAL regression fails the suite
            ↓
  Re-run. Passes (it was a race the second run happened to win).
            ↓
  Ships to production
            ↓
  Incident. Postmortem finds the test DID catch it. Twice.

  ┌──────────────────────────────────────────────────────────────────┐
  │ THE POLICY: quarantine on the second flake, no exceptions.       │
  │  1. Move it out of the blocking suite, immediately.              │
  │  2. File a ticket with an owner and a due date.                  │
  │  3. If not fixed by the due date, DELETE it.                     │
  │ A quarantined test that lives forever is just a slower deletion. │
  └──────────────────────────────────────────────────────────────────┘
```

**The usual root causes, in order of frequency:** arbitrary `sleep()` instead of waiting
for a condition; shared mutable state between tests (a database row, a module-level
singleton, a cache) combined with parallel or reordered execution; real dates and
timezones (`new Date()` in an assertion, tests that fail after midnight UTC or during DST);
test-order dependence; unhandled async where the assertion runs before the effect;
animations and transitions in browser tests; network calls to real services.

### Coverage as a target — Goodhart again

**WHAT coverage measures:** the percentage of lines/branches *executed* during the test
run.

**What it does NOT measure:** whether anything was asserted.

```js
// This test achieves 100% coverage of calculateTax() and asserts nothing
// that could ever fail.
test('calculateTax', () => {
  calculateTax(100, 'CA');
  calculateTax(100, 'NY');
  calculateTax(0, 'TX');
  expect(true).toBe(true);
});
```

**WHY 100% coverage mandates backfire:** they convert an informative diagnostic into a
target, so people optimise the number. You get tests written for uncovered lines rather
than for risky behaviour, assertions on getters, and — the worst outcome — tests written
for code that should have been *deleted*.

**How to use coverage correctly:**
- Use it as a **discovery tool**, not a gate: "which important paths have zero tests?"
- Look at coverage **on the diff**, not on the repo. "Does this PR add untested branches?"
  is a good question. "Is the repo at 80.0% or 79.8%?" is not.
- Track **uncovered branches in high-risk modules** (payments, auth, permissions) rather
  than a global number.
- If you must have a number, set a floor that prevents backsliding, not a target that
  demands ceremony. And know that mutation testing (Stryker, PIT) is the metric that
  actually measures whether your tests would catch a bug — it mutates your code and
  checks that a test fails.

### TDD, honestly assessed

**WHAT:** Red (write a failing test) → Green (minimum code to pass) → Refactor.

**Where it genuinely shines:**
- Pure functions with clear inputs/outputs: parsers, validators, pricing, date maths,
  state machines. Here TDD is close to strictly better.
- Bug fixes. Reproduce the bug as a failing test *first*. You get proof you fixed it and a
  permanent regression guard. **This is the one form of TDD that essentially everyone
  should do, always.**
- Any time you don't know where to start. Writing the test forces you to define the
  interface before the implementation, which is often the actual blocker.

**Where it's genuinely awkward, and pretending otherwise is dishonest:**
- Exploratory work where you don't yet know the design. Writing tests against an
  interface you're about to throw away is waste. Spike first, delete the spike, then TDD
  the real thing.
- UI layout and visual work. There's no meaningful red-green cycle for "does this look
  right".
- Integration-heavy code where the test setup dwarfs the code under test.
- Performance work — the "test" is a benchmark, and the loop is different.

**The strongest honest claim for TDD:** the research on whether it improves defect rates
is mixed and confounded. The *reliable* effect is on **design** — code written test-first
tends to have smaller units, fewer dependencies, and injectable boundaries, because code
that's hard to test is hard to write a test for first. You can get the same benefit by
writing tests immediately after, if you have the discipline to actually change the design
when testing is painful. Most people don't.

**The senior answer in an interview:** "I test-drive pure logic and every bug fix. For
exploratory or UI work I spike first and add tests before merge. I care much more that
the tests assert behaviour and would fail if the code were wrong than about whether they
were written first."

---
<!-- SDLC-APPEND-MARKER -->
