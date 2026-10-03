import { useCallback, useEffect, useState } from 'react';
import { useLang } from '../LangContext.jsx';

const CONSULT_STATUSES = ['New', 'Contacted', 'Scheduled', 'Completed', 'Cancelled', 'Rejected'];

export default function Admin() {
  const { t } = useLang();
  const [token, setToken] = useState(() => sessionStorage.getItem('dh-admin-token'));
  const [creds, setCreds] = useState({ email: 'admin@doubleh.com', password: 'Admin123!' });
  const [loginErr, setLoginErr] = useState('');
  const [tab, setTab] = useState('consults');
  const [msgs, setMsgs] = useState({ messages: [], stats: { total: 0, new: 0, handled: 0 } });
  const [cons, setCons] = useState({ consultations: [], stats: { total: 0, new: 0, free: 0 } });
  const [audit, setAudit] = useState([]);
  const [q, setQ] = useState('');
  const [netErr, setNetErr] = useState('');

  const auth = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : {};

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [m, c, a] = await Promise.all([
        fetch('/api/admin/messages', { headers: auth }),
        fetch('/api/admin/consultations', { headers: auth }),
        fetch('/api/admin/audit', { headers: auth }),
      ]);
      if (m.status === 401 || c.status === 401) {
        sessionStorage.removeItem('dh-admin-token');
        setToken(null);
        return;
      }
      if (!m.ok || !c.ok) throw new Error();
      setMsgs(await m.json());
      setCons(await c.json());
      if (a.ok) setAudit((await a.json()).audit || []);
      setNetErr('');
    } catch {
      setNetErr(t('admin_net'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const login = async (e) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginErr(body.error || t('admin_err'));
        return;
      }
      sessionStorage.setItem('dh-admin-token', body.token);
      setToken(body.token);
    } catch {
      setLoginErr(t('admin_net'));
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers: auth });
    } catch {
      /* ignore */
    }
    sessionStorage.removeItem('dh-admin-token');
    setToken(null);
  };

  const patch = async (url, body) => {
    try {
      await fetch(url, { method: 'PATCH', headers: auth, body: JSON.stringify(body) });
      load();
    } catch {
      setNetErr(t('admin_net'));
    }
  };

  const exportCsv = () => {
    const rows = [
      ['ID', 'Name', 'Email', 'Phone', 'Free', 'Status', 'Note', 'Created'],
      ...cons.consultations.map((c) => [c.id, c.full_name, c.email, c.phone, c.is_first_free ? 'FREE' : 'paid', c.status, c.note, c.created_at]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'consultations.csv';
    a.click();
  };

  /* ---------------- login ---------------- */
  if (!token) {
    return (
      <section className="section">
        <div className="eyebrow">Restricted</div>
        <h2>{t('admin_title')}</h2>
        <p className="notice">{t('admin_sub')}</p>
        <div className="form-wrap">
          <form onSubmit={login}>
            <label>{t('admin_email')}</label>
            <input
              type="email"
              dir="ltr"
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
            />
            <label>{t('admin_password')}</label>
            <input
              type="password"
              dir="ltr"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
            />
            <div className="err">{loginErr}</div>
            <button className="btn btn-dark" style={{ marginTop: 10 }}>
              {t('admin_login')}
            </button>
          </form>
        </div>
      </section>
    );
  }

  /* ---------------- dashboard ---------------- */
  const filteredMsgs = msgs.messages.filter((m) => {
    const qq = q.toLowerCase();
    return !qq || (m.name + m.email + m.subject + m.message).toLowerCase().includes(qq);
  });
  const filteredCons = cons.consultations.filter((c) => {
    const qq = q.toLowerCase();
    return !qq || (c.full_name + c.email + c.phone + c.note).toLowerCase().includes(qq);
  });

  return (
    <section className="section">
      <div className="eyebrow">Restricted</div>
      <h2>{t('admin_title')}</h2>
      <p className="notice">{t('admin_sub')}</p>
      {netErr && (
        <p className="notice" style={{ color: '#b42318' }}>
          {netErr}
        </p>
      )}

      <div className="admin-shell">
        <div className="side">
          <button className={tab === 'consults' ? 'active' : ''} onClick={() => setTab('consults')}>
            {t('admin_consults')}
          </button>
          <button className={tab === 'messages' ? 'active' : ''} onClick={() => setTab('messages')}>
            {t('admin_messages')}
          </button>
          <button className={tab === 'audit' ? 'active' : ''} onClick={() => setTab('audit')}>
            {t('admin_audit')}
          </button>
          <button onClick={load}>↻ {t('admin_refresh')}</button>
          <button onClick={logout}>⏻ {t('admin_logout')}</button>
        </div>

        <div className="panel">
          {tab === 'consults' && (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <b>{cons.stats.total}</b>
                  {t('admin_kpi_total')}
                </div>
                <div className="kpi">
                  <b>{cons.stats.new}</b>
                  {t('admin_kpi_new')}
                </div>
                <div className="kpi">
                  <b>{cons.stats.free}</b>
                  {t('admin_kpi_free')}
                </div>
              </div>

              <div className="admin-filters">
                <input placeholder={t('admin_search')} value={q} onChange={(e) => setQ(e.target.value)} />
                <button className="btn btn-dark" style={{ padding: '9px 16px', fontSize: 13 }} onClick={exportCsv}>
                  {t('admin_export')}
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin_client')}</th>
                      <th>{t('admin_note')}</th>
                      <th>{t('admin_free')}</th>
                      <th>{t('admin_status')}</th>
                      <th>{t('admin_date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCons.length ? (
                      filteredCons.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <b>{c.full_name}</b>
                            <br />
                            <small dir="ltr">
                              {c.email}
                              <br />
                              {c.phone}
                            </small>
                          </td>
                          <td>
                            <small>{c.note.slice(0, 100)}</small>
                          </td>
                          <td>{c.is_first_free ? t('admin_free') : '—'}</td>
                          <td>
                            <select
                              className={`status st-${c.status}`}
                              value={c.status}
                              onChange={(e) => patch(`/api/admin/consultations/${c.id}`, { status: e.target.value })}
                            >
                              {CONSULT_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <small>{(c.created_at || '').slice(0, 16).replace('T', ' ')}</small>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>{t('admin_empty')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'messages' && (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <b>{msgs.stats.total}</b>
                  {t('admin_kpi_total')}
                </div>
                <div className="kpi">
                  <b>{msgs.stats.new}</b>
                  {t('admin_kpi_new')}
                </div>
                <div className="kpi">
                  <b>{msgs.stats.handled}</b>
                  {t('admin_kpi_handled')}
                </div>
              </div>

              <div className="admin-filters">
                <input placeholder={t('admin_search')} value={q} onChange={(e) => setQ(e.target.value)} />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin_from')}</th>
                      <th>{t('admin_subject')}</th>
                      <th>{t('admin_status')}</th>
                      <th>{t('admin_date')}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMsgs.length ? (
                      filteredMsgs.map((m) => (
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
                            <small>{m.message.slice(0, 90)}</small>
                          </td>
                          <td>
                            <span className={`status st-${m.status}`}>{m.status}</span>
                          </td>
                          <td>
                            <small>{(m.created_at || '').slice(0, 16).replace('T', ' ')}</small>
                          </td>
                          <td>
                            {m.status === 'New' && (
                              <button onClick={() => patch(`/api/admin/messages/${m.id}`, { status: 'Handled' })}>
                                {t('admin_mark')}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5}>{t('admin_empty')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'audit' && (
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
                          <small>{(a.created_at || '').slice(0, 19).replace('T', ' ')}</small>
                        </td>
                        <td>{a.actor}</td>
                        <td>
                          {a.action} · {a.entity} {a.entity_id ? `#${a.entity_id}` : ''}
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
    </section>
  );
}
