import { Activity, ArrowUpRight, Calculator, FileJson, Github, RotateCcw, Send } from "lucide-react";
import React from "react";
import { useMemo, useState } from "react";

const initialForm = {
  person_age: 30,
  person_income: 70000,
  person_home_ownership: "MORTGAGE",
  person_emp_length: 5,
  loan_intent: "PERSONAL",
  loan_grade: "B",
  loan_amnt: 12000,
  loan_int_rate: 11.5,
  loan_percent_income: 0.17,
  cb_person_default_on_file: "N",
  cb_person_cred_hist_length: 6
};

const selectOptions = {
  person_home_ownership: ["RENT", "OWN", "MORTGAGE", "OTHER"],
  loan_intent: ["PERSONAL", "EDUCATION", "MEDICAL", "VENTURE", "HOMEIMPROVEMENT", "DEBTCONSOLIDATION"],
  loan_grade: ["A", "B", "C", "D", "E", "F", "G"],
  cb_person_default_on_file: ["N", "Y"]
};

function fallbackScore(data) {
  const gradeMap = { A: 0.18, B: 0.11, C: 0.02, D: -0.1, E: -0.18, F: -0.25, G: -0.32 };
  const homeMap = { OWN: 0.08, MORTGAGE: 0.05, RENT: -0.03, OTHER: -0.06 };
  const defaultPenalty = data.cb_person_default_on_file === "Y" ? -0.18 : 0.07;
  const incomeScore = Math.min(Number(data.person_income) / 120000, 1) * 0.2;
  const burden = Math.min(Number(data.loan_percent_income), 0.65) * -0.42;
  const rate = Math.min(Number(data.loan_int_rate) / 40, 1) * -0.18;
  const history = Math.min(Number(data.cb_person_cred_hist_length) / 20, 1) * 0.1;
  const employment = Math.min(Number(data.person_emp_length) / 12, 1) * 0.08;
  const amount = Math.min(Number(data.loan_amnt) / Math.max(Number(data.person_income), 1), 1) * -0.12;
  const raw = 0.54 + incomeScore + burden + rate + history + employment + amount + defaultPenalty + (gradeMap[data.loan_grade] || 0) + (homeMap[data.person_home_ownership] || 0);
  return Math.max(0.04, Math.min(0.96, raw));
}

