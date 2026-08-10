import React, { useState } from 'react';
import { AppDatabase, Person } from '../../types/frontend_types';
import { Megaphone, Heart, Send, Trash2, Image, PlusCircle, XCircle } from 'lucide-react';
import { addSocialActivity, addSocialPost, likeSocialPost, addCommentToPost, deleteSocialPost } from '../../utils/index';

interface DashboardProps {
  db: AppDatabase;
  onUpdateDb: (updatedDb: AppDatabase) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ db, onUpdateDb }) => {
  // Announcements Board State & Handlers (Single Source of Truth)
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [showAddPost, setShowAddPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const currentPerson = db.persons.find(p => p.id === db.currentUser.personId);
  const authorName = currentPerson ? currentPerson.name : db.currentUser.username || 'Gast';
  const authorAvatar = currentPerson ? currentPerson.avatar : 'https://cdn.shopify.com/s/files/1/1038/7203/7203/files/placeholder_profile_male.png?v=1784405792';
  const authorId = currentPerson ? currentPerson.id : 'guest-user';

  const getUserRoleLabel = (person: Person | undefined) => {
    if (!person) return 'Gast Toeschouwer';
    if (person.roles.includes('MultiLeagueOfficer')) return 'Multi-League Officer';
    if (person.roles.includes('LeagueOfficer')) return 'League Officer';
    if (person.roles.includes('Manager')) return 'Club Manager';
    if (person.roles.includes('Player')) return 'Speler';
    return 'Geregistreerd Lid';
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newDb1 = addSocialPost({
      personId: authorId,
      content: newPostContent,
      image: newPostImage.trim() || undefined,
    });

    const newDb2 = addSocialActivity({
      personId: authorId,
      activityType: 'EquipmentUpdate' as any,
      description: `Plaatste een mededeling op het bulletin board: "${newPostContent.substring(0, 35)}..."`,
    });

    setNewPostContent('');
    setNewPostImage('');
    setShowAddPost(false);
    onUpdateDb(newDb2);
  };

  const handleLikePost = (postId: string) => {
    const updated = likeSocialPost(postId, authorId);
    onUpdateDb(updated);
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const updated = addCommentToPost(postId, authorId, text.trim());
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    onUpdateDb(updated);
  };

  const handleDeletePost = (postId: string) => {
    const updated = deleteSocialPost(postId);
    onUpdateDb(updated);
  };

  return (
    <div className="space-y-6" id="dashboard-view">{/* Spectacular Hero Banner Section */}
      <div
        className="w-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative flex items-end p-6 sm:p-8 md:p-10 bg-slate-100"
id="dashboard-hero-banner">
<img
          src="https://cdn.shopify.com/s/files/1/1038/7203/7203/files/kardingeHL.png?v=1784539061"
alt={`${db.association.locations[0].name} House League`}
          className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
referrerPolicy="no-referrer"
        />
        {/* Rich gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl text-white">
<h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight leading-none text-white uppercase drop-shadow-md">
            Welkom bij de Groningen House League
          </h1>
        </div>
      </div>

      {/* Mededelingen & Bulletins Widget (Single Source of Truth) */}

        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm" id="announcements-widget">
<div className="bg-slate-50/80 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
<div className="flex items-center space-x-2.5">
<Megaphone className="w-5 h-5 text-slate-900" />
            <h3 className="font-extrabold uppercase text-xs tracking-wider text-slate-950">Mededelingen &amp; Groningen IJshockey Nieuws</h3>
          </div>
          <button
            onClick={() => setShowAddPost(!showAddPost)}
            className="bg-slate-900 hover:bg-slate-950 text-white font-sans text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5">{showAddPost ? <XCircle className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
            {showAddPost ? 'Sluiten' : 'Plaats Bericht'}
          </button>
        </div>

        <div className="p-5 space-y-6">{/* Create Announcement Form */}
          {showAddPost && (
            <form onSubmit={handleCreatePost} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
<h4 className="text-xs font-black uppercase text-slate-950 tracking-wider">Nieuwe mededeling publiceren</h4>
              <div>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`Wat is het laatste nieuws uit ${db.association.locations[0].name} of de vereniging? Typ het hier...`}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-sans text-slate-900 bg-white"
rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div>
                  <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Afbeelding URL (optioneel)</label>
                  <div className="relative">
<input
                      type="url"
value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-sans bg-white"
/>
                    <Image className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
<div className="flex gap-2 justify-end">
<button
                      type="button"
onClick={() => setNewPostImage('https://cdn.shopify.com/s/files/1/1038/7203/7203/files/kardingeHL.png?v=1784539061')}
                      className="text-xs bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded hover:bg-slate-50 transition">{`${db.association.locations[0].name} Foto`}
                    </button>
                    <button
                      type="button"
onClick={() => setNewPostImage('https://images.unsplash.com/photo-1512719994953-eabf50895df7?auto=format&fit=crop&w=800&q=80')}
                      className="text-xs bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded hover:bg-slate-50 transition">
                      Actiefoto
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
<p className="text-xs text-slate-500 font-sans">
                  Publiceren als: <span className="font-bold text-slate-800">{authorName}</span> ({getUserRoleLabel(currentPerson)})
                </p>
                <button
                  type="submit"
className="bg-slate-900 hover:bg-slate-950 text-white font-sans text-xs font-black uppercase px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
<Send className="w-3 h-3" />
                  Plaatsen
                </button>
              </div>
            </form>
          )}

          {/* Announcements Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{db.socialPosts.map((post) => {
              const author = db.persons.find(p => p.id === post.personId);
              const name = author ? author.name : (post.personId === 'person-michiel' ? 'Michiel Waalboer' : 'Gast Toeschouwer');
              const avatar = author ? author.avatar : 'https://cdn.shopify.com/s/files/1/1038/7203/7203/files/placeholder_profile_male.png?v=1784405792';
              const roleLabel = getUserRoleLabel(author);
              const isLiked = post.likesPersonIds?.includes(authorId) ?? false;

              return (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">{/* Author Header */}
                  <div>
                    <div className="flex justify-between items-start">
<div className="flex items-center space-x-3">
<img
                          src={avatar}
                          alt={name}
                          className="w-10 h-10 rounded-full border border-slate-300 object-cover bg-slate-100"
referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1">{name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">{roleLabel} &bull; {new Date(post.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Delete button (only author or managers/officers) */}
                      {(post.personId === authorId || ['LeagueOfficer', 'MultiLeagueOfficer'].includes(db.currentUser.systemRole)) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-slate-400 hover:text-slate-900 p-1 transition"
title="Mededeling verwijderen">
<Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-xs text-slate-700 font-sans mt-3 leading-relaxed whitespace-pre-line">{post.content}
                    </p>

                    {/* Image if available */}
                    {post.image && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-[160px]">
<img
                          src={post.image}
                          alt="Bijlage"
className="w-full h-full object-cover"
referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions & Comments */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
<div className="flex items-center justify-between text-slate-500 text-xs">
<button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-md transition ${isLiked ? 'text-slate-900 bg-slate-100 font-bold' : 'hover:bg-slate-50 text-slate-500'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600' : ''}`} />
                        <span>{post.likesCount || 0} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
                      </button>

                      <div className="flex items-center space-x-1 text-xs font-mono text-slate-400 font-semibold">
<span>{post.comments?.length || 0} reacties</span>
                      </div>
                    </div>

                    {/* Comments section */}
                    <div className="space-y-2 max-h-[140px] overflow-y-auto hide-scrollbar pr-1">{post.comments?.map((comment) => {
                        const commAuthor = db.persons.find(p => p.id === comment.personId);
                        const commName = commAuthor ? commAuthor.name : (comment.personId === 'person-michiel' ? 'Michiel Waalboer' : 'Gast');
                        const commAvatar = commAuthor ? commAuthor.avatar : 'https://cdn.shopify.com/s/files/1/1038/7203/7203/files/placeholder_profile_male.png?v=1784405792';

                        return (
                          <div key={comment.id} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start space-x-2 text-xs">
<img
                              src={commAvatar}
                              alt={commName}
                              className="w-6 h-6 rounded-full border border-slate-200 object-cover bg-white shrink-0"
referrerPolicy="no-referrer"
                            />
                            <div className="space-y-0.5">
<p className="font-bold text-slate-900 leading-tight">{commName}</p>
                              <p className="text-slate-600 font-sans leading-snug">{comment.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center space-x-1.5">
<input
                        type="text"
value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Schrijf een reactie..."
                        className="flex-grow text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 bg-slate-50/50"
/>
                      <button
                        type="submit"
className="bg-slate-200 text-slate-900 p-2 rounded-lg hover:bg-slate-300 transition shrink-0"
title="Versturen">
<Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}

            {db.socialPosts.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
<Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">Er zijn nog geen mededelingen geplaatst.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
