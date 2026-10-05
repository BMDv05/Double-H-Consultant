import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../Modal.jsx';
import { useLang } from '../LangContext.jsx';
import {
  IconMail,
  IconDoc,
  IconRefresh,
  IconLogout,
  IconEye,
  IconCheck,
  IconTrash,
  IconClose,
  IconLock,
} from '../icons.jsx';

/* ---------- small helpers ---------- */
const fmtDate = (s) => (s || '').slice(0, 16).replace('T', ' ');

export default function Admin() {
  const { t, lang } = useLang();
  const [token, setToken] = useState(() =>
    sessionStorage.getItem('dh-admin-token'),
  );
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [tab, setTab] = useState('messages');
  const [data, setData] = useState({
    messages: [],
    stats: { total: 0, open: 0, processed: 0 },
  });
  const [audit, setAudit] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [netErr, setNetErr] = useState('');
  /* details modal: null | 'loading' | message object */
  const [detail, setDetail] = useState(null);
  const detailGeneration = useRef(0);
  const closeDetail = () => {
    detailGeneration.current += 1;
    setDetail(null);
  };
  /* delete confirmation: null | message object */
  const [confirmDel, setConfirmDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = useMemo(
    () =>
      token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        : {},
    [token],
  );

  /* ---------------- data loading ---------------- */
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages', { headers });
      if (res.status === 401) {
        sessionStorage.removeItem('dh-admin-token');
        setToken(null);
        return;
      }
      if (!res.ok) throw new Error();
      setData(await res.json());
      setNetErr('');
      const a = await fetch('/api/admin/audit', { headers });
      if (a.ok) setAudit((await a.json()).audit || []);
    } catch {
      setNetErr(t('admin_net'));
    } finally {
      setLoading(false);
    }
  }, [token, headers, t]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------------- auth ---------------- */
  const login = async (e) => {
    e.preventDefault();
    if (busy) return;
    setLoginErr('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginErr(t(res.status === 429 ? 'err_rate' : 'admin_err'));
        return;
      }
      sessionStorage.setItem('dh-admin-token', body.token);
      setToken(body.token);
    } catch {
      setLoginErr(t('admin_net'));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers });
    } catch {
      /* ignore */
    }
    sessionStorage.removeItem('dh-admin-token');
    setToken(null);
  };

  /* ---------------- request actions ---------------- */
  const openDetail = async (id) => {
    const generation = ++detailGeneration.current;
    setConfirmDel(null);
    setDetail('loading');
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { headers });
      if (res.status === 401) {
        sessionStorage.removeItem('dh-admin-token');
        setToken(null);
        setDetail(null);
        return;
      }
      if (!res.ok) throw new Error();
      const body = await res.json();
      if (generation === detailGeneration.current) setDetail(body.message);
    } catch {
      if (generation === detailGeneration.current) {
        setDetail(null);
        setNetErr(t('admin_net'));
      }
    }
  };

  const setStatusOf = async (id, next) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: next }),
      });
      if (res.status === 401) {
        sessionStorage.removeItem('dh-admin-token');
        setToken(null);
        return;
      }
      if (!res.ok) throw new Error();
      await load();
      setDetail((d) => (d && d.id === id ? { ...d, status: next } : d));
    } catch {
      setNetErr(t('admin_net'));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/messages/${confirmDel.id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.status === 401) {
        sessionStorage.removeItem('dh-admin-token');
        setToken(null);
        setConfirmDel(null);
        setDetail(null);
        return;
      }
      if (!res.ok) throw new Error();
      setConfirmDel(null);
      setDetail((d) => (d && d.id === confirmDel.id ? null : d));
      await load();
    } catch {
      setNetErr(t('admin_del_fail'));
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- login screen ---------------- */
  if (!token) {
    return (
      <section className="section login-page">
        <div className="eyebrow">{t('admin_restricted')}</div>
        <h1 className="page-title">{t('admin_title')}</h1>
        <p className="notice">{t('admin_sub')}</p>
        <div className="form-wrap login-box">
          <div className="login-icon">
            <IconLock />
          </div>
          <form onSubmit={login}>
            <label htmlFor="admin-email">{t('admin_email')}</label>
            <input
              type="email"
              id="admin-email"
              autoComplete="username"
              required
              dir="ltr"
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
            />
            <label htmlFor="admin-password">{t('admin_password')}</label>
            <input
              type="password"
              id="admin-password"
              autoComplete="current-password"
              required
              dir="ltr"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
            />
            <div className="err" role="alert">
              {loginErr}
            </div>
            <button className="btn btn-dark" disabled={busy}>
              {busy ? '…' : t('admin_login')}
            </button>
          </form>
        </div>
      </section>
    );
  }

  /* ---------------- dashboard ---------------- */
  const filtered = data.messages.filter((m) => {
    const qq = q.trim().toLowerCase();
    const matchQ =
      !qq ||
      (m.name + ' ' + m.email + ' ' + m.subject + ' ' + m.message)
        .toLowerCase()
        .includes(qq);
    const matchS = !status || m.status === status;
    return matchQ && matchS;
  });

  const stats = data.stats || {};

  return (
    <section className="section">
      <div className="eyebrow">{t('admin_restricted')}</div>
      <h1 className="page-title">{t('admin_title')}</h1>
      <p className="notice">{t('admin_sub')}</p>
      {netErr && (
        <p className="notice" role="alert">
          {netErr}
        </p>
      )}

      <div className="admin-shell">
        <div className="side">
          <button
            aria-pressed={tab === 'messages'}
            className={tab === 'messages' ? 'active' : ''}
            onClick={() => setTab('messages')}
          >
            <IconMail /> {t('admin_messages')}
          </button>
          <button
            aria-pressed={tab === 'audit'}
            className={tab === 'audit' ? 'active' : ''}
            onClick={() => setTab('audit')}
          >
            <IconDoc /> {t('admin_audit')}
          </button>
          <button onClick={load}>
            <IconRefresh /> {t('admin_refresh')}
          </button>
          <button onClick={logout}>
            <IconLogout /> {t('admin_logout')}
          </button>
        </div>

        <div className="panel" aria-busy={loading}>
          {loading && (
            <p role="status">
              {lang === 'ar' ? 'جارٍ التحميل…' : 'Loading messages…'}
            </p>
          )}
          {tab === 'messages' ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <b>{stats.total ?? 0}</b>
                  {t('admin_kpi_total')}
                </div>
                <div className="kpi">
                  <b>{stats.open ?? 0}</b>
                  {t('admin_kpi_open')}
                </div>
                <div className="kpi">
                  <b>{stats.processed ?? 0}</b>
                  {t('admin_kpi_done')}
                </div>
              </div>

              <div className="admin-filters">
                <select
                  aria-label={t('admin_status')}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">{t('admin_all')}</option>
                  <option value="Not Processed">
                    {t('admin_status_open')}
                  </option>
                  <option value="Processed">
                    {t('admin_status_processed')}
                  </option>
                </select>
                <input
                  aria-label={t('admin_search')}
                  placeholder={t('admin_search')}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin_from')}</th>
                      <th>{t('admin_subject')}</th>
                      <th>{t('admin_status')}</th>
                      <th>{t('admin_date')}</th>
                      <th>{t('admin_action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length ? (
                      filtered.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <b>{m.name}</b>
                            <br />
                            <small dir="ltr">
                              {m.email} [{m.lang}]
                            </small>
                          </td>
                          <td>
                            {m.subject}
                            <br />
                            <small>{m.message.slice(0, 90)}…</small>
                          </td>
                          <td>
                            <span
                              className={`status st-${m.status === 'Processed' ? 'processed' : 'open'}`}
                            >
                              {m.status === 'Processed'
                                ? t('admin_status_processed')
                                : t('admin_status_open')}
                            </span>
                          </td>
                          <td>
                            <small>{fmtDate(m.created_at)}</small>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="btn-sq"
                                aria-label={t('admin_view')}
                                title={t('admin_view')}
                                onClick={(event) => {
                                  event.currentTarget.focus();
                                  openDetail(m.id);
                                }}
                              >
                                <IconEye />
                              </button>
                              <button
                                className="btn-sq"
                                aria-label={
                                  m.status === 'Processed'
                                    ? t('admin_mark_open')
                                    : t('admin_mark_processed')
                                }
                                title={
                                  m.status === 'Processed'
                                    ? t('admin_mark_open')
                                    : t('admin_mark_processed')
                                }
                                disabled={busy}
                                onClick={() =>
                                  setStatusOf(
                                    m.id,
                                    m.status === 'Processed'
                                      ? 'Not Processed'
                                      : 'Processed',
                                  )
                                }
                              >
                                <IconCheck />
                              </button>
                              <button
                                className="btn-sq danger"
                                aria-label={t('admin_delete')}
                                title={t('admin_delete')}
                                onClick={(event) => {
                                  event.currentTarget.focus();
                                  setConfirmDel(m);
                                }}
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>
                          {loading
                            ? '…'
                            : q || status
                              ? t('admin_no_results')
                              : t('admin_empty')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t('admin_time')}</th>
                    <th>{t('admin_email')}</th>
                    <th>{t('admin_action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.length ? (
                    audit.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <small>
                            {(a.created_at || '')
                              .slice(0, 19)
                              .replace('T', ' ')}
                          </small>
                        </td>
                        <td>{a.actor}</td>
                        <td>
                          {a.action} · {a.entity}{' '}
                          {a.entity_id ? `#${a.entity_id}` : ''}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>{t('admin_empty')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= DETAILS MODAL ================= */}
      {detail && (
        <Modal onClose={closeDetail} titleId="message-title" busy={busy}>
          <div className="modal-head">
            <div>
              <div className="modal-eyebrow">{t('admin_details')}</div>
              <h3 id="message-title">
                {detail === 'loading' ? '…' : detail.subject}
              </h3>
            </div>
            <button
              className="modal-close"
              disabled={busy}
              onClick={closeDetail}
              aria-label={t('admin_close')}
            >
              <IconClose />
            </button>
          </div>

          {detail === 'loading' ? (
            <p className="section-lead">…</p>
          ) : (
            <>
              <div className="meta-grid">
                <div className="meta-item">
                  <b>{t('admin_client')}</b>
                  {detail.name}
                </div>
                <div className="meta-item">
                  <b>{t('admin_email')}</b>
                  <span dir="ltr">{detail.email}</span>
                </div>
                <div className="meta-item">
                  <b>{t('admin_lang')}</b>
                  {(detail.lang || 'en').toUpperCase()}
                </div>
                <div className="meta-item">
                  <b>{t('admin_created')}</b>
                  {fmtDate(detail.created_at)}
                </div>
                <div className="meta-item">
                  <b>{t('admin_status')}</b>
                  <span
                    className={`status st-${detail.status === 'Processed' ? 'processed' : 'open'}`}
                  >
                    {detail.status === 'Processed'
                      ? t('admin_status_processed')
                      : t('admin_status_open')}
                  </span>
                </div>
              </div>

              <div className="modal-body">
                <b>{t('admin_body')}</b>
                <p>{detail.message}</p>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-dark"
                  disabled={busy}
                  onClick={() =>
                    setStatusOf(
                      detail.id,
                      detail.status === 'Processed'
                        ? 'Not Processed'
                        : 'Processed',
                    )
                  }
                >
                  <IconCheck />
                  {detail.status === 'Processed'
                    ? t('admin_mark_open')
                    : t('admin_mark_processed')}
                </button>
                <button
                  className="btn btn-danger"
                  disabled={busy}
                  onClick={(event) => {
                    event.currentTarget.focus();
                    setConfirmDel(detail);
                  }}
                >
                  <IconTrash />
                  {t('admin_delete')}
                </button>
                <button
                  className="btn btn-quiet"
                  disabled={busy}
                  onClick={closeDetail}
                >
                  <IconClose />
                  {t('admin_close')}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {confirmDel && (
        <Modal
          onClose={() => setConfirmDel(null)}
          titleId="delete-title"
          descriptionId="delete-description"
          alert
          small
          busy={busy}
        >
          <div className="modal-head">
            <div>
              <div className="modal-eyebrow danger">{t('admin_delete')}</div>
              <h3 id="delete-title">{t('admin_del_title')}</h3>
            </div>
            <button
              className="modal-close"
              disabled={busy}
              onClick={() => setConfirmDel(null)}
              aria-label={t('admin_cancel')}
            >
              <IconClose />
            </button>
          </div>
          <p className="section-lead" id="delete-description">
            {t('admin_del_desc')}
          </p>
          <div className="del-preview">
            <b>{confirmDel.subject}</b>
            <small dir="ltr">
              {confirmDel.name} · {confirmDel.email}
            </small>
          </div>
          <div className="modal-actions">
            <button
              className="btn btn-danger"
              disabled={busy}
              onClick={doDelete}
            >
              <IconTrash />
              {t('admin_confirm_delete')}
            </button>
            <button
              className="btn btn-quiet"
              disabled={busy}
              onClick={() => setConfirmDel(null)}
            >
              {t('admin_cancel')}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
