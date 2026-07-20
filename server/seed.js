require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const ScopeItem = require('./models/ScopeItem');
const ClientRequest = require('./models/ClientRequest');
const ChangeOrder = require('./models/ChangeOrder');
const Notification = require('./models/Notification');

const DEMO_EMAIL = 'demo@scopelock.app';
const DEMO_PASSWORD = 'demo1234';

const seed = async () => {
  await connectDB();

  await Promise.all([
    Notification.deleteMany({}),
    ChangeOrder.deleteMany({}),
    ClientRequest.deleteMany({}),
    ScopeItem.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({ email: DEMO_EMAIL }),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.create({
    name: 'Demo Freelancer',
    email: DEMO_EMAIL,
    passwordHash,
  });

  const portalToken = crypto.randomBytes(32).toString('hex');

  const project = await Project.create({
    freelancerId: user._id,
    title: 'Acme Website Redesign',
    clientName: 'Acme Corp',
    hourlyRate: 75,
    portalToken,
    status: 'active',
    totalPrice: 0,
    totalHours: 0,
  });

  const scopeItems = await ScopeItem.insertMany([
    {
      projectId: project._id,
      title: 'Homepage layout and hero section',
      description: 'Design and build the marketing homepage with a responsive hero.',
      categoryTag: 'frontend',
      estimatedHours: 12,
    },
    {
      projectId: project._id,
      title: 'Contact form with email delivery',
      description: 'Build a validated contact form that sends messages to the client inbox.',
      categoryTag: 'forms',
      estimatedHours: 6,
    },
    {
      projectId: project._id,
      title: 'CMS content pages',
      description: 'Set up three editable content pages in the CMS.',
      categoryTag: 'cms',
      estimatedHours: 10,
    },
    {
      projectId: project._id,
      title: 'Basic SEO setup',
      description: 'Add meta tags, sitemap, and Open Graph defaults.',
      categoryTag: 'seo',
      estimatedHours: 4,
    },
  ]);

  console.log('Seed complete');
  console.log('Demo login email:', DEMO_EMAIL);
  console.log('Demo login password:', DEMO_PASSWORD);
  console.log('Demo project id:', project._id.toString());
  console.log('Portal token:', portalToken);
  console.log('Portal path: /portal/' + portalToken);
  console.log('Scope items created:', scopeItems.length);

  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  try {
    await mongoose.connection.close();
  } catch (closeErr) {
    // ignore close errors during failure cleanup
  }
  process.exit(1);
});
