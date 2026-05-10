import { Box, Flex, Spacer, Heading,useColorMode, Button, IconButton } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggleColorMode, colorMode } = useColorMode()
  return (
    <Box bgGradient="linear(to-tr, #834AF5 0%, #2F234F 100%)" px={4} shadow="sm" position="sticky" top={0} zIndex={10}>
      <Flex h={16} alignItems="center">
        <Heading size="md" as={Link} to="/" color="white">ResumeAnalyzer</Heading>
        <Spacer />
        <IconButton
          icon={colorMode === "light" ? "🌙" : "☀️"}
          variant="ghost"
          onClick={toggleColorMode}
          aria-label="Toggle color mode"
          mr={2}
          color="white"
          _hover={{ bg: 'purple.400', color: 'white' }}
        />
        {user ? (
          <>
            <Button as={Link} to="/dashboard" variant="ghost" color="white" _hover={{ bg: 'purple.400', color: 'white' }} mr={2}>Dashboard</Button>
            <Button onClick={logout} borderColor="#f3c7f3" color="white" variant="outline" _hover={{ bg: 'purple.400', color: 'white', borderColor: '#834AF5' }}>Logout</Button>
          </>
        ) : (
          <Button as={Link} to="/login" bgGradient="linear(to-tr, #f3c7f3 0%, #9457e0 100%)" color="white" _hover={{ bg: 'purple.500', color: 'white' }} variant="solid">Login</Button>
        )}
      </Flex>
    </Box>
  );
}
