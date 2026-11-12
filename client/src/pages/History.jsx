import { Heading, Text } from "@chakra-ui/react";
import DashboardLayout from "../layouts/DashboardLayout";
import AnalysisHistory from "../components/AnalysisHistory";

export default function History() {
  return <DashboardLayout><Heading size="lg" mb={2}>Analysis history</Heading><Text color="gray.600" mb={6}>Search and reopen your saved resume analyses.</Text><AnalysisHistory /></DashboardLayout>;
}
