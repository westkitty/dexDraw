import { describe, expect, it } from 'vitest';
import { getTemplateById, TEMPLATES } from '../templates/index.js';

describe('Templates', () => {
  it('has at least 4 templates including blank', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(4);
    const ids = TEMPLATES.map((t) => t.id);
    expect(ids).toContain('blank');
    expect(ids).toContain('swot');
    expect(ids).toContain('kanban');
    expect(ids).toContain('agenda');
  });

  it('blank template has no objects', () => {
    const blank = getTemplateById('blank');
    expect(blank).toBeDefined();
    expect(blank?.objects).toHaveLength(0);
  });

  it('SWOT template has 5 objects', () => {
    const swot = getTemplateById('swot');
    expect(swot).toBeDefined();
    expect(swot?.objects.length).toBe(5);
  });

  it('kanban template has 4 objects (3 columns + title)', () => {
    const kanban = getTemplateById('kanban');
    expect(kanban).toBeDefined();
    expect(kanban?.objects.length).toBe(4);
  });

  it('agenda template has objects', () => {
    const agenda = getTemplateById('agenda');
    expect(agenda).toBeDefined();
    expect(agenda?.objects.length).toBeGreaterThan(0);
  });

  it('all templates have required fields', () => {
    for (const tmpl of TEMPLATES) {
      expect(tmpl.id).toBeTruthy();
      expect(tmpl.name).toBeTruthy();
      expect(tmpl.description).toBeTruthy();
      expect(Array.isArray(tmpl.objects)).toBe(true);
      for (const obj of tmpl.objects) {
        expect(obj.objectType).toBeTruthy();
        expect(obj.data).toBeDefined();
      }
    }
  });

  it('returns undefined for unknown template', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined();
  });
});
