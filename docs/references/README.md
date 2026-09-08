# GitneaPig Visual Asset References

This directory contains the approved visual asset references for GitneaPig.

These files define the appearance and identity of mascot assets.

Page layout, spacing, responsive behavior, interaction rules, colors, and component behavior are defined by:

```text
docs/spec/DESIGN_SYSTEM.md
```

The Markdown specifications remain the source of truth for product behavior and UI composition.

---

## Directory Structure

```text
docs/
└── references/
    ├── README.md
    │
    └── mascots/
        ├── logo/
        │   └── navbar-mascot.png
        │
        ├── characters/
        │   ├── primary/
        │   │   ├── avatar.png
        │   │   ├── bust.png
        │   │   └── full.png
        │   │
        │   ├── cream/
        │   │   ├── avatar.png
        │   │   ├── bust.png
        │   │   └── full.png
        │   │
        │   ├── grey-white/
        │   │   ├── avatar.png
        │   │   ├── bust.png
        │   │   └── full.png
        │   │
        │   └── orange-black/
        │       ├── avatar.png
        │       ├── bust.png
        │       └── full.png
        │
        └── hero/
            └── home-hero.png
```

Only approved mascot assets should be kept in this directory.

Rejected or unused AI-generation candidates should not be committed unless the team explicitly needs them for design review.

---

## `mascots/logo/`

Contains the small mascot icon used in the application header.

Expected asset:

```text
mascots/logo/navbar-mascot.png
```

The image contains **only the guinea pig mascot icon**.

The `GitneaPig` product name is **not** part of this image.

The navbar renders the product name separately as real UI text:

- `Gitnea` → light/white
- `Pig` → primary orange

Expected navbar composition:

```text
[Guinea Pig Mascot Icon] GitneaPig
```

The image asset must not contain:

- `GitneaPig`
- letters
- a wordmark
- generated text

The icon and wordmark are separate implementation elements.

---

## `mascots/characters/`

Contains reusable guinea pig character identities.

Current approved character sets:

```text
primary
cream
grey-white
orange-black
```

Characters can be used for:

- user/profile avatars
- Learn scenario characters
- Quest teammates
- Quest reviewers
- Daily Challenge characters
- other character-based feedback defined by the specifications

Each character directory contains three representations:

```text
avatar.png
bust.png
full.png
```

### `avatar.png`

Head-focused portrait intended primarily for:

- circular profile images
- compact avatar UI

### `bust.png`

Head + upper-body representation intended primarily for:

- Learn dialogue
- Quest dialogue
- Daily Challenge dialogue
- reviewer/teammate presentation

### `full.png`

Full-body representation intended for larger character appearances where additional body language is useful.

For one character directory, `avatar`, `bust`, and `full` must represent the **same character identity**.

The following must remain consistent across all representations of one character:

- fur colors
- fur markings
- face identity
- overall illustration family

Do not treat `avatar`, `bust`, and `full` as three unrelated guinea pigs.

---

## `mascots/characters/primary/`

Contains the reusable character-system versions of the primary white + warm-orange GitneaPig mascot.

Expected files:

```text
avatar.png
bust.png
full.png
```

These are the reusable simple character versions.

They are separate from the dedicated Home Hero illustration.

In particular:

```text
mascots/characters/primary/full.png
```

and:

```text
mascots/hero/home-hero.png
```

serve different purposes and do not need to be the same image.

---

## `mascots/hero/`

Contains the dedicated illustration used in the Home Hero composition.

Expected asset:

```text
mascots/hero/home-hero.png
```

The Home Hero mascot:

- is the primary white + warm-orange GitneaPig mascot
- is intentionally larger and more visually detailed than profile/dialogue character assets
- is designed specifically for the Home landing-page Hero
- is composed together with the animated decorative Git Terminal defined in `DESIGN_SYSTEM.md`

It must not be treated as a generic profile or dialogue avatar.

---

## Asset Usage Rule

Reference assets define **character appearance**, not complete page design.

Do not infer page layout from the canvas size, whitespace, crop, or background of an exported mascot image.

For implementation decisions use:

```text
docs/spec/MASTER_SPEC.md
docs/spec/DATA_CONTRACTS.md
docs/spec/DESIGN_SYSTEM.md
docs/spec/ACCEPTANCE_CHECKLIST.md
```

When implementation begins, approved assets that are actually used by the frontend may be copied or moved into the frontend asset structure, for example:

```text
apps/frontend/src/assets/mascots/
```

The `docs/references/` copies remain the design/reference source unless the team intentionally adopts a different asset workflow.
