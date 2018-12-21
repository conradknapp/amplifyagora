```graphql
type Market @model @searchable {
  id: ID!
  name: String!
  products: [Product] @connection(name: "MarketProducts")
  tags: [String]
  owner: String!
  createdAt: String
}

type Product @model @auth(rules: [{ allow: owner }]) {
  id: ID!
  description: String!
  market: Market @connection(name: "MarketProducts")
  file: S3Object!
  price: Float!
  owner: String
  createdAt: String
}

type S3Object {
  bucket: String!
  region: String!
  key: String!
}

type User
  @model(
    mutations: { create: "registerUser" }
    queries: { get: "getUser" }
    subscriptions: null
  ) {
  id: ID!
  username: String!
  registered: Boolean
  orders: [Order] @connection(name: "UserOrders")
}

type Order
  @model(
    mutations: { create: "createOrder" }
    queries: null
    subscriptions: null
  ) {
  id: ID!
  product: Product @connection
  user: User @connection(name: "UserOrders")
  createdAt: String
}
```

```
// const params = {
  //   Destination: {
  //     ToAddresses: [config.adminEmail]
  //   },
  //   Message: {
  //     Body: {
  //       Html: {
  //         Charset: "UTF-8",
  //         Data:
  //           'This message body contains HTML formatting, like <a href="http://docs.aws.amazon.com/ses/latest/DeveloperGuide" target="_blank">Amazon SES Developer Guide</a>.'
  //       },
  //       Text: {
  //         Charset: "UTF-8",
  //         Data: "This is the message body in text format."
  //       }
  //     },
  //     Subject: {
  //       Charset: "UTF-8",
  //       Data: "Test email from code"
  //     }
  //   },
  //   ReturnPath: config.adminEmail,
  //   Source: config.adminEmail
  // };

  // ses.sendEmail(params, (err, data) => {
  //   if (err) {
  //     res.status(500).json({ error: err });
  //   } else {
  //     res.json({
  //       message: "Order email sent successfully!",
  //       charge: res.locals.charge,
  //       data
  //     });
  //   }
  // });
```
