export const contentTemplates = [
  {
    name: 'Blog Post',
    slug: 'blog',
    description: 'Standard blog post with title, content, author, and date',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'content', type: 'RichText', required: true },
      { name: 'excerpt', type: 'String', required: false },
      { name: 'author', type: 'String', required: true },
      { name: 'coverImage', type: 'String', required: false },
      { name: 'tags', type: 'String', required: false },
      { name: 'publishedDate', type: 'Date', required: false }
    ]
  },
  {
    name: 'Product',
    slug: 'products',
    description: 'E-commerce product with pricing and inventory',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'description', type: 'RichText', required: true },
      { name: 'price', type: 'Number', required: true },
      { name: 'comparePrice', type: 'Number', required: false },
      { name: 'sku', type: 'String', required: true },
      { name: 'inventory', type: 'Number', required: false },
      { name: 'category', type: 'String', required: false },
      { name: 'images', type: 'String', required: false },
      { name: 'isActive', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'FAQ',
    slug: 'faq',
    description: 'Frequently asked questions with categories',
    fields: [
      { name: 'question', type: 'String', required: true },
      { name: 'answer', type: 'RichText', required: true },
      { name: 'category', type: 'String', required: false },
      { name: 'order', type: 'Number', required: false }
    ]
  },
  {
    name: 'Team Member',
    slug: 'team',
    description: 'Team member profile with role and bio',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'role', type: 'String', required: true },
      { name: 'bio', type: 'RichText', required: false },
      { name: 'email', type: 'String', required: false },
      { name: 'avatar', type: 'String', required: false },
      { name: 'socialLinks', type: 'String', required: false },
      { name: 'isActive', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Event',
    slug: 'events',
    description: 'Events with date, location, and capacity',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'description', type: 'RichText', required: true },
      { name: 'startDate', type: 'Date', required: true },
      { name: 'endDate', type: 'Date', required: false },
      { name: 'location', type: 'String', required: false },
      { name: 'capacity', type: 'Number', required: false },
      { name: 'isVirtual', type: 'Boolean', required: false },
      { name: 'registrationUrl', type: 'String', required: false }
    ]
  },
  {
    name: 'Testimonial',
    slug: 'testimonials',
    description: 'Customer testimonials with rating',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'role', type: 'String', required: false },
      { name: 'company', type: 'String', required: false },
      { name: 'content', type: 'String', required: true },
      { name: 'rating', type: 'Number', required: false },
      { name: 'avatar', type: 'String', required: false },
      { name: 'isFeatured', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Portfolio Project',
    slug: 'portfolio',
    description: 'Portfolio/case study with images and links',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'description', type: 'RichText', required: true },
      { name: 'client', type: 'String', required: false },
      { name: 'category', type: 'String', required: false },
      { name: 'coverImage', type: 'String', required: false },
      { name: 'projectUrl', type: 'String', required: false },
      { name: 'year', type: 'Number', required: false },
      { name: 'technologies', type: 'String', required: false }
    ]
  },
  {
    name: 'Navigation Menu',
    slug: 'menu',
    description: 'Navigation menu items for websites',
    fields: [
      { name: 'label', type: 'String', required: true },
      { name: 'url', type: 'String', required: true },
      { name: 'order', type: 'Number', required: false },
      { name: 'isNewTab', type: 'Boolean', required: false },
      { name: 'parent', type: 'String', required: false }
    ]
  },
  {
    name: 'Landing Page',
    slug: 'landing-page',
    description: 'Marketing landing page with hero, sections, and SEO',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'heroHeadline', type: 'String', required: true },
      { name: 'heroSubheadline', type: 'String', required: false },
      { name: 'heroImage', type: 'String', required: false },
      { name: 'sections', type: 'RichText', required: false },
      { name: 'ctaText', type: 'String', required: false },
      { name: 'ctaUrl', type: 'String', required: false },
      { name: 'metaTitle', type: 'String', required: false },
      { name: 'metaDescription', type: 'String', required: false },
      { name: 'isPublished', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Category',
    slug: 'category',
    description: 'Content category for organizing entries (blog, products, etc.)',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'parent', type: 'String', required: false },
      { name: 'image', type: 'String', required: false },
      { name: 'displayOrder', type: 'Number', required: false },
      { name: 'isActive', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Job Listing',
    slug: 'jobs',
    description: 'Job posting with description, requirements, and application details',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'department', type: 'String', required: true },
      { name: 'location', type: 'String', required: true },
      { name: 'employmentType', type: 'String', required: true },
      { name: 'description', type: 'RichText', required: true },
      { name: 'requirements', type: 'RichText', required: false },
      { name: 'responsibilities', type: 'RichText', required: false },
      { name: 'salaryRange', type: 'String', required: false },
      { name: 'applicationUrl', type: 'String', required: false },
      { name: 'closingDate', type: 'Date', required: false },
      { name: 'isActive', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Press Release',
    slug: 'press-releases',
    description: 'News announcement with headline, body, and media contact',
    fields: [
      { name: 'headline', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'subheadline', type: 'String', required: false },
      { name: 'body', type: 'RichText', required: true },
      { name: 'publishedDate', type: 'Date', required: true },
      { name: 'author', type: 'String', required: false },
      { name: 'contactName', type: 'String', required: false },
      { name: 'contactEmail', type: 'String', required: false },
      { name: 'contactPhone', type: 'String', required: false },
      { name: 'featuredImage', type: 'String', required: false },
      { name: 'tags', type: 'String', required: false },
      { name: 'isEmbargoed', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Gallery Album',
    slug: 'gallery',
    description: 'Image gallery with cover, images, and captions',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'coverImage', type: 'String', required: false },
      { name: 'images', type: 'String', required: false },
      { name: 'captions', type: 'String', required: false },
      { name: 'displayOrder', type: 'Number', required: false },
      { name: 'isPublished', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Course',
    slug: 'courses',
    description: 'Educational course with modules, lessons, and duration',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'subtitle', type: 'String', required: false },
      { name: 'description', type: 'RichText', required: true },
      { name: 'instructor', type: 'String', required: true },
      { name: 'duration', type: 'String', required: false },
      { name: 'difficulty', type: 'String', required: false },
      { name: 'coverImage', type: 'String', required: false },
      { name: 'price', type: 'Number', required: false },
      { name: 'isFree', type: 'Boolean', required: false },
      { name: 'isPublished', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Recipe',
    slug: 'recipes',
    description: 'Cooking recipe with ingredients, instructions, and nutritional info',
    fields: [
      { name: 'title', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'description', type: 'String', required: false },
      { name: 'ingredients', type: 'RichText', required: true },
      { name: 'instructions', type: 'RichText', required: true },
      { name: 'prepTime', type: 'String', required: false },
      { name: 'cookTime', type: 'String', required: false },
      { name: 'totalTime', type: 'String', required: false },
      { name: 'servings', type: 'Number', required: false },
      { name: 'difficulty', type: 'String', required: false },
      { name: 'image', type: 'String', required: false },
      { name: 'tags', type: 'String', required: false }
    ]
  },
  {
    name: 'Service',
    slug: 'services',
    description: 'Business service offering with pricing and features',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'description', type: 'RichText', required: true },
      { name: 'icon', type: 'String', required: false },
      { name: 'features', type: 'RichText', required: false },
      { name: 'price', type: 'String', required: false },
      { name: 'isPopular', type: 'Boolean', required: false },
      { name: 'displayOrder', type: 'Number', required: false },
      { name: 'isActive', type: 'Boolean', required: false }
    ]
  },
  {
    name: 'Author',
    slug: 'authors',
    description: 'Author/contributor profile with bio and social links',
    fields: [
      { name: 'name', type: 'String', required: true },
      { name: 'slug', type: 'String', required: true },
      { name: 'bio', type: 'RichText', required: false },
      { name: 'avatar', type: 'String', required: false },
      { name: 'email', type: 'String', required: false },
      { name: 'website', type: 'String', required: false },
      { name: 'twitter', type: 'String', required: false },
      { name: 'linkedin', type: 'String', required: false },
      { name: 'isActive', type: 'Boolean', required: false }
    ]
  }
];