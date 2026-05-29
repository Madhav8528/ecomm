import type { PolicyDocument } from "@/content/policies";

type PolicyPageLayoutProps = {
  document: PolicyDocument;
};

export function PolicyPageLayout({ document }: PolicyPageLayoutProps) {
  return (
    <section className="section">
      <div className="container policy-layout">
        <aside className="card policy-toc-card" aria-label="Policy sections">
          <p className="policy-toc-title">On this page</p>
          <nav className="policy-toc-nav">
            <ul>
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="card policy-content-card">
          <header className="policy-header">
            <h1>{document.title}</h1>
            {document.intro?.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </header>

          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="policy-section" aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.blocks.map((block, index) => {
                if (block.type === "paragraph") {
                  return <p key={`${section.id}-p-${index}`}>{block.text}</p>;
                }
                if (block.type === "unordered_list") {
                  return (
                    <ul key={`${section.id}-ul-${index}`}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <ol key={`${section.id}-ol-${index}`}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                );
              })}
            </section>
          ))}
        </article>
      </div>
    </section>
  );
}
