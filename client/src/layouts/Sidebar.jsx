import { Box, VStack, Link as ChakraLink, Icon } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiBarChart2 } from "react-icons/fi";

const links = [
  { label: "Home", to: "/", icon: FiHome },
  { label: "Dashboard", to: "/dashboard", icon: FiBarChart2 },
  { label: "Profile", to: "#", icon: FiUser },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <Box w={{ base: "full", md: 60 }} bg="gray.50" p={4} minH="100vh" shadow="md">
      <VStack spacing={6} align="stretch">
        {links.map((link) => (
          <ChakraLink
            as={Link}
            to={link.to}
            key={link.to}
            display="flex"
            alignItems="center"
            fontWeight={location.pathname === link.to ? "bold" : "normal"}
            color={location.pathname === link.to ? "teal.500" : "gray.700"}
            _hover={{ textDecor: "none", color: "teal.600" }}
          >
            <Icon as={link.icon} mr={2} /> {link.label}
          </ChakraLink>
        ))}
      </VStack>
    </Box>
  );
}
