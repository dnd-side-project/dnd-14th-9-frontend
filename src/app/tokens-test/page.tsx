const semanticBackgrounds = [
  { label: "background.white", className: "bg-background-white text-light-gray-90" },
  { label: "background.gray-subtle", className: "bg-background-gray-subtle text-light-gray-90" },
  { label: "background.inverse", className: "bg-background-inverse text-light-gray-0" },
  { label: "background.dim", className: "bg-background-dim text-light-gray-0" },
];

const semanticSurfaces = [
  { label: "surface.white", className: "bg-surface-white text-light-gray-90" },
  { label: "surface.gray-subtle", className: "bg-surface-gray-subtle text-light-gray-90" },
  { label: "surface.primary-subtler", className: "bg-surface-primary-subtler text-light-gray-90" },
  { label: "surface.warning-subtler", className: "bg-surface-warning-subtler text-light-gray-90" },
  { label: "surface.success-subtler", className: "bg-surface-success-subtler text-light-gray-90" },
];

const borderSamples = [
  { label: "border-gray-light", className: "border-border-gray-light" },
  { label: "border-gray", className: "border-border-gray" },
  { label: "border-gray-dark", className: "border-border-gray-dark" },
  { label: "border-primary", className: "border-border-primary" },
  { label: "border-warning", className: "border-border-warning" },
  { label: "border-success", className: "border-border-success" },
];

const dividerSamples = [
  { label: "divider-gray-light", className: "border-divider-gray-light" },
  { label: "divider-gray", className: "border-divider-gray" },
  { label: "divider-gray-dark", className: "border-divider-gray-dark" },
  { label: "divider-inverse", className: "border-divider-inverse" },
];

const spacingSamples = [
  { label: "3xs", className: "p-3xs" },
  { label: "2xs", className: "p-2xs" },
  { label: "xs", className: "p-xs" },
  { label: "sm", className: "p-sm" },
  { label: "md", className: "p-md" },
  { label: "lg", className: "p-lg" },
  { label: "xl", className: "p-xl" },
  { label: "2xl", className: "p-2xl" },
];

const radiusSamples = [
  { label: "2xs", className: "rounded-2xs" },
  { label: "xs", className: "rounded-xs" },
  { label: "sm", className: "rounded-sm" },
  { label: "md", className: "rounded-md" },
  { label: "lg", className: "rounded-lg" },
  { label: "xl", className: "rounded-xl" },
  { label: "2xl", className: "rounded-2xl" },
  { label: "3xl", className: "rounded-3xl" },
];

const borderWidthSamples = [
  { label: "sm", className: "border-sm" },
  { label: "md", className: "border-md" },
  { label: "lg", className: "border-lg" },
];

const grayScale = [
  { label: "light.gray.0", className: "bg-light-gray-0 text-light-gray-90" },
  { label: "light.gray.20", className: "bg-light-gray-20 text-light-gray-90" },
  { label: "light.gray.40", className: "bg-light-gray-40 text-light-gray-90" },
  { label: "light.gray.60", className: "bg-light-gray-60 text-light-gray-0" },
  { label: "light.gray.80", className: "bg-light-gray-80 text-light-gray-0" },
  { label: "light.gray.100", className: "bg-light-gray-100 text-light-gray-0" },
];

export default function TokensTestPage() {
  return (
    <div className="bg-background-white text-light-gray-90 min-h-screen">
      <div className="gap-2xl p-2xl mx-auto flex max-w-6xl flex-col">
        <header className="gap-sm flex flex-col">
          <h1 className="text-3xl font-semibold">Tokens Test</h1>
          <p className="text-light-gray-60">
            Tailwind classes are mapped to design tokens via CSS variables.
          </p>
        </header>

        <section className="gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Semantic Colors</h2>
          <div className="gap-md grid grid-cols-2 md:grid-cols-4">
            {semanticBackgrounds.map((item) => (
              <div
                key={item.label}
                className={`border-border-gray-light flex h-24 items-center justify-center rounded-md border text-sm font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="gap-md grid grid-cols-2 md:grid-cols-5">
            {semanticSurfaces.map((item) => (
              <div
                key={item.label}
                className={`border-border-gray-light flex h-20 items-center justify-center rounded-md border text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </section>

        <section className="gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Primitive Gray Scale</h2>
          <div className="gap-md grid grid-cols-3 md:grid-cols-6">
            {grayScale.map((item) => (
              <div
                key={item.label}
                className={`border-border-gray-light flex h-16 items-center justify-center rounded-md border text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </section>

        <section className="gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Spacing Scale</h2>
          <div className="gap-md grid grid-cols-2 md:grid-cols-4">
            {spacingSamples.map((item) => (
              <div key={item.label} className="border-border-gray-light rounded-md border">
                <div className={`bg-surface-gray-subtle ${item.className}`}>
                  <div className="bg-background-white px-sm py-2xs rounded-sm text-xs font-medium">
                    p-{item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Radius + Border Width</h2>
          <div className="gap-md grid grid-cols-2 md:grid-cols-4">
            {radiusSamples.map((item) => (
              <div
                key={item.label}
                className={`bg-surface-white border-md border-border-gray-light flex h-20 items-center justify-center text-xs font-medium ${item.className}`}
              >
                rounded-{item.label}
              </div>
            ))}
          </div>
          <div className="gap-md grid grid-cols-3">
            {borderWidthSamples.map((item) => (
              <div
                key={item.label}
                className={`bg-surface-white border-border-gray-dark flex h-16 items-center justify-center rounded-md text-xs font-medium ${item.className}`}
              >
                border-{item.label}
              </div>
            ))}
          </div>
        </section>

        <section className="gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Border + Divider Colors</h2>
          <div className="gap-md grid grid-cols-2 md:grid-cols-3">
            {borderSamples.map((item) => (
              <div
                key={item.label}
                className={`border-md bg-surface-white flex h-16 items-center justify-center rounded-md text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="gap-md grid grid-cols-2 md:grid-cols-4">
            {dividerSamples.map((item) => (
              <div key={item.label} className="gap-sm flex items-center">
                <div className={`border-t-md h-px flex-1 ${item.className}`} />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
