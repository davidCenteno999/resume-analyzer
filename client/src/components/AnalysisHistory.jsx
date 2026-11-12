import { useEffect, useState } from "react";
import { Badge, Box, Button, Flex, Heading, Input, Skeleton, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { resumeService } from "../services/resume_service/resumeService";

const score = (value) => value == null ? "Not evaluated" : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}%`;
const date = (value) => new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export default function AnalysisHistory({ recent = false }) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { const id = setTimeout(() => { setDebounced(search); setPage(1); }, 300); return () => clearTimeout(id); }, [search]);
  useEffect(() => {
    let active = true;
    resumeService.list({ page, page_size: recent ? 5 : 10, search: recent ? "" : debounced }).then(result => { if (active) { setData(result); setError(""); } }).catch(() => { if (active) setError("Could not load analysis history."); });
    return () => { active = false; };
  }, [page, debounced, recent]);
  return <Box bg="white" borderWidth="1px" borderRadius="2xl" p={{ base: 4, md: 6 }} shadow="sm">
    <Flex justify="space-between" align={{ base: "start", sm: "center" }} gap={3} direction={{ base: "column", sm: "row" }} mb={5}>
      <Heading size="md" color="gray.800">{recent ? "Recent analyses" : "Analysis history"}</Heading>
      {recent ? <Button as={Link} to="/history" size="sm" variant="outline" colorScheme="purple">View all</Button> : <Input aria-label="Search by candidate name" placeholder="Search candidate name" value={search} onChange={event => { setSearch(event.target.value); setData(null); }} maxW="280px" />}
    </Flex>
    {error && <Text role="alert" color="red.600">{error}</Text>}
    {!data && !error && <Skeleton height="180px" />}
    {data && !data.items.length && <Text color="gray.600" py={8} textAlign="center">{debounced ? "No candidates match your search." : "No analyses yet. Start with a new resume."}</Text>}
    {data?.items?.length > 0 && <Box overflowX="auto"><Table size="sm" variant="simple">
      <Thead><Tr><Th>Candidate</Th><Th>Date (UTC)</Th><Th>Overall</Th><Th>Skills</Th><Th>Experience</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
      <Tbody>{data.items.map(item => <Tr key={item.id}>
        <Td fontWeight="semibold">{item.candidate_name}</Td><Td>{date(item.created_at)}</Td><Td>{score(item.compare_result?.overall_percentage)}</Td><Td>{score(item.compare_result?.percentage_skill_match)}</Td><Td>{score(item.compare_result?.percentage_experience_match)}</Td><Td><Badge colorScheme="green">{item.status}</Badge></Td><Td><Button as={Link} to={`/analyses/${item.id}`} size="sm" colorScheme="purple" variant="link">View Results</Button></Td>
      </Tr>)}</Tbody>
    </Table></Box>}
    {!recent && data && data.total > 10 && <Flex align="center" justify="end" gap={3} mt={4}><Button size="sm" onClick={() => setPage(p => p - 1)} isDisabled={page === 1}>Previous</Button><Text fontSize="sm">Page {page} of {Math.ceil(data.total / 10)}</Text><Button size="sm" onClick={() => setPage(p => p + 1)} isDisabled={page * 10 >= data.total}>Next</Button></Flex>}
  </Box>;
}
