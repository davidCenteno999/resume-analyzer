import { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Heading,
  Divider,
  Select,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

const DEGREE_LEVELS = [
  "High School",
  "Associate",
  "Bachelor's",
  "Master's",
  "Doctorate",
  "Postdoctoral",
];

const normalizeDegree = (input, level) => {
  const trimmed = input.trim();
  if (!trimmed) return "";
  
  const levelName = level || "Degree";
  
  if (trimmed.toLowerCase().includes("degree")) {
    const words = trimmed.split(" ").filter(w => w.trim());
    return words
      .map((word, i) => {
        if (i === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        return word.toLowerCase();
      })
      .join(" ");
  }
  
  return `${levelName} in ${trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()}`;
};

export default function DegreeManager({ degrees, setDegrees, triggerButton }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newDegree, setNewDegree] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");

  const handleAddDegree = () => {
    const normalized = normalizeDegree(newDegree, degreeLevel);
    if (normalized && !degrees.some(d => d.toLowerCase() === normalized.toLowerCase())) {
      setDegrees([...degrees, normalized]);
      setNewDegree("");
      setDegreeLevel("");
    }
  };

  const handleRemoveDegree = (degreeToRemove) => {
    setDegrees(degrees.filter((d) => d !== degreeToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDegree();
    }
  };

  const trigger = triggerButton ? (
    typeof triggerButton === "function" ? triggerButton(onOpen) : triggerButton
  ) : (
    <Button onClick={onOpen} colorScheme="purple" variant="outline" size="sm">
      Manage Degrees
    </Button>
  );

  return (
    <>
      {trigger}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="white" borderRadius="xl" mx={4}>
          <ModalHeader pb={2}>
            <Heading size="md" color="gray.800">Manage Degree Requirements</Heading>
          </ModalHeader>
          <ModalCloseButton color="gray.600" />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Add New Degree
                </Text>
                <VStack spacing={2}>
                  <Select
                    placeholder="Select degree level"
                    value={degreeLevel}
                    onChange={(e) => setDegreeLevel(e.target.value)}
                    borderColor="gray.300"
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805ad5" }}
                  >
                    {DEGREE_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                  <HStack>
                    <Input
                      placeholder="Enter degree field (e.g., Computer Science)"
                      value={newDegree}
                      onChange={(e) => setNewDegree(e.target.value)}
                      onKeyPress={handleKeyPress}
                      borderColor="gray.300"
                      _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805ad5" }}
                    />
                    <IconButton
                      icon={<FiPlus />}
                      onClick={handleAddDegree}
                      colorScheme="purple"
                      aria-label="Add degree"
                      isDisabled={!newDegree.trim()}
                    />
                  </HStack>
                </VStack>
                {newDegree && degreeLevel && (
                  <Text fontSize="xs" color="purple.600" mt={1}>
                    Preview: {normalizeDegree(newDegree, degreeLevel)}
                  </Text>
                )}
              </Box>

              <Divider borderColor="gray.200" />

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Current Degrees ({degrees.length})
                </Text>
                {degrees.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" fontStyle="italic">
                    No degrees added yet. Add your first degree above.
                  </Text>
                ) : (
                  <SimpleGrid columns={1} spacing={2}>
                    {degrees.map((degree) => (
                      <Tag
                        key={degree}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="purple"
                        justify="space-between"
                      >
                        <TagLabel>{degree}</TagLabel>
                        <TagCloseButton
                          onClick={() => handleRemoveDegree(degree)}
                          aria-label={`Remove ${degree}`}
                        />
                      </Tag>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <Button
                onClick={onClose}
                colorScheme="purple"
                size="md"
                mt={2}
              >
                Done
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}