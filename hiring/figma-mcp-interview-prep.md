# Figma MCP — Complete Interview Prep (Frontend Developer)

> Resume Line: "Used Figma MCP server to integrate design-to-code workflow in our AI-assisted frontend development, cutting implementation time by ~60% while maintaining pixel-perfect accuracy with the design system."

---

## MASTER CHEAT-SHEET (read this first — 30-second elevator pitch)

> "Figma MCP is Model Context Protocol applied to Figma. It's an open standard — introduced by Anthropic in November 2024 and now adopted by OpenAI, Google, and Microsoft — that lets AI coding agents connect to Figma and read structured design data directly instead of guessing from screenshots. In practice, I configure the Figma MCP server in Cursor or VS Code, paste a Figma frame link in my prompt, and the AI gets the full component hierarchy, spacing tokens, variants, typography, and Code Connect mappings. The result is production-quality React code generated in minutes, not hours, that already uses our actual design system components."

---

## PART 1: FOUNDATIONS — WHAT IS MCP?

---

### Q: What is Model Context Protocol (MCP)?

**The simple version:**

Think of MCP like **a USB-C standard for AI tools**:
- Before USB-C: every device had a different charger (proprietary)
- Before MCP: every AI tool needed a custom integration for every data source
- After USB-C / MCP: one standard port works everywhere

MCP is an **open standard** that defines how AI agents connect to external data sources and tools. Instead of building a custom plugin for each AI tool (one for Cursor, one for VS Code, one for Claude), you build **one MCP server** and any MCP-compatible AI client can talk to it.

**Key facts:**
- Introduced by **Anthropic in November 2024**
- Adopted by OpenAI, Google, Microsoft, Amazon — it's the industry standard now
- By 2026, it became the de facto standard for connecting AI agents to tools and data
- Communication happens over **HTTP/SSE (Server-Sent Events)**
- Think of it as "a universal translator between your tools and AI"

**Three components of MCP:**

```
┌───────────────────────────────────────────────────────────────┐
│                    MCP ARCHITECTURE                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   MCP HOST          MCP CLIENT          MCP SERVER           │
│   (where you        (protocol layer      (connector to        │
│    work)             passing info)        a tool)             │
│                                                               │
│   e.g. Cursor   ◄──► MCP Protocol  ◄──► Figma MCP Server    │
│   VS Code       ◄──► MCP Protocol  ◄──► GitHub MCP Server   │
│   Claude Code   ◄──► MCP Protocol  ◄──► Database MCP Server │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

### Q: What is MCP vs traditional API integration?

| Traditional API | MCP |
|----------------|-----|
| Custom integration per tool | One server, all compatible clients |
| Developer writes adapter code | Standard protocol, auto-discovered |
| Static data transfer | Dynamic, context-rich responses |
| Tool-specific format | Standardized tool/resource interface |
| AI can't "discover" capabilities | AI discovers tools dynamically |

---

## PART 2: FIGMA MCP SERVER — DEEP DIVE

---

### Q: What exactly is the Figma MCP Server?

The Figma MCP server is **Figma's official implementation of the Model Context Protocol**. It acts as a bridge between Figma design files and AI coding agents.

**What it does (bidirectional!):**

```
┌─────────────────────────────────────────────────────────────────┐
│                   FIGMA MCP SERVER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   READ (Design → Code direction):                               │
│   ─────────────────────────────                                 │
│   • Component hierarchy (layers, nesting)                       │
│   • Layout data (auto-layout, spacing, alignment)               │
│   • Design tokens (colors, typography, spacing variables)       │
│   • Component variants & properties                             │
│   • Code Connect mappings (Figma component → real code)         │
│   • FigJam diagrams (flows, architecture maps)                  │
│   • Figma Make resources                                        │
│   • Screenshots of selected frames                              │
│                                                                 │
│   WRITE (Code → Design direction):                              │
│   ──────────────────────────────                                │
│   • Create frames, components, variables in Figma               │
│   • Update existing design components                           │
│   • Capture live UI from browser → push to Figma as frames     │
│   • Write to FigJam canvas                                      │
│   • Create Figma Slides content                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight for interviews:** "The screenshot tells AI what something looks like. Structured MCP data tells AI what something *is*. That's the difference between code that *resembles* a design and code that *matches* it."

---

### Q: What problem does Figma MCP solve? Why did we need it?

**The old workflow (before MCP):**

```
Designer creates Figma frame
       ↓
Developer opens Figma in browser
       ↓
Developer manually reads spacings, colors, font sizes
       ↓
Developer opens IDE
       ↓
Developer writes HTML/CSS/React by memory
       ↓
Designer reviews → "This button is 4px off, wrong font-weight"
       ↓
Back and forth until pixel-perfect (takes hours/days)
```

**The MCP workflow:**

```
Designer creates Figma frame
       ↓
Developer right-clicks → "Copy link to selection"
       ↓
Developer pastes link in Cursor/VS Code chat
       ↓
AI reads actual design context via MCP
       ↓
AI generates code with exact spacings, tokens, components
       ↓
Developer does minor tweaks (20-30 mins vs half a day)
```

**Real impact:** In a practical example (notification menu component), what traditionally took 3-4 hours was done in under 1 hour with MCP — including interactive callbacks, MUI integration, and design system alignment.

---

