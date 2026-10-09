"use client";

import { useState } from "react";

export default function Home() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState("");

  async function search() {
    setError("");
    setResult(null);

    if (!registrationNumber.trim()) {
      setError("Please enter your registration number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNumber: registrationNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Certificate not found."
        );
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to connect to the certificate portal.");
    } finally {
      setLoading(false);
    }
  }

  async function download(type: string) {
    setDownloading(type);
    setError("");

    try {
      const response = await fetch("/api/certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNumber: registrationNumber.trim(),
          type,
        }),
      });

      if (!response.ok) {
        let message = "Unable to generate certificate.";

        try {
          const data = await response.json();
          message = data.error || data.message || message;
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      a.download =
        type === "ACHIEVEMENT"
          ? "DBTHON_2026_Achievement_Certificate.pdf"
          : "DBTHON_2026_Participation_Certificate.pdf";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Download failed."
      );
    } finally {
      setDownloading("");
    }
  }

  return (
    <main className="portal">
      {/* Background glow effects */}
      <div className="glow glowOne" />
      <div className="glow glowTwo" />

      <section className="hero">
        {/* VIT / SCOPE HEADER */}
        <div className="brandRow">
          <div className="vitMark">VIT</div>

          <div className="divider" />

          <div className="scope">
            <strong>School of Computer</strong>
            <strong>Science and Engineering</strong>
            <span>(SCOPE)</span>
          </div>
        </div>

        {/* DBTHON TITLE */}
        <div className="eyebrow">DBTHON 2026</div>

        <h1>Certificate Portal</h1>

        <p className="subtitle">
          Retrieve your official DBTHON 2026 certificate using your VIT
          registration number.
        </p>

        {/* DOWNLOAD LIMIT NOTICE */}
        <p className="downloadLimitNotice">
          Maximum <strong>2 certificate downloads</strong> are allowed per
          registration number.
        </p>

        {/* CREATOR CREDIT */}
        <div className="creatorCredit">
          <span>
            Made with{" "}
            <span className="heart">♥</span>{" "}
            by <span className="creatorName">Aditya Udiya</span>
          </span>

          <a
            href="https://www.linkedin.com/in/adityaudiya337315/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Aditya Udiya on LinkedIn"
            className="linkedinLink"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM3.56 8.99h3.56v11.46H3.56V8.99z" />
            </svg>

            <span>LinkedIn</span>
          </a>
        </div>

        {/* SEARCH CARD */}
        <div className="card">
          <label htmlFor="registration">
            Registration Number
          </label>

          <div className="inputRow">
            <input
              id="registration"
              type="text"
              value={registrationNumber}
              onChange={(e) =>
                setRegistrationNumber(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  search();
                }
              }}
              placeholder="e.g. 24BDS0024"
              autoComplete="off"
            />

            <button onClick={search} disabled={loading}>
              {loading ? "Searching..." : "Find Certificate"}
            </button>
          </div>

          <p className="hint">
            Your certificate type is determined automatically from the
            DBTHON records.
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* RESULTS */}
        {result && (
          <div className="results">
            {/* VERIFICATION MESSAGE */}
            <div className="verified">
              <span className="verifiedIcon">✓</span>

              <div>
                <strong>
                  Certificate eligibility verified
                </strong>

                {result.participant?.name && (
                  <small>{result.participant.name}</small>
                )}
              </div>
            </div>

            {/* DYNAMIC RESULT MESSAGE */}
            {result.achievements?.length > 0 ? (
              <div className="resultMessage achievementMessage">
                <div className="resultMessageIcon">🎉</div>

                <div>
                  <h3>Congratulations!</h3>

                  <p>
                    You have been awarded the{" "}
                    <strong>Best Project Award</strong> at DBTHON 2026.
                  </p>

                  <span>
                    Your participation and achievement certificate is available below.
                  </span>
                </div>
              </div>
            ) : (
              <div className="resultMessage participationMessage">
                <div className="resultMessageIcon">🎓</div>

                <div>
                  <h3>Thank you for participating!</h3>

                  <p>
                    We appreciate your participation in{" "}
                    <strong>DBTHON 2026</strong>.
                  </p>

                  <span>
                    Your participation certificate is available below.
                  </span>
                </div>
              </div>
            )}

            {/* CERTIFICATE CARDS */}
            <div className="certificateGrid">
              {/* PARTICIPATION CERTIFICATE */}
              {result.participant && (
                <div className="certificateCard">
                  <div className="cardIcon">✓</div>

                  <div className="certificateInfo">
                    <h2>Certificate of Participation</h2>

                    <p>
                      Official participation certificate for DBTHON 2026.
                    </p>
                  </div>

                  <button
                    onClick={() => download("PARTICIPATION")}
                    disabled={!!downloading}
                  >
                    {downloading === "PARTICIPATION"
                      ? "Generating..."
                      : "Download Certificate"}
                  </button>
                </div>
              )}

              {/* ACHIEVEMENT CERTIFICATES */}
              {result.achievements &&
                result.achievements.map((achievement: any) => (
                  <div
                    className="certificateCard achievement"
                    key={achievement.id}
                  >
                    <div className="cardIcon">★</div>

                    <div className="certificateInfo">
                      <h2>Certificate of Achievement</h2>

                      <p>
                      Official achievement certificate for DBTHON 2026.
                    </p>
                    </div>

                    <button
                      onClick={() => download("ACHIEVEMENT")}
                      disabled={!!downloading}
                    >
                      {downloading === "ACHIEVEMENT"
                        ? "Generating..."
                        : "Download Certificate"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footerEvent">
          <span>DBTHON 2026</span>
          <span>BUILD • QUERY • SOLVE</span>
          <span>VIT • SCOPE</span>
        </div>
      </footer>
    </main>
  );
}