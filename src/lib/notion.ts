import { Client } from '@notionhq/client';

export const notion = new Client({ auth: process.env.NOTION_TOKEN });
export const PROJECTS_DB_ID = process.env.NOTION_PROJECTS_DB_ID!;

export type NotionProject = {
  id: string;
  title: string;
  statusId?: string;
  statusName?: string;
  clientPageId?: string;
  companyPageId?: string;
  priority?: number;
  startDate?: string;
  dueDate?: string;
  lastEditedTime: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProject(page: { id: string; properties: Record<string, any>; last_edited_time: string }): NotionProject {
  const props = page.properties;
  const title = (props.Name?.title?.[0]?.plain_text ?? '').trim();
  const status = props.Status?.status ?? null;
  const clientRel = props.Client?.relation?.[0]?.id;
  const companyRel = props.Company?.relation?.[0]?.id;
  const priorityNum = props.Priority?.number ?? undefined;
  const start = props.Start?.date?.start ?? undefined;
  const due = props.Due?.date?.start ?? undefined;
  return {
    id: page.id,
    title,
    statusId: status?.id,
    statusName: status?.name,
    clientPageId: clientRel,
    companyPageId: companyRel,
    priority: priorityNum ?? undefined,
    startDate: start,
    dueDate: due,
    lastEditedTime: page.last_edited_time,
  };
}