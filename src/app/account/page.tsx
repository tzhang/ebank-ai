import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { avatarColor, avatarInitial } from "@/lib/profile-constants";
import { formatRelative } from "@/lib/time";
import ProfileForm from "@/components/account/ProfileForm";
import DeleteAccountPanel from "@/components/account/DeleteAccountPanel";

// M1 PROF-110 — 个人中心:资料卡 + 编辑表单 + 注销(NFR-305)。
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string | string[] }>;
}) {
  const user = await requireUser();
  if (!user) {
    return (
      <section className="border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white">登录后查看个人资料</h1>
          <p className="mt-3 text-navy-300">
            <Link href="/login" className="text-gold-400 hover:underline">去登录</Link>
            ,或<Link href="/register" className="text-gold-400 hover:underline">注册一个账号</Link>
          </p>
        </div>
      </section>
    );
  }

  const profile = await getProfile(user.id);
  if (!profile) return null;

  const sp = await searchParams;
  const saved = !Array.isArray(sp.ok) && sp.ok === "1";
  const seed = profile.email;
  const roleChip: Record<string, string> = {
    admin: "bg-gold-500/15 text-gold-300",
    moderator: "bg-blue-500/10 text-blue-300",
    user: "bg-navy-600/60 text-navy-300",
  };

  return (
    <section className="min-h-[70vh] border-b border-navy-700/50 bg-gradient-to-b from-navy-800 to-navy-900 py-12">
      <div className="mx-auto w-full max-w-3xl px-4">
        {/* 资料卡 */}
        <div className="rounded-2xl border border-navy-600/50 bg-navy-800/50 p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-5">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-navy-900 ${avatarColor(seed)}`}>
              {avatarInitial(profile.name, profile.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-white">{profile.name ?? "(未设置昵称)"}</h1>
                <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${roleChip[profile.role] ?? ""}`}>
                  {profile.role}
                </span>
                {profile.occupationTag && (
                  <span className="rounded-full bg-navy-600/60 px-2 py-0.5 text-[10px] text-navy-200">
                    {profile.occupationTag}
                  </span>
                )}
              </div>
              <div className="mt-1 font-mono text-sm text-navy-400">{profile.email}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                {profile.emailVerified ? (
                  <span className="text-emerald-400">✓ 邮箱已验证</span>
                ) : (
                  <span className="text-gold-400">邮箱未验证(验证后可发布内容)</span>
                )}
                <span className="text-navy-500">加入于 {formatRelative(profile.createdAt)}</span>
              </div>
              {profile.bio && <p className="mt-3 text-sm leading-relaxed text-navy-200">{profile.bio}</p>}
            </div>
          </div>
          {!profile.bio && !profile.occupationTag && (
            <p className="mt-4 rounded-lg border border-gold-500/20 bg-gold-500/5 px-3 py-2 text-xs text-gold-300">
              完善昵称下的简介与职业标签,让社区更了解你(可跳过)。
            </p>
          )}
        </div>

        {saved && (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            资料已保存
          </p>
        )}

        {/* 编辑资料 */}
        <div className="mt-6 rounded-2xl border border-navy-600/50 bg-navy-800/50 p-6 sm:p-8">
          <h2 className="font-semibold text-white">编辑资料</h2>
          <div className="mt-4">
            <ProfileForm
              initialName={profile.name ?? ""}
              initialBio={profile.bio ?? ""}
              initialOccupation={profile.occupationTag ?? ""}
            />
          </div>
        </div>

        {/* 危险区:注销 */}
        <div className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/5 p-6 sm:p-8">
          <h2 className="font-semibold text-red-300">注销账号</h2>
          <p className="mt-1 text-xs text-navy-400">删除账号与全部内容,此操作不可撤销。</p>
          <div className="mt-4 max-w-md">
            <DeleteAccountPanel email={profile.email} />
          </div>
        </div>
      </div>
    </section>
  );
}
