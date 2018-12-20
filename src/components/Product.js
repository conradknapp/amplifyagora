import React from "react";
import { API, graphqlOperation } from "aws-amplify";
import { S3Image } from "aws-amplify-react";
import { deleteProduct } from "../graphql/mutations";
import { convertCentsToDollars } from "../utils";
// prettier-ignore
import { Notification, Popover, Button, Dialog, Card } from "element-react";
import PayButton from "./PayButton";
import { UserContext } from "../App";

// Need to make Product a class component to add the ability to Update products
class Product extends React.Component {
  state = {
    updateProductDialog: false,
    deleteProductDialog: false
  };

  handleDeleteProduct = async productId => {
    try {
      this.setState({ deleteProductDialog: false });
      const input = { id: productId };
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: "Success",
        message: "Product successfully deleted!",
        type: "success"
      });
      setTimeout(() => window.location.reload(), 3000);
    } catch (err) {
      console.error(`Failed to delete product with id: ${productId}`, err);
    }
  };

  render() {
    const { updateProductDialog, deleteProductDialog } = this.state;
    const { product } = this.props;

    return (
      <UserContext.Consumer>
        {user => {
          const isProductOwner = user && user.username === product.owner;

          return (
            <div className="card-container">
              <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{
                    photoImg: { maxWidth: "100%", maxHeight: "100%" }
                  }}
                />
                <div className="card-body">
                  <h3 className="m-0">{product.description}</h3>
                  <div className="text-right">
                    <span className="mx-1">
                      ${convertCentsToDollars(product.price)}
                    </span>
                    {!isProductOwner && (
                      <PayButton product={product} user={user} />
                    )}
                  </div>
                </div>
              </Card>
              <div className="text-center">
                {isProductOwner && (
                  <>
                    <Button
                      type="warning"
                      icon="edit"
                      className="m-1"
                      onClick={() =>
                        this.setState({ updateProductDialog: true })
                      }
                    />
                    <Popover
                      placement="top"
                      width="160"
                      trigger="click"
                      visible={deleteProductDialog}
                      content={
                        <>
                          <p>Do you want to delete this?</p>
                          <div className="text-right">
                            <Button
                              size="mini"
                              type="text"
                              onClick={() =>
                                this.setState({ deleteProductDialog: false })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              size="mini"
                              onClick={() =>
                                this.handleDeleteProduct(product.id)
                              }
                            >
                              Confirm
                            </Button>
                          </div>
                        </>
                      }
                    >
                      <Button
                        type="danger"
                        icon="delete"
                        onClick={() =>
                          this.setState({ deleteProductDialog: true })
                        }
                      />
                    </Popover>
                  </>
                )}
              </div>

              <Dialog
                title="Update Product"
                size="large"
                customClass="dialog"
                visible={updateProductDialog}
                onCancel={() => this.setState({ updateProductDialog: false })}
              >
                <Dialog.Body>Do you want to update this product?</Dialog.Body>
                <Dialog.Footer>
                  <Button
                    onClick={() =>
                      this.setState({ updateProductDialog: false })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => this.handleUpdateProduct(product.id)}
                  >
                    Confirm
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}

export default Product;
