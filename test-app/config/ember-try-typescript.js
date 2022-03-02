module.exports = {
  useYarn: true,
  command: 'tsc --noEmit',
  scenarios: [
    {
      name: 'typescript-4.2',
      npm: {
        typescript: '~4.2',
      },
    },
    {
      name: 'typescript-4.3',
      npm: {
        typescript: '~4.3',
      },
    },
    {
      name: 'typescript-4.4',
      npm: {
        typescript: '~4.4',
      },
    },
    {
      name: 'typescript-4.5',
      npm: {
        typescript: '~4.5',
      },
    },
    {
      name: 'typescript-next',
      allowedToFail: true,
      npm: {
        devDependencies: {
          typescript: 'next',
        },
      },
    },
  ],
};
