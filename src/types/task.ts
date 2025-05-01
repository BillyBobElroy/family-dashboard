// types/task.ts
export type ChecklistItem = {
    id: string;
    text: string;
    checked: boolean; // ✅ unified key name
  };
  
  export type Task = {
    id: string;
    title: string;
    assignedTo: string;
    time?: string;
    repeat?: string;
    completed: boolean;
    dueDate: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    checklist?: ChecklistItem[];
    notes?: string;
  };
  