## PART 3: SETUP — EVERY DETAIL

---

### Q: Walk me through exactly how to set up Figma MCP.

**There are two server types:**

#### Option A: Remote Server (RECOMMENDED — what most teams use)

**When:** You don't need the desktop app running. Connects to Figma's cloud endpoint.

**Endpoint:** `https://mcp.figma.com/mcp`

**Cursor setup:**
```json
// .cursor/mcp.json or settings > MCP
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "transport": "http"
    }
  }
}
```
Then authenticate with your Figma account when prompted.

**VS Code setup (with GitHub Copilot):**
```json
// .vscode/mcp.json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

**Claude Desktop setup:**
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_personal_access_token"
      }
    }
  }
}
```

#### Option B: Desktop Server (Enterprise/Government use)

**When:** Specific org/enterprise needs, or Figma for Government (FedRAMP). Runs locally.

**Local endpoint:** `http://127.0.0.1:3845/mcp`

**Step-by-step:**
1. Open Figma Desktop app (must be latest version)
2. Open any Design file
3. Press `Shift+D` or toggle Dev Mode in toolbar
4. In right sidebar, MCP server section → click **"Enable desktop MCP server"**
5. Confirmation appears at bottom of screen
6. In your IDE/MCP client, add:
```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

**Desktop server additional settings:**
- **Image settings:** localhost links (for rendering) OR download assets directly to project
- **Enable Code Connect:** includes your codebase component mappings in responses

---

### Q: Remote vs Desktop — when would you choose which?

| Factor | Remote Server | Desktop Server |
|--------|--------------|----------------|
| Setup complexity | Simpler (URL only) | Requires desktop app |
| Features | Broadest set | Limited subset |
| Write to canvas | YES | NO |
| Send UI to Figma | YES | NO |
| Works without desktop app | YES | NO |
| Government/FedRAMP compliance | NO (not in audit yet) | YES |
| Plan requirement | Starter+ | Dev/Full seat (Professional+) |
| Best for | Most teams | Enterprise/Govt |

**My answer:** "We used the remote server. Simpler setup, broader feature set, no dependency on the desktop app running locally. The desktop server is more for specific enterprise compliance needs."

---

### Q: What is a Personal Access Token in context of Figma MCP?

When using some community MCP implementations or the REST API approach, you need a PAT:
1. Figma → Account Settings → Security → Personal Access Tokens
2. Generate token with read access (or read+write depending on use case)
3. Include in MCP server config as env variable `FIGMA_ACCESS_TOKEN`

The **official remote server** (`mcp.figma.com`) uses OAuth-based authentication — you sign in with your Figma account the first time, and the client handles token refresh. No manual PAT management needed.

---

### Q: What supported clients/IDEs work with Figma MCP?

As of 2026, officially supported clients include:

| Client | Desktop | Remote | Write to Canvas | Skills/Plugin |
|--------|---------|--------|-----------------|---------------|
| Cursor | ✓ | ✓ | ✓ | Figma plugin |
| VS Code | ✓ | ✓ | ✓ | Figma plugin |
| Claude Code | ✓ | ✓ | ✓ | Figma plugin |
| Kiro (Amazon) | ✓ | ✓ | ✓ | Kiro Powers |
| Copilot CLI | ✓ | ✓ | ✓ | Figma plugin |
| Codex (OpenAI) | ✓ | ✓ | ✓ | Codex Skills |
| Gemini CLI | ✓ | ✓ | — | Extension |
| JetBrains Junie | ✓ | ✓ | ✓ | — |
| Android Studio | ✓ | ✓ | — | — |
| Xcode | — | ✓ | ✓ | Figma plugin |

**Important note:** Not every MCP client can connect — Figma maintains an **MCP catalog** and only listed clients are supported. If you want to connect a new client, you join a waitlist.

---

## PART 4: TOOLS — WHAT THE MCP SERVER EXPOSES

---

### Q: What tools does the Figma MCP server expose? Walk me through each.

These are the functions the AI can call through the MCP connection:

#### `get_design_context`
- **What it does:** Gets complete design context for a selected frame or layer
- **Returns:** Component hierarchy, auto-layout rules, spacing, typography, color tokens, variant info, Code Connect mappings
- **Use case:** "AI, implement this card component from this Figma link"
- **Key distinction:** Returns *what the component IS* (structured data), not just what it looks like

#### `get_screenshot`
- **What it does:** Generates a screenshot/image of the selected frame or component
- **Returns:** Visual representation of the selected element
- **Use case:** When AI needs a visual reference alongside structural data
- **Note:** Available on both remote and desktop servers

#### `get_variable_defs`
- **What it does:** Fetches all design token definitions — colors, spacing, typography, border-radius, etc.
- **Returns:** Variable names, values, collections, modes (light/dark)
- **Use case:** "AI, generate a theme.ts file based on our Figma variables"
- **Real example:** `spacing-4 = 16px`, `color-primary = #3B82F6`, `font-body = Inter 14px/1.5`

#### `get_code_connect_map`
- **What it does:** Retrieves the mapping between Figma components and real codebase components
- **Returns:** Which Figma component maps to which React/Vue/etc. import
- **Use case:** So generated code uses `<Button variant="primary">` from your library, not a generic `<button>` element
- **Requires:** Code Connect to be set up first

