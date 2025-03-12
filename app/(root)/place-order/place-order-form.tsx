"use client";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/actions/order.actions";
import { Check, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

const PLaceOrderForm = () => {
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const res = await createOrder(); // Ensure this is awaited
      console.log(res);

      if (res?.redirectTo) {
        router.push(res.redirectTo);
      } else if (res?.message) {
        alert(res.message); // Handle errors properly
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };
  const PlaceOrderButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full">
        {pending ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}{" "}
        Place Order
      </Button>
    );
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <PlaceOrderButton />
      </form>
    </>
  );
};
export default PLaceOrderForm;
