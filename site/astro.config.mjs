import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://mattymailers.github.io/smartmoving-mcp/',
  integrations: [
    starlight({
      title: 'SmartMoving MCP + CLI',
      description: 'Unofficial SmartMoving MCP server and safety-gated CLI docs for authorized API users.',
      editLink: {
        baseUrl: 'https://github.com/MattyMailers/smartmoving-mcp/edit/feat/smartmoving-cli-mvp/site/'
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/MattyMailers/smartmoving-mcp'
        }
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [
            { label: 'Home', slug: 'index' },
            { label: 'Quickstart', slug: 'quickstart' },
            { label: 'Install', slug: 'install' },
            { label: 'MCP setup', slug: 'mcp-setup' }
          ]
        },
        {
          label: 'Use the tools',
          items: [
            { label: 'CLI docs', slug: 'cli' },
            { label: 'Commands index', slug: 'commands' },
            { label: 'AI agents', slug: 'ai-agents' },
            { label: 'Safety model', slug: 'safety-model' },
            { label: 'Live testing', slug: 'live-testing' }
          ]
        }
      ],
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'robots',
            content: 'index,follow'
          }
        }
      ]
    })
  ]
});