#### `get_metadata`
- **What it does:** Returns XML/structured data with layer properties
- **Returns:** Node IDs, names, types, positions, sizes, parent-child relationships
- **Use case:** Programmatic access to layer tree; useful for bulk operations, audits

#### `get_figjam`
- **What it does:** Reads content from FigJam boards
- **Returns:** Sticky notes, shapes, connectors, embedded content from whiteboards
- **Use case:** "Turn this user flow diagram from FigJam into code structure" — early-stage ideas and architecture maps carry into development

#### `get_code_connect_map` + `add_code_connect_map`
- Read or write Code Connect mappings (connecting design components to code equivalents)

#### `create_design_system_rules`
- Generates a design system rules document from the current Figma file structure
- Useful for onboarding new developers or generating AI context files

#### `use_figma` (Write — remote only)
- Writes native Figma content to the canvas
- Creates/updates frames, components, variables, auto-layout
- Requires Full seat to write outside your drafts

#### `generate_figma_design` (Send UI to Figma — remote only)
- Captures live UI from your browser (production/staging/localhost)
- Converts it into editable Figma frames
- Use case: "Start my local server and capture the homepage as Figma frames"

---

## PART 5: CODE CONNECT — THE GAME CHANGER

---

### Q: What is Code Connect and why is it critical with MCP?

Code Connect is **Figma's system for mapping design components to real code components**. Without it, when AI generates code from a Figma design, it creates generic HTML/CSS. With Code Connect, it uses *your actual components*.

**Without Code Connect:**
```jsx
// AI generates this — generic, not using your system
<div style={{ 
  backgroundColor: '#3B82F6', 
  padding: '8px 16px',
  borderRadius: '6px',
  color: 'white'
}}>
  Submit
</div>
```

**With Code Connect:**
```jsx
// AI generates this — uses your actual component library!
<Button variant="primary" size="medium" onClick={handleSubmit}>
  Submit
</Button>
```

**Why this matters in interviews:** "Code Connect is what makes MCP go from a nice-to-have to a genuine productivity multiplier. Without it, you still get scaffolding that looks right. With it, you get code that *is* right — using your actual components, with correct props, reducing duplication and maintaining design system consistency."

---

### Q: How do you set up Code Connect?

**Step 1: Install the CLI**
```bash
npm install --save-dev @figma/code-connect
# or
yarn add --dev @figma/code-connect
```

**Step 2: Create a Code Connect file alongside your component**
```tsx
// Button.figma.tsx
import figma from "@figma/code-connect";
import { Button } from "./Button"; // your actual component

figma.connect(Button, "https://www.figma.com/file/YOUR_FILE/...", {
  props: {
    // Map Figma variant "Type" → React prop "variant"
    variant: figma.enum("Type", {
      Primary: "primary",
      Secondary: "secondary",
      Destructive: "destructive",
    }),
    // Map Figma boolean "Disabled" → React prop "disabled"
    disabled: figma.boolean("Disabled"),
    // Map Figma text layer "Label" → React prop "children"
    children: figma.string("Label"),
    // Map Figma boolean "Icon" → conditional React rendering
    icon: figma.boolean("Icon", {
      true: <ChevronIcon />,
      false: undefined,
    }),
  },
  // The example code Figma (and AI) will show
  example: ({ variant, disabled, children, icon }) => (
    <Button variant={variant} disabled={disabled} icon={icon}>
      {children}
    </Button>
  ),
});
```

**Step 3: Publish to Figma**
```bash
npx figma connect publish
```

**Step 4: Enable in desktop server settings (if using desktop)**
In Figma Dev Mode sidebar → MCP settings → "Enable Code Connect"

**Result:** When AI calls `get_code_connect_map`, it gets your mapping and generates code that uses `<Button variant="primary">` instead of raw HTML.

---

### Q: What is Code Connect vs Storybook vs Figma's Dev Mode — explain the relationship.

```
┌──────────────────────────────────────────────────────────────────┐
│           DESIGN SYSTEM TOOLING ECOSYSTEM                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Figma Dev Mode                                                  │
│  ─────────────                                                   │
│  • Developers view specs INSIDE Figma                            │
│  • Manual inspection: spacings, colors, assets                   │
│  • One-way: design → developer reads it                          │
│                                                                  │
│  Code Connect                                                    │
│  ─────────────                                                   │
│  • Maps Figma components to real code components                 │
│  • Shows correct code snippet IN Dev Mode AND in MCP output      │
│  • Bidirectional awareness: design ↔ code stay in sync           │
│                                                                  │
│  Figma MCP Server                                                │
│  ─────────────────                                               │
│  • Brings Dev Mode context into YOUR IDE via AI                  │
│  • Developer never needs to leave their editor                   │
│  • AI uses Code Connect mappings to generate accurate code       │
│  • Bidirectional: can also push back to Figma canvas             │
│                                                                  │
│  Storybook MCP                                                   │
│  ─────────────                                                   │
│  • Community addition (not Figma official)                       │
│  • Bridges Figma with your Storybook component catalog           │
│  • AI generates code against components that already exist       │
│  • Complements Figma MCP (Figma = visual spec, Storybook = code) │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## PART 6: SKILLS — THE WORKFLOW GUIDE LAYER

---

### Q: What are "Skills" in context of Figma MCP?

Skills are **pre-packaged workflow instructions** that tell an AI agent how to use MCP tools effectively, in the right order, for specific tasks.

**Analogy:** MCP tools are like individual kitchen appliances. Skills are like recipes — they tell you which appliances to use, in what order, and how to combine the results.

**What skills do:**
- Guide the agent through multi-step workflows (e.g., "get design context, then check Code Connect, then generate component")
- Define best practices for your team's specific setup
- Ensure consistent, reliable output across sessions
- Package repeatable workflows into reusable instructions

**Figma-provided skills include:**
- Code Connect setup skill — guides connecting design ↔ code components
- Design system rules generation skill
- Design-to-production code translation skill
- Figma Specs skill (reading/updating project requirements)

**Custom skills:** You can create your own skills for your team's specific workflow — e.g., "always use our MUI theme, always generate TypeScript, always place files in /components directory."

**Key distinction:** Skills don't add new capabilities — they improve reliability and quality by giving the agent better instructions.

---

### Q: How do you create a custom skill?

A skill is typically a Markdown file that describes the workflow:

```markdown
# Team Frontend Component Skill

