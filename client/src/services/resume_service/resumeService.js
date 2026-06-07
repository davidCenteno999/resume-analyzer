import { apiFetch } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const resumeService = {
  async uploadResume(file, requirements) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("required_skills", JSON.stringify(requirements.requiredSkills));
    formData.append("degree_requirements", JSON.stringify(requirements.degreeRequirements));
    formData.append("experience_requirements", JSON.stringify(requirements.experienceRequirements));

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
