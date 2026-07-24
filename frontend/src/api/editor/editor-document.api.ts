import {
  getMockEditorDocument,
  type GetEditorDocumentInput,
} from "@/api/editor/editor-document.mock";
import type { EditorDocumentData } from "@/types/editor-document";

export type EditorDocumentApi = {
  getDocument: (input: GetEditorDocumentInput) => Promise<EditorDocumentData>;
};

export const editorDocumentApi: EditorDocumentApi = {
  getDocument: getMockEditorDocument,
};
