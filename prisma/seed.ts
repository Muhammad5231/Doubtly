import { PrismaClient, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Doubtly database with scientific STEM Markdown...');

  // 1. Seed Admin User
  const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
  const defaultPassword = 'AdminPassword123!';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const admin = await prisma.admin.upsert({
    where: { username: defaultAdminUsername },
    update: {},
    create: {
      username: defaultAdminUsername,
      passwordHash: passwordHash,
    },
  });
  console.log(`Admin account ensured: ${admin.username}`);

  // 2. Seed Subjects
  const subjectsData = [
    { name: 'Mathematics', slug: 'mathematics', icon: 'Calculator', order: 1 },
    { name: 'Physics', slug: 'physics', icon: 'Atom', order: 2 },
    { name: 'Chemistry', slug: 'chemistry', icon: 'FlaskConical', order: 3 },
    { name: 'Biology', slug: 'biology', icon: 'Dna', order: 4 },
    { name: 'Computer Science', slug: 'computer-science', icon: 'Code', order: 5 },
  ];

  const createdSubjects: Record<string, any> = {};
  for (const s of subjectsData) {
    const sub = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, order: s.order },
      create: s,
    });
    createdSubjects[s.slug] = sub;
  }
  console.log('Subjects seeded successfully.');

  const math = createdSubjects['mathematics'];
  const phy = createdSubjects['physics'];
  const chem = createdSubjects['chemistry'];
  const bio = createdSubjects['biology'];
  const cs = createdSubjects['computer-science'];

  // 3. Questions with Scientific STEM Markdown (LaTeX, Chemistry, Code, Step Badges)
  const questions = [
    // MATH 1: Chain Rule
    {
      title: 'How do you differentiate sin(x^2) using the chain rule?',
      slug: 'derivative-of-sin-x-squared-chain-rule',
      subjectId: math.id,
      body: `Given the composite trigonometric function $f(x) = \\sin(x^2)$, determine the first derivative with respect to $x$ by applying the Chain Rule of differential calculus.`,
      answer: `To find the derivative of $f(x) = \\sin(x^2)$, we apply the fundamental **Chain Rule**:

$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

## Step 1: Decompose into Outer and Inner Functions
Identify the composite structure:
- **Outer function:** $u(g) = \\sin(g)$, whose derivative is $u'(g) = \\cos(g)$
- **Inner function:** $g(x) = x^2$, whose derivative is $g'(x) = 2x$

## Step 2: Differentiate with Respect to the Inner Function
Differentiate the outer trigonometric term keeping the inner argument untouched:

$$\\frac{d}{dg}[\\sin(g)] = \\cos(g) = \\cos(x^2)$$

## Step 3: Multiply by the Derivative of the Argument
Apply the power rule to differentiate $g(x) = x^2$:

$$\\frac{d}{dx}[x^2] = 2x$$

Combine both terms via the chain rule multiplication:

$$f'(x) = \\cos(x^2) \\cdot (2x) = 2x\\cos(x^2)$$

### Final Conclusion
The verified derivative is **$2x\\cos(x^2)$**.`,
      tags: ['calculus', 'differentiation', 'chain-rule', 'trigonometry'],
      views: 1840,
    },

    // MATH 2: Integration by Parts & LIATE
    {
      title: 'How does Integration by Parts work with the LIATE rule?',
      slug: 'integration-by-parts-formula-and-liate-rule',
      subjectId: math.id,
      body: `Explain the fundamental formula for Integration by Parts and how the LIATE priority heuristic is used to select $u$ and $dv$. Work through the integral $\\int x e^{2x} dx$.`,
      answer: `Integration by parts is the integral calculus counterpart of the product rule for differentiation:

$$\\int u \\, dv = u v - \\int v \\, du$$

## Step 1: Understand the LIATE Selection Hierarchy
To ensure the resulting integral $\\int v \\, du$ is simpler than the original, select $u$ according to whichever function type appears highest in this priority list:

| Priority | Category | Mathematical Examples |
| :--- | :--- | :--- |
| **L** | Logarithmic | $\\ln(x), \\log_2(x)$ |
| **I** | Inverse Trigonometric | $\\arctan(x), \\arcsin(x)$ |
| **A** | Algebraic | $x, x^2, 3x + 1$ |
| **T** | Trigonometric | $\\sin(x), \\cos(x)$ |
| **E** | Exponential | $e^x, 2^x$ |

## Step 2: Assign Variables for $\\int x e^{2x} dx$
In the integrand $x e^{2x}$:
- $x$ is **Algebraic** (A)
- $e^{2x}$ is **Exponential** (E)

Since Algebraic comes before Exponential in LIATE, assign:
- $u = x \\implies du = dx$
- $dv = e^{2x}dx \\implies v = \\int e^{2x}dx = \\frac{1}{2}e^{2x}$

## Step 3: Substitute into the Parts Formula

$$\\int x e^{2x} dx = u v - \\int v \\, du = x\\left(\\frac{1}{2}e^{2x}\\right) - \\int \\frac{1}{2}e^{2x} dx$$

Evaluate the remaining elementary integral:

$$\\int x e^{2x} dx = \\frac{1}{2}x e^{2x} - \\frac{1}{4}e^{2x} + C$$

Factor the exponential term for the final result:

$$\\int x e^{2x} dx = \\frac{1}{4}e^{2x}(2x - 1) + C$$`,
      tags: ['calculus', 'integration', 'liate', 'integrals'],
      views: 1490,
    },

    // MATH 3: Gaussian Integral
    {
      title: 'How do you evaluate the Gaussian Integral over infinite bounds?',
      slug: 'evaluating-gaussian-integral-polar-coordinates',
      subjectId: math.id,
      body: `Evaluate the definite integral $I = \\int_{-\\infty}^{\\infty} e^{-x^2} dx$ using the classic multivariable polar coordinate conversion technique.`,
      answer: `The definite integral $I = \\int_{-\\infty}^{\\infty} e^{-x^2} dx$ cannot be integrated via elementary antiderivatives, but can be solved exactly by squaring the integral into $\\mathbb{R}^2$:

$$I = \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

## Step 1: Square the Integral
Consider the product of two independent copies of the integral:

$$I^2 = \\left(\\int_{-\\infty}^{\\infty} e^{-x^2} dx\\right)\\left(\\int_{-\\infty}^{\\infty} e^{-y^2} dy\\right) = \\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} e^{-(x^2 + y^2)} dx\\,dy$$

## Step 2: Transform to Polar Coordinates
Transform Cartesian coordinates $(x, y)$ to Polar coordinates $(r, \\theta)$ where:
- $x^2 + y^2 = r^2$
- The Jacobian determinant area element is $dx\\,dy = r\\,dr\\,d\\theta$
- The integration domain spans $r \\in [0, \\infty)$ and $\\theta \\in [0, 2\\pi]$

Substitute into the double integral:

$$I^2 = \\int_0^{2\\pi} d\\theta \\int_0^\\infty e^{-r^2} r\\,dr$$

## Step 3: Evaluate the Transformed Integrals
The angular integral is trivial: $\\int_0^{2\\pi} d\\theta = 2\\pi$.

For the radial integral, let $u = r^2 \\implies du = 2r\\,dr$:

$$\\int_0^\\infty e^{-r^2} r\\,dr = \\frac{1}{2}\\int_0^\\infty e^{-u} du = \\frac{1}{2}[-e^{-u}]_0^\\infty = \\frac{1}{2}(0 - (-1)) = \\frac{1}{2}$$

Multiply the results:

$$I^2 = 2\\pi \\cdot \\frac{1}{2} = \\pi \\implies I = \\sqrt{\\pi}$$

### Core Verdict
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$`,
      tags: ['calculus', 'gaussian-integral', 'polar-coordinates', 'advanced-math'],
      views: 1250,
    },

    // PHYSICS 1: Collisions
    {
      title: 'What is the key difference between elastic and inelastic collisions?',
      slug: 'difference-between-elastic-and-inelastic-collisions',
      subjectId: phy.id,
      body: `Compare the conservation of linear momentum and kinetic energy between elastic and completely inelastic collisions in one dimension. State the role of the coefficient of restitution $e$.`,
      answer: `In all isolated physical collisions without external net forces, **linear momentum is strictly conserved**:

$$\\sum \\vec{p}_{\\text{initial}} = \\sum \\vec{p}_{\\text{final}} \\implies m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$$

However, collisions differ fundamentally in whether **kinetic energy** is conserved or dissipated into thermal internal energy.

## Step 1: Kinetic Energy Comparison
- **Elastic Collision:** No mechanical energy is converted into heat, sound, or permanent lattice deformation:

$$K_{\\text{initial}} = K_{\\text{final}} \\implies \\frac{1}{2}m_1 v_1^2 + \\frac{1}{2}m_2 v_2^2 = \\frac{1}{2}m_1 v_1'^2 + \\frac{1}{2}m_2 v_2'^2$$

- **Inelastic Collision:** A portion of kinetic energy $\\Delta K > 0$ is dissipated into internal thermal or sound energy.
- **Completely Inelastic Collision:** The colliding bodies stick together and move with a single common final velocity $V_f$:

$$V_f = \\frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$$

## Step 2: The Coefficient of Restitution ($e$)
The coefficient of restitution characterizes the elasticity of relative separation velocity:

$$e = \\frac{|v_2' - v_1'|}{|v_1 - v_2|}$$

| Collision Category | Momentum | Kinetic Energy | Restitution Coefficient |
| :--- | :--- | :--- | :--- |
| **Perfectly Elastic** | Conserved | Conserved | $e = 1$ |
| **Partially Inelastic** | Conserved | Partially Dissipated | $0 < e < 1$ |
| **Completely Inelastic**| Conserved | Max Kinetic Energy Lost | $e = 0$ (bodies stick) |`,
      tags: ['physics', 'mechanics', 'collisions', 'momentum', 'energy'],
      views: 1610,
    },

    // PHYSICS 2: Schrödinger Equation
    {
      title: 'How do you solve the 1D Schrödinger equation for a particle in a box?',
      slug: 'schrodinger-equation-particle-in-a-box',
      subjectId: phy.id,
      body: `Find the quantized energy levels $E_n$ and normalized stationary wavefunctions $\\psi_n(x)$ for a particle of mass $m$ confined to a one-dimensional infinite potential well between $x = 0$ and $x = L$.`,
      answer: `The time-independent Schrödinger equation in one dimension is:

$$-\\frac{\\hbar^2}{2m}\\frac{d^2\\psi(x)}{dx^2} + V(x)\\psi(x) = E\\psi(x)$$

For an infinite square well, the potential $V(x) = 0$ for $0 \\le x \\le L$ and $V(x) = \\infty$ elsewhere.

## Step 1: Formulate the General Solution
Inside the well ($0 < x < L$), $V(x) = 0$:

$$\\frac{d^2\\psi}{dx^2} + k^2\\psi = 0, \\quad \\text{where } k = \\frac{\\sqrt{2mE}}{\\hbar}$$

The general harmonic solution is:

$$\\psi(x) = A\\sin(kx) + B\\cos(kx)$$

## Step 2: Apply Boundary Conditions
Because $V(x) = \\infty$ outside the well, the wavefunction must vanish at the boundaries to maintain continuity:
1. At $x = 0$: $\\psi(0) = B = 0 \\implies \\psi(x) = A\\sin(kx)$
2. At $x = L$: $\\psi(L) = A\\sin(kL) = 0$

For non-trivial solutions ($A \\neq 0$):

$$kL = n\\pi \\implies k_n = \\frac{n\\pi}{L}, \\quad n = 1, 2, 3, \\dots$$

## Step 3: Derive Quantized Energy Levels
Substitute $k_n$ back into the energy relation $E = \\frac{\\hbar^2 k^2}{2m}$:

$$E_n = \\frac{\\hbar^2}{2m}\\left(\\frac{n\\pi}{L}\\right)^2 = \\frac{n^2 \\pi^2 \\hbar^2}{2m L^2} = \\frac{n^2 h^2}{8m L^2}, \\quad n \\in \\mathbb{N}^+$$

## Step 4: Normalization
Normalize $\\int_0^L |\\psi_n(x)|^2 dx = 1$:

$$A^2 \\int_0^L \\sin^2\\left(\\frac{n\\pi x}{L}\\right) dx = A^2 \\left(\\frac{L}{2}\\right) = 1 \\implies A = \\sqrt{\\frac{2}{L}}$$

### Verified Eigenfunctions
$$\\psi_n(x) = \\sqrt{\\frac{2}{L}} \\sin\\left(\\frac{n\\pi x}{L}\\right), \\quad E_n = \\frac{n^2 h^2}{8mL^2}$$`,
      tags: ['physics', 'quantum-mechanics', 'schrodinger', 'wavefunction'],
      views: 1330,
    },

    // CHEMISTRY 1: Equilibrium & Le Chatelier
    {
      title: 'How does Le Chatelier’s Principle govern the Haber-Bosch ammonia equilibrium?',
      slug: 'le-chatelier-principle-haber-bosch-equilibrium',
      subjectId: chem.id,
      body: `Examine the reversible synthesis of ammonia $\\ce{N2(g) + 3H2(g) <=> 2NH3(g)}$ with $\\Delta H^{\\circ} = -92.4\\text{ kJ/mol}$. Predict the shift in equilibrium when pressure and temperature are varied.`,
      answer: `Ammonia synthesis is governed by the reversible gas-phase exothermic equilibrium:

$$\\ce{N2(g) + 3H2(g) <=> 2NH3(g)} \\quad (\\Delta H^{\\circ} = -92.4\\text{ kJ/mol})$$

The equilibrium constant expression in terms of partial pressures is:

$$K_p = \\frac{P_{\\mathrm{NH_3}}^2}{P_{\\mathrm{N_2}} \\cdot P_{\\mathrm{H_2}}^3}$$

## Step 1: Effect of Increasing Total Pressure
Count the moles of gaseous reactants versus products:
- Reactant side: $1\\text{ mol } \\ce{N2} + 3\\text{ mol } \\ce{H2} = 4\\text{ moles of gas}$
- Product side: $2\\text{ moles of } \\ce{NH3}$

According to Le Chatelier's Principle, increasing system pressure shifts the equilibrium toward the side with **fewer moles of gas** to relieve the pressure stress.
Therefore, high pressure shifts the position **to the right (favors ammonia synthesis)**.

## Step 2: Effect of Temperature Variation
Because the forward reaction is **exothermic** (releases heat):

$$\\ce{N2(g) + 3H2(g) <=> 2NH3(g)} + \\text{Heat}$$

- **Increasing temperature:** Shifts the equilibrium **left (endothermic direction)**, decreasing the equilibrium yield and reducing $K_p$.
- **Industrial Compromise:** In practice, an intermediate temperature ($400\\text{--}450^{\\circ}\\text{C}$) is chosen alongside an iron catalyst to maintain viable reaction kinetics without excessively lowering thermodynamic yield.`,
      tags: ['chemistry', 'chemical-equilibrium', 'le-chatelier', 'thermodynamics'],
      views: 1120,
    },

    // COMPUTER SCIENCE: Binary Search
    {
      title: 'What is the exact recurrence relation and time complexity of Binary Search?',
      slug: 'binary-search-algorithm-recurrence-complexity',
      subjectId: cs.id,
      body: `Derive the time complexity of the Binary Search algorithm on a sorted array of size $n$ using the recurrence relation and Master Theorem.`,
      answer: `Binary search operates by comparing the target with the median element of a sorted sequence, halving the search space in each iteration:

$$T(n) = T\\left(\\frac{n}{2}\\right) + O(1) \\implies T(n) = O(\\log_2 n)$$

## Step 1: Formulate the Recurrence Relation
In each recursive step:
1. Calculating middle index and performing 1 comparison takes $O(1)$ constant time.
2. The remaining search space is reduced to size $\\lfloor n / 2 \\rfloor$.

$$T(n) = T\\left(\\frac{n}{2}\\right) + c, \\quad T(1) = O(1)$$

## Step 2: Expansion via Iterative Unrolling
Unroll the recurrence relation step by step:

$$\\begin{aligned}
T(n) &= T(n/2) + c \\\\
     &= T(n/4) + 2c \\\\
     &= T(n/8) + 3c \\\\
     &\\;\\;\\vdots \\\\
     &= T(n/2^k) + k \\cdot c
\\end{aligned}$$

The base case is reached when the search space shrinks to size $1$:

$$\\frac{n}{2^k} = 1 \\implies n = 2^k \\implies k = \\log_2 n$$

Substitute $k$ back into the unrolled equation:

$$T(n) = T(1) + c\\log_2 n = O(\\log n)$$

## Step 3: Implementation in TypeScript

\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    // Avoid integer overflow
    const mid = left + Math.floor((right - left) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1; // Target not found
}
\`\`\`

### Complexity Summary
- **Best Case:** $O(1)$ (target found at middle index)
- **Worst / Average Case:** $O(\\log n)$
- **Auxiliary Space:** $O(1)$ iterative, $O(\\log n)$ recursive call stack`,
      tags: ['computer-science', 'algorithms', 'binary-search', 'big-o'],
      views: 1540,
    },
  ];

  for (const q of questions) {
    await prisma.question.upsert({
      where: { slug: q.slug },
      update: {
        title: q.title,
        body: q.body,
        answer: q.answer,
        tags: q.tags,
        views: q.views,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        title: q.title,
        slug: q.slug,
        subjectId: q.subjectId,
        body: q.body,
        answer: q.answer,
        tags: q.tags,
        views: q.views,
        status: ContentStatus.PUBLISHED,
      },
    });
  }
  console.log(`Seeded ${questions.length} STEM Markdown questions.`);

  // 4. Seed High-Yield Study Notes with Scientific Summaries
  const notes = [
    {
      title: 'Complete Calculus Reference: Derivatives & Integrals',
      slug: 'calculus-derivatives-and-integrals-formula-sheet',
      subjectId: math.id,
      description: `Comprehensive 4-page mathematical formula sheet covering:
- **Power & Product Rules:** $\\frac{d}{dx}[x^n] = n x^{n-1}$, $\\frac{d}{dx}[uv] = u'v + uv'$
- **Trigonometric Derivatives:** $\\frac{d}{dx}[\\sin x] = \\cos x$, $\\frac{d}{dx}[\\tan x] = \\sec^2 x$
- **Integral Tables:** $\\int \\frac{1}{x} dx = \\ln|x| + C$, $\\int e^{ax} dx = \\frac{1}{a}e^{ax} + C$
- **Integration by Parts:** $\\int u\\,dv = uv - \\int v\\,du$`,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1691234567/sample.pdf',
      fileType: 'pdf',
      fileSize: 420000,
      tags: ['calculus', 'cheatsheet', 'formulas', 'differentiation', 'integration'],
    },
    {
      title: 'Classical Mechanics: Collisions, Momentum & Work-Energy Theorem',
      slug: 'classical-mechanics-collision-dynamics-notes',
      subjectId: phy.id,
      description: `High-yield physics summary notes covering:
- **Linear Momentum:** $\\vec{p} = m\\vec{v}$, $\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt}$
- **Center of Mass:** $\\vec{R}_{\\text{cm}} = \\frac{1}{M}\\sum m_i \\vec{r}_i$
- **Work-Kinetic Energy Theorem:** $W_{\\text{net}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$
- **1D Elastic Collision Matrix:** $v_1' = \\frac{m_1 - m_2}{m_1 + m_2}v_1 + \\frac{2m_2}{m_1 + m_2}v_2$`,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1691234567/sample.pdf',
      fileType: 'pdf',
      fileSize: 512000,
      tags: ['physics', 'mechanics', 'momentum', 'energy', 'notes'],
    },
    {
      title: 'Chemical Equilibrium & Acid-Base Kinetics Guide',
      slug: 'chemical-equilibrium-acid-base-formula-guide',
      subjectId: chem.id,
      description: `Essential inorganic and physical chemistry study notes:
- **Equilibrium Constant:** $K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$, $K_p = K_c(RT)^{\\Delta n_g}$
- **pH & Henderson-Hasselbalch:** $\\mathrm{pH} = -\\log[\\mathrm{H}^+]$, $\\mathrm{pH} = \\mathrm{p}K_a + \\log\\frac{[\\mathrm{A}^-]}{[\\mathrm{HA}]}$
- **Gibbs Free Energy Coupling:** $\\Delta G^{\\circ} = -RT\\ln K$`,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1691234567/sample.pdf',
      fileType: 'pdf',
      fileSize: 380000,
      tags: ['chemistry', 'equilibrium', 'ph', 'thermodynamics'],
    },
  ];

  for (const n of notes) {
    await prisma.note.upsert({
      where: { slug: n.slug },
      update: {
        title: n.title,
        description: n.description,
        fileUrl: n.fileUrl,
        fileType: n.fileType,
        fileSize: n.fileSize,
        tags: n.tags,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        title: n.title,
        slug: n.slug,
        subjectId: n.subjectId,
        description: n.description,
        fileUrl: n.fileUrl,
        fileType: n.fileType,
        fileSize: n.fileSize,
        tags: n.tags,
        status: ContentStatus.PUBLISHED,
      },
    });
  }
  console.log(`Seeded ${notes.length} STEM notes.`);

  // 5. Seed Sample Search Logs
  const searchQueries = [
    { query: 'calculus differentiation', count: 52 },
    { query: 'chain rule', count: 44 },
    { query: 'integration by parts', count: 38 },
    { query: 'schrodinger equation', count: 31 },
    { query: 'elastic collision', count: 27 },
    { query: 'le chatelier equilibrium', count: 22 },
    { query: 'binary search algorithm', count: 19 },
  ];

  for (const log of searchQueries) {
    await prisma.searchLog.upsert({
      where: { query: log.query },
      update: { count: log.count },
      create: log,
    });
  }

  console.log('Database updated successfully with new scientific STEM Markdown!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
