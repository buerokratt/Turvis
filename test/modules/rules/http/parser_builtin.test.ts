import * as cfg from '../../../__mocks__/config';
jest.mock('src/app/config', () => ({
  config: {
    load: jest.fn(),
    get: jest.fn(() => cfg._config),
  },
}));
import { config } from 'src/app/config';
import { rules } from 'src/modules/rules/rules.module';


function getTestFile(filename: string) {
const patternsRootDir = config.get().turvis.DSL.baseDir;
const rulesetsDir = config.get().turvis.DSL.http.httpRulesDir;
return `${patternsRootDir}/${rulesetsDir}/tests/${filename}`;
}
describe('Parser value notation tests', () => {
  it('should parse builtin validations from header and map to correct function', async () => {
    const doc = rules.parseRules(getTestFile('rule_types/header_builtin.yml'), { method: 'GET' });
    validateBuiltins(doc);
  });

  it('should parse builtin validations from query and map to correct function', async () => {
    const doc = rules.parseRules(getTestFile('rule_types/query_builtin.yml'), { method: 'GET' });
    validateBuiltins(doc);
  });
});

function validateBuiltins(doc: any) {
  // test for expect rule
  const functions = doc[0].headers;
  const exists = functions.find((item: any) => item.name === 'exists');
  expect(exists.match(['a']).result).toBeTruthy();
  expect(exists.match(['b']).result).toBeFalsy();

  // test for inOrder
  const inOrder = functions.find((item: any) => item.name === 'inOrder');
  expect(inOrder.match(['a', 'b']).result).toBeTruthy();
  expect(inOrder.match(['a', 'c', 'b']).result).toBeTruthy(); // loose in order
  expect(inOrder.match(['b', 'c', 'a']).result).toBeFalsy();

  // test for element specified in yaml but was not a builtin rule:
  const duplicate = functions.find((item: any) => item.name === 'inOrder');
  expect(duplicate.match('').result).toBeFalsy();
}