## When to use this skill
When implementing any Figma frame as a React component.

## Workflow
1. Call get_design_context with the provided Figma URL
2. Call get_variable_defs to get current token values
3. If Code Connect is enabled, call get_code_connect_map
4. Generate TypeScript React component using:
   - Our design system: @company/ui-library
   - Theme tokens from src/theme/tokens.ts
   - Placement in src/components/{ComponentName}/index.tsx
5. Include JSDoc comments for props
6. Export as named export, not default

## Standards
- Use styled-components (not inline styles)
- Use React.FC<Props> pattern
- Always handle loading and error states
```

These are shared in Figma Community or your team's codebase.

---

## PART 7: DAY-TO-DAY WORKFLOW

---

### Q: Walk me through exactly how you use Figma MCP in a real feature development day.

**Real scenario: Building a "Transaction Card" component**

**Step 1: Designer finishes the frame in Figma**
- Frame named "Transaction Card / Default"
- Has variants: Status (Pending/Completed/Failed), Size (Small/Large)
- Uses design tokens for colors, spacing

**Step 2: I get the Figma link**
```
Right-click frame in Figma → "Copy link to selection"
→ https://figma.com/design/ABC123/.../node-id=123%3A456
```

**Step 3: Open Cursor/VS Code, start a chat**
```
My prompt:
"Implement the Transaction Card component from this Figma frame:
https://figma.com/design/ABC123/.../node-id=123%3A456

