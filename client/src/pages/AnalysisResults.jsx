import { useEffect, useState } from "react";
import { Badge, Box, Button, Divider, Flex, Heading, Progress, SimpleGrid, Skeleton, Stack, Tag, Text, Wrap } from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { resumeService } from "../services/resume_service/resumeService";

const percent = value => value == null ? "Not evaluated" : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}%`;
const label = item => typeof item === "string" ? item : `${item.title || "Role"}${item.years == null ? "" : ` · ${item.years} years`}`;

function RequirementSection({ title, required, found, matched, missing, percentage, state }) {
  return <Box as="section" bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 4, md: 6 }} shadow="sm">
    <Flex justify="space-between" align="center" mb={3}><Heading size="md">{title}</Heading><Text fontWeight="bold" color="purple.700">{state || percent(percentage)}</Text></Flex>
    {percentage != null && <Progress value={Math.min(100, percentage)} colorScheme="purple" borderRadius="full" aria-label={`${title} match ${percent(percentage)}`} mb={5} />}
    <Text fontSize="sm" fontWeight="semibold" mb={2}>Required</Text>
    {required?.length ? <Wrap spacing={2} mb={4}>{required.map((item, index) => <Tag key={`${label(item)}-${index}`} colorScheme={matched?.some(value => label(value) === label(item)) ? "green" : "red"} borderRadius="full">{label(item)}</Tag>)}</Wrap> : <Text color="gray.600" mb={4}>No requirements specified</Text>}
    <Text fontSize="sm" fontWeight="semibold" mb={2}>Found in resume</Text>
    {found?.length ? <Stack spacing={1} mb={4}>{found.map((item, index) => <Text key={index} color="gray.700">{label(item)}{item.company ? ` · ${item.company}` : item.institution ? ` · ${item.institution}` : ""}</Text>)}</Stack> : <Text color="gray.600" mb={4}>None identified</Text>}
    <Divider mb={3} /><Text fontSize="sm" color="green.700">Matched: {matched?.length ? matched.map(label).join(", ") : "None"}</Text><Text fontSize="sm" color="red.700">Missing: {missing?.length ? missing.map(label).join(", ") : "None"}</Text>
  </Box>;
}

export default function AnalysisResults() {
  const { analysisId } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    resumeService.detail(analysisId).then(value => { if (active) setItem(value); }).catch(() => { if (active) setError("Analysis not found or unavailable."); });
    return () => { active = false; };
  }, [analysisId]);
  const r = item?.requirements;
  const d = item?.extracted_data;
  const c = item?.compare_result;
  return <DashboardLayout>
    <Button as={Link} to="/dashboard" size="sm" variant="ghost" colorScheme="purple" mb={4}>← Back to dashboard</Button>
    {error && <Text role="alert" color="red.600">{error}</Text>}
    {!item && !error && <Stack><Skeleton height="130px" /><Skeleton height="220px" /><Skeleton height="220px" /></Stack>}
    {item && <Stack spacing={6}>
      <Box bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 5, md: 7 }} shadow="sm">
        <Flex align="center" gap={3} mb={2}><Badge colorScheme="green">{item.status}</Badge><Text color="gray.600" fontSize="sm">{new Date(item.created_at).toLocaleString(undefined, { timeZone: "UTC" })} UTC</Text></Flex>
        <Heading size="lg" mb={2}>{item.candidate_name}</Heading><Text color="gray.600">{item.filename}</Text>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={6}>
          {[["Overall", c.overall_percentage], ["Skills", c.percentage_skill_match], ["Tools", c.percentage_tool_match], ["Experience", c.percentage_experience_match]].map(([name, value]) => <Box key={name} p={4} bg="purple.50" borderRadius="xl"><Text color="gray.600" fontSize="sm">{name}</Text><Text color="purple.700" fontWeight="bold" fontSize="lg">{percent(value)}</Text></Box>)}
        </SimpleGrid>
      </Box>
      <RequirementSection title="Skills matching" required={c.evaluated_skills?.length ? c.evaluated_skills : r.required_skills} found={d.skills} matched={c.matched_skills} missing={c.missing_skills} percentage={c.percentage_skill_match} />
      <RequirementSection title="Tools and technologies" required={c.evaluated_tools?.length ? c.evaluated_tools : r.required_tools} found={d.tools} matched={c.matched_tools} missing={c.missing_tools} percentage={c.percentage_tool_match} />
      <RequirementSection title="Education matching" required={r.degree_requirements} found={d.education?.map(v => ({ title: v.degree, institution: v.institution }))} matched={c.matched_degrees} missing={c.missing_degrees} state={c.degree_match ? "Requirement satisfied" : "Requirement not satisfied"} />
      <RequirementSection title="Professional experience" required={r.experience_requirements} found={d.experience} matched={c.matched_experience} missing={c.missing_experience} percentage={c.percentage_experience_match} />
      <Box as="section" bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 4, md: 6 }} shadow="sm"><Heading size="md" mb={4}>Resume information</Heading><Text><strong>Name:</strong> {d.name || "Not identified"}</Text><Text><strong>Email:</strong> {d.email || "Not identified"}</Text><Text><strong>Phone:</strong> {d.phone || "Not identified"}</Text><Text mt={3} fontWeight="semibold">Experience details</Text>{d.experience?.length ? d.experience.map((exp, index) => <Text key={index}>{exp.title || "Role"} · {exp.company || "Company not identified"} · {exp.years ?? "?"} years{exp.description ? ` — ${exp.description}` : ""}</Text>) : <Text color="gray.600">No experience identified</Text>}</Box>
    </Stack>}
  </DashboardLayout>;
}
