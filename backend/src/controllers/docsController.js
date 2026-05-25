import ContentType from '../models/contentType.js';

export const getDocs = async (req, res) => {
    try {
        const tenantId = req.tenant;
        const contentTypes = await ContentType.find({ tenantId });

        const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
        const authNote = 'Use header: `Authorization: Bearer <token>` or `X-API-Key: <key>`';

        const docs = {
            baseUrl,
            authentication: authNote,
            graphqlEndpoint: `${baseUrl}/graphql`,
            endpoints: [],
            contentTypes: contentTypes.map(ct => ({
                name: ct.name,
                slug: ct.slug,
                fields: ct.fields,
                endpoints: {
                    list: { method: 'GET', path: `/dynamic/${ct.slug}`, description: 'List all entries' },
                    create: { method: 'POST', path: `/dynamic/${ct.slug}`, description: 'Create entry' },
                    get: { method: 'GET', path: `/dynamic/${ct.slug}/:id`, description: 'Get single entry' },
                    update: { method: 'PUT', path: `/dynamic/${ct.slug}/:id`, description: 'Update entry' },
                    delete: { method: 'DELETE', path: `/dynamic/${ct.slug}/:id`, description: 'Delete entry' },
                    publish: { method: 'PATCH', path: `/dynamic/${ct.slug}/:id/publish`, description: 'Publish entry' },
                    unpublish: { method: 'PATCH', path: `/dynamic/${ct.slug}/:id/unpublish`, description: 'Unpublish entry' },
                    exportJson: { method: 'GET', path: `/dynamic/${ct.slug}/export/json`, description: 'Export as JSON' },
                    exportCsv: { method: 'GET', path: `/dynamic/${ct.slug}/export/csv`, description: 'Export as CSV' },
                    listVersions: { method: 'GET', path: `/dynamic/${ct.slug}/:id/versions`, description: 'List all versions of an entry' },
                    getVersion: { method: 'GET', path: `/dynamic/${ct.slug}/:id/versions/:versionId`, description: 'Get specific version data' },
                    rollback: { method: 'POST', path: `/dynamic/${ct.slug}/:id/rollback/:versionId`, description: 'Rollback entry to a previous version' }
                }
            }))
        };

        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDocsMarkdown = async (req, res) => {
    try {
        const tenantId = req.tenant;
        const contentTypes = await ContentType.find({ tenantId });
        const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;

        let md = `# FlowForge API Documentation\n\n`;
        md += `**Base URL:** \`${baseUrl}\`\n\n`;
        md += `## Authentication\n\nUse header: \`Authorization: Bearer <token>\` or \`X-API-Key: <key>\`\n\n`;

        for (const ct of contentTypes) {
            md += `## ${ct.name} (\`/${ct.slug}\`)\n\n`;
            md += `### Fields\n\n| Name | Type | Required |\n|------|------|----------|\n`;
            for (const f of ct.fields) {
                md += `| ${f.name} | ${f.type} | ${f.required ? 'Yes' : 'No'} |\n`;
            }
            md += `\n### Endpoints\n\n`;
            md += `\`GET    ${baseUrl}/dynamic/${ct.slug}\` - List all entries\n`;
            md += `\`POST   ${baseUrl}/dynamic/${ct.slug}\` - Create entry\n`;
            md += `\`GET    ${baseUrl}/dynamic/${ct.slug}/:id\` - Get single entry\n`;
            md += `\`PUT    ${baseUrl}/dynamic/${ct.slug}/:id\` - Update entry\n`;
            md += `\`DELETE ${baseUrl}/dynamic/${ct.slug}/:id\` - Delete entry\n`;
            md += `\`PATCH  ${baseUrl}/dynamic/${ct.slug}/:id/publish\` - Publish\n`;
            md += `\`PATCH  ${baseUrl}/dynamic/${ct.slug}/:id/unpublish\` - Unpublish\n`;
            md += `\`GET    ${baseUrl}/dynamic/${ct.slug}/export/json\` - Export JSON\n`;
            md += `\`GET    ${baseUrl}/dynamic/${ct.slug}/export/csv\` - Export CSV\n`;
            md += `\`GET    ${baseUrl}/dynamic/${ct.slug}/:id/versions\` - List all versions\n`;
            md += `\`GET    ${baseUrl}/dynamic/${ct.slug}/:id/versions/:versionId\` - Get specific version\n`;
            md += `\`POST   ${baseUrl}/dynamic/${ct.slug}/:id/rollback/:versionId\` - Rollback to a version\n\n`;
        }

        res.setHeader('Content-Type', 'text/markdown');
        res.send(md);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};