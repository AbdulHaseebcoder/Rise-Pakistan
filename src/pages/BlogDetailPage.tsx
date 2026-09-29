import React from 'react';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react';
import { Blog } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface BlogDetailPageProps {
  slug: string;
  blogs: Blog[];
  onNavigate: (path: string) => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slug, blogs, onNavigate }) => {
  const blog = blogs.find((b) => b.slug === slug || b.id === slug);

  if (!blog) {
    return (
      <div className="min-h-screen bg-black text-white pt-36 pb-20 px-6 text-center space-y-4">
        <h2 className="text-3xl font-display font-bold">Article Not Found</h2>
        <p className="text-neutral-400 text-sm">The editorial essay you requested is unavailable.</p>
        <button
          onClick={() => onNavigate('/blogs')}
          className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Return to RISE Journal
        </button>
      </div>
    );
  }

  const related = blogs.filter((b) => b.id !== blog.id).slice(0, 2);

  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/blogs')}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to RISE Journal</span>
        </button>

        {/* Editorial Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="text-emerald-400 font-semibold">{blog.category}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {blog.publishDate}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {blog.readingTime}
            </span>
          </div>

          <AnimatedHeading as="h1" className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight">
            {blog.title}
          </AnimatedHeading>

          <AnimatedText className="text-base text-neutral-300 leading-relaxed font-medium pt-2">
            {blog.excerpt}
          </AnimatedText>
        </div>

        {/* Author & Action Bar */}
        <div className="flex items-center justify-between py-4 border-y border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              {blog.author.charAt(0)}
            </div>
            <div>
              <span className="text-white font-semibold block">{blog.author}</span>
              <span className="text-neutral-400">RISE Pakistan Editorial</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {copied && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                Copied!
              </span>
            )}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
              title="Share Essay"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cover Hero */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-neutral-900 border border-white/10">
          <img
            src={blog.coverImage || '/assets/studio.jpg'}
            alt={blog.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Essay Body */}
        <div className="prose prose-invert max-w-none text-neutral-200 text-sm sm:text-base leading-relaxed space-y-6 pt-4">
          {blog.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl sm:text-2xl font-display font-bold text-white pt-4 pb-1">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('- ')) {
              return (
                <ul key={idx} className="list-disc pl-5 space-y-2 text-neutral-300">
                  {paragraph.split('\n').map((item, i) => (
                    <li key={i}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-neutral-300">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Related Reads */}
        {related.length > 0 && (
          <div className="pt-12 border-t border-white/10 space-y-6">
            <h3 className="text-2xl font-display font-bold text-white">
              Related Dispatches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onNavigate(`/blogs/${r.slug}`)}
                  className="p-5 rounded-xl border border-white/10 bg-neutral-900/30 hover:border-emerald-500/30 transition-all cursor-pointer space-y-2"
                >
                  <span className="text-[11px] text-emerald-400 font-semibold">{r.category}</span>
                  <h4 className="text-base font-display font-bold text-white line-clamp-2">{r.title}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">{r.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
