# Problem 3 - Issues in Original Code

1. **Type errors**

   - `WalletBalance` does not have the field `blockchain`, but the code calls `balance.blockchain`.
   - `rows` uses type `FormattedWalletBalance`, but the actual mapped data does not contain `formatted`.

2. **Invalid filter condition**

   - The filter keeps balances with `amount <= 0`. Normally, we should only display balances with `amount > 0`.

3. **Undefined variable**

   - `lhsPriority` inside the filter is not defined, causing runtime errors.

4. **Unnecessary dependency**

   - `prices` is included in the dependency array of `useMemo`, but it is not used inside the calculation.

5. **Inefficient key usage**

   - Using `index` as React key (`key={index}`) can lead to rendering issues. A unique field like `balance.currency` should be used instead.

6. **Unused variable**

   - `formattedBalances` is created but never used in rendering.

7. **Weak typing**

   - `getPriority` uses `any` type. It should be typed with a union type of supported blockchains.

8. **Formatting**
   - `balance.amount.toFixed()` is called without specifying decimal places, which leads to inconsistent formatting.
