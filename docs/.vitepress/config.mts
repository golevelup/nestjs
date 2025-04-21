import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Golevelup Documentation',
  description:
    'A collection of badass modules and utilities to help you level up your NestJS applications',
  base: '/nestjs/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/what-is-golevelup-nestjs' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          {
            text: 'What is @golevelup/nestjs?',
            link: '/what-is-golevelup-nestjs',
          },
        ],
      },
      {
        text: 'Modules',
        items: [
          {
            text: 'Hasura',
            link: '/modules/hasura',
          },
          {
            text: 'RabbitMQ',
            link: '/modules/rabbitmq',
          },
          {
            text: 'Stripe',
            link: '/modules/stripe',
          },
        ],
      },
      {
        text: 'Utilities',
        items: [
          {
            text: 'Discovery',
            link: '/discovery',
          },
          {
            text: 'GraphQL Request',
            link: '/graphql-request',
          },
          {
            text: 'Common',
            link: '/common',
          },
          {
            text: 'Modules',
            link: '/modules',
          },
          {
            text: 'Webhooks',
            link: '/webhooks',
          },
        ],
      },
      {
        text: 'Testing',
        items: [
          {
            text: 'Jest',
            link: '/testing/ts-jest',
          },
          {
            text: 'Sinon',
            link: '/testing/ts-sinon',
          },
          {
            text: 'Vitest',
            link: '/testing/ts-vitest',
          },
        ],
      },
      {
        text: 'Contributing',
        link: '/contributing',
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/golevelup/nestjs' },
    ],
  },
});
