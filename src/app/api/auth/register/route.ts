import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth/store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const firstName = (body?.firstName ?? "").toString().trim();
  const lastName = (body?.lastName ?? "").toString().trim();
  const email = (body?.email ?? "").toString().trim();
  const password = (body?.password ?? "").toString();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  try {
    const user = await createUser({ firstName, lastName, email, password });
    return NextResponse.json({ email: user.email });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
