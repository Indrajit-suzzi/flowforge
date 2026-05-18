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
  }
];