Use our design system from @/components/ui. Place in 
src/components/TransactionCard/. TypeScript. Use our 
existing StatusBadge and AmountDisplay components."
```

**Step 4: AI uses MCP tools automatically**
```
AI calls → get_design_context (gets layout, spacings, tokens)
AI calls → get_variable_defs (gets color tokens, typography)
AI calls → get_code_connect_map (finds StatusBadge mapping)
AI calls → get_screenshot (visual reference for validation)
AI generates → TransactionCard.tsx, TransactionCard.types.ts
```

**Step 5: Review output**
```
✓ Correct spacing (AI read it from Figma, not guessed)
✓ Uses <StatusBadge> from our library (Code Connect did this)
✓ Tokens used: color.status.pending, spacing.card.padding
✗ Font-weight on amount slightly off → quick manual fix
```

**Step 6: 20-30 minutes of polish vs. 3-4 hours manually**

---

### Q: How does the "Send UI to Figma" feature work in reverse?

This is the **write direction** — pushing your running app's UI back into Figma.

**Use case:** Your team built a feature in code first (sprint was code-led). Now designer needs it in Figma for documentation, upcoming iterations, or presenting to stakeholders.

**Workflow:**
1. Start your local dev server: `npm run dev`
2. In your MCP client: "Start a local server for my app and capture the homepage in a new Figma file"
3. AI opens a browser, navigates your app
4. A **capture toolbar** appears — you capture pages, elements, interaction states
5. Say "Done" → AI pushes everything to a new Figma file as **editable design frames**

**Why this matters:** "It closes the loop. Design-to-code was always one-way. Now code-to-design is also automated. Our live UI stays in sync with Figma documentation."

---

### Q: How do you handle design tokens with Figma MCP?

Design tokens (variables in Figma) are exposed via `get_variable_defs`. The response gives you:

```json
{
  "variables": {
    "color/primary/500": "#3B82F6",
    "color/status/success": "#10B981",
    "color/status/error": "#EF4444",
    "spacing/4": "16px",
    "spacing/6": "24px",
    "typography/body/size": "14px",
    "typography/body/lineHeight": "1.5",
    "typography/heading/weight": "600",
    "radius/card": "12px",
    "radius/button": "6px"
  },
  "collections": {
    "Light Mode": { ... },
    "Dark Mode": { ... }
  }
}
```

**In practice:** I use this output to:
1. Auto-generate or validate our `tokens.ts` file
2. Ensure AI uses token names (not hardcoded hex values) in generated CSS
3. Sync dark/dark mode tokens across light and dark theme configurations

---

## PART 8: HARD INTERVIEW QUESTIONS — SENIOR/ARCHITECT LEVEL

---

### Q: What are the limitations of Figma MCP? Don't just sell it — tell me where it fails.

**Honest answer (this impresses interviewers):**

1. **Highly interactive components are a challenge**
   - Drag-and-drop, custom animations, complex gesture handling — AI's output is a starting skeleton, not a finished feature
   - MCP gives great structural data but can't capture interaction intent

2. **Token alignment must exist upfront**
   - If Figma variable names don't match your codebase token names, there's manual mapping work
   - "If your design system is messy, MCP surfaces that mess faster"

3. **Code Connect setup takes real time**
   - Mapping every component in a large design system takes days of initial investment
   - Ongoing maintenance as components evolve

4. **AI still hallucinate on edge cases**
   - Pixel-perfect accuracy is ~80-90% out of the box; remaining 10-20% needs manual polish
   - Spacing might be off by a few pixels on complex nested components

5. **Write to canvas is beta — it's not perfect**
   - Creating complex designs via AI writing to Figma canvas is still unreliable for intricate layouts
   - Works well for simple screens, less so for complex component libraries

6. **Rate limits and costs**
   - Currently free in beta, but will become usage-based paid
   - High-volume teams need to plan for this cost

7. **The design file quality is a hard dependency**
   - Inconsistent naming conventions → poor AI output
   - Components without proper variants/properties → AI falls back to guessing
   - "Garbage in, garbage out applies directly"

8. **Not all MCP clients are supported**
   - Figma maintains a catalog; connecting a new/custom client requires joining a waitlist
   - Can be a blocker for teams using less common IDEs

---

### Q: How does Figma MCP impact team collaboration between designers and developers?

**Old model:**
```
Designer → hands off specs → Developer interprets → back-and-forth review
```

**MCP model:**
```
Designer + Developer → share ONE Figma source of truth → AI bridges the gap directly
```

**Cultural shift this drives:**
- Designers need to learn **structured design systems** — MCP exposes what's in your file, so messy files = messy output
- Developers need to invest in **Code Connect** upfront for maximum payoff
- The "handoff" meeting changes — instead of walking through specs, it's "here's the Figma link, AI takes it from here, designer reviews generated output"
- Faster iteration cycles — UI changes in Figma can be coded same-day

**Design system hygiene becomes a first-class engineering concern:**
- Consistent token naming
- Properly structured component variants
- Documentation on component properties
- Aligned variable names between Figma and codebase

---

### Q: How do you ensure code quality when using AI with Figma MCP? Aren't you just generating slop?

**Strong answer:**

"MCP + AI is a starting point generator, not a code approver. Here's my quality gate process:

1. **Context-first prompting** — I don't just paste the link. I give AI the design system constraints: which libraries to use, where to place files, existing patterns to follow
2. **Review structural quality first** — Is the component split logically? Are concerns separated?
3. **Review token usage** — Does it use our design tokens or hardcoded values? MCP with Code Connect makes this much better
4. **Manual polish for pixel-perfection** — Typically 20-30 min of adjustments on spacing edge cases
5. **Code review still happens** — AI-generated code goes through the same PR review process
6. **ESLint/TypeScript validation** — Compilation errors catch type issues immediately

The bottom line: AI handles the repetitive translation work (spacing, layout, component selection). I make the engineering decisions (architecture, state management, performance). That's the right division."

---

### Q: What is Figma Specs and how does it fit with MCP?

Figma Specs is Figma's **requirements/documentation feature** (currently in open beta). It allows teams to document feature requirements, design decisions, and product context directly within Figma files.

**With MCP + the figma-spec skill:**
- AI reads your Figma Specs before starting to code
- AI writes design decisions and implementation notes back to the Spec
- Creates a feedback loop: requirements → implementation → documentation, all linked

**Why it matters:** "Instead of requirements in Jira, design in Figma, and documentation in Confluence all separate, Figma Specs can centralize the design+requirements context in one place that MCP can read."

---

### Q: Walk me through how you'd set up Figma MCP from scratch for a new team of 5 frontend developers.

**My approach (senior-level answer):**

```
Phase 1: Foundation (Week 1)
─────────────────────────────
□ Audit Figma file structure — are components properly named? Variants defined?
□ Establish token naming conventions that match code (e.g., color.primary.500 = --color-primary-500)
□ Set up remote MCP server in Cursor for all developers (same mcp.json config in repo)
□ Share Figma access to all devs
□ Create shared "getting started" prompt template

Phase 2: Code Connect (Week 2-3)
──────────────────────────────────
□ Identify top 20 most-used Figma components
□ Create .figma.tsx files for each (Button, Input, Card, Badge, Modal...)
□ Run: npx figma connect publish
□ Test: Paste Figma link in Cursor → verify it generates using our components

Phase 3: Custom Skills (Week 3-4)
───────────────────────────────────
□ Write team skill: our folder structure, naming conventions, libraries
□ Document token mappings for AI context
□ Create example prompts for common scenarios (new page, new component, update existing)

Phase 4: Workflow Integration (Week 4)
────────────────────────────────────────
□ Designer-dev sync: agree on Figma file hygiene standards
□ Update PR template: "include Figma link for UI changes"
□ Measure: track time-to-implementation before vs after

