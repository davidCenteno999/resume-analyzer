import { Box, VStack, Link as ChakraLink, Icon, Text } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { FiFilePlus, FiClock, FiBarChart2 } from "react-icons/fi";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: FiBarChart2 },
  { label: "New Analysis", to: "/upload", icon: FiFilePlus },
  { label: "Analysis History", to: "/history", icon: FiClock },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <Box as="nav" aria-label="Analysis navigation" w={{ base: "full", md: 60 }} flexShrink={0} bg="white" borderRightWidth={{ md: "1px" }} borderBottomWidth={{ base: "1px", md: 0 }} p={4}>
      <Text color="purple.700" fontWeight="bold" fontSize="xs" letterSpacing="wide" mb={4} display={{ base: "none", md: "block" }}>WORKSPACE</Text>
      <VStack spacing={2} align="stretch" flexDir={{ base: "row", md: "column" }} overflowX="auto">
        {links.map((link) => (
          <ChakraLink
            as={Link}
            to={link.to}
            key={link.to}
            display="flex"
            alignItems="center"
            fontWeight={location.pathname === link.to ? "bold" : "medium"}
            color={location.pathname === link.to ? "purple.700" : "gray.700"}
            bg={location.pathname === link.to ? "purple.50" : "transparent"}
            px={4} py={3} borderRadius="xl" whiteSpace="nowrap" fontSize="sm"
            aria-current={location.pathname === link.to ? "page" : undefined}
            _hover={{ textDecor: "none", bg: "purple.50" }}
          >
            <Icon as={link.icon} boxSize={4} mr={3} /> {link.label}
          </ChakraLink>
        ))}
      </VStack>
    </Box>
  );
}
