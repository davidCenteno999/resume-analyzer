import { useState, useRef } from "react";
import { Box, Heading, Input, Button, Stack, FormControl, FormLabel, Flex, Text, Icon, useToast, Spinner, Tag, TagLabel, Wrap, WrapItem } from "@chakra-ui/react";
import { FiUploadCloud, FiPlus } from "react-icons/fi";
import SkillsManager from "../components/SkillsManager";
import DegreeManager from "../components/DegreeManager";
import ExperienceManager from "../components/ExperienceManager";
import { resumeService } from "../services/resume_service/resumeService";

export default function UploadPdf() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const fileInputRef = useRef();
  const toast = useToast();

  const onFileChange = (e) => {
    setError("");
    const chosen = e.target.files[0];
    if (chosen && chosen.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
    } else {
      setFile(chosen);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError("");
    const chosen = e.dataTransfer.files[0];
    if (chosen && chosen.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
    } else {
      setFile(chosen);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await resumeService.uploadResume(file);
      console.log("Upload result:", result);
      toast({ title: "Resume uploaded!", description: result.filename, status: "success", duration: 3000, isClosable: true });
      setFile(null);
    } catch (err) {
      setError(err.message || "Failed to upload resume");
      toast({ title: "Upload failed", description: err.message, status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex width="100vw" height="100vh" align="center" justify="center" bgGradient="linear(to-tr, #834AF5 0%, #2F234F 100%)">
      <Box w={{ base: "98vw", md: "90vw", lg: "80vw", xl: "1200px" }} maxW="1200px" minH="90vh" shadow="2xl" borderRadius="2xl" overflow="hidden" bg="rgba(255,255,255,0.08)" display="flex" flexDir={{ base: "column", md: "row" }}>
        <Box flex="1" minH="100%" p={{ base: 8, md: 16 }} bgGradient="linear(to-tr, #f3c7f3 0%, #9457e0 100%)" display="flex" flexDir="column" justifyContent="center" minW="0">
          <Heading color="white" mb={1} fontSize="2xl" fontWeight="bold">Upload PDF</Heading>
          <Box mb={8} color="whiteAlpha.800" fontSize="sm">Select or drag & drop your PDF resume below.</Box>
          <form onSubmit={handleUpload}>
            <Stack spacing={5}>
              <FormControl>
                <FormLabel color="whiteAlpha.900">PDF File</FormLabel>
                <Box
                  as="div"
                  border="2px dashed #fff"
                  borderRadius="xl"
                  bg="rgba(10,10,10,0.6)"
                  p={8}
                  textAlign="center"
                  color="whiteAlpha.700"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: "#ff69b4", bg: "rgba(10,10,10,0.8)" }}
                  onClick={() => fileInputRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Icon as={FiUploadCloud} boxSize={12} mb={2} color="#ff69b4" />
                  <Text fontWeight="semibold">{file ? file.name : "Drag & drop or click to select PDF"}</Text>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    display="none"
                    onChange={onFileChange}
                  />
                </Box>
              </FormControl>
              {error && <Box color="pink.200" fontSize="sm">{error}</Box>}
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
                disabled={!file || isLoading}
              >
                {isLoading ? <Spinner color="white" /> : "Upload"}
              </Button>
            </Stack>
          </form>
        </Box>
        <Box flex="1" minH="100%" minW="0" px={{ base: 8, md: 16 }} py={{ base: 8, md: 16 }} bgGradient="linear(to-tl, #181449 75%, #8a35ba 100%)" display="flex" flexDir="column" justifyContent="center" position="relative">
          <Box color="white" fontWeight="bold" fontSize="xl" mb={4}>Why upload your resume?</Box>
          <Box color="whiteAlpha.700" mb={8}>
            <q>Instantly analyze and optimize your resume for job applications.</q>
          </Box>
          <Box bg="whiteAlpha.300" px={7} py={5} borderRadius="2xl" mt="auto" maxW="sm" color="white" fontSize="sm" boxShadow="lg" mb={6}>
            <div>Get detailed feedback and insights on your PDF resume. Keep your profile fresh and competitive.</div>
          </Box>
          <Box mt="auto">
            <Text color="white" fontWeight="bold" fontSize="md" mb={3}>Required Skills</Text>
            <Box bg="whiteAlpha.200" borderRadius="xl" p={4}>
              {skills.length === 0 ? (
                <Text color="whiteAlpha.600" fontSize="sm" mb={3}>No skills added yet.</Text>
              ) : (
                <Wrap mb={3}>
                  {skills.map((skill) => (
                    <WrapItem key={skill}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="pink"
                        bg="linear-gradient(90deg, #ff9d83 0%, #ff69b4 100%)"
                      >
                        <TagLabel>{skill}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
              <SkillsManager
                skills={skills}
                setSkills={setSkills}
                triggerButton={(onOpen) => (
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={onOpen}
                    size="sm"
                    colorScheme="pink"
                    variant="outline"
                    borderColor="pink.300"
                    color="pink.200"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    {skills.length > 0 ? "Manage Skills" : "Add Skills"}
                  </Button>
                )}
              />
            </Box>
          </Box>
          <Box mt={4}>
            <Text color="white" fontWeight="bold" fontSize="md" mb={3}>Degree Requirements</Text>
            <Box bg="whiteAlpha.200" borderRadius="xl" p={4}>
              {degrees.length === 0 ? (
                <Text color="whiteAlpha.600" fontSize="sm" mb={3}>No degrees added yet.</Text>
              ) : (
                <Wrap mb={3}>
                  {degrees.map((degree) => (
                    <WrapItem key={degree}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="purple"
                        bg="linear-gradient(90deg, #9f7aea 0%, #805ad5 100%)"
                      >
                        <TagLabel>{degree}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
              <DegreeManager
                degrees={degrees}
                setDegrees={setDegrees}
                triggerButton={(onOpen) => (
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={onOpen}
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    borderColor="purple.300"
                    color="purple.200"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    {degrees.length > 0 ? "Manage Degrees" : "Add Degree"}
                  </Button>
                )}
              />
            </Box>
          </Box>
          <Box mt={4}>
            <Text color="white" fontWeight="bold" fontSize="md" mb={3}>Experience Requirements</Text>
            <Box bg="whiteAlpha.200" borderRadius="xl" p={4}>
              {experiences.length === 0 ? (
                <Text color="whiteAlpha.600" fontSize="sm" mb={3}>No experience requirements added yet.</Text>
              ) : (
                <Wrap mb={3}>
                  {experiences.map((exp, index) => (
                    <WrapItem key={`${exp.title}-${index}`}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                        bg="linear-gradient(90deg, #4299e1 0%, #3182ce 100%)"
                      >
                        <TagLabel>{exp.title} — {exp.years} {exp.years === 1 ? "year" : "years"}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
              <ExperienceManager
                experiences={experiences}
                setExperiences={setExperiences}
                triggerButton={(onOpen) => (
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={onOpen}
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    borderColor="blue.300"
                    color="blue.200"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    {experiences.length > 0 ? "Manage Experience" : "Add Experience"}
                  </Button>
                )}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
