// Method 1: Mathematical formula
// Time complexity: O(1)
// Space complexity: O(1)
var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

// Method 2: Iterative
// Time complexity: O(n)
// Space complexity: O(1)
var sum_to_n_b = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Method 3: Recursive
// Time complexity: O(n)
// Space complexity: O(n)
var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};
