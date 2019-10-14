
```code
private static final String[] KENNYLETTERS = {"mmm", "mmp", "mmf", "mpm",
    "mpp", "mpf", "mfm", "mfp", "mff", "pmm", "pmp", "pmf", "ppm",
    "ppp", "ppf", "pfm", "pfp", "pff", "fmm", "fmp", "fmf", "fpm",
    "fpp", "fpf", "ffm", "ffp"};

public String encode(final String input) {
    return Arrays.stream(input.split("")).map(s -> s.matches("[a-z]")
            ? KENNYLETTERS[s.charAt(0) - 'a']
            : (s.matches("[A-Z]")
                    ? KENNYLETTERS[s.charAt(0) - 'A'].substring(0, 1).toUpperCase()
                    + KENNYLETTERS[s.charAt(0) - 'A'].substring(1)
                    : s))
            .reduce("", (t, u) -> t + u);
}

public String decode(final String input) {
    return Arrays.stream(input.split(" ")).map(w -> Arrays.asList(
            Arrays.stream(w.split(""))
            .map(k -> "FMP".contains(k.toUpperCase()) ? k : IntStream.range(0, 3)
                            .mapToObj(i -> k).reduce("", (t, u) -> t + u))
            .reduce("", (t, u) -> t + u).split("(?<=\\G...)"))
            .stream().map(k -> (char) IntStream.range(0, KENNYLETTERS.length)
                    .filter(i -> KENNYLETTERS[i].equals(k.toLowerCase()))
                    .map(i -> Character.isUpperCase(k.charAt(0)) ? (char) ('A' + i) : (char) ('a' + i))
                    .findFirst()
                    .orElse(k.charAt(0)))
            .map(k -> "" + k).reduce("", (t, u) -> t + u))
            .reduce("", (t, u) -> t.equals("") ? u : t + " " + u);
}
```
