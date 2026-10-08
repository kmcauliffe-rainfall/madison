import { Post } from '@/types/post';
import { SEED_POSTS } from './seedData';
import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// In-memory fallback cache initialized with SEED_POSTS
let memoryPosts: Post[] = [...SEED_POSTS];

export async function getAllPosts(): Promise<Post[]> {
  if (isFirebaseConfigured && db) {
    try {
      const postsCol = collection(db, 'posts');
      const q = query(postsCol, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ ...d.data(), post_id: d.id } as Post));
      }
    } catch (e) {
      console.warn('Firestore fetch failed, using memory store:', e);
    }
  }
  return memoryPosts;
}

export async function getPostById(postId: string): Promise<Post | null> {
  const posts = await getAllPosts();
  return posts.find(p => p.post_id === postId) || null;
}

export async function savePost(post: Post): Promise<Post> {
  const updatedPost: Post = {
    ...post,
    updated_at: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'posts', post.post_id), updatedPost);
    } catch (e) {
      console.warn('Firestore write failed, falling back to memory store:', e);
    }
  }

  // Update in memory
  const idx = memoryPosts.findIndex(p => p.post_id === post.post_id);
  if (idx >= 0) {
    memoryPosts[idx] = updatedPost;
  } else {
    memoryPosts.unshift(updatedPost);
  }

  return updatedPost;
}

export async function updatePostPartial(postId: string, partial: Partial<Post>): Promise<Post | null> {
  const current = await getPostById(postId);
  if (!current) return null;

  const merged: Post = {
    ...current,
    ...partial,
    updated_at: new Date().toISOString()
  };

  return savePost(merged);
}

export async function deletePostById(postId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (e) {
      console.warn('Firestore delete failed:', e);
    }
  }

  const initialLen = memoryPosts.length;
  memoryPosts = memoryPosts.filter(p => p.post_id !== postId);
  return memoryPosts.length < initialLen;
}
