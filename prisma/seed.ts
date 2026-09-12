import { PrismaClient, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Doubtly database...');

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
  console.log(`Admin account ensured: ${admin.username} (Password: ${defaultPassword})`);

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

  // 3. Seed Sample Questions
  const mathSubject = createdSubjects['mathematics'];
  const phySubject = createdSubjects['physics'];
  const csSubject = createdSubjects['computer-science'];

  if (mathSubject) {
    await prisma.question.upsert({
      where: { slug: 'derivative-of-sin-x-squared-chain-rule' },
      update: {},
      create: {
        title: 'How do you differentiate sin(x^2) using the chain rule?',
        slug: 'derivative-of-sin-x-squared-chain-rule',
        subjectId: mathSubject.id,
        body: '<p>Given the composite trigonometric function <code>f(x) = sin(x^2)</code>, find the first derivative with respect to <code>x</code>.</p>',
        answer: `<p>To find the derivative of <strong>f(x) = sin(x^2)</strong>, apply the <em>Chain Rule</em>:</p>
<blockquote>$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$</blockquote>
<h3>Step 1: Identify the inner and outer functions</h3>
<ul>
  <li>Outer function: <code>u(x) = sin(u)</code>, with derivative <code>u' = cos(u)</code></li>
  <li>Inner function: <code>g(x) = x^2</code>, with derivative <code>g'(x) = 2x</code></li>
</ul>
<h3>Step 2: Multiply the derivatives</h3>
<p>Substitute back into the chain rule formula:</p>
<pre><code>f'(x) = cos(x^2) * (2x) = 2x * cos(x^2)</code></pre>
<p>Therefore, the derivative is <strong>2x cos(x^2)</strong>.</p>`,
        tags: ['calculus', 'differentiation', 'chain-rule', 'trigonometry'],
        views: 1420,
        status: ContentStatus.PUBLISHED,
      },
    });

    await prisma.question.upsert({
      where: { slug: 'integration-by-parts-formula-and-liate-rule' },
      update: {},
      create: {
        title: 'How does Integration by Parts work with the LIATE rule?',
        slug: 'integration-by-parts-formula-and-liate-rule',
        subjectId: mathSubject.id,
        body: '<p>Explain the formula for Integration by Parts and how the LIATE priority mnemonic is used to select <code>u</code> and <code>dv</code>.</p>',
        answer: `<p>Integration by parts is derived from the product rule of differentiation:</p>
<blockquote>$$\\int u \\, dv = u v - \\int v \\, du$$</blockquote>
<h3>The LIATE Rule for choosing <code>u</code>:</h3>
<ol>
  <li><strong>L</strong> - Logarithmic functions (e.g., ln(x))</li>
  <li><strong>I</strong> - Inverse trigonometric functions (e.g., arctan(x))</li>
  <li><strong>A</strong> - Algebraic functions (e.g., x^2, 3x)</li>
  <li><strong>T</strong> - Trigonometric functions (e.g., sin(x), cos(x))</li>
  <li><strong>E</strong> - Exponential functions (e.g., e^x)</li>
</ol>
<p>Whichever function type appears earlier in LIATE should be chosen as <strong>u</strong>, and the remaining term becomes <strong>dv</strong>.</p>`,
        tags: ['calculus', 'integration', 'liate', 'integrals'],
        views: 980,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  if (phySubject) {
    await prisma.question.upsert({
      where: { slug: 'difference-between-elastic-and-inelastic-collisions' },
      update: {},
      create: {
        title: 'What is the key difference between elastic and inelastic collisions?',
        slug: 'difference-between-elastic-and-inelastic-collisions',
        subjectId: phySubject.id,
        body: '<p>Compare conservation of momentum and kinetic energy between elastic and completely inelastic collisions in one dimension.</p>',
        answer: `<p>Both collision types obey the law of <strong>conservation of linear momentum</strong>, but they differ in kinetic energy conservation:</p>
<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Elastic Collision</th>
      <th>Inelastic Collision</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Total Momentum</strong></td>
      <td>Conserved</td>
      <td>Conserved</td>
    </tr>
    <tr>
      <td><strong>Total Kinetic Energy</strong></td>
      <td>Conserved (No net KE lost)</td>
      <td>Not Conserved (Converted to heat/sound/deformation)</td>
    </tr>
    <tr>
      <td><strong>Coefficient of Restitution (e)</strong></td>
      <td>e = 1</td>
      <td>0 &le; e &lt; 1 (e = 0 if perfectly inelastic)</td>
    </tr>
  </tbody>
</table>`,
        tags: ['physics', 'mechanics', 'collisions', 'momentum'],
        views: 750,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  // 4. Seed Sample Note
  if (mathSubject) {
    await prisma.note.upsert({
      where: { slug: 'calculus-derivatives-and-integrals-formula-sheet' },
      update: {},
      create: {
        title: 'Complete Calculus Cheat Sheet: Derivatives & Integrals',
        slug: 'calculus-derivatives-and-integrals-formula-sheet',
        subjectId: mathSubject.id,
        description: 'A comprehensive 4-page reference sheet covering power rules, trig derivatives, exponential integrals, and Taylor series.',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1691234567/sample.pdf',
        fileType: 'pdf',
        fileSize: 420000,
        tags: ['calculus', 'cheatsheet', 'formulas', 'differentiation', 'integration'],
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  // 5. Seed Sample Video
  if (csSubject) {
    await prisma.video.upsert({
      where: { id: 'sample-video-binary-search' },
      update: {},
      create: {
        id: 'sample-video-binary-search',
        title: 'Binary Search Algorithm in 100 Seconds',
        youtubeId: 'MFhxShGxHWc',
        description: 'Quick visual walkthrough of divide and conquer binary search with O(log n) time complexity.',
        subjectId: csSubject.id,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  // 6. Seed Sample Search Logs
  const searchQueries = [
    { query: 'calculus differentiation', count: 48 },
    { query: 'chain rule', count: 35 },
    { query: 'integration by parts', count: 29 },
    { query: 'newton laws', count: 24 },
    { query: 'binary search tree', count: 18 },
  ];

  for (const log of searchQueries) {
    await prisma.searchLog.upsert({
      where: { query: log.query },
      update: { count: log.count },
      create: log,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