Phase 5: Maintain
───────────────────
□ Update Code Connect when components change
□ Review AI output quality in PRs
□ Expand Code Connect to more components
```

---

### Q: How does Figma MCP compare to just using Figma's built-in "Copy as code" feature?

| Feature | Figma "Copy as code" | Figma MCP |
|---------|---------------------|-----------|
| Stays in IDE | No — you switch to Figma | Yes — never leave your editor |
| Uses your components | No — generic CSS/HTML | Yes — via Code Connect |
| Context awareness | None — just one element | Full — AI understands your project |
| Design tokens | Hardcoded values | Named token variables |
| Interactive | No | Yes — AI can ask follow-up questions |
| Write back to Figma | No | Yes — bidirectional |
| Whole-flow generation | No | Yes — full page/feature |

"Copy as code" is like asking someone to read out loud one ingredient at a time. MCP is like giving the chef the whole recipe card plus your kitchen inventory.

---

### Q: What's the difference between Figma MCP server and Framelink (community MCP)?

**Figma Official MCP Server:**
- Built and maintained by Figma
- Requires supported client (catalog-based)
- Best for teams with Code Connect already set up
- Bidirectional (read and write)
- Requires authentication via Figma account

**Framelink (community/unofficial):**
- Community-built alternative (earlier to market)
- Uses Figma REST API + PAT (Personal Access Token)
- Works with any MCP client, not just catalog-listed ones
- Read-only
- Simpler setup if you're bootstrapping without Code Connect

**When I'd use Framelink:** For quick prototyping or when my client isn't in Figma's catalog yet. For production team use, official server is always better.

---

### Q: How do you handle design-to-code drift? What if Figma design changes after code is written?

**Proactive approach:**
1. **Figma link in component comments/stories:**
```tsx
/**
 * @figma https://figma.com/design/ABC/.../node-id=123
 * Last synced: 2026-01-15
 */
export const TransactionCard: React.FC<Props> = ...
```

2. **Design change triggers re-generation:**
- Designer updates Figma → notifies dev in PR or Slack
- Dev re-runs MCP prompt with same link → AI generates updated component
- Dev reviews diff — usually structural changes surface immediately

3. **Code Connect as the contract:**
- When Code Connect is maintained, Figma shows the current code snippet in Dev Mode
- If it looks wrong, that's the signal to re-sync

4. **Future: Automated drift detection** (still emerging)
- Some teams are building CI checks that call MCP, compare to committed code, and flag visual regressions

---

### Q: What are the security/privacy considerations with Figma MCP?

**Important for enterprise interviews:**

1. **Remote server sends data to Figma's cloud** — Design data leaves your local machine to `mcp.figma.com`. For companies with IP-sensitive designs, the desktop server (local) is preferred.

2. **Desktop server is fully local** — Data never leaves `127.0.0.1:3845`. Ideal for under-NDA projects or sensitive product designs.

3. **Access control** — MCP uses your Figma account permissions. If you only have view access to a file, MCP can only read, not write.

4. **PAT vs OAuth** — Personal Access Tokens should be stored in environment variables, never committed to git. The remote server's OAuth approach is safer.

5. **Figma for Government** — Uses desktop server only. Remote server isn't currently in FedRAMP audit scope (Figma is working on it).

6. **Generated code review** — AI-generated code should still go through security review. MCP doesn't check for security best practices in generated code.

---

### Q: You said you cut implementation time by 60% — prove it. What's a specific example?

**Notification Menu Component (real example from real team):**

| Step | Traditional | With Figma MCP |
|------|------------|----------------|
| Understand layout from Figma | 30 min | 0 min (AI reads it) |
| Write component structure | 45 min | 5 min (AI generates) |
| Get spacings/colors right | 60 min (back-and-forth) | 5 min (tokens from MCP) |
| Integrate with MUI/design system | 45 min | 5 min (Code Connect) |
| Add callbacks/interactions | 30 min | 10 min (AI scaffolds) |
| Manual polish and fixes | 30 min | 25 min |
| **Total** | **~4 hours** | **~50 minutes** |

**Result:** Component was pixel-perfect, used correct MUI components, had interactive tab filtering and callbacks — in under 1 hour vs. half a day.

---

## PART 9: CONCEPTUAL / ARCHITECT QUESTIONS

---

### Q: How does Figma MCP fit into a broader AI-assisted development pipeline?

```
┌────────────────────────────────────────────────────────────────────┐
│              AI-ASSISTED FRONTEND DEVELOPMENT PIPELINE              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. REQUIREMENTS                                                   │
│     Figma Specs (MCP-readable) ─────► AI reads requirements       │
│                                                                    │
│  2. DESIGN                                                         │
│     Designer in Figma ──────────────► AI agent (Figma native)     │
│     Figma canvas (components,          refines on canvas           │
│     tokens, auto-layout)                                           │
│                                                                    │
│  3. DESIGN-TO-CODE                                                 │
│     Figma MCP ───────────────────────► AI coding agent (Cursor)   │
│     (get_design_context,              generates component code     │
│      get_variable_defs,               using your design system     │
│      get_code_connect_map)                                         │
│                                                                    │
│  4. REVIEW + ITERATE                                               │
│     AI reviews code vs design ──────► Automated visual regression  │
│     Developer polishes ─────────────► PR review                   │
│                                                                    │
│  5. CODE-TO-FIGMA (bidirectional)                                  │
│     Live UI captured ───────────────► Figma frames updated        │
│     (generate_figma_design tool)      for documentation            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

