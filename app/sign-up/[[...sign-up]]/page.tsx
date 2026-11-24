import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-5rem)] py-10">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  );
}

