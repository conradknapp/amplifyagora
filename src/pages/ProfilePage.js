import React from "react";
import { Auth, API, graphqlOperation } from "aws-amplify";
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { formatOrderDate, convertCentsToDollars } from "../utils";
import { UserContext } from "../App";

// Copy and bring in getUser query because queries file will be overwritten with any updates
const getUser = `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    registered
    orders(sortDirection: DESC, limit: 999) {
      items {
        id
        createdAt
        product {
          createdAt
          description
          id
          owner
          price
        }
      }
      nextToken
    }
  }
}
`;

class ProfilePage extends React.Component {
  state = {
    orders: [],
    email: "",
    emailDialog: false,
    verificationCode: "",
    verificationForm: false,
    columns: [
      { prop: "name", width: "150" },
      { prop: "value", width: "330" },
      {
        prop: "tag",
        width: "100",
        render: row => {
          if (row.name === "Email") {
            return (
              this.props.user.attributes.email_verified && (
                <Tag type="success">Verified</Tag>
              )
            );
          }
        }
      },
      {
        prop: "operations",
        render: row => {
          switch (row.name) {
            case "Email":
              return (
                <Button
                  onClick={() => this.setState({ emailDialog: true })}
                  type="info"
                  size="small"
                >
                  Edit
                </Button>
              );
            case "Delete Profile":
              return (
                <Button
                  onClick={this.handleDeleteProfile}
                  type="danger"
                  size="small"
                >
                  Delete
                </Button>
              );
            default:
              return;
          }
        }
      }
    ]
  };

  async componentDidMount() {
    if (this.props.user) {
      try {
        const userAttributes = await Auth.userAttributes(this.props.user);
        const attributesObj = Auth.attributesToObject(userAttributes);
        this.setState({ ...attributesObj });
        this.getUserOrders(attributesObj);
      } catch (err) {
        console.error(err);
      }
    }
  }

  handleUpdateEmail = async () => {
    try {
      const updatedAttributes = {
        email: this.state.email
      };
      const result = await Auth.updateUserAttributes(
        this.props.user,
        updatedAttributes
      );
      if (result === "SUCCESS") {
        this.sendVerificationCode("email");
      }
    } catch (err) {
      Notification.error({
        title: "Error",
        message: `${err.message || "Error updating email"}`
      });
    }
  };

  handleDeleteProfile = () => {
    MessageBox.confirm(
      "This will permanently delete your account. Continue?",
      "Attention!",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning"
      }
    )
      .then(async () => {
        try {
          this.props.user.deleteUser();
        } catch (err) {
          console.error(err);
        }
      })
      .catch(() => {
        Message({ type: "info", message: "Delete canceled" });
      });
  };

  sendVerificationCode = async attr => {
    await Auth.verifyCurrentUserAttribute(attr);
    this.setState({ verificationForm: true });
  };

  handleVerifyEmail = async attr => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        this.state.verificationCode
      );
      Notification({
        title: "Success",
        message: "Email successfully verifiedd!",
        type: `${result.toLowerCase()}`
      });
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      Notification.error({
        title: "Error",
        message: `${err.message || "Error updating email"}`
      });
    }
  };

  getUserOrders = async ({ sub }) => {
    const input = { id: sub };
    const result = await API.graphql(graphqlOperation(getUser, input));
    this.setState({ orders: result.data.getUser.orders.items });
  };

  render() {
    // prettier-ignore
    const { columns, email, emailDialog, verificationCode, verificationForm, orders } = this.state;

    return (
      <UserContext.Consumer>
        {user =>
          user && (
            <>
              <Tabs activeName="1" className="profile-tabs">
                <Tabs.Pane
                  label={
                    <>
                      <Icon name="document" className="icon" />
                      Summary
                    </>
                  }
                  name="1"
                >
                  <h2 className="header">Profile Summary</h2>
                  <Table
                    columns={columns}
                    data={[
                      {
                        name: "Your Id",
                        value: user.attributes.sub
                      },
                      {
                        name: "Username",
                        value: user.username
                      },
                      {
                        name: "Email",
                        value: user.attributes.email
                      },
                      {
                        name: "Phone Number",
                        value: user.attributes.phone_number,
                        tag: user.attributes.phone_verified && "Verified"
                      },
                      {
                        name: "Delete Profile",
                        value: "Sorry to see you go"
                      }
                    ]}
                    showHeader={false}
                    rowClassName={row =>
                      row.name === "Delete Profile" && "delete-profile"
                    }
                  />
                </Tabs.Pane>
                <Tabs.Pane
                  label={
                    <>
                      <Icon name="message" className="icon" />
                      Orders
                    </>
                  }
                  name="2"
                >
                  <h2 className="header">Order History</h2>
                  {orders.map(order => (
                    <div className="mb-1" key={order.id}>
                      <Card>
                        <pre>
                          <p>Order Id: {order.id}</p>
                          <p>Description: {order.product.description}</p>
                          <p>
                            Price: ${convertCentsToDollars(order.product.price)}
                          </p>
                          <p>Owner: {order.product.owner}</p>
                          <p>Purchased at {formatOrderDate(order.createdAt)}</p>
                        </pre>
                      </Card>
                    </div>
                  ))}
                </Tabs.Pane>
              </Tabs>

              <Dialog
                size="large"
                customClass="dialog"
                title="Edit Email"
                visible={emailDialog}
                onCancel={() => this.setState({ emailDialog: false })}
              >
                <Dialog.Body>
                  <Form labelPosition="top">
                    <Form.Item label="Email">
                      <Input
                        onChange={email => this.setState({ email })}
                        value={email}
                      />
                    </Form.Item>
                    {verificationForm && (
                      <Form.Item label="Verification Code" labelWidth="120">
                        <Input
                          onChange={verificationCode =>
                            this.setState({ verificationCode })
                          }
                          value={verificationCode}
                        />
                      </Form.Item>
                    )}
                  </Form>
                </Dialog.Body>

                <Dialog.Footer>
                  <Button onClick={() => this.setState({ emailDialog: false })}>
                    Cancel
                  </Button>
                  {!verificationForm && (
                    <Button type="primary" onClick={this.handleUpdateEmail}>
                      Save
                    </Button>
                  )}
                  {verificationForm && (
                    <Button
                      type="primary"
                      onClick={() => this.handleVerifyEmail("email")}
                    >
                      Submit
                    </Button>
                  )}
                </Dialog.Footer>
              </Dialog>
            </>
          )
        }
      </UserContext.Consumer>
    );
  }
}

export default ProfilePage;
