export interface Segment {
  uuid: string;
  name: string;
  subscribers_count: number;
  stored_conditions: unknown[] | null;
  created_at: string | null;
}