function toNumberValue(value) {
  return value === "" ? "" : Number(value);
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(() => {
    const approved = fallbackScore(initialForm);
    return { prob_approved: approved, prob_default: 1 - approved, source: "Local model preview" };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const riskBand = useMemo(() => {
    const score = result.prob_approved;
    if (score >= 0.7) return { label: "Low risk", className: "low-risk" };
    if (score >= 0.4) return { label: "Review", className: "review-risk" };
    return { label: "High risk", className: "high-risk" };
  }, [result]);

  const payload = useMemo(() => JSON.stringify(form, null, 2), [form]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error("Prediction endpoint unavailable");
      const data = await response.json();
      setResult({
        prob_approved: Number(data.prob_approved),
        prob_default: Number(data.prob_default),
        source: "Backend prediction"
      });
    } catch {
      const approved = fallbackScore(form);
      setResult({ prob_approved: approved, prob_default: 1 - approved, source: "Local model preview" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    const approved = fallbackScore(initialForm);
    setForm(initialForm);
    setResult({ prob_approved: approved, prob_default: 1 - approved, source: "Local model preview" });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">LA</div>
          <div>
            <strong>Loan Approval Prediction</strong>
            <span>Credit risk scoring workspace</span>
          </div>
        </div>
        <nav className="header-links" aria-label="Project links">
          <a href="https://www.kaggle.com/competitions/playground-series-s4e10" target="_blank" rel="noreferrer">
            Kaggle <ArrowUpRight size={15} />
          </a>
          <a href="https://github.com/armanvardanyan07/Loan-Approval-Prediction" target="_blank" rel="noreferrer">
            GitHub <Github size={15} />
          </a>
        </nav>
      </header>

      <main className="workspace">
        <section className="form-surface">
          <div className="section-title">
            <div>
              <p>Application input</p>
              <h1>Borrower and loan profile</h1>
            </div>
            <span>11 features</span>
          </div>

          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Borrower</legend>
              <div className="field-grid">
                <label>
                  <span>Age</span>
                  <input type="number" min="18" max="100" value={form.person_age} onChange={(event) => updateField("person_age", toNumberValue(event.target.value))} required />
                </label>
                <label>
                  <span>Annual income</span>
                  <input type="number" min="0" value={form.person_income} onChange={(event) => updateField("person_income", toNumberValue(event.target.value))} required />
                </label>
                <label>
                  <span>Employment length</span>
                  <input type="number" min="0" max="60" step="0.5" value={form.person_emp_length} onChange={(event) => updateField("person_emp_length", toNumberValue(event.target.value))} required />
                </label>
                <label>
                  <span>Home ownership</span>
                  <select value={form.person_home_ownership} onChange={(event) => updateField("person_home_ownership", event.target.value)}>
                    {selectOptions.person_home_ownership.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Loan terms</legend>
              <div className="field-grid">
                <label>
                  <span>Loan intent</span>
                  <select value={form.loan_intent} onChange={(event) => updateField("loan_intent", event.target.value)}>
                    {selectOptions.loan_intent.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>Loan grade</span>
                  <select value={form.loan_grade} onChange={(event) => updateField("loan_grade", event.target.value)}>
                    {selectOptions.loan_grade.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>Loan amount</span>
                  <input type="number" min="100" value={form.loan_amnt} onChange={(event) => updateField("loan_amnt", toNumberValue(event.target.value))} required />
                </label>
                <label>
                  <span>Interest rate</span>
                  <input type="number" min="1" max="40" step="0.01" value={form.loan_int_rate} onChange={(event) => updateField("loan_int_rate", toNumberValue(event.target.value))} required />
                </label>
                <label>
                  <span>Loan to income ratio</span>
                  <input type="number" min="0" max="1" step="0.01" value={form.loan_percent_income} onChange={(event) => updateField("loan_percent_income", toNumberValue(event.target.value))} required />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Credit history</legend>
              <div className="field-grid compact">
                <label>
                  <span>Prior default on file</span>
                  <select value={form.cb_person_default_on_file} onChange={(event) => updateField("cb_person_default_on_file", event.target.value)}>
                    {selectOptions.cb_person_default_on_file.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>Credit history length</span>
                  <input type="number" min="0" max="50" value={form.cb_person_cred_hist_length} onChange={(event) => updateField("cb_person_cred_hist_length", toNumberValue(event.target.value))} required />
                </label>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="secondary" onClick={resetForm}>
                <RotateCcw size={16} /> Reset
              </button>
              <button type="submit" disabled={isSubmitting}>
                <Send size={16} /> {isSubmitting ? "Scoring" : "Score application"}
              </button>
            </div>
          </form>
        </section>

        <aside className="side-panel">
          <section className="decision">
            <div className="decision-head">
              <div>
                <p>Decision support</p>
                <h2>{riskBand.label}</h2>
              </div>
              <span className={riskBand.className}>{Math.round(result.prob_approved * 100)}%</span>
            </div>
            <div className="meter" aria-label="Approval probability">
              <span style={{ width: `${result.prob_approved * 100}%` }} />
            </div>
            <dl>
              <div>
                <dt>Approval probability</dt>
                <dd>{(result.prob_approved * 100).toFixed(1)}%</dd>
              </div>
              <div>
                <dt>Default probability</dt>
                <dd>{(result.prob_default * 100).toFixed(1)}%</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{result.source}</dd>
              </div>
            </dl>
          </section>

          <section className="metrics">
            <div className="metric">
              <Activity size={17} />
              <div>
                <strong>58,645</strong>
                <span>training rows</span>
              </div>
            </div>
            <div className="metric">
              <Calculator size={17} />
              <div>
                <strong>39,098</strong>
                <span>test rows</span>
              </div>
            </div>
            <div className="metric">
              <FileJson size={17} />
              <div>
                <strong>14.24%</strong>
                <span>positive class share</span>
              </div>
            </div>
          </section>

          <section className="payload">
            <div className="payload-title">
              <span>Request payload</span>
              <code>POST /predict</code>
            </div>
            <pre>{payload}</pre>
          </section>
        </aside>
      </main>
    </div>
  );
}
