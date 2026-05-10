import { Button } from "@chakra-ui/react";

export default function ReusableButton({ children, ...props }) {
  return (
    <Button colorScheme="teal" {...props}>
      {children}
    </Button>
  );
}
