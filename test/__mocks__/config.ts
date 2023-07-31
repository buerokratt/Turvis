export const _config = {
    turvis: {
      application: {
        finalResponseCode: {
          override: true,
        },
        logLevel: 'info',
      },
      DSL: {
        baseDir: 'test/__testData__/patterns',
        regex: {
          patternsDir: 'regex',
        },
        http: {
          httpRulesDir: 'rulesets',
          failOnFirst: true,
          output: false,
        },
        logs: {
          logRulesDir: 'logs',
          logsSourceDir: 'test/__testData__/logsSource',
          logsDestinationDir: 'test/__testData__/logsDestination',
          logsFailedDestinationDir: 'test/__testData__/logsFailedDestination',
        },
      },
    },
  };