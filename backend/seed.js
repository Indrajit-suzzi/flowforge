import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import logger from "./src/utils/logger.js";

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info("Connected to MongoDB");

  // Check if already seeded (look for default admin user)
  const User = (await import("./src/models/user.js")).default;
  const existing = await User.findOne({ email: "admin@flowforge.app" });
  if (existing) {
    logger.info("Database already seeded — skipping");
    await mongoose.disconnect();
    process.exit(0);
  }

  // 1. Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await User.create({
    username: "Admin",
    email: "admin@flowforge.app",
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });
  logger.info(`Created admin user: ${admin.email}`);

  // 2. Create default roles
  const Role = (await import("./src/models/role.js")).default;
  const roles = await Role.insertMany([
    {
      tenantId: admin._id.toString(),
      name: "Admin",
      slug: "admin",
      description: "Full access to all features",
      isSystem: true,
      permissions: {
        contentTypes: true, contentEntries: true, apiKeys: true,
        analytics: true, auditLogs: true, webhooks: true,
        mediaLibrary: true, userManagement: true, systemSettings: true,
        roles: true, branding: true,
      },
    },
    {
      tenantId: admin._id.toString(),
      name: "Editor",
      slug: "editor",
      description: "Can manage content and media",
      isSystem: true,
      permissions: {
        contentTypes: true, contentEntries: true, apiKeys: false,
        analytics: true, auditLogs: false, webhooks: false,
        mediaLibrary: true, userManagement: false, systemSettings: false,
        roles: false, branding: false,
      },
    },
    {
      tenantId: admin._id.toString(),
      name: "Viewer",
      slug: "viewer",
      description: "Read-only access to content",
      isSystem: true,
      permissions: {
        contentTypes: false, contentEntries: true, apiKeys: false,
        analytics: false, auditLogs: false, webhooks: false,
        mediaLibrary: false, userManagement: false, systemSettings: false,
        roles: false, branding: false,
      },
    },
  ]);
  logger.info(`Created ${roles.length} default roles`);

  // 3. Create sample content types
  const ContentType = (await import("./src/models/contentType.js")).default;
  const postType = await ContentType.create({
    tenantId: admin._id.toString(),
    name: "Post",
    slug: "posts",
    fields: [
      { name: "title", type: "String", required: true },
      { name: "slug", type: "String", required: true },
      { name: "body", type: "RichText", required: false },
      { name: "excerpt", type: "String", required: false },
      { name: "author", type: "String", required: false },
      { name: "published", type: "Boolean", required: false, defaultValue: false },
    ],
    locales: ["en"],
  });
  logger.info(`Created content type: ${postType.name}`);

  const pageType = await ContentType.create({
    tenantId: admin._id.toString(),
    name: "Page",
    slug: "pages",
    fields: [
      { name: "title", type: "String", required: true },
      { name: "slug", type: "String", required: true },
      { name: "content", type: "RichText", required: false },
      { name: "published", type: "Boolean", required: false, defaultValue: false },
    ],
    locales: ["en"],
  });
  logger.info(`Created content type: ${pageType.name}`);

  // 4. Create sample entries
  const getModel = (await import("./src/models/genericModel.js")).default;
  const PostModel = getModel(postType.name, {
    title: String, slug: String, body: String, excerpt: String, author: String, published: Boolean,
  });
  const PageModel = getModel(pageType.name, {
    title: String, slug: String, content: String, published: Boolean,
  });

  const posts = await PostModel.insertMany([
    {
      tenantId: admin._id.toString(),
      title: "Welcome to FlowForge",
      slug: "welcome-to-flowforge",
      body: "<h1>Welcome!</h1><p>FlowForge is a multi-tenant headless CMS built with Node.js, Express, and MongoDB. This is a sample post to get you started.</p>",
      excerpt: "A quick introduction to FlowForge headless CMS",
      author: "Admin",
      published: true,
      status: "published",
      publishedAt: new Date(),
    },
    {
      tenantId: admin._id.toString(),
      title: "Getting Started Guide",
      slug: "getting-started",
      body: "<h2>Quick Start</h2><p>FlowForge supports dynamic content types, REST & GraphQL APIs, media management, webhooks, and more. Explore the admin panel to create your own content types.</p>",
      excerpt: "How to get started with FlowForge",
      author: "Admin",
      published: true,
      status: "published",
      publishedAt: new Date(),
    },
    {
      tenantId: admin._id.toString(),
      title: "Draft Post",
      slug: "draft-post",
      body: "<p>This post is still in draft mode and won't appear in API responses unless you include drafts.</p>",
      excerpt: "An example draft post",
      author: "Admin",
      published: false,
      status: "draft",
    },
  ]);
  logger.info(`Created ${posts.length} sample posts`);

  const pages = await PageModel.insertMany([
    {
      tenantId: admin._id.toString(),
      title: "About",
      slug: "about",
      content: "<p>FlowForge CMS — built for developers who need flexibility without sacrificing performance.</p><ul><li>Multi-tenant architecture</li><li>Dynamic content types</li><li>REST + GraphQL APIs</li><li>Built-in media management</li></ul>",
      published: true,
      status: "published",
      publishedAt: new Date(),
    },
    {
      tenantId: admin._id.toString(),
      title: "Contact",
      slug: "contact",
      content: "<p>You can reach the admin team through the API or configure your own contact form using the Forms module.</p>",
      published: true,
      status: "published",
      publishedAt: new Date(),
    },
  ]);
  logger.info(`Created ${pages.length} sample pages`);

  logger.info("\n✓ Seeding complete!\n");
  logger.info({ email: "admin@flowforge.app", password: "admin123" }, "Default admin credentials");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  logger.error({ err }, "Seeding failed");
  process.exit(1);
});