"Figma MCP is the most critical link — it's the bridge that converts visual intent into machine-readable code instructions. Everything else in the AI pipeline becomes more accurate because of it."

---

### Q: As an architect, how would you justify the ROI of investing in full Figma MCP + Code Connect setup?

**Investment:**
- Code Connect setup: ~5-10 days per 50-component library
- Design system cleanup in Figma: ~3-5 days (one-time)
- Custom skills writing: ~2-3 days
- Team onboarding/training: ~1 day

**Returns (per developer, per sprint):**
- ~60% reduction in time for new UI components
- Fewer designer-developer revision cycles (estimated 40% fewer back-and-forths)
- New developers ramp up faster — MCP + Code Connect acts as a living design system guide
- Design system compliance improves — AI always uses the right components

**Break-even calculation (rough):**
```
Team of 5 frontend devs
Each spends 30% of time on design-to-code translation = 1.5 days/week each
60% reduction = saves 0.9 days/week per developer
Team saves 4.5 dev-days/week

One-time setup: ~20 dev-days
Break-even: 20 / 4.5 ≈ 4.5 weeks
After break-even: pure productivity gain
```

---

### Q: MCP is a new technology. How do you stay current with it?

**My approach:**
1. Follow Figma's official blog and changelog (they publish MCP updates)
2. Figma Community MCP catalog — new skills and servers added regularly
3. Figma Shortcut blog (Figma's internal tech blog)
4. GitHub — official and community MCP servers evolve fast
5. Participate in Figma Community skill sharing
6. Track Anthropic's MCP specification updates (it's an open standard)

**Why this matters:** "MCP is evolving weekly. What was beta (write to canvas) is now stable. Figma Specs integration is new. Rate limits and pricing are still being finalized. Staying current means we adopt improvements before competitors."

---

## PART 10: CROSS-QUESTIONS & TRICKY SCENARIOS

---

### Q: If MCP is so good, why aren't all companies using it?

**Honest answer:**
1. **Design system hygiene requirement** — Works best when Figma files are well-structured with proper tokens/components. Many companies have messy Figma files.
2. **Code Connect investment** — Takes real time to set up for every component. Small teams may find the ROI isn't there yet.
3. **AI literacy gap** — Not every developer is comfortable with AI-assisted coding workflows yet.
4. **Cost uncertainty** — Currently free in beta; will be usage-based paid. Companies want to understand pricing before deep integration.
5. **New technology caution** — Enterprise companies especially want stability before adopting new tooling.
6. **Client/IDE limitations** — Figma's MCP catalog is curated. If your company uses an unlisted IDE, you can't use it yet.

---

### Q: What's the difference between using Figma MCP in Cursor vs VS Code with GitHub Copilot?

**Cursor:**
- MCP is deeply integrated — the Composer (agent mode) automatically discovers and calls MCP tools
- Cursor indexes your entire codebase, so MCP output is combined with your actual project context
- Generally more seamless MCP experience currently
- Figma plugin adds Skills directly to the agent

**VS Code + GitHub Copilot:**
- MCP support added via the Figma VS Code plugin
- Copilot in agent mode can call MCP tools
- Chat: `@figma` scope directs to Figma MCP tools
- Growing support — becoming more feature-parity with Cursor

**My experience:** Cursor currently provides a more fluid experience for Figma MCP because of how tightly the Composer integrates MCP tool calls into the generation workflow. But VS Code is catching up fast.

---

### Q: What happens when you paste a Figma link — what technically happens behind the scenes?

**Step-by-step technical flow:**

```
1. You paste: https://figma.com/design/ABC123/My-App?node-id=123%3A456

2. MCP CLIENT (Cursor) detects the URL pattern
   → Extracts: file_key = "ABC123", node_id = "123:456"
   → Does NOT open the URL in a browser

3. MCP CLIENT calls the Figma MCP Server tool: get_design_context
   → Parameters: { file_key: "ABC123", node_id: "123:456" }

4. FIGMA MCP SERVER authenticates via your Figma account token
   → Calls Figma's REST API internally: GET /v1/files/ABC123/nodes?ids=123:456

5. Figma API returns structured JSON:
   → Layer tree, auto-layout, fills, typography, effects, constraints

6. If Code Connect enabled: MCP server appends component mappings
   → "This Figma component maps to <Button> from '@company/ui'"

7. MCP server returns structured context to the AI model

8. AI combines:
   → MCP design context (structure, tokens)
   → Your project context (existing files, imports, coding conventions)
   → Your prompt instructions

9. AI generates targeted, accurate component code

10. AI response appears in your IDE chat
```

---

### Q: Can you explain Figma MCP to a non-technical stakeholder (product manager/CEO)?

**The "3 AM deadline" story:**

"Before Figma MCP, a developer getting a design from the designer was like getting a flat-pack furniture box with a picture of the finished product but no instructions. They had to figure out every step — which screw goes where, in what order, what the exact measurements are. That's 4-6 hours for every new UI component.

With Figma MCP, it's like the AI assistant opens the furniture box, reads the actual engineering spec sheet inside, looks at your existing furniture to match the style, and assembles 80% of it for you. The developer just does the finishing touches — 45 minutes instead of half a day.

For a 5-person frontend team, that's roughly 4 saved days per week. In a sprint, that's the difference between shipping 1 feature and shipping 3."

