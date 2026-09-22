"use client";

import { useState } from "react";
import { PageHeader, Panel } from "@/components/ui";
import { formatDateTime, formatTime, roleLabel } from "@/lib/format";
import { usePlatform } from "@/lib/store";

export default function AttendancePage() {
  const { user, users, attendance, todayAttendance, clockIn, clockOut } = usePlatform();
  const [shift, setShift] = useState("Morning A");

  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayRows = attendance
    .filter((a) => a.date === today)
    .map((a) => ({
      ...a,
      person: users.find((u) => u.id === a.userId),
    }))
    .sort((a, b) => (a.clockIn ?? "").localeCompare(b.clockIn ?? ""));

  const canViewTeam = ["hr", "supervisor", "manager"].includes(user.role);

  return (
    <div>
      <PageHeader
        eyebrow="Module 3.5"
        title="Attendance & shift"
        description="Daily clock-in / clock-out for the plant. Designed to accept QR or biometric inputs later."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="animate-rise p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
            Your shift today
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--brand-deep)]">
            {todayAttendance?.clockIn
              ? todayAttendance.clockOut
                ? "Shift complete"
                : "You are on shift"
              : "Not clocked in"}
          </h2>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--ink-muted)]">Clock in</dt>
              <dd className="mt-1 text-lg font-semibold">
                {formatTime(todayAttendance?.clockIn)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--ink-muted)]">Clock out</dt>
              <dd className="mt-1 text-lg font-semibold">
                {formatTime(todayAttendance?.clockOut)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--ink-muted)]">Shift</dt>
              <dd className="mt-1 font-semibold">{todayAttendance?.shift ?? shift}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-muted)]">Role</dt>
              <dd className="mt-1 font-semibold">{roleLabel(user.role)}</dd>
            </div>
          </dl>

          {!todayAttendance?.clockIn ? (
            <div className="mt-6">
              <label className="block text-sm font-medium">
                Select shift
                <select
                  className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                >
                  <option>Morning A</option>
                  <option>Evening B</option>
                  <option>Night C</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => clockIn(shift)}
                className="mt-4 w-full rounded-lg bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]"
              >
                Clock in
              </button>
            </div>
          ) : !todayAttendance.clockOut ? (
            <button
              type="button"
              onClick={() => clockOut()}
              className="mt-6 w-full rounded-lg border border-[var(--brand)] px-4 py-3 text-sm font-semibold text-[var(--brand)] hover:bg-[var(--brand-soft)]"
            >
              Clock out
            </button>
          ) : (
            <p className="mt-6 rounded-lg bg-[var(--ok-soft)] px-4 py-3 text-sm text-[var(--ok)]">
              Attendance closed for today at {formatDateTime(todayAttendance.clockOut)}.
            </p>
          )}
        </Panel>

        <Panel className="animate-rise-delay p-6">
          <h2 className="text-lg font-semibold">
            {canViewTeam ? "Floor attendance today" : "Your history"}
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {canViewTeam
              ? "Live view of who has clocked in this shift."
              : "Recent attendance entries for your account."}
          </p>

          <ul className="mt-5 divide-y divide-[var(--line)]">
            {(canViewTeam
              ? todayRows
              : attendance
                  .filter((a) => a.userId === user.id)
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((a) => ({ ...a, person: user }))
            ).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">{row.person?.name ?? "Unknown"}</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {row.date} · {row.shift}
                  </p>
                </div>
                <div className="text-right text-xs text-[var(--ink-muted)]">
                  <p>
                    In {formatTime(row.clockIn)}
                    {row.clockOut ? ` · Out ${formatTime(row.clockOut)}` : ""}
                  </p>
                  <p className="font-semibold text-[var(--ink)] capitalize">{row.status}</p>
                </div>
              </li>
            ))}
            {canViewTeam && todayRows.length === 0 ? (
              <li className="py-8 text-sm text-[var(--ink-muted)]">No clock-ins yet today.</li>
            ) : null}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
