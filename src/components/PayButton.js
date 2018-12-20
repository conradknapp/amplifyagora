import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createOrder } from "../graphql/mutations";
import StripeCheckout from "react-stripe-checkout";
import { Notification, Message } from "element-react";
import { history } from "../App";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: "pk_test_CN8uG9E9KDNxI7xVtdN1U5Be"
};

const PayButton = ({ product, user }) => {
  const handleCharge = async token => {
    try {
      const result = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
            owner: product.owner
          }
        }
      });
      if (result.charge.status === "succeeded") {
        console.log({ result });
        // If charge was successful, associate the order data with User
        const input = {
          orderUserId: user && user.attributes.sub,
          orderProductId: product.id
        };
        const order = await API.graphql(
          graphqlOperation(createOrder, { input })
        );
        console.log({ order });
        // Tell the user that the order was successful
        Notification({
          title: "Success",
          message: "Order successful!",
          type: "success",
          duration: 3000
        });
        // Tell user they were sent a confirmation email
        setTimeout(() => {
          history.push("/");
          Message({
            type: "info",
            message: "Check your email for order details",
            duration: 5000,
            showClose: true
          });
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      Notification.error({
        title: "Error",
        message: `${err.message || "Error processing order"}`
      });
    }
  };

  return (
    <StripeCheckout
      email={user.attributes.email}
      name={product.description}
      token={handleCharge}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      billingAddress
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
