
![Kenny McCormick](https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/KennyMcCormick.png/150px-KennyMcCormick.png)

Mfpmmmfpmmpp ffmppffmf mppfpmmpppff fppppfpppmpmmpppffmppmpm fppmfpmmmfmp fmpmfpmfffmm pmfmfffmpfmppmfmpp mfmfmfffm mfffmm pfmmppmmmpmpmffpppmfm mmmmmpppffmffmp? Fppmpppmfpmf fmmppf mpmmffmpm fmmppfppmmpp ppffmpmfpmpppff mpfppfpmfpmpfmm mmmfmp [kenny translator](https://www.namesuppressed.com/kenny) fmpmfpmfffmm pffmppfmmfmfpmffmpmppmpm mffppp mmm pppfmfppmmmpmpppff ppfmpf mffppmpfmpmfmppppmmpppppfmpmmmfmpmffppfpppfmm ppfmpf fmpmfpmpp pmpmppppppppffm fmppffmmmpppfmmpmfmmmfmpppfpff. Ppmmpp mmpmppmffpppmfm mmm pmmmmmfpmmmm pfmpffppfmfmpffmmmppmppmmpppff mmmpppmpm fmpmfpmpp (mmmfmp fmpmfpmmmfmp fmpmffppmmpp) pppmppfpp pfmppffmmfmmmffmmpmffpmfmfffmpffm fmpppf fpppffmfffmpmpp pmfmmmppmmmpmpmmmm'fmm Mff fmpppfppfpmp mfffmp fmpppf fpppffmfffmpmpp ppmffm fpmmpppfffmmmffppfppp.

Fmmmppmpp fmpmfpmpp [downloads](https://www.namesuppressed.com/kenny/downloads.html) fmmmppfmmfmmmffppfppp mpfppfpff ppffmpmfpmpppff mffppmpfmpmfmppppmmpppppfmpmmmfmpmffppfpppfmm.

Mmmpppmpm Mff pmfmppmmmfpmmpp mfffmp fmfpfm fmpppf fmpmfpmpp pffmppmmmmpmmpppff fmpppf mpfmffmfmfmfpffmpp ppffmffmp mfpppffpp fmpmfpmfffmm fppppfpffpmpfmm.


### Encoder
```code
public String encode(final String input) {
    return Arrays.stream(input.split("")).map(s -> s.matches("[a-z]")
            ? KENNYSPEAK[s.charAt(0) - 'a']
            : (s.matches("[A-Z]")
                    ? KENNYSPEAK[s.charAt(0) - 'A'].substring(0, 1).toUpperCase()
                    + KENNYSPEAK[s.charAt(0) - 'A'].substring(1)
                    : s))
            .reduce("", (t, u) -> t + u);
}
```

### Decoder
```code
public String decode(final String input) {
    return Arrays.stream(input.split(" ")).map(w -> Arrays.asList(
            Arrays.stream(w.split(""))
            .map(k -> "FMP".contains(k.toUpperCase()) ? k : IntStream.range(0, 3)
                            .mapToObj(i -> k).reduce("", (t, u) -> t + u))
            .reduce("", (t, u) -> t + u).split("(?<=\\G...)"))
            .stream().map(k -> (char) IntStream.range(0, KENNYSPEAK.length)
                    .filter(i -> KENNYSPEAK[i].equals(k.toLowerCase()))
                    .map(i -> Character.isUpperCase(k.charAt(0)) ? (char) ('A' + i) : (char) ('a' + i))
                    .findFirst()
                    .orElse(k.charAt(0)))
            .map(k -> "" + k).reduce("", (t, u) -> t + u))
            .reduce("", (t, u) -> t.equals("") ? u : t + " " + u);
}
```

### The alphabet
```code
private static final String[] KENNYSPEAK = {"mmm", "mmp", "mmf", "mpm",
    "mpp", "mpf", "mfm", "mfp", "mff", "pmm", "pmp", "pmf", "ppm",
    "ppp", "ppf", "pfm", "pfp", "pff", "fmm", "fmp", "fmf", "fpm",
    "fpp", "fpf", "ffm", "ffp"};

```
