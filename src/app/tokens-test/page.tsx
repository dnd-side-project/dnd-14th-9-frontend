const semanticBackgrounds = [
  { label: "background.white", className: "bg-color-background-white text-color-light-gray-90" },
  {
    label: "background.gray-subtle",
    className: "bg-color-background-gray-subtle text-color-light-gray-90",
  },
  { label: "background.inverse", className: "bg-color-background-inverse text-color-light-gray-0" },
  { label: "background.dim", className: "bg-color-background-dim text-color-light-gray-0" },
];

const semanticSurfaces = [
  { label: "surface.white", className: "bg-color-surface-white text-color-light-gray-90" },
  {
    label: "surface.gray-subtle",
    className: "bg-color-surface-gray-subtle text-color-light-gray-90",
  },
  {
    label: "surface.primary-subtler",
    className: "bg-color-surface-primary-subtler text-color-light-gray-90",
  },
  {
    label: "surface.warning-subtler",
    className: "bg-color-surface-warning-subtler text-color-light-gray-90",
  },
  {
    label: "surface.success-subtler",
    className: "bg-color-surface-success-subtler text-color-light-gray-90",
  },
];

const borderSamples = [
  { label: "border-gray-light", className: "border-color-border-gray-light" },
  { label: "border-gray", className: "border-color-border-gray" },
  { label: "border-gray-dark", className: "border-color-border-gray-dark" },
  { label: "border-primary", className: "border-color-border-primary" },
  { label: "border-warning", className: "border-color-border-warning" },
  { label: "border-success", className: "border-color-border-success" },
];

const dividerSamples = [
  { label: "divider-gray-light", className: "border-color-divider-gray-light" },
  { label: "divider-gray", className: "border-color-divider-gray" },
  { label: "divider-gray-dark", className: "border-color-divider-gray-dark" },
  { label: "divider-inverse", className: "border-color-divider-inverse" },
];

const spacingSamples = [
  { label: "3xs", className: "p-layout-spacing-3xs" },
  { label: "2xs", className: "p-layout-spacing-2xs" },
  { label: "xs", className: "p-layout-spacing-xs" },
  { label: "sm", className: "p-layout-spacing-sm" },
  { label: "md", className: "p-layout-spacing-md" },
  { label: "lg", className: "p-layout-spacing-lg" },
  { label: "xl", className: "p-layout-spacing-xl" },
  { label: "2xl", className: "p-layout-spacing-2xl" },
];

const radiusSamples = [
  { label: "2xs", className: "rounded-shape-radius-2xs" },
  { label: "xs", className: "rounded-shape-radius-xs" },
  { label: "sm", className: "rounded-shape-radius-sm" },
  { label: "md", className: "rounded-shape-radius-md" },
  { label: "lg", className: "rounded-shape-radius-lg" },
  { label: "xl", className: "rounded-shape-radius-xl" },
  { label: "2xl", className: "rounded-shape-radius-2xl" },
  { label: "3xl", className: "rounded-shape-radius-3xl" },
];

const borderWidthSamples = [
  { label: "sm", className: "border-shape-border-width-sm" },
  { label: "md", className: "border-shape-border-width-md" },
  { label: "lg", className: "border-shape-border-width-lg" },
];

const grayScale = [
  { label: "light.gray.0", className: "bg-color-light-gray-0 text-color-light-gray-90" },
  { label: "light.gray.20", className: "bg-color-light-gray-20 text-color-light-gray-90" },
  { label: "light.gray.40", className: "bg-color-light-gray-40 text-color-light-gray-90" },
  { label: "light.gray.60", className: "bg-color-light-gray-60 text-color-light-gray-0" },
  { label: "light.gray.80", className: "bg-color-light-gray-80 text-color-light-gray-0" },
  { label: "light.gray.100", className: "bg-color-light-gray-100 text-color-light-gray-0" },
];

export default function TokensTestPage() {
  return (
    <div className="bg-color-background-white text-color-light-gray-90 min-h-screen">
      <div className="gap-layout-gap-2xl p-layout-spacing-2xl mx-auto flex max-w-6xl flex-col">
        <header className="gap-layout-gap-sm flex flex-col">
          <h1 className="text-3xl font-semibold">Tokens Test</h1>
          <p className="text-color-light-gray-60">
            Tailwind classes are mapped to design tokens via CSS variables.
          </p>
        </header>

        <section className="gap-layout-gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Semantic Colors</h2>
          <div className="gap-layout-gap-md grid grid-cols-2 md:grid-cols-4">
            {semanticBackgrounds.map((item) => (
              <div
                key={item.label}
                className={`border-color-border-gray-light rounded-shape-radius-md flex h-24 items-center justify-center border text-sm font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="gap-layout-gap-md grid grid-cols-2 md:grid-cols-5">
            {semanticSurfaces.map((item) => (
              <div
                key={item.label}
                className={`border-color-border-gray-light rounded-shape-radius-md flex h-20 items-center justify-center border text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </section>

        <section className="gap-layout-gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Primitive Gray Scale</h2>
          <div className="gap-layout-gap-md grid grid-cols-3 md:grid-cols-6">
            {grayScale.map((item) => (
              <div
                key={item.label}
                className={`border-color-border-gray-light rounded-shape-radius-md flex h-16 items-center justify-center border text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </section>

        <section className="gap-layout-gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Spacing Scale</h2>
          <div className="gap-layout-gap-md grid grid-cols-2 md:grid-cols-4">
            {spacingSamples.map((item) => (
              <div
                key={item.label}
                className="border-color-border-gray-light rounded-shape-radius-md border"
              >
                <div className={`bg-color-surface-gray-subtle ${item.className}`}>
                  <div className="bg-color-background-white px-layout-spacing-sm py-layout-spacing-2xs rounded-shape-radius-sm text-xs font-medium">
                    p-{item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="gap-layout-gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Radius + Border Width</h2>
          <div className="gap-layout-gap-md grid grid-cols-2 md:grid-cols-4">
            {radiusSamples.map((item) => (
              <div
                key={item.label}
                className={`bg-color-surface-white border-shape-border-width-md border-color-border-gray-light flex h-20 items-center justify-center text-xs font-medium ${item.className}`}
              >
                rounded-{item.label}
              </div>
            ))}
          </div>
          <div className="gap-layout-gap-md grid grid-cols-3">
            {borderWidthSamples.map((item) => (
              <div
                key={item.label}
                className={`bg-color-surface-white border-color-border-gray-dark rounded-shape-radius-md flex h-16 items-center justify-center text-xs font-medium ${item.className}`}
              >
                border-{item.label}
              </div>
            ))}
          </div>
        </section>

        <section className="gap-layout-gap-lg flex flex-col">
          <h2 className="text-xl font-semibold">Border + Divider Colors</h2>
          <div className="gap-layout-gap-md grid grid-cols-2 md:grid-cols-3">
            {borderSamples.map((item) => (
              <div
                key={item.label}
                className={`border-shape-border-width-md bg-color-surface-white rounded-shape-radius-md flex h-16 items-center justify-center text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="gap-layout-gap-md grid grid-cols-2 md:grid-cols-4">
            {dividerSamples.map((item) => (
              <div key={item.label} className="gap-layout-gap-sm flex items-center">
                <div className={`border-t-shape-border-width-md h-px flex-1 ${item.className}`} />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
