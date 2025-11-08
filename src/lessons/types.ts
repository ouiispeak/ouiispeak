export type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  content?: string;
  html?: string;
  metadata?: Record<string, unknown>;
};
