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
          logsSourceDir: "__testData__/filedrop/incoming",
          logsDestinationDir: "__testData__/filedrop/processed",
          logsFailedDestinationDir: "__testData/filedrop/failed"
        },
      },
    },
  };