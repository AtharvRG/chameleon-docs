import { auth } from "@/auth";

export default async function TestSessionPage() {
  const session = await auth();

  return (
    <pre style={{ padding: 20 }}>
      {JSON.stringify(session, null, 2)}
    </pre>
  );
}