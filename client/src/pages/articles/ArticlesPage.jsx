import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, ThumbsUp, Clock, Eye, Sparkles } from 'lucide-react';
import { articleService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/common/Avatar';

const ArticlesPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const res = await articleService.getArticles();
        if (res.success) {
          setArticles(res.articles);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-pro-600" />
            <span>Tech & Engineering Articles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thought leadership, system design patterns, and engineering insights from the CareerLink community.
          </p>
        </div>

        {user && (
          <Link
            to="/articles/create"
            className="pro-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Article</span>
          </Link>
        )}
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="pro-card p-6 animate-pulse bg-slate-200 h-64" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const author = article.author?.profile || {};
            const authorName = author.fullName || 'Author';
            return (
              <div
                key={article._id}
                className="pro-card overflow-hidden hover:border-pro-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {article.coverImage && (
                    <div className="h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {article.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-pro-700 bg-pro-50 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      to={`/articles/${article._id}`}
                      className="text-base font-bold text-slate-900 hover:text-pro-600 transition-colors line-clamp-2 block"
                    >
                      {article.title}
                    </Link>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {article.content.replace(/[#*`_]/g, '')}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-3 pt-3 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Avatar src={author.avatar} alt={authorName} size="xs" />
                    <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[120px]">{authorName}</span>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {article.readTime || 3} min read
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="pro-card p-12 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No articles published yet</h3>
          <p className="text-xs text-slate-500 mt-1">Be the first to share an in-depth thought leadership article!</p>
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
