import React from "react";
import { Loading, Tabs, Icon } from "element-react";
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { onCreateProduct } from "../graphql/subscriptions";
import { Link } from "react-router-dom";
import Error from "../components/Error";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";
import { formatProductDate } from "../utils";

const getMarket = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products(sortDirection: DESC, limit: 999) {
      items {
        id
        description
        file {
          key 
          bucket
          region
        }
        price
        owner
        createdAt
      }
      nextToken
    }
    owner
    createdAt
  }
}
`;

const MarketPage = ({ marketId, user }) => (
  <Connect
    query={graphqlOperation(getMarket, { id: marketId })}
    subscription={graphqlOperation(onCreateProduct)}
    onSubscriptionMsg={(prevQuery, newData) => {
      let updatedQuery = { ...prevQuery };
      let updatedProductList = [
        newData.onCreateProduct,
        ...prevQuery.getMarket.products.items
      ];
      updatedQuery.getMarket.products.items = updatedProductList;
      return updatedQuery;
    }}
  >
    {({ data: { getMarket }, loading, errors }) => {
      if (errors.length > 0) return <Error errors={errors} />;
      if (loading || !getMarket) return <Loading fullscreen={true} />;
      const isMarketOwner = user && user.username === getMarket.owner;

      return (
        <>
          {/* Back Button */}
          <Link className="link" to="/">
            Back to Markets List
          </Link>

          {/* Market MetaData */}
          <span className="items-center">
            <h2 className="mb-mr">{getMarket.name}</h2>• {getMarket.owner}
          </span>
          <div className="items-center">
            <span
              style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}
            >
              <Icon name="date" className="icon" />
              {formatProductDate(getMarket.createdAt)}
            </span>
          </div>

          {/* New Product */}
          <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
            {isMarketOwner && (
              <Tabs.Pane
                label={
                  <>
                    <Icon name="plus" className="icon" />
                    Add Product
                  </>
                }
                name="1"
              >
                <NewProduct marketId={getMarket.id} />
              </Tabs.Pane>
            )}
            <Tabs.Pane
              label={
                <>
                  <Icon name="menu" className="icon" />
                  Products ({getMarket.products.items.length})
                </>
              }
              name="2"
            >
              {/* Product List */}
              <div className="product-list">
                {getMarket.products.items.map(product => (
                  <Product key={product.file.key} product={product} />
                ))}
              </div>
            </Tabs.Pane>
          </Tabs>
        </>
      );
    }}
  </Connect>
);

export default MarketPage;
