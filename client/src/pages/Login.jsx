import { useState } from "react";
import { Box, Heading, Input, Button, Stack, FormControl, FormLabel, Flex, Link, Text } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { Link as RouterLink, Navigate, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const success = await login(form.username, form.password);
    if (!success) setError("Invalid credentials");
    else navigate(location.state?.from || "/dashboard", { replace: true });
    setIsLoading(false);
  };

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <Flex width="100vw" height="100vh" align="center" justify="center" bgGradient="linear(to-tr, #834AF5 0%, #2F234F 100%)">
      <Box w={{ base: "98vw", md: "90vw", lg: "80vw", xl: "1200px" }} maxW="1200px" minH="90vh" shadow="2xl" borderRadius="2xl" overflow="hidden" bg="rgba(255,255,255,0.08)" display="flex" flexDir={{ base: "column", md: "row" }}>
        {/* Left: Login */}
        <Box flex="1" minH="100%" p={{ base: 8, md: 16 }} bgGradient="linear(to-tr, #f3c7f3 0%, #9457e0 100%)" display="flex" flexDir="column" justifyContent="center" minW="0">
          <Heading color="white" mb={1} fontSize="2xl" fontWeight="bold">Welcome back</Heading>
          <Box mb={8} color="whiteAlpha.800" fontSize="sm">Please Enter your Account details</Box>
          <form onSubmit={handleSubmit}>
            {error && <Text role="alert" color="red.900" mb={3}>{error}</Text>}
            <Stack spacing={5}>
              <FormControl>
                <FormLabel color="whiteAlpha.900">Email</FormLabel>
                <Input
                  bg="rgba(10,10,10,0.6)"
                  border="none"
                  color="white"
                  borderRadius="xl"
                  px={5}
                  py={6}
                  name="username"
                  type="email"
                  required
                  value={form.username}
                  onChange={handleChange}
                  boxShadow="lg"
                  _placeholder={{ color: "whiteAlpha.500" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="whiteAlpha.900">Password</FormLabel>
                <Input
                  bg="rgba(10,10,10,0.6)"
                  border="none"
                  color="white"
                  borderRadius="xl"
                  px={5}
                  py={6}
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  boxShadow="lg"
                  _placeholder={{ color: "whiteAlpha.500" }}
                />
              </FormControl>
              <Button
                w="full"
                type="submit"
                colorScheme="pink"
                bg="linear-gradient(90deg, #ff9d83 0%, #ff69b4 100%)"
                color="white"
                borderRadius="xl"
                fontWeight="bold"
                isLoading={isLoading}
                boxShadow="lg"
                size="lg"
                fontSize="lg"
                mb={2}
              >
                Sign in
              </Button>
              <Flex align="center" justify="center" mt={2}>
                <Box as="span" color="whiteAlpha.700" fontSize="sm">
                  Don't have an account?{" "}
                  <Link as={RouterLink} to="/register" color="purple.200" fontWeight="bold">
                    Register
                  </Link>
                </Box>
              </Flex>
            </Stack>
          </form>
        </Box>
        {/* Right: product context */}
        <Box flex="1" minH="100%" minW="0" px={{ base: 8, md: 16 }} py={{ base: 8, md: 16 }} bgGradient="linear(to-tl, #181449 75%, #8a35ba 100%)" display="flex" flexDir="column" justifyContent="center" position="relative">
          <Heading color="white" size="lg" mb={4}>Understand every resume</Heading>
          <Text color="whiteAlpha.800" mb={8}>Compare a candidate's skills, education, and experience with your job requirements. Revisit every saved analysis from your dashboard.</Text>
          <Box bg="whiteAlpha.300" px={7} py={5} borderRadius="2xl" mt="auto" maxW="sm" color="white" fontSize="sm" boxShadow="lg">
            <Text fontWeight="semibold">One place for every analysis</Text>
            <Text color="whiteAlpha.800" mt={2}>Search candidates, review matching details, and see activity over time.</Text>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
