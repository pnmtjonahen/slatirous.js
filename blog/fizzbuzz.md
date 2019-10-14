## FizzBuzz

Fizz buzz (often spelled FizzBuzz in this context) has been used as an interview screening device for computer programmers. Writing a program to output the first 100 FizzBuzz numbers is a trivial problem for any would-be computer programmer, so interviewers can easily filter out those with insufficient programming ability.

### TDD
Test-driven development (TDD) is a software development process that relies on the repetition of a very short development cycle: requirements are turned into very specific test cases, then the software is improved so that the tests pass. This is opposed to software development that allows software to be added that is not proven to meet requirements.

American software engineer Kent Beck, who is credited with having developed or "rediscovered" the technique, stated in 2003 that TDD encourages simple designs and inspires confidence.

Test-driven development is related to the test-first programming concepts of extreme programming, begun in 1999, but more recently has created more general interest in its own right.

### My solution

Using TDD to solve FuzzBuzz problem I ended up with the following solution

```code
public String fizzbuzz(Integer n) {
    if (n % 3 == 0 && n % 5 == 0) {
        return "FizzBuzz";
    }
    if (n % 3 == 0) {
        return "Fizz";
    }
    if (n % 5 == 0) {
        return "Buzz";
    }
    return "" + n;
}
```

I did the FizzBuzz dojo a couple of times before I ended with this solution.

### FizzBuzz revised

Ref. Kevlin Henney [Enterprise Programming Tricks For Clean Code](https://youtu.be/dC9vdQkU-xI)

This made me think about functional programming. Can I make the same FizzBuzz with java lambda's. Having all the jUnit tests for my FizzBuzz solution it should not be difficult to refactor it into a more functional implementation.

### Using java

```code
public String fizzbuzz(Integer n) {
    final Function<Function<String, String>, Function<String, String>> fizz =
            (f) -> n % 3 == 0  ? (p) -> "Fizz" + f.apply("")  : f;
    final Function<Function<String, String>, Function<String, String>> buzz =
            (f) -> n % 5 == 0  ? (p) -> "Buzz" : f;
    final Function<String, String> id = (p) -> p;

    return fizz.apply(buzz.apply(id)).apply(n.toString());
}
```

Or as a one liner

```code

public String fizzbuzz(Integer n) {
    return ((Function<Function<String, String>, Function<String, String>>) (f) ->  
                n % 3 == 0  ? (p) -> "Fizz" + f.apply("")  : f)
            .apply(((Function<Function<String, String>, Function<String, String>>) (f) ->  
                n % 5 == 0  ? (p) -> "Buzz" + f.apply("")  : f)
            .apply((p) -> p))
            .apply(n.toString());
}

```

### Using javascript

And as I am also a javascript developer, of course it should be done with javascript.

```code

var  fizzbuzz = function(n) {
    var fizz = (f) =>  n % 3 == 0 ? (p) => "Fizz" + f("") : f;
    var buzz = (f) =>  n % 5 == 0 ? (p) => "Buzz" + f("") : f;
    var id = (p) => p;

    return fizz(buzz(id))(""+n);
};

```

And with bind.


```code
var  fizzbuzz = function(n) {
    var fb = (mod, txt, f) =>  n % mod == 0 ? (p) => txt + f("") : f;
    var id = (p) => p;

    var fizz = fb.bind(null, 3, "Fizz");
    var buzz = fb.bind(null, 5, "Buzz");

    return fizz(buzz(id))(""+n);
};
```
