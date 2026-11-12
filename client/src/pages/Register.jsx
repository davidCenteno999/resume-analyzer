import { useState } from "react";
import { Box, Heading, Input, Button, Stack, FormControl, FormLabel, Flex, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthService from "../services/auth_service/authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.register({ email: form.email, password: form.password });
      
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex width="100vw" height="100vh" align="center" justify="center" bgGradient="linear(to-tr, #834AF5 0%, #2F234F 100%)">
      <Box w={{ base: "98vw", md: "90vw", lg: "80vw", xl: "1200px" }} maxW="1200px" minH="90vh" shadow="2xl" borderRadius="2xl" overflow="hidden" bg="rgba(255,255,255,0.08)" display="flex" flexDir={{ base: "column", md: "row" }}>
        {/* Left: Register */}
        <Box flex="1" minH="100%" p={{ base: 8, md: 16 }} bgGradient="linear(to-tr, #f3c7f3 0%, #9457e0 100%)" display="flex" flexDir="column" justifyContent="center" minW="0">
          <Heading color="white" mb={1} fontSize="2xl" fontWeight="bold">Create an account</Heading>
          <Box mb={8} color="whiteAlpha.800" fontSize="sm">Join us now!</Box>
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
                  name="email"
                  type="email"
                  required
                  value={form.email}
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
              <FormControl>
                <FormLabel color="whiteAlpha.900">Confirm Password</FormLabel>
                <Input
                  bg="rgba(10,10,10,0.6)"
                  border="none"
                  color="white"
                  borderRadius="xl"
                  px={5}
                  py={6}
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
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
                Register
              </Button>
              <Flex align="center" justify="center" mt={2}>
                <Box as="span" color="whiteAlpha.700" fontSize="sm">
                  Already have an account?{" "}
                  <Link as={RouterLink} to="/login" color="purple.200" fontWeight="bold">
                    Login
                  </Link>
                </Box>
              </Flex>
            </Stack>
          </form>
        </Box>
        {/* Right: product context */}
        <Box flex="1" minH="100%" minW="0" px={{ base: 8, md: 16 }} py={{ base: 8, md: 16 }} bgGradient="linear(to-tl, #181449 75%, #8a35ba 100%)" display="flex" flexDir="column" justifyContent="center" position="relative">
          <Heading color="white" size="lg" mb={4}>Build your analysis history</Heading>
          <Text color="whiteAlpha.800" mb={8}>Upload a resume, enter the position requirements, and keep each result in your own dashboard.</Text>
          <Box bg="whiteAlpha.300" px={7} py={5} borderRadius="2xl" mt="auto" maxW="sm" color="white" fontSize="sm" boxShadow="lg">
            <Text fontWeight="semibold">Private to your account</Text><Text color="whiteAlpha.800" mt={2}>Your saved analyses and statistics are tied to your login.</Text>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
