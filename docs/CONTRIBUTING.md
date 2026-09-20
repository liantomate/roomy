# Getting Started

## Notes

This project is a practice project for specific people, and is currently not accepting external contributions

## Prerequisite

Node.js: newer version
npm: v10.9.2 or later
Git: newer version

## Installation

1. **Clone** the GitHub repository

```bash
git clone https://github.com/liantomate/roomy.git
cd roomy
```

2. **Install** dependencies

```bash
npm ci
```

### Running the Project

1. **Run** the fullstack project

```bash
npm run dev
```

### Branching

There are three primary branches in the project

- **main**: this is where stable and reviewed features can be integrated
- **presentation**: this is where presentation layer features are implemented
    - **presentation/feature-xx**: for specific presentation layer features
- **logic**: this is where hooks and logic layers are implemented (combined)
    - **logic/feature-xx**: for specific logic layer features
- **api**: this is where wrapper APIs are implemented

When developing a layer-specific feature (e.g. you're working on a feature like login page on the presentation layer), create a branch to ensure that the branches remain usable for other developers
**Creating and switching to a feature branch**

```bash
git switch -c "<layer>/feature-<feature_name>"
```

!! Do not add a space in the feature name
\<layer\> should be replaced by what layer a feature is assigned on

**Creating and switching to a presentation feature branch**

```bash
git switch -c "presentation/feature-<feature_name>"
```

**Creating and switching to a logic feature branch**

```bash
git switch -c "logic/feature-<feature_name>"
```

**Uploading a branch to remote (GitHub)**

```bash
git push -u origin "<branch-name>"
```

## Commit Messages

When commiting, use the following commit message format

```bash
COMMIT_TYPE: your_message_here
```

Where _COMMIT_TYPE_ can be the following:

- **feat**: implementation of a feature
- **ref**: refactor; changing code for neatness without changing functionalities
- **fix**: fixing a bug or error
- **doc**: for documentation commits

For example, a commit on a button implementation may be written like

```bash
git commit -m "feat: implemented Button component for Landing Page"
```

## Submitting Code

Since the members are added in this repository, code reviews can't be done through pull-requests, instead, keep the code on the feature branches and inform the project lead on the feature you want to submit (merge)

Once accepted without feedbacks for changes, merge it with a primary layer, for example, an accepted feature is on _presentation/feature-page_01_, then the layer to merge it at should be _presentation_

```bash
git switch <branch-to-merge-a-feature-on>
git merge <branch-where-the-feature-is-at>
```

Branch deletion is a dangerous process, therefore, inform the project lead temporarily for branches to be deleted (although, this is regularly done especially after feature acceptances)

## AI-Assisted or AI-Generated Code

AI usage is not prohibited in the codebase, but complete reliance on it (using it to completely generate a code without understanding it, or when the AI-assisted/generated code does not reflect preferred practices of the project) isn't

During reviews, submitted code will also be inspected for these, not based on "it looks AI" intuitions, rather, how fitting the code is to the project, how functional it is and how well the understanding of the submitter is (will be questioned during the review)

## Testing

As of writing this documentation, automated or systematic testings haven't been implemented yet, but tests can be found on the _test/_ folder. For logic and hook layers features, ensure that an equivalent test is executed and features pass the said tests

## Coding Preferences

These are formatting preferences to ensure that the codebase maintain uniform formatting across many developers

- Ensure that brackets lie on the same like as the function or statement declaration when applicable
- For single-liner statements, e.g. one-line if statements, omit the brackets
- Use tabs for indenting
- Use 4-space tab widths on the project
- Always include semi-colons when applicable
- Always use double quotations for strings

Below are code-specific preferences to ensure that naming and codes are maintainable across many developers

### HTML and CSS

- When naming classes, ensure to use hyphen (-) for separation and underscore (\_) for spacing
- When naming classes, ensure that the classnames are hierarchal, e.g. a class for a settings button on a navigation bar: **navbar-settings_button**

### TypeScript

- For TypeScript codes, ensure that types are explicit as much as possible, but they can be omitted for obvious cases e.g. const sumOfNums = num1 + num2;
- Default exports (_export default_) should be located at the bottom-most part of the module, and not directly written on the function declaration
- Regular exports however, should be written before the function declaration
