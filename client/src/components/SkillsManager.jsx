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
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

export default function SkillsManager({ skills, setSkills, triggerButton }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const trigger = triggerButton ? (
    typeof triggerButton === "function" ? triggerButton(onOpen) : triggerButton
  ) : (
    <Button onClick={onOpen} colorScheme="pink" variant="outline" size="sm">
      Manage Skills
    </Button>
  );

  return (
    <>
      {trigger}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="white" borderRadius="xl" mx={4}>
          <ModalHeader pb={2}>
            <Heading size="md" color="gray.800">Manage Required Skills</Heading>
          </ModalHeader>
          <ModalCloseButton color="gray.600" />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Add New Skill
                </Text>
                <HStack>
                  <Input
                    placeholder="Enter skill name"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                    borderColor="gray.300"
                    _focus={{ borderColor: "pink.500", boxShadow: "0 0 0 1px #ed64a6" }}
                  />
                  <IconButton
                    icon={<FiPlus />}
                    onClick={handleAddSkill}
                    colorScheme="pink"
                    aria-label="Add skill"
                    isDisabled={!newSkill.trim()}
                  />
                </HStack>
              </Box>

              <Divider borderColor="gray.200" />

              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Current Skills ({skills.length})
                </Text>
                {skills.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" fontStyle="italic">
                    No skills added yet. Add your first skill above.
                  </Text>
                ) : (
                  <SimpleGrid columns={2} spacing={2}>
                    {skills.map((skill) => (
                      <Tag
                        key={skill}
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="purple"
                        justify="space-between"
                      >
                        <TagLabel>{skill}</TagLabel>
                        <TagCloseButton
                          onClick={() => handleRemoveSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        />
                      </Tag>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <Button
                onClick={onClose}
                colorScheme="pink"
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