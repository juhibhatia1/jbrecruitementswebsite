import { privacyMetadata } from "../lib/metadata";

export const metadata = privacyMetadata;

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen bg-[#F9F9FB] text-[#252E3D]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      <main className="mx-auto max-w-7xl px-4 md:px-6 pt-20 sm:pt-32 pb-12 md:pb-24">
        <div className="max-w-4xl">
          <p className="text-xs sm:text-sm text-gray-500 mb-3">
            Last updated: February 5, 2026
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#252e3d] leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-6 text-sm sm:text-base text-gray-700 leading-relaxed">
            This policy is about how we handle resumes and personal info from
            candidates on our platform. We collect stuff like that and try to
            keep it safe while following the rules on data protection. I think
            it&apos;s important to explain this clearly so people know what
            happens to their information when they submit a resume. By sending
            your details, you are basically agreeing to what we say here.
          </p>
        </div>

        <div className="mt-10 max-w-4xl">
          <ol className="list-decimal list-inside space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
            <li>
              The data we cover includes names, emails, phone numbers, education
              background, work history, skills, certifications, projects, and
              the resume file itself in formats like PDF or DOC. Sometimes
              candidates add extra bits, too. We do not go after sensitive
              things on purpose, like Aadhaar or PAN numbers, bank info,
              biometrics, or health details. It&apos;s best if people leave that
              out of their resumes, you know, to avoid issues.
            </li>
            <li>
              Why do we collect all this? Mainly for recruitment, to evaluate
              candidates, screen resumes, shortlist people, and talk about job
              openings. We also use it for internal stuff to make hiring better,
              or if laws require it. But we won&apos;t use it for marketing or
              anything else unless you say yes explicitly. That part seems
              straightforward.
            </li>
            <li>
              For storage, we use ImageKit, which is a cloud service for media
              and files. It&apos;s secure with access controls, encryption over
              HTTPS, and data kept separate, so no one sneaks in. Only certain
              people can get to it. Even though ImageKit handles the tech side,
              we make sure everything follows our rules. I am not totally sure
              how all the cloud details work, but it feels reliable enough.
            </li>
            <li>
              Access inside the company is limited to HR folks, the recruitment
              team for hiring, and admins for upkeep. It&apos;s all role-based
              and we keep an eye on it. We do not sell or rent data to outsiders
              or trade it around. Sharing only happens with trusted providers
              for operations, like the storage service, or if the law says so,
              court orders, government stuff, or to stop fraud and protect the
              platform. Those third parties have to keep things confidential by
              contract.
            </li>
            <li>
              Data does not stick around forever. For shortlisted candidates,
              it stays during the process. If not selected, we hold it a bit for
              future chances, but you can ask to delete it sooner. We review and
              delete securely when it&apos;s not needed anymore. See section 8
              for requests.
            </li>
            <li>
              Security-wise, we have encryption for sending data, controls on
              who logs in, monitoring, audits, and proper deletion. No system is
              perfect, though, risks exist, so we keep improving. That is the
              part that stands out, how nothing is fully safe.
            </li>
            <li>
              When you submit, you are giving consent for us to collect,
              process, store on the cloud, and use for hiring. You can pull back
              consent anytime by reaching out.
            </li>
            <li>
              Candidates can ask to see their data, fix errors, delete it, or
              stop future use. We handle those requests pretty quick, as long
              as laws allow.
            </li>
          </ol>

          <div className="mt-10 space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
            <div>
              <h2
                className="text-lg sm:text-xl font-semibold text-[#252e3d] mb-2"
                style={{ fontFamily: "Crimson Text, serif" }}
              >
                Changes to This Policy
              </h2>
              <p>
                This policy might change with new laws or tech, or business
                needs. We will post updates here with the date.
              </p>
            </div>

            <div>
              <h2
                className="text-lg sm:text-xl font-semibold text-[#252e3d] mb-2"
                style={{ fontFamily: "Crimson Text, serif" }}
              >
                Contact Us
              </h2>
              <p>
                If you have questions about privacy, want your data, or
                something else bothers you, contact us at JB Recruitments, email{" "}
                <a
                  href="mailto:contact@jbrecruitments.com"
                  className="text-[#605DBA] hover:underline"
                >
                  contact@jbrecruitments.com
                </a>
                , or by phone if listed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
