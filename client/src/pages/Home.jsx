import { Box, Heading, Text, Stack, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Box py={16} w="full" textAlign="center">
      <Stack spacing={6} align="center">
        <Heading size="2xl">Welcome to ResumeAnalyzer</Heading>
        <Text fontSize="xl" color="gray.600">Analyze, Improve, and Land Your Dream Job!</Text>
        <Button as={Link} colorScheme="teal" variant="solid" to="/login" size="lg">Get Started</Button>
      </Stack>
    </Box>
  );
}
