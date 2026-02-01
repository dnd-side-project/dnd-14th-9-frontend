import type { ReactNode } from "react";

import type { TokenItem } from "./tokensData";

type SectionProps = {
  title: string;
  children: ReactNode;
};

type TokenSectionProps = {
  title: string;
  items: TokenItem[];
};

type ColorGridColumns = 3 | 4 | 5 | 6 | 11;

type ColorSectionProps = {
  title: string;
  items: TokenItem[];
  columns?: ColorGridColumns;
};

const colorGridColumns: Record<ColorGridColumns, string> = {
  3: "grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
  6: "grid-cols-3 md:grid-cols-6",
  11: "grid-cols-4 md:grid-cols-6 lg:grid-cols-11",
};

function SectionBlock({ title, children }: SectionProps) {
  return (
    <section className="gap-lg flex flex-col">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function SectionGroup({ title, children }: SectionProps) {
  return (
    <div className="gap-xl flex flex-col">
      <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

export function ColorSection({ title, items, columns = 6 }: ColorSectionProps) {
  const gridCols = colorGridColumns[columns];

  return (
    <SectionBlock title={title}>
      <div className={`gap-md grid ${gridCols}`}>
        {items.map((item) =>
          item.bgClassName ? (
            <div
              key={item.label}
              className={`border-border-gray-light overflow-hidden rounded-md border ${item.bgClassName}`}
            >
              <div
                className={`p-2xs flex h-16 items-center justify-center text-center text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            </div>
          ) : (
            <div
              key={item.label}
              className={`border-border-gray-light p-2xs flex h-16 items-center justify-center rounded-md border text-center text-xs font-medium ${item.className}`}
            >
              {item.label}
            </div>
          )
        )}
      </div>
    </SectionBlock>
  );
}

export function DividerSection({ title, items }: TokenSectionProps) {
  return (
    <SectionBlock title={title}>
      <div className="gap-md grid grid-cols-2 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`gap-sm p-sm flex items-center rounded-md ${item.bgClassName || ""}`}
          >
            <div className={`border-t-md h-px flex-1 ${item.className}`} />
            <span className={`text-xs ${item.bgClassName ? "text-light-gray-0" : ""}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

export function BorderSection({ title, items }: TokenSectionProps) {
  return (
    <SectionBlock title={title}>
      <div className="gap-md grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className={`border-md bg-surface-white flex h-16 items-center justify-center rounded-md text-xs font-medium ${item.className}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

export function SpacingSection({ title, items }: TokenSectionProps) {
  return (
    <SectionBlock title={title}>
      <div className="gap-md grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="border-border-gray-light rounded-md border">
            <div className={`bg-surface-gray-subtle ${item.className}`}>
              <div className="bg-background-white px-sm py-2xs rounded-sm text-xs font-medium">
                p-{item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

export function GapSection({ title, items }: TokenSectionProps) {
  return (
    <SectionBlock title={title}>
      <div className="gap-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="border-border-gray-light p-sm rounded-md border">
            <div className={`flex ${item.className}`}>
              <div className="bg-primary-50 h-8 flex-1 rounded-xs" />
              <div className="bg-primary-50 h-8 flex-1 rounded-xs" />
              <div className="bg-primary-50 h-8 flex-1 rounded-xs" />
            </div>
            <p className="mt-2xs text-center text-xs font-medium">gap-{item.label}</p>
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

export function RadiusSection({ title, items }: TokenSectionProps) {
  return (
    <SectionBlock title={title}>
      <div className="gap-md grid grid-cols-2 md:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`border-md border-border-gray-light bg-surface-white flex h-20 items-center justify-center text-xs font-medium ${item.className}`}
          >
            rounded-{item.label}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

export function BorderWidthSection({ title, items }: TokenSectionProps) {
  return (
    <SectionBlock title={title}>
      <div className="gap-md grid grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`border-border-gray-dark bg-surface-white flex h-16 items-center justify-center rounded-md text-xs font-medium ${item.className}`}
          >
            border-{item.label}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

export function TypographySection({ title, items }: TokenSectionProps) {
  return (
    <SectionBlock title={title}>
      <div className="gap-md grid grid-cols-1 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`border-border-gray-light bg-surface-white flex h-16 items-center justify-center rounded-md border ${item.className}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}
