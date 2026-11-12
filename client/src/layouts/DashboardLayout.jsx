import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return <Flex minH="calc(100vh - 64px)" direction={{ base: "column", md: "row" }} bg="gray.50">
    <Sidebar />
    <Box as="main" minW={0} flex="1" p={{ base: 4, md: 8 }} maxW="1600px">{children}</Box>
  </Flex>;
}
