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
    return n.toString();
}
```

I did the FizzBuzz dojo a couple of times before I ended with this solution. Yours might be different, but that is completely beside the point. The fact is I now have a jUnit test and functioning code.

### FizzBuzz revised

I happend to stumble upon the following presentation by Kevlin Henney [Enterprise Programming Tricks For Clean Code](https://youtu.be/dC9vdQkU-xI).

This made me think about functional programming. Can I do the same and make the same FizzBuzz with java lambda's? Having all the jUnit tests for my FizzBuzz solution it should not be difficult to refactor it into a more functional implementation.

### Using java

And this was what I ended up with.

```code
public String fizzbuzz(Integer n) {
    Function<Function<String, String>, Function<String, String>> fizz =
            f -> n % 3 == 0  ? p -> "Fizz" + f.apply("")  : f;
    Function<Function<String, String>, Function<String, String>> buzz =
            f -> n % 5 == 0  ? p -> "Buzz" : f;
    Function<String, String> id = p -> p;

    return fizz.apply(buzz.apply(id)).apply(n.toString());
}
```

Or as a one liner

```code

public String fizzbuzz(Integer n) {
    return ((Function<Function<String, String>, Function<String, String>>) f ->  
                n % 3 == 0  ? p -> "Fizz" + f.apply("")  : f)
            .apply(((Function<Function<String, String>, Function<String, String>>) f ->  
                n % 5 == 0  ? p -> "Buzz" + f.apply("")  : f)
            .apply(p -> p))
            .apply(n.toString());
}

```

Unfortunately that is where it stopped. As far as I know there is no such thing as a bind option in java.
However we could create a new method and have fizz and buzz wrap these. First we need to define a TriFunction as we now need 3 parameters.

```code
@FunctionalInterface
interface TriFunction<A,B,C,R> {
    R apply(A a, B b, C c);
}    
public String fizzbuzz(Integer n) {

    TriFunction<Integer, String, Function<String, String>, Function<String, String>> test =
            (mod, text, f) -> n % mod == 0  ? (p) -> text + f.apply("")  : f;

    Function<Function<String, String>, Function<String, String>> fizz =
            f -> test.apply(3, "Fizz", f);

    Function<Function<String, String>, Function<String, String>> buzz =
            f -> test.apply(5, "Buzz", f);

    Function<String, String> id = p -> p;

    return fizz.apply(buzz.apply(id)).apply(n.toString());
}    
```
Can we get rid of the TriFunction interface? Yes we can!

```code
public String fizzbuzz(Integer n) {
    Function<Integer, Function<String, UnaryOperator<Function<String, String>>>> test =
            mod -> text -> f -> n % mod == 0  ? p -> text + f.apply("")  : f;

    Function<Function<String, String>, Function<String, String>> fizz =
            f -> test.apply(3).apply("Fizz").apply(f);

    Function<Function<String, String>, Function<String, String>> buzz =
            f -> test.apply(5).apply("Buzz").apply(f);

    Function<String, String> id = p -> p;

    return fizz.apply(buzz.apply(id)).apply(n.toString());
}
```

I leave it up to the reader to figure out how it works! Hard? I rest my case.

And just to drive my point home, we can do it with almost a one liner;

```code
public String fizzbuzz(Integer n) {
    Function<Integer, Function<String, UnaryOperator<Function<String, String>>>> test =
            mod -> text -> f -> n % mod == 0  ? (p) -> text + f.apply("")  : f;

    return ((Function<Function<String, String>, Function<String, String>>)
                f -> test.apply(3).apply("Fizz").apply(f))
            .apply(((Function<Function<String, String>, Function<String, String>>)
                f -> test.apply(5).apply("Buzz").apply(f))
            .apply(((Function<String, String>) p -> p)))
            .apply(n.toString());
}    

```

### Using javascript

And as I am also a javascript developer, of course it should be done with javascript. So here is my starting situation

```code
var fizzbuzz = function(n) {
  if (n % 3 == 0 && n % 5 == 0) {
    return "FizzBuzz";
  }
  if (n % 3 == 0) {
    return "Fizz";
  }
  if (n % 5 == 0) {
    return "Buzz";
  }
  return ""+n;
}
```

Not much different then my Java version. Now lets refactor this. And yes I have my javascript unit tests.

Making it more functional we can do the same as we did for the Java version.

```code

var  fizzbuzz = function(n) {
    var fizz = f =>  n % 3 == 0 ? p => "Fizz" + f("") : f;
    var buzz = f =>  n % 5 == 0 ? p => "Buzz" + f("") : f;
    var id = p => p;

    return fizz(buzz(id))(""+n);
};

```

However javascript also has a bind function where you can bind a method to parameters, so we end up with

```code
var  fizzbuzz = function(n) {
    var fb = (mod, txt, f) =>  n % mod == 0 ? p => txt + f("") : f;
    var id = p => p;

    var fizz = fb.bind(null, 3, "Fizz");
    var buzz = fb.bind(null, 5, "Buzz");

    return fizz(buzz(id))(""+n);
};
```

### TL;DR;

Looking at the difference between the java version and the javascript version

First I must admin the java lambda version is verbose compared with the javascript version. This is as expected as in java a lambda function is an implementation of an interface. 

However I still prefer the first java/javascript implementation. To me it is clear what is happening, the code tells me what it is doing.


All code can be found on [fizzbuzz](https://gitlab.com/pnmtjonahen/fizzbuzz.git)
