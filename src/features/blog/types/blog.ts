export type BlogSubtopic = {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
};

export type BlogAuthor = {
  name: string;
};

export type BlogPostImage = {
  id: string;
  url: string;
};

export type BlogComment = {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  authority: 'visible' | 'anonymous';
  status: 'published' | 'deleted';
  netScore: number;
  depth: number;
  createdAt: string;
  author: BlogAuthor | null;
  mine: boolean;
  myVote: number;
  images?: BlogPostImage[];
};

export type BlogPost = {
  id: string;
  subtopicId: string;
  body: string;
  authority: 'visible' | 'anonymous';
  status: 'published' | 'deleted';
  netScore: number;
  createdAt: string;
  author: BlogAuthor | null;
  images: BlogPostImage[];
  comments: BlogComment[];
  mine: boolean;
  myVote: number;
};

export type Blog = {
  subjectId: string;
  subtopics: BlogSubtopic[];
  posts: BlogPost[];
};
