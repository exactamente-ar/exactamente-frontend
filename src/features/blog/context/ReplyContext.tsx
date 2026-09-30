import { createContext, useContext, useState, type ReactNode } from 'react';

export type ReplyTarget = {
  postId: string;
  parentId: string | null;
  snippet: string;
};

interface ReplyContextValue {
  replyTarget: ReplyTarget | null;
  setReplyTarget: (target: ReplyTarget | null) => void;
}

const ReplyContext = createContext<ReplyContextValue | null>(null);

export function ReplyProvider({ children }: { children: ReactNode }) {
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  return (
    <ReplyContext.Provider value={{ replyTarget, setReplyTarget }}>
      {children}
    </ReplyContext.Provider>
  );
}

export function useReplyContext(): ReplyContextValue {
  const ctx = useContext(ReplyContext);
  if (!ctx) throw new Error('useReplyContext debe usarse dentro de ReplyProvider');
  return ctx;
}
