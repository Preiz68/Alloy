"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePostsStore } from "@/store/usePostStore";
import { useAuth } from "@/hooks/useAuth";
import {
  Edit2,
  Trash2,
  ImagePlus,
  X,
  Heart,
  MessageSquare,
} from "lucide-react";

const FeedSection = () => {
  const { user } = useAuth();
  const userName = user?.displayName || "User";

  const {
    posts,
    fetchPosts,
    addPost,
    editPost,
    deletePost,
    likePost,
    loading,
    isAddingPost,
    isModalOpen,
    openModal,
    closeModal,
    newPost,
    setNewPost,
    newImage,
    setNewImage,
  } = usePostsStore();

  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const unsub = usePostsStore.getState().fetchPosts();
    return () => unsub();
  }, []);

  const handleAddPost = async () => {
    if (!newPost.trim() && !newImage) return;
    await addPost(newPost, user, newImage);
  };

  const handleEdit = (postId: string, currentContent: string) => {
    setEditingPost(postId);
    setEditContent(currentContent);
  };

  const handleUpdatePost = async (id: string) => {
    if (!editContent.trim() && !editImage) return;
    await editPost(id, { content: editContent }, editImage);
    setEditingPost(null);
    setEditImage(null);
    setPreview(null);
  };

  const handleDeletePost = async (id: string, imageUrl?: string) => {
    await deletePost(id, imageUrl);
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "new" | "edit"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    type === "new" ? setNewImage(file) : setEditImage(file);
    setPreview(previewUrl);
  };

  return (
    <section className="flex justify-center w-full py-6">
      <div className="w-full max-w-2xl px-3 sm:px-0">
        {/* ===== Sticky Create Post Input ===== */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <input
            readOnly
            onClick={openModal}
            placeholder={`What are you working on today, ${userName}?`}
            className="w-full bg-gray-100 border-none cursor-pointer focus:ring-2 focus:ring-purple-500 rounded-full px-5 py-3 text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* ===== Create Post Modal ===== */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg p-6 relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>

                <h4 className="text-lg font-semibold mb-4">Create Post</h4>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your progress or invite collaborators..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-purple-500 resize-none"
                />

                {/* Image Upload */}
                <div className="mt-3 flex items-center justify-between">
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 cursor-pointer text-purple-600 hover:text-purple-700 text-sm"
                  >
                    <ImagePlus size={18} /> Add Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, "new")}
                  />
                </div>

                {preview && (
                  <div className="mt-3 relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="rounded-lg max-h-56 w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPost}
                    className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {isAddingPost ? "Creating..." : "Post"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Feed Posts ===== */}
        {loading ? (
          <div className="flex justify-center py-10">
            <motion.div
              className="w-10 h-10 border-4 border-t-transparent border-purple-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <motion.article
                key={post.id}
                layout
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-medium text-purple-700">
                      {post.author[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {post.author}
                      </div>
                      <div className="text-xs text-gray-400">
                        {post.time}
                        {post.edited && (
                          <span className="italic text-gray-400">
                            {" "}
                            • edited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit/Delete */}
                  {post.author === userName && (
                    <div className="flex gap-2 text-gray-400">
                      <button
                        onClick={() => handleEdit(post.id, post.content)}
                        className="hover:text-purple-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeletePost(post.id, post.imageUrl ?? "")
                        }
                        className="hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                {editingPost === post.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-2 text-gray-700 resize-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label
                        htmlFor={`edit-image-${post.id}`}
                        className="flex items-center gap-2 cursor-pointer text-purple-600 hover:text-purple-700 text-sm"
                      >
                        <ImagePlus size={18} /> Change Image
                      </label>
                      <input
                        id={`edit-image-${post.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "edit")}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleUpdatePost(post.id)}
                          className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 text-sm"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingPost(null)}
                          className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="mt-3 rounded-lg max-h-52 w-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="rounded-lg mb-3 max-h-72 w-full object-cover"
                      />
                    )}
                    <p className="text-gray-800 leading-relaxed text-[15px]">
                      {post.content}
                    </p>
                  </>
                )}

                {/* Like & Comment */}
                <div className="flex items-center justify-between mt-4 text-gray-500 text-sm">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => likePost(post.id)}
                      className="flex items-center gap-1 hover:text-purple-600 transition"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-purple-600 transition">
                      <MessageSquare className="w-4 h-4" />
                      <span>0</span>
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedSection;
