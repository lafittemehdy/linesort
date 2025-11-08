# Change Log

All notable changes to Line Sort.

## [0.0.2] - 2025-11-08

### Added
- Inline element sorting for comma, semicolon, pipe, and space-separated lists
- Smart auto-detection - automatically chooses multi-line vs inline sorting
- Works without selection - sorts current line when cursor is placed

### Fixed
- Resolved issues with empty elements being incorrectly sorted in inline lists
- Corrected the greedy behavior of the prefix detection regex in inline sorting

### Changed
- Improved inline sorting logic for better consistency and predictability
- Normalized spacing for elements in inline lists (e.g., `a,b,c` now becomes `a, b, c`)
- Enhanced delimiter detection for multi-space separated elements

## [0.0.1] - 2025-10-26

### Added
- Alphabetize selected lines in one quick hit
- ASCII order sorting (case-sensitive: special chars, numbers, uppercase, lowercase)
- Context menu integration
- Keyboard shortcut: `Ctrl+Alt+S` (Windows/Linux) or `Cmd+Alt+S` (Mac)