import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const pipelineYaml = readFileSync(join(root, '.forge/pipeline.yaml'), 'utf8');
const ciWorkflow = readFileSync(join(root, '.github/workflows/emhub-ci.yml'), 'utf8');
const deployWorkflow = readFileSync(join(root, '.github/workflows/emhub-deploy.yml'), 'utf8');

describe('Forge pipeline definition', () => {
  it('triggers on main and includes build:node', () => {
    assert.match(pipelineYaml, /branch:\s*main/);
    assert.match(pipelineYaml, /variantId:\s*build:node/);
  });

  it('includes parallel security scans', () => {
    assert.match(pipelineYaml, /scan:gitleaks/);
    assert.match(pipelineYaml, /scan:semgrep/);
    assert.match(pipelineYaml, /scan:sonarqube/);
  });

  it('requires manual approval for production', () => {
    assert.match(pipelineYaml, /approvalRequired:\s*true/);
    assert.match(pipelineYaml, /environment:\s*production/);
  });
});

describe('GitHub Actions workflows', () => {
  it('runs lint, test, and build on pull_request to main', () => {
    assert.match(ciWorkflow, /pull_request/);
    assert.match(ciWorkflow, /npm run lint/);
    assert.match(ciWorkflow, /npm run test/);
    assert.match(ciWorkflow, /npm run build/);
    assert.match(ciWorkflow, /timeout-minutes:\s*10/);
  });

  it('deploys dev before staging and gates production', () => {
    assert.match(deployWorkflow, /needs:\s*deploy-dev/);
    assert.match(deployWorkflow, /needs:\s*deploy-staging/);
    assert.match(deployWorkflow, /environment:\s*\n\s*name:\s*production/);
  });
});
