import { prisma } from '@/lib/prisma';
import { getEnv } from '@/lib/env';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function InsightsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const env = getEnv();
  
  if (env.INSIGHTS_PASSWORD) {
    const authHeader = (await headers()).get('authorization');
    const authQuery = searchParams.pw;
    if (authHeader !== `Bearer ${env.INSIGHTS_PASSWORD}` && authQuery !== env.INSIGHTS_PASSWORD) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full">
            <h1 className="text-xl font-bold text-slate-800 mb-4">Access Denied</h1>
            <p className="text-sm text-slate-600 mb-6">Enter password to view insights.</p>
            <form action="" method="get">
              <input 
                type="password" 
                name="pw" 
                className="w-full border border-slate-300 rounded px-3 py-2 mb-4 text-sm" 
                placeholder="Password"
              />
              <button className="w-full bg-slate-800 text-white rounded px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors">
                Login
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  const [
    totalConversations,
    totalMessages,
    fallbackMessages,
    feedbackStats,
  ] = await Promise.all([
    prisma.conversation.count(),
    prisma.message.count({ where: { role: 'assistant' } }),
    prisma.message.count({ where: { role: 'assistant', content: { contains: 'I\'m experiencing some technical difficulties' } } }),
    prisma.feedback.groupBy({
      by: ['rating'],
      _count: true,
    }),
  ]);

  const fallbackRate = totalMessages > 0 ? (fallbackMessages / totalMessages) * 100 : 0;
  
  const upVotes = feedbackStats.find(f => f.rating === 'up')?._count ?? 0;
  const downVotes = feedbackStats.find(f => f.rating === 'down')?._count ?? 0;
  const totalVotes = upVotes + downVotes;
  const thumbsUpRatio = totalVotes > 0 ? (upVotes / totalVotes) * 100 : 0;

  // Let's find messages that happened right before a fallback (fallback questions)
  // Since we don't store 'fallback' type directly in Message table (we only store role and content),
  // we'll look for user messages that precede a fallback.
  // We can't do a complex subquery easily in Prisma, so we'll fetch recent fallbacks and get the message before them.
  const recentFallbacks = await prisma.message.findMany({
    where: { role: 'assistant', content: { contains: 'Please contact us directly' } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { conversationId: true, createdAt: true }
  });

  const fallbackQuestions = [];
  for (const fb of recentFallbacks) {
    const userMsg = await prisma.message.findFirst({
      where: {
        conversationId: fb.conversationId,
        role: 'user',
        createdAt: { lt: fb.createdAt }
      },
      orderBy: { createdAt: 'desc' },
      select: { content: true }
    });
    if (userMsg) {
      fallbackQuestions.push(userMsg.content);
    }
  }

  // Count occurrences
  const questionCounts = fallbackQuestions.reduce((acc, q) => {
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top10Fallback = Object.entries(questionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Insights Dashboard</h1>
          <p className="text-slate-500 mt-2">Real-time performance metrics and user feedback.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Conversations" value={totalConversations.toLocaleString()} />
          <StatCard title="Total Assistant Replies" value={totalMessages.toLocaleString()} />
          <StatCard title="Fallback Rate" value={`${fallbackRate.toFixed(1)}%`} />
          <StatCard title="Thumbs-Up Ratio" value={`${thumbsUpRatio.toFixed(1)}%`} subtext={`${totalVotes} total votes`} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Fallback Questions</h2>
          {top10Fallback.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {top10Fallback.map(([q, count], i) => (
                <li key={i} className="py-3 flex justify-between items-center text-sm">
                  <span className="text-slate-700">{q}</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium text-xs">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic">No fallback data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtext }: { title: string; value: string; subtext?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
      </div>
    </div>
  );
}
