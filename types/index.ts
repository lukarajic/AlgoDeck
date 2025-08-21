export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicTags: string[];
  content: string;
  solution: string;
  hint?: string;
}
