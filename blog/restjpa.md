## REST API with CriteriaQuery

Before the whole HATEOS or even GraphQl movement there already was a notion of creating REST full API that where loosely coupled and give its user the flexibility they needed aka "Beautiful REST API's".

When creating REST API we can not only only use HTTP verbs, mime types, HTTP result codes etc etc, but also leverage the possibility of query parameters. For example to get all the records between certain dates, or with a certain property value set.

To make this more concrete imagine the following case where we have an endpoint that represents the collection of financial statements:

```code
http://my-mony/financialstatements
```

when querying this endpoint we can retrieve all our financial statements. Which can be a lot.

What now if we want only between certain dates?

```code
http://my-mony/financialstatements?creation_date>2019-01-01&creation_date<2019-02-01
```

Or what if we want only the statements that have a certain beneficiary account that we received money from

```code
http://my-mony/financialstatements?beneficiary_account=NL46INGB00129856&Credit=true
```

How would we implement these request. As we store our financial statements in a database the first answer would be with a SQL query.

```code
select * from FIN_TRANS where creation_date between '2019-01-01' and '2019-02-01'
```

or

```code
select * from FIN_TRANS where beneficiary_account = 'NL46INGB00129856' and credit=1
```

What now if we want to combine these two, even what if we want to specify the columns we want to select, or even if we want a specific ordering or even allow a group by in our REST interface.

The result would mean that we need to define a unmaintainable combination of different queries.
Wouldn't it be nice to have a way to define a dynamic query based on the parameters entered in the url? That would not only solve our query problem but would also introduce a possible attack vector for a malicious user. What we need is to allow the users of our REST API to specify the query parameters, but we are still in control on what can be used as a parameter.

One way to solve this would be to use the Criteria api from JPA and limit the possible parameters. And that is exactly what I did.

