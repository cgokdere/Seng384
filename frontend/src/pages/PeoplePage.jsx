import { useEffect, useMemo, useState } from "react";
import { deletePerson, listPeople, updatePerson } from "../lib/api.js";
import Modal from "../components/Modal.jsx";
import { validateEmail, validateFullName } from "../lib/validation.js";
import { Link } from "react-router-dom";

function formatApiError(err) {
  const code = err?.data?.error;
  if (err?.status === 409 && code === "EMAIL_ALREADY_EXISTS") return "Email already exists.";
  if (err?.status === 404 && code === "NOT_FOUND") return "Record not found.";
  if (err?.status === 400) return "Validation error.";
  return "Server error.";
}

export default function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPeople();
      setPeople(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const editErrors = useMemo(() => {
    const fullNameError = validateFullName(editFullName);
    const emailError = validateEmail(editEmail);
    return { fullNameError, emailError, hasAny: !!(fullNameError || emailError) };
  }, [editFullName, editEmail]);

  function openEdit(person) {
    setEditing(person);
    setEditFullName(person.full_name);
    setEditEmail(person.email);
  }

  async function onSaveEdit() {
    if (!editing) return;
    if (editErrors.hasAny) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePerson(editing.id, {
        full_name: editFullName.trim(),
        email: editEmail.trim(),
      });
      setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditing(null);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePerson(deletingId);
      setPeople((prev) => prev.filter((p) => p.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>People</h1>
          <p className="muted">View, update, and delete registered people.</p>
        </div>
        <div className="row">
          <button className="btn btn-ghost" onClick={refresh} type="button" disabled={loading}>
            Refresh
          </button>
          <Link className="btn btn-primary btn-sm" to="/">
            Add new person
          </Link>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="card">
        {loading ? (
          <div className="muted">Loading...</div>
        ) : people.length === 0 ? (
          <div className="muted">No people yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th style={{ width: 190, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.id}</td>
                    <td>{p.full_name}</td>
                    <td className="mono">{p.email}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row right">
                        <button className="btn btn-ghost" type="button" onClick={() => openEdit(p)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => setDeletingId(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing ? (
        <Modal title={`Edit #${editing.id}`} onClose={() => (saving ? null : setEditing(null))}>
          <div className="stack">
            <div className="field">
              <label htmlFor="editFullName">Full Name</label>
              <input
                id="editFullName"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
              {editErrors.fullNameError ? (
                <div className="field-error">{editErrors.fullNameError}</div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="editEmail">Email</label>
              <input
                id="editEmail"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
              {editErrors.emailError ? (
                <div className="field-error">{editErrors.emailError}</div>
              ) : null}
            </div>

            <div className="row right">
              <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={onSaveEdit}
                disabled={saving || editErrors.hasAny}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {deletingId ? (
        <Modal title="Confirm deletion" onClose={() => (deleting ? null : setDeletingId(null))}>
          <div className="stack">
            <p>Are you sure you want to delete person #{deletingId}?</p>
            <div className="row right">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button className="btn btn-danger" type="button" onClick={onConfirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

