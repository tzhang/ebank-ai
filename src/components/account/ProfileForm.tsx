"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { OCCUPATIONS } from "@/lib/profile-constants";
import { updateProfileAction, type ProfileActionState } from "@/lib/actions/profile";

const initialState: ProfileActionState = { error: null };

// M1 PROF-110 — 资料编辑表单(昵称/简介/职业标签)。
export default function ProfileForm({
  initialName,
  initialBio,
  initialOccupation,
}: {
  initialName: string;
  initialBio: string;
  initialOccupation: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const router = useRouter();

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm text-navy-200">昵称</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={30}
          defaultValue={initialName}
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white outline-none focus:border-gold-500"
        />
      </div>
      <div>
        <label htmlFor="occupationTag" className="mb-1 block text-sm text-navy-200">职业标签</label>
        <select
          id="occupationTag"
          name="occupationTag"
          defaultValue={initialOccupation || "none"}
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white outline-none focus:border-gold-500"
        >
          <option value="none">暂不填写</option>
          {OCCUPATIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bio" className="mb-1 block text-sm text-navy-200">简介</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={200}
          defaultValue={initialBio}
          placeholder="介绍你的背景与关注方向(最多 200 字)"
          className="w-full rounded-lg border border-navy-600 bg-navy-900/60 px-3 py-2 text-white outline-none focus:border-gold-500"
        />
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/community")}
          className="text-sm text-navy-400 hover:text-white"
        >
          暂不填写,先去逛逛
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-2 text-sm font-semibold text-navy-900 shadow-lg hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存资料"}
        </button>
      </div>
    </form>
  );
}
