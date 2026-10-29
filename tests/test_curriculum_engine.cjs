const test = require('node:test');
const assert = require('node:assert/strict');
const {applicable, eligibleContent} = require('../curriculum.js');
const program = {id:'p', version:'v1', reference_status:'verified', effective_from:'2025-09-01', effective_until:null};
const content = {program_id:'p', program_version:'v1', chapter_ids:['c'], review_status:'verified'};
test('un programme futur, expiré ou sans date ne publie pas de contenu', () => {
  assert.equal(applicable(program), true);
  for (const change of [{effective_from:'2027-09-01'}, {effective_until:'2026-12-31'}, {effective_from:null}, {effective_from:'2026-02-30'}, {effective_until:'2027-99-99'}, {reference_status:'identified'}]) {
    assert.equal(applicable({...program, ...change}), false);
  }
});
test('une activité doit correspondre à la version et au chapitre validés', () => {
  assert.equal(eligibleContent(program, content, 'c'), true);
  for (const change of [{program_version:'v0'}, {program_id:'autre'}, {review_status:'unverified'}, {chapter_ids:['autre']}]) {
    assert.equal(eligibleContent(program, {...content,...change}, 'c'), false);
  }
});
