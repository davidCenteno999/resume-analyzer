import apiClient from "../../api/apiClient";

export const resumeService = {
  async uploadResume(file, requirements, key) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("required_skills", JSON.stringify(requirements.requiredSkills));
    formData.append("required_tools", JSON.stringify(requirements.requiredTools || []));
    formData.append("degree_requirements", JSON.stringify(requirements.degreeRequirements));
    formData.append("experience_requirements", JSON.stringify(requirements.experienceRequirements));

    return (await apiClient.post("/api/resume-analyses", formData, { headers: { "Idempotency-Key": key }, timeout: 120000 })).data;
  },
  async list(params) { return (await apiClient.get("/api/resume-analyses", { params })).data; },
  async detail(id) { return (await apiClient.get(`/api/resume-analyses/${id}`)).data; },
  async statistics(period) { return (await apiClient.get("/api/resume-analyses/statistics", { params: { period } })).data; },
};
