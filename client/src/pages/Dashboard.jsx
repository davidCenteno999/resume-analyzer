import { Box, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Stack direction={{ base: "column", md: "row" }} minH="80vh">
      <Sidebar />
      <Box flex={1} p={8}>
        <Heading size="lg" mb={4}>Dashboard</Heading>
        <Text fontSize="md" mb={6}>Welcome to your dashboard!</Text>
        <Button colorScheme="purple" onClick={() => navigate("/upload")}>
          Upload Resume PDF
        </Button>
      </Box>
    </Stack>
  );
}
