# AI prompt: Expand the Next.js T3 CMS into a visual page builder

Use this prompt to guide an AI/code-generation agent when extending this repository into a drag-and-drop, section-based page builder. It reflects the current stack (Next.js App Router + Prisma/SQLite + NextAuth + TipTap + Supabase media) and the desired editor experience.

## Current stack (context for this repo)
- **Framework:** Next.js App Router (T3 stack) with Tailwind/DaisyUI styling.
- **Auth:** NextAuth (Discord), admin routes gated by `auth()`.
- **Database/ORM:** Prisma with SQLite (`dev.db`). `Page` model:
  ```prisma
  model Page {
    id        String      @id @default(cuid())
    title     String
    slug      String
    path      String      @unique
    status    PageStatus  @default(DRAFT)
    content   Json        @default("[]")
    createdAt DateTime    @default(now())
    updatedAt DateTime    @updatedAt
  }

  enum PageStatus {
    DRAFT
    PUBLISHED
  }
  ```
- **Blocks & rich text:** `~/lib/blocks.ts` defines `Block`, including `RichTextBlock` and an early `ContainerBlock`. Rich text is TipTap JSON (`RichTextDoc`) rendered via `~/lib/renderRichText.tsx`. Public rendering goes through `PageView` in `src/app/_components/PageView.tsx`.
- **Editor:** `PageEditor` (`src/app/_components/PageEditor.tsx`) uses TipTap with custom extensions from `~/lib/tiptapExtensions.ts` and a DaisyUI toolbar (heading dropdown, alignment, text styles, lists, link modal, image modal). Media upload/library uses `/api/media/upload` and `/api/media/list` backed by Supabase Storage. The editor already supports Edit vs. View modes (View uses `PageView`).
- **Admin pages:** `src/app/admin/pages/page.tsx` lists pages; `src/app/admin/pages/[id]/page.tsx` edits a page via `PageEditor`.
- **API routes:** `/api/page/save` persists `Page.content`; `/api/media/upload` and `/api/media/list` handle Supabase media.

## Goal
Deliver an in-app visual CMS page builder so editors can assemble pages visually (drag/drop + inline edits) using the existing Page + JSON blocks + TipTap + Supabase media setup. Public pages are rendered via Next.js App Router using the existing `PageView` / `renderRichText` pipeline.

## High-level requirements (adapted to this project)
### 1) Editor chrome
- **Top bar (dark mode)** on `admin/pages/[id]`: show page title, status (DRAFT/PUBLISHED), last-saved timestamp/version, environment selector (static Local/Prod), viewport toggles (desktop/tablet/phone) that apply CSS class on the canvas wrapper, settings placeholder, accessibility/contrast toggle (e.g., canvas background theme), comments badge placeholder, edit/draft slider tied to `Page.status` or local edit/preview state, and a Save Draft CTA using `/api/page/save`.
- **Left sidebar (Layers)**: navigation tree for the page structure with root frame and containers/sections (e.g., “Container 1 – Hero”). Each entry has a label, visibility toggle (`hidden` flag) to hide/show on canvas, and clicking focuses/scrolls to the target container.
- **Right sidebar**: layout preset buttons/tiles (1/2/3/4/12-column), spacing controls (padding/margin tokens like S/M/L) for the selected container, common component palette (Hero, Feature/Callout, Nav, Contact section, Page header, Footer card) that inserts preset containers/blocks, and theme color swatches (DaisyUI tokens such as `bg-primary`, `bg-base-100`, plus gradient classes) applied to the selected container.
- **Bottom bar**: breadcrumb trail (Page → Container → Row/Column → Card → RichText) and a duplicate component control to clone the current selection.

### 2) Canvas and content blocks
- Extend `Block` model in `~/lib/blocks.ts` to solidify `ContainerBlock` props: `backgroundVariant` (base/muted/primary/gradient), `padding` (none/sm/md/lg), `label`, `hidden`, and `children: Block[]`. Keep `RichTextBlock` unchanged. Columns can be encoded via container layout props (start simple; optional `RowBlock`/`ColumnBlock` later).
- Editor canvas should render each container as a bordered section with a header (label + background info). Inside, reuse `RichTextBlockEditor` (TipTap) for rich text blocks. Provide “Add rich text” inside containers and “Add container” at page end.
- Reordering: drag handles or move up/down for containers and rich text blocks; light DnD (e.g., `@dnd-kit`) is acceptable if it doesn’t break existing behavior.
- Keyboard shortcuts: keep TipTap defaults (Cmd/Ctrl+B/I, undo/redo), and add Cmd/Ctrl+P to toggle preview (edit ↔ view in `PageEditor`).
- Prebuilt templates when adding containers from the palette: Hero (H1 + paragraph + CTA text), Feature highlight (subheading + bullet list), Testimonial (blockquote + author), Contact form card (placeholder text; real form block later), Footer or Page header variants.

### 3) Content model alignment
- Source of truth: `Page.content` JSON array of `Block` objects. Top level should be `ContainerBlock[]`. Existing pages with plain `RichTextBlock[]` must be wrapped into a default container on load for compatibility.
- Update `PageView` to render containers as `<section>` wrappers (with `aria-label` from `label` when present) applying theme/spacing classes from container props. Child `RichTextBlock` still uses `renderRichText`.
- Keep persistence compatible: `/api/page/save` continues to read/write the same JSON structure used by the editor and public view.

### 4) Rendering & delivery
- Public routes (e.g., `src/app/page.tsx` and other path-based loaders) use `PageView` to render containers + nested blocks with SSG/ISR-friendly data fetching. Preview mode should keep working via the existing edit/view toggle.
- SEO/accessibility: semantic headings, responsive rich text/media (existing render), and containers as `<section>` with optional labels.

### 5) Collaboration & versioning
- Use `Page.status` (DRAFT/PUBLISHED) for the edit/draft slider; show `updatedAt` as a version indicator in the top bar. Include a placeholder comments icon (non-functional).

### 6) Interactions & shortcuts
- Maintain TipTap shortcuts; ensure Cmd/Ctrl+P toggles editor preview. Layers sidebar entries include visibility toggles and move controls. Containers in the canvas support duplication (clone block + children) from the bottom bar or container header.

### 7) Extensibility & theming
- Use DaisyUI/Tailwind tokens for backgrounds/typography; avoid raw colors. Map container `backgroundVariant` and `padding` to Tailwind utility classes in both editor and public render.
- Keep media APIs unchanged; future blocks (Button, Media) can build on `renderRichText` or new block types.

## Success criteria
- Visiting `/admin/pages/[id]` shows the new chrome (top/side/bottom bars) around `PageEditor`.
- Editors can add/reorder containers and rich text blocks, toggle visibility, apply theme/spacing presets, edit inline rich text (with images via the existing modals), and toggle preview.
- Saving persists `ContainerBlock[]` JSON compatible with both editor and public render; existing pages still work via auto-wrapping.
- Public routes render the same data via `PageView`/`renderRichText` with sections for containers and theme-aware styling.
