import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function Help() {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);

  const articles = useMemo(
    () => [
      {
        id: 1,
        category: "Getting started",
        question: "What does LUMEN analyze?",
        answer:
          "LUMEN analyzes aggregated workplace patterns such as communication activity, meeting load, workload intensity, and recovery conditions at the team level.",
      },
      {
        id: 2,
        category: "Causal intelligence",
        question: "How is causal reasoning different from correlation?",
        answer:
          "Correlation describes variables that move together. LUMEN separates a treatment, outcome, controlled factors, assumptions, and uncertainty so a relationship is examined as a causal hypothesis rather than automatically treated as causation.",
      },
      {
        id: 3,
        category: "Privacy",
        question: "Can LUMEN show an employee's messages?",
        answer:
          "The current architecture is designed around aggregated team-level signals and does not expose raw employee messages, individual burnout scores, or employee rankings.",
      },
      {
        id: 4,
        category: "What-If",
        question: "What is a counterfactual scenario?",
        answer:
          "A counterfactual asks what the modeled outcome could look like under a different team-level condition, such as reducing weekly meeting hours.",
      },
      {
        id: 5,
        category: "Experiments",
        question: "How do experiments work?",
        answer:
          "Experiments turn a causal hypothesis into a measurable intervention with an explicit baseline, target condition, observation window, and outcome tracking.",
      },
      {
        id: 6,
        category: "Demo environment",
        question: "Is the current workplace data real?",
        answer:
          "No. The current LUMEN demonstration uses synthetic workplace data so the product can be evaluated without connecting to private employee communication systems.",
      },
    ],
    []
  );

  const filteredArticles = articles.filter((article) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      article.question.toLowerCase().includes(query) ||
      article.answer.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query)
    );
  });

  return (
    <section className="help-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">SUPPORT</div>
          <h1>Help</h1>
          <p>
            Understand how LUMEN works, how its privacy boundary is applied,
            and how to interpret its analytical views.
          </p>
        </div>
      </div>

      <div className="help-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search LUMEN documentation"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="overview-grid">
        <div className="overview-panel help-intro">
          <div className="help-intro-icon">
            <CircleHelp size={23} />
          </div>

          <span className="panel-kicker">LUMEN GUIDE</span>
          <h2>Understand the system</h2>
          <p>
            LUMEN is built around three ideas: observe workplace patterns at
            the team level, reason about potential causes, and explore
            interventions without exposing individual employees.
          </p>

          <div className="help-guide-links">
            <button type="button">
              <BookOpen size={16} />
              Product guide
              <ExternalLink size={14} />
            </button>

            <button type="button">
              <MessageCircle size={16} />
              Contact support
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        <div className="overview-panel help-principles">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">CORE PRINCIPLES</span>
              <h2>How to read LUMEN</h2>
            </div>

            <ShieldCheck size={18} />
          </div>

          <div className="help-principle">
            <span>01</span>
            <div>
              <strong>Signals are not diagnoses</strong>
              <p>
                A signal indicates a measurable team-level pattern that may
                deserve investigation.
              </p>
            </div>
          </div>

          <div className="help-principle">
            <span>02</span>
            <div>
              <strong>Causal estimates have assumptions</strong>
              <p>
                Interpret an effect estimate together with its uncertainty and
                stated assumptions.
              </p>
            </div>
          </div>

          <div className="help-principle">
            <span>03</span>
            <div>
              <strong>Privacy is part of the architecture</strong>
              <p>
                The current demo keeps analytics at the team level rather than
                exposing individual employee activity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overview-panel help-faq">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">DOCUMENTATION</span>
            <h2>Frequently asked questions</h2>
          </div>

          <span>{filteredArticles.length} articles</span>
        </div>

        <div className="faq-list">
          {filteredArticles.map((article) => {
            const isOpen = openId === article.id;

            return (
              <div className="faq-item" key={article.id}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() =>
                    setOpenId(isOpen ? null : article.id)
                  }
                >
                  <div>
                    <span>{article.category}</span>
                    <strong>{article.question}</strong>
                  </div>

                  <ChevronDown
                    size={18}
                    className={isOpen ? "faq-chevron-open" : ""}
                  />
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>{article.answer}</p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="empty-state">
              No documentation matches your search.
            </div>
          )}
        </div>
      </div>

      <div className="privacy-strip">
        <div className="privacy-strip-icon">
          <ShieldCheck size={18} />
        </div>

        <div>
          <strong>Interpretation matters</strong>
          <p>
            LUMEN's analytical outputs are intended to surface team-level
            patterns and hypotheses. The current data and model values are
            synthetic demonstration content.
          </p>
        </div>
      </div>
    </section>
  );
}