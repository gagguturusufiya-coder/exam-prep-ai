import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ThumbsUp, Sparkles, Send, Tag, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { ForumPost } from '../types';

interface CommunityForumProps {
  token?: string;
  user?: any;
}

export default function CommunityForum({ token, user }: CommunityForumProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Strategy & Tips');
  
  // comment states per post
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const categories = ['Strategy & Tips', 'Operating Systems', 'Mathematics', 'Computer Networks', 'Syllabus Doubts', 'General'];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/forum');
      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      console.error('Forum fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory
        })
      });
      if (response.ok) {
        setNewTitle('');
        setNewContent('');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: string) => {
    if (!token) return;
    try {
      const response = await fetch('/api/forum/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      });
      if (response.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim() || !token) return;

    try {
      const response = await fetch('/api/forum/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          postId,
          content: commentText
        })
      });
      if (response.ok) {
        setCommentText('');
        setActiveCommentPost(null);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" id="community_module_root">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-400" /> Peer Strategy & Doubt Forum
        </h2>
        <p className="text-slate-400 text-xs">Collaborate with fellow scholars, share mock scores, peer-review notes, or debate syllabus strategy rules.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6" id="forum_grid">
        
        {/* NEW POST FORM CARD */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-900 h-fit space-y-4" id="create_post_card">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-400" /> Start Discussion
          </h3>

          {token ? (
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Post Title</label>
                <input 
                  type="text"
                  placeholder="e.g., 'How to optimize DP space metrics?'"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-xs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  id="post_title_input"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Category</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 rounded-xl px-4 py-3 text-xs cursor-pointer"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  id="post_category_select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-mono block mb-1.5 uppercase">Write Content</label>
                <textarea 
                  placeholder="Describe your doubt, strategy, or share master cheat sheets..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 outline-none text-slate-100 placeholder-slate-600 rounded-xl p-4 text-xs font-sans resize-none"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  id="post_content_textarea"
                />
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim() || !newContent.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
                id="post_submit_btn"
              >
                <Send className="w-4 h-4" />
                <span>Publish Post</span>
              </button>
            </form>
          ) : (
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-center space-y-2 text-slate-400 text-xs leading-relaxed">
              <UserCheck className="w-8 h-8 text-slate-700 mx-auto" />
              <p>Please log in to your account dashboard to publish posts, participate in comments, and upvote strategy guides.</p>
            </div>
          )}
        </div>

        {/* FORUM POSTS TIMELINE */}
        <div className="md:col-span-2 space-y-4" id="timeline_timeline">
          {loading ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-900 rounded-2xl" id="forum_loading_skele">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-mono">Loading Timeline discussions...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4" id={`timeline_post_card_${post.id}`}>
                
                {/* USER HEADLINE BAR */}
                <div className="flex items-center justify-between" id={`timeline_head_${post.id}`}>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={post.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(post.userName)}`}
                      className="w-9 h-9 rounded-full border border-slate-800 object-cover"
                      alt={post.userName}
                    />
                    <div>
                      <h4 className="font-bold text-slate-200 text-xs">{post.userName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase">
                    {post.category}
                  </span>
                </div>

                {/* POST TEXT BODY */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-white text-base">{post.title}</h3>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{post.content}</p>
                </div>

                {/* LIKE & COMMENTS BUTTONS BAR */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-900" id={`timeline_actions_${post.id}`}>
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${user && post.likes.includes(user.id) ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes.length} Likes</span>
                  </button>

                  <button 
                    onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                {/* COLLAPSIBLE COMMENTS LIST */}
                {activeCommentPost === post.id && (
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-4" id={`timeline_comments_box_${post.id}`}>
                    
                    {/* Render existing comments */}
                    {post.comments.length > 0 && (
                      <div className="space-y-3 border-b border-slate-900 pb-3" id={`comments_list_${post.id}`}>
                        {post.comments.map(c => (
                          <div key={c.id} className="flex items-start space-x-2 text-[11px]" id={`comment_row_${c.id}`}>
                            <img 
                              src={c.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(c.userName)}`}
                              className="w-6 h-6 rounded-full border border-slate-800 shrink-0"
                              alt={c.userName}
                            />
                            <div>
                              <span className="font-bold text-slate-200 block">{c.userName}</span>
                              <p className="text-slate-400 leading-relaxed mt-0.5">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New comment input */}
                    {token ? (
                      <div className="flex gap-2" id={`new_comment_form_${post.id}`}>
                        <input 
                          type="text"
                          placeholder="Type your comment reply..."
                          className="w-full bg-slate-900 border border-slate-800 outline-none text-slate-100 placeholder-slate-600 rounded-lg px-3 py-2 text-xs"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button 
                          onClick={() => handleCommentSubmit(post.id)}
                          className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer active:scale-95"
                        >
                          Send
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic text-center">Log in to post comment replies.</p>
                    )}

                  </div>
                )}

              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-700 mx-auto" />
              <h4 className="font-bold text-white text-sm">Welcome to the Classroom Timeline</h4>
              <p className="text-slate-500 text-xs">Be the first to ask questions or outline your competitive preparation strategy.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
