import { apiFetch } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const resumeService = {
  async uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/resume/upload-resume`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "API Error");
    }

    return res.json();
  },
};