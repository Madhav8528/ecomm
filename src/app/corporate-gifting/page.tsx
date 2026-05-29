import { redirect } from "next/navigation";

export default function CorporateGiftingPage() {
  redirect("/products?q=gift");
}
