import { useState } from "react";
import { Box, Heading, Input, Button, Stack, FormControl, FormLabel, Flex, Link } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthService from "../services/auth_service/authService";

export default function Register() {
  const { login } = useAuth();
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
        {/* Right: Testimonial */}
        <Box flex="1" minH="100%" minW="0" px={{ base: 8, md: 16 }} py={{ base: 8, md: 16 }} bgGradient="linear(to-tl, #181449 75%, #8a35ba 100%)" display="flex" flexDir="column" justifyContent="center" position="relative">
          <Box color="white" fontWeight="bold" fontSize="xl" mb={4}>What's our <br/>Jobseekers Said.</Box>
          <Box color="whiteAlpha.700" mb={8}>
            <q>Search and find your dream job in one easier, fast event. Just browse a job and apply if you need it.</q>
            <Box mt={5}>
              <b>Max Partono</b> <Box as="span" ml={1} fontSize="xs" color="whiteAlpha.500">UI Designer at Google</Box>
            </Box>
            <Button size="xs" colorScheme="pink" mt={1} mr={2}>UI/UX</Button>
            <Button size="xs" colorScheme="blue" mt={1}>Designer</Button>
          </Box>
          <Box bg="whiteAlpha.300" px={7} py={5} borderRadius="2xl" mt="auto" maxW="sm" color="white" fontSize="sm" boxShadow="lg">
            <div>Get your right job and right place apply now</div>
            <div color="whiteAlpha.600">Be among the first founders to experience the website at its best.</div>
            <Flex mt={3} gap={-2}>
              <Box as="img" src="https://randomuser.me/api/portraits/men/32.jpg" boxSize="28px" borderRadius="full" border="2px solid white" />
              <Box as="img" src="https://randomuser.me/api/portraits/women/44.jpg" boxSize="28px" borderRadius="full" border="2px solid white" ml={-2}/>
              <Box as="img" src="https://randomuser.me/api/portraits/men/65.jpg" boxSize="28px" borderRadius="full" border="2px solid white" ml={-2}/>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
