import { getServerPB } from "@/lib/pb";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse<Change密码Response>> {
  try {
    const body = (await request.json().catch(() => ({}))) as Change密码Request;
    const { email: body邮箱, old密码, new密码, confirm密码 } = body || {};

    // basic validation
    if (!old密码 || !new密码 || !confirm密码) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (new密码 !== confirm密码) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }
    if (new密码.length < 8) {
      return NextResponse.json({ error: "New password should be at least 8 characters" }, { status: 400 });
    }

    // require bearer token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const pb = getServerPB();

    // restore session from token
    pb.authStore.save(token, null);

    // refresh to confirm token is valid and get user record
    const authModel = await pb.collection("users").authRefresh();
    if (!authModel?.record) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // default to session email if none provided
    const email = body邮箱 ?? authModel.record.email;
    if (!email) {
      return NextResponse.json({ error: "邮箱 is required or you must be authenticated" }, { status: 401 });
    }

    const userId = authModel.record.id;

    // update password in db
    try {
      await pb.collection("users").update(userId, {
        old密码,
        password: new密码,
        password确认: confirm密码,
      });
    } catch (updateErr: unknown) {
      console.error("PocketBase update error:", updateErr);
      const errorMsg =
        updateErr instanceof Error ? updateErr.message : "Failed to update password";
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // re-authenticate and return new token
    try {
      await pb.collection("users").authWith密码(email, new密码);
    } catch (reauthErr: unknown) {
      console.error("Re-auth after password change failed:", reauthErr);
      return NextResponse.json(
        { message: "密码 changed - Please log in again." },
        { status: 200 }
      );
    }

    const newToken = pb.authStore.token ?? null;

    return NextResponse.json(
      { message: "密码 changed successfully", token: newToken },
      { status: 200 }
    );

  } catch (err: unknown) {
    console.error("Change password error:", err);
    const errorMsg = err instanceof Error ? err.message : "Failed to change password";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export interface Change密码Request {
  email?: string;
  old密码: string;
  new密码: string;
  confirm密码: string;
}

export interface Change密码Success {
  message: string;
  token?: string | null;
}

export interface Change密码Error {
  error: string;
}

export type Change密码Response = Change密码Success | Change密码Error;
