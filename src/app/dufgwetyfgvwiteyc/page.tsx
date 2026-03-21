"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowDownToLine,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Download,
  ExternalLink,
  Filter,
  LayoutDashboard,
  Loader2,
  LucideIcon,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  SquareSlash,
  X,
} from "lucide-react";
import {
  ADMIN_LOGIN_PATH,
  TeamStatus,
  clearAdminSession,
  getAdminSession,
} from "../lib/adminAuth";
import { getSupabaseClient } from "../lib/supabaseClient";

type TeamRow = {
  id: number;
  wilaya: string;
  team_name: string;
  status: TeamStatus;
  num_members: number;
  different_universities: boolean | null;
  can_attend_physically: boolean | null;
  participated_before: boolean | null;
  participation_experience: string | null;
  hands_on_experience: boolean | null;
  hands_on_details: string | null;
  motivation: string | null;
  heard_about: string | null;
  anything_to_add: string | null;
  created_at: string;
};

type MemberRow = {
  id: number;
  team_id: number;
  is_leader: boolean;
  full_name: string;
  email: string;
  phone: string;
  discord: string;
  linkedin: string;
  university: string;
  field_of_study: string;
  year_of_study: string;
  software_tools: string[] | null;
  created_at: string;
};

type DashboardTeam = {
  team: TeamRow;
  members: MemberRow[];
  status: TeamStatus;
  searchIndex: string;
};

type DetailTab = "overview" | "members" | "motivation";

const statusLabels: Record<TeamStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const statusStyles: Record<TeamStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100/60",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-emerald-100/60",
  rejected: "border-rose-200 bg-rose-50 text-rose-700 shadow-rose-100/60",
};

const filterTabs: Array<{ id: "all" | TeamStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

const dashboardStats = [
  { key: "total", label: "Total teams", icon: LayoutDashboard, tone: "from-sky-500 to-cyan-400" },
  { key: "pending", label: "Pending", icon: CircleDashed, tone: "from-amber-500 to-orange-400" },
  { key: "accepted", label: "Accepted", icon: CheckCircle2, tone: "from-emerald-500 to-teal-400" },
  { key: "rejected", label: "Rejected", icon: SquareSlash, tone: "from-rose-500 to-red-400" },
] as const;

const adminFontClass = "font-[family-name:var(--font-sans)]";

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatBoolean = (value: boolean | null) => {
  if (value === null) {
    return "Not specified";
  }

  return value ? "Yes" : "No";
};

const formatSoftwareTools = (tools: string[] | null) => {
  if (!tools || tools.length === 0) {
    return "None listed";
  }

  return tools.join(", ");
};

const toExternalHref = (value: string) => {
  if (!value) {
    return "";
  }

  return /^https?:\/\//i.test(value) ? value : "";
};

const csvEscape = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  const text = Array.isArray(value) ? value.join("; ") : String(value);

  return `"${text.replace(/"/g, '""')}"`;
};

const buildCsv = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(",")];

  rows.forEach((row) => {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  });

  return lines.join("\n");
};

