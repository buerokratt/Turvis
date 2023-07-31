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

describe('Rules parser', () => {
  it('should throw an error when file is not found', () => {
    expect(() => rules.parseRules('non-existing', { method: 'GET' })).toThrowError();
  });

  it('should not throw an error when rulesets does not specify any validations', async () => {
    const docList = rules.parseRules(getTestFile('no_rules.yml'), { method: 'GET' });

    expect(docList.length).toBe(1);

    const doc = docList[0];

    expect(doc.headers!.length).toBe(0);
    expect(doc.query!.length).toBe(0);
    expect(doc.body!.length).toBe(0);
  });

  it('should parse the referenced file', () => {
    const doc = rules.parseRules(getTestFile('reference.yml'), { method: 'GET' });
    expect(doc.length).toBe(2);
  });

  it('should parse reference chain', async () => {
    const doc = rules.parseRules(getTestFile('reference_chain.yml'), { method: 'GET' });
    expect(doc.length).toBe(3);
  });

  it('should throw an error when file exists but is empty', async () => {
    expect(() => rules.parseRules(getTestFile('empty.yml'), { method: 'GET' })).toThrowError();
  });

  it('should not throw an error when there is headers section but no values', async () => {
    const doc = rules.parseRules(getTestFile('empty_header.yml'), { method: 'GET' });
    expect(doc.length).toBe(1);
  });

  it('should fail if multiple header sections are defined', () => {
    expect(() => rules.parseRules(getTestFile('multiple_header.yml'), { method: 'GET' })).toThrowError();
  });

  it('should parse body configuration', async () => {
    const doc = rules.parseRules(getTestFile('body_validation/body.yml'), { method: 'GET' });  
    expect(doc.length).toBe(1);
  });
});
