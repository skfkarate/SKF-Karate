"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaRegStar,
  FaStar,
  FaTrash,
} from "react-icons/fa"
import { TOURNAMENT_LEVEL_LABELS } from "@/lib/types/tournament"

export default function AdminResultsPageClient({ initialTournaments, canManage = false }) {
  const [tournaments, setTournaments] = useState(initialTournaments)
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notification, setNotification] = useState("")

  const filtered = useMemo(() => {
    return tournaments.filter((tournament) => {
      const matchesSearch =
        !search ||
        tournament.name.toLowerCase().includes(search.toLowerCase())
      const matchesLevel =
        levelFilter === "all" || tournament.level === levelFilter

      return matchesSearch && matchesLevel
    })
  }, [levelFilter, search, tournaments])

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  function flash(message) {
    setNotification(message)
    window.setTimeout(() => setNotification(""), 3000)
  }

  async function updateTournament(id, patch, successMessage) {
    const response = await fetch(`/api/admin/results/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    })

    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload.error || "Could not update tournament")
    }

    setTournaments((previous) =>
      previous.map((tournament) =>
        tournament.id === id ? payload.tournament : tournament
      )
    )
    flash(successMessage)
  }

  async function togglePublished(id) {
    const tournament = tournaments.find((entry) => entry.id === id)
    if (!tournament) return

    try {
      await updateTournament(
        id,
        { isPublished: !tournament.isPublished },
        "Published status updated"
      )
    } catch (error) {
      flash(error.message)
    }
  }

  async function toggleFeatured(id) {
    const tournament = tournaments.find((entry) => entry.id === id)
    if (!tournament) return

    try {
      await updateTournament(
        id,
        { isFeatured: !tournament.isFeatured },
        "Featured status updated"
      )
    } catch (error) {
      flash(error.message)
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/admin/results/${id}`, {
        method: "DELETE",
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Could not delete tournament")
      }

      setTournaments((previous) =>
        previous.filter((tournament) => tournament.id !== id)
      )
      setDeleteTarget(null)
      flash("Tournament deleted")
    } catch (error) {
      flash(error.message)
    }
  }

  return (
    <div className="admin-results">
      <div className="container">
        {notification ? <div className="admin-notification">{notification}</div> : null}

        <div className="admin-results__header">
          <div>
            <p className="admin-results__eyebrow">SKF Admin</p>
            <h1 className="admin-results__title">Tournament Results</h1>
            <p className="admin-results__subtitle">
              Manage published result pages and internal tournament records.
            </p>
          </div>
          {canManage ? (
            <Link href="/admin/results/new" className="admin-results__create-btn">
              <FaPlus />
              <span>Log Tournament</span>
            </Link>
          ) : null}
        </div>

        <div className="admin-toolbar">
          <div className="admin-toolbar__search">
            <label className="admin-toolbar__label" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="admin-toolbar__input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tournaments"
            />
          </div>

          <div className="admin-toolbar__filter">
            <label className="admin-toolbar__label" htmlFor="level-filter">
              Level
            </label>
            <select
              id="level-filter"
              className="admin-toolbar__select"
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
            >
              <option value="all">All levels</option>
              {Object.entries(TOURNAMENT_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Level</th>
                <th>Date</th>
                <th>Venue</th>
                <th>SKF</th>
                <th>Medals</th>
                <th>Published</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="admin-table__empty">
                    No tournaments matched the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tournament) => (
                  <tr key={tournament.id}>
                    <td>
                      <div className="admin-table__primary">
                        <span>{tournament.name}</span>
                        <small>{tournament.slug}</small>
                      </div>
                    </td>
                    <td>{TOURNAMENT_LEVEL_LABELS[tournament.level]}</td>
                    <td>{formatDate(tournament.date)}</td>
                    <td>
                      {tournament.venue}, {tournament.city}
                    </td>
                    <td>{tournament.skfParticipants}</td>
                    <td>
                      <div className="admin-table__medals">
                        <span className="admin-table__medal-g">
                          {tournament.medals.gold}G
                        </span>
                        <span className="admin-table__medal-s">
                          {tournament.medals.silver}S
                        </span>
                        <span className="admin-table__medal-b">
                          {tournament.medals.bronze}B
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-table__status ${
                          tournament.isPublished
                            ? "admin-table__status--yes"
                            : "admin-table__status--no"
                        }`}
                      >
                        {tournament.isPublished ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-table__status ${
                          tournament.isFeatured
                            ? "admin-table__status--yes"
                            : "admin-table__status--no"
                        }`}
                      >
                        {tournament.isFeatured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        {canManage ? (
                          <>
                            <Link
                              href={`/admin/results/${tournament.id}/edit`}
                              className="admin-table__action-btn"
                              aria-label="Edit tournament"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              className={`admin-table__action-btn ${
                                tournament.isPublished
                                  ? ""
                                  : "admin-table__action-btn--active"
                              }`}
                              onClick={() => togglePublished(tournament.id)}
                              aria-label={
                                tournament.isPublished ? "Unpublish" : "Publish"
                              }
                            >
                              {tournament.isPublished ? <FaEye /> : <FaEyeSlash />}
                            </button>
                            <button
                              className={`admin-table__action-btn ${
                                tournament.isFeatured
                                  ? "admin-table__action-btn--active"
                                  : ""
                              }`}
                              onClick={() => toggleFeatured(tournament.id)}
                              aria-label={
                                tournament.isFeatured ? "Unfeature" : "Feature"
                              }
                            >
                              {tournament.isFeatured ? <FaStar /> : <FaRegStar />}
                            </button>
                            <button
                              className="admin-table__action-btn admin-table__action-btn--danger"
                              onClick={() => setDeleteTarget(tournament)}
                              aria-label="Delete tournament"
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : (
                          <Link
                            href={tournament.isPublished ? `/results/${tournament.slug}` : "#"}
                            className="admin-table__action-btn"
                            aria-label="View tournament"
                          >
                            <FaEye />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget ? (
        <div
          className="admin-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Delete Tournament?</h3>
            <p>
              Are you sure you want to delete "{deleteTarget.name}"? This action
              cannot be undone.
            </p>
            <div className="admin-modal__actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleDelete(deleteTarget.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