---

### Q: We don't use Cursor. We use a standard text editor + browser tools. Does Figma MCP work for us?

**Honest answer:** Not directly through MCP. Figma MCP requires an MCP-compatible AI client.

**Alternatives for your team:**
1. **Upgrade to Cursor or VS Code with Copilot** — Both are free/affordable
2. **Community Figma MCP via CLI** — Can call MCP tools from terminal scripts
3. **Figma Dev Mode (non-AI)** — Still gives structured specs without MCP
4. **Community tools like Anima/Locofy** — Convert Figma to code without MCP but less accurate
5. **Build your own MCP integration** — Join Figma's MCP catalog waitlist for your custom client

---

## PART 11: QUICK-FIRE REFERENCE

---

### Key terms to know cold:

| Term | One-line definition |
|------|-------------------|
| MCP | Open standard for AI agents to connect to external tools/data |
| Figma MCP Server | Figma's implementation — reads/writes Figma design data via MCP |
| Remote server | Cloud-hosted at mcp.figma.com/mcp — broadest features |
| Desktop server | Local at 127.0.0.1:3845 — for enterprise/government |
| Code Connect | Maps Figma components to real codebase components |
| get_design_context | MCP tool: returns full structural design data for a frame |
| get_variable_defs | MCP tool: returns design tokens (colors, spacing, typography) |
| get_code_connect_map | MCP tool: returns Figma→code component mappings |
| get_screenshot | MCP tool: returns visual image of selected frame |
| get_metadata | MCP tool: returns layer properties in XML (IDs, types, positions) |
| get_figjam | MCP tool: reads FigJam board content |
| use_figma | MCP tool: writes to Figma canvas (remote + Full seat) |
| generate_figma_design | MCP tool: captures live UI → Figma editable frames |
| Skills | Workflow instructions that guide AI in using MCP tools correctly |
| MCP Host | The AI tool you work in (Cursor, VS Code, Claude) |
| MCP Client | Protocol layer between host and server |
| Figma Specs | Figma's requirements feature — readable via figma-spec skill |
| Design tokens | Named variables for colors, spacing, typography (Figma Variables) |

---

### Numbers to know:

- MCP introduced: **November 2024** (by Anthropic)
- Adopted by: **OpenAI, Google, Microsoft** (became industry standard by 2026)
- Remote server endpoint: **https://mcp.figma.com/mcp**
- Desktop server port: **127.0.0.1:3845**
- Code Connect CLI: `@figma/code-connect`
- Time savings: **~60% reduction** in design-to-code time (practical result)
- Plans: Available on **Starter and above** (write to canvas needs Full seat)
- Pricing: **Free in beta**, will become usage-based paid

---

### Things NOT to say in an interview:

❌ "MCP is just another Figma plugin" — It's a protocol, not a plugin  
❌ "You need the desktop app for MCP" — Remote server doesn't need it  
❌ "It generates perfect code automatically" — ~80-90% accuracy; polish still needed  
❌ "Code Connect is optional" — It's what makes MCP go from good to great  
❌ "It only works with Cursor" — Supports 20+ clients  
❌ "It's just one-way (design to code)" — It's fully bidirectional  

---

### Things TO say that make you stand out:

✅ "I understand the difference between get_design_context giving you what something IS vs a screenshot showing what it looks like"  
✅ "Code Connect is the investment that makes MCP output production-quality"  
✅ "Skills are how you encode your team's conventions so AI generates consistently"  
✅ "The write-to-canvas capability closes the design-code loop bidirectionally"  
✅ "Design system hygiene in Figma is now a direct engineering concern, not just a design concern"  
✅ "MCP works across Cursor, VS Code, Claude Code — it's a universal protocol, not tool-specific"  

---

## PART 12: FINAL STORY — HOW TO OPEN AND CLOSE

---

### Opening story (use this to frame everything):

"During a sprint where we had to build a new onboarding flow — 6 new screens with complex components — the designer and I sat down together. Instead of a traditional handoff meeting where she walks me through each screen, she opened Figma, I had Cursor open, and she just shared the frame links one by one.

As she was still refining screen 3, I was already coding screen 1. The AI read the Figma context via MCP, used our Code Connect mappings to pull in the right components, and gave me a production-ready scaffold in minutes. I made the logic connections, handled state, wired up the API calls — the part that actually requires engineering judgment.

We shipped that 6-screen flow in 3 days instead of 2 weeks. That's what Figma MCP enabled."

---

### Closing statement if asked "Why do you think this is important?":

"The design-to-code gap has historically been where most UI quality issues, delays, and designer-developer friction live. Figma MCP doesn't eliminate that gap — it gives AI the structured design knowledge to jump across it accurately. Combined with Code Connect, your design system becomes a living, machine-readable spec. Combined with Skills, your team's coding conventions get encoded into every AI output.

In an industry where speed and accuracy both matter, and where AI is now part of every serious frontend workflow, knowing how to set up, configure, and leverage Figma MCP is table stakes for a senior frontend developer. I've been using it in production, I've seen the 60% time savings firsthand, and I understand both its power and its limitations."

---

*Sources: Figma official documentation (help.figma.com), Figma resource library (figma.com/resource-library), Boldare engineering blog, OpenAI Codex+Figma integration docs — November 2026*
