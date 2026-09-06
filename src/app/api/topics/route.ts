import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { createTopic } from "@/lib/forum";

// M1 FRM-130 — 发起话题 JSON API(程序化调用;表单走 createTopicAction)。
export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }
  const { title, content, category } = (body ?? {}) as {
    title?: unknown;
    content?: unknown;
    category?: unknown;
  };
  const result = await createTopic({ userId: user.id }, { title, content, category });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ topic: { id: result.topicId } }, { status: 201 });
}
