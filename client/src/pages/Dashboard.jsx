import { useEffect, useState } from "react";
import { Box, Heading, Text, SimpleGrid, Button, Flex, Select, Skeleton, Tooltip } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AnalysisHistory from "../components/AnalysisHistory";
import { resumeService } from "../services/resume_service/resumeService";

export default function Dashboard() {
  const [period, setPeriod] = useState("daily");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    resumeService.statistics(period).then(value => { if (active) { setStats(value); setError(""); } }).catch(() => { if (active) setError("Could not load dashboard statistics."); });
    return () => { active = false; };
  }, [period]);
  const cards = [
    ["Total analyzed", "total"], ["Today (UTC)", "today"], ["Last 24 hours", "last_24_hours"],
    ["Last 7 days", "last_7_days"], ["This month (UTC)", "current_month"],
  ];
  const max = Math.max(1, ...(stats?.buckets.map(bucket => bucket.count) || []));
  const label = (value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

  return (
    <DashboardLayout>
      <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={4} mb={8}>
        <Box><Heading size="lg" color="gray.800">Dashboard</Heading><Text color="gray.600" mt={1}>Resume analysis at a glance</Text></Box>
        <Button as={Link} to="/upload" colorScheme="purple">New Analysis</Button>
      </Flex>
      {error && <Text role="alert" color="red.600" mb={4}>{error}</Text>}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4} mb={6}>
        {cards.map(([title, key]) => <Box key={key} bg="white" borderWidth="1px" borderRadius="2xl" shadow="sm" p={5}><Text fontSize="sm" color="gray.600">{title}</Text>{stats ? <Heading size="lg" mt={2} color="purple.700">{stats.summary[key]}</Heading> : <Skeleton height="36px" mt={2} />}</Box>)}
      </SimpleGrid>
      <Box bg="white" borderWidth="1px" borderRadius="2xl" shadow="sm" p={{ base: 4, md: 6 }} mb={6}>
        <Flex justify="space-between" align={{ base: "start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3} mb={4}>
          <Box><Heading size="md">Analysis activity</Heading><Text color="gray.600" fontSize="sm">Completed analyses · UTC</Text></Box>
          <Select aria-label="Chart time period" value={period} onChange={event => { setPeriod(event.target.value); setStats(null); }} maxW="190px"><option value="hourly">Last 24 hours</option><option value="daily">Last 30 days</option><option value="weekly">Last 12 weeks</option><option value="monthly">Last 12 months</option></Select>
        </Flex>
        {!stats ? <Skeleton height="230px" /> : <>
          <Text fontSize="sm" color="gray.600" mb={3} aria-live="polite">{stats.buckets.reduce((sum, bucket) => sum + bucket.count, 0)} analyses across {stats.buckets.length} {period === "hourly" ? "hours" : period === "daily" ? "days" : period === "weekly" ? "weeks" : "months"}.</Text>
          {stats.summary.total === 0 && <Text color="gray.600" mb={3}>No analyses yet. Your chart will appear as you analyze resumes.</Text>}
          <Flex role="img" aria-label={`Analysis activity: ${stats.buckets.map(bucket => `${bucket.start}: ${bucket.count}`).join(", ")}`} align="end" gap={1} height="210px" borderBottomWidth="1px" borderColor="gray.200" overflow="hidden">
            {stats.buckets.map((bucket) => <Tooltip key={bucket.start} label={`${new Date(bucket.start).toLocaleString(undefined, { timeZone: "UTC" })} UTC: ${bucket.count}`}><Box flex="1" minW="2px" bg="purple.500" borderTopRadius="sm" height={`${Math.max(2, bucket.count / max * 100)}%`} opacity={bucket.count ? 1 : 0.25} aria-hidden="true" /></Tooltip>)}
          </Flex>
          <Flex justify="space-between" color="gray.600" fontSize="xs" mt={2}><Text>{period === "hourly" ? new Date(stats.buckets[0].start).toLocaleString(undefined, { hour: "numeric", timeZone: "UTC" }) : label(stats.buckets[0].start)}</Text><Text>{period === "hourly" ? new Date(stats.buckets.at(-1).start).toLocaleString(undefined, { hour: "numeric", timeZone: "UTC" }) : label(stats.buckets.at(-1).start)}</Text></Flex>
        </>}
      </Box>
      <AnalysisHistory recent />
    </DashboardLayout>
  );
}
