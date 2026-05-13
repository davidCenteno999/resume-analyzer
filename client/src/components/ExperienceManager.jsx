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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

const isDuplicateExperience = (newExp, existingExps) => {
  return existingExps.some(
    exp => exp.title.toLowerCase() === newExp.title.toLowerCase() && exp.years === newExp.years
  );
};

export default function ExperienceManager({ experiences, setExperiences, triggerButton }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newTitle, setNewTitle] = useState("");
  const [newYears, setNewYears] = useState(1);
  const [error, setError] = useState("");

  const handleAddExperience = () => {
    setError("");
    
    if (!newTitle.trim()) {
      setError("Job title is required");
      return;
    }
    
    if (!newYears || newYears < 0) {
      setError("Years must be a positive number");
      return;
    }

    const newExp = {
      title: newTitle.trim(),
      years: newYears,
    };

    if (isDuplicateExperience(newExp, experiences)) {
      setError("This experience requirement already exists");
      return;
    }

    setExperiences([...experiences, newExp]);
    setNewTitle("");
    setNewYears(1);
  };

  const handleRemoveExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddExperience();
    }
  };

  const trigger = triggerButton ? (
    typeof triggerButton === "function" ? triggerButton(onOpen) : triggerButton
  ) : (
    <Button onClick={onOpen} colorScheme="blue" variant="outline" size="sm">
      Manage Experience
    </Button>
  );

  return (
    <>
      {trigger}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="white" borderRadius="xl" mx={4}>
          <ModalHeader pb={2}>
            <Heading size="md" color="gray.800">Manage Experience Requirements</Heading>
          </ModalHeader>
          <ModalCloseButton color="gray.600" />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Add New Experience Requirement
                </Text>
                <VStack spacing={2}>
                  <Input
                    placeholder="Job title (e.g., Software Engineer)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                    borderColor="gray.300"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
                  />
                  <HStack w="full">
                    <Box flex={1}>
                      <Text fontSize="xs" color="gray.500" mb={1}>Years of experience</Text>
                      <NumberInput
                        min={0}
                        max={50}
                        value={newYears}
                        onChange={(_, val) => setNewYears(isNaN(val) ? 0 : val)}
                        w="full"
                      >
                        <NumberInputField
                          borderColor="gray.300"
                          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #4299e1" }}
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Box>
                    <IconButton
                      icon={<FiPlus />}
                      onClick={handleAddExperience}
                      colorScheme="blue"
                      aria-label="Add experience"
                      mt={6}
                    />
                  </HStack>
                </VStack>
                {error && (
                  <Text fontSize="sm" color="red.500" mt={2}>
                    {error}
                  </Text>
                )}
                {newTitle && newYears > 0 && (
                  <Text fontSize="xs" color="blue.600" mt={1}>
                    Preview: {newTitle.trim()} — {newYears} {newYears === 1 ? "year" : "years"}
                  </Text>
                )}
              </Box>

              <Divider borderColor="gray.200" />

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Current Experience Requirements ({experiences.length})
                </Text>
                {experiences.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" fontStyle="italic">
                    No experience requirements added yet.
                  </Text>
                ) : (
                  <SimpleGrid columns={1} spacing={2}>
                    {experiences.map((exp, index) => (
                      <Tag
                        key={`${exp.title}-${index}`}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                        justify="space-between"
                      >
                        <TagLabel>
                          {exp.title} — {exp.years} {exp.years === 1 ? "year" : "years"}
                        </TagLabel>
                        <TagCloseButton
                          onClick={() => handleRemoveExperience(index)}
                          aria-label={`Remove ${exp.title}`}
                        />
                      </Tag>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <Button
                onClick={onClose}
                colorScheme="blue"
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