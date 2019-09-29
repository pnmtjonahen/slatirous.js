
## Beautifull REST api

Before the whole HATEOS or even GraphQl movement there already was a notion of creating REST full API that where loosely coupled and give its user the flexibility they needed.

When creating REST API we can not only only use HTTP verbs, mime types, HTTP result codes etc etc, but also leverage the posibility of query parameters. For excample to get all the records between certain dates, or with a certain property value set.

To make this more concrete imagine the following case where we have an endpoint that represents the collection of financial statements:

http://my-mony/financialstatements

when querying this endpoint we can retrieve all our financial statements. Which can be a lot.

What now if we want only between certain dates?

http://my-mony/financialstatements?creation_date>2019-01-01&creation_date<2019-02-01

Or what is we want only the statements that have a certain beneficiary account and we received money from

http://my-mony/financialstatements?beneficiary_account=NL46INGB00129856&Credit=true

How would we implement these request. As we store our financial statements in a database the first answer would be with a SQL query.

```code
select * from FIN_TRANS where creation_date between '2019-01-01' and '2019-02-01'
```

or

```code
select * from FIN_TRANS where beneficiary_account = 'NL46INGB00129856' and credit=1
```

What now if we want to combine these two, even what if we want to specify the columns we want to select, or even if we want a specific ordering or even a group by in our interface.

The result would mean that we need to define a unmaintainable combination of different queries.
Wouldn't it be nice to have a way to define a dynamic query based on the parameters entered in the url? That woud not only solve our query problem but would also introduce a possible attack vector for a malicious user.

One way to solve this would be to use the Criteria api from JPA and limit the possible parameters. And that is exactly what I did.

see [](https://docs.oracle.com/javaee/6/tutorial/doc/gjrij.html) for more specific information on the API and its possibilities.

## The Criteria API
Using the Criteria API we can dynamically / programmatically build our database queries

-Step is to instantiate a CriteriaQuery, to do this we use the CriteriaBuilder.

```code
        final CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        final CriteriaQuery<FinStatement> cq = cb.createQuery(FinStatement.class);
```

-Step is to set the correct 'root' entity, aka the FROm clause of our query.

```code
        final Root<FinStatement> finStatementRoot = cq.from(FinStatement.class);
        cq.select(finStatementRoot);
```

-Step is to set the entity we are going to select.

```code
        cq.select(finStatementRoot);
```

Effectively we now have a query that looks like:

```code
select * from FIN_TRANS;
```

-Step is to setup the where clause:

```code
  CriteriaQuery<FinStatement> createSelect() {
        final CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        final CriteriaQuery<FinStatement> cq = cb.createQuery(FinStatement.class);
        final Root<FinStatement> finStatementRoot = cq.from(FinStatement.class);
        cq.select(finStatementRoot);


        addWhereClause(cb, finStatementRoot, cq);
        cq.orderBy(order(orderBy, cb, finStatementRoot));

        return cq;
  }
```

```code
  private void addWhereClause(final CriteriaBuilder cb,
                        final Root<FinStatement> finStatementRoot,
                        final CriteriaQuery<?> cq) {

        final Optional<Predicate> reduce = where.getWhereClause()
                .stream()
                .map(kv -> PredicateField.valueOf(kv.getKey().toUpperCase())
                                .predicate(cb, finStatementRoot, kv.getValue()))
                .reduce((a, b) -> cb.and(a, b));
        if (reduce.isPresent()) {
            cq.where(reduce.get());
        }
    }
```    
