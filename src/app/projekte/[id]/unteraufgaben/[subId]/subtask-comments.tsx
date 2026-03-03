"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createSubtaskComment, updateSubtaskComment, deleteSubtaskComment } from "@/lib/supabase/actions";

interface Comment {
  id: string;
  person_id: string | null;
  content: string;
  created_at: string;
  person?: {
    id: string;
    name: string;
    avatar_color?: string;
  } | null;
}

interface SubtaskCommentsProps {
  subtaskId: string;
  personId: string;
  initialComments: Comment[];
}

export function SubtaskComments({ subtaskId, personId, initialComments }: SubtaskCommentsProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !personId) return;

    setIsSubmitting(true);
    await createSubtaskComment(subtaskId, personId, content.trim());
    setContent("");
    router.refresh();
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    await deleteSubtaskComment(commentId);
    router.refresh();
    setDeletingId(null);
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    setIsSavingEdit(true);
    await updateSubtaskComment(editingId, editContent.trim());
    setEditingId(null);
    setEditContent("");
    router.refresh();
    setIsSavingEdit(false);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Kommentare ({initialComments.length})
      </h3>

      {/* Comment List */}
      {initialComments.length > 0 && (
        <div className="space-y-3 mb-4">
          {initialComments.map((comment) => (
            <div key={comment.id} className="bg-card rounded-xl border border-border/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-medium"
                  style={{ backgroundColor: comment.person?.avatar_color || '#4A90D9' }}
                >
                  {comment.person?.name?.charAt(0) || '?'}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {comment.person?.name || 'Unbekannt'}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(comment.created_at).toLocaleDateString('de-DE', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] rounded-xl resize-none text-sm"
                    maxLength={2000}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSavingEdit}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    >
                      Abbrechen
                    </button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit || !editContent.trim()}
                      size="sm"
                      className="h-7 rounded-lg text-xs"
                    >
                      {isSavingEdit ? "Speichern..." : "Speichern"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                  {comment.person_id === personId && (
                    <div className="mt-2 flex justify-end gap-3">
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        {deletingId === comment.id ? 'Wird gelöscht...' : 'Löschen'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Comment */}
      {personId && (
        <div className="space-y-2">
          <Textarea
            placeholder="Kommentar schreiben..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] rounded-xl resize-none"
            maxLength={2000}
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="h-10 rounded-xl"
          >
            {isSubmitting ? "Senden..." : "Kommentieren"}
          </Button>
        </div>
      )}
    </div>
  );
}