see [](https://docs.oracle.com/javaee/6/tutorial/doc/gjrij.html) for more specific information on the API and its possibilities.

Using the Criteria API we can dynamically / programmatically build our database queries. Lets see how that can be done.

-Step is to instantiate a CriteriaQuery, to do this we use the CriteriaBuilder.

```code
final CriteriaBuilder cb = entityManager.getCriteriaBuilder();
final CriteriaQuery<FinStatement> cq = cb.createQuery(FinStatement.class);
```

-Step is to set the correct 'root' entity, aka the from clause of our query.

```code
final Root<FinStatement> finStatementRoot = cq.from(FinStatement.class);
```

-Step is to set the entity we are going to select.

```code
cq.select(finStatementRoot);
```

Effectively we now have a query that looks like:

```code
select * from FIN_TRANS;
```

-Step is to setup the where clause.

```code
Predicate pr = cb.between(finStatementRoot.get(FinStatement_.creationdate), toFirstDate(v), toSecondDate(v))
cq.where(pr);
```
where v is the value from which we take to dates. Something like '2019-01-01,2019-02-01'.

-Step is to generate the JPA model classes.

So where does this FinStatement_ class come from? The actual API defines it as being a SingularAttribute<? super X, Y>. It s part of the JPA model generated classes. To generate this model I'll use a maven plugin.

```code
<plugin>
    <groupId>org.bsc.maven</groupId>
    <artifactId>maven-processor-plugin</artifactId>
    <version>3.3.3</version>
    <executions>
        <execution>
            <id>process</id>
            <goals>
                <goal>process</goal>
            </goals>
            <phase>generate-sources</phase>
            <configuration>
                <processors>
                    <processor>org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor</processor>
                </processors>
            </configuration>
        </execution>
    </executions>
    <dependencies>
        <dependency>
            <groupId>org.hibernate</groupId>
            <artifactId>hibernate-jpamodelgen</artifactId>
            <version>5.3.9.Final</version>
        </dependency>
    </dependencies>
</plugin>
```

Once the model is generated and available to our code we can use the generated model in our query builder.

With the above code and maven plugin we now have a query that looks something like:

```code
select * from FIN_TRANS where creation_date between '2019-01-01' and '2019-02-01'
```

So far so good, we still do not have a dynamically created query and even, we build our query in a rather complex way.

-Step is to determine the actual field that is queried.

To do that we need some extra input. The query field. At this point the code would become something like.

```code
  Predicate pr;

  switch(fieldSelected) {
    case 'creation_date' :
      pr = cb.between(finStatementRoot.get(FinStatement_.creationdate), toFirstDate(v), toSecondDate(v));
    break;
    case 'beneficiary_account' :
      pr = cb.equal(finStatementRoot.get(FinStatement_.beneficiaryaccount), v));
    break;
  }
  cq.where(pr);

```

The result is that we can ether select on date or on account, not on both. Fortunately there is a way to combine Predicates using a boolean method of the CriteriaBuilder (and, or, etc). This means that if we have two predicates generated we can and/or them together.

Also the current way we have implemented it, is that there is only a single fieldSelected. First step is to make the fieldSelected a collection of selected fields. What is the new loop in java 8+? Collection API with streams and lambdas.

-Step is to change the selectedFields into a stream of fields and then map them into a predicate.
At the and we then can reduce the stream of predicates into a single predicate.

```code
Predicate pr = fieldSelected.stream().map(field -> {
  switch(field) {
    case 'creation_date' :
      return cb.between(finStatementRoot.get(FinStatement_.creationdate), toFirstDate(v), toSecondDate(v));
    break;
    case 'beneficiary_account' :
      return cb.equal(finStatementRoot.get(FinStatement_.beneficiaryaccount), v));
    break;
  }
}).reduce((a, b) -> cb.and(a, b));
cq.where(pr);
```

The resulting query would be something like:

```code
select * from FIN_TRANS where beneficiary_account = 'NL46INGB00129856'
                        and creation_date between '2019-01-01' and '2019-02-01'
```

-Step is to get rid of the switch statement.

What is a switch statement, nothing more the a lookup table and in this case a lookup table with a function as the value.

```code
public interface PredicateSupplier extends Serializable {
    public Predicate supply(CriteriaBuilder cb, Root<FinStatement_> root, String value);
}
Map<String, PredicateSupplier> map = new TreeMap<>();
map.put("creation_date", new PredicateSupplier() {
    public Predicate supply(CriteriaBuilder cb, Root<FinStatement_> root, String value) {
        return cb.between(root.get(FinStatement_.creationdate), toFirstDate(value), toSecondDate(value));
    }
});
```

When we make our PredicateSupplier a @FunctionalInterface we can write it as a lambda.

```code
map.put("beneficiary_account", (CriteriaBuilder cb, Root<FinStatement_> r, String v) ->
        cb.equal(r.get(FinStatement_.beneficiaryaccount), v))
);
```

With this change we can rewrite our code to look like.

```code
Predicate pr = fieldSelected.stream()
        .map(field -> map.get(field).supply(cb, finStatementRoot, v))
        .reduce((a, b) -> cb.and(a, b));
cq.where(pr);
```

-Step is to get rid of the map.

Last thing I did was rewrite the map as a enumeration.

```code
public enum PredicateField {

    CODE((cb, r, v) -> cb.equal(r.get(FinStatement_.beneficiaryaccount), v)),
    DATE((cb, r, v) -> cb.between(r.get(FinStatement_.creationdate), toFirstDate(v), toSecondDate(v)));

    private final PredicateSupplier ps;

    private PredicateField(PredicateSupplier ps) {
        this.ps = ps;
    }

    public Predicate predicate(CriteriaBuilder cb, Root<FinStatement_> root, String value) {
        return ps.supply(cb, root, value);
    }
}
```

The resulting code would then look like.

```code
Predicate pr = fieldSelected.stream()
        .map(field -> PredicateField.valueOf(field.toUpperCase())
                                .predicate(cb, finStatementRoot, v))
        .reduce((a, b) -> cb.and(a, b));
cq.where(pr);
```

-Step is to extend the query with other fields.

The next part would be to extend the enumaration with other fields and add the correct PredicateField supplier implementation.

## Conclusion

Using Criteria API it is posible to create dymanic queries. When combined with the new Collections stream function and lambda's we have a fully dynamic query, but with the restriction that only the predefined options are available.

This allows consumers of our REST API to have a flexible interface without the option to exploit the generated SQL.
