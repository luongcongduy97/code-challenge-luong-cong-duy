# Code Challenge – Submission

Author: **Lương Công Duy**

This repository contains my solutions for the Code Challenge.  
The repo is based on the provided template: [99techteam/code-challenge](https://github.com/99techteam/code-challenge).

---

## 📂 Project Structure

problem1/ → Solution for Problem 1 (Three ways to sum to n)
problem2/ → Solution for Problem 2 (Fancy Form)
problem3/ → Solution for Problem 3 (Messy React)

## 📝 Problem 1 – Three ways to sum to n

**Task:** Implement three unique ways to compute the sum from `1` to `n`.

**My solutions:**

1. **For loop** – iterate and accumulate.
2. **Recursion** – call the function repeatedly until `n = 1`.
3. **Mathematical formula** – use `(n * (n + 1)) / 2`.

**File:** `problem1/problem1.js`

**How to test:**

## 📝 Problem 2

**Task:** Build a token swap form with live prices and intuitive UI.

**Solution highlights:**

- Alpine.js + vanilla HTML/CSS
- Token prices from API + token icons from GitHub
- Live conversion, validation, error messages
- Balance display with **Max** button
- Swap direction (⇅), rate line, toast, skeleton loader
- Saves last token choices in localStorage

**Files:** `problem2/index.html`, `problem2/style.css`, `problem2/script.js`

---

## 📝 Problem 3 – Messy React

**Task:** Review the provided React + TypeScript code, identify inefficiencies and anti-patterns, and then refactor it into a cleaner version.

**Files**

- `problem-3/issues.md` → Explanation of problems in the original code and suggested fixes.
- `problem-3/WalletPage.tsx` → Refactored component with improvements applied.

**Fixes applied:**

- Corrected types, removed `any`
- Fixed filter (`amount > 0`), removed dead code
- Simplified sorting, cleaned `useMemo`
- Stable list keys, proper formatting
- Removed unused props
