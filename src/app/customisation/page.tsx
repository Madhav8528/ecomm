import type { Metadata } from "next";
import { CustomisationStudio } from "@/components/customisation/customisation-studio";

export const metadata: Metadata = {
  title: "Customisation Studio | ClearPiece",
  description:
    "Build premium branded glass packaging concepts with ClearPiece. Upload your logo and receive a mockup concept within 4 working hours.",
};

export default function CustomisationPage() {
  return <CustomisationStudio />;
}