const downloadCsv = (fileName: string, rows: Record<string, unknown>[]) => {
  const csv = buildCsv(rows);

  if (!csv) {
    toast.error("No rows available for export.");
    return;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const flattenTeamsForExport = (teams: DashboardTeam[]) =>
  teams.flatMap((team) => {
    if (team.members.length === 0) {
      return [
        {
          team_id: team.team.id,
          team_name: team.team.team_name,
          team_status: statusLabels[team.status],
          wilaya: team.team.wilaya,
          num_members: team.team.num_members,
          different_universities: formatBoolean(team.team.different_universities),
          can_attend_physically: formatBoolean(team.team.can_attend_physically),
          participated_before: formatBoolean(team.team.participated_before),
          participation_experience: team.team.participation_experience ?? "",
          hands_on_experience: formatBoolean(team.team.hands_on_experience),
          hands_on_details: team.team.hands_on_details ?? "",
          motivation: team.team.motivation ?? "",
          heard_about: team.team.heard_about ?? "",
          anything_to_add: team.team.anything_to_add ?? "",
          created_at: team.team.created_at,
          member_is_leader: "",
          full_name: "",
          email: "",
          phone: "",
          discord: "",
          linkedin: "",
          university: "",
          field_of_study: "",
          year_of_study: "",
          software_tools: "",
          member_created_at: "",
        },
      ];
    }

    return team.members.map((member) => ({
      team_id: team.team.id,
      team_name: team.team.team_name,
      team_status: statusLabels[team.status],
      wilaya: team.team.wilaya,
      num_members: team.team.num_members,
      different_universities: formatBoolean(team.team.different_universities),
      can_attend_physically: formatBoolean(team.team.can_attend_physically),
      participated_before: formatBoolean(team.team.participated_before),
      participation_experience: team.team.participation_experience ?? "",
      hands_on_experience: formatBoolean(team.team.hands_on_experience),
      hands_on_details: team.team.hands_on_details ?? "",
      motivation: team.team.motivation ?? "",
      heard_about: team.team.heard_about ?? "",
      anything_to_add: team.team.anything_to_add ?? "",
      created_at: team.team.created_at,
      member_is_leader: member.is_leader ? "Yes" : "No",
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      discord: member.discord,
      linkedin: member.linkedin,
      university: member.university,
      field_of_study: member.field_of_study,
      year_of_study: member.year_of_study,
      software_tools: formatSoftwareTools(member.software_tools),
      member_created_at: member.created_at,
    }));
  });

const statusBadge = (status: TeamStatus) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusStyles[status]}`}>
    {statusLabels[status]}
  </span>
);

const MemberLink = ({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) => {
  if (!href || href === "#") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-[#1B4D80]/30 hover:text-[#1B4D80]"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, TeamStatus>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | TeamStatus>("all");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [isPending, startTransition] = useTransition();

  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    if (!getAdminSession()) {
      router.replace(ADMIN_LOGIN_PATH);
      return;
    }

    setIsReady(true);
  }, [router]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
  }, [isReady]);

  const loadDashboardData = async (showToast = false) => {
    const supabase = getSupabaseClient() as any;

    if (!supabase) {
      setErrorMessage("Missing Supabase environment variables.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setErrorMessage(null);

      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (teamError) {
        throw teamError;
      }

      const teamRows = (teamData ?? []) as TeamRow[];
      const teamIds = teamRows.map((team) => team.id);

      setStatusMap(
        teamRows.reduce<Record<string, TeamStatus>>((accumulator, team) => {
          accumulator[String(team.id)] = team.status ?? "pending";
          return accumulator;
        }, {})
      );

      let memberRows: MemberRow[] = [];

      if (teamIds.length > 0) {
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("*")
          .in("team_id", teamIds);

        if (memberError) {
          throw memberError;
        }

        memberRows = (memberData ?? []) as MemberRow[];
      }

      setTeams(teamRows);
      setMembers(memberRows);

      if (showToast) {
        toast.success("Dashboard refreshed");
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to fetch dashboard data.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const teamMap = useMemo(() => {
    const map = new Map<number, MemberRow[]>();

    members.forEach((member) => {
      const existing = map.get(member.team_id) ?? [];
      existing.push(member);
      map.set(member.team_id, existing);
    });

    return map;
  }, [members]);

  const dashboardTeams = useMemo<DashboardTeam[]>(() => {
    return teams.map((team) => {
      const teamMembers = teamMap.get(team.id) ?? [];
      const status = statusMap[String(team.id)] ?? "pending";
      const searchIndex = [team.team_name, team.wilaya, ...teamMembers.map((member) => member.university), ...teamMembers.map((member) => member.field_of_study)]
        .join(" ")
        .toLowerCase();

      return {
        team,
        members: teamMembers,
        status,
        searchIndex,
      };
    });
  }, [statusMap, teams, teamMap]);

  const visibleTeams = useMemo(() => {
    const trimmedSearch = deferredSearch.trim().toLowerCase();

    return dashboardTeams.filter((entry) => {
      const matchesFilter = activeFilter === "all" ? true : entry.status === activeFilter;
      const matchesSearch = trimmedSearch.length === 0 ? true : entry.searchIndex.includes(trimmedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, dashboardTeams, deferredSearch]);

  const selectedTeam = selectedTeamId === null ? null : dashboardTeams.find((entry) => entry.team.id === selectedTeamId) ?? null;
  const selectedMembers = selectedTeam?.members ?? [];
  const selectedStatus = selectedTeam ? statusMap[String(selectedTeam.team.id)] ?? "pending" : "pending";

  const stats = useMemo(() => {
    const totals = dashboardTeams.reduce(
      (accumulator, entry) => {
        accumulator.total += 1;
        accumulator[entry.status] += 1;
        return accumulator;
      },
      { total: 0, pending: 0, accepted: 0, rejected: 0 }
    );

    return totals;
  }, [dashboardTeams]);

  const updateStatus = (teamId: number, nextStatus: TeamStatus) => {
    startTransition(async () => {
      setStatusMap((current) => ({
        ...current,
        [String(teamId)]: nextStatus,
      }));

      const supabase = getSupabaseClient() as any;

      if (!supabase) {
        toast.error("Supabase client is unavailable.");
        return;
      }

      const { error } = await supabase.rpc("update_team_status", {
        p_team_id: teamId,
        p_status: nextStatus,
      });

      if (error) {
        toast.error(error.message ?? "Failed to save status.");
        setStatusMap((current) => {
          const fallbackStatus = teams.find((team) => team.id === teamId)?.status ?? "pending";

          return {
            ...current,
            [String(teamId)]: fallbackStatus,
          };
        });
        return;
      }

      toast.success(`Marked as ${statusLabels[nextStatus].toLowerCase()}`);
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData(true);
  };

  const exportTeams = (status: "all" | TeamStatus) => {
    const exportSet = visibleTeams.length > 0 ? visibleTeams : dashboardTeams;
    const scopedTeams = status === "all" ? exportSet : exportSet.filter((entry) => entry.status === status);

    if (scopedTeams.length === 0) {
      toast.error("No teams match the current export filter.");
      return;
    }

    downloadCsv(
      `aec-teams-${status}-${new Date().toISOString().slice(0, 10)}.csv`,
      flattenTeamsForExport(scopedTeams)
    );

    toast.success(`Exported ${status === "all" ? "all teams" : statusLabels[status].toLowerCase()} teams`);
  };

  const goToLogin = () => {
    clearAdminSession();
    router.replace(ADMIN_LOGIN_PATH);
  };

  const columns: ColumnDef<DashboardTeam>[] = [
    {
      accessorKey: "team.team_name",
      header: "Team",
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">{row.original.team.team_name}</p>
          <p className="text-xs text-slate-500">{row.original.members.length} connected members</p>
        </div>
      ),
    },
    {
      accessorKey: "team.wilaya",
      header: "Wilaya",
      cell: ({ row }) => <span className="text-slate-700">{row.original.team.wilaya}</span>,
    },
    {
      accessorKey: "team.num_members",
      header: "Members",
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.team.num_members}</span>,
    },
    {
      accessorKey: "team.created_at",
      header: "Created at",
      cell: ({ row }) => <span className="text-slate-500">{formatDateTime(row.original.team.created_at)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateStatus(row.original.team.id, "accepted");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Accept
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateStatus(row.original.team.id, "rejected");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateStatus(row.original.team.id, "pending");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
          >
            <CircleDashed className="h-3.5 w-3.5" />
            Pending
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: visibleTeams,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const detailFields = selectedTeam
    ? [
        ["Team name", selectedTeam.team.team_name],
        ["Wilaya", selectedTeam.team.wilaya],
        ["Members", String(selectedTeam.team.num_members)],
        ["Different universities", formatBoolean(selectedTeam.team.different_universities)],
        ["Can attend physically", formatBoolean(selectedTeam.team.can_attend_physically)],
        ["Participated before", formatBoolean(selectedTeam.team.participated_before)],
        ["Hands-on experience", formatBoolean(selectedTeam.team.hands_on_experience)],
        ["Heard about", selectedTeam.team.heard_about ?? ""],
        ["Created at", formatDateTime(selectedTeam.team.created_at)],
      ]
    : [];

  const tableIsEmpty = !loading && visibleTeams.length === 0;

  if (!isReady) {
    return (
      <main className={`${adminFontClass} min-h-screen bg-[#F4F6FF] text-slate-900`}>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-5 shadow-[0_25px_80px_rgba(27,77,128,0.12)] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-[#1B4D80]" />
              Preparing admin session...
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${adminFontClass} min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(27,77,128,0.18),_transparent_28%),linear-gradient(180deg,#F4F6FF_0%,#EEF3FF_100%)] text-slate-900`}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <motion.section
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-[0_22px_80px_rgba(27,77,128,0.12)] backdrop-blur-xl sm:p-6"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(27,77,128,0.08),transparent_40%,rgba(255,255,255,0.7))]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#1B4D80]">
                <ShieldCheck className="h-3.5 w-3.5" />
                AEC admin control center
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Professional competition operations, tuned for fast review.
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Review teams, inspect full registrations, update statuses instantly, and export CSVs without leaving the page.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-[#1B4D80]/15 bg-white px-4 py-2 text-sm font-semibold text-[#1B4D80] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Live refresh
              </button>
              <button
                type="button"
                onClick={goToLogin}
                className="inline-flex items-center gap-2 rounded-full bg-[#1B4D80] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(27,77,128,0.25)] transition hover:-translate-y-0.5 hover:bg-[#163f69]"
              >
                <ArrowLeft className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </motion.section>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            const value = stats[stat.key];

            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(27,77,128,0.08)] backdrop-blur-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.tone} opacity-[0.08] transition group-hover:opacity-[0.12]`} />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white p-3 shadow-sm">
                    <Icon className="h-5 w-5 text-[#1B4D80]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-5 rounded-[32px] border border-white/70 bg-white/80 p-4 shadow-[0_22px_80px_rgba(27,77,128,0.10)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Search teams</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner transition focus-within:border-[#1B4D80]/30 focus-within:bg-white">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by team name, wilaya, or university"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Filters</label>
                <div className="flex flex-wrap gap-2">
                  {filterTabs.map((tab) => {
                    const active = activeFilter === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFilter(tab.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? "border-[#1B4D80] bg-[#1B4D80] text-white shadow-[0_12px_30px_rgba(27,77,128,0.25)]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#1B4D80]/25 hover:text-[#1B4D80]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[420px]">
              <button
                type="button"
                onClick={() => exportTeams("all")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1B4D80]/25 hover:text-[#1B4D80]"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Export all CSV
              </button>
              <button
                type="button"
                onClick={() => exportTeams("accepted")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <Download className="h-4 w-4" />
                Accepted CSV
              </button>
              <button
                type="button"
                onClick={() => exportTeams("rejected")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <Download className="h-4 w-4" />
                Rejected CSV
              </button>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
            {errorMessage}
          </div>
        ) : null}

        <section className="mt-5 flex-1 rounded-[32px] border border-white/70 bg-white/80 p-4 shadow-[0_22px_80px_rgba(27,77,128,0.10)] backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Teams table</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Review queue</h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-4 animate-pulse rounded-full bg-slate-200" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-3xl border border-slate-200 bg-slate-100/90" />
              ))}
            </div>
          ) : null}

          {!loading && tableIsEmpty ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
              <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                <Filter className="h-6 w-6 text-[#1B4D80]" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">No teams match the current view</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Try a different search term or switch to the full queue to review the submitted registrations.
              </p>
            </div>
          ) : null}

          {!loading && visibleTeams.length > 0 ? (
            <>
              <div className="hidden overflow-hidden rounded-[28px] border border-slate-200/80 bg-white md:block">
                <div className="max-h-[720px] overflow-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b border-slate-200">
                          {headerGroup.headers.map((header) => (
                            <th key={header.id} className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => {
                        const teamStatus = row.original.status;

                        return (
                          <motion.tr
                            key={row.id}
                            layout
                            onClick={() => setSelectedTeamId(row.original.team.id)}
                            className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
                              teamStatus === "accepted"
                                ? "bg-emerald-50/35"
                                : teamStatus === "rejected"
                                  ? "bg-rose-50/35"
                                  : "bg-amber-50/35"
                            }`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="px-5 py-4 align-middle">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-3 md:hidden">
                {visibleTeams.map((entry) => (
                  <div
                    key={entry.team.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open details for ${entry.team.team_name}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedTeamId(entry.team.id);
                      }
                    }}
                    onClick={() => setSelectedTeamId(entry.team.id)}
                    className={`group rounded-[28px] border p-4 text-left shadow-[0_18px_50px_rgba(27,77,128,0.08)] transition hover:-translate-y-0.5 ${
                      entry.status === "accepted"
                        ? "border-emerald-200 bg-emerald-50/60"
                        : entry.status === "rejected"
                          ? "border-rose-200 bg-rose-50/60"
                          : "border-amber-200 bg-amber-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-950">{entry.team.team_name}</h3>
                          {statusBadge(entry.status)}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{entry.team.wilaya}</p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Members</p>
                        <p className="mt-1 font-semibold text-slate-900">{entry.team.num_members}</p>
                      </div>
                      <div className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatDateTime(entry.team.created_at)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateStatus(entry.team.id, "accepted");
                        }}
                        className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateStatus(entry.team.id, "rejected");
                        }}
                        className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateStatus(entry.team.id, "pending");
                        }}
                        className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700"
                      >
                        Pending
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>

      <AnimatePresence>
        {selectedTeam ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-6"
            onClick={() => setSelectedTeamId(null)}
          >
            <motion.aside
              initial={{ x: 36, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 36, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="flex h-full w-full max-w-full flex-col overflow-hidden border-l border-white/40 bg-[#F4F6FF] shadow-[0_0_60px_rgba(15,23,42,0.18)] md:h-auto md:max-h-[88vh] md:max-w-[920px] md:rounded-[32px] md:border md:border-white/60"
            >
              <div className="border-b border-slate-200 bg-white/90 px-5 py-5 backdrop-blur-xl md:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1B4D80]">
                      Team detail drawer
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950">{selectedTeam.team.team_name}</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedTeam.team.wilaya} • {selectedTeam.team.num_members} members • {statusLabels[selectedStatus]}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(null)}
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(["overview", "members", "motivation"] as DetailTab[]).map((tab) => {
                    const active = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                          active
                            ? "bg-[#1B4D80] text-white shadow-[0_12px_30px_rgba(27,77,128,0.22)]"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-[#1B4D80]/25 hover:text-[#1B4D80]"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
                <div className="mb-5 rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(27,77,128,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</p>
                      <div className="mt-2">{statusBadge(selectedStatus)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(selectedTeam.team.id, "accepted")}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(selectedTeam.team.id, "rejected")}
                        className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(selectedTeam.team.id, "pending")}
                        className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                      >
                        Pending
                      </button>
                    </div>
                  </div>
                </div>

                {activeTab === "overview" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {detailFields.map(([label, value]) => (
                      <div key={label} className="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-[0_14px_40px_rgba(27,77,128,0.07)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-800">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {activeTab === "members" ? (
                  <div className="space-y-4">
                    {selectedMembers.length > 0 ? (
                      selectedMembers.map((member) => (
                        <div key={member.id} className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(27,77,128,0.08)]">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-slate-950">{member.full_name}</h3>
                                {member.is_leader ? (
                                  <span className="rounded-full border border-[#1B4D80]/15 bg-[#1B4D80]/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1B4D80]">
                                    Leader
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-slate-500">{member.university} • {member.field_of_study}</p>
                            </div>
                            <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                              Year {member.year_of_study}
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                            <p className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <Mail className="h-4 w-4 text-[#1B4D80]" />
                              {member.email}
                            </p>
                            <p className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <Phone className="h-4 w-4 text-[#1B4D80]" />
                              {member.phone}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <MemberLink href={toExternalHref(member.discord)} icon={MessageSquare} label="Discord" />
                            <MemberLink href={toExternalHref(member.linkedin)} icon={ExternalLink} label="LinkedIn" />
                          </div>

                          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Software tools</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {member.software_tools && member.software_tools.length > 0 ? (
                                member.software_tools.map((tool) => (
                                  <span
                                    key={`${member.id}-${tool}`}
                                    className="rounded-full border border-[#1B4D80]/10 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                                  >
                                    {tool}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-slate-500">No tools listed.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 p-8 text-center text-sm text-slate-500">
                        No member records were found for this team.
                      </div>
                    )}
                  </div>
                ) : null}

                {activeTab === "motivation" ? (
                  <div className="space-y-4">
                    <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(27,77,128,0.08)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Motivation</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {selectedTeam.team.motivation || "No motivation text provided."}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(27,77,128,0.08)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Participation experience</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {selectedTeam.team.participation_experience || "No previous participation details shared."}
                        </p>
                      </div>
                      <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(27,77,128,0.08)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Hands-on details</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {selectedTeam.team.hands_on_details || "No hands-on details provided."}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-[24px] border border-slate-200 bg-white/85 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Participated before</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{formatBoolean(selectedTeam.team.participated_before)}</p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-white/85 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hands-on experience</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{formatBoolean(selectedTeam.team.hands_on_experience)}</p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-white/85 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Heard about</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{selectedTeam.team.heard_about || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_14px_40px_rgba(27,77,128,0.08)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Anything else to add</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {selectedTeam.team.anything_to_add || "No additional note provided."}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isPending ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-[#1B4D80] shadow-[0_12px_30px_rgba(27,77,128,0.16)] backdrop-blur-xl">
          Updating status...
        </div>
      ) : null}
    </main>
  );
}
