/**
 * Board templates: JSON-defined initial board states that can be applied
 * when creating a new board. Each template provides a set of pre-placed
 * objects (shapes, text, regions) following common meeting patterns.
 */

export interface TemplateObject {
  objectType: string;
  data: Record<string, unknown>;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  objects: TemplateObject[];
}

export const TEMPLATES: BoardTemplate[] = [
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Four-quadrant grid for Strengths, Weaknesses, Opportunities, and Threats',
    objects: [
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 100,
          y: 100,
          width: 400,
          height: 300,
          fillColor: '#1b4332',
          label: 'Strengths',
          region: 'swot-s',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 520,
          y: 100,
          width: 400,
          height: 300,
          fillColor: '#7f1d1d',
          label: 'Weaknesses',
          region: 'swot-w',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 100,
          y: 420,
          width: 400,
          height: 300,
          fillColor: '#1e3a5f',
          label: 'Opportunities',
          region: 'swot-o',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 520,
          y: 420,
          width: 400,
          height: 300,
          fillColor: '#4a1942',
          label: 'Threats',
          region: 'swot-t',
        },
      },
      {
        objectType: 'text',
        data: { x: 410, y: 50, text: 'SWOT Analysis', fontSize: 24, fontWeight: 'bold' },
      },
    ],
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    description: 'Three-column workflow: To Do, In Progress, Done',
    objects: [
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 50,
          y: 100,
          width: 300,
          height: 600,
          fillColor: '#1a1a2e',
          label: 'To Do',
          region: 'kanban-todo',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 370,
          y: 100,
          width: 300,
          height: 600,
          fillColor: '#1a1a2e',
          label: 'In Progress',
          region: 'kanban-progress',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 690,
          y: 100,
          width: 300,
          height: 600,
          fillColor: '#1a1a2e',
          label: 'Done',
          region: 'kanban-done',
        },
      },
      {
        objectType: 'text',
        data: { x: 410, y: 50, text: 'Kanban Board', fontSize: 24, fontWeight: 'bold' },
      },
    ],
  },
  {
    id: 'agenda',
    name: 'Meeting Agenda',
    description: 'Structured agenda with time slots and discussion topics',
    objects: [
      {
        objectType: 'text',
        data: { x: 100, y: 50, text: 'Meeting Agenda', fontSize: 28, fontWeight: 'bold' },
      },
      {
        objectType: 'text',
        data: { x: 100, y: 120, text: 'Date: ___________', fontSize: 16 },
      },
      {
        objectType: 'text',
        data: { x: 100, y: 160, text: 'Attendees: ___________', fontSize: 16 },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 80,
          y: 220,
          width: 500,
          height: 80,
          fillColor: '#16213e',
          label: '1. Opening / Check-in (5 min)',
          region: 'agenda-1',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 80,
          y: 320,
          width: 500,
          height: 80,
          fillColor: '#16213e',
          label: '2. Main Discussion (20 min)',
          region: 'agenda-2',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 80,
          y: 420,
          width: 500,
          height: 80,
          fillColor: '#16213e',
          label: '3. Action Items (10 min)',
          region: 'agenda-3',
        },
      },
      {
        objectType: 'shape',
        data: {
          shapeType: 'rect',
          x: 80,
          y: 520,
          width: 500,
          height: 80,
          fillColor: '#16213e',
          label: '4. Wrap-up / Next Steps (5 min)',
          region: 'agenda-4',
        },
      },
    ],
  },
  {
    id: 'blank',
    name: 'Blank Board',
    description: 'Empty board with no pre-placed objects',
    objects: [],
  },
];

export function getTemplateById(id: string): BoardTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
