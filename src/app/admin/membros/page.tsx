"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";

type Respondent = {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  department: string | null;
  responseCount: number;
  createdAt: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Respondent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadMembers();
  }, [debouncedSearch]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const url = debouncedSearch
        ? `/api/respondents?search=${encodeURIComponent(debouncedSearch)}`
        : "/api/respondents";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao carregar membros");
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getParticipationBadge = (count: number) => {
    if (count >= 10) {
      return (
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Participativo
        </span>
      );
    } else if (count >= 3) {
      return (
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          Ocasional
        </span>
      );
    } else {
      return (
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
          Inativo
        </span>
      );
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-display-sm font-semibold text-[var(--text-primary)]">
            Membros
          </h1>
          <p className="text-body text-[var(--text-secondary)]">
            Visualize fichas individuais e histórico de participação dos membros.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card padding="lg">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-[var(--text-secondary)]" />
          <Input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!loading && members.length === 0 && (
        <Card padding="xl" className="text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-[var(--text-secondary)]" />
          <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
            Nenhum membro encontrado
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {search
              ? "Tente ajustar sua busca."
              : "Nenhum membro respondeu aos formulários ainda."}
          </p>
        </Card>
      )}

      {/* Table */}
      {!loading && members.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--border)] bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-[var(--text-secondary)]">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-[var(--text-secondary)]">
                    Respostas
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-[var(--text-secondary)]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {member.name}
                        </p>
                        {member.employeeId && (
                          <p className="text-sm text-[var(--text-secondary)]">
                            ID: {member.employeeId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {member.department || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {member.responseCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getParticipationBadge(member.responseCount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/membros/${member.id}`}>
                        <Button variant="secondary" size="sm">
                          Ver Ficha
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && members.length > 0 && (
        <div className="text-center text-sm text-[var(--text-secondary)]">
          Total: {members.length} {members.length === 1 ? "membro" : "membros"}
        </div>
      )}
    </div>
  );
}
