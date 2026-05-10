import { Box, Heading, Text, Stack } from "@chakra-ui/react";
import Sidebar from "../layouts/Sidebar";

export default function Dashboard() {
  return (
    <Stack direction={{ base: "column", md: "row" }} minH="80vh">
      <Sidebar />
      <Box flex={1} p={8}>
        <Heading size="lg" mb={4}>Dashboard</Heading>
        <Text fontSize="md">Welcome to your dashboard!</Text>
      </Box>
    </Stack>
  );
